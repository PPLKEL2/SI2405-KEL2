import {
  calculateEvEnergy,
  DAYS_PER_MONTH,
  type CalculationResult,
  type ValidationErrors,
} from "./ev.ts";

export interface ComparisonCalculationInput {
  dailyDistanceKm: number;
  iceKmPerLiter: number;
  fuelPricePerLiter: number;
  evConsumptionKwh100km: number;
  homeTariffPerKwh: number;
  spkluTariffPerKwh: number;
  homeChargingPercentage: number;
}

export type ComparisonStatus = "SAVING" | "ADDITIONAL_COST" | "EQUAL";

export interface ComparisonCalculationOutput {
  monthlyDistanceKm: number;
  // Metrik BBM
  bbmMonthlyLiters: number;
  bbmMonthlyCost: number;
  bbmCostPerKm: number;
  // Metrik EV (menggunakan calculateEvEnergy resmi)
  evMonthlyKwh: number;
  evMonthlyCost: number;
  evCostPerKm: number;
  homeKwh: number;
  spkluKwh: number;
  homeCostMonthly: number;
  spkluCostMonthly: number;
  // Metrik Komparasi
  costDifferenceMonthly: number;
  isEvCheaper: boolean;
  isEqual: boolean;
  status: ComparisonStatus;
  percentageDifference: number;
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Pure function untuk menghitung komparasi biaya energi BBM vs EV (PBI: KEL2-73)
 * Menjalankan validasi input, memanfaatkan kalkulator EV resmi tanpa duplikasi rumus,
 * dan menghasilkan discriminated union yang aman.
 */
export function calculateComparison(
  input: ComparisonCalculationInput
): CalculationResult<ComparisonCalculationInput, ComparisonCalculationOutput> {
  const errors: ValidationErrors<ComparisonCalculationInput> = {};

  // 1. Validasi jarak tempuh harian (km/hari)
  if (!Number.isFinite(input.dailyDistanceKm) || input.dailyDistanceKm < 0) {
    errors.dailyDistanceKm = "Jarak tempuh harian tidak boleh bernilai negatif";
  }

  // 2. Validasi efisiensi BBM (km/L)
  if (!Number.isFinite(input.iceKmPerLiter) || input.iceKmPerLiter <= 0) {
    errors.iceKmPerLiter =
      "Efisiensi BBM harus berupa angka positif lebih besar dari 0 km/L";
  }

  // 3. Validasi harga BBM per liter (Rp/L)
  if (!Number.isFinite(input.fuelPricePerLiter) || input.fuelPricePerLiter <= 0) {
    errors.fuelPricePerLiter =
      "Harga BBM harus berupa angka positif lebih besar dari Rp 0 / liter";
  }

  // 4. Validasi konsumsi EV (kWh/100 km)
  if (
    !Number.isFinite(input.evConsumptionKwh100km) ||
    input.evConsumptionKwh100km <= 0
  ) {
    errors.evConsumptionKwh100km =
      "Konsumsi EV harus berupa angka positif lebih besar dari 0 kWh/100 km";
  }

  // 5. Validasi tarif listrik rumah (Rp/kWh)
  if (!Number.isFinite(input.homeTariffPerKwh) || input.homeTariffPerKwh <= 0) {
    errors.homeTariffPerKwh =
      "Tarif listrik rumah harus lebih besar dari Rp 0 / kWh";
  }

  // 6. Validasi tarif SPKLU (Rp/kWh)
  if (
    !Number.isFinite(input.spkluTariffPerKwh) ||
    input.spkluTariffPerKwh <= 0
  ) {
    errors.spkluTariffPerKwh = "Tarif SPKLU harus lebih besar dari Rp 0 / kWh";
  }

  // 7. Validasi numerik porsi charging rumah (%)
  if (!Number.isFinite(input.homeChargingPercentage)) {
    errors.homeChargingPercentage =
      "Persentase pengisian rumah harus berupa angka valid";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const monthlyDistanceKm = input.dailyDistanceKm * DAYS_PER_MONTH;

  // Kasus jarak 0 km
  if (monthlyDistanceKm === 0) {
    return {
      ok: true,
      data: {
        monthlyDistanceKm: 0,
        bbmMonthlyLiters: 0,
        bbmMonthlyCost: 0,
        bbmCostPerKm: 0,
        evMonthlyKwh: 0,
        evMonthlyCost: 0,
        evCostPerKm: 0,
        homeKwh: 0,
        spkluKwh: 0,
        homeCostMonthly: 0,
        spkluCostMonthly: 0,
        costDifferenceMonthly: 0,
        isEvCheaper: false,
        isEqual: true,
        status: "EQUAL",
        percentageDifference: 0,
      },
    };
  }

  // Perhitungan BBM
  const rawBbmLiters = monthlyDistanceKm / input.iceKmPerLiter;
  const rawBbmCost = rawBbmLiters * input.fuelPricePerLiter;
  const bbmMonthlyCost = Math.round(rawBbmCost);
  const bbmCostPerKm = roundTo(bbmMonthlyCost / monthlyDistanceKm, 2);

  // Perhitungan EV (menggunakan engine calculateEvEnergy resmi KEL2-67)
  const evResult = calculateEvEnergy({
    consumptionKwh100km: input.evConsumptionKwh100km,
    dailyDistanceKm: input.dailyDistanceKm,
    homeChargingPercentage: input.homeChargingPercentage,
    homeTariffPerKwh: input.homeTariffPerKwh,
    spkluTariffPerKwh: input.spkluTariffPerKwh,
  });

  if (!evResult.ok) {
    return {
      ok: false,
      errors: {
        evConsumptionKwh100km: evResult.errors.consumptionKwh100km,
        dailyDistanceKm: evResult.errors.dailyDistanceKm,
        homeTariffPerKwh: evResult.errors.homeTariffPerKwh,
        spkluTariffPerKwh: evResult.errors.spkluTariffPerKwh,
      },
    };
  }

  const evData = evResult.data;
  const evMonthlyCost = evData.totalCostMonthly;

  // Evaluasi komparasi biaya
  let isEvCheaper = false;
  let isEqual = false;
  let status: ComparisonStatus = "EQUAL";
  let costDifferenceMonthly = 0;
  let percentageDifference = 0;

  if (bbmMonthlyCost > evMonthlyCost) {
    isEvCheaper = true;
    isEqual = false;
    status = "SAVING";
    costDifferenceMonthly = bbmMonthlyCost - evMonthlyCost;
    percentageDifference =
      bbmMonthlyCost > 0
        ? Math.round((costDifferenceMonthly / bbmMonthlyCost) * 100)
        : 0;
  } else if (evMonthlyCost > bbmMonthlyCost) {
    isEvCheaper = false;
    isEqual = false;
    status = "ADDITIONAL_COST";
    costDifferenceMonthly = evMonthlyCost - bbmMonthlyCost;
    percentageDifference =
      bbmMonthlyCost > 0
        ? Math.round((costDifferenceMonthly / bbmMonthlyCost) * 100)
        : 100;
  } else {
    isEvCheaper = false;
    isEqual = true;
    status = "EQUAL";
    costDifferenceMonthly = 0;
    percentageDifference = 0;
  }

  return {
    ok: true,
    data: {
      monthlyDistanceKm: roundTo(monthlyDistanceKm, 2),
      bbmMonthlyLiters: roundTo(rawBbmLiters, 2),
      bbmMonthlyCost,
      bbmCostPerKm,
      evMonthlyKwh: evData.monthlyKwh,
      evMonthlyCost: evData.totalCostMonthly,
      evCostPerKm: evData.costPerKm,
      homeKwh: evData.homeKwh,
      spkluKwh: evData.spkluKwh,
      homeCostMonthly: evData.homeCostMonthly,
      spkluCostMonthly: evData.spkluCostMonthly,
      costDifferenceMonthly,
      isEvCheaper,
      isEqual,
      status,
      percentageDifference,
    },
  };
}
