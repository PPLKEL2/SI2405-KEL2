import type {
  EnergyTariffDto,
  EvIncentiveDto,
  EvModelDto,
  FinanceAndBatteryParams,
  FullCalculationResult,
  IceVehiclePresetDto,
  ReferenceContext,
  SimulationInput,
  SystemParametersConfig,
  VehicleType,
} from './types.js';

export const DEFAULT_SYSTEM_PARAMETERS: SystemParametersConfig = {
  plnPowerFactor: 0.85,
  chargerEfficiency: 0.9,
  nightLoadFactor: 0.4,
  degradationRateAc: 0.02,
  degradationRateMix: 0.029,
  degradationRateDc: 0.039,
  warrantySohThreshold: 70,
  depositRateAnnual: 0.04,
  defaultBatteryPriceMotorPerKwh: 3_500_000,
  defaultBatteryPriceMobilPerKwh: 2_200_000,
  wltpRealFactor: 0.82,
  penaltyAc: 0.1,
  penaltyRain: 0.08,
  penaltyLoad: 0.07,
  rooftopSolarEmissionKgKwh: 0.05,
  treeAbsorptionKgYear: 21,
  iceOilShare: 0.35,
  icePeriodicShare: 0.4,
  iceTireBrakeShare: 0.25,
};

export const DEFAULT_FINANCE_BATTERY_PARAMS: FinanceAndBatteryParams = {
  dpPct: 20,
  tenorMonths: 36,
  annualInterestPct: 6,
  applyPpnDtp: true,
  applyMotorSubsidy: false,
  chargingHabit: 'ac',
  ownershipYears: 5,
  targetBatteryYear: 8,
  batteryPricePerKwh: 0,
  batteryAnnualDropPct: 5,
  useDeposit: true,
  tripDistanceKm: 38,
  departureSocPct: 90,
  acOn: true,
  rainTraffic: false,
  fullLoad: false,
};

export function formatIdr(amount: number): string {
  const rounded = Math.round(amount);
  const absStr = Math.abs(rounded).toLocaleString('id-ID');
  return rounded < 0 ? `-Rp ${absStr}` : `Rp ${absStr}`;
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatMillionIdr(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const digits = abs >= 100_000_000 ? 0 : 1;
  return `${sign}Rp ${formatNumber(abs / 1_000_000, digits)} jt`;
}

export function formatPaybackMonths(months: number): string {
  if (months < 0) return '> 5 th';
  if (months === 0) return '< 1 bln';
  if (months >= 999) return '> 10 th';
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  if (yrs === 0) return `${rem} bln`;
  return rem === 0 ? `${yrs} th` : `${yrs} th ${rem} bln`;
}

export function resolvePlnTariffForVa(
  homePowerVa: number,
  tariffs: EnergyTariffDto[],
): EnergyTariffDto {
  const plnList = tariffs.filter((t) => t.category === 'PLN' && t.isActive);
  const matched = plnList.find((t) => {
    if (t.powerVaMin === null && t.powerVaMax === null) return false;
    const min = t.powerVaMin ?? 0;
    const max = t.powerVaMax ?? Number.MAX_SAFE_INTEGER;
    return homePowerVa >= min && homePowerVa <= max;
  });
  return (
    matched ??
    plnList[0] ?? {
      id: 'fallback-pln',
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
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function resolveFuelTariff(
  fuelCode: string,
  tariffs: EnergyTariffDto[],
): EnergyTariffDto {
  const fuels = tariffs.filter((t) => t.category === 'BBM' && t.isActive);
  return (
    fuels.find(
      (t) =>
        t.code.toLowerCase() === fuelCode.toLowerCase() ||
        t.displayName.toLowerCase() === fuelCode.toLowerCase(),
    ) ??
    fuels[0] ?? {
      id: 'fallback-bbm',
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
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function resolveSpkluTariff(tariffs: EnergyTariffDto[]): EnergyTariffDto {
  return (
    tariffs.find((t) => t.category === 'SPKLU_REF' && t.isActive) ?? {
      id: 'fallback-spklu',
      category: 'SPKLU_REF',
      code: 'SPKLU_NASIONAL',
      displayName: 'Tarif Acuan SPKLU Publik',
      subsidyType: 'Non-subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 2466,
      unitLabel: 'kWh',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 0.87,
      isActive: true,
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function recommendEvModel(
  evModels: EvModelDto[],
  vehicleType: VehicleType,
  budgetIdr: number,
): EvModelDto | undefined {
  const candidates = evModels.filter((m) => m.isActive && m.vehicleType === vehicleType);
  if (candidates.length === 0) return evModels[0];
  const withinBudget = candidates
    .filter((m) => m.otrPriceIdr <= budgetIdr)
    .sort((a, b) => b.wltpRangeKm - a.wltpRangeKm || a.otrPriceIdr - b.otrPriceIdr);
  if (withinBudget.length > 0) return withinBudget[0];
  return [...candidates].sort((a, b) => a.otrPriceIdr - b.otrPriceIdr)[0];
}

// Perbaikan BUG-03: hanya ubah kendaraan BBM pembanding bila kategori Motor <-> Mobil berubah
export function switchEvModelPreservingIce(
  current: SimulationInput,
  nextEv: EvModelDto,
  icePresets: IceVehiclePresetDto[],
): SimulationInput {
  if (nextEv.vehicleType === current.vehicleType) {
    return {
      ...current,
      evModelId: nextEv.id,
    };
  }
  const matchingPreset =
    icePresets.find((p) => p.vehicleType === nextEv.vehicleType && p.isActive) ?? icePresets[0];
  return {
    ...current,
    evModelId: nextEv.id,
    vehicleType: nextEv.vehicleType,
    icePresetId: matchingPreset?.id ?? null,
    customIceName: matchingPreset?.modelName ?? nextEv.comparableIceName,
    iceKmPerLiter: matchingPreset?.defaultKmPerLiter ?? (nextEv.vehicleType === 'Motor' ? 45 : 12.5),
    fuelCode: matchingPreset?.defaultFuelCode ?? current.fuelCode,
    homeChargerKw: nextEv.vehicleType === 'Motor' ? Math.min(current.homeChargerKw, 0.7) : Math.max(current.homeChargerKw, 2.2),
  };
}

function resolveIncentiveBenefit(
  ev: EvModelDto,
  incentives: EvIncentiveDto[],
  applyPpnDtp: boolean,
  applyMotorSubsidy: boolean,
): { ppnDtpAvailable: boolean; motorSubsidyAvailable: boolean; discountIdr: number } {
  const ppnPolicy = incentives.find((i) => i.code === 'PPN_DTP_10' && i.isActive);
  const motorPolicy = incentives.find((i) => i.code === 'SUBSIDI_MOTOR_5JT' && i.isActive);
  let discountIdr = 0;

  if (ev.vehicleType === 'Mobil' && ppnPolicy && applyPpnDtp) {
    discountIdr +=
      ppnPolicy.calculationType === 'percentage'
        ? ev.otrPriceIdr * (ppnPolicy.benefitValue / 100)
        : ppnPolicy.benefitValue;
  }
  if (ev.vehicleType === 'Motor' && motorPolicy && applyMotorSubsidy) {
    discountIdr +=
      motorPolicy.calculationType === 'percentage'
        ? ev.otrPriceIdr * (motorPolicy.benefitValue / 100)
        : motorPolicy.benefitValue;
  }

  return {
    ppnDtpAvailable: Boolean(ppnPolicy),
    motorSubsidyAvailable: Boolean(motorPolicy),
    discountIdr: Math.min(ev.otrPriceIdr, Math.max(0, Math.round(discountIdr))),
  };
}

export function calculateFullSimulation(
  input: SimulationInput,
  ref: ReferenceContext,
): FullCalculationResult {
  const sys = ref.systemParameters ?? DEFAULT_SYSTEM_PARAMETERS;
  const extra = { ...DEFAULT_FINANCE_BATTERY_PARAMS, ...input.extra };

  const ev =
    ref.evModels.find((m) => m.id === input.evModelId || m.slug === input.evModelId) ??
    ref.evModels.find((m) => m.vehicleType === input.vehicleType) ??
    ref.evModels[0];

  const icePreset =
    ref.icePresets.find(
      (p) => p.id === input.icePresetId || p.modelName === input.customIceName,
    ) ??
    ref.icePresets.find((p) => p.vehicleType === ev.vehicleType) ??
    ref.icePresets[0];

  const fuelTariff = resolveFuelTariff(input.fuelCode, ref.energyTariffs);
  const plnTariff = resolvePlnTariffForVa(input.homePowerVa, ref.energyTariffs);
  const spkluTariff = resolveSpkluTariff(ref.energyTariffs);

  const monthlyKm = Math.max(0, input.dailyDistanceKm * 30);
  const safeKmL = Math.max(1, input.iceKmPerLiter);

  // 1. BBM & perawatan konvensional (KEL2-54 & KEL2-73)
  const monthlyLiters = monthlyKm / safeKmL;
  const monthlyFuelCostIdr = monthlyLiters * fuelTariff.pricePerUnitIdr;
  const monthlyIceServiceCostIdr = monthlyKm * icePreset.serviceCostPerKmIdr;
  const monthlyOilCostIdr = monthlyIceServiceCostIdr * sys.iceOilShare;
  const monthlyPeriodicServiceCostIdr = monthlyIceServiceCostIdr * sys.icePeriodicShare;
  const monthlyTireBrakeCostIdr = monthlyIceServiceCostIdr * sys.iceTireBrakeShare;
  const annualStnkTaxIdr = icePreset.annualStnkTaxIdr;
  const monthlyIceOperationalIdr = monthlyFuelCostIdr + monthlyIceServiceCostIdr;
  const monthlyTotalWithTaxIdr = monthlyIceOperationalIdr + annualStnkTaxIdr / 12;

  // 2. Konsumsi energi EV & bauran tarif VA rumah vs SPKLU (KEL2-67, perbaikan BUG-05)
  const homeShare = Math.min(100, Math.max(0, input.homeChargingSharePct)) / 100;
  const monthlyKwh = (monthlyKm * ev.consumptionKwh100km) / 100;
  const homeKwh = monthlyKwh * homeShare;
  const publicKwh = monthlyKwh * (1 - homeShare);
  const monthlyHomeCostIdr = homeKwh * plnTariff.pricePerUnitIdr;
  const monthlyPublicCostIdr = publicKwh * spkluTariff.pricePerUnitIdr;
  const monthlyElectricityCostIdr = monthlyHomeCostIdr + monthlyPublicCostIdr;
  const blendedTariffPerKwhIdr =
    homeShare * plnTariff.pricePerUnitIdr + (1 - homeShare) * spkluTariff.pricePerUnitIdr;
  const costPerKmIdr = monthlyKm > 0 ? monthlyElectricityCostIdr / monthlyKm : 0;
  const monthlyEvServiceCostIdr = monthlyKm * ev.serviceCostPerKmIdr;
  const monthlyEvOperationalIdr = monthlyElectricityCostIdr + monthlyEvServiceCostIdr;

  // Perbaikan BUG-04: tangani saving negatif tanpa pembagian rusak
  const monthlyOperationalSavingIdr = monthlyIceOperationalIdr - monthlyEvOperationalIdr;
  const savingPct =
    monthlyIceOperationalIdr > 0
      ? Math.round((monthlyOperationalSavingIdr / monthlyIceOperationalIdr) * 100)
      : 0;

  // 3. Pembelian awal & kredit
  const incentiveInfo = resolveIncentiveBenefit(
    ev,
    ref.evIncentives,
    extra.applyPpnDtp,
    extra.applyMotorSubsidy,
  );
  const netEvPriceIdr = Math.max(0, ev.otrPriceIdr - incentiveInfo.discountIdr);
  const dpRatio = Math.min(0.9, Math.max(0.05, extra.dpPct / 100));
  const downPaymentIdr = Math.round(netEvPriceIdr * dpRatio);
  const loanPrincipalIdr = Math.max(0, netEvPriceIdr - downPaymentIdr);
  const tenorMonths = Math.max(1, extra.tenorMonths);
  const totalInterestIdr = Math.round(
    loanPrincipalIdr * (Math.max(0, extra.annualInterestPct) / 100) * (tenorMonths / 12),
  );
  const totalLoanPayableIdr = loanPrincipalIdr + totalInterestIdr;
  const monthlyInstallmentIdr = Math.round(totalLoanPayableIdr / tenorMonths);
  const installmentCoveragePct =
    monthlyInstallmentIdr > 0
      ? Math.max(0, Math.min(100, Math.round((monthlyOperationalSavingIdr / monthlyInstallmentIdr) * 100)))
      : 0;

  // 4. Degradasi baterai (SoH 10 tahun)
  const rateByHabit = {
    ac: sys.degradationRateAc,
    mix: sys.degradationRateMix,
    dc: sys.degradationRateDc,
  };
  const seriesYears: string[] = [];
  const seriesAc: number[] = [];
  const seriesMix: number[] = [];
  const seriesDc: number[] = [];
  for (let yr = 0; yr <= 10; yr += 1) {
    seriesYears.push(`Th ${yr}`);
    seriesAc.push(Number((100 * Math.pow(1 - rateByHabit.ac, yr)).toFixed(1)));
    seriesMix.push(Number((100 * Math.pow(1 - rateByHabit.mix, yr)).toFixed(1)));
    seriesDc.push(Number((100 * Math.pow(1 - rateByHabit.dc, yr)).toFixed(1)));
  }
  const targetOwnYr = Math.min(10, Math.max(1, Math.round(extra.ownershipYears)));
  const activeSeries =
    extra.chargingHabit === 'ac' ? seriesAc : extra.chargingHabit === 'mix' ? seriesMix : seriesDc;
  const sohAtOwnershipYear = activeSeries[targetOwnYr];
  const effectiveRangeKm = Math.round((ev.wltpRangeKm * sohAtOwnershipYear) / 100);
  const degradationStatus =
    sohAtOwnershipYear >= 80
      ? 'sehat'
      : sohAtOwnershipYear >= sys.warrantySohThreshold
        ? 'menurun'
        : 'dibawah_garansi';

  // 5. Dana cadangan baterai (Sinking Fund)
  const defaultBattPerKwh =
    ev.replacementBatteryPriceIdr && ev.batteryKwh > 0
      ? Math.round(ev.replacementBatteryPriceIdr / ev.batteryKwh)
      : ev.vehicleType === 'Motor'
        ? sys.defaultBatteryPriceMotorPerKwh
        : sys.defaultBatteryPriceMobilPerKwh;
  const effectiveBatteryPricePerKwhIdr =
    extra.batteryPricePerKwh > 0 ? extra.batteryPricePerKwh : defaultBattPerKwh;
  const targetBattYr = Math.min(15, Math.max(3, Math.round(extra.targetBatteryYear)));
  const dropRate = Math.min(0.25, Math.max(0, extra.batteryAnnualDropPct / 100));
  const futureReplacementCostIdr = Math.round(
    ev.batteryKwh * effectiveBatteryPricePerKwhIdr * Math.pow(1 - dropRate, targetBattYr),
  );
  const nMonths = targetBattYr * 12;
  const monthlyDepositRate = sys.depositRateAnnual / 12;
  const monthlyReserveIdr =
    extra.useDeposit && monthlyDepositRate > 0
      ? Math.round(
          (futureReplacementCostIdr * monthlyDepositRate) /
            (Math.pow(1 + monthlyDepositRate, nMonths) - 1),
        )
      : Math.round(futureReplacementCostIdr / nMonths);
  const sinkingLabels: string[] = [];
  const sinkingAccumulated: number[] = [];
  const sinkingTarget: number[] = [];
  for (let yr = 0; yr <= targetBattYr; yr += 1) {
    sinkingLabels.push(`Th ${yr}`);
    const m = yr * 12;
    const acc =
      m === 0
        ? 0
        : extra.useDeposit && monthlyDepositRate > 0
          ? monthlyReserveIdr * ((Math.pow(1 + monthlyDepositRate, m) - 1) / monthlyDepositRate)
          : monthlyReserveIdr * m;
    sinkingAccumulated.push(Math.round(acc));
    sinkingTarget.push(futureReplacementCostIdr);
  }

  // 6. Home Charging Planner (perbaikan BUG-07: gunakan cos phi = 0.85 dari system_parameters)
  const effectiveBaseLoadKw = input.nightChargingEnabled
    ? Number((input.baseLoadKw * sys.nightLoadFactor).toFixed(2))
    : input.baseLoadKw;
  const totalLoadKw = Number((effectiveBaseLoadKw + input.homeChargerKw).toFixed(2));
  const maxCapacityKw = Number(((input.homePowerVa * sys.plnPowerFactor) / 1000).toFixed(2));
  const usageRatio = maxCapacityKw > 0 ? totalLoadKw / maxCapacityKw : 1;
  const homePowerStatus = usageRatio < 0.7 ? 'aman' : usageRatio < 0.95 ? 'ketat' : 'bahaya';
  const safeCharger = Math.max(0.1, input.homeChargerKw);
  const fullChargeHours = Number(
    (ev.batteryKwh / (safeCharger * sys.chargerEfficiency)).toFixed(1),
  );

  const plnTiersSorted = ref.energyTariffs
    .filter((t) => t.category === 'PLN' && t.isActive && (t.powerVaMin ?? 0) > input.homePowerVa)
    .sort((a, b) => (a.powerVaMin ?? 0) - (b.powerVaMin ?? 0));
  const recommendedTier = plnTiersSorted.find((t) => {
    const tierVa = t.powerVaMin ?? 0;
    const tierMaxKw = (tierVa * sys.plnPowerFactor) / 1000;
    return totalLoadKw / tierMaxKw < 0.75;
  });

  // 7. Simulator Jarak Tempuh Riil
  const conditionFactor = Number(
    Math.max(
      0.4,
      1 -
        (extra.acOn ? sys.penaltyAc : 0) -
        (extra.rainTraffic ? sys.penaltyRain : 0) -
        (extra.fullLoad ? sys.penaltyLoad : 0),
    ).toFixed(2),
  );
  const realRangeKm = Math.max(
    1,
    Math.round(ev.wltpRangeKm * sys.wltpRealFactor * conditionFactor * (extra.departureSocPct / 100)),
  );
  const tripUsageRatio = extra.tripDistanceKm / realRangeKm;
  const rangeStatus =
    tripUsageRatio < 0.7 ? 'cukup' : tripUsageRatio < 0.95 ? 'mepet' : 'tidak_cukup';
  const remainingKm = realRangeKm - extra.tripDistanceKm;
  const requiredChargingStops =
    tripUsageRatio < 0.95
      ? 0
      : Math.max(1, Math.ceil(extra.tripDistanceKm / Math.max(1, realRangeKm * 0.8)) - 1);

  // 8. TCO 5 Tahun (60 bulan) & Titik Balik Modal (perbaikan BUG-01 & BUG-06)
  const iceAcquisitionIdr = input.pathway === 'B' ? 0 : ev.comparableIcePriceIdr;
  const resaleDeductionIdr = input.pathway === 'B' ? icePreset.estimatedResalePriceIdr : 0;
  const evAcquisitionIdr = Math.max(0, netEvPriceIdr - resaleDeductionIdr);

  const iceComponents = {
    acquisitionIdr: Math.round(iceAcquisitionIdr),
    energyIdr: Math.round(monthlyFuelCostIdr * 60),
    maintenanceIdr: Math.round(monthlyIceServiceCostIdr * 60),
    taxIdr: Math.round(annualStnkTaxIdr * 5),
    batteryReserveIdr: 0,
    total5YearsIdr: 0,
  };
  iceComponents.total5YearsIdr =
    iceComponents.acquisitionIdr +
    iceComponents.energyIdr +
    iceComponents.maintenanceIdr +
    iceComponents.taxIdr;

  const evComponents = {
    acquisitionIdr: Math.round(evAcquisitionIdr),
    energyIdr: Math.round(monthlyElectricityCostIdr * 60),
    maintenanceIdr: Math.round(monthlyEvServiceCostIdr * 60),
    taxIdr: Math.round(ev.annualPkbTaxIdr * 5),
    batteryReserveIdr: Math.round(monthlyReserveIdr * 60),
    total5YearsIdr: 0,
  };
  evComponents.total5YearsIdr =
    evComponents.acquisitionIdr +
    evComponents.energyIdr +
    evComponents.maintenanceIdr +
    evComponents.taxIdr +
    evComponents.batteryReserveIdr;

  const iceCumulative60: number[] = [];
  const evCumulative60: number[] = [];
  const monthlyIceTcoStep = monthlyTotalWithTaxIdr;
  const monthlyEvTcoStep = monthlyEvOperationalIdr + monthlyReserveIdr + ev.annualPkbTaxIdr / 12;

  for (let m = 0; m <= 60; m += 1) {
    iceCumulative60.push(Math.round(iceAcquisitionIdr + m * monthlyIceTcoStep));
    evCumulative60.push(Math.round(evAcquisitionIdr + m * monthlyEvTcoStep));
  }

  const paybackMonthIndex = evCumulative60.findIndex((evVal, idx) => evVal <= iceCumulative60[idx]);
  const isPaybackReached = paybackMonthIndex >= 0;
  const paybackLabel = formatPaybackMonths(paybackMonthIndex);

  // 9. Emisi Karbon Tahunan
  const annualIceCo2Kg = Math.round(monthlyLiters * 12 * fuelTariff.emissionKgCo2PerUnit);
  const gridOrSolarEmissionFactor = input.solarRooftopEnabled
    ? sys.rooftopSolarEmissionKgKwh
    : plnTariff.emissionKgCo2PerUnit;
  const annualEvCo2Kg = Math.round(monthlyKwh * 12 * gridOrSolarEmissionFactor);
  const annualReductionCo2Kg = annualIceCo2Kg - annualEvCo2Kg;
  const fiveYearReductionCo2Kg = annualReductionCo2Kg * 5;
  const reductionPct =
    annualIceCo2Kg > 0 ? Math.round((annualReductionCo2Kg / annualIceCo2Kg) * 100) : 0;
  const equivalentTrees = Math.max(
    0,
    Math.round(annualReductionCo2Kg / Math.max(1, sys.treeAbsorptionKgYear)),
  );

  return {
    ev,
    icePreset,
    fuelTariff,
    plnTariff,
    spkluTariff,
    monthlyKm,
    ice: {
      monthlyLiters: Number(monthlyLiters.toFixed(1)),
      monthlyFuelCostIdr: Math.round(monthlyFuelCostIdr),
      monthlyServiceCostIdr: Math.round(monthlyIceServiceCostIdr),
      monthlyOilCostIdr: Math.round(monthlyOilCostIdr),
      monthlyPeriodicServiceCostIdr: Math.round(monthlyPeriodicServiceCostIdr),
      monthlyTireBrakeCostIdr: Math.round(monthlyTireBrakeCostIdr),
      annualStnkTaxIdr: Math.round(annualStnkTaxIdr),
      monthlyTotalWithTaxIdr: Math.round(monthlyTotalWithTaxIdr),
      monthlyOperationalIdr: Math.round(monthlyIceOperationalIdr),
      annualFuelCostIdr: Math.round(monthlyFuelCostIdr * 12),
      annualTotalIdr: Math.round(monthlyTotalWithTaxIdr * 12),
    },
    evEnergy: {
      monthlyKwh: Number(monthlyKwh.toFixed(1)),
      homeKwh: Number(homeKwh.toFixed(1)),
      publicKwh: Number(publicKwh.toFixed(1)),
      blendedTariffPerKwhIdr: Number(blendedTariffPerKwhIdr.toFixed(1)),
      monthlyHomeCostIdr: Math.round(monthlyHomeCostIdr),
      monthlyPublicCostIdr: Math.round(monthlyPublicCostIdr),
      monthlyElectricityCostIdr: Math.round(monthlyElectricityCostIdr),
      costPerKmIdr: Math.round(costPerKmIdr),
      monthlyServiceCostIdr: Math.round(monthlyEvServiceCostIdr),
      monthlyOperationalIdr: Math.round(monthlyEvOperationalIdr),
    },
    comparison: {
      monthlyOperationalSavingIdr: Math.round(monthlyOperationalSavingIdr),
      savingPct,
      isNegativeSaving: monthlyOperationalSavingIdr < 0,
    },
    purchase: {
      ppnDtpAvailable: incentiveInfo.ppnDtpAvailable,
      motorSubsidyAvailable: incentiveInfo.motorSubsidyAvailable,
      incentiveDiscountIdr: incentiveInfo.discountIdr,
      netEvPriceIdr,
      downPaymentIdr,
      loanPrincipalIdr,
      totalInterestIdr,
      totalPaidWithCreditIdr: downPaymentIdr + totalLoanPayableIdr,
      monthlyInstallmentIdr,
      installmentCoveragePct,
    },
    degradation: {
      sohAtOwnershipYear,
      effectiveRangeKm,
      status: degradationStatus,
      seriesYears,
      seriesAc,
      seriesMix,
      seriesDc,
    },
    sinkingFund: {
      effectiveBatteryPricePerKwhIdr,
      futureReplacementCostIdr,
      monthlyReserveIdr,
      costPerKmIdr: monthlyKm > 0 ? Math.round(monthlyReserveIdr / monthlyKm) : 0,
      seriesLabels: sinkingLabels,
      seriesAccumulated: sinkingAccumulated,
      seriesTargetLine: sinkingTarget,
    },
    homePower: {
      effectiveBaseLoadKw,
      totalLoadKw,
      maxCapacityKw,
      usageRatio: Number(usageRatio.toFixed(3)),
      status: homePowerStatus,
      fullChargeHours,
      recommendedUpgradeVa: recommendedTier?.powerVaMin ?? null,
      recommendedUpgradeFeeIdr: recommendedTier?.upgradeFeeIdr ?? null,
    },
    rangeSim: {
      conditionFactor,
      realRangeKm,
      usageRatio: Number(tripUsageRatio.toFixed(3)),
      remainingKm,
      status: rangeStatus,
      requiredChargingStops,
    },
    tco: {
      iceComponents,
      evComponents,
      tcoDifferenceIdr: iceComponents.total5YearsIdr - evComponents.total5YearsIdr,
      paybackMonthIndex,
      paybackLabel,
      isPaybackReached,
      iceCumulative60,
      evCumulative60,
    },
    emissions: {
      annualIceCo2Kg,
      annualEvCo2Kg,
      annualReductionCo2Kg,
      fiveYearReductionCo2Kg,
      reductionPct,
      equivalentTrees,
    },
  };
}

export function calculateHaversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function estimateUrbanTravelMinutes(distanceKm: number): number {
  return Math.max(3, Math.round((distanceKm / 24) * 60));
}
