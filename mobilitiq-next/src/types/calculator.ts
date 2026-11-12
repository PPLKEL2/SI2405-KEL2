export interface FuelPreset {
  id: string;
  name: string;
  category: "Bensin" | "Diesel" | "Lainnya";
  defaultPrice: number;
  description: string;
}

export interface CalculatorInput {
  dailyDistance: string; // km
  vehicleEfficiency: string; // km/L
  fuelTypeId: string;
  fuelTypeName: string;
  fuelPricePerLiter: string; // Rp/L
}

export interface ValidationErrors {
  dailyDistance?: string;
  vehicleEfficiency?: string;
  fuelPricePerLiter?: string;
  general?: string;
}

export interface PeriodEstimate {
  periodName: string;
  days: number;
  liters: number;
  cost: number;
}

export interface CalculationResult {
  daily: PeriodEstimate;
  monthly: PeriodEstimate;
  yearly: PeriodEstimate;
  inputs: {
    distanceKm: number;
    efficiencyKmPerLiter: number;
    pricePerLiter: number;
    fuelName: string;
  };
}

