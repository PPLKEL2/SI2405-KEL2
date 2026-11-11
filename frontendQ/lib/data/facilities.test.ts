import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_FACILITIES,
  getActiveFacilities,
  FACILITY_CATEGORIES,
  CITIES,
} from "./facilities.ts";

test("getActiveFacilities: hanya mengembalikan fasilitas dengan status isActive === true (KEL2-71)", () => {
  const active = getActiveFacilities();

  assert.ok(active.length > 0, "Harus mengembalikan daftar fasilitas aktif.");
  assert.equal(
    active.every((f) => f.isActive === true),
    true,
    "Seluruh fasilitas yang dikembalikan harus aktif."
  );

  // Pastikan fasilitas berstatus tidak aktif tidak ikut dikembalikan
  const inactiveInDemo = DEMO_FACILITIES.filter((f) => !f.isActive);
  assert.ok(inactiveInDemo.length >= 2, "Harus ada data fasilitas demo non-aktif untuk pengujian.");
  for (const inactive of inactiveInDemo) {
    assert.equal(
      active.some((f) => f.id === inactive.id),
      false,
      `Fasilitas tidak aktif ${inactive.name} (${inactive.id}) tidak boleh muncul di daftar fasilitas aktif.`
    );
  }
});

test("DEMO_FACILITIES: seluruh data bertanda demo dan memiliki koordinat serta kategori valid", () => {
  for (const facility of DEMO_FACILITIES) {
    assert.equal(
      facility.isDemo,
      true,
      `Fasilitas ${facility.name} harus memiliki penanda transparan isDemo: true.`
    );
    assert.ok(
      FACILITY_CATEGORIES.includes(facility.category),
      `Kategori ${facility.category} tidak valid pada fasilitas ${facility.name}.`
    );
    assert.ok(
      CITIES.includes(facility.city),
      `Kota ${facility.city} tidak valid pada fasilitas ${facility.name}.`
    );
    assert.ok(
      Number.isFinite(facility.latitude) && facility.latitude >= -11 && facility.latitude <= 6,
      `Latitude ${facility.latitude} di luar batas Indonesia pada fasilitas ${facility.name}.`
    );
    assert.ok(
      Number.isFinite(facility.longitude) && facility.longitude >= 95 && facility.longitude <= 141,
      `Longitude ${facility.longitude} di luar batas Indonesia pada fasilitas ${facility.name}.`
    );
  }
});

