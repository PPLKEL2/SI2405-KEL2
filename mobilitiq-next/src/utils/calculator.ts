import type {
  FuelPreset,
  CalculatorInput,
  ValidationErrors,
  CalculationResult,
  VehicleOption,
  VehicleCategory,
  OwnershipPeriod,
  MaintenanceCalculationResult,
  MaintenanceItemBreakdown,
  EvModelOption,
} from "../types/calculator.ts";

export const DAYS_IN_MONTH = 30;
export const DAYS_IN_YEAR = 365;

export const FUEL_PRESETS: FuelPreset[] = [
  {
    id: "pertalite",
    name: "Pertalite (RON 90)",
    category: "Bensin",
    defaultPrice: 10000,
    description: "Bensin bersubsidi umum dengan oktan 90",
  },
  {
    id: "pertamax",
    name: "Pertamax (RON 92)",
    category: "Bensin",
    defaultPrice: 12500,
    description: "Bensin tanpa timbal berkualitas tinggi untuk kompresi 9:1 - 10:1",
  },
  {
    id: "pertamax-turbo",
    name: "Pertamax Turbo (RON 98)",
    category: "Bensin",
    defaultPrice: 14400,
    description: "Bensin performa tinggi untuk kendaraan kompresi tinggi",
  },
  {
    id: "solar",
    name: "Solar",
    category: "Diesel",
    defaultPrice: 6800,
    description: "Bahan bakar diesel bersubsidi untuk kendaraan mesin diesel",
  },
  {
    id: "biosolar",
    name: "Biosolar (B35)",
    category: "Diesel",
    defaultPrice: 6800,
    description: "Bahan bakar diesel bersubsidi untuk kendaraan mesin diesel",
  },
  {
    id: "dexlite",
    name: "Dexlite (CN 51)",
    category: "Diesel",
    defaultPrice: 13700,
    description: "Bahan bakar diesel berkualitas dengan kandungan sulfur rendah",
  },
  {
    id: "custom",
    name: "Lainnya / Kustom",
    category: "Lainnya",
    defaultPrice: 0,
    description: "Masukkan jenis BBM dan harga per liter secara manual",
  },
];

export const FIGMA_FUEL_PRICES: Record<string, number> = {
  Pertalite: 10000,
  Pertamax: 12500,
  Solar: 6800,
};

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    name: "Honda Vario 125",
    jenis: "Motor",
    kmL: 45,
    pajakStnk: 400000,
    defaultEvId: "fox-r",
  },
  {
    name: "Honda Beat",
    jenis: "Motor",
    kmL: 52,
    pajakStnk: 400000,
    defaultEvId: "g1",
  },
  {
    name: "Yamaha NMAX",
    jenis: "Motor",
    kmL: 40,
    pajakStnk: 400000,
    defaultEvId: "t1800",
  },
  {
    name: "Toyota Avanza",
    jenis: "Mobil",
    kmL: 12.5,
    pajakStnk: 3500000,
    defaultEvId: "ioniq-5",
  },
  {
    name: "Honda Brio",
    jenis: "Mobil",
    kmL: 15,
    pajakStnk: 3500000,
    defaultEvId: "air-ev",
  },
  {
    name: "Mitsubishi Xpander",
    jenis: "Mobil",
    kmL: 12,
    pajakStnk: 3500000,
    defaultEvId: "ioniq-5",
  },
];

export const EV_OPTIONS: EvModelOption[] = [
  {
    id: "fox-r",
    brand: "Polytron",
    name: "Fox-R",
    type: "Motor",
    batteryKwh: 2.4,
    price: 23900000,
    rangeKm: 85,
    kwhPer100Km: 3.2,
    warranty: "3 th / 30.000 km",
    iceName: "Honda Vario 125",
    icePrice: 24500000,
  },
  {
    id: "g1",
    brand: "Gesits",
    name: "G1",
    type: "Motor",
    batteryKwh: 1.8,
    price: 29900000,
    rangeKm: 70,
    kwhPer100Km: 3.4,
    warranty: "3 th / 30.000 km",
    iceName: "Honda Vario 125",
    icePrice: 24500000,
  },
  {
    id: "t1800",
    brand: "United",
    name: "T1800",
    type: "Motor",
    batteryKwh: 3.0,
    price: 33500000,
    rangeKm: 100,
    kwhPer100Km: 3.5,
    warranty: "5 th / 50.000 km",
    iceName: "Yamaha NMAX",
    icePrice: 32000000,
  },
  {
    id: "air-ev",
    brand: "Wuling",
    name: "Air EV Standard",
    type: "Mobil",
    batteryKwh: 17.3,
    price: 243000000,
    rangeKm: 200,
    kwhPer100Km: 10.5,
    warranty: "8 th / 120.000 km",
    iceName: "Honda Brio",
    icePrice: 195000000,
  },
  {
    id: "ioniq-5",
    brand: "Hyundai",
    name: "Ioniq 5 Standard",
    type: "Mobil",
    batteryKwh: 58.0,
    price: 782000000,
    rangeKm: 384,
    kwhPer100Km: 14.5,
    warranty: "8 th / 160.000 km",
    iceName: "Toyota Avanza",
    icePrice: 270000000,
  },
];

// Tariff PLN per kWh R-1/TR 1.300 VA (from Figma design)
export const PLN_TARIFF_PER_KWH = 1444.7;

// Figma Maintenance breakdown percentages
export const MAINTENANCE_RATIOS = [
  { label: "Ganti oli & filter", ratio: 0.35, color: "#2563eb" }, // rr.ev
  { label: "Servis berkala", ratio: 0.40, color: "#7dd3fc" },     // rr.sky
  { label: "Ban & rem", ratio: 0.25, color: "#cbd5e1" },          // slate
];

/**
 * Calculates vehicle maintenance costs, fuel costs, and EV comparison according to Figma MobilitiQ Frame 08 & 09 specifications.
 */
export function calculateMaintenanceCost(
  vehicleName: string,
  dailyDistanceKm: number,
  fuelTypeName: string = "Pertalite",
  fuelPriceOverride?: number,
  efficiencyOverride?: number,
  ownershipYears: OwnershipPeriod = 1
): MaintenanceCalculationResult {
  const vehicle =
    VEHICLE_OPTIONS.find((v) => v.name === vehicleName) || VEHICLE_OPTIONS[0];

  const fuelEfficiency =
    efficiencyOverride !== undefined && efficiencyOverride > 0
      ? efficiencyOverride
      : vehicle.kmL;

  const fuelPrice =
    fuelPriceOverride !== undefined && fuelPriceOverride > 0
      ? fuelPriceOverride
      : FIGMA_FUEL_PRICES[fuelTypeName] || 10000;

  // Distance calculations
  const monthlyDistanceKm = dailyDistanceKm * DAYS_IN_MONTH; // 60 * 30 = 1,800 km
  const yearlyDistanceKm = monthlyDistanceKm * 12; // 1,800 * 12 = 21,600 km
  const periodDistanceKm = yearlyDistanceKm * ownershipYears;

  // Monthly Fuel
  const monthlyLiters = fuelEfficiency > 0 ? monthlyDistanceKm / fuelEfficiency : 0;
  const monthlyFuelCost = monthlyLiters * fuelPrice;

  // Monthly Maintenance cost: Rp 47/km for Motor, Rp 230/km for Mobil (exact Figma formula)
  const maintenanceRatePerKm = vehicle.jenis === "Motor" ? 47 : 230;
  const monthlyMaintenanceCost = maintenanceRatePerKm * monthlyDistanceKm; // 47 * 1,800 = 84,600

  // Monthly Tax: Pajak STNK / 12 (400,000 / 12 = 33,333.33)
  const yearlyTaxCost = vehicle.pajakStnk;
  const monthlyTaxCost = yearlyTaxCost / 12;

  // Monthly Total: BBM + Perawatan + (Pajak STNK / 12)
  const monthlyTotalCost = monthlyFuelCost + monthlyMaintenanceCost + monthlyTaxCost;

  // Yearly totals
  const yearlyFuelCost = monthlyFuelCost * 12;
  const yearlyMaintenanceCost = monthlyMaintenanceCost * 12;
  const yearlyTotalCost = yearlyFuelCost + yearlyMaintenanceCost + yearlyTaxCost;

  // Ownership Period totals
  const periodFuelCost = yearlyFuelCost * ownershipYears;
  const periodMaintenanceCost = yearlyMaintenanceCost * ownershipYears;
  const periodTaxCost = yearlyTaxCost * ownershipYears;
  const periodTotalCost = yearlyTotalCost * ownershipYears;

  // Breakdown of maintenance components
  const breakdown: MaintenanceItemBreakdown[] = MAINTENANCE_RATIOS.map((item) => {
    const monthlyComp = monthlyMaintenanceCost * item.ratio;
    const yearlyComp = monthlyComp * 12;
    const periodComp = yearlyComp * ownershipYears;

    return {
      label: item.label,
      monthlyCost: monthlyComp,
      yearlyCost: yearlyComp,
      periodCost: periodComp,
      percentage: Math.round(item.ratio * 100),
      color: item.color,
    };
  });

  // Also include Pajak STNK in breakdown
  breakdown.push({
    label: "Pajak STNK (dibagi 12)",
    monthlyCost: monthlyTaxCost,
    yearlyCost: yearlyTaxCost,
    periodCost: periodTaxCost,
    percentage: Math.round((yearlyTaxCost / (yearlyMaintenanceCost + yearlyTaxCost || 1)) * 100),
    color: "#f59e0b",
  });

  // Donut chart composition segments (matching Figma a=[{label: 'BBM', ...}, ...r, {label: 'Pajak STNK'}])
  const compositionBaseTotal = periodTotalCost > 0 ? periodTotalCost : 1;
  const compositionChartData = [
    {
      label: "BBM",
      value: periodFuelCost,
      color: "#1e40af", // Brand deep blue
      percentage: Math.round((periodFuelCost / compositionBaseTotal) * 100),
    },
    {
      label: "Ganti oli & filter",
      value: periodMaintenanceCost * 0.35,
      color: "#2563eb", // Electric blue
      percentage: Math.round(((periodMaintenanceCost * 0.35) / compositionBaseTotal) * 100),
    },
    {
      label: "Servis berkala",
      value: periodMaintenanceCost * 0.40,
      color: "#7dd3fc", // Sky blue
      percentage: Math.round(((periodMaintenanceCost * 0.40) / compositionBaseTotal) * 100),
    },
    {
      label: "Ban & rem",
      value: periodMaintenanceCost * 0.25,
      color: "#cbd5e1", // Slate / mute gray
      percentage: Math.round(((periodMaintenanceCost * 0.25) / compositionBaseTotal) * 100),
    },
    {
      label: "Pajak STNK",
      value: periodTaxCost,
      color: "#f59e0b", // Amber warning
      percentage: Math.round((periodTaxCost / compositionBaseTotal) * 100),
    },
  ];

  // EV Comparison calculations (exact Figma formula: c = (jenis === 'Motor' ? 14 : 89) * n)
  const evMaintenanceRatePerKm = vehicle.jenis === "Motor" ? 14 : 89;
  const evMonthlyMaintenance = evMaintenanceRatePerKm * monthlyDistanceKm; // 14 * 1,800 = 25,200

  const evModel =
    EV_OPTIONS.find((e) => e.type === vehicle.jenis) ||
    EV_OPTIONS[0];

  const evMonthlyKwh = (monthlyDistanceKm * evModel.kwhPer100Km) / 100;
  const evMonthlyEnergyCost = evMonthlyKwh * PLN_TARIFF_PER_KWH;
  const evMonthlyTotal = evMonthlyEnergyCost + evMonthlyMaintenance;

  const monthlySavings = (monthlyFuelCost + monthlyMaintenanceCost) - evMonthlyTotal;
  const yearlySavings = monthlySavings * 12;
  const periodSavings = yearlySavings * ownershipYears;
  const savingsPercentage =
    monthlyFuelCost + monthlyMaintenanceCost > 0
      ? Math.round((monthlySavings / (monthlyFuelCost + monthlyMaintenanceCost)) * 100)
      : 70;

  return {
    vehicle,
    ownershipYears,
    dailyDistanceKm,
    monthlyDistanceKm,
    yearlyDistanceKm,
    periodDistanceKm,
    fuelType: fuelTypeName,
    fuelPrice,
    fuelEfficiencyKmL: fuelEfficiency,

    monthlyLiters,
    monthlyFuelCost,
    monthlyMaintenanceCost,
    monthlyTaxCost,
    monthlyTotalCost,

    yearlyFuelCost,
    yearlyMaintenanceCost,
    yearlyTaxCost,
    yearlyTotalCost,

    periodFuelCost,
    periodMaintenanceCost,
    periodTaxCost,
    periodTotalCost,

    breakdown,
    compositionChartData,

    evComparison: {
      evName: `${evModel.brand} ${evModel.name}`,
      evType: evModel.type,
      evMonthlyMaintenance,
      evMonthlyEnergyCost,
      evMonthlyTotal,
      monthlySavings,
      yearlySavings,
      periodSavings,
      savingsPercentage,
    },
  };
}

/**
 * Validates the calculator input fields.
 * Validates empty inputs, non-numbers, negative distance, zero/negative efficiency, and zero/negative price.
 * Distance of 0 is valid and will safely produce zero results.
 */
export function validateCalculatorInputs(input: CalculatorInput): {
  isValid: boolean;
  errors: ValidationErrors;
  parsedValues?: {
    distance: number;
    efficiency: number;
    price: number;
  };
} {
  const errors: ValidationErrors = {};

  // 1. Distance validation
  const distanceStr = input.dailyDistance.trim();
  let distanceNum = NaN;

  if (distanceStr === "") {
    errors.dailyDistance = "Jarak tempuh harian wajib diisi.";
  } else {
    distanceNum = Number(distanceStr);
    if (Number.isNaN(distanceNum)) {
      errors.dailyDistance = "Jarak tempuh harus berupa angka yang valid.";
    } else if (distanceNum < 0) {
      errors.dailyDistance = "Jarak tempuh tidak boleh bernilai negatif (< 0 km).";
    }
  }

  // 2. Efficiency validation (must be > 0 to prevent division by zero)
  const efficiencyStr = input.vehicleEfficiency.trim();
  let efficiencyNum = NaN;

  if (efficiencyStr === "") {
    errors.vehicleEfficiency = "Efisiensi kendaraan wajib diisi.";
  } else {
    efficiencyNum = Number(efficiencyStr);
    if (Number.isNaN(efficiencyNum)) {
      errors.vehicleEfficiency = "Efisiensi kendaraan harus berupa angka yang valid.";
    } else if (efficiencyNum <= 0) {
      errors.vehicleEfficiency = "Efisiensi kendaraan harus lebih dari 0 km/L (tidak boleh nol atau negatif).";
    }
  }

  // 3. Price validation (must be > 0)
  const priceStr = input.fuelPricePerLiter.trim();
  let priceNum = NaN;

  if (priceStr === "") {
    errors.fuelPricePerLiter = "Harga BBM per liter wajib diisi.";
  } else {
    priceNum = Number(priceStr);
    if (Number.isNaN(priceNum)) {
      errors.fuelPricePerLiter = "Harga BBM harus berupa angka yang valid.";
    } else if (priceNum <= 0) {
      errors.fuelPricePerLiter = "Harga BBM per liter harus lebih dari Rp0 (tidak boleh nol atau negatif).";
    }
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    parsedValues: {
      distance: distanceNum,
      efficiency: efficiencyNum,
      price: priceNum,
    },
  };
}

/**
 * Calculates fuel consumption in liters and cost in IDR for daily, monthly (30 days), and yearly (365 days).
 * Handled safely if distance is 0: results will be 0 liters and Rp 0.
 */
export function calculateFuelCost(
  distanceKm: number,
  efficiencyKmPerL: number,
  pricePerLiter: number,
  fuelName: string
): CalculationResult {
  // If distance is 0, safely return 0 without issues
  if (distanceKm === 0) {
    return {
      daily: { periodName: "Harian", days: 1, liters: 0, cost: 0 },
      monthly: { periodName: "Bulanan", days: DAYS_IN_MONTH, liters: 0, cost: 0 },
      yearly: { periodName: "Tahunan", days: DAYS_IN_YEAR, liters: 0, cost: 0 },
      inputs: {
        distanceKm: 0,
        efficiencyKmPerLiter: efficiencyKmPerL,
        pricePerLiter,
        fuelName,
      },
    };
  }

  // Base calculation
  // Liter per hari = jarak harian ÷ efisiensi kendaraan
  const dailyLiters = distanceKm / efficiencyKmPerL;
  // Biaya harian = liter yang dibutuhkan × harga BBM per liter
  const dailyCost = dailyLiters * pricePerLiter;

  // Monthly: 30 days
  const monthlyLiters = dailyLiters * DAYS_IN_MONTH;
  const monthlyCost = monthlyLiters * pricePerLiter;

  // Yearly: 365 days
  const yearlyLiters = dailyLiters * DAYS_IN_YEAR;
  const yearlyCost = yearlyLiters * pricePerLiter;

  return {
    daily: {
      periodName: "Harian",
      days: 1,
      liters: dailyLiters,
      cost: dailyCost,
    },
    monthly: {
      periodName: "Bulanan",
      days: DAYS_IN_MONTH,
      liters: monthlyLiters,
      cost: monthlyCost,
    },
    yearly: {
      periodName: "Tahunan",
      days: DAYS_IN_YEAR,
      liters: yearlyLiters,
      cost: yearlyCost,
    },
    inputs: {
      distanceKm,
      efficiencyKmPerLiter: efficiencyKmPerL,
      pricePerLiter,
      fuelName,
    },
  };
}

/**
 * Formats a number to Indonesian Rupiah currency string (e.g., Rp 50.000).
 */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("id-ID").format(rounded);
  return `Rp ${formatted}`;
}

/**
 * Formats compact Rupiah currency string (e.g., Rp 6,2 jt or Rp 518 rb) matching Figma `S(o)` helper.
 */
export function formatRupiahCompact(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded >= 1000000000) {
    const b = (rounded / 1000000000).toFixed(1).replace(".", ",");
    return `Rp ${b} M`;
  }
  if (rounded >= 1000000) {
    const jt = (rounded / 1000000).toFixed(1).replace(".", ",");
    return `Rp ${jt} jt`;
  }
  if (rounded >= 1000) {
    const rb = Math.round(rounded / 1000);
    return `Rp ${rb} rb`;
  }
  return `Rp ${rounded}`;
}

/**
 * Formats liters with Indonesian decimal/group separator and standard unit (e.g. 5 L, 150 L, 1.825 L).
 */
export function formatLiters(liters: number): string {
  const isInteger = Math.abs(liters - Math.round(liters)) < 0.0001;
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : 1,
  }).format(liters);

  return `${formatted} L`;
}

/**
 * Formats standard number in Indonesian format (e.g., 1.825 or 12,5).
 */
export function formatNumberId(val: number, maxDecimals: number = 1): string {
  const isInteger = Math.abs(val - Math.round(val)) < 0.0001;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : maxDecimals,
  }).format(val);
}

