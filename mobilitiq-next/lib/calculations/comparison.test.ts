import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateComparison } from "./comparison.ts";

describe("calculateComparison (PBI: KEL2-73)", () => {
  it("menghitung penghematan ketika EV lebih murah daripada BBM (kasus komuter normal)", () => {
    const res = calculateComparison({
      dailyDistanceKm: 60,
      iceKmPerLiter: 48,
      fuelPricePerLiter: 10000,
      evConsumptionKwh100km: 3.2,
      homeTariffPerKwh: 1444.7,
      spkluTariffPerKwh: 2466,
      homeChargingPercentage: 85,
    });

    assert.equal(res.ok, true);
    if (!res.ok) return;

    assert.equal(res.data.monthlyDistanceKm, 1800);
    assert.equal(res.data.bbmMonthlyLiters, 37.5);
    assert.equal(res.data.bbmMonthlyCost, 375000);
    assert.equal(res.data.evMonthlyKwh, 57.6);
    assert.equal(res.data.isEvCheaper, true);
    assert.equal(res.data.isEqual, false);
    assert.equal(res.data.status, "SAVING");
    assert.ok(res.data.costDifferenceMonthly > 0);
    assert.ok(res.data.percentageDifference > 50);
  });

  it("menampilkan status ADDITIONAL_COST bila biaya EV lebih besar daripada BBM", () => {
    // Skenario: Motor BBM sangat irit (60 km/L @ Rp 10.000) vs EV boros (20 kWh/100 km @ 100% SPKLU Rp 3.000)
    const res = calculateComparison({
      dailyDistanceKm: 60,
      iceKmPerLiter: 60,
      fuelPricePerLiter: 10000, // BBM cost = 1800/60 * 10000 = Rp 300.000
      evConsumptionKwh100km: 20,
      homeTariffPerKwh: 1444.7,
      spkluTariffPerKwh: 3000,
      homeChargingPercentage: 0, // EV cost = 1800 * 20/100 = 360 kWh * 3000 = Rp 1.080.000
    });

    assert.equal(res.ok, true);
    if (!res.ok) return;

    assert.equal(res.data.isEvCheaper, false);
    assert.equal(res.data.isEqual, false);
    assert.equal(res.data.status, "ADDITIONAL_COST");
    assert.equal(res.data.bbmMonthlyCost, 300000);
    assert.equal(res.data.evMonthlyCost, 1080000);
    assert.equal(res.data.costDifferenceMonthly, 780000);
    assert.equal(res.data.percentageDifference, 260); // (780000 / 300000) * 100
  });

  it("menangani kasus biaya setara secara seimbang", () => {
    // Buat biaya BBM persis sama dengan biaya EV
    // EV: 100 km/bulan, 10 kWh/100 km @ Rp 1.000/kWh = 10 kWh * 1000 = Rp 10.000
    // BBM: 100 km/bulan, 10 km/L @ Rp 1.000/L = 10 L * 1000 = Rp 10.000
    const res = calculateComparison({
      dailyDistanceKm: 10 / 3, // 100 km / 30 hari
      iceKmPerLiter: 10,
      fuelPricePerLiter: 1000,
      evConsumptionKwh100km: 10,
      homeTariffPerKwh: 1000,
      spkluTariffPerKwh: 1000,
      homeChargingPercentage: 100,
    });

    assert.equal(res.ok, true);
    if (!res.ok) return;

    assert.equal(res.data.isEqual, true);
    assert.equal(res.data.status, "EQUAL");
    assert.equal(res.data.costDifferenceMonthly, 0);
    assert.equal(res.data.percentageDifference, 0);
  });

  it("menangani jarak tempuh harian 0 km dengan aman", () => {
    const res = calculateComparison({
      dailyDistanceKm: 0,
      iceKmPerLiter: 48,
      fuelPricePerLiter: 10000,
      evConsumptionKwh100km: 3.2,
      homeTariffPerKwh: 1444.7,
      spkluTariffPerKwh: 2466,
      homeChargingPercentage: 85,
    });

    assert.equal(res.ok, true);
    if (!res.ok) return;

    assert.equal(res.data.monthlyDistanceKm, 0);
    assert.equal(res.data.bbmMonthlyCost, 0);
    assert.equal(res.data.evMonthlyCost, 0);
    assert.equal(res.data.costDifferenceMonthly, 0);
    assert.equal(res.data.status, "EQUAL");
  });

  it("menolak input tidak valid (efisiensi BBM <= 0, harga BBM <= 0, jarak < 0)", () => {
    const res = calculateComparison({
      dailyDistanceKm: -10,
      iceKmPerLiter: 0,
      fuelPricePerLiter: -5000,
      evConsumptionKwh100km: -2,
      homeTariffPerKwh: 0,
      spkluTariffPerKwh: 0,
      homeChargingPercentage: NaN,
    });

    assert.equal(res.ok, false);
    if (res.ok) return;

    assert.ok(res.errors.dailyDistanceKm);
    assert.ok(res.errors.iceKmPerLiter);
    assert.ok(res.errors.fuelPricePerLiter);
    assert.ok(res.errors.evConsumptionKwh100km);
    assert.ok(res.errors.homeTariffPerKwh);
    assert.ok(res.errors.spkluTariffPerKwh);
    assert.ok(res.errors.homeChargingPercentage);
  });
});
