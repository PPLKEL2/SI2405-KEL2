import test from "node:test";
import assert from "node:assert/strict";
import { getActiveTariff, tariffStatus, validateTariff, type Tariff, type TariffInput } from "./tarif.ts";
import type { Facility } from "./facilities.ts";

const spklu: Facility = { id: "f1", name: "SPKLU A", category: "SPKLU", address: "Jl. A", latitude: -6.2, longitude: 106.8, operationalHours: "", contact: "", isActive: true };
const spbklu: Facility = { ...spklu, id: "f2", name: "SPBKLU B", category: "SPBKLU" };
const showroom: Facility = { ...spklu, id: "f3", name: "Showroom C", category: "Showroom" };

const charging: TariffInput = { facilityId: "f1", serviceType: "CHARGING", price: 2500, validFrom: "2026-01-01", validUntil: "2026-12-31" };

test("validateTariff: tarif charging untuk SPKLU valid", () => {
  assert.deepEqual(validateTariff(charging, spklu, []), {});
});

test("validateTariff: swap valid untuk SPBKLU, ditolak untuk SPKLU dan showroom", () => {
  const swap: TariffInput = { ...charging, facilityId: "f2", serviceType: "SWAP", validUntil: null };
  assert.deepEqual(validateTariff(swap, spbklu, []), {});
  assert.ok(validateTariff({ ...swap, facilityId: "f1" }, spklu, []).facilityId);
  assert.ok(validateTariff({ ...charging, facilityId: "f3" }, showroom, []).facilityId);
});

test("validateTariff: fasilitas wajib dipilih", () => {
  assert.ok(validateTariff(charging, undefined, []).facilityId);
});

test("validateTariff: nilai tarif negatif atau bukan angka ditolak, nol diterima", () => {
  assert.ok(validateTariff({ ...charging, price: -1 }, spklu, []).price);
  assert.ok(validateTariff({ ...charging, price: Number.NaN }, spklu, []).price);
  assert.equal(validateTariff({ ...charging, price: 0 }, spklu, []).price, undefined);
});

test("validateTariff: periode berlaku harus tanggal yang benar dan akhir tidak sebelum mulai", () => {
  assert.ok(validateTariff({ ...charging, validFrom: "2026-02-30" }, spklu, []).validFrom);
  assert.ok(validateTariff({ ...charging, validFrom: "" }, spklu, []).validFrom);
  assert.ok(validateTariff({ ...charging, validFrom: "2027-06-01", validUntil: "2027-01-01" }, spklu, []).validUntil);
});

test("validateTariff: periode bertabrakan ditolak, tarif yang sedang diubah diabaikan", () => {
  const existing: Tariff[] = [{ id: "t1", ...charging }];
  const overlapping: TariffInput = { ...charging, validFrom: "2026-06-01", validUntil: "2027-06-01" };
  assert.ok(validateTariff(overlapping, spklu, existing).validFrom);
  assert.deepEqual(validateTariff(charging, spklu, existing, "t1"), {});
  assert.deepEqual(validateTariff({ ...charging, validFrom: "2027-01-01", validUntil: null }, spklu, existing), {});
});

test("getActiveTariff: mengembalikan tarif yang berlaku pada tanggal tertentu", () => {
  const tariffs: Tariff[] = [{ id: "t1", ...charging }];
  assert.equal(getActiveTariff(tariffs, "f1", "CHARGING", "2026-07-01")?.id, "t1");
  assert.equal(getActiveTariff(tariffs, "f1", "CHARGING", "2026-01-01")?.id, "t1");
  assert.equal(getActiveTariff(tariffs, "f1", "CHARGING", "2025-12-31"), undefined);
  assert.equal(getActiveTariff(tariffs, "f1", "CHARGING", "2027-01-01"), undefined);
  assert.equal(getActiveTariff(tariffs, "f1", "SWAP", "2026-07-01"), undefined);
});

test("getActiveTariff: periode terbuka (tanpa tanggal akhir) tetap terbaca", () => {
  const tariffs: Tariff[] = [{ id: "t1", ...charging, validUntil: null }];
  assert.equal(getActiveTariff(tariffs, "f1", "CHARGING", "2040-05-05")?.id, "t1");
});

test("tariffStatus: berlaku, akan datang, dan berakhir", () => {
  const tariff: Tariff = { id: "t1", ...charging };
  assert.equal(tariffStatus(tariff, "2026-06-01"), "active");
  assert.equal(tariffStatus(tariff, "2025-06-01"), "upcoming");
  assert.equal(tariffStatus(tariff, "2027-06-01"), "expired");
});
