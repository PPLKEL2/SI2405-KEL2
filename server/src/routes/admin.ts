import { Router } from 'express';
import { z } from 'zod';
import type { AdminAnalyticsDto, AdminPartnerVerificationDto } from '@mobilitiq/shared';
import { prisma } from '../lib/prisma.js';
import {
  mapEnergyTariff,
  mapEnergyTariffHistory,
  mapEvIncentive,
  mapPartnerDoc,
} from '../lib/mappers.js';
import { asyncHandler, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

adminRouter.use(requireRole('SUPERADMIN'));

adminRouter.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(now.getDate() - 83);
    twelveWeeksAgo.setHours(0, 0, 0, 0);

    const [
      consultations12w,
      simulations12w,
      partners,
      funnelGroups,
      cities,
    ] = await Promise.all([
      prisma.consultationSession.findMany({
        where: { startedAt: { gte: twelveWeeksAgo } },
        select: { pathway: true, startedAt: true },
      }),
      prisma.simulation.findMany({
        where: { createdAt: { gte: twelveWeeksAgo } },
        select: { pathway: true, vehicleType: true, createdAt: true, user: { select: { cityId: true } } },
      }),
      prisma.partner.findMany({ select: { verificationStatus: true } }),
      prisma.funnelEvent.groupBy({
        by: ['stageName'],
        _count: { _all: true },
      }),
      prisma.city.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { facilities: { where: { deletedAt: null, isActive: true } } } },
        },
      }),
    ]);

    const consultations30d = consultations12w.filter((c) => c.startedAt >= thirtyDaysAgo);
    const simulations30d = simulations12w.filter((s) => s.createdAt >= thirtyDaysAgo);

    const totalConsult30d = consultations30d.length;
    const pathACount = consultations30d.filter((c) => c.pathway === 'A').length;
    const pathwayAPct =
      totalConsult30d > 0 ? Math.round((pathACount / totalConsult30d) * 100) : 58;
    const pathwayBPct = totalConsult30d > 0 ? 100 - pathwayAPct : 42;

    const savedToReportRatePct =
      totalConsult30d > 0
        ? Math.min(100, Math.round((simulations30d.length / totalConsult30d) * 100))
        : 0;

    const weeklyTrend12w: AdminAnalyticsDto['weeklyTrend12w'] = [];
    for (let w = 11; w >= 0; w -= 1) {
      const start = new Date(now);
      start.setDate(now.getDate() - (w + 1) * 7 + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      const cCount = consultations12w.filter(
        (c) => c.startedAt >= start && c.startedAt < end,
      ).length;
      const sCount = simulations12w.filter(
        (s) => s.createdAt >= start && s.createdAt < end,
      ).length;
      weeklyTrend12w.push({
        label: `M${12 - w}`,
        consultations: cCount,
        savedSimulations: sCount,
      });
    }

    const motorCount = simulations12w.filter((s) => s.vehicleType === 'Motor').length;
    const mobilCount = simulations12w.filter((s) => s.vehicleType === 'Mobil').length;
    const totalVeh = motorCount + mobilCount;

    const stageDefs = [
      { stageName: 'LANDING_VISIT', label: 'Kunjungan Halaman Utama' },
      { stageName: 'CHATBOT_START', label: 'Mulai Konsultasi Chatbot' },
      { stageName: 'TEASER_VIEW', label: 'Lihat Ringkasan Teaser' },
      { stageName: 'LOGIN_COMPLETE', label: 'Masuk / Daftar Akun' },
      { stageName: 'SIMULATION_SAVED', label: 'Simpan Simulasi TCO' },
      { stageName: 'PDF_EXPORTED', label: 'Unduh Laporan PDF A4' },
    ];
    const funnelMap = new Map(funnelGroups.map((g) => [g.stageName, g._count._all]));
    const topStageCount = Math.max(1, funnelMap.get('LANDING_VISIT') ?? 1);

    const funnelStages = stageDefs.map((sd) => {
      const cnt = funnelMap.get(sd.stageName) ?? 0;
      return {
        stageName: sd.stageName,
        label: sd.label,
        count: cnt,
        pct: Math.min(100, Math.round((cnt / topStageCount) * 100)),
      };
    });

    const topCities = cities.map((c) => ({
      cityName: c.name,
      simulationsCount: simulations12w.filter((s) => s.user?.cityId === c.id).length,
      facilitiesCount: c._count.facilities,
    }));

    const payload: AdminAnalyticsDto = {
      totalConsultations30d: totalConsult30d,
      savedToReportRatePct,
      pathwayAPct,
      pathwayBPct,
      verifiedPartnersCount: partners.filter((p) => p.verificationStatus === 'APPROVED').length,
      pendingPartnersCount: partners.filter((p) => p.verificationStatus === 'PENDING').length,
      weeklyTrend12w,
      vehicleSplit: {
        motorCount,
        mobilCount,
        motorPct: totalVeh > 0 ? Math.round((motorCount / totalVeh) * 100) : 62,
        mobilPct: totalVeh > 0 ? 100 - Math.round((motorCount / totalVeh) * 100) : 38,
      },
      funnelStages,
      topCities,
    };

    res.json(payload);
  }),
);

adminRouter.get(
  '/energy-tariffs',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.energyTariff.findMany({
      orderBy: [{ category: 'asc' }, { powerVaMin: 'asc' }, { pricePerUnitIdr: 'asc' }],
    });
    res.json({ items: rows.map(mapEnergyTariff) });
  }),
);

adminRouter.get(
  '/energy-tariffs/histories',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.energyTariffHistory.findMany({
      include: { energyTariff: true, changedBy: true },
      orderBy: { effectiveFrom: 'desc' },
      take: 30,
    });
    res.json({ items: rows.map(mapEnergyTariffHistory) });
  }),
);

const updateTariffSchema = z.object({
  pricePerUnitIdr: z.number().min(100).max(500_000),
  upgradeFeeIdr: z.number().min(0).max(50_000_000).nullable().optional(),
  subsidyType: z.string().trim().min(2).max(60).optional(),
  isActive: z.boolean().optional(),
});

adminRouter.put(
  '/energy-tariffs/:id',
  asyncHandler(async (req, res) => {
    const body = updateTariffSchema.parse(req.body);
    const existing = await prisma.energyTariff.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Tarif energi tidak ditemukan.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.energyTariff.update({
        where: { id: existing.id },
        data: {
          pricePerUnitIdr: body.pricePerUnitIdr,
          ...(body.upgradeFeeIdr !== undefined ? { upgradeFeeIdr: body.upgradeFeeIdr } : {}),
          ...(body.subsidyType !== undefined ? { subsidyType: body.subsidyType } : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
          updatedById: req.authUser!.id,
        },
      });

      if (Math.abs(existing.pricePerUnitIdr - body.pricePerUnitIdr) > 0.001) {
        await tx.energyTariffHistory.create({
          data: {
            energyTariffId: existing.id,
            oldPriceIdr: existing.pricePerUnitIdr,
            newPriceIdr: body.pricePerUnitIdr,
            changedById: req.authUser!.id,
          },
        });
      }
      return next;
    });

    res.json({ item: mapEnergyTariff(updated) });
  }),
);

adminRouter.get(
  '/incentives',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.evIncentive.findMany({ orderBy: { code: 'asc' } });
    res.json({ items: rows.map(mapEvIncentive) });
  }),
);

const createIncentiveSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9_]/g, '_')),
  policyName: z.string().trim().min(3).max(160),
  applicableVehicleType: z.enum(['Mobil', 'Motor', 'Semua EV']),
  calculationType: z.enum(['percentage', 'fixed_idr', 'tax_exemption']),
  benefitValue: z.number().min(0).max(500_000_000),
  benefitDisplayText: z.string().trim().min(1).max(100),
  legalBasis: z.string().trim().min(3).max(180),
  isActive: z.boolean().default(true),
});

adminRouter.post(
  '/incentives',
  asyncHandler(async (req, res) => {
    const body = createIncentiveSchema.parse(req.body);
    const created = await prisma.evIncentive.create({
      data: {
        ...body,
        updatedById: req.authUser!.id,
      },
    });
    res.status(201).json({ item: mapEvIncentive(created) });
  }),
);

const patchIncentiveSchema = z.object({
  policyName: z.string().trim().min(3).max(160).optional(),
  benefitValue: z.number().min(0).max(500_000_000).optional(),
  benefitDisplayText: z.string().trim().min(1).max(100).optional(),
  legalBasis: z.string().trim().min(3).max(180).optional(),
  isActive: z.boolean().optional(),
});

adminRouter.patch(
  '/incentives/:id',
  asyncHandler(async (req, res) => {
    const body = patchIncentiveSchema.parse(req.body);
    const updated = await prisma.evIncentive.update({
      where: { id: req.params.id },
      data: {
        ...body,
        updatedById: req.authUser!.id,
      },
    });
    res.json({ item: mapEvIncentive(updated) });
  }),
);

adminRouter.get(
  '/partners',
  asyncHandler(async (req, res) => {
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
    const rows = await prisma.partner.findMany({
      where:
        statusFilter === 'PENDING' || statusFilter === 'APPROVED' || statusFilter === 'REJECTED'
          ? { verificationStatus: statusFilter }
          : {},
      include: {
        owner: true,
        city: true,
        documents: { orderBy: { docType: 'asc' } },
      },
      orderBy: [{ submittedAt: 'desc' }],
    });

    const items: AdminPartnerVerificationDto[] = rows.map((p) => ({
      id: p.id,
      companyName: p.companyName,
      partnerCategory: p.partnerCategory,
      cityName: p.city?.name ?? 'Jakarta',
      picName: p.owner.fullName,
      picEmail: p.picEmail,
      verificationStatus: p.verificationStatus,
      rejectionNote: p.rejectionNote,
      submittedAt: p.submittedAt.toISOString(),
      verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
      documents: p.documents.map(mapPartnerDoc),
    }));

    res.json({ items });
  }),
);

const verifyPartnerSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  rejectionNote: z.string().trim().max(300).optional().nullable(),
});

adminRouter.post(
  '/partners/:id/verify',
  asyncHandler(async (req, res) => {
    const body = verifyPartnerSchema.parse(req.body);
    const partner = await prisma.partner.findUnique({
      where: { id: req.params.id },
      include: { documents: true, owner: true, city: true },
    });

    if (!partner) {
      res.status(404).json({ error: 'Pengajuan Mitra tidak ditemukan.' });
      return;
    }

    if (body.decision === 'APPROVED') {
      const incomplete = partner.documents.filter((d) => !d.isComplete);
      if (incomplete.length > 0) {
        res.status(400).json({
          error: `Persetujuan ditolak: ${incomplete.length} dokumen legal belum lengkap (${incomplete.map((d) => d.docLabel).join(', ')}).`,
        });
        return;
      }
    }

    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: {
        verificationStatus: body.decision,
        verifiedById: req.authUser!.id,
        verifiedAt: new Date(),
        rejectionNote:
          body.decision === 'REJECTED'
            ? body.rejectionNote || 'Dokumen legal belum sesuai persyaratan verifikasi.'
            : null,
      },
      include: { owner: true, city: true, documents: { orderBy: { docType: 'asc' } } },
    });

    const item: AdminPartnerVerificationDto = {
      id: updated.id,
      companyName: updated.companyName,
      partnerCategory: updated.partnerCategory,
      cityName: updated.city?.name ?? 'Jakarta',
      picName: updated.owner.fullName,
      picEmail: updated.picEmail,
      verificationStatus: updated.verificationStatus,
      rejectionNote: updated.rejectionNote,
      submittedAt: updated.submittedAt.toISOString(),
      verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : null,
      documents: updated.documents.map(mapPartnerDoc),
    };

    res.json({ item });
  }),
);

