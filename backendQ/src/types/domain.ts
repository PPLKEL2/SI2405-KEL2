export type UserRole = "USER" | "MITRA" | "SUPERADMIN";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string;
  city?: string;
  homePowerVa?: number;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
}

export interface SessionPayload {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string;
  city?: string;
  homePowerVa?: number;
  createdAt: string;
  expiresAt: string;
}

export type VehicleCategory = "Motor" | "Mobil";

// PBI 01: Kalkulator Biaya BBM Kendaraan Konvensional
export interface FuelCostInput {
  vehicleCategory: VehicleCategory;
  vehiclePresetName?: string;
  fuelTypeCode: string;
  fuelPricePerLiter: number;
  kmPerLiter: number;
  distanceInputKm: number;
  distancePeriod: "DAILY" | "MONTHLY";
}

export interface FuelCostResult {
  vehicleCategory: VehicleCategory;
  vehiclePresetName: string;
  fuelTypeCode: string;
  fuelPricePerLiter: number;
  kmPerLiter: number;
  dailyDistanceKm: number;
  monthlyDistanceKm: number;
  annualDistanceKm: number;
  dailyLiters: number;
  monthlyLiters: number;
  annualLiters: number;
  dailyCostIdr: number;
  monthlyCostIdr: number;
  annualCostIdr: number;
  costPerKmIdr: number;
}

// PBI 02: Kalkulator Biaya Perawatan Kendaraan Konvensional
export interface MaintenanceComponentItem {
  id: string;
  name: string;
  description: string;
  annualCostIdr: number;
  monthlyCostIdr: number;
  enabled: boolean;
}

export interface MaintenanceComparisonData {
  evPresetName: string;
  evAnnualMaintenanceIdr: number;
  evMonthlyMaintenanceIdr: number;
  evTotalOwnershipMaintenanceIdr: number;
  annualSavingsIdr: number;
  monthlySavingsIdr: number;
  totalOwnershipSavingsIdr: number;
  savingsPercentage: number;
  evComponents: MaintenanceComponentItem[];
}

export interface IceMaintenanceInput {
  vehicleCategory: VehicleCategory;
  vehiclePresetId?: string;
  dailyDistanceKm: number;
  ownershipYears: number;
  includeOilAndFilter?: boolean;
  includeSparkPlugAndIgnition?: boolean;
  includePeriodicService?: boolean;
  includeTiresAndBrakes?: boolean;
  includeAnnualStnkTax?: boolean;
  customAnnualStnkTaxIdr?: number;
  evPresetId?: string;
  customEvAnnualServiceIdr?: number;
}

export interface IceMaintenanceResult {
  vehicleCategory: VehicleCategory;
  ownershipYears: number;
  dailyDistanceKm: number;
  annualDistanceKm: number;
  components: MaintenanceComponentItem[];
  monthlyMaintenanceIdr: number;
  annualMaintenanceIdr: number;
  totalOwnershipMaintenanceIdr: number;
  costPerKmIdr: number;
  evComparison?: MaintenanceComparisonData;
}

// PBI 03 & PBI 04: Katalog Kendaraan Listrik (EV Models)
export interface EvModel {
  id: string;
  brand: string;
  modelName: string;
  category: VehicleCategory;
  otrPriceIdr: number;
  batteryKwh: number;
  consumptionKwh100km: number;
  wltpRangeKm: number;
  motorPowerKw: number;
  chargerType: string;
  acChargerKw: number;
  dcChargerKw: number;
  warrantyLabel: string;
  promoLabel?: string;
  serviceCostPerKmIdr: number;
  comparableIceName?: string;
  comparableIcePriceIdr?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvModelInput {
  brand: string;
  modelName: string;
  category: VehicleCategory;
  otrPriceIdr: number | string;
  batteryKwh: number | string;
  consumptionKwh100km: number | string;
  wltpRangeKm: number | string;
  motorPowerKw: number | string;
  chargerType: string;
  acChargerKw?: number | string;
  dcChargerKw?: number | string;
  warrantyLabel?: string;
  promoLabel?: string;
  serviceCostPerKmIdr?: number | string;
  comparableIceName?: string;
  comparableIcePriceIdr?: number | string;
  isActive?: boolean;
}

// PBI 05 & PBI 11: Lokasi Fasilitas EV
export type FacilityCategory = "Showroom" | "SPKLU" | "SPBKLU";

export interface EvFacility {
  id: number;
  name: string;
  category: FacilityCategory;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  contact: string;
  powerSpec: string;
  operator: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvFacilityInput {
  name: string;
  category: FacilityCategory;
  city: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  operatingHours: string;
  contact: string;
  powerSpec?: string;
  operator?: string;
  active?: boolean;
}

// PBI 06: Harga Layanan Fasilitas EV
export type FacilityServiceType = "CHARGING" | "SWAP";
export type FacilityServiceUnit = "kWh" | "transaksi";

export interface FacilityServiceTariff {
  id: number;
  facilityId: number;
  serviceType: FacilityServiceType;
  unit: FacilityServiceUnit;
  priceIdr: number;
  validFrom: string; // YYYY-MM-DD
  validUntil: string | null; // YYYY-MM-DD or null
  updatedAt: string;
}

export interface FacilityServiceTariffInput {
  facilityId: number | string;
  serviceType: FacilityServiceType;
  unit?: FacilityServiceUnit;
  priceIdr: number | string;
  validFrom: string;
  validUntil?: string | null;
}

// PBI 07: Simulator Konsumsi Energi EV
export interface EvEnergyInput {
  evModelId?: string;
  consumptionKwh100km: number;
  dailyDistanceKm: number;
  homeChargingPercentage: number;
  homeTariffPerKwh: number;
  spkluTariffPerKwh: number;
  homePowerVa?: number;
}

export interface EvEnergyResult {
  dailyDistanceKm: number;
  monthlyDistanceKm: number;
  annualDistanceKm: number;
  consumptionKwh100km: number;
  dailyKwh: number;
  monthlyKwh: number;
  annualKwh: number;
  homeChargingPercentage: number;
  spkluChargingPercentage: number;
  homeMonthlyKwh: number;
  spkluMonthlyKwh: number;
  weightedTariffPerKwh: number;
  homeCostMonthly: number;
  spkluCostMonthly: number;
  totalCostDaily: number;
  totalCostMonthly: number;
  totalCostAnnual: number;
  costPerKm: number;
}

// PBI 08: Kalkulator Biaya Operasional BBM vs Listrik
export interface ComparisonInput {
  dailyDistanceKm: number;
  iceKmPerLiter: number;
  fuelPricePerLiter: number;
  evConsumptionKwh100km: number;
  homeTariffPerKwh: number;
  spkluTariffPerKwh: number;
  homeChargingPercentage: number;
}

export interface ComparisonResult {
  dailyDistanceKm: number;
  monthlyDistanceKm: number;
  annualDistanceKm: number;
  bbmDailyLiters: number;
  bbmMonthlyLiters: number;
  bbmAnnualLiters: number;
  bbmDailyCost: number;
  bbmMonthlyCost: number;
  bbmAnnualCost: number;
  bbmCostPerKm: number;
  evDailyKwh: number;
  evMonthlyKwh: number;
  evAnnualKwh: number;
  evDailyCost: number;
  evMonthlyCost: number;
  evAnnualCost: number;
  evCostPerKm: number;
  costDifferenceDaily: number;
  costDifferenceMonthly: number;
  costDifferenceAnnual: number;
  percentageDifference: number;
  status: "SAVING" | "MORE_EXPENSIVE" | "EQUAL";
}

// PBI 09: Manajemen Tarif Energi (Superadmin)
export type EnergyCategory = "PLN_HOME" | "SPKLU" | "BBM";
export type EnergyUnit = "Rp/kWh" | "Rp/liter" | "Rp/kVA";

export interface EnergyTariff {
  id: string;
  code: string;
  name: string;
  category: EnergyCategory;
  pricePerUnit: number;
  unit: EnergyUnit;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  notes?: string;
  sourceLabel?: string;
  updatedAt: string;
  updatedBy: string;
}

export type TariffActionType =
  | "CREATE"
  | "UPDATE_PRICE"
  | "UPDATE_PERIOD"
  | "UPDATE_ALL"
  | "STATUS_CHANGE";

export interface EnergyTariffHistory {
  id: string;
  tariffId: string;
  tariffCode: string;
  tariffName: string;
  category: EnergyCategory;
  action: TariffActionType;
  oldPrice: number | null;
  newPrice: number;
  oldUnit: EnergyUnit | null;
  newUnit: EnergyUnit;
  oldValidFrom: string | null;
  newValidFrom: string;
  oldValidTo: string | null;
  newValidTo: string | null;
  oldIsActive: boolean | null;
  newIsActive: boolean;
  changedBy: string;
  reason: string;
  changedAt: string;
}

export interface EnergyTariffInput {
  id?: string;
  code: string;
  name: string;
  category: EnergyCategory;
  pricePerUnit: number | string;
  unit: EnergyUnit | string;
  validFrom: string;
  validTo?: string | null;
  isActive?: boolean;
  notes?: string;
  sourceLabel?: string;
  reason?: string;
  changedBy?: string;
}

// PBI 10: Manajemen Insentif dan Pajak EV (Superadmin)
export type IncentiveCategory = "TAX" | "CUSTOMS" | "INCENTIVE" | "SUBSIDY";
export type IncentiveValueType = "PERCENTAGE" | "FIXED_AMOUNT";
export type ApplicableVehicleType = "Motor" | "Mobil" | "Semua";

export interface EvIncentivePolicy {
  id: string;
  code: string;
  name: string;
  category: IncentiveCategory;
  vehicleType: ApplicableVehicleType;
  valueType: IncentiveValueType;
  value: number;
  calculationBasis: string;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  description?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EvIncentiveInput {
  id?: string;
  code?: string;
  name: string;
  category: IncentiveCategory;
  vehicleType?: ApplicableVehicleType;
  valueType: IncentiveValueType;
  value: number | string;
  calculationBasis?: string;
  validFrom: string;
  validTo?: string | null;
  isActive?: boolean;
  description?: string;
  changedBy?: string;
}

// PBI 12: Kalkulator Jarak dan Waktu ke Fasilitas EV
export interface FacilityRouteInput {
  originLat: number;
  originLon: number;
  facilityId?: number;
  destinationLat?: number;
  destinationLon?: number;
  destinationName?: string;
  travelMode?: "Motor" | "Mobil";
}

export interface FacilityRouteResult {
  originLat: number;
  originLon: number;
  destinationLat: number;
  destinationLon: number;
  destinationName: string;
  facilityId?: number;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  distanceFormatted: string;
  durationFormatted: string;
  coordinates: [number, number][];
  calculationMethod: "OSRM_ROAD_NETWORK" | "GEODESIC_URBAN_MODEL";
}

