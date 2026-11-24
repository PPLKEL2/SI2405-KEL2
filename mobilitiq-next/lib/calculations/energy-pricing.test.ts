import test from "node:test";
import assert from "node:assert/strict";
import {
  validateEnergyTariffInput,
  isValidIsoDate,
  isTariffActiveOnDate,
  resolveActiveTariffs,
  findActiveTariffByCode,
  getTariffPeriodStatus,
  createTariffSnapshot,
  getPriceFromSnapshot,
} from "./energy-pricing.ts";
import type { EnergyTariff } from "../types/energy-pricing.ts";
import { calculateEvEnergy } from "./ev.ts";

test("isValidIsoDate: memvalidasi format dan kalender ISO dengan benar", () => {
  assert.equal(isValidIsoDate("2024-10-01"), true);
  assert.equal(isValidIsoDate("2024-12-31"), true);
  assert.equal(isValidIsoDate("2024-02-29"), true); // Kabisat
  assert.equal(isValidIsoDate("2023-02-29"), false); // Bukan kabisat
  assert.equal(isValidIsoDate("2024-13-01"), false); // Bulan tidak valid
  assert.equal(isValidIsoDate("2024-00-10"), false);
  assert.equal(isValidIsoDate("2024-04-31"), false); // April hanya 30 hari
  assert.equal(isValidIsoDate("bukan-tanggal"), false);
  assert.equal(isValidIsoDate(""), false);
});

// =================================================================
// SUBTUGAS KEL2-90: Validasi Input Parameter Harga Energi
// =================================================================
test("KEL2-90: validateEnergyTariffInput menerima input yang valid dan lengkap", () => {
  const result = validateEnergyTariffInput({
    code: "PLN_R1_1300",
    name: "Tarif PLN R-1 1.300 VA Non-Subsidi",
    category: "PLN_HOME",
    pricePerUnit: "1444.70",
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: "2024-12-31",
    isActive: true,
    notes: "Tarif triwulan IV 2024",
  });

  assert.equal(result.valid, true);
  assert.equal(Object.keys(result.errors).length, 0);
  assert.ok(result.sanitized);
  assert.equal(result.sanitized.pricePerUnit, 1444.7);
  assert.equal(result.sanitized.code, "PLN_R1_1300");
  assert.equal(result.sanitized.validTo, "2024-12-31");
});

test("KEL2-90: validateEnergyTariffInput menerima validTo null/kosong (berlaku seterusnya)", () => {
  const result = validateEnergyTariffInput({
    code: "SPKLU_FAST",
    name: "Tarif SPKLU Fast Charging",
    category: "SPKLU",
    pricePerUnit: 2466,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
  });

  assert.equal(result.valid, true);
  assert.equal(result.sanitized?.validTo, null);
});

test("KEL2-90: validateEnergyTariffInput menolak nilai numerik <= 0, string kosong, dan non-numerik", () => {
  // Nilai 0
  const zeroPrice = validateEnergyTariffInput({
    code: "PLN_TEST",
    name: "Tarif Test",
    category: "PLN_HOME",
    pricePerUnit: 0,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
  });
  assert.equal(zeroPrice.valid, false);
  assert.ok(zeroPrice.errors.pricePerUnit);

  // Nilai negatif
  const negativePrice = validateEnergyTariffInput({
    code: "PLN_TEST",
    name: "Tarif Test",
    category: "PLN_HOME",
    pricePerUnit: -1500,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
  });
  assert.equal(negativePrice.valid, false);
  assert.ok(negativePrice.errors.pricePerUnit);

  // String non-numerik
  const stringPrice = validateEnergyTariffInput({
    code: "PLN_TEST",
    name: "Tarif Test",
    category: "PLN_HOME",
    pricePerUnit: "seribu lima ratus",
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
  });
  assert.equal(stringPrice.valid, false);
  assert.ok(stringPrice.errors.pricePerUnit);
});

test("KEL2-90: validateEnergyTariffInput menolak satuan yang tidak cocok dengan kategori", () => {
  // BBM dengan satuan Rp/kWh (salah)
  const wrongUnitBbm = validateEnergyTariffInput({
    code: "BBM_PERTALITE",
    name: "Pertalite",
    category: "BBM",
    pricePerUnit: 10000,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
  });
  assert.equal(wrongUnitBbm.valid, false);
  assert.ok(wrongUnitBbm.errors.unit);

  // PLN_HOME dengan satuan Rp/liter (salah)
  const wrongUnitPln = validateEnergyTariffInput({
    code: "PLN_TEST",
    name: "PLN Test",
    category: "PLN_HOME",
    pricePerUnit: 1444,
    unit: "Rp/liter",
    validFrom: "2024-10-01",
  });
  assert.equal(wrongUnitPln.valid, false);
  assert.ok(wrongUnitPln.errors.unit);
});

test("KEL2-90: validateEnergyTariffInput menolak periode tanggal yang tidak konsisten", () => {
  // validTo lebih awal dari validFrom
  const invertedDates = validateEnergyTariffInput({
    code: "PLN_TEST",
    name: "PLN Test",
    category: "PLN_HOME",
    pricePerUnit: 1444,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: "2024-09-30",
  });
  assert.equal(invertedDates.valid, false);
  assert.ok(invertedDates.errors.validTo);

  // format tanggal salah
  const invalidDateFormat = validateEnergyTariffInput({
    code: "PLN_TEST",
    name: "PLN Test",
    category: "PLN_HOME",
    pricePerUnit: 1444,
    unit: "Rp/kWh",
    validFrom: "01-10-2024",
  });
  assert.equal(invalidDateFormat.valid, false);
  assert.ok(invalidDateFormat.errors.validFrom);
});

test("KEL2-90: validateEnergyTariffInput mewajibkan alasan perubahan saat mode edit", () => {
  const editWithoutReason = validateEnergyTariffInput(
    {
      code: "PLN_TEST",
      name: "PLN Test",
      category: "PLN_HOME",
      pricePerUnit: 1500,
      unit: "Rp/kWh",
      validFrom: "2024-10-01",
      reason: "",
    },
    true,
  );
  assert.equal(editWithoutReason.valid, false);
  assert.ok(editWithoutReason.errors.reason);

  const editWithReason = validateEnergyTariffInput(
    {
      code: "PLN_TEST",
      name: "PLN Test",
      category: "PLN_HOME",
      pricePerUnit: 1500,
      unit: "Rp/kWh",
      validFrom: "2024-10-01",
      reason: "Penyesuaian tarif listrik triwulan I",
    },
    true,
  );
  assert.equal(editWithReason.valid, true);
});

// =================================================================
// SUBTUGAS KEL2-115: Validasi & Seleksi Tarif Aktif per Tanggal
// =================================================================
const sampleTariffs: EnergyTariff[] = [
  {
    id: "pln-q3-2024",
    code: "PLN_R1_1300",
    name: "PLN 1300 VA (TW III 2024)",
    category: "PLN_HOME",
    pricePerUnit: 1444.7,
    unit: "Rp/kWh",
    validFrom: "2024-07-01",
    validTo: "2024-09-30",
    isActive: true,
    updatedAt: "2024-07-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "pln-q4-2024",
    code: "PLN_R1_1300",
    name: "PLN 1300 VA (TW IV 2024)",
    category: "PLN_HOME",
    pricePerUnit: 1444.7,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: "2024-12-31",
    isActive: true,
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "pln-2025-onwards",
    code: "PLN_R1_1300",
    name: "PLN 1300 VA (2025 Baru)",
    category: "PLN_HOME",
    pricePerUnit: 1550.0,
    unit: "Rp/kWh",
    validFrom: "2025-01-01",
    validTo: null, // Berlaku seterusnya
    isActive: true,
    updatedAt: "2025-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "pln-inactive",
    code: "PLN_R1_INACTIVE",
    name: "PLN 1300 VA (Nonaktif)",
    category: "PLN_HOME",
    pricePerUnit: 1200.0,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: false, // Nonaktif manual
    updatedAt: "2024-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
];

test("KEL2-115: isTariffActiveOnDate memilih tarif berdasarkan rentang tanggal berlaku", () => {
  // Tanggal 15 Agustus 2024 -> Harus aktif di TW III
  assert.equal(isTariffActiveOnDate(sampleTariffs[0], "2024-08-15"), true);
  assert.equal(isTariffActiveOnDate(sampleTariffs[1], "2024-08-15"), false);
  assert.equal(isTariffActiveOnDate(sampleTariffs[2], "2024-08-15"), false);

  // Tanggal 15 November 2024 -> Harus aktif di TW IV
  assert.equal(isTariffActiveOnDate(sampleTariffs[0], "2024-11-15"), false);
  assert.equal(isTariffActiveOnDate(sampleTariffs[1], "2024-11-15"), true);
  assert.equal(isTariffActiveOnDate(sampleTariffs[2], "2024-11-15"), false);

  // Tanggal 15 Februari 2025 -> Harus aktif di 2025 onwards
  assert.equal(isTariffActiveOnDate(sampleTariffs[0], "2025-02-15"), false);
  assert.equal(isTariffActiveOnDate(sampleTariffs[1], "2025-02-15"), false);
  assert.equal(isTariffActiveOnDate(sampleTariffs[2], "2025-02-15"), true);

  // Tanggal 15 Juni 2026 -> Masih aktif di 2025 onwards karena validTo null
  assert.equal(isTariffActiveOnDate(sampleTariffs[2], "2026-06-15"), true);

  // Tarif berstatus isActive: false TIDAK PERNAH aktif pada tanggal mana pun
  assert.equal(isTariffActiveOnDate(sampleTariffs[3], "2024-05-01"), false);
});

test("KEL2-115: resolveActiveTariffs menyaring hanya parameter yang aktif pada tanggal simulasi", () => {
  const activeTw3 = resolveActiveTariffs(sampleTariffs, "2024-08-01");
  assert.equal(activeTw3.length, 1);
  assert.equal(activeTw3[0].id, "pln-q3-2024");

  const activeTw4 = resolveActiveTariffs(sampleTariffs, "2024-11-01");
  assert.equal(activeTw4.length, 1);
  assert.equal(activeTw4[0].id, "pln-q4-2024");

  const active2025 = resolveActiveTariffs(sampleTariffs, "2025-03-01");
  assert.equal(active2025.length, 1);
  assert.equal(active2025[0].id, "pln-2025-onwards");
  assert.equal(active2025[0].pricePerUnit, 1550.0);
});

test("KEL2-115: findActiveTariffByCode menemukan tarif aktif spesifik berdasarkan kode", () => {
  const found = findActiveTariffByCode(sampleTariffs, "PLN_R1_1300", "2024-11-01");
  assert.ok(found);
  assert.equal(found.id, "pln-q4-2024");

  const notFound = findActiveTariffByCode(sampleTariffs, "KODE_TIDAK_ADA", "2024-11-01");
  assert.equal(notFound, null);
});

test("KEL2-115: getTariffPeriodStatus mengidentifikasi status aktif, kedaluwarsa, dan terjadwal", () => {
  // Dengan tanggal referensi 2024-11-01:
  assert.equal(getTariffPeriodStatus(sampleTariffs[0], "2024-11-01"), "EXPIRED"); // TW III berakhir 30 Sept
  assert.equal(getTariffPeriodStatus(sampleTariffs[1], "2024-11-01"), "ACTIVE"); // TW IV aktif
  assert.equal(getTariffPeriodStatus(sampleTariffs[2], "2024-11-01"), "SCHEDULED"); // 2025 belum mulai
  assert.equal(getTariffPeriodStatus(sampleTariffs[3], "2024-11-01"), "INACTIVE"); // manual inactive
});

// =================================================================
// SUBTUGAS KEL2-116: Audit Trail & Imutabilitas Hasil Historis
// =================================================================
test("KEL2-116: snapshot menjamin perubahan tarif baru tidak mengubah hasil simulasi historis", () => {
  // Skenario:
  // 1. Pada tanggal 2024-10-15, pengguna melakukan simulasi dengan tarif aktif Rp 1.444,70 / kWh.
  const snapshotPast = createTariffSnapshot(sampleTariffs, "2024-10-15");
  const pastTariffPrice = getPriceFromSnapshot(snapshotPast, "PLN_R1_1300");
  assert.equal(pastTariffPrice, 1444.7);

  // Hasil simulasi historis dihitung dengan snapshot:
  const historicalSimResult = calculateEvEnergy({
    consumptionKwh100km: 15,
    dailyDistanceKm: 30,
    homeChargingPercentage: 100,
    homeTariffPerKwh: pastTariffPrice!,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(historicalSimResult.ok, true);
  if (!historicalSimResult.ok) return;
  const originalCost = historicalSimResult.data.totalCostMonthly; // Rp 195.035

  // 2. Kemudian Superadmin memperbarui tarif untuk tahun 2025 menjadi Rp 1.550 / kWh
  // dan simulasi baru dilakukan pada 2025-02-01:
  const snapshotFuture = createTariffSnapshot(sampleTariffs, "2025-02-01");
  const futureTariffPrice = getPriceFromSnapshot(snapshotFuture, "PLN_R1_1300");
  assert.equal(futureTariffPrice, 1550.0);

  const futureSimResult = calculateEvEnergy({
    consumptionKwh100km: 15,
    dailyDistanceKm: 30,
    homeChargingPercentage: 100,
    homeTariffPerKwh: futureTariffPrice!,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(futureSimResult.ok, true);
  if (!futureSimResult.ok) return;
  const newCost = futureSimResult.data.totalCostMonthly; // Rp 209.250

  // 3. Verifikasi: Hasil simulasi baru berbeda karena tarif baru
  assert.notEqual(originalCost, newCost);

  // 4. Verifikasi KEL2-116: Snapshot historis tetap tidak berubah!
  const reVerifiedPastPrice = getPriceFromSnapshot(snapshotPast, "PLN_R1_1300");
  assert.equal(reVerifiedPastPrice, 1444.7);

  // Menghitung ulang simulasi historis dengan snapshot historis tetap menghasilkan nilai persis sama:
  const reCalculatedHistorical = calculateEvEnergy({
    consumptionKwh100km: 15,
    dailyDistanceKm: 30,
    homeChargingPercentage: 100,
    homeTariffPerKwh: reVerifiedPastPrice!,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(reCalculatedHistorical.ok, true);
  if (reCalculatedHistorical.ok) {
    assert.equal(reCalculatedHistorical.data.totalCostMonthly, originalCost);
  }
});

// =================================================================
// REPOSITORY INTEGRATION TESTS: EnergyTariffRepository
// =================================================================
import { EnergyTariffRepository } from "../storage/energy-tariff-repository.ts";

test("EnergyTariffRepository: operasi CRUD dan pencatatan audit log berfungsi utuh", () => {
  const repo = new EnergyTariffRepository();
  repo.resetToDefaultSeed();

  // 1. Get all tariffs
  const allInitial = repo.getAllTariffs();
  assert.ok(allInitial.length >= 7);

  // 2. Create new tariff
  const created = repo.createTariff({
    code: "PLN_TEST_DYNAMIC",
    name: "Tarif PLN Test Dinamis",
    category: "PLN_HOME",
    pricePerUnit: 1750,
    unit: "Rp/kWh",
    validFrom: "2025-01-01",
    validTo: "2025-06-30",
    isActive: true,
    reason: "Pengujian tambah parameter baru",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.data.code, "PLN_TEST_DYNAMIC");

  // 3. Update tariff
  const updated = repo.updateTariff(created.data.id, {
    code: "PLN_TEST_DYNAMIC",
    name: "Tarif PLN Test Dinamis (Updated)",
    category: "PLN_HOME",
    pricePerUnit: 1800,
    unit: "Rp/kWh",
    validFrom: "2025-01-01",
    validTo: "2025-06-30",
    isActive: true,
    reason: "Kenaikan tarif tahap 2",
  });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  assert.equal(updated.data.pricePerUnit, 1800);

  // 4. Check audit history (KEL2-116)
  const histories = repo.getHistories({ tariffId: created.data.id });
  assert.ok(histories.length >= 2);
  const latestHist = histories[0];
  assert.equal(latestHist.action, "UPDATE_PRICE");
  assert.equal(latestHist.oldPrice, 1750);
  assert.equal(latestHist.newPrice, 1800);
  assert.equal(latestHist.reason, "Kenaikan tarif tahap 2");

  // 5. Test active date resolution (KEL2-115)
  const activeDuringPeriod = repo.getActiveTariffsOnDate("2025-03-15");
  assert.ok(activeDuringPeriod.some((t) => t.code === "PLN_TEST_DYNAMIC"));

  const activeAfterPeriod = repo.getActiveTariffsOnDate("2025-07-01");
  assert.ok(!activeAfterPeriod.some((t) => t.code === "PLN_TEST_DYNAMIC"));
});
