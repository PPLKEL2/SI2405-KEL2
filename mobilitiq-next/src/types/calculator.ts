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

export type VehicleCategory = "Motor" | "Mobil";

export interface VehicleOption {
  name: string;
  jenis: VehicleCategory;
  kmL: number;
  pajakStnk: number; // Pajak per tahun
  defaultEvId?: string;
}

export type OwnershipPeriod = 1 | 3 | 5;

export interface MaintenanceItemBreakdown {
  label: string;
  monthlyCost: number;
  yearlyCost: number;
  periodCost: number;
  percentage: number;
  color: string;
}

export interface MaintenanceCalculationResult {
  vehicle: VehicleOption;
  ownershipYears: OwnershipPeriod;
  dailyDistanceKm: number;
  monthlyDistanceKm: number;
  yearlyDistanceKm: number;
  periodDistanceKm: number;

  fuelType: string;
  fuelPrice: number;
  fuelEfficiencyKmL: number;

  // Monthly values
  monthlyLiters: number;
  monthlyFuelCost: number;
  monthlyMaintenanceCost: number; // oli, servis, ban
  monthlyTaxCost: number; // Pajak STNK / 12
  monthlyTotalCost: number; // BBM + Perawatan + Pajak/12

  // Yearly values
  yearlyFuelCost: number;
  yearlyMaintenanceCost: number;
  yearlyTaxCost: number;
  yearlyTotalCost: number;

  // Total Ownership Period values
  periodFuelCost: number;
  periodMaintenanceCost: number;
  periodTaxCost: number;
  periodTotalCost: number;

  // Maintenance Items Breakdown (oli, servis, ban, pajak)
  breakdown: MaintenanceItemBreakdown[];

  // Donut chart segments for yearly / period composition
  compositionChartData: {
    label: string;
    value: number;
    color: string;
    percentage: number;
  }[];

  // EV Comparison
  evComparison: {
    evName: string;
    evType: VehicleCategory;
    evMonthlyMaintenance: number;
    evMonthlyEnergyCost: number;
    evMonthlyTotal: number;
    monthlySavings: number;
    yearlySavings: number;
    periodSavings: number;
    savingsPercentage: number;
  };
}

export interface EvModelOption {
  id: string;
  brand: string;
  name: string;
  type: VehicleCategory;
  batteryKwh: number;
  price: number;
  rangeKm: number;
  kwhPer100Km: number;
  warranty: string;
  iceName: string;
  icePrice: number;
}


