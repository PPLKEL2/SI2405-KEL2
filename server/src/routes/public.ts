import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { loadBootstrapData, mapEvModel, mapFacility } from '../lib/mappers.js';
import { asyncHandler } from '../middleware/auth.js';

export const publicRouter = Router();

publicRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
);

publicRouter.get(
  '/reference/bootstrap',
  asyncHandler(async (_req, res) => {
    const data = await loadBootstrapData();
    res.json(data);
  }),
);

publicRouter.get(
  '/ev-models',
  asyncHandler(async (req, res) => {
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'price_asc';

    const rows = await prisma.evModel.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(type === 'Motor' || type === 'Mobil' ? { vehicleType: type } : {}),
        ...(maxBudget && !Number.isNaN(maxBudget) ? { otrPriceIdr: { lte: maxBudget } } : {}),
        ...(q
          ? {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { partner: true, batteryPrices: true },
      orderBy:
        sort === 'price_desc'
          ? { otrPriceIdr: 'desc' }
          : sort === 'range_desc'
            ? { wltpRangeKm: 'desc' }
            : sort === 'eff_asc'
              ? { consumptionKwh100km: 'asc' }
              : { otrPriceIdr: 'asc' },
    });

    res.json({ items: rows.map(mapEvModel) });
  }),
);

publicRouter.get(
  '/ev-models/compare',
  asyncHandler(async (req, res) => {
    const idsParam = typeof req.query.ids === 'string' ? req.query.ids : '';
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);

    const rows = await prisma.evModel.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(ids.length > 0 ? { OR: [{ id: { in: ids } }, { slug: { in: ids } }] } : {}),
      },
      include: { partner: true, batteryPrices: true },
      take: 4,
    });
    res.json({ items: rows.map(mapEvModel) });
  }),
);

publicRouter.get(
  '/facilities',
  asyncHandler(async (req, res) => {
    const cityFilter = typeof req.query.city === 'string' ? req.query.city.trim() : '';
    const typeFilter = typeof req.query.type === 'string' ? req.query.type.trim() : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const matchedCity = cityFilter
      ? await prisma.city.findFirst({
          where: {
            OR: [
              { id: cityFilter },
              { slug: cityFilter.toLowerCase() },
              { name: { equals: cityFilter, mode: 'insensitive' } },
            ],
          },
        })
      : await prisma.city.findFirst({ where: { slug: 'jakarta' } });

    const originLat =
      req.query.lat && !Number.isNaN(Number(req.query.lat))
        ? Number(req.query.lat)
        : (matchedCity?.centerLat ?? -6.2088);
    const originLng =
      req.query.lng && !Number.isNaN(Number(req.query.lng))
        ? Number(req.query.lng)
        : (matchedCity?.centerLng ?? 106.8456);

    const rows = await prisma.facility.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(cityFilter && matchedCity ? { cityId: matchedCity.id } : {}),
        ...(typeFilter === 'SPKLU' || typeFilter === 'SPBKLU' || typeFilter === 'Showroom'
          ? { facilityType: typeFilter }
          : {}),
        ...(q
          ? {
              OR: [
                { facilityName: { contains: q, mode: 'insensitive' } },
                { fullAddress: { contains: q, mode: 'insensitive' } },
                { powerOrSlotSpec: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { city: true },
    });

    const mapped = rows
      .map((r) => mapFacility(r, originLat, originLng))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      origin: { lat: originLat, lng: originLng, cityName: matchedCity?.name ?? 'Jakarta' },
      items: mapped,
    });
  }),
);

publicRouter.post(
  '/facilities/:id/lead',
  asyncHandler(async (req, res) => {
    const fac = await prisma.facility.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!fac) {
      res.status(404).json({ error: 'Fasilitas tidak ditemukan.' });
      return;
    }
    const eventType =
      typeof req.body?.eventType === 'string' ? req.body.eventType : 'DIRECTIONS_CLICK';
    await prisma.partnerLead.create({
      data: {
        partnerId: fac.partnerId,
        facilityId: fac.id,
        userId: req.authUser?.id ?? null,
        eventType,
      },
    });
    res.status(201).json({ ok: true });
  }),
);

publicRouter.post(
  '/ev-models/:id/lead',
  asyncHandler(async (req, res) => {
    const ev = await prisma.evModel.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!ev) {
      res.status(404).json({ error: 'Unit EV tidak ditemukan.' });
      return;
    }
    const eventType =
      typeof req.body?.eventType === 'string' ? req.body.eventType : 'TEST_DRIVE_CLICK';
    await prisma.partnerLead.create({
      data: {
        partnerId: ev.partnerId,
        evModelId: ev.id,
        userId: req.authUser?.id ?? null,
        eventType,
      },
    });
    res.status(201).json({ ok: true });
  }),
);

const funnelSchema = z.object({
  stageName: z.enum([
    'LANDING_VISIT',
    'CHATBOT_START',
    'TEASER_VIEW',
    'LOGIN_COMPLETE',
    'SIMULATION_SAVED',
    'PDF_EXPORTED',
  ]),
  pathway: z.enum(['A', 'B']).optional().nullable(),
});

publicRouter.post(
  '/events/funnel',
  asyncHandler(async (req, res) => {
    const body = funnelSchema.parse(req.body);
    await prisma.funnelEvent.create({
      data: {
        sessionToken: req.guestSessionToken ?? req.authUser?.id ?? 'anon',
        userId: req.authUser?.id ?? null,
        stageName: body.stageName,
        pathway: body.pathway ?? null,
      },
    });
    res.status(201).json({ ok: true });
  }),
);

