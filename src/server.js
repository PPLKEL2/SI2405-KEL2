'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const { AppError } = require('./errors');
const { createStore } = require('./store');
const { createFacilityService } = require('./facilities');
const { createTarifService } = require('./tarif');

function parseBoolean(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function createRoutes(store) {
  const facilities = createFacilityService(store);
  const tarif = createTarifService(store);

  return [
    // PBI 5: fasilitas
    { method: 'GET', path: /^\/api\/facilities$/, handler: (_p, q) => facilities.list({
      kategori: q.get('kategori') ?? undefined,
      aktif: parseBoolean(q.get('aktif')),
    }) },
    { method: 'POST', path: /^\/api\/facilities$/, status: 201, handler: (_p, _q, body) => facilities.create(body) },
    { method: 'GET', path: /^\/api\/facilities\/(\d+)$/, handler: ([id]) => facilities.get(id) },
    { method: 'PUT', path: /^\/api\/facilities\/(\d+)$/, handler: ([id], _q, body) => facilities.update(id, body) },
    { method: 'DELETE', path: /^\/api\/facilities\/(\d+)$/, handler: ([id]) => facilities.deactivate(id) },

    // PBI 6: tarif
    { method: 'GET', path: /^\/api\/tarif$/, handler: (_p, q) => tarif.list({ facilityId: q.get('facilityId') }) },
    { method: 'POST', path: /^\/api\/tarif$/, status: 201, handler: (_p, _q, body) => tarif.create(body) },
    { method: 'GET', path: /^\/api\/tarif\/aktif$/, handler: (_p, q) => {
      const result = tarif.getAktif({
        facilityId: q.get('facilityId'),
        jenisLayanan: q.get('jenisLayanan'),
        tanggal: q.get('tanggal') ?? undefined,
      });
      if (!result) throw new AppError(404, 'Tidak ada tarif aktif untuk parameter tersebut');
      return result;
    } },
    { method: 'GET', path: /^\/api\/tarif\/(\d+)$/, handler: ([id]) => tarif.get(id) },
    { method: 'PUT', path: /^\/api\/tarif\/(\d+)$/, handler: ([id], _q, body) => tarif.update(id, body) },
  ];
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError(400, 'Body harus berupa JSON yang valid');
  }
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

// Melayani file dari folder public (halaman web). Path di luar folder itu ditolak.
function serveStatic(pathname, res) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));
  const isInside = filePath.startsWith(PUBLIC_DIR + path.sep);

  if (!isInside || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Halaman tidak ditemukan');
  }

  res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function createServer(store) {
  const routes = createRoutes(store);

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith('/api/')) {
        return serveStatic(url.pathname, res);
      }

      let matched = null;
      let pathFound = false;

      for (const route of routes) {
        const match = url.pathname.match(route.path);
        if (!match) continue;
        pathFound = true;
        if (route.method === req.method) {
          matched = { route, params: match.slice(1) };
          break;
        }
      }

      if (!matched) {
        return pathFound
          ? send(res, 405, { message: 'Method tidak diizinkan' })
          : send(res, 404, { message: 'Endpoint tidak ditemukan' });
      }

      const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : undefined;
      const data = matched.route.handler(matched.params, url.searchParams, body);
      send(res, matched.route.status ?? 200, data);
    } catch (err) {
      if (err instanceof AppError) {
        return send(res, err.status, { message: err.message, errors: err.details });
      }
      console.error(err);
      send(res, 500, { message: 'Terjadi kesalahan pada server' });
    }
  });
}

module.exports = { createServer };

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const store = createStore(path.join(__dirname, '..', 'data', 'db.json'));
  createServer(store).listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
}
