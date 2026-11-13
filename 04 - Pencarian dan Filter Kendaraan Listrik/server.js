// Backend tanpa dependensi (Node >= 18): npm start -> http://localhost:8080
const http = require("http");
const fs = require("fs");
const path = require("path");
const vehicles = require("./data");

const PORT = process.env.PORT || 8080;
const PUBLIC = path.join(__dirname, "public");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const num = (v) => (v === null || v === "" || isNaN(Number(v)) ? null : Number(v));

// GET /api/vehicles?q=&type=motor|mobil&maxPrice=&minBattery=&maxBattery=&minRange=&sort=price_asc|price_desc|range_desc
function searchVehicles(p) {
  const q = (p.get("q") || "").trim().toLowerCase();
  const type = p.get("type");
  const maxPrice = num(p.get("maxPrice"));
  const minBattery = num(p.get("minBattery"));
  const maxBattery = num(p.get("maxBattery"));
  const minRange = num(p.get("minRange"));

  let list = vehicles.filter((v) =>
    (!q || `${v.brand} ${v.model}`.toLowerCase().includes(q)) &&
    (!type || type === "semua" || v.type === type) &&
    (maxPrice === null || v.price <= maxPrice) &&
    (minBattery === null || v.batteryKwh >= minBattery) &&
    (maxBattery === null || v.batteryKwh < maxBattery) &&
    (minRange === null || v.rangeKm >= minRange)
  );

  const sorts = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    range_desc: (a, b) => b.rangeKm - a.rangeKm,
  };
  if (sorts[p.get("sort")]) list = list.sort(sorts[p.get("sort")]);
  return list;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/vehicles") {
    const data = searchVehicles(url.searchParams);
    return send(res, 200, { total: data.length, data });
  }
  const one = url.pathname.match(/^\/api\/vehicles\/(\d+)$/);
  if (req.method === "GET" && one) {
    const v = vehicles.find((x) => x.id === Number(one[1]));
    return v ? send(res, 200, v) : send(res, 404, { error: "Kendaraan tidak ditemukan" });
  }
  if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "Endpoint tidak ada" });

  // File statis
  const rel = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(file, (err, buf) =>
    err ? send(res, 404, "Not found", "text/plain") : send(res, 200, buf, MIME[path.extname(file)] || "application/octet-stream")
  );
});

if (require.main === module) server.listen(PORT, () => console.log(`EV Katalog berjalan di http://localhost:${PORT}`));
module.exports = server;
