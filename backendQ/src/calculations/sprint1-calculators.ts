import type {
  ComparisonInput,
  ComparisonResult,
  EvEnergyInput,
  EvEnergyResult,
  FacilityRouteInput,
  FacilityRouteResult,
  FuelCostInput,
  FuelCostResult,
  IceMaintenanceInput,
  IceMaintenanceResult,
  MaintenanceComponentItem,
  MaintenanceComparisonData,
} from "../types/domain.js";
import {
  ICE_VEHICLE_PRESETS,
  EV_MAINTENANCE_PRESETS,
} from "../data/reference-presets.js";

// PBI 01: Kalkulator Biaya BBM Kendaraan Konvensional
export function calculateFuelCost(input: Partial<FuelCostInput>): {
  ok: boolean;
  data?: FuelCostResult;
  errors?: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const vehicleCategory = input.vehicleCategory;
  if (vehicleCategory !== "Motor" && vehicleCategory !== "Mobil") {
    errors.vehicleCategory = "Jenis kendaraan wajib dipilih (Motor atau Mobil).";
  }

  const fuelPricePerLiter = Number(input.fuelPricePerLiter);
  if (!Number.isFinite(fuelPricePerLiter) || fuelPricePerLiter <= 0 || fuelPricePerLiter > 100000) {
    errors.fuelPricePerLiter = "Harga BBM per liter wajib berupa angka positif (> Rp 0).";
  }

  const kmPerLiter = Number(input.kmPerLiter);
  if (!Number.isFinite(kmPerLiter) || kmPerLiter <= 0 || kmPerLiter > 150) {
    errors.kmPerLiter = "Konsumsi BBM wajib berupa angka positif antara 0,5 s.d. 150 km/liter.";
  }

  const distanceInputKm = Number(input.distanceInputKm);
  if (!Number.isFinite(distanceInputKm) || distanceInputKm <= 0 || distanceInputKm > 30000) {
    errors.distanceInputKm = "Jarak tempuh wajib berupa angka lebih besar dari 0 km.";
  }

  const distancePeriod = input.distancePeriod === "MONTHLY" ? "MONTHLY" : "DAILY";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const dailyDistanceKm =
    distancePeriod === "MONTHLY" ? distanceInputKm / 30 : distanceInputKm;
  const monthlyDistanceKm =
    distancePeriod === "MONTHLY" ? distanceInputKm : distanceInputKm * 30;
  const annualDistanceKm = dailyDistanceKm * 365;

  const dailyLiters = dailyDistanceKm / kmPerLiter;
  const monthlyLiters = monthlyDistanceKm / kmPerLiter;
  const annualLiters = annualDistanceKm / kmPerLiter;

  const dailyCostIdr = Math.round(dailyLiters * fuelPricePerLiter);
  const monthlyCostIdr = Math.round(monthlyLiters * fuelPricePerLiter);
  const annualCostIdr = Math.round(annualLiters * fuelPricePerLiter);
  const costPerKmIdr = Math.round(fuelPricePerLiter / kmPerLiter);

  return {
    ok: true,
    data: {
      vehicleCategory: vehicleCategory!,
      vehiclePresetName: input.vehiclePresetName || `Kendaraan ${vehicleCategory}`,
      fuelTypeCode: input.fuelTypeCode || "BBM_PERTALITE_RON90",
      fuelPricePerLiter: Math.round(fuelPricePerLiter),
      kmPerLiter: Number(kmPerLiter.toFixed(2)),
      dailyDistanceKm: Number(dailyDistanceKm.toFixed(1)),
      monthlyDistanceKm: Math.round(monthlyDistanceKm),
      annualDistanceKm: Math.round(annualDistanceKm),
      dailyLiters: Number(dailyLiters.toFixed(2)),
      monthlyLiters: Number(monthlyLiters.toFixed(2)),
      annualLiters: Number(annualLiters.toFixed(1)),
      dailyCostIdr,
      monthlyCostIdr,
      annualCostIdr,
      costPerKmIdr,
    },
  };
}

// PBI 02: Kalkulator Biaya Perawatan Kendaraan Konvensional
export function calculateIceMaintenance(input: Partial<IceMaintenanceInput>): {
  ok: boolean;
  data?: IceMaintenanceResult;
  errors?: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const vehicleCategory = input.vehicleCategory;
  if (vehicleCategory !== "Motor" && vehicleCategory !== "Mobil") {
    errors.vehicleCategory = "Jenis kendaraan wajib dipilih (Motor atau Mobil).";
  }

  const dailyDistanceKm = Number(input.dailyDistanceKm);
  if (!Number.isFinite(dailyDistanceKm) || dailyDistanceKm <= 0 || dailyDistanceKm > 1000) {
    errors.dailyDistanceKm = "Jarak tempuh harian wajib berupa angka antara 1 s.d. 1.000 km.";
  }

  const ownershipYears = Number(input.ownershipYears);
  if (!Number.isFinite(ownershipYears) || ownershipYears < 1 || ownershipYears > 15) {
    errors.ownershipYears = "Periode kepemilikan wajib berupa angka antara 1 s.d. 15 tahun.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const preset =
    ICE_VEHICLE_PRESETS.find((p) => p.id === input.vehiclePresetId) ||
    ICE_VEHICLE_PRESETS.find((p) => p.category === vehicleCategory) ||
    ICE_VEHICLE_PRESETS[0];

  // Faktor skala intensitas pemakaian (acuan normal 40 km/hari = 14.600 km/tahun)
  const annualDistanceKm = Math.round(dailyDistanceKm * 365);
  const usageFactor = Math.max(0.4, annualDistanceKm / 14600);

  const oilAnnual = Math.round(preset.annualOilAndFilterIdr * usageFactor);
  const sparkAnnual = Math.round(preset.annualSparkPlugIdr * usageFactor);
  const serviceAnnual = Math.round(preset.annualPeriodicServiceIdr * usageFactor);
  const tiresAnnual = Math.round(preset.annualTiresAndBrakesIdr * usageFactor);
  const stnkAnnual =
    input.customAnnualStnkTaxIdr !== undefined && Number(input.customAnnualStnkTaxIdr) >= 0
      ? Math.round(Number(input.customAnnualStnkTaxIdr))
      : preset.annualStnkTaxIdr;

  const components: MaintenanceComponentItem[] = [
    {
      id: "oil_filter",
      name: "Oli Mesin, Oli Transmisi & Filter",
      description: "Penggantian pelumas rutin dan saringan oli berdasarkan jarak tempuh",
      annualCostIdr: oilAnnual,
      monthlyCostIdr: Math.round(oilAnnual / 12),
      enabled: input.includeOilAndFilter !== false,
    },
    {
      id: "spark_ignition",
      name: "Busi, Filter Udara & Sistem Pengapian",
      description: "Penggantian busi, pembersihan injektor, dan saringan udara",
      annualCostIdr: sparkAnnual,
      monthlyCostIdr: Math.round(sparkAnnual / 12),
      enabled: input.includeSparkPlugAndIgnition !== false,
    },
    {
      id: "periodic_service",
      name: "Jasa Servis Berkala & Tune-Up",
      description: "Biaya pemeriksaan berkala di bengkel untuk mesin konvensional",
      annualCostIdr: serviceAnnual,
      monthlyCostIdr: Math.round(serviceAnnual / 12),
      enabled: input.includePeriodicService !== false,
    },
    {
      id: "tires_brakes",
      name: "Kampas Rem, Ban & Sabuk Penggerak (CVT/Belt)",
      description: "Komponen aus berkala akibat gesekan mekanis",
      annualCostIdr: tiresAnnual,
      monthlyCostIdr: Math.round(tiresAnnual / 12),
      enabled: input.includeTiresAndBrakes !== false,
    },
    {
      id: "stnk_tax",
      name: "Pajak STNK Tahunan (PKB)",
      description: "Kewajiban pajak tahunan kendaraan konvensional",
      annualCostIdr: stnkAnnual,
      monthlyCostIdr: Math.round(stnkAnnual / 12),
      enabled: input.includeAnnualStnkTax !== false,
    },
  ];

  const activeComponents = components.filter((c) => c.enabled);
  const annualMaintenanceIdr = activeComponents.reduce(
    (sum, item) => sum + item.annualCostIdr,
    0
  );
  const monthlyMaintenanceIdr = Math.round(annualMaintenanceIdr / 12);
  const totalOwnershipMaintenanceIdr = Math.round(annualMaintenanceIdr * ownershipYears);
  const costPerKmIdr =
    annualDistanceKm > 0 ? Math.round(annualMaintenanceIdr / annualDistanceKm) : 0;

  // PBI 02 / KEL2-55: Estimasi Komparasi Biaya Perawatan BBM vs EV
  const evPreset =
    EV_MAINTENANCE_PRESETS.find((p) => p.id === input.evPresetId) ||
    EV_MAINTENANCE_PRESETS.find((p) => p.category === vehicleCategory) ||
    EV_MAINTENANCE_PRESETS[0];

  const evServiceAnnual =
    input.customEvAnnualServiceIdr !== undefined && Number(input.customEvAnnualServiceIdr) >= 0
      ? Math.round(Number(input.customEvAnnualServiceIdr))
      : Math.round(evPreset.annualPeriodicServiceIdr * usageFactor);
  const evTiresAnnual = Math.round(evPreset.annualTiresAndBrakesIdr * usageFactor);
  const evBatteryCheckAnnual = Math.round(evPreset.annualBatteryInspectionIdr * usageFactor);
  const evStnkAnnual = evPreset.annualStnkTaxIdr;

  const evComponents: MaintenanceComponentItem[] = [
    {
      id: "ev_service",
      name: "Jasa Servis Motor Listrik, Inverter & Sistem Pendingin",
      description: "Inspeksi powertrain elektrik tanpa penggantian oli/filter mesin",
      annualCostIdr: evServiceAnnual,
      monthlyCostIdr: Math.round(evServiceAnnual / 12),
      enabled: true,
    },
    {
      id: "ev_tires_brakes",
      name: "Ban & Kampas Rem (Regenerative Braking)",
      description: "Kampas rem lebih awet berkat pengereman regeneratif",
      annualCostIdr: evTiresAnnual,
      monthlyCostIdr: Math.round(evTiresAnnual / 12),
      enabled: true,
    },
    {
      id: "ev_battery_check",
      name: "Inspeksi Rutin Baterai & Soket Kelistrikan",
      description: "Diagnostik State-of-Health (SoH) baterai dan soket charging",
      annualCostIdr: evBatteryCheckAnnual,
      monthlyCostIdr: Math.round(evBatteryCheckAnnual / 12),
      enabled: true,
    },
    {
      id: "ev_stnk_tax",
      name: "Pajak STNK Tahunan EV (PKB Keringanan/Tarif Rendah)",
      description: "Insentif bebas/keringanan PKB untuk kendaraan listrik murni",
      annualCostIdr: evStnkAnnual,
      monthlyCostIdr: Math.round(evStnkAnnual / 12),
      enabled: true,
    },
  ];

  const evAnnualMaintenanceIdr = evComponents.reduce((sum, c) => sum + c.annualCostIdr, 0);
  const evMonthlyMaintenanceIdr = Math.round(evAnnualMaintenanceIdr / 12);
  const evTotalOwnershipMaintenanceIdr = Math.round(evAnnualMaintenanceIdr * ownershipYears);

  const annualSavingsIdr = Math.max(0, annualMaintenanceIdr - evAnnualMaintenanceIdr);
  const monthlySavingsIdr = Math.max(0, monthlyMaintenanceIdr - evMonthlyMaintenanceIdr);
  const totalOwnershipSavingsIdr = Math.max(
    0,
    totalOwnershipMaintenanceIdr - evTotalOwnershipMaintenanceIdr
  );
  const savingsPercentage =
    annualMaintenanceIdr > 0
      ? Math.round((annualSavingsIdr / annualMaintenanceIdr) * 100)
      : 0;

  const evComparison: MaintenanceComparisonData = {
    evPresetName: evPreset.name,
    evAnnualMaintenanceIdr,
    evMonthlyMaintenanceIdr,
    evTotalOwnershipMaintenanceIdr,
    annualSavingsIdr,
    monthlySavingsIdr,
    totalOwnershipSavingsIdr,
    savingsPercentage,
    evComponents,
  };

  return {
    ok: true,
    data: {
      vehicleCategory: vehicleCategory!,
      ownershipYears: Math.round(ownershipYears),
      dailyDistanceKm: Number(dailyDistanceKm.toFixed(1)),
      annualDistanceKm,
      components,
      monthlyMaintenanceIdr,
      annualMaintenanceIdr,
      totalOwnershipMaintenanceIdr,
      costPerKmIdr,
      evComparison,
    },
  };
}

// PBI 07: Simulator Konsumsi Energi EV
export function calculateEvEnergy(input: Partial<EvEnergyInput>): {
  ok: boolean;
  data?: EvEnergyResult;
  errors?: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const consumptionKwh100km = Number(input.consumptionKwh100km);
  if (!Number.isFinite(consumptionKwh100km) || consumptionKwh100km <= 0 || consumptionKwh100km > 100) {
    errors.consumptionKwh100km =
      "Konsumsi energi EV wajib berupa angka antara 0,1 s.d. 100 kWh/100 km.";
  }

  const dailyDistanceKm = Number(input.dailyDistanceKm);
  if (!Number.isFinite(dailyDistanceKm) || dailyDistanceKm <= 0 || dailyDistanceKm > 2000) {
    errors.dailyDistanceKm = "Jarak perjalanan harian wajib lebih besar dari 0 km.";
  }

  const homeChargingPercentage =
    input.homeChargingPercentage !== undefined ? Number(input.homeChargingPercentage) : 85;
  if (
    !Number.isFinite(homeChargingPercentage) ||
    homeChargingPercentage < 0 ||
    homeChargingPercentage > 100
  ) {
    errors.homeChargingPercentage = "Porsi pengisian di rumah harus antara 0% s.d. 100%.";
  }

  const homeTariffPerKwh =
    input.homeTariffPerKwh !== undefined ? Number(input.homeTariffPerKwh) : 1444.7;
  if (!Number.isFinite(homeTariffPerKwh) || homeTariffPerKwh <= 0) {
    errors.homeTariffPerKwh = "Tarif listrik rumah harus lebih besar dari Rp 0/kWh.";
  }

  const spkluTariffPerKwh =
    input.spkluTariffPerKwh !== undefined ? Number(input.spkluTariffPerKwh) : 2466;
  if (!Number.isFinite(spkluTariffPerKwh) || spkluTariffPerKwh <= 0) {
    errors.spkluTariffPerKwh = "Tarif SPKLU harus lebih besar dari Rp 0/kWh.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const monthlyDistanceKm = dailyDistanceKm * 30;
  const annualDistanceKm = dailyDistanceKm * 365;

  const dailyKwh = (dailyDistanceKm * consumptionKwh100km) / 100;
  const monthlyKwh = (monthlyDistanceKm * consumptionKwh100km) / 100;
  const annualKwh = (annualDistanceKm * consumptionKwh100km) / 100;

  const spkluChargingPercentage = 100 - homeChargingPercentage;
  const homeShare = homeChargingPercentage / 100;
  const spkluShare = spkluChargingPercentage / 100;

  const homeMonthlyKwh = monthlyKwh * homeShare;
  const spkluMonthlyKwh = monthlyKwh * spkluShare;

  const weightedTariffPerKwh =
    homeShare * homeTariffPerKwh + spkluShare * spkluTariffPerKwh;

  const homeCostMonthly = Math.round(homeMonthlyKwh * homeTariffPerKwh);
  const spkluCostMonthly = Math.round(spkluMonthlyKwh * spkluTariffPerKwh);
  const totalCostMonthly = Math.round(monthlyKwh * weightedTariffPerKwh);
  const totalCostDaily = Math.round(dailyKwh * weightedTariffPerKwh);
  const totalCostAnnual = Math.round(annualKwh * weightedTariffPerKwh);
  const costPerKm =
    monthlyDistanceKm > 0 ? Math.round(totalCostMonthly / monthlyDistanceKm) : 0;

  return {
    ok: true,
    data: {
      dailyDistanceKm: Number(dailyDistanceKm.toFixed(1)),
      monthlyDistanceKm: Math.round(monthlyDistanceKm),
      annualDistanceKm: Math.round(annualDistanceKm),
      consumptionKwh100km: Number(consumptionKwh100km.toFixed(2)),
      dailyKwh: Number(dailyKwh.toFixed(2)),
      monthlyKwh: Number(monthlyKwh.toFixed(2)),
      annualKwh: Number(annualKwh.toFixed(1)),
      homeChargingPercentage: Math.round(homeChargingPercentage),
      spkluChargingPercentage: Math.round(spkluChargingPercentage),
      homeMonthlyKwh: Number(homeMonthlyKwh.toFixed(2)),
      spkluMonthlyKwh: Number(spkluMonthlyKwh.toFixed(2)),
      weightedTariffPerKwh: Math.round(weightedTariffPerKwh),
      homeCostMonthly,
      spkluCostMonthly,
      totalCostDaily,
      totalCostMonthly,
      totalCostAnnual,
      costPerKm,
    },
  };
}

// PBI 08: Kalkulator Biaya Operasional BBM vs Listrik
export function calculateComparison(input: Partial<ComparisonInput>): {
  ok: boolean;
  data?: ComparisonResult;
  errors?: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const dailyDistanceKm = Number(input.dailyDistanceKm);
  if (!Number.isFinite(dailyDistanceKm) || dailyDistanceKm <= 0 || dailyDistanceKm > 2000) {
    errors.dailyDistanceKm = "Jarak tempuh harian harus lebih besar dari 0 km.";
  }

  const iceKmPerLiter = Number(input.iceKmPerLiter);
  if (!Number.isFinite(iceKmPerLiter) || iceKmPerLiter <= 0 || iceKmPerLiter > 150) {
    errors.iceKmPerLiter = "Konsumsi BBM harus lebih besar dari 0 km/liter.";
  }

  const fuelPricePerLiter = Number(input.fuelPricePerLiter);
  if (!Number.isFinite(fuelPricePerLiter) || fuelPricePerLiter <= 0) {
    errors.fuelPricePerLiter = "Harga BBM harus lebih besar dari Rp 0/liter.";
  }

  const evConsumptionKwh100km = Number(input.evConsumptionKwh100km);
  if (
    !Number.isFinite(evConsumptionKwh100km) ||
    evConsumptionKwh100km <= 0 ||
    evConsumptionKwh100km > 100
  ) {
    errors.evConsumptionKwh100km = "Konsumsi energi EV harus lebih besar dari 0 kWh/100 km.";
  }

  const homeTariffPerKwh = Number(input.homeTariffPerKwh);
  if (!Number.isFinite(homeTariffPerKwh) || homeTariffPerKwh <= 0) {
    errors.homeTariffPerKwh = "Tarif listrik rumah harus lebih besar dari Rp 0/kWh.";
  }

  const spkluTariffPerKwh = Number(input.spkluTariffPerKwh);
  if (!Number.isFinite(spkluTariffPerKwh) || spkluTariffPerKwh <= 0) {
    errors.spkluTariffPerKwh = "Tarif SPKLU harus lebih besar dari Rp 0/kWh.";
  }

  const homeChargingPercentage =
    input.homeChargingPercentage !== undefined ? Number(input.homeChargingPercentage) : 85;
  if (
    !Number.isFinite(homeChargingPercentage) ||
    homeChargingPercentage < 0 ||
    homeChargingPercentage > 100
  ) {
    errors.homeChargingPercentage = "Porsi pengisian di rumah harus antara 0% s.d. 100%.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const monthlyDistanceKm = dailyDistanceKm * 30;
  const annualDistanceKm = dailyDistanceKm * 365;

  const bbmDailyLiters = dailyDistanceKm / iceKmPerLiter;
  const bbmMonthlyLiters = monthlyDistanceKm / iceKmPerLiter;
  const bbmAnnualLiters = annualDistanceKm / iceKmPerLiter;

  const bbmDailyCost = Math.round(bbmDailyLiters * fuelPricePerLiter);
  const bbmMonthlyCost = Math.round(bbmMonthlyLiters * fuelPricePerLiter);
  const bbmAnnualCost = Math.round(bbmAnnualLiters * fuelPricePerLiter);
  const bbmCostPerKm = Math.round(fuelPricePerLiter / iceKmPerLiter);

  const evRes = calculateEvEnergy({
    consumptionKwh100km: evConsumptionKwh100km,
    dailyDistanceKm,
    homeChargingPercentage,
    homeTariffPerKwh,
    spkluTariffPerKwh,
  });

  const evData = evRes.data!;
  const evDailyCost = evData.totalCostDaily;
  const evMonthlyCost = evData.totalCostMonthly;
  const evAnnualCost = evData.totalCostAnnual;

  const costDifferenceDaily = bbmDailyCost - evDailyCost;
  const costDifferenceMonthly = bbmMonthlyCost - evMonthlyCost;
  const costDifferenceAnnual = bbmAnnualCost - evAnnualCost;

  const percentageDifference =
    bbmMonthlyCost > 0
      ? Math.round((costDifferenceMonthly / bbmMonthlyCost) * 100)
      : 0;

  const status =
    costDifferenceMonthly > 0
      ? "SAVING"
      : costDifferenceMonthly < 0
      ? "MORE_EXPENSIVE"
      : "EQUAL";

  return {
    ok: true,
    data: {
      dailyDistanceKm: Number(dailyDistanceKm.toFixed(1)),
      monthlyDistanceKm: Math.round(monthlyDistanceKm),
      annualDistanceKm: Math.round(annualDistanceKm),
      bbmDailyLiters: Number(bbmDailyLiters.toFixed(2)),
      bbmMonthlyLiters: Number(bbmMonthlyLiters.toFixed(2)),
      bbmAnnualLiters: Number(bbmAnnualLiters.toFixed(1)),
      bbmDailyCost,
      bbmMonthlyCost,
      bbmAnnualCost,
      bbmCostPerKm,
      evDailyKwh: evData.dailyKwh,
      evMonthlyKwh: evData.monthlyKwh,
      evAnnualKwh: evData.annualKwh,
      evDailyCost,
      evMonthlyCost,
      evAnnualCost,
      evCostPerKm: evData.costPerKm,
      costDifferenceDaily,
      costDifferenceMonthly,
      costDifferenceAnnual,
      percentageDifference,
      status,
    },
  };
}

// PBI 12: Kalkulator Jarak dan Waktu ke Fasilitas EV
export function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export function formatDurationLabel(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} menit`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

export function computeFacilityRouteLocal(input: {
  originLat: number;
  originLon: number;
  destinationLat: number;
  destinationLon: number;
  destinationName: string;
  facilityId?: number;
  travelMode?: "Motor" | "Mobil";
}): {
  ok: boolean;
  data?: FacilityRouteResult;
  error?: string;
} {
  const {
    originLat,
    originLon,
    destinationLat,
    destinationLon,
    destinationName,
    facilityId,
    travelMode = "Mobil",
  } = input;

  if (
    !Number.isFinite(originLat) ||
    !Number.isFinite(originLon) ||
    originLat < -90 ||
    originLat > 90 ||
    originLon < -180 ||
    originLon > 180
  ) {
    return { ok: false, error: "Koordinat titik asal tidak valid." };
  }

  if (
    !Number.isFinite(destinationLat) ||
    !Number.isFinite(destinationLon) ||
    destinationLat < -90 ||
    destinationLat > 90 ||
    destinationLon < -180 ||
    destinationLon > 180
  ) {
    return { ok: false, error: "Koordinat fasilitas tujuan tidak valid." };
  }

  const straightMeters = calculateHaversineMeters(
    originLat,
    originLon,
    destinationLat,
    destinationLon
  );

  // Jika jarak lintas pulau ekstrem (> 1.500 km), tolak sebagai tidak dapat dijangkau rute darat langsung
  if (straightMeters > 1500000) {
    return {
      ok: false,
      error:
        "Lokasi tujuan berada di luar jangkauan rute darat langsung (> 1.500 km). Silakan pilih titik asal di kota yang sama atau pulau yang sama.",
    };
  }

  // Faktor kelokan jalan perkotaan (1.28x jarak garis lurus)
  const roadDistanceMeters = Math.max(50, Math.round(straightMeters * 1.28));
  const distanceKm = Number((roadDistanceMeters / 1000).toFixed(2));

  // Kecepatan rata-rata perkotaan: Motor 32 km/jam (8.89 m/s), Mobil 26 km/jam (7.22 m/s)
  const speedMeterPerSec = travelMode === "Motor" ? 8.89 : 7.22;
  const durationSeconds = Math.max(60, Math.round(roadDistanceMeters / speedMeterPerSec));
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

  // Buat kurva titik rute jalan perkotaan yang realistis untuk dirender di Leaflet
  const midLat = (originLat + destinationLat) / 2 + (destinationLon - originLon) * 0.08;
  const midLon = (originLon + destinationLon) / 2 - (destinationLat - originLat) * 0.08;

  const coordinates: [number, number][] = [
    [originLat, originLon],
    [midLat, midLon],
    [destinationLat, destinationLon],
  ];

  return {
    ok: true,
    data: {
      originLat,
      originLon,
      destinationLat,
      destinationLon,
      destinationName,
      facilityId,
      distanceMeters: roadDistanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes,
      distanceFormatted: formatDistanceLabel(roadDistanceMeters),
      durationFormatted: formatDurationLabel(durationSeconds),
      coordinates,
      calculationMethod: "GEODESIC_URBAN_MODEL",
    },
  };
}

