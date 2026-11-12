'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { createStore } = require('../src/store');
const { createServer } = require('../src/server');

let server;
let base;

before(async () => {
  server = createServer(createStore());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => new Promise((resolve) => server.close(resolve)));

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

test('alur API: buat fasilitas SPKLU, buat tarif, lalu baca tarif aktif', async () => {
  const fac = await call('POST', '/facilities', {
    nama: 'SPKLU Test',
    kategori: 'SPKLU',
    alamat: 'Jl. Test 1',
    latitude: -6.2,
    longitude: 106.8,
  });
  assert.equal(fac.status, 201);

  const tarif = await call('POST', '/tarif', {
    facilityId: fac.body.id,
    jenisLayanan: 'CHARGING',
    nilai: 2000,
    berlakuMulai: '2026-01-01',
  });
  assert.equal(tarif.status, 201);

  const aktif = await call('GET', `/tarif/aktif?facilityId=${fac.body.id}&jenisLayanan=CHARGING&tanggal=2026-06-01`);
  assert.equal(aktif.status, 200);
  assert.equal(aktif.body.nilai, 2000);
});

test('input tidak valid menghasilkan 400 dengan detail error', async () => {
  const res = await call('POST', '/facilities', { nama: '' });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.nama);
});

test('tarif aktif tidak ditemukan menghasilkan 404', async () => {
  const res = await call('GET', '/tarif/aktif?facilityId=1&jenisLayanan=SWAP&tanggal=2026-06-01');
  assert.equal(res.status, 404);
});

test('endpoint tidak dikenal menghasilkan 404', async () => {
  const res = await call('GET', '/tidak-ada');
  assert.equal(res.status, 404);
});

test('halaman web dan asetnya dilayani dari folder public', async () => {
  const root = await fetch(base.replace('/api', '/'));
  assert.equal(root.status, 200);
  assert.match(root.headers.get('content-type'), /text\/html/);
  assert.match(await root.text(), /MobilitiQ/);

  const script = await fetch(base.replace('/api', '/app.js'));
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type'), /text\/javascript/);

  const missing = await fetch(base.replace('/api', '/tidak-ada.html'));
  assert.equal(missing.status, 404);
});
