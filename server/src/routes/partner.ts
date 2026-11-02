import { Router } from 'express';
import { z } from 'zod';
import type { PartnerDashboardDto, VehicleType } from '@mobilitiq/shared';
import { prisma } from '../lib/prisma.js';
import { mapEvModel, mapFacility, mapPartnerDoc } from '../lib/mappers.js';
import {
  asyncHandler,
  requireApprovedPartner,
  requireRole,
} from '../middleware/auth.js';

export const partnerRouter = Router();

partnerRouter.use(requireRole('MITRA'));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

partnerRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const partner = await prisma.partner.findUnique({
      where: { ownerUserId: req.authUser!.id },
      include: {
        city: true,
        documents: { orderBy: { docType: 'asc' } },
        evModels: {
          where: { deletedAt: null },
          include: {
            batteryPrices: true,
            _count: { select: { recommendedSessions: true, leads: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
        facilities: { where: { deletedAt: null } },
      },
    });

    if (!partner) {
      res.status(404).json({ error: 'Profil Mitra tidak ditemukan.' });
      return;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [recentLeads, monthlyRecs] = await Promise.all([
      prisma.partnerLead.findMany({
        where: {
          partnerId: partner.id,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.partnerLead.count({
        where: {
          partnerId: partner.id,
          eventType: 'RECOMMENDATION_IMPRESSION',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const dayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
    const leads7Days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const cnt = recentLeads.filter(
        (l) =>
          l.eventType !== 'RECOMMENDATION_IMPRESSION' &&
          l.createdAt >= start &&
          l.createdAt < end,
      ).length;
      leads7Days.push({ label: dayFormatter.format(start), count: cnt });
    }

    const weeklyTestDriveClicks = leads7Days.reduce((acc, x) => acc + x.count, 0);

    const topRecommendedUnits = partner.evModels
      .map((m) => ({
        id: m.id,
        name: `${m.brand} ${m.modelName}`,
        vehicleType: m.vehicleType as VehicleType,
        recommendationCount: m._count.recommendedSessions,
        leadCount: m._count.leads,
      }))
      .sort((a, b) => b.recommendationCount + b.leadCount - (a.recommendationCount + a.leadCount))
      .slice(0, 5);

    const allEvForBattery = await prisma.evModel.findMany({
      where: {
        deletedAt: null,
        OR: [{ partnerId: partner.id }, { partnerId: null }],
      },
      include: { batteryPrices: true },
      orderBy: [{ vehicleType: 'asc' }, { otrPriceIdr: 'asc' }],
    });

    const payload: PartnerDashboardDto = {
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        partnerCategory: partner.partnerCategory,
        picEmail: partner.picEmail,
        cityId: partner.cityId,
        cityName: partner.city?.name ?? 'Jakarta',
        verificationStatus: partner.verificationStatus,
        rejectionNote: partner.rejectionNote,
        submittedAt: partner.submittedAt.toISOString(),
      },
      documents: partner.documents.map(mapPartnerDoc),
      activeEvCount: partner.evModels.filter((m) => m.isActive).length,
      totalEvCount: partner.evModels.length,
      activeFacilityCount: partner.facilities.filter((f) => f.isActive).length,
      monthlyRecommendationCount:
        monthlyRecs +
        partner.evModels.reduce((acc, m) => acc + m._count.recommendedSessions, 0),
      weeklyTestDriveClicks,
      leads7Days,
      topRecommendedUnits,
      batteryPrices: allEvForBattery.map((m) => {
        const bp = m.batteryPrices[0];
        const fallbackPrice =
          m.vehicleType === 'Motor' ? m.batteryKwh * 3_500_000 : m.batteryKwh * 2_200_000;
        return {
          id: bp?.id ?? m.id,
          evModelId: m.id,
          evName: `${m.brand} ${m.modelName}`,
          vehicleType: m.vehicleType as VehicleType,
          batteryKwh: m.batteryKwh,
          replacementPriceIdr: bp?.replacementPriceIdr ?? Math.round(fallbackPrice),
          warrantyNote: bp?.warrantyNote ?? m.warrantyLabel,
          updatedAt: (bp?.updatedAt ?? m.updatedAt).toISOString(),
        };
      }),
    };

    res.json(payload);
  }),
);

const updateDocsSchema = z.object({
  documents: z.array(
    z.object({
      docType: z.string(),
      fileUrl: z.string().trim().min(5).max(500).nullable(),
      isComplete: z.boolean(),
    }),
  ),
  resubmit: z.boolean().optional(),
});

partnerRouter.put(
  '/documents',
  asyncHandler(async (req, res) => {
    const body = updateDocsSchema.parse(req.body);
    const partnerId = req.authUser!.partnerId!;

    await prisma.$transaction(async (tx) => {
      for (const d of body.documents) {
        await tx.partnerDocument.updateMany({
          where: { partnerId, docType: d.docType },
          data: {
            fileUrl: d.fileUrl,
            isComplete: d.isComplete,
            uploadedAt: new Date(),
          },
        });
      }
      if (body.resubmit) {
        await tx.partner.update({
          where: { id: partnerId },
          data: {
            verificationStatus: 'PENDING',
            rejectionNote: null,
            submittedAt: new Date(),
          },
        });
      }
    });

    const docs = await prisma.partnerDocument.findMany({
      where: { partnerId },
      orderBy: { docType: 'asc' },
    });
    res.json({ documents: docs.map(mapPartnerDoc) });
  }),
);

partnerRouter.get(
  '/ev-models',
  asyncHandler(async (req, res) => {
    const partnerId = req.authUser!.partnerId!;
    const rows = await prisma.evModel.findMany({
      where: { partnerId, deletedAt: null },
      include: { partner: true, batteryPrices: true },
      orderBy: [{ vehicleType: 'asc' }, { updatedAt: 'desc' }],
    });
    res.json({ items: rows.map(mapEvModel) });
  }),
);

const evModelFormSchema = z.object({
  brand: z.string().trim().min(1, 'Merek wajib diisi').max(80),
  modelName: z.string().trim().min(1, 'Nama model wajib diisi').max(120),
  vehicleType: z.enum(['Motor', 'Mobil']),
  batteryKwh: z.number().min(0.5).max(250),
  otrPriceIdr: z.number().min(5_000_000).max(5_000_000_000),
  wltpRangeKm: z.number().int().min(15).max(1500),
  consumptionKwh100km: z.number().min(1).max(60),
  acChargerKw: z.number().min(0.1).max(50),
  dcChargerKw: z.number().min(0).max(400),
  serviceCostPerKmIdr: z.number().min(0).max(2000),
  warrantyLabel: z.string().trim().min(2).max(120),
  promoLabel: z.string().trim().max(120).nullable().optional(),
  comparableIceName: z.string().trim().min(2).max(120),
  comparableIcePriceIdr: z.number().min(5_000_000).max(5_000_000_000),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

partnerRouter.post(
  '/ev-models',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const body = evModelFormSchema.parse(req.body);
    const partnerId = req.authUser!.partnerId!;
    const baseSlug = slugify(`${body.brand}-${body.modelName}`);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

    const created = await prisma.evModel.create({
      data: {
        partnerId,
        slug: uniqueSlug,
        brand: body.brand,
        modelName: body.modelName,
        vehicleType: body.vehicleType,
        batteryKwh: body.batteryKwh,
        otrPriceIdr: body.otrPriceIdr,
        wltpRangeKm: body.wltpRangeKm,
        consumptionKwh100km: body.consumptionKwh100km,
        acChargerKw: body.acChargerKw,
        dcChargerKw: body.dcChargerKw,
        serviceCostPerKmIdr: body.serviceCostPerKmIdr,
        warrantyLabel: body.warrantyLabel,
        promoLabel: body.promoLabel || null,
        comparableIceName: body.comparableIceName,
        comparableIcePriceIdr: body.comparableIcePriceIdr,
        imageUrl: body.imageUrl || null,
        isActive: body.isActive,
        batteryPrices: {
          create: {
            partnerId,
            replacementPriceIdr: Math.round(
              body.batteryKwh * (body.vehicleType === 'Motor' ? 3_500_000 : 2_200_000),
            ),
            warrantyNote: body.warrantyLabel,
          },
        },
      },
      include: { partner: true, batteryPrices: true },
    });

    res.status(201).json({ item: mapEvModel(created) });
  }),
);

partnerRouter.put(
  '/ev-models/:id',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const body = evModelFormSchema.parse(req.body);
    const partnerId = req.authUser!.partnerId!;
    const existing = await prisma.evModel.findFirst({
      where: { id: req.params.id, partnerId, deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: 'Unit EV tidak ditemukan atau bukan milik Mitra Anda.' });
      return;
    }

    const updated = await prisma.evModel.update({
      where: { id: existing.id },
      data: {
        brand: body.brand,
        modelName: body.modelName,
        vehicleType: body.vehicleType,
        batteryKwh: body.batteryKwh,
        otrPriceIdr: body.otrPriceIdr,
        wltpRangeKm: body.wltpRangeKm,
        consumptionKwh100km: body.consumptionKwh100km,
        acChargerKw: body.acChargerKw,
        dcChargerKw: body.dcChargerKw,
        serviceCostPerKmIdr: body.serviceCostPerKmIdr,
        warrantyLabel: body.warrantyLabel,
        promoLabel: body.promoLabel || null,
        comparableIceName: body.comparableIceName,
        comparableIcePriceIdr: body.comparableIcePriceIdr,
        imageUrl: body.imageUrl || null,
        isActive: body.isActive,
      },
      include: { partner: true, batteryPrices: true },
    });

    res.json({ item: mapEvModel(updated) });
  }),
);

partnerRouter.patch(
  '/ev-models/:id/active',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const isActive = z.boolean().parse(req.body?.isActive);
    const partnerId = req.authUser!.partnerId!;
    const existing = await prisma.evModel.findFirst({
      where: { id: req.params.id, partnerId, deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: 'Unit EV tidak ditemukan.' });
      return;
    }
    const updated = await prisma.evModel.update({
      where: { id: existing.id },
      data: { isActive },
      include: { partner: true, batteryPrices: true },
    });
    res.json({ item: mapEvModel(updated) });
  }),
);

partnerRouter.delete(
  '/ev-models/:id',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const partnerId = req.authUser!.partnerId!;
    const existing = await prisma.evModel.findFirst({
      where: { id: req.params.id, partnerId, deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: 'Unit EV tidak ditemukan.' });
      return;
    }
    await prisma.evModel.update({
      where: { id: existing.id },
      data: { isActive: false, deletedAt: new Date() },
    });
    res.json({ ok: true });
  }),
);

partnerRouter.get(
  '/facilities',
  asyncHandler(async (req, res) => {
    const partnerId = req.authUser!.partnerId!;
    const rows = await prisma.facility.findMany({
      where: { partnerId, deletedAt: null },
      include: { city: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({
      items: rows.map((f) => mapFacility(f, f.city.centerLat, f.city.centerLng)),
    });
  }),
);

const facilityFormSchema = z.object({
  cityId: z.string().uuid('Kota wajib dipilih'),
  facilityName: z.string().trim().min(2, 'Nama titik wajib diisi').max(160),
  facilityType: z.enum(['SPKLU', 'SPBKLU', 'Showroom']),
  fullAddress: z.string().trim().min(4, 'Alamat wajib diisi').max(255),
  latitude: z.number().min(-11.5).max(6.5),
  longitude: z.number().min(94.5).max(141.5),
  powerOrSlotSpec: z.string().trim().min(2).max(120),
  operatingHours: z.string().trim().min(2).max(80),
  serviceTariffIdr: z.number().min(0).max(5_000_000),
  tariffUnitLabel: z.string().trim().min(1).max(60),
  isActive: z.boolean().optional().default(true),
});

partnerRouter.post(
  '/facilities',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const body = facilityFormSchema.parse(req.body);
    const partnerId = req.authUser!.partnerId!;
    const created = await prisma.facility.create({
      data: {
        partnerId,
        cityId: body.cityId,
        facilityName: body.facilityName,
        facilityType: body.facilityType,
        fullAddress: body.fullAddress,
        latitude: body.latitude,
        longitude: body.longitude,
        powerOrSlotSpec: body.powerOrSlotSpec,
        operatingHours: body.operatingHours,
        serviceTariffIdr: body.serviceTariffIdr,
        tariffUnitLabel: body.tariffUnitLabel,
        isActive: body.isActive,
      },
      include: { city: true },
    });
    res.status(201).json({
      item: mapFacility(created, created.city.centerLat, created.city.centerLng),
    });
  }),
);

partnerRouter.put(
  '/facilities/:id',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const body = facilityFormSchema.parse(req.body);
    const partnerId = req.authUser!.partnerId!;
    const existing = await prisma.facility.findFirst({
      where: { id: req.params.id, partnerId, deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: 'Titik fasilitas tidak ditemukan.' });
      return;
    }

    const updated = await prisma.facility.update({
      where: { id: existing.id },
      data: {
        cityId: body.cityId,
        facilityName: body.facilityName,
        facilityType: body.facilityType,
        fullAddress: body.fullAddress,
        latitude: body.latitude,
        longitude: body.longitude,
        powerOrSlotSpec: body.powerOrSlotSpec,
        operatingHours: body.operatingHours,
        serviceTariffIdr: body.serviceTariffIdr,
        tariffUnitLabel: body.tariffUnitLabel,
        isActive: body.isActive,
      },
      include: { city: true },
    });

    res.json({
      item: mapFacility(updated, updated.city.centerLat, updated.city.centerLng),
    });
  }),
);

partnerRouter.delete(
  '/facilities/:id',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const partnerId = req.authUser!.partnerId!;
    const existing = await prisma.facility.findFirst({
      where: { id: req.params.id, partnerId, deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: 'Titik fasilitas tidak ditemukan.' });
      return;
    }
    await prisma.facility.update({
      where: { id: existing.id },
      data: { isActive: false, deletedAt: new Date() },
    });
    res.json({ ok: true });
  }),
);

const servicePricingSchema = z.object({
  facilityRates: z
    .array(
      z.object({
        facilityId: z.string().uuid(),
        serviceTariffIdr: z.number().min(0).max(5_000_000),
      }),
    )
    .optional(),
  batteryPrices: z
    .array(
      z.object({
        evModelId: z.string().uuid(),
        replacementPriceIdr: z.number().min(1_000_000).max(1_000_000_000),
        warrantyNote: z.string().trim().min(2).max(160),
      }),
    )
    .optional(),
});

partnerRouter.put(
  '/service-pricing',
  requireApprovedPartner,
  asyncHandler(async (req, res) => {
    const body = servicePricingSchema.parse(req.body);
    const partnerId = req.authUser!.partnerId!;

    await prisma.$transaction(async (tx) => {
      for (const fr of body.facilityRates ?? []) {
        await tx.facility.updateMany({
          where: { id: fr.facilityId, partnerId, deletedAt: null },
          data: { serviceTariffIdr: fr.serviceTariffIdr },
        });
      }
      for (const bp of body.batteryPrices ?? []) {
        await tx.batteryReplacementPrice.upsert({
          where: { evModelId: bp.evModelId },
          create: {
            evModelId: bp.evModelId,
            partnerId,
            replacementPriceIdr: bp.replacementPriceIdr,
            warrantyNote: bp.warrantyNote,
          },
          update: {
            partnerId,
            replacementPriceIdr: bp.replacementPriceIdr,
            warrantyNote: bp.warrantyNote,
          },
        });
      }
    });

    res.json({ ok: true, updatedAt: new Date().toISOString() });
  }),
);

