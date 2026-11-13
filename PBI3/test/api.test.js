const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fs = require("fs");

const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ev-")), "data.json");
process.env.DB_FILE = dbFile;
const app = require("../server");

let server, base;
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
after(() => server.close());

const call = async (method, url, body) => {
  const r = await fetch(base + url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  return { status: r.status, body: text ? JSON.parse(text) : null };
};
const valid = { model: "Uji Motor X", tipe: "Motor", baterai_kwh: 2.5, harga_otr: 30000000, charger_ac_kw: 0.5, promo: "Gratis helm" };

test("daftar awal berisi 7 unit", async () => {
  const r = await call("GET", "/api/vehicles");
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 7);
});

test("tambah unit valid -> 201, default aktif", async () => {
  const r = await call("POST", "/api/vehicles", valid);
  assert.equal(r.status, 201);
  assert.equal(r.body.aktif, true);
  assert.ok(r.body.id);
});

test("validasi: field wajib kosong -> 400", async () => {
  const r = await call("POST", "/api/vehicles", {});
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.length >= 5);
});

test("validasi: tipe selain Motor/Mobil ditolak", async () => {
  const r = await call("POST", "/api/vehicles", { ...valid, model: "Tipe Salah", tipe: "Truk" });
  assert.equal(r.status, 400);
});

test("validasi: angka negatif, nol, non-angka, dan di luar batas ditolak", async () => {
  for (const bad of [{ baterai_kwh: -1 }, { baterai_kwh: 0 }, { baterai_kwh: "abc" }, { baterai_kwh: 9999 },
                     { harga_otr: 500 }, { charger_ac_kw: 1000 }]) {
    const r = await call("POST", "/api/vehicles", { ...valid, model: "Batas " + JSON.stringify(bad), ...bad });
    assert.equal(r.status, 400, JSON.stringify(bad));
  }
});

test("validasi: nama model duplikat (tanpa peduli huruf besar) -> 409", async () => {
  const r = await call("POST", "/api/vehicles", { ...valid, model: "uji motor x" });
  assert.equal(r.status, 409);
});

test("ubah unit -> data berubah; data tidak valid -> 400", async () => {
  const list = (await call("GET", "/api/vehicles")).body;
  const id = list.find((v) => v.model === "Uji Motor X").id;
  const ok = await call("PUT", `/api/vehicles/${id}`, { harga_otr: 31000000, promo: "" });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.harga_otr, 31000000);
  assert.equal(ok.body.model, "Uji Motor X");
  const bad = await call("PUT", `/api/vehicles/${id}`, { baterai_kwh: -5 });
  assert.equal(bad.status, 400);
});

test("status: nonaktifkan -> hilang dari API publik; aktifkan -> muncul lagi", async () => {
  const list = (await call("GET", "/api/vehicles")).body;
  const id = list.find((v) => v.model === "Uji Motor X").id;
  const off = await call("PATCH", `/api/vehicles/${id}/status`, { aktif: false });
  assert.equal(off.body.aktif, false);
  let pub = (await call("GET", "/api/public/vehicles")).body;
  assert.ok(!pub.some((v) => v.id === id));
  await call("PATCH", `/api/vehicles/${id}/status`, { aktif: true });
  pub = (await call("GET", "/api/public/vehicles")).body;
  assert.ok(pub.some((v) => v.id === id));
});

test("status: nilai tidak valid -> 400", async () => {
  const list = (await call("GET", "/api/vehicles")).body;
  const r = await call("PATCH", `/api/vehicles/${list[0].id}/status`, { aktif: "mungkin" });
  assert.equal(r.status, 400);
});

test("hapus unit -> 204, lalu 404", async () => {
  const list = (await call("GET", "/api/vehicles")).body;
  const id = list.find((v) => v.model === "Uji Motor X").id;
  assert.equal((await call("DELETE", `/api/vehicles/${id}`)).status, 204);
  assert.equal((await call("DELETE", `/api/vehicles/${id}`)).status, 404);
  assert.equal((await call("GET", `/api/vehicles/${id}`)).status, 404);
});
