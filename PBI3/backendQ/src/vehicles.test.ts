import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

// NODE_ENV harus "test" sebelum index.js dimuat (server tidak listen & data tidak ditulis ke file)
process.env.NODE_ENV = "test";
const { app } = await import("./index.js");
const { resetVehicles, VEHICLE_LIMITS } = await import("./data/vehicles.js");

let server: Server;
let base = "";

before(
  () =>
    new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;
        resolve();
      });
    })
);
after(() => {
  server.close();
});
beforeEach(() => resetVehicles());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call(method: string, url: string, body?: unknown): Promise<{ status: number; body: any }> {
  const res = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const valid = {
  model: "Uji Motor X",
  type: "Motor",
  batteryKwh: 2.5,
  priceOtr: 30_000_000,
  acChargerKw: 0.5,
  promo: "Gratis helm",
};

test("PBI3: daftar katalog mitra berisi 7 unit awal", async () => {
  const r = await call("GET", "/mitra/vehicles");
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 7);
  assert.equal(r.body.meta.total, 7);
});

test("PBI3: tambah unit valid -> 201 dan default aktif", async () => {
  const r = await call("POST", "/mitra/vehicles", valid);
  assert.equal(r.status, 201);
  assert.equal(r.body.data.isActive, true);
  assert.ok(r.body.data.id);
  assert.equal((await call("GET", "/mitra/vehicles")).body.data.length, 8);
});

test("PBI3: field wajib kosong -> 400 dengan pesan per field", async () => {
  const r = await call("POST", "/mitra/vehicles", {});
  assert.equal(r.status, 400);
  for (const key of ["model", "type", "batteryKwh", "priceOtr", "acChargerKw"]) {
    assert.ok(r.body.errors[key], `errors.${key} harus ada`);
  }
});

test("PBI3: model hanya spasi dan tipe di luar Motor/Mobil ditolak", async () => {
  const a = await call("POST", "/mitra/vehicles", { ...valid, model: "   " });
  assert.equal(a.status, 400);
  assert.ok(a.body.errors.model);
  const b = await call("POST", "/mitra/vehicles", { ...valid, model: "Tipe Salah", type: "Truk" });
  assert.equal(b.status, 400);
  assert.equal(b.body.errors.type, "Tipe harus Motor atau Mobil.");
});

test("PBI3: spesifikasi nol, negatif, non-angka, dan di luar batas ditolak", async () => {
  const cases: Array<[string, unknown]> = [
    ["batteryKwh", 0],
    ["batteryKwh", -1],
    ["batteryKwh", "abc"],
    ["batteryKwh", VEHICLE_LIMITS.batteryKwh.max + 1],
    ["priceOtr", 500],
    ["priceOtr", VEHICLE_LIMITS.priceOtr.max + 1],
    ["acChargerKw", 0],
    ["acChargerKw", VEHICLE_LIMITS.acChargerKw.max + 1],
  ];
  for (const [field, value] of cases) {
    const r = await call("POST", "/mitra/vehicles", { ...valid, model: `Batas ${field} ${String(value)}`, [field]: value });
    assert.equal(r.status, 400, `${field}=${String(value)} harus ditolak`);
    assert.ok(r.body.errors[field]);
  }
});

test("PBI3: nama model duplikat (tanpa peduli huruf besar) -> 409", async () => {
  const r = await call("POST", "/mitra/vehicles", { ...valid, model: "polytron fox-r" });
  assert.equal(r.status, 409);
  assert.ok(r.body.errors.model);
});

test("PBI3: ubah unit -> berubah; model sendiri tidak dianggap duplikat; data tidak valid -> 400", async () => {
  const ok = await call("PUT", "/mitra/vehicles/veh-001", { model: "Polytron Fox-R", priceOtr: 24_500_000, promo: "" });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.priceOtr, 24_500_000);
  assert.equal(ok.body.data.promo, "");
  assert.equal(ok.body.data.batteryKwh, 2.4);
  assert.equal((await call("PUT", "/mitra/vehicles/veh-001", { batteryKwh: -5 })).status, 400);
  assert.equal((await call("PUT", "/mitra/vehicles/veh-001", { model: "Gesits G1" })).status, 409);
});

test("PBI3: nonaktifkan unit -> hilang dari referensi simulasi; aktifkan -> muncul lagi", async () => {
  const off = await call("PATCH", "/mitra/vehicles/veh-002/status", { isActive: false });
  assert.equal(off.status, 200);
  assert.equal(off.body.data.isActive, false);

  let pub = await call("GET", "/vehicles");
  assert.equal(pub.body.data.length, 6);
  assert.ok(!pub.body.data.some((v: { id: string }) => v.id === "veh-002"));
  assert.equal((await call("GET", "/mitra/vehicles")).body.data.length, 7);

  await call("PATCH", "/mitra/vehicles/veh-002/status", { isActive: true });
  pub = await call("GET", "/vehicles");
  assert.ok(pub.body.data.some((v: { id: string }) => v.id === "veh-002"));
});

test("PBI3: status bukan boolean -> 400; id tidak dikenal -> 404", async () => {
  assert.equal((await call("PATCH", "/mitra/vehicles/veh-001/status", { isActive: "mungkin" })).status, 400);
  assert.equal((await call("PATCH", "/mitra/vehicles/tidak-ada/status", { isActive: true })).status, 404);
});

test("PBI3: API referensi simulasi dapat difilter per tipe", async () => {
  const mobil = await call("GET", "/vehicles?type=Mobil");
  assert.equal(mobil.body.data.length, 2);
  assert.ok(mobil.body.data.every((v: { type: string }) => v.type === "Mobil"));
  assert.equal(mobil.body.data[0].createdAt, undefined);
});

test("PBI3: hapus unit -> berhasil, lalu 404", async () => {
  assert.equal((await call("DELETE", "/mitra/vehicles/veh-003")).status, 200);
  assert.equal((await call("DELETE", "/mitra/vehicles/veh-003")).status, 404);
  assert.equal((await call("GET", "/mitra/vehicles/veh-003")).status, 404);
  assert.equal((await call("GET", "/mitra/vehicles")).body.data.length, 6);
});
