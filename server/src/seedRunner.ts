import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {
  calculateFullSimulation,
  DEFAULT_FINANCE_BATTERY_PARAMS,
  DEFAULT_SYSTEM_PARAMETERS,
  resolveFuelTariff,
  resolvePlnTariffForVa,
  type SimulationInput,
} from '@mobilitiq/shared';
import type { Prisma } from '@prisma/client';
import { prisma } from './lib/prisma.js';
import { loadReferenceContext } from './lib/mappers.js';

export async function runSeed(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const cityDefs = [
    { slug: 'jakarta', name: 'Jakarta', centerLat: -6.2088, centerLng: 106.8456, defaultZoom: 12 },
    { slug: 'bandung', name: 'Bandung', centerLat: -6.9175, centerLng: 107.6191, defaultZoom: 12 },
    { slug: 'surabaya', name: 'Surabaya', centerLat: -7.2575, centerLng: 112.7521, defaultZoom: 12 },
  ];

  const cityBySlug = new Map<string, string>();
  for (const c of cityDefs) {
    const row = await prisma.city.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    cityBySlug.set(c.slug, row.id);
  }

  const jakartaId = cityBySlug.get('jakarta')!;
  const bandungId = cityBySlug.get('bandung')!;
  const surabayaId = cityBySlug.get('surabaya')!;

  const paramDescriptions: Record<string, string> = {
    plnPowerFactor: 'Faktor daya efektif PLN rumah tangga (cos phi)',
    chargerEfficiency: 'Efisiensi pengisian AC home charger',
    nightLoadFactor: 'Faktor reduksi beban dasar rumah saat pengisian malam',
    degradationRateAc: 'Laju degradasi SoH tahunan untuk pengisian AC rutin',
    degradationRateMix: 'Laju degradasi SoH tahunan untuk bauran AC + DC',
    degradationRateDc: 'Laju degradasi SoH tahunan untuk dominan DC fast charge',
    warrantySohThreshold: 'Ambang klaim garansi SoH pabrikan (%)',
    depositRateAnnual: 'Bunga tahunan deposito dana cadangan baterai',
    defaultBatteryPriceMotorPerKwh: 'Harga acuan penggantian baterai motor listrik per kWh (Rp)',
    defaultBatteryPriceMobilPerKwh: 'Harga acuan penggantian baterai mobil listrik per kWh (Rp)',
    wltpRealFactor: 'Faktor konversi WLTP ke jarak tempuh riil perkotaan',
    penaltyAc: 'Penalti konsumsi jarak tempuh saat AC kabin aktif',
    penaltyRain: 'Penalti konsumsi jarak tempuh saat hujan atau macet padat',
    penaltyLoad: 'Penalti konsumsi jarak tempuh saat muatan penuh atau tanjakan',
    rooftopSolarEmissionKgKwh: 'Faktor emisi PLTS atap per kWh (kg CO2/kWh)',
    treeAbsorptionKgYear: 'Serapan karbon rata-rata 1 pohon dewasa per tahun (kg CO2)',
    iceOilShare: 'Porsi biaya oli mesin dari total servis rutin kendaraan BBM',
    icePeriodicShare: 'Porsi servis berkala dari total servis rutin kendaraan BBM',
    iceTireBrakeShare: 'Porsi ban & kampas rem dari total servis rutin kendaraan BBM',
  };

  for (const [key, val] of Object.entries(DEFAULT_SYSTEM_PARAMETERS)) {
    await prisma.systemParameter.upsert({
      where: { key },
      update: {
        valueType: 'number',
        paramValue: String(val),
        description: paramDescriptions[key] ?? key,
      },
      create: {
        key,
        valueType: 'number',
        paramValue: String(val),
        description: paramDescriptions[key] ?? key,
      },
    });
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mobilitiq.id' },
    update: { fullName: 'Superadmin MobilitiQ', role: 'SUPERADMIN', cityId: jakartaId, passwordHash },
    create: {
      fullName: 'Superadmin MobilitiQ',
      email: 'admin@mobilitiq.id',
      passwordHash,
      role: 'SUPERADMIN',
      cityId: jakartaId,
      homePowerVa: 2200,
      notificationPref: { create: { tariffIncentiveAlert: true, monthlyReportReminder: true } },
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@mobilitiq.id' },
    update: { fullName: 'Rina Anggraini', role: 'USER', cityId: jakartaId, homePowerVa: 1300, passwordHash },
    create: {
      fullName: 'Rina Anggraini',
      email: 'user@mobilitiq.id',
      passwordHash,
      role: 'USER',
      cityId: jakartaId,
      homePowerVa: 1300,
      notificationPref: { create: { tariffIncentiveAlert: true, monthlyReportReminder: false } },
    },
  });

  const mitraApprovedUser = await prisma.user.upsert({
    where: { email: 'mitra@mobilitiq.id' },
    update: { fullName: 'Budi Santoso', role: 'MITRA', cityId: jakartaId, homePowerVa: 3500, passwordHash },
    create: {
      fullName: 'Budi Santoso',
      email: 'mitra@mobilitiq.id',
      passwordHash,
      role: 'MITRA',
      cityId: jakartaId,
      homePowerVa: 3500,
      notificationPref: { create: { tariffIncentiveAlert: true, monthlyReportReminder: true } },
    },
  });

  const mitraPendingIncompleteUser = await prisma.user.upsert({
    where: { email: 'mitra.pending@mobilitiq.id' },
    update: { fullName: 'Deni Kurniawan', role: 'MITRA', cityId: bandungId, passwordHash },
    create: {
      fullName: 'Deni Kurniawan',
      email: 'mitra.pending@mobilitiq.id',
      passwordHash,
      role: 'MITRA',
      cityId: bandungId,
      homePowerVa: 2200,
      notificationPref: { create: { tariffIncentiveAlert: true, monthlyReportReminder: false } },
    },
  });

  const mitraPendingCompleteUser = await prisma.user.upsert({
    where: { email: 'surya.elektrik@mobilitiq.id' },
    update: { fullName: 'Hendra Wijaya', role: 'MITRA', cityId: surabayaId, passwordHash },
    create: {
      fullName: 'Hendra Wijaya',
      email: 'surya.elektrik@mobilitiq.id',
      passwordHash,
      role: 'MITRA',
      cityId: surabayaId,
      homePowerVa: 3500,
      notificationPref: { create: { tariffIncentiveAlert: true, monthlyReportReminder: false } },
    },
  });

  const mitraRejectedUser = await prisma.user.upsert({
    where: { email: 'ekoride@mobilitiq.id' },
    update: { fullName: 'Eko Prasetyo', role: 'MITRA', cityId: jakartaId, passwordHash },
    create: {
      fullName: 'Eko Prasetyo',
      email: 'ekoride@mobilitiq.id',
      passwordHash,
      role: 'MITRA',
      cityId: jakartaId,
      homePowerVa: 2200,
      notificationPref: { create: { tariffIncentiveAlert: true, monthlyReportReminder: false } },
    },
  });

  const docCatalog = [
    { docType: 'NIB', docLabel: 'Nomor Induk Berusaha (NIB)' },
    { docType: 'NPWP', docLabel: 'NPWP Badan Usaha' },
    { docType: 'IZIN_LOKASI', docLabel: 'Izin lokasi atau dealership resmi' },
    { docType: 'SERTIFIKAT_UJI', docLabel: 'Sertifikat uji instalasi kelistrikan' },
  ];

  async function upsertPartnerWithDocs(opts: {
    ownerUserId: string;
    cityId: string;
    companyName: string;
    partnerCategory: string;
    picEmail: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionNote?: string | null;
    completedCount: number;
  }) {
    const partner = await prisma.partner.upsert({
      where: { ownerUserId: opts.ownerUserId },
      update: {
        cityId: opts.cityId,
        companyName: opts.companyName,
        partnerCategory: opts.partnerCategory,
        picEmail: opts.picEmail,
        verificationStatus: opts.verificationStatus,
        rejectionNote: opts.rejectionNote ?? null,
        verifiedById: opts.verificationStatus !== 'PENDING' ? adminUser.id : null,
        verifiedAt: opts.verificationStatus !== 'PENDING' ? new Date() : null,
      },
      create: {
        ownerUserId: opts.ownerUserId,
        cityId: opts.cityId,
        companyName: opts.companyName,
        partnerCategory: opts.partnerCategory,
        picEmail: opts.picEmail,
        verificationStatus: opts.verificationStatus,
        rejectionNote: opts.rejectionNote ?? null,
        verifiedById: opts.verificationStatus !== 'PENDING' ? adminUser.id : null,
        verifiedAt: opts.verificationStatus !== 'PENDING' ? new Date() : null,
      },
    });

    for (let idx = 0; idx < docCatalog.length; idx += 1) {
      const dc = docCatalog[idx];
      const isComplete = idx < opts.completedCount;
      await prisma.partnerDocument.upsert({
        where: { partnerId_docType: { partnerId: partner.id, docType: dc.docType } },
        update: {
          docLabel: dc.docLabel,
          isComplete,
          fileUrl: isComplete
            ? `https://docs.mobilitiq.id/${partner.id.slice(0, 8)}/${dc.docType.toLowerCase()}.pdf`
            : null,
        },
        create: {
          partnerId: partner.id,
          docType: dc.docType,
          docLabel: dc.docLabel,
          isComplete,
          fileUrl: isComplete
            ? `https://docs.mobilitiq.id/${partner.id.slice(0, 8)}/${dc.docType.toLowerCase()}.pdf`
            : null,
        },
      });
    }
    return partner;
  }

  const approvedPartner = await upsertPartnerWithDocs({
    ownerUserId: mitraApprovedUser.id,
    cityId: jakartaId,
    companyName: 'Showroom EV Pondok Indah & Charge Point',
    partnerCategory: 'Showroom & SPKLU',
    picEmail: 'mitra@mobilitiq.id',
    verificationStatus: 'APPROVED',
    completedCount: 4,
  });

  await upsertPartnerWithDocs({
    ownerUserId: mitraPendingIncompleteUser.id,
    cityId: bandungId,
    companyName: 'Volta Mobilitas Nusantara',
    partnerCategory: 'SPBKLU',
    picEmail: 'mitra.pending@mobilitiq.id',
    verificationStatus: 'PENDING',
    completedCount: 3,
  });

  await upsertPartnerWithDocs({
    ownerUserId: mitraPendingCompleteUser.id,
    cityId: surabayaId,
    companyName: 'PT Surya Elektrik Motor',
    partnerCategory: 'Showroom',
    picEmail: 'surya.elektrik@mobilitiq.id',
    verificationStatus: 'PENDING',
    completedCount: 4,
  });

  await upsertPartnerWithDocs({
    ownerUserId: mitraRejectedUser.id,
    cityId: jakartaId,
    companyName: 'Eko Ride Garage',
    partnerCategory: 'Showroom',
    picEmail: 'ekoride@mobilitiq.id',
    verificationStatus: 'REJECTED',
    rejectionNote: 'NPWP Badan Usaha, izin lokasi, dan sertifikat uji instalasi belum diunggah.',
    completedCount: 1,
  });

  const tariffDefs = [
    {
      category: 'BBM' as const,
      code: 'PERTALITE',
      displayName: 'Pertalite (RON 90)',
      subsidyType: 'Subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 10_000,
      unitLabel: 'liter',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 2.28,
    },
    {
      category: 'BBM' as const,
      code: 'PERTAMAX',
      displayName: 'Pertamax (RON 92)',
      subsidyType: 'Non-subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 12_500,
      unitLabel: 'liter',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 2.3,
    },
    {
      category: 'BBM' as const,
      code: 'PERTAMAX_TURBO',
      displayName: 'Pertamax Turbo (RON 98)',
      subsidyType: 'Non-subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 14_400,
      unitLabel: 'liter',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 2.35,
    },
    {
      category: 'BBM' as const,
      code: 'BIOSOLAR',
      displayName: 'Biosolar (CN 48)',
      subsidyType: 'Subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 6_800,
      unitLabel: 'liter',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 2.68,
    },
    {
      category: 'BBM' as const,
      code: 'DEXLITE',
      displayName: 'Dexlite (CN 51)',
      subsidyType: 'Non-subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 13_300,
      unitLabel: 'liter',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 2.68,
    },
    {
      category: 'PLN' as const,
      code: 'PLN_R1_450',
      displayName: 'R-1 / 450 VA',
      subsidyType: 'Subsidi',
      powerVaMin: 450,
      powerVaMax: 450,
      pricePerUnitIdr: 415,
      unitLabel: 'kWh',
      upgradeFeeIdr: 0,
      emissionKgCo2PerUnit: 0.87,
    },
    {
      category: 'PLN' as const,
      code: 'PLN_R1_900_SUB',
      displayName: 'R-1 / 900 VA (Subsidi DTKS)',
      subsidyType: 'Subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 605,
      unitLabel: 'kWh',
      upgradeFeeIdr: 0,
      emissionKgCo2PerUnit: 0.87,
    },
    {
      category: 'PLN' as const,
      code: 'PLN_R1M_900',
      displayName: 'R-1M / 900 VA (RTM)',
      subsidyType: 'Non-subsidi',
      powerVaMin: 900,
      powerVaMax: 900,
      pricePerUnitIdr: 1352,
      unitLabel: 'kWh',
      upgradeFeeIdr: 850_000,
      emissionKgCo2PerUnit: 0.87,
    },
    {
      category: 'PLN' as const,
      code: 'PLN_R1_1300',
      displayName: 'R-1 / 1.300 VA',
      subsidyType: 'Non-subsidi',
      powerVaMin: 1300,
      powerVaMax: 1300,
      pricePerUnitIdr: 1444.7,
      unitLabel: 'kWh',
      upgradeFeeIdr: 1_150_000,
      emissionKgCo2PerUnit: 0.87,
    },
    {
      category: 'PLN' as const,
      code: 'PLN_R1_2200',
      displayName: 'R-1 / 2.200 VA',
      subsidyType: 'Non-subsidi',
      powerVaMin: 2200,
      powerVaMax: 2200,
      pricePerUnitIdr: 1444.7,
      unitLabel: 'kWh',
      upgradeFeeIdr: 2_050_000,
      emissionKgCo2PerUnit: 0.87,
    },
    {
      category: 'PLN' as const,
      code: 'PLN_R2_3500',
      displayName: 'R-2 / 3.500 - 5.500 VA',
      subsidyType: 'Non-subsidi',
      powerVaMin: 3500,
      powerVaMax: 33000,
      pricePerUnitIdr: 1699.53,
      unitLabel: 'kWh',
      upgradeFeeIdr: 3_900_000,
      emissionKgCo2PerUnit: 0.87,
    },
    {
      category: 'SPKLU_REF' as const,
      code: 'SPKLU_NASIONAL',
      displayName: 'Tarif Acuan SPKLU Publik',
      subsidyType: 'Non-subsidi',
      powerVaMin: null,
      powerVaMax: null,
      pricePerUnitIdr: 2466,
      unitLabel: 'kWh',
      upgradeFeeIdr: null,
      emissionKgCo2PerUnit: 0.87,
    },
  ];

  const tariffByCode = new Map<string, string>();
  for (const t of tariffDefs) {
    const row = await prisma.energyTariff.upsert({
      where: { code: t.code },
      update: { ...t, updatedById: adminUser.id },
      create: { ...t, updatedById: adminUser.id },
    });
    tariffByCode.set(t.code, row.id);
  }

  const existingHistCount = await prisma.energyTariffHistory.count();
  if (existingHistCount === 0) {
    const d1 = new Date();
    d1.setDate(d1.getDate() - 18);
    const d2 = new Date();
    d2.setDate(d2.getDate() - 7);
    await prisma.energyTariffHistory.createMany({
      data: [
        {
          energyTariffId: tariffByCode.get('PERTAMAX')!,
          oldPriceIdr: 12_950,
          newPriceIdr: 12_500,
          changedById: adminUser.id,
          effectiveFrom: d1,
        },
        {
          energyTariffId: tariffByCode.get('DEXLITE')!,
          oldPriceIdr: 13_600,
          newPriceIdr: 13_300,
          changedById: adminUser.id,
          effectiveFrom: d2,
        },
      ],
    });
  }

  const incentiveDefs = [
    {
      code: 'PPN_DTP_10',
      policyName: 'PPN DTP mobil listrik CKD (TKDN >= 40%)',
      applicableVehicleType: 'Mobil',
      calculationType: 'percentage',
      benefitValue: 10,
      benefitDisplayText: '10% dari harga',
      legalBasis: 'PMK PPN DTP · Berlaku s.d. 31 Des 2026',
      isActive: true,
    },
    {
      code: 'BEA_MASUK_CBU',
      policyName: 'Bea masuk CBU mobil listrik komitmen produksi',
      applicableVehicleType: 'Mobil',
      calculationType: 'tax_exemption',
      benefitValue: 0,
      benefitDisplayText: '0%',
      legalBasis: 'PMK Bea Masuk · Berlaku s.d. 31 Des 2026',
      isActive: true,
    },
    {
      code: 'PKB_0',
      policyName: 'PKB tahunan kendaraan bermotor listrik',
      applicableVehicleType: 'Semua EV',
      calculationType: 'tax_exemption',
      benefitValue: 0,
      benefitDisplayText: '0% (opsen 0%)',
      legalBasis: 'UU HKPD · Berlaku permanen',
      isActive: true,
    },
    {
      code: 'BBNKB_0',
      policyName: 'BBN-KB penyerahan kendaraan listrik baru',
      applicableVehicleType: 'Semua EV',
      calculationType: 'tax_exemption',
      benefitValue: 0,
      benefitDisplayText: '0%',
      legalBasis: 'UU HKPD · Berlaku permanen',
      isActive: true,
    },
    {
      code: 'SUBSIDI_MOTOR_5JT',
      policyName: 'Bantuan pembelian motor listrik roda dua',
      applicableVehicleType: 'Motor',
      calculationType: 'fixed_idr',
      benefitValue: 5_000_000,
      benefitDisplayText: 'Rp 5.000.000',
      legalBasis: 'Kuota Kemenperin · Evaluasi 30 Sep 2026',
      isActive: false,
    },
  ];

  for (const inc of incentiveDefs) {
    await prisma.evIncentive.upsert({
      where: { code: inc.code },
      update: { ...inc, updatedById: adminUser.id },
      create: { ...inc, updatedById: adminUser.id },
    });
  }

  const iceDefs = [
    {
      modelName: 'Honda Vario 125',
      vehicleType: 'Motor' as const,
      defaultKmPerLiter: 45,
      defaultFuelCode: 'PERTALITE',
      estimatedOtrPriceIdr: 24_500_000,
      estimatedResalePriceIdr: 12_000_000,
      serviceCostPerKmIdr: 47,
      annualStnkTaxIdr: 400_000,
    },
    {
      modelName: 'Honda Beat',
      vehicleType: 'Motor' as const,
      defaultKmPerLiter: 52,
      defaultFuelCode: 'PERTALITE',
      estimatedOtrPriceIdr: 19_500_000,
      estimatedResalePriceIdr: 10_500_000,
      serviceCostPerKmIdr: 47,
      annualStnkTaxIdr: 350_000,
    },
    {
      modelName: 'Yamaha NMAX',
      vehicleType: 'Motor' as const,
      defaultKmPerLiter: 40,
      defaultFuelCode: 'PERTAMAX',
      estimatedOtrPriceIdr: 33_000_000,
      estimatedResalePriceIdr: 18_000_000,
      serviceCostPerKmIdr: 52,
      annualStnkTaxIdr: 500_000,
    },
    {
      modelName: 'Toyota Avanza',
      vehicleType: 'Mobil' as const,
      defaultKmPerLiter: 12.5,
      defaultFuelCode: 'PERTALITE',
      estimatedOtrPriceIdr: 270_000_000,
      estimatedResalePriceIdr: 110_000_000,
      serviceCostPerKmIdr: 230,
      annualStnkTaxIdr: 3_500_000,
    },
    {
      modelName: 'Honda Brio',
      vehicleType: 'Mobil' as const,
      defaultKmPerLiter: 15,
      defaultFuelCode: 'PERTALITE',
      estimatedOtrPriceIdr: 215_000_000,
      estimatedResalePriceIdr: 105_000_000,
      serviceCostPerKmIdr: 210,
      annualStnkTaxIdr: 2_900_000,
    },
    {
      modelName: 'Mitsubishi Xpander',
      vehicleType: 'Mobil' as const,
      defaultKmPerLiter: 12,
      defaultFuelCode: 'PERTAMAX',
      estimatedOtrPriceIdr: 295_000_000,
      estimatedResalePriceIdr: 135_000_000,
      serviceCostPerKmIdr: 245,
      annualStnkTaxIdr: 3_800_000,
    },
  ];

  for (const ice of iceDefs) {
    await prisma.iceVehiclePreset.upsert({
      where: { modelName: ice.modelName },
      update: ice,
      create: ice,
    });
  }

  const evDefs = [
    {
      slug: 'fox-r',
      brand: 'Polytron',
      modelName: 'Fox-R',
      vehicleType: 'Motor' as const,
      batteryKwh: 2.4,
      otrPriceIdr: 23_900_000,
      wltpRangeKm: 85,
      consumptionKwh100km: 3.2,
      acChargerKw: 0.4,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '3 th / 30.000 km',
      promoLabel: 'Gratis wallbox',
      comparableIceName: 'Honda Vario 125',
      comparableIcePriceIdr: 24_500_000,
      battReplaceIdr: 8_400_000,
      ownedByApprovedPartner: true,
    },
    {
      slug: 'g1',
      brand: 'Gesits',
      modelName: 'G1',
      vehicleType: 'Motor' as const,
      batteryKwh: 1.8,
      otrPriceIdr: 29_900_000,
      wltpRangeKm: 70,
      consumptionKwh100km: 3.4,
      acChargerKw: 0.35,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '3 th / 30.000 km',
      promoLabel: null,
      comparableIceName: 'Honda Vario 125',
      comparableIcePriceIdr: 24_500_000,
      battReplaceIdr: 6_300_000,
      ownedByApprovedPartner: true,
    },
    {
      slug: 't1800',
      brand: 'United',
      modelName: 'T1800',
      vehicleType: 'Motor' as const,
      batteryKwh: 3.0,
      otrPriceIdr: 33_500_000,
      wltpRangeKm: 100,
      consumptionKwh100km: 3.5,
      acChargerKw: 0.6,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '5 th / 50.000 km',
      promoLabel: 'Cashback Rp 2 jt',
      comparableIceName: 'Yamaha NMAX 155',
      comparableIcePriceIdr: 33_000_000,
      battReplaceIdr: 10_500_000,
      ownedByApprovedPartner: false,
    },
    {
      slug: 'em1',
      brand: 'Honda',
      modelName: 'EM1 e:',
      vehicleType: 'Motor' as const,
      batteryKwh: 1.5,
      otrPriceIdr: 40_000_000,
      wltpRangeKm: 48,
      consumptionKwh100km: 3.1,
      acChargerKw: 0.3,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '3 th / 30.000 km',
      promoLabel: null,
      comparableIceName: 'Honda Vario 160',
      comparableIcePriceIdr: 28_500_000,
      battReplaceIdr: 5_250_000,
      ownedByApprovedPartner: false,
    },
    {
      slug: 'alva',
      brand: 'Alva',
      modelName: 'One',
      vehicleType: 'Motor' as const,
      batteryKwh: 3.4,
      otrPriceIdr: 36_800_000,
      wltpRangeKm: 120,
      consumptionKwh100km: 2.9,
      acChargerKw: 0.7,
      dcChargerKw: 0,
      serviceCostPerKmIdr: 14,
      annualPkbTaxIdr: 0,
      warrantyLabel: '3 th / 40.000 km',
      promoLabel: 'Bunga 0% 12 bln',
      comparableIceName: 'Yamaha NMAX 155',
      comparableIcePriceIdr: 33_000_000,
      battReplaceIdr: 11_900_000,
      ownedByApprovedPartner: true,
    },
    {
      slug: 'seagull',
      brand: 'BYD',
      modelName: 'Seagull',
      vehicleType: 'Mobil' as const,
      batteryKwh: 38.9,
      otrPriceIdr: 150_000_000,
      wltpRangeKm: 305,
      consumptionKwh100km: 11.5,
      acChargerKw: 7.0,
      dcChargerKw: 40,
      serviceCostPerKmIdr: 89,
      annualPkbTaxIdr: 0,
      warrantyLabel: '8 th / 160.000 km',
      promoLabel: 'DP mulai 10%',
      comparableIceName: 'Honda Brio RS',
      comparableIcePriceIdr: 215_000_000,
      battReplaceIdr: 85_580_000,
      ownedByApprovedPartner: true,
    },
    {
      slug: 'air',
      brand: 'Wuling',
      modelName: 'Air ev Long Range',
      vehicleType: 'Mobil' as const,
      batteryKwh: 41.3,
      otrPriceIdr: 238_000_000,
      wltpRangeKm: 300,
      consumptionKwh100km: 12.4,
      acChargerKw: 6.6,
      dcChargerKw: 40,
      serviceCostPerKmIdr: 89,
      annualPkbTaxIdr: 0,
      warrantyLabel: '8 th / 160.000 km',
      promoLabel: null,
      comparableIceName: 'Toyota Agya GR',
      comparableIcePriceIdr: 190_000_000,
      battReplaceIdr: 90_860_000,
      ownedByApprovedPartner: true,
    },
    {
      slug: 'ec3',
      brand: 'Citroën',
      modelName: 'ë-C3',
      vehicleType: 'Mobil' as const,
      batteryKwh: 44.0,
      otrPriceIdr: 359_000_000,
      wltpRangeKm: 320,
      consumptionKwh100km: 14.2,
      acChargerKw: 7.4,
      dcChargerKw: 100,
      serviceCostPerKmIdr: 89,
      annualPkbTaxIdr: 0,
      warrantyLabel: '8 th / 160.000 km',
      promoLabel: 'Free servis 3 th',
      comparableIceName: 'Toyota Avanza',
      comparableIcePriceIdr: 270_000_000,
      battReplaceIdr: 96_800_000,
      ownedByApprovedPartner: false,
    },
    {
      slug: 'ioniq5',
      brand: 'Hyundai',
      modelName: 'Ioniq 5 Signature',
      vehicleType: 'Mobil' as const,
      batteryKwh: 72.6,
      otrPriceIdr: 780_000_000,
      wltpRangeKm: 451,
      consumptionKwh100km: 16.8,
      acChargerKw: 11.0,
      dcChargerKw: 220,
      serviceCostPerKmIdr: 89,
      annualPkbTaxIdr: 0,
      warrantyLabel: '8 th / 160.000 km',
      promoLabel: 'Wallbox 7 kW gratis',
      comparableIceName: 'Toyota Innova Zenix',
      comparableIcePriceIdr: 450_000_000,
      battReplaceIdr: 159_720_000,
      ownedByApprovedPartner: true,
    },
  ];

  const evIdBySlug = new Map<string, string>();
  for (const ev of evDefs) {
    const { battReplaceIdr, ownedByApprovedPartner, ...data } = ev;
    const partnerId = ownedByApprovedPartner ? approvedPartner.id : null;
    const row = await prisma.evModel.upsert({
      where: { slug: ev.slug },
      update: { ...data, partnerId, deletedAt: null },
      create: { ...data, partnerId },
    });
    evIdBySlug.set(ev.slug, row.id);

    await prisma.batteryReplacementPrice.upsert({
      where: { evModelId: row.id },
      update: {
        partnerId,
        replacementPriceIdr: battReplaceIdr,
        warrantyNote: ev.warrantyLabel,
      },
      create: {
        evModelId: row.id,
        partnerId,
        replacementPriceIdr: battReplaceIdr,
        warrantyNote: ev.warrantyLabel,
      },
    });
  }

  const routeDefs = [
    { routeLabel: 'Kantor harian', distanceKm: 38, sortOrder: 1 },
    { routeLabel: 'Surabaya - Malang', distanceKm: 95, sortOrder: 2 },
    { routeLabel: 'Jakarta - Bandung', distanceKm: 150, sortOrder: 3 },
    { routeLabel: 'Jakarta - Semarang', distanceKm: 450, sortOrder: 4 },
  ];
  for (const rp of routeDefs) {
    await prisma.routePreset.upsert({
      where: { routeLabel: rp.routeLabel },
      update: rp,
      create: rp,
    });
  }

  const facilityDefs = [
    {
      cityId: jakartaId,
      partnerId: approvedPartner.id,
      facilityName: 'SPKLU PLN UP3 Menteng',
      facilityType: 'SPKLU' as const,
      fullAddress: 'Jl. Moh. Ikhwan Ridwan Rais No. 1, Menteng, Jakarta Pusat',
      latitude: -6.1972,
      longitude: 106.8375,
      powerOrSlotSpec: 'DC 50 kW · CCS2',
      operatingHours: '24 jam',
      serviceTariffIdr: 2466,
      tariffUnitLabel: 'kWh',
    },
    {
      cityId: jakartaId,
      partnerId: approvedPartner.id,
      facilityName: 'SPKLU Plaza Senayan',
      facilityType: 'SPKLU' as const,
      fullAddress: 'Jl. Asia Afrika No. 8, Gelora, Tanah Abang, Jakarta Pusat',
      latitude: -6.2253,
      longitude: 106.7991,
      powerOrSlotSpec: 'AC 22 kW · Type 2',
      operatingHours: '10.00-22.00',
      serviceTariffIdr: 2466,
      tariffUnitLabel: 'kWh',
    },
    {
      cityId: jakartaId,
      partnerId: approvedPartner.id,
      facilityName: 'SPBKLU Gesits Kuningan',
      facilityType: 'SPBKLU' as const,
      fullAddress: 'Jl. H.R. Rasuna Said Kav. C-22, Kuningan, Jakarta Selatan',
      latitude: -6.2214,
      longitude: 106.8329,
      powerOrSlotSpec: 'Swap baterai · 9 slot',
      operatingHours: '06.00-23.00',
      serviceTariffIdr: 12_000,
      tariffUnitLabel: 'tukar',
    },
    {
      cityId: jakartaId,
      partnerId: approvedPartner.id,
      facilityName: 'SPBKLU Alva Kemang',
      facilityType: 'SPBKLU' as const,
      fullAddress: 'Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan, Jakarta Selatan',
      latitude: -6.2607,
      longitude: 106.8133,
      powerOrSlotSpec: 'Swap baterai · 6 slot',
      operatingHours: '07.00-22.00',
      serviceTariffIdr: 14_000,
      tariffUnitLabel: 'tukar',
    },
    {
      cityId: jakartaId,
      partnerId: approvedPartner.id,
      facilityName: 'Showroom Wuling Sudirman',
      facilityType: 'Showroom' as const,
      fullAddress: 'Jl. Jend. Sudirman Kav. 52-53, SCBD, Jakarta Selatan',
      latitude: -6.2156,
      longitude: 106.8096,
      powerOrSlotSpec: 'Mobil listrik',
      operatingHours: '09.00-19.00',
      serviceTariffIdr: 0,
      tariffUnitLabel: 'Test drive gratis',
    },
    {
      cityId: bandungId,
      partnerId: null,
      facilityName: 'SPKLU PLN Dago',
      facilityType: 'SPKLU' as const,
      fullAddress: 'Jl. Ir. H. Juanda No. 112, Coblong, Bandung',
      latitude: -6.8904,
      longitude: 107.6128,
      powerOrSlotSpec: 'DC 50 kW · CCS2',
      operatingHours: '24 jam',
      serviceTariffIdr: 2466,
      tariffUnitLabel: 'kWh',
    },
    {
      cityId: bandungId,
      partnerId: null,
      facilityName: 'SPBKLU Volta Buah Batu',
      facilityType: 'SPBKLU' as const,
      fullAddress: 'Jl. Buah Batu No. 184, Lengkong, Bandung',
      latitude: -6.9425,
      longitude: 107.6285,
      powerOrSlotSpec: 'Swap baterai · 8 slot',
      operatingHours: '06.00-22.00',
      serviceTariffIdr: 11_000,
      tariffUnitLabel: 'tukar',
    },
    {
      cityId: bandungId,
      partnerId: null,
      facilityName: 'Showroom BYD Pasteur',
      facilityType: 'Showroom' as const,
      fullAddress: 'Jl. Dr. Djunjunan No. 143, Pasteur, Bandung',
      latitude: -6.8938,
      longitude: 107.5872,
      powerOrSlotSpec: 'Mobil listrik',
      operatingHours: '09.00-18.00',
      serviceTariffIdr: 0,
      tariffUnitLabel: 'Test drive gratis',
    },
    {
      cityId: surabayaId,
      partnerId: null,
      facilityName: 'SPKLU PLN Tunjungan',
      facilityType: 'SPKLU' as const,
      fullAddress: 'Jl. Embong Malang No. 38, Genteng, Surabaya',
      latitude: -7.2592,
      longitude: 112.7381,
      powerOrSlotSpec: 'DC 100 kW · CCS2',
      operatingHours: '24 jam',
      serviceTariffIdr: 2466,
      tariffUnitLabel: 'kWh',
    },
    {
      cityId: surabayaId,
      partnerId: null,
      facilityName: 'SPBKLU United Gubeng',
      facilityType: 'SPBKLU' as const,
      fullAddress: 'Jl. Raya Gubeng No. 66, Gubeng, Surabaya',
      latitude: -7.2694,
      longitude: 112.7495,
      powerOrSlotSpec: 'Swap baterai · 6 slot',
      operatingHours: '06.00-22.00',
      serviceTariffIdr: 12_500,
      tariffUnitLabel: 'tukar',
    },
    {
      cityId: surabayaId,
      partnerId: null,
      facilityName: 'Showroom Hyundai Mayjen Sungkono',
      facilityType: 'Showroom' as const,
      fullAddress: 'Jl. Mayjen Sungkono No. 125, Dukuh Pakis, Surabaya',
      latitude: -7.2916,
      longitude: 112.7176,
      powerOrSlotSpec: 'Mobil listrik',
      operatingHours: '09.00-19.00',
      serviceTariffIdr: 0,
      tariffUnitLabel: 'Test drive gratis',
    },
  ];

  const seededFacilityIds: string[] = [];
  for (const fac of facilityDefs) {
    const existing = await prisma.facility.findFirst({
      where: { facilityName: fac.facilityName },
    });
    if (existing) {
      const updated = await prisma.facility.update({
        where: { id: existing.id },
        data: { ...fac, deletedAt: null },
      });
      seededFacilityIds.push(updated.id);
    } else {
      const created = await prisma.facility.create({ data: fac });
      seededFacilityIds.push(created.id);
    }
  }

  const existingSims = await prisma.simulation.count();
  if (existingSims === 0) {
    const ref = await loadReferenceContext(false);
    const varioPreset = ref.icePresets.find((p) => p.modelName === 'Honda Vario 125')!;
    const avanzaPreset = ref.icePresets.find((p) => p.modelName === 'Toyota Avanza')!;
    const brioPreset = ref.icePresets.find((p) => p.modelName === 'Honda Brio')!;
    const nmaxPreset = ref.icePresets.find((p) => p.modelName === 'Yamaha NMAX')!;

    const sampleSeeds: { shareToken: string; daysAgo: number; input: SimulationInput }[] = [
      {
        shareToken: 'demo-rina-foxr',
        daysAgo: 1,
        input: {
          pathway: 'A',
          vehicleType: 'Motor',
          icePresetId: varioPreset.id,
          customIceName: 'Honda Vario 125',
          iceKmPerLiter: 45,
          fuelCode: 'PERTALITE',
          dailyDistanceKm: 38,
          budgetIdr: 30_000_000,
          evModelId: evIdBySlug.get('fox-r')!,
          homePowerVa: 1300,
          homeChargerKw: 0.4,
          baseLoadKw: 0.45,
          nightChargingEnabled: true,
          homeChargingSharePct: 85,
          solarRooftopEnabled: false,
          extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS },
        },
      },
      {
        shareToken: 'demo-rina-seagull',
        daysAgo: 5,
        input: {
          pathway: 'A',
          vehicleType: 'Mobil',
          icePresetId: brioPreset.id,
          customIceName: 'Honda Brio',
          iceKmPerLiter: 15,
          fuelCode: 'PERTALITE',
          dailyDistanceKm: 45,
          budgetIdr: 200_000_000,
          evModelId: evIdBySlug.get('seagull')!,
          homePowerVa: 2200,
          homeChargerKw: 2.2,
          baseLoadKw: 0.7,
          nightChargingEnabled: true,
          homeChargingSharePct: 80,
          solarRooftopEnabled: false,
          extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS },
        },
      },
      {
        shareToken: 'demo-rina-air-ev',
        daysAgo: 12,
        input: {
          pathway: 'B',
          vehicleType: 'Mobil',
          icePresetId: avanzaPreset.id,
          customIceName: 'Toyota Avanza',
          iceKmPerLiter: 12.5,
          fuelCode: 'PERTALITE',
          dailyDistanceKm: 52,
          budgetIdr: 260_000_000,
          evModelId: evIdBySlug.get('air')!,
          homePowerVa: 3500,
          homeChargerKw: 6.6,
          baseLoadKw: 0.9,
          nightChargingEnabled: true,
          homeChargingSharePct: 85,
          solarRooftopEnabled: false,
          extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS },
        },
      },
      {
        shareToken: 'demo-rina-alva',
        daysAgo: 21,
        input: {
          pathway: 'B',
          vehicleType: 'Motor',
          icePresetId: nmaxPreset.id,
          customIceName: 'Yamaha NMAX',
          iceKmPerLiter: 40,
          fuelCode: 'PERTAMAX',
          dailyDistanceKm: 42,
          budgetIdr: 40_000_000,
          evModelId: evIdBySlug.get('alva')!,
          homePowerVa: 1300,
          homeChargerKw: 0.7,
          baseLoadKw: 0.4,
          nightChargingEnabled: true,
          homeChargingSharePct: 90,
          solarRooftopEnabled: true,
          extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS },
        },
      },
    ];

    for (const s of sampleSeeds) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - s.daysAgo);
      const res = calculateFullSimulation(s.input, ref);
      const fuel = resolveFuelTariff(s.input.fuelCode, ref.energyTariffs);
      const pln = resolvePlnTariffForVa(s.input.homePowerVa, ref.energyTariffs);

      const cs = await prisma.consultationSession.create({
        data: {
          userId: demoUser.id,
          pathway: s.input.pathway,
          answersPayload: {
            vehicleType: s.input.vehicleType,
            dailyDistanceKm: s.input.dailyDistanceKm,
            budgetIdr: s.input.budgetIdr,
          },
          recommendedEvId: s.input.evModelId,
          startedAt: createdAt,
          completedAt: createdAt,
        },
      });

      await prisma.simulation.create({
        data: {
          userId: demoUser.id,
          consultationSessionId: cs.id,
          shareToken: s.shareToken,
          pathway: s.input.pathway,
          vehicleType: s.input.vehicleType,
          icePresetId: s.input.icePresetId,
          customIceName: s.input.customIceName,
          iceKmPerLiter: s.input.iceKmPerLiter,
          fuelTariffId: fuel.id,
          plnTariffId: pln.id,
          dailyDistanceKm: s.input.dailyDistanceKm,
          budgetIdr: s.input.budgetIdr,
          evModelId: s.input.evModelId,
          homePowerVa: s.input.homePowerVa,
          homeChargerKw: s.input.homeChargerKw,
          baseLoadKw: s.input.baseLoadKw,
          nightChargingEnabled: s.input.nightChargingEnabled,
          homeChargingSharePct: s.input.homeChargingSharePct,
          solarRooftopEnabled: s.input.solarRooftopEnabled,
          financeAndBatteryParams: s.input.extra as unknown as Prisma.InputJsonValue,
          immutableTariffEvSnapshot: ref as unknown as Prisma.InputJsonValue,
          calculatedSummarySnapshot: res as unknown as Prisma.InputJsonValue,
          isSavedToHistory: true,
          createdAt,
        },
      });
    }
  }

  const existingConsultCount = await prisma.consultationSession.count();
  if (existingConsultCount < 30) {
    const weeklyCounts = [6, 8, 7, 9, 11, 10, 13, 14, 15, 17, 19, 22];
    const evRotate = [
      evIdBySlug.get('fox-r')!,
      evIdBySlug.get('seagull')!,
      evIdBySlug.get('air')!,
      evIdBySlug.get('alva')!,
    ];
    for (let w = 0; w < weeklyCounts.length; w += 1) {
      const daysBack = (11 - w) * 7 + 2;
      for (let k = 0; k < weeklyCounts[w]; k += 1) {
        const dt = new Date();
        dt.setDate(dt.getDate() - daysBack + (k % 5));
        await prisma.consultationSession.create({
          data: {
            pathway: k % 5 < 3 ? 'A' : 'B',
            answersPayload: { seededWeek: w + 1 },
            recommendedEvId: evRotate[k % evRotate.length],
            startedAt: dt,
            completedAt: dt,
          },
        });
      }
    }
  }

  const existingLeadCount = await prisma.partnerLead.count();
  if (existingLeadCount === 0) {
    const dailyClicks = [4, 6, 5, 8, 7, 11, 9];
    const partnerEvIds = [
      evIdBySlug.get('fox-r')!,
      evIdBySlug.get('seagull')!,
      evIdBySlug.get('air')!,
      evIdBySlug.get('alva')!,
    ];
    for (let d = 0; d < 7; d += 1) {
      const dt = new Date();
      dt.setDate(dt.getDate() - (6 - d));
      for (let c = 0; c < dailyClicks[d]; c += 1) {
        await prisma.partnerLead.create({
          data: {
            partnerId: approvedPartner.id,
            evModelId: partnerEvIds[c % partnerEvIds.length],
            facilityId: seededFacilityIds[c % 5],
            eventType: c % 2 === 0 ? 'TEST_DRIVE_CLICK' : 'DIRECTIONS_CLICK',
            createdAt: dt,
          },
        });
      }
    }
  }

  const existingFunnel = await prisma.funnelEvent.count();
  if (existingFunnel === 0) {
    const funnelCounts: [string, number][] = [
      ['LANDING_VISIT', 420],
      ['CHATBOT_START', 265],
      ['TEASER_VIEW', 198],
      ['LOGIN_COMPLETE', 124],
      ['SIMULATION_SAVED', 96],
      ['PDF_EXPORTED', 61],
    ];
    for (const [stageName, total] of funnelCounts) {
      const batch = Array.from({ length: total }, (_, idx) => ({
        sessionToken: `seed-sess-${idx}`,
        stageName,
        pathway: idx % 2 === 0 ? 'A' : 'B',
      }));
      await prisma.funnelEvent.createMany({ data: batch });
    }
  }

  console.log('[MobilitiQ Seed] Database seeded idempotently across all 18 tables.');
}

