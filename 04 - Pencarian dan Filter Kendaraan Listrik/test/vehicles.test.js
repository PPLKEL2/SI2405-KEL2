const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const server = require("../server");

let base;
before(() => new Promise((ok) => server.listen(0, () => { base = `http://localhost:${server.address().port}`; ok(); })));
after(() => server.close());

const get = async (qs = "") => (await fetch(`${base}/api/vehicles${qs}`)).json();
const names = (r) => r.data.map((v) => v.model);

test("tanpa filter menampilkan seluruh katalog (9 unit)", async () => {
  assert.equal((await get()).total, 9);
});

test("pencarian kata kunci: model, merek, tidak peka huruf besar/kecil, spasi diabaikan", async () => {
  assert.deepEqual(names(await get("?q=seagull")), ["Seagull"]);
  assert.deepEqual(names(await get("?q=FOX")), ["Fox-R"]);
  assert.equal((await get("?q=byd")).total, 1);
  assert.equal((await get("?q=%20seagull%20")).total, 1);
});

test("filter tipe kendaraan", async () => {
  assert.equal((await get("?type=motor")).total, 5);
  assert.equal((await get("?type=mobil")).total, 4);
  assert.equal((await get("?type=semua")).total, 9);
});

test("filter harga maksimum (batas inklusif)", async () => {
  assert.equal((await get("?maxPrice=23900000")).total, 1);
  assert.equal((await get("?maxPrice=100000000")).total, 5);
});

test("filter kapasitas baterai dan jarak tempuh", async () => {
  assert.deepEqual(names(await get("?minBattery=5&maxBattery=40")), ["Seagull"]);
  assert.equal((await get("?minBattery=40")).total, 3);
  assert.equal((await get("?maxBattery=5")).total, 5);
  assert.equal((await get("?minRange=300")).total, 4);
});

test("kombinasi beberapa filter", async () => {
  assert.equal((await get("?type=motor&maxPrice=35000000")).total, 3);
  assert.equal((await get("?type=mobil&minBattery=40")).total, 3);
  assert.deepEqual(names(await get("?minRange=300&maxPrice=200000000")), ["Seagull"]);
  assert.deepEqual(names(await get("?q=wul&type=mobil&minRange=300&minBattery=40")), ["Air ev Long Range"]);
});

test("kombinasi tanpa hasil mengembalikan data kosong (bukan error)", async () => {
  const r = await get("?q=wuling&type=motor");
  assert.equal(r.total, 0);
  assert.deepEqual(r.data, []);
  assert.equal((await get("?q=tidak-ada")).total, 0);
  assert.equal((await get("?type=motor&minRange=300")).total, 0);
});

test("reset filter (tanpa parameter) mengembalikan semua unit", async () => {
  assert.equal((await get("?type=motor&maxPrice=30000000")).total, 2);
  assert.equal((await get()).total, 9);
});

test("parameter tidak valid diabaikan", async () => {
  assert.equal((await get("?maxPrice=abc&minRange=")).total, 9);
});

test("pengurutan harga", async () => {
  const p = (await get("?sort=price_asc")).data.map((v) => v.price);
  assert.deepEqual(p, [...p].sort((a, b) => a - b));
});

test("detail kendaraan: ditemukan dan 404", async () => {
  assert.equal((await fetch(`${base}/api/vehicles/6`)).status, 200);
  assert.equal((await fetch(`${base}/api/vehicles/99`)).status, 404);
});

test("halaman frontend disajikan sebagai HTML", async () => {
  const r = await fetch(base + "/");
  assert.match(r.headers.get("content-type"), /text\/html/);
  assert.match(await r.text(), /Katalog & Pencarian EV/);
});
