import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_FACILITIES,
  getActiveFacilities,
  FACILITY_CATEGORIES,
  CITIES,
} from "./data/facilities.js";
import { formatDistance, formatDuration } from "./routes/facilities.js";

test("Backend KEL2-71: getActiveFacilities hanya mengembalikan fasilitas berstatus aktif", () => {
  const active = getActiveFacilities();

  assert.ok(active.length > 0, "Daftar fasilitas aktif tidak boleh kosong.");
  assert.equal(
    active.every((f) => f.isActive === true),
    true,
    "Seluruh fasilitas yang dikembalikan harus memiliki isActive === true."
  );

  const inactive = DEMO_FACILITIES.filter((f) => !f.isActive);
  assert.ok(inactive.length >= 2, "Minimal terdapat 2 data nonaktif untuk pengujian.");
  for (const item of inactive) {
    assert.equal(
      active.some((f) => f.id === item.id),
      false,
      `Fasilitas nonaktif ${item.id} tidak boleh masuk ke getActiveFacilities.`
    );
  }
});

test("Backend KEL2-71: DEMO_FACILITIES memiliki kategori valid dan berlabel isDemo: true", () => {
  assert.ok(DEMO_FACILITIES.length >= 10, "Total fasilitas demo minimal 10.");

  for (const f of DEMO_FACILITIES) {
    assert.equal(f.isDemo, true, "Semua fasilitas wajib memiliki penanda isDemo: true.");
    assert.ok(
      FACILITY_CATEGORIES.includes(f.category),
      `Kategori ${f.category} harus salah satu dari: ${FACILITY_CATEGORIES.join(", ")}`
    );
    assert.ok(
      CITIES.includes(f.city),
      `Kota ${f.city} harus salah satu dari: ${CITIES.join(", ")}`
    );
    assert.ok(
      Number.isFinite(f.latitude) && f.latitude >= -11 && f.latitude <= 6,
      `Latitude ${f.latitude} harus dalam batas wilayah Indonesia.`
    );
    assert.ok(
      Number.isFinite(f.longitude) && f.longitude >= 95 && f.longitude <= 141,
      `Longitude ${f.longitude} harus dalam batas wilayah Indonesia.`
    );
  }
});

test("Backend KEL2-70: formatDistance memformat meter dan kilometer dengan benar", () => {
  assert.equal(formatDistance(500), "500 m");
  assert.equal(formatDistance(999), "999 m");
  assert.equal(formatDistance(1000), "1,0 km");
  assert.equal(formatDistance(4250), "4,3 km");
  assert.equal(formatDistance(12800), "12,8 km");
});

test("Backend KEL2-70: formatDuration memformat menit dan jam dengan benar", () => {
  assert.equal(formatDuration(20), "< 1 menit");
  assert.equal(formatDuration(60), "1 menit");
  assert.equal(formatDuration(18 * 60), "18 menit");
  assert.equal(formatDuration(60 * 60), "1 jam");
  assert.equal(formatDuration(85 * 60), "1 jam 25 menit");
});

