import test from "node:test";
import assert from "node:assert/strict";
import { calculateEvEnergy, DAYS_PER_MONTH } from "./ev.ts";
import { parseStrictNumber } from "../parser.ts";

test("calculateEvEnergy: menghitung konsumsi normal dengan benar", () => {
  const result = calculateEvEnergy({
    dailyDistanceKm: 30,
    consumptionKwh100km: 15,
    homeChargingPercentage: 80,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.monthlyDistanceKm, 900);
  assert.equal(result.data.monthlyKwh, 135);
  assert.equal(result.data.homeKwh, 108);
  assert.equal(result.data.spkluKwh, 27);
  assert.equal(result.data.homeCostMonthly, 156028);
  assert.equal(result.data.spkluCostMonthly, 66582);
  assert.equal(result.data.totalCostMonthly, 222610);
  assert.equal(result.data.costPerKm, 247.34);
});

test("calculateEvEnergy: menangani jarak harian 0 km dengan aman", () => {
  const result = calculateEvEnergy({
    dailyDistanceKm: 0,
    consumptionKwh100km: 15,
    homeChargingPercentage: 80,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.monthlyDistanceKm, 0);
  assert.equal(result.data.monthlyKwh, 0);
  assert.equal(result.data.homeKwh, 0);
  assert.equal(result.data.spkluKwh, 0);
  assert.equal(result.data.homeCostMonthly, 0);
  assert.equal(result.data.spkluCostMonthly, 0);
  assert.equal(result.data.totalCostMonthly, 0);
  assert.equal(result.data.costPerKm, 0);
});

test("calculateEvEnergy: menangani 100% charging rumah", () => {
  const result = calculateEvEnergy({
    dailyDistanceKm: 20,
    consumptionKwh100km: 10,
    homeChargingPercentage: 100,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.monthlyDistanceKm, 600);
  assert.equal(result.data.monthlyKwh, 60);
  assert.equal(result.data.homeKwh, 60);
  assert.equal(result.data.spkluKwh, 0);
  assert.equal(result.data.spkluCostMonthly, 0);
});

test("calculateEvEnergy: menangani 0% charging rumah (100% SPKLU)", () => {
  const result = calculateEvEnergy({
    dailyDistanceKm: 20,
    consumptionKwh100km: 10,
    homeChargingPercentage: 0,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.homeKwh, 0);
  assert.equal(result.data.spkluKwh, 60);
  assert.equal(result.data.homeCostMonthly, 0);
  assert.equal(result.data.spkluCostMonthly, 147960);
});

test("calculateEvEnergy: melakukan clamping persentase < 0 dan > 100", () => {
  const clampedNeg = calculateEvEnergy({
    dailyDistanceKm: 20,
    consumptionKwh100km: 10,
    homeChargingPercentage: -30,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(clampedNeg.ok, true);
  if (clampedNeg.ok) {
    assert.equal(clampedNeg.data.homeKwh, 0);
    assert.equal(clampedNeg.data.spkluKwh, 60);
  }

  const clampedHigh = calculateEvEnergy({
    dailyDistanceKm: 20,
    consumptionKwh100km: 10,
    homeChargingPercentage: 150,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(clampedHigh.ok, true);
  if (clampedHigh.ok) {
    assert.equal(clampedHigh.data.homeKwh, 60);
    assert.equal(clampedHigh.data.spkluKwh, 0);
  }
});

test("calculateEvEnergy: menolak input tidak valid dengan pesan kesalahan jelas", () => {
  // Konsumsi energi <= 0 atau non-finite
  const errCons = calculateEvEnergy({
    dailyDistanceKm: 30,
    consumptionKwh100km: -5,
    homeChargingPercentage: 50,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(errCons.ok, false);
  if (!errCons.ok) {
    assert.ok(errCons.errors.consumptionKwh100km);
  }

  // Jarak harian negatif
  const errDist = calculateEvEnergy({
    dailyDistanceKm: -10,
    consumptionKwh100km: 15,
    homeChargingPercentage: 50,
    homeTariffPerKwh: 1444.7,
    spkluTariffPerKwh: 2466,
  });
  assert.equal(errDist.ok, false);
  if (!errDist.ok) {
    assert.ok(errDist.errors.dailyDistanceKm);
  }

  // Tarif listrik non-positif / non-finite
  const errTariff = calculateEvEnergy({
    dailyDistanceKm: 30,
    consumptionKwh100km: 15,
    homeChargingPercentage: 50,
    homeTariffPerKwh: 0,
    spkluTariffPerKwh: NaN,
  });
  assert.equal(errTariff.ok, false);
  if (!errTariff.ok) {
    assert.ok(errTariff.errors.homeTariffPerKwh);
    assert.ok(errTariff.errors.spkluTariffPerKwh);
  }
});

test("parseStrictNumber: menolak string kosong, spasi, NaN, dan Infinity", () => {
  assert.equal(parseStrictNumber("").valid, false);
  assert.equal(parseStrictNumber("   ").valid, false);
  assert.equal(parseStrictNumber("abc").valid, false);
  assert.equal(parseStrictNumber(NaN).valid, false);
  assert.equal(parseStrictNumber(Infinity).valid, false);
  assert.equal(parseStrictNumber(-Infinity).valid, false);
  assert.equal(parseStrictNumber(null).valid, false);
  assert.equal(parseStrictNumber(undefined).valid, false);

  const parsedValid = parseStrictNumber("15.5");
  assert.equal(parsedValid.valid, true);
  assert.equal(parsedValid.value, 15.5);

  const parsedZero = parseStrictNumber("0");
  assert.equal(parsedZero.valid, true);
  assert.equal(parsedZero.value, 0);
});

test("DAYS_PER_MONTH: dipastikan bernilai tepat 30 hari", () => {
  assert.equal(DAYS_PER_MONTH, 30);
});
