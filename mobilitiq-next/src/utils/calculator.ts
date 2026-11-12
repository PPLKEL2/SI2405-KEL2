import type { FuelPreset, CalculatorInput, ValidationErrors, CalculationResult } from "../types/calculator.ts";

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
    defaultPrice: 12950,
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
    id: "pertamina-dex",
    name: "Pertamina Dex (CN 53)",
    category: "Diesel",
    defaultPrice: 14150,
    description: "Bahan bakar diesel performa tertinggi untuk mesin modern",
  },
  {
    id: "custom",
    name: "Lainnya / Kustom",
    category: "Lainnya",
    defaultPrice: 0,
    description: "Masukkan jenis BBM dan harga per liter secara manual",
  },
];

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
 * Formats liters with Indonesian decimal/group separator and standard unit (e.g. 5 L, 150 L, 1.825 L).
 */
export function formatLiters(liters: number): string {
  // Round to max 2 decimals if not integer
  const isInteger = Math.abs(liters - Math.round(liters)) < 0.0001;
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : 2,
  }).format(liters);

  return `${formatted} L`;
}

/**
 * Formats standard number in Indonesian format (e.g., 1.825 or 12,5).
 */
export function formatNumberId(val: number, maxDecimals: number = 2): string {
  const isInteger = Math.abs(val - Math.round(val)) < 0.0001;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : maxDecimals,
  }).format(val);
}
