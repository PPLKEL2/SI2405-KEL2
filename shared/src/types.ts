export type UserRole = 'USER' | 'MITRA' | 'SUPERADMIN';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VehicleType = 'Motor' | 'Mobil';
export type TariffCategory = 'BBM' | 'PLN' | 'SPKLU_REF';
export type FacilityType = 'SPKLU' | 'SPBKLU' | 'Showroom';
export type ChargingHabit = 'ac' | 'mix' | 'dc';

export interface CityDto {
  id: string;
  slug: string;
  name: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  isActive: boolean;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  cityId: string | null;
  cityName: string;
  homePowerVa: number;
  tariffIncentiveAlert: boolean;
  monthlyReportReminder: boolean;
  partner?: {
    id: string;
    companyName: string;
    partnerCategory: string;
    verificationStatus: VerificationStatus;
    rejectionNote?: string | null;
  } | null;
}

export interface EvModelDto {
  id: string;
  partnerId: string | null;
  partnerName?: string | null;
  slug: string;
  brand: string;
  modelName: string;
  vehicleType: VehicleType;
  batteryKwh: number;
  otrPriceIdr: number;
  wltpRangeKm: number;
  consumptionKwh100km: number;
  acChargerKw: number;
  dcChargerKw: number;
  serviceCostPerKmIdr: number;
  annualPkbTaxIdr: number;
  warrantyLabel: string;
  promoLabel: string | null;
  comparableIceName: string;
  comparableIcePriceIdr: number;
  imageUrl: string | null;
  isActive: boolean;
  replacementBatteryPriceIdr?: number | null;
}

export interface IceVehiclePresetDto {
  id: string;
  modelName: string;
  vehicleType: VehicleType;
  defaultKmPerLiter: number;
  defaultFuelCode: string;
  estimatedOtrPriceIdr: number;
  estimatedResalePriceIdr: number;
  serviceCostPerKmIdr: number;
  annualStnkTaxIdr: number;
  isActive: boolean;
}

export interface EnergyTariffDto {
  id: string;
  category: TariffCategory;
  code: string;
  displayName: string;
  subsidyType: string;
  powerVaMin: number | null;
  powerVaMax: number | null;
  pricePerUnitIdr: number;
  unitLabel: string;
  upgradeFeeIdr: number | null;
  emissionKgCo2PerUnit: number;
  isActive: boolean;
  updatedAt: string;
}

export interface EnergyTariffHistoryDto {
  id: string;
  energyTariffId: string;
  tariffCode: string;
  tariffName: string;
  oldPriceIdr: number;
  newPriceIdr: number;
  changedByName: string | null;
  effectiveFrom: string;
}

export interface EvIncentiveDto {
  id: string;
  code: string;
  policyName: string;
  applicableVehicleType: 'Mobil' | 'Motor' | 'Semua EV';
  calculationType: 'percentage' | 'fixed_idr' | 'tax_exemption';
  benefitValue: number;
  benefitDisplayText: string;
  legalBasis: string;
  isActive: boolean;
  updatedAt: string;
}

export interface FacilityDto {
  id: string;
  partnerId: string | null;
  cityId: string;
  cityName: string;
  facilityName: string;
  facilityType: FacilityType;
  fullAddress: string;
  latitude: number;
  longitude: number;
  powerOrSlotSpec: string;
  operatingHours: string;
  serviceTariffIdr: number;
  tariffUnitLabel: string;
  tariffDisplay: string;
  distanceKm: number;
  travelMinutes: number;
  isActive: boolean;
}

export interface RoutePresetDto {
  id: string;
  routeLabel: string;
  distanceKm: number;
  sortOrder: number;
}

export interface SystemParametersConfig {
  plnPowerFactor: number;
  chargerEfficiency: number;
  nightLoadFactor: number;
  degradationRateAc: number;
  degradationRateMix: number;
  degradationRateDc: number;
  warrantySohThreshold: number;
  depositRateAnnual: number;
  defaultBatteryPriceMotorPerKwh: number;
  defaultBatteryPriceMobilPerKwh: number;
  wltpRealFactor: number;
  penaltyAc: number;
  penaltyRain: number;
  penaltyLoad: number;
  rooftopSolarEmissionKgKwh: number;
  treeAbsorptionKgYear: number;
  iceOilShare: number;
  icePeriodicShare: number;
  iceTireBrakeShare: number;
}

export interface BootstrapDataDto {
  cities: CityDto[];
  evModels: EvModelDto[];
  icePresets: IceVehiclePresetDto[];
  energyTariffs: EnergyTariffDto[];
  evIncentives: EvIncentiveDto[];
  routePresets: RoutePresetDto[];
  systemParameters: SystemParametersConfig;
  macroStats: {
    avgMonthlySavingIdr: number;
    completedSimulationsCount: number;
    activeCitiesCount: number;
  };
}

export interface FinanceAndBatteryParams {
  dpPct: number;
  tenorMonths: number;
  annualInterestPct: number;
  applyPpnDtp: boolean;
  applyMotorSubsidy: boolean;
  chargingHabit: ChargingHabit;
  ownershipYears: number;
  targetBatteryYear: number;
  batteryPricePerKwh: number;
  batteryAnnualDropPct: number;
  useDeposit: boolean;
  tripDistanceKm: number;
  departureSocPct: number;
  acOn: boolean;
  rainTraffic: boolean;
  fullLoad: boolean;
}

export interface SimulationInput {
  pathway: 'A' | 'B';
  vehicleType: VehicleType;
  icePresetId: string | null;
  customIceName: string;
  iceKmPerLiter: number;
  fuelCode: string;
  dailyDistanceKm: number;
  budgetIdr: number;
  evModelId: string;
  homePowerVa: number;
  homeChargerKw: number;
  baseLoadKw: number;
  nightChargingEnabled: boolean;
  homeChargingSharePct: number;
  solarRooftopEnabled: boolean;
  extra: FinanceAndBatteryParams;
}

export interface ReferenceContext {
  evModels: EvModelDto[];
  icePresets: IceVehiclePresetDto[];
  energyTariffs: EnergyTariffDto[];
  evIncentives: EvIncentiveDto[];
  systemParameters: SystemParametersConfig;
}

export interface FullCalculationResult {
  ev: EvModelDto;
  icePreset: IceVehiclePresetDto;
  fuelTariff: EnergyTariffDto;
  plnTariff: EnergyTariffDto;
  spkluTariff: EnergyTariffDto;
  monthlyKm: number;
  ice: {
    monthlyLiters: number;
    monthlyFuelCostIdr: number;
    monthlyServiceCostIdr: number;
    monthlyOilCostIdr: number;
    monthlyPeriodicServiceCostIdr: number;
    monthlyTireBrakeCostIdr: number;
    annualStnkTaxIdr: number;
    monthlyTotalWithTaxIdr: number;
    monthlyOperationalIdr: number;
    annualFuelCostIdr: number;
    annualTotalIdr: number;
  };
  evEnergy: {
    monthlyKwh: number;
    homeKwh: number;
    publicKwh: number;
    blendedTariffPerKwhIdr: number;
    monthlyHomeCostIdr: number;
    monthlyPublicCostIdr: number;
    monthlyElectricityCostIdr: number;
    costPerKmIdr: number;
    monthlyServiceCostIdr: number;
    monthlyOperationalIdr: number;
  };
  comparison: {
    monthlyOperationalSavingIdr: number;
    savingPct: number;
    isNegativeSaving: boolean;
  };
  purchase: {
    ppnDtpAvailable: boolean;
    motorSubsidyAvailable: boolean;
    incentiveDiscountIdr: number;
    netEvPriceIdr: number;
    downPaymentIdr: number;
    loanPrincipalIdr: number;
    totalInterestIdr: number;
    totalPaidWithCreditIdr: number;
    monthlyInstallmentIdr: number;
    installmentCoveragePct: number;
  };
  degradation: {
    sohAtOwnershipYear: number;
    effectiveRangeKm: number;
    status: 'sehat' | 'menurun' | 'dibawah_garansi';
    seriesYears: string[];
    seriesAc: number[];
    seriesMix: number[];
    seriesDc: number[];
  };
  sinkingFund: {
    effectiveBatteryPricePerKwhIdr: number;
    futureReplacementCostIdr: number;
    monthlyReserveIdr: number;
    costPerKmIdr: number;
    seriesLabels: string[];
    seriesAccumulated: number[];
    seriesTargetLine: number[];
  };
  homePower: {
    effectiveBaseLoadKw: number;
    totalLoadKw: number;
    maxCapacityKw: number;
    usageRatio: number;
    status: 'aman' | 'ketat' | 'bahaya';
    fullChargeHours: number;
    recommendedUpgradeVa: number | null;
    recommendedUpgradeFeeIdr: number | null;
  };
  rangeSim: {
    conditionFactor: number;
    realRangeKm: number;
    usageRatio: number;
    remainingKm: number;
    status: 'cukup' | 'mepet' | 'tidak_cukup';
    requiredChargingStops: number;
  };
  tco: {
    iceComponents: {
      acquisitionIdr: number;
      energyIdr: number;
      maintenanceIdr: number;
      taxIdr: number;
      batteryReserveIdr: number;
      total5YearsIdr: number;
    };
    evComponents: {
      acquisitionIdr: number;
      energyIdr: number;
      maintenanceIdr: number;
      taxIdr: number;
      batteryReserveIdr: number;
      total5YearsIdr: number;
    };
    tcoDifferenceIdr: number;
    paybackMonthIndex: number;
    paybackLabel: string;
    isPaybackReached: boolean;
    iceCumulative60: number[];
    evCumulative60: number[];
  };
  emissions: {
    annualIceCo2Kg: number;
    annualEvCo2Kg: number;
    annualReductionCo2Kg: number;
    fiveYearReductionCo2Kg: number;
    reductionPct: number;
    equivalentTrees: number;
  };
}

export interface SavedSimulationDto {
  id: string;
  shareToken: string;
  pathway: 'A' | 'B';
  vehicleType: VehicleType;
  customIceName: string;
  evBrandModel: string;
  evModelId: string;
  dailyDistanceKm: number;
  budgetIdr: number;
  monthlySavingIdr: number;
  paybackLabel: string;
  tco5YearEvIdr: number;
  tco5YearIceIdr: number;
  createdAt: string;
  inputSnapshot: SimulationInput;
  referenceSnapshot: ReferenceContext;
  resultSnapshot: FullCalculationResult;
}

export interface PartnerDocumentDto {
  id: string;
  docType: string;
  docLabel: string;
  fileUrl: string | null;
  isComplete: boolean;
  uploadedAt: string;
}

export interface PartnerBatteryPriceDto {
  id: string;
  evModelId: string;
  evName: string;
  vehicleType: VehicleType;
  batteryKwh: number;
  replacementPriceIdr: number;
  warrantyNote: string;
  updatedAt: string;
}

export interface PartnerDashboardDto {
  partner: {
    id: string;
    companyName: string;
    partnerCategory: string;
    picEmail: string;
    cityId: string | null;
    cityName: string;
    verificationStatus: VerificationStatus;
    rejectionNote: string | null;
    submittedAt: string;
  };
  documents: PartnerDocumentDto[];
  activeEvCount: number;
  totalEvCount: number;
  activeFacilityCount: number;
  monthlyRecommendationCount: number;
  weeklyTestDriveClicks: number;
  leads7Days: { label: string; count: number }[];
  topRecommendedUnits: {
    id: string;
    name: string;
    vehicleType: VehicleType;
    recommendationCount: number;
    leadCount: number;
  }[];
  batteryPrices: PartnerBatteryPriceDto[];
}

export interface AdminPartnerVerificationDto {
  id: string;
  companyName: string;
  partnerCategory: string;
  cityName: string;
  picName: string;
  picEmail: string;
  verificationStatus: VerificationStatus;
  rejectionNote: string | null;
  submittedAt: string;
  verifiedAt: string | null;
  documents: PartnerDocumentDto[];
}

export interface AdminAnalyticsDto {
  totalConsultations30d: number;
  savedToReportRatePct: number;
  pathwayAPct: number;
  pathwayBPct: number;
  verifiedPartnersCount: number;
  pendingPartnersCount: number;
  weeklyTrend12w: { label: string; consultations: number; savedSimulations: number }[];
  vehicleSplit: { motorCount: number; mobilCount: number; motorPct: number; mobilPct: number };
  funnelStages: { stageName: string; label: string; count: number; pct: number }[];
  topCities: { cityName: string; simulationsCount: number; facilitiesCount: number }[];
}
