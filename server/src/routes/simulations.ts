import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  calculateFullSimulation,
  DEFAULT_FINANCE_BATTERY_PARAMS,
  recommendEvModel,
  resolveFuelTariff,
  resolvePlnTariffForVa,
} from '@mobilitiq/shared';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { loadReferenceContext, mapSavedSimulation } from '../lib/mappers.js';
import { asyncHandler, requireAuth } from '../middleware/auth.js';

export const simulationsRouter = Router();

const extraSchema = z
  .object({
    dpPct: z.number().min(5).max(90).optional(),
    tenorMonths: z.number().int().min(6).max(84).optional(),
    annualInterestPct: z.number().min(0).max(30).optional(),
    applyPpnDtp: z.boolean().optional(),
    applyMotorSubsidy: z.boolean().optional(),
    chargingHabit: z.enum(['ac', 'mix', 'dc']).optional(),
    ownershipYears: z.number().int().min(1).max(10).optional(),
    targetBatteryYear: z.number().int().min(3).max(15).optional(),
    batteryPricePerKwh: z.number().min(0).optional(),
    batteryAnnualDropPct: z.number().min(0).max(25).optional(),
    useDeposit: z.boolean().optional(),
    tripDistanceKm: z.number().min(1).max(2000).optional(),
    departureSocPct: z.number().min(10).max(100).optional(),
    acOn: z.boolean().optional(),
    rainTraffic: z.boolean().optional(),
    fullLoad: z.boolean().optional(),
  })
  .optional();

const simulationInputSchema = z.object({
  pathway: z.enum(['A', 'B']),
  vehicleType: z.enum(['Motor', 'Mobil']),
  icePresetId: z.string().nullable().optional(),
  customIceName: z.string().trim().min(1).max(120),
  iceKmPerLiter: z.number().min(1).max(150),
  fuelCode: z.string().trim().min(1).max(40),
  dailyDistanceKm: z.number().int().min(1).max(600),
  budgetIdr: z.number().min(5_000_000).max(5_000_000_000),
  evModelId: z.string().trim().min(1),
  homePowerVa: z.number().int().min(450).max(33000),
  homeChargerKw: z.number().min(0.2).max(22),
  baseLoadKw: z.number().min(0.1).max(25),
  nightChargingEnabled: z.boolean(),
  homeChargingSharePct: z.number().int().min(0).max(100),
  solarRooftopEnabled: z.boolean(),
  extra: extraSchema,
  consultationSessionId: z.string().uuid().optional().nullable(),
});

const consultationCreateSchema = z.object({
  pathway: z.enum(['A', 'B']),
  vehicleType: z.enum(['Motor', 'Mobil']),
  budgetIdr: z.number().min(5_000_000),
  answersPayload: z.record(z.unknown()),
  recommendedEvId: z.string().optional().nullable(),
});

simulationsRouter.post(
  '/consultations',
  asyncHandler(async (req, res) => {
    const body = consultationCreateSchema.parse(req.body);
    const ref = await loadReferenceContext(false);
    const chosenEv =
      ref.evModels.find((m) => m.id === body.recommendedEvId || m.slug === body.recommendedEvId) ??
      recommendEvModel(ref.evModels, body.vehicleType, body.budgetIdr);

    const session = await prisma.consultationSession.create({
      data: {
        userId: req.authUser?.id ?? null,
        guestSessionToken: req.guestSessionToken ?? null,
        pathway: body.pathway,
        answersPayload: body.answersPayload as Prisma.InputJsonValue,
        recommendedEvId: chosenEv?.id ?? null,
        completedAt: new Date(),
      },
    });

    if (chosenEv?.partnerId) {
      await prisma.partnerLead.create({
        data: {
          partnerId: chosenEv.partnerId,
          evModelId: chosenEv.id,
          userId: req.authUser?.id ?? null,
          eventType: 'RECOMMENDATION_IMPRESSION',
        },
      });
    }

    res.status(201).json({
      consultationSessionId: session.id,
      recommendedEv: chosenEv ?? null,
    });
  }),
);

simulationsRouter.post(
  '/simulations/calculate',
  asyncHandler(async (req, res) => {
    const parsed = simulationInputSchema.parse(req.body);
    const ref = await loadReferenceContext(false);
    const input = {
      ...parsed,
      icePresetId: parsed.icePresetId ?? null,
      extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS, ...(parsed.extra ?? {}) },
    };
    const result = calculateFullSimulation(input, ref);
    res.json({ result });
  }),
);

simulationsRouter.get(
  '/simulations',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows, ref] = await Promise.all([
      prisma.simulation.findMany({
        where: { userId: req.authUser!.id, isSavedToHistory: true },
        include: { evModel: true, fuelTariff: true },
        orderBy: { createdAt: 'desc' },
      }),
      loadReferenceContext(true),
    ]);
    res.json({ items: rows.map((r) => mapSavedSimulation(r, ref)) });
  }),
);

simulationsRouter.post(
  '/simulations',
  asyncHandler(async (req, res) => {
    const parsed = simulationInputSchema.parse(req.body);
    const ref = await loadReferenceContext(true);
    const input = {
      ...parsed,
      icePresetId: parsed.icePresetId ?? null,
      extra: { ...DEFAULT_FINANCE_BATTERY_PARAMS, ...(parsed.extra ?? {}) },
    };
    const result = calculateFullSimulation(input, ref);
    const fuelTariff = resolveFuelTariff(input.fuelCode, ref.energyTariffs);
    const plnTariff = resolvePlnTariffForVa(input.homePowerVa, ref.energyTariffs);

    const validIcePreset = ref.icePresets.find((p) => p.id === input.icePresetId);
    const shareToken = crypto.randomBytes(9).toString('base64url');

    const created = await prisma.simulation.create({
      data: {
        userId: req.authUser?.id ?? null,
        consultationSessionId: parsed.consultationSessionId ?? null,
        guestSessionToken: req.guestSessionToken ?? null,
        shareToken,
        pathway: input.pathway,
        vehicleType: result.ev.vehicleType,
        icePresetId: validIcePreset?.id ?? null,
        customIceName: input.customIceName,
        iceKmPerLiter: input.iceKmPerLiter,
        fuelTariffId: fuelTariff.id,
        plnTariffId: plnTariff.id,
        dailyDistanceKm: input.dailyDistanceKm,
        budgetIdr: input.budgetIdr,
        evModelId: result.ev.id,
        homePowerVa: input.homePowerVa,
        homeChargerKw: input.homeChargerKw,
        baseLoadKw: input.baseLoadKw,
        nightChargingEnabled: input.nightChargingEnabled,
        homeChargingSharePct: input.homeChargingSharePct,
        solarRooftopEnabled: input.solarRooftopEnabled,
        financeAndBatteryParams: input.extra as unknown as Prisma.InputJsonValue,
        immutableTariffEvSnapshot: ref as unknown as Prisma.InputJsonValue,
        calculatedSummarySnapshot: result as unknown as Prisma.InputJsonValue,
        isSavedToHistory: true,
      },
      include: { evModel: true, fuelTariff: true },
    });

    res.status(201).json({ simulation: mapSavedSimulation(created, ref) });
  }),
);

simulationsRouter.get(
  '/simulations/share/:shareToken',
  asyncHandler(async (req, res) => {
    const sim = await prisma.simulation.findUnique({
      where: { shareToken: req.params.shareToken },
      include: { evModel: true, fuelTariff: true, user: { include: { city: true } } },
    });
    if (!sim) {
      res.status(404).json({ error: 'Tautan laporan simulasi tidak ditemukan.' });
      return;
    }
    const ref = await loadReferenceContext(true);
    res.json({
      simulation: mapSavedSimulation(sim, ref),
      authorName: sim.user?.fullName ?? 'Pengguna MobilitiQ',
      cityName: sim.user?.city?.name ?? 'Jakarta',
    });
  }),
);

simulationsRouter.get(
  '/simulations/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sim = await prisma.simulation.findFirst({
      where: { id: req.params.id, userId: req.authUser!.id },
      include: { evModel: true, fuelTariff: true },
    });
    if (!sim) {
      res.status(404).json({ error: 'Simulasi tidak ditemukan.' });
      return;
    }
    const ref = await loadReferenceContext(true);
    res.json({ simulation: mapSavedSimulation(sim, ref) });
  }),
);

simulationsRouter.delete(
  '/simulations/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sim = await prisma.simulation.findFirst({
      where: { id: req.params.id, userId: req.authUser!.id },
    });
    if (!sim) {
      res.status(404).json({ error: 'Simulasi tidak ditemukan.' });
      return;
    }
    await prisma.simulation.delete({ where: { id: sim.id } });
    res.json({ ok: true });
  }),
);

