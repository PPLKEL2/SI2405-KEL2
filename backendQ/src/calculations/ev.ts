export interface EvCalculationInput {
  consumptionKwh100km: number;
  dailyDistanceKm: number;
  homeChargingPercentage: number;
  homeTariffPerKwh: number;
  spkluTariffPerKwh: number;
  homePowerVa?: number;
}

export interface EvCalculationOutput {
  monthlyDistanceKm: number;
  monthlyKwh: number;
  homeKwh: number;
  spkluKwh: number;
  homeCostMonthly: number;
  spkluCostMonthly: number;
  totalCostMonthly: number;
  costPerKm: number;
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export type CalculationResult<TInput, TOutput> =
  | { ok: true; data: TOutput }
  | { ok: false; errors: ValidationErrors<TInput> };

export const DAYS_PER_MONTH = 30;

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Pure function untuk menghitung konsumsi energi EV (PBI: KEL2-67)
 * Memvalidasi input secara defensif dan mengembalikan discriminated union.
 */
export function calculateEvEnergy(
  input: EvCalculationInput,
): CalculationResult<EvCalculationInput, EvCalculationOutput> {
  const errors: ValidationErrors<EvCalculationInput> = {};

  if (!Number.isFinite(input.consumptionKwh100km) || input.consumptionKwh100km <= 0) {
    errors.consumptionKwh100km =
      "Konsumsi kendaraan harus berupa angka positif lebih besar dari 0 kWh/100 km";
  }

  if (!Number.isFinite(input.dailyDistanceKm) || input.dailyDistanceKm < 0) {
    errors.dailyDistanceKm = "Jarak tempuh harian tidak boleh bernilai negatif";
  }

  if (!Number.isFinite(input.homeTariffPerKwh) || input.homeTariffPerKwh <= 0) {
    errors.homeTariffPerKwh = "Tarif listrik rumah harus lebih besar dari Rp 0 / kWh";
  }

  if (!Number.isFinite(input.spkluTariffPerKwh) || input.spkluTariffPerKwh <= 0) {
    errors.spkluTariffPerKwh = "Tarif SPKLU harus lebih besar dari Rp 0 / kWh";
  }

  if (!Number.isFinite(input.homeChargingPercentage)) {
    errors.homeChargingPercentage = "Persentase pengisian rumah harus berupa angka valid";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const clampedHomePct = Math.max(0, Math.min(100, input.homeChargingPercentage));
  const monthlyDistanceKm = input.dailyDistanceKm * DAYS_PER_MONTH;

  if (monthlyDistanceKm === 0) {
    return {
      ok: true,
      data: {
        monthlyDistanceKm: 0,
        monthlyKwh: 0,
        homeKwh: 0,
        spkluKwh: 0,
        homeCostMonthly: 0,
        spkluCostMonthly: 0,
        totalCostMonthly: 0,
        costPerKm: 0,
      },
    };
  }

  const rawMonthlyKwh = (monthlyDistanceKm * input.consumptionKwh100km) / 100;
  const rawHomeKwh = rawMonthlyKwh * (clampedHomePct / 100);
  const rawSpkluKwh = rawMonthlyKwh - rawHomeKwh;

  const rawHomeCost = rawHomeKwh * input.homeTariffPerKwh;
  const rawSpkluCost = rawSpkluKwh * input.spkluTariffPerKwh;
  const rawTotalCost = rawHomeCost + rawSpkluCost;
  const rawCostPerKm = rawTotalCost / monthlyDistanceKm;

  return {
    ok: true,
    data: {
      monthlyDistanceKm: roundTo(monthlyDistanceKm, 2),
      monthlyKwh: roundTo(rawMonthlyKwh, 2),
      homeKwh: roundTo(rawHomeKwh, 2),
      spkluKwh: roundTo(rawSpkluKwh, 2),
      homeCostMonthly: Math.round(rawHomeCost),
      spkluCostMonthly: Math.round(rawSpkluCost),
      totalCostMonthly: Math.round(rawTotalCost),
      costPerKm: roundTo(rawCostPerKm, 2),
    },
  };
}

