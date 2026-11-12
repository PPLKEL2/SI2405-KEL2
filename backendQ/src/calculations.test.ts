import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateEvEnergy } from "./calculations/ev.js";
import { calculateComparison } from "./calculations/comparison.js";
import { FUEL_PRICE_REFERENCES, FUEL_METADATA } from "./data/reference-data.js";

describe("Backend Calculations & Presets Suite", () => {
  test("calculateEvEnergy: menghitung Alva One 60 km/hari dengan akurat", () => {
    const res = calculateEvEnergy({
      consumptionKwh100km: 2.9,
      dailyDistanceKm: 60,
      homeChargingPercentage: 85,
      homeTariffPerKwh: 1445,
      spkluTariffPerKwh: 2466,
    });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.monthlyDistanceKm, 1800);
      assert.equal(res.data.monthlyKwh, 52.2);
      assert.equal(res.data.totalCostMonthly, 83423);
    }
  });

  test("calculateComparison: menghitung perbandingan biaya BBM vs EV", () => {
    const res = calculateComparison({
      dailyDistanceKm: 60,
      iceKmPerLiter: 48,
      fuelPricePerLiter: 10000,
      evConsumptionKwh100km: 3.2,
      homeTariffPerKwh: 1445,
      spkluTariffPerKwh: 2466,
      homeChargingPercentage: 85,
    });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.bbmMonthlyCost, 375000);
      assert.equal(res.data.evMonthlyCost, 92053);
      assert.equal(res.data.status, "SAVING");
      assert.equal(res.data.costDifferenceMonthly, 282947);
      assert.equal(res.data.percentageDifference, 75);
    }
  });

  test("FUEL_METADATA: memiliki sumber resmi dan tanggal pembaruan statis", () => {
    assert.ok(FUEL_METADATA.source.length > 0);
    assert.ok(FUEL_METADATA.lastUpdated.length > 0);
    assert.equal(FUEL_METADATA.isStaticReference, true);
    assert.ok(FUEL_PRICE_REFERENCES.length >= 4);
    for (const fuel of FUEL_PRICE_REFERENCES) {
      assert.ok(fuel.source.length > 0);
      assert.ok(fuel.lastUpdated.length > 0);
      assert.ok(fuel.pricePerLiter > 0);
    }
  });
});
