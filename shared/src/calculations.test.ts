import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFullSimulation,
  calculateHaversineKm,
  DEFAULT_FINANCE_BATTERY_PARAMS,
  DEFAULT_SYSTEM_PARAMETERS,
  formatPaybackMonths,
  switchEvModelPreservingIce,
} from './calculations.js';
import type { ReferenceContext, SimulationInput } from './types.js';

const mockRef: ReferenceContext = {
  evModels: [
    {
      id: 'fox-r',
      partnerId: null,
      slug: 'polytron-fox-r',
      brand: 'Polytron',
      modelName: 'Fox-R',
      vehicleType: 'Motor',
      batteryKwh: 2.4,
      otrPriceIdr: 23_900_000,
      wltpRangeKm: 85,
      consumptionKwh100km: 3.2,
      acChargerKw: 0.4,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '3 th / 30.000 km',
      promoLabel: 'Gratis wallbox',
      comparableIceName: 'Honda Vario 125',
      comparableIcePriceIdr: 24_500_000,
      imageUrl: null,
      isActive: true,
    },
    {
      id: 'alva',
      partnerId: null,
      slug: 'alva-one',
      brand: 'Alva',
      modelName: 'One',
      vehicleType: 'Motor',
      batteryKwh: 3.4,
      otrPriceIdr: 36_800_000,
      wltpRangeKm: 120,
      consumptionKwh100km: 2.9,
      acChargerKw: 0.7,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '3 th / 40.000 km',
      promoLabel: null,
      comparableIceName: 'Yamaha NMAX 155',
      comparableIcePriceIdr: 33_000_000,
      imageUrl: null,
      isActive: true,
    },
    {
      id: 'ioniq5',
      partnerId: null,
      slug: 'hyundai-ioniq-5',
      brand: 'Hyundai',
      modelName: 'Ioniq 5 Signature',
      vehicleType: 'Mobil',
      batteryKwh: 72.6,
      otrPriceIdr: 780_000_000,
      wltpRangeKm: 451,
      consumptionKwh100km: 16.8,
      acChargerKw: 11,
      dcChargerKw: 220,
      serviceCostPerKmIdr: 89,
      annualPkbTaxIdr: 0,
      warrantyLabel: '8 th / 160.000 km',
      promoLabel: null,
      comparableIceName: 'Toyota Innova Zenix',
      comparableIcePriceIdr: 450_000_000,
      imageUrl: null,
      isActive: true,
    },
  ],
  icePresets: [
    {
      id: 'vario',
      modelName: 'Honda Vario 125',
      vehicleType: 'Motor',
      defaultKmPerLiter: 45,
      defaultFuelCode: 'PERTALITE',
      estimatedOtrPriceIdr: 24_500_000,
      estimatedResalePriceIdr: 12_000_000,
      serviceCostPerKmIdr: 47,
      annualStnkTaxIdr: 400_000,
      isActive: true,
    },
    {
      id: 'avanza',
      modelName: 'Toyota Avanza',
      vehicleType: 'Mobil',
      defaultKmPerLiter: 12.5,
      defaultFuelCode: 'PERTALITE',
      estimatedOtrPriceIdr: 270_000_000,
      estimatedResalePriceIdr: 110_000_000,
      serviceCostPerKmIdr: 230,
      annualStnkTaxIdr: 3_500_000,
      isActive: true,
    },
  ],
  energyTariffs: [
    {
      id: 'bbm-1',
      category: 'BBM',
      code: 'PERTALITE',
      displayName: 'Pertalite',
      subsidyType: 'Subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 10_000,
      unitLabel: 'liter',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 2.28,
      isActive: true,
      updatedAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'pln-450',
      category: 'PLN',
      code: 'PLN_R1_450',
      displayName: 'R-1 / 450 VA',
      subsidyType: 'Subsidi',
      powerVaMin: 450,
      powerVaMax: 450,
      pricePerUnitIdr: 415,
      unitLabel: 'kWh',
      upgradeFeeIdr: 0,
      emissionKgCo2PerUnit: 0.87,
      isActive: true,
      updatedAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'pln-1300',
      category: 'PLN',
      code: 'PLN_R1_1300',
      displayName: 'R-1 / 1.300 VA',
      subsidyType: 'Non-subsidi',
      powerVaMin: 1300,
      powerVaMax: 2200,
      pricePerUnitIdr: 1444.7,
      unitLabel: 'kWh',
      upgradeFeeIdr: 1_150_000,
      emissionKgCo2PerUnit: 0.87,
      isActive: true,
      updatedAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'pln-3500',
      category: 'PLN',
      code: 'PLN_R2_3500',
      displayName: 'R-2 / 3.500 VA',
      subsidyType: 'Non-subsidi',
      powerVaMin: 3500,
      powerVaMax: 5500,
      pricePerUnitIdr: 1699.53,
      unitLabel: 'kWh',
      upgradeFeeIdr: 3_900_000,
      emissionKgCo2PerUnit: 0.87,
      isActive: true,
      updatedAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'spklu-1',
      category: 'SPKLU_REF',
      code: 'SPKLU_NASIONAL',
      displayName: 'SPKLU Publik',
      subsidyType: 'Non-subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 2466,
      unitLabel: 'kWh',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 0.87,
      isActive: true,
      updatedAt: '2026-10-01T00:00:00Z',
    },
  ],
  evIncentives: [
    {
      id: 'inc-1',
      code: 'PPN_DTP_10',
      policyName: 'PPN DTP 10%',
      applicableVehicleType: 'Mobil',
      calculationType: 'percentage',
      benefitValue: 10,
      benefitDisplayText: 'Potongan PPN 10%',
      legalBasis: 'PMK',
      isActive: true,
      updatedAt: '2026-10-01T00:00:00Z',
    },
  ],
  systemParameters: DEFAULT_SYSTEM_PARAMETERS,
};

const baseInput: SimulationInput = {
  pathway: 'B',
  vehicleType: 'Motor',
  icePresetId: 'vario',
  customIceName: 'Honda Beat Kustom',
  iceKmPerLiter: 58,
  fuelCode: 'PERTALITE',
  dailyDistanceKm: 60,
  budgetIdr: 30_000_000,
  evModelId: 'fox-r',
  homePowerVa: 1300,
  homeChargerKw: 0.4,
  baseLoadKw: 0.6,
  nightChargingEnabled: false,
  homeChargingSharePct: 85,
  solarRooftopEnabled: false,
  extra: DEFAULT_FINANCE_BATTERY_PARAMS,
};

test('BUG-01 fix: payback index -1 never renders < 1 bln', () => {
  assert.equal(formatPaybackMonths(-1), '> 5 th');
  assert.equal(formatPaybackMonths(0), '< 1 bln');
  assert.equal(formatPaybackMonths(18), '1 th 6 bln');

  const expensiveEvNoPayback = calculateFullSimulation(
    {
      ...baseInput,
      vehicleType: 'Mobil',
      evModelId: 'ioniq5',
      icePresetId: 'avanza',
      iceKmPerLiter: 18,
      dailyDistanceKm: 10,
    },
    mockRef,
  );
  assert.equal(expensiveEvNoPayback.tco.isPaybackReached, false);
  assert.equal(expensiveEvNoPayback.tco.paybackLabel, '> 5 th');
});

test('BUG-03 fix: switching EV of same vehicleType preserves custom ICE km/l', () => {
  const switchedSame = switchEvModelPreservingIce(baseInput, mockRef.evModels[1], mockRef.icePresets);
  assert.equal(switchedSame.evModelId, 'alva');
  assert.equal(switchedSame.iceKmPerLiter, 58);
  assert.equal(switchedSame.customIceName, 'Honda Beat Kustom');

  const switchedCategory = switchEvModelPreservingIce(baseInput, mockRef.evModels[2], mockRef.icePresets);
  assert.equal(switchedCategory.vehicleType, 'Mobil');
  assert.equal(switchedCategory.iceKmPerLiter, 12.5);
});

test('BUG-05 & BUG-07 fix: tiered PLN VA tariff & 0.85 power factor applied', () => {
  const res450 = calculateFullSimulation({ ...baseInput, homePowerVa: 450 }, mockRef);
  const res3500 = calculateFullSimulation({ ...baseInput, homePowerVa: 3500 }, mockRef);
  assert.ok(res450.evEnergy.monthlyHomeCostIdr < res3500.evEnergy.monthlyHomeCostIdr);
  assert.equal(res450.homePower.maxCapacityKw, 0.38);
  assert.equal(res450.homePower.status, 'bahaya');
});

test('Haversine distance computes realistic Jakarta Menteng to Senayan distance', () => {
  const km = calculateHaversineKm(-6.1972, 106.8371, -6.2253, 106.7997);
  assert.ok(km > 4 && km < 7);
});

test('BUG-04 fix: negative operational saving flags isNegativeSaving cleanly without NaN', () => {
  const neg = calculateFullSimulation(
    {
      ...baseInput,
      vehicleType: 'Mobil',
      evModelId: 'ioniq5',
      icePresetId: 'avanza',
      iceKmPerLiter: 42,
      homeChargingSharePct: 0,
    },
    mockRef,
  );
  assert.equal(neg.comparison.isNegativeSaving, true);
  assert.ok(neg.comparison.monthlyOperationalSavingIdr < 0);
  assert.ok(!Number.isNaN(neg.comparison.savingPct));
});

test('PLN tariff row without VA bounds does not hijack household VA resolution', () => {
  const refWithUnboundedSubsidy: ReferenceContext = {
    ...mockRef,
    energyTariffs: [
      {
        id: 'pln-900-sub',
        category: 'PLN',
        code: 'PLN_R1_900_SUB',
        displayName: 'R-1 / 900 VA Subsidi DTKS',
        subsidyType: 'Subsidi',
        powerVaMin: null,
        powerVaMax: null,
        pricePerUnitIdr: 605,
        unitLabel: 'kWh',
        upgradeFeeIdr: 0,
        emissionKgCo2PerUnit: 0.87,
        isActive: true,
        updatedAt: '2026-10-01T00:00:00Z',
      },
      ...mockRef.energyTariffs,
    ],
  };
  const res1300 = calculateFullSimulation({ ...baseInput, homePowerVa: 1300 }, refWithUnboundedSubsidy);
  assert.equal(res1300.plnTariff.code, 'PLN_R1_1300');
  assert.equal(res1300.plnTariff.pricePerUnitIdr, 1444.7);
});

test('Incentives, sinking fund deposit, degradation, range stops, and solar emissions compute accurately', () => {
  const carSim = calculateFullSimulation(
    {
      ...baseInput,
      pathway: 'A',
      vehicleType: 'Mobil',
      evModelId: 'ioniq5',
      icePresetId: 'avanza',
      iceKmPerLiter: 12.5,
      solarRooftopEnabled: true,
      extra: {
        ...DEFAULT_FINANCE_BATTERY_PARAMS,
        applyPpnDtp: true,
        useDeposit: true,
        tripDistanceKm: 450,
        acOn: true,
        rainTraffic: true,
        fullLoad: true,
      },
    },
    mockRef,
  );

  assert.equal(carSim.purchase.incentiveDiscountIdr, 78_000_000);
  assert.equal(carSim.purchase.netEvPriceIdr, 702_000_000);
  assert.ok(carSim.degradation.seriesAc[10] > carSim.degradation.seriesMix[10]);
  assert.ok(carSim.degradation.seriesMix[10] > carSim.degradation.seriesDc[10]);
  assert.ok(carSim.rangeSim.requiredChargingStops >= 1);
  assert.ok(carSim.emissions.reductionPct > 90);
});
