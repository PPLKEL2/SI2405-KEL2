import type {
  BootstrapDataDto,
  CityDto,
  EnergyTariffDto,
  EnergyTariffHistoryDto,
  EvIncentiveDto,
  EvModelDto,
  FacilityDto,
  FacilityType,
  FullCalculationResult,
  IceVehiclePresetDto,
  PartnerDocumentDto,
  ReferenceContext,
  RoutePresetDto,
  SavedSimulationDto,
  SimulationInput,
  SystemParametersConfig,
  TariffCategory,
  UserDto,
  VehicleType,
} from '@mobilitiq/shared';
import {
  calculateFullSimulation,
  calculateHaversineKm,
  DEFAULT_FINANCE_BATTERY_PARAMS,
  DEFAULT_SYSTEM_PARAMETERS,
  estimateUrbanTravelMinutes,
  formatIdr,
} from '@mobilitiq/shared';
import type {
  BatteryReplacementPrice,
  City,
  EnergyTariff,
  EnergyTariffHistory,
  EvIncentive,
  EvModel,
  Facility,
  IceVehiclePreset,
  Partner,
  PartnerDocument,
  RoutePreset,
  Simulation,
  SystemParameter,
  User,
  UserNotificationPref,
} from '@prisma/client';
import { prisma } from './prisma.js';

export function mapCity(c: City): CityDto {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    centerLat: c.centerLat,
    centerLng: c.centerLng,
    defaultZoom: c.defaultZoom,
    isActive: c.isActive,
  };
}

export function mapUser(
  u: User & {
    city?: City | null;
    notificationPref?: UserNotificationPref | null;
    ownedPartner?: Partner | null;
  },
): UserDto {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    cityId: u.cityId,
    cityName: u.city?.name ?? 'Jakarta',
    homePowerVa: u.homePowerVa,
    tariffIncentiveAlert: u.notificationPref?.tariffIncentiveAlert ?? true,
    monthlyReportReminder: u.notificationPref?.monthlyReportReminder ?? false,
    partner: u.ownedPartner
      ? {
          id: u.ownedPartner.id,
          companyName: u.ownedPartner.companyName,
          partnerCategory: u.ownedPartner.partnerCategory,
          verificationStatus: u.ownedPartner.verificationStatus,
          rejectionNote: u.ownedPartner.rejectionNote,
        }
      : null,
  };
}

export function mapEvModel(
  m: EvModel & {
    partner?: Partner | null;
    batteryPrices?: BatteryReplacementPrice[];
  },
): EvModelDto {
  return {
    id: m.id,
    partnerId: m.partnerId,
    partnerName: m.partner?.companyName ?? null,
    slug: m.slug,
    brand: m.brand,
    modelName: m.modelName,
    vehicleType: m.vehicleType as VehicleType,
    batteryKwh: m.batteryKwh,
    otrPriceIdr: m.otrPriceIdr,
    wltpRangeKm: m.wltpRangeKm,
    consumptionKwh100km: m.consumptionKwh100km,
    acChargerKw: m.acChargerKw,
    dcChargerKw: m.dcChargerKw,
    serviceCostPerKmIdr: m.serviceCostPerKmIdr,
    annualPkbTaxIdr: m.annualPkbTaxIdr,
    warrantyLabel: m.warrantyLabel,
    promoLabel: m.promoLabel,
    comparableIceName: m.comparableIceName,
    comparableIcePriceIdr: m.comparableIcePriceIdr,
    imageUrl: m.imageUrl,
    isActive: m.isActive,
    replacementBatteryPriceIdr: m.batteryPrices?.[0]?.replacementPriceIdr ?? null,
  };
}

export function mapIcePreset(p: IceVehiclePreset): IceVehiclePresetDto {
  return {
    id: p.id,
    modelName: p.modelName,
    vehicleType: p.vehicleType as VehicleType,
    defaultKmPerLiter: p.defaultKmPerLiter,
    defaultFuelCode: p.defaultFuelCode,
    estimatedOtrPriceIdr: p.estimatedOtrPriceIdr,
    estimatedResalePriceIdr: p.estimatedResalePriceIdr,
    serviceCostPerKmIdr: p.serviceCostPerKmIdr,
    annualStnkTaxIdr: p.annualStnkTaxIdr,
    isActive: p.isActive,
  };
}

export function mapEnergyTariff(t: EnergyTariff): EnergyTariffDto {
  return {
    id: t.id,
    category: t.category as TariffCategory,
    code: t.code,
    displayName: t.displayName,
    subsidyType: t.subsidyType,
    powerVaMin: t.powerVaMin,
    powerVaMax: t.powerVaMax,
    pricePerUnitIdr: t.pricePerUnitIdr,
    unitLabel: t.unitLabel,
    upgradeFeeIdr: t.upgradeFeeIdr,
    emissionKgCo2PerUnit: t.emissionKgCo2PerUnit,
    isActive: t.isActive,
    updatedAt: t.updatedAt.toISOString(),
  };
}

export function mapEnergyTariffHistory(
  h: EnergyTariffHistory & { energyTariff: EnergyTariff; changedBy?: User | null },
): EnergyTariffHistoryDto {
  return {
    id: h.id,
    energyTariffId: h.energyTariffId,
    tariffCode: h.energyTariff.code,
    tariffName: h.energyTariff.displayName,
    oldPriceIdr: h.oldPriceIdr,
    newPriceIdr: h.newPriceIdr,
    changedByName: h.changedBy?.fullName ?? 'Sistem',
    effectiveFrom: h.effectiveFrom.toISOString(),
  };
}

export function mapEvIncentive(i: EvIncentive): EvIncentiveDto {
  return {
    id: i.id,
    code: i.code,
    policyName: i.policyName,
    applicableVehicleType: i.applicableVehicleType as EvIncentiveDto['applicableVehicleType'],
    calculationType: i.calculationType as EvIncentiveDto['calculationType'],
    benefitValue: i.benefitValue,
    benefitDisplayText: i.benefitDisplayText,
    legalBasis: i.legalBasis,
    isActive: i.isActive,
    updatedAt: i.updatedAt.toISOString(),
  };
}

export function mapFacility(
  f: Facility & { city: City },
  originLat: number,
  originLng: number,
): FacilityDto {
  const distanceKm = calculateHaversineKm(originLat, originLng, f.latitude, f.longitude);
  const tariffDisplay =
    f.serviceTariffIdr <= 0
      ? f.tariffUnitLabel
      : `${formatIdr(f.serviceTariffIdr)} / ${f.tariffUnitLabel}`;
  return {
    id: f.id,
    partnerId: f.partnerId,
    cityId: f.cityId,
    cityName: f.city.name,
    facilityName: f.facilityName,
    facilityType: f.facilityType as FacilityType,
    fullAddress: f.fullAddress,
    latitude: f.latitude,
    longitude: f.longitude,
    powerOrSlotSpec: f.powerOrSlotSpec,
    operatingHours: f.operatingHours,
    serviceTariffIdr: f.serviceTariffIdr,
    tariffUnitLabel: f.tariffUnitLabel,
    tariffDisplay,
    distanceKm,
    travelMinutes: estimateUrbanTravelMinutes(distanceKm),
    isActive: f.isActive,
  };
}

export function mapRoutePreset(r: RoutePreset): RoutePresetDto {
  return {
    id: r.id,
    routeLabel: r.routeLabel,
    distanceKm: r.distanceKm,
    sortOrder: r.sortOrder,
  };
}

export function mapPartnerDoc(d: PartnerDocument): PartnerDocumentDto {
  return {
    id: d.id,
    docType: d.docType,
    docLabel: d.docLabel,
    fileUrl: d.fileUrl,
    isComplete: d.isComplete,
    uploadedAt: d.uploadedAt.toISOString(),
  };
}

export function parseSystemParameters(rows: SystemParameter[]): SystemParametersConfig {
  const out = { ...DEFAULT_SYSTEM_PARAMETERS };
  const record = out as unknown as Record<string, number>;
  for (const r of rows) {
    if (r.key in record) {
      const parsed = Number(r.paramValue);
      if (!Number.isNaN(parsed)) record[r.key] = parsed;
    }
  }
  return out;
}

export async function loadReferenceContext(includeInactiveEv = false): Promise<ReferenceContext> {
  const [evRows, iceRows, tariffRows, incentiveRows, paramRows] = await Promise.all([
    prisma.evModel.findMany({
      where: {
        deletedAt: null,
        ...(includeInactiveEv ? {} : { isActive: true }),
      },
      include: { partner: true, batteryPrices: true },
      orderBy: [{ vehicleType: 'asc' }, { otrPriceIdr: 'asc' }],
    }),
    prisma.iceVehiclePreset.findMany({
      where: { isActive: true },
      orderBy: [{ vehicleType: 'asc' }, { estimatedOtrPriceIdr: 'asc' }],
    }),
    prisma.energyTariff.findMany({
      orderBy: [{ category: 'asc' }, { powerVaMin: 'asc' }, { pricePerUnitIdr: 'asc' }],
    }),
    prisma.evIncentive.findMany({
      orderBy: { code: 'asc' },
    }),
    prisma.systemParameter.findMany(),
  ]);

  return {
    evModels: evRows.map(mapEvModel),
    icePresets: iceRows.map(mapIcePreset),
    energyTariffs: tariffRows.map(mapEnergyTariff),
    evIncentives: incentiveRows.map(mapEvIncentive),
    systemParameters: parseSystemParameters(paramRows),
  };
}

export async function loadBootstrapData(): Promise<BootstrapDataDto> {
  const [cities, ref, routes, simAgg] = await Promise.all([
    prisma.city.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    loadReferenceContext(false),
    prisma.routePreset.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.simulation.findMany({
      select: { calculatedSummarySnapshot: true },
      take: 500,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  let totalSaving = 0;
  let validCount = 0;
  for (const s of simAgg) {
    const snap = s.calculatedSummarySnapshot as Partial<FullCalculationResult> | null;
    const sav = snap?.comparison?.monthlyOperationalSavingIdr;
    if (typeof sav === 'number' && sav > 0) {
      totalSaving += sav;
      validCount += 1;
    }
  }

  return {
    cities: cities.map(mapCity),
    evModels: ref.evModels,
    icePresets: ref.icePresets,
    energyTariffs: ref.energyTariffs,
    evIncentives: ref.evIncentives,
    routePresets: routes.map(mapRoutePreset),
    systemParameters: ref.systemParameters,
    macroStats: {
      avgMonthlySavingIdr: validCount > 0 ? Math.round(totalSaving / validCount) : 645_000,
      completedSimulationsCount: Math.max(simAgg.length, 1),
      activeCitiesCount: cities.length,
    },
  };
}

export function mapSavedSimulation(
  sim: Simulation & { evModel: EvModel; fuelTariff: EnergyTariff },
  fallbackRef?: ReferenceContext,
): SavedSimulationDto {
  const extra = {
    ...DEFAULT_FINANCE_BATTERY_PARAMS,
    ...((sim.financeAndBatteryParams as Record<string, unknown> | null) ?? {}),
  };
  const inputSnapshot: SimulationInput = {
    pathway: sim.pathway === 'B' ? 'B' : 'A',
    vehicleType: sim.vehicleType as VehicleType,
    icePresetId: sim.icePresetId,
    customIceName: sim.customIceName,
    iceKmPerLiter: sim.iceKmPerLiter,
    fuelCode: sim.fuelTariff.code,
    dailyDistanceKm: sim.dailyDistanceKm,
    budgetIdr: sim.budgetIdr,
    evModelId: sim.evModelId,
    homePowerVa: sim.homePowerVa,
    homeChargerKw: sim.homeChargerKw,
    baseLoadKw: sim.baseLoadKw,
    nightChargingEnabled: sim.nightChargingEnabled,
    homeChargingSharePct: sim.homeChargingSharePct,
    solarRooftopEnabled: sim.solarRooftopEnabled,
    extra,
  };

  const storedRef = sim.immutableTariffEvSnapshot as ReferenceContext | null;
  const ref =
    storedRef && Array.isArray(storedRef.evModels) && storedRef.evModels.length > 0
      ? storedRef
      : fallbackRef!;

  const storedRes = sim.calculatedSummarySnapshot as FullCalculationResult | null;
  const resultSnapshot =
    storedRes && storedRes.tco && storedRes.comparison
      ? storedRes
      : calculateFullSimulation(inputSnapshot, ref);

  return {
    id: sim.id,
    shareToken: sim.shareToken,
    pathway: inputSnapshot.pathway,
    vehicleType: inputSnapshot.vehicleType,
    customIceName: sim.customIceName,
    evBrandModel: `${sim.evModel.brand} ${sim.evModel.modelName}`,
    evModelId: sim.evModelId,
    dailyDistanceKm: sim.dailyDistanceKm,
    budgetIdr: sim.budgetIdr,
    monthlySavingIdr: resultSnapshot.comparison.monthlyOperationalSavingIdr,
    paybackLabel: resultSnapshot.tco.paybackLabel,
    tco5YearEvIdr: resultSnapshot.tco.evComponents.total5YearsIdr,
    tco5YearIceIdr: resultSnapshot.tco.iceComponents.total5YearsIdr,
    createdAt: sim.createdAt.toISOString(),
    inputSnapshot,
    referenceSnapshot: ref,
    resultSnapshot,
  };
}

