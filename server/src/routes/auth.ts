import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { mapUser } from '../lib/mappers.js';
import {
  asyncHandler,
  clearAuthCookie,
  requireAuth,
  signAuthCookie,
} from '../middleware/auth.js';

export const authRouter = Router();

const DEFAULT_PARTNER_DOCS = [
  { docType: 'NIB', docLabel: 'Nomor Induk Berusaha (NIB)' },
  { docType: 'NPWP', docLabel: 'NPWP Badan Usaha' },
  { docType: 'IZIN_LOKASI', docLabel: 'Izin lokasi atau dealership resmi' },
  { docType: 'SERTIFIKAT_UJI', docLabel: 'Sertifikat uji instalasi kelistrikan' },
];

async function claimGuestRecords(userId: string, guestToken?: string): Promise<void> {
  if (!guestToken) return;
  await Promise.all([
    prisma.simulation.updateMany({
      where: { guestSessionToken: guestToken, userId: null },
      data: { userId },
    }),
    prisma.consultationSession.updateMany({
      where: { guestSessionToken: guestToken, userId: null },
      data: { userId },
    }),
  ]);
}

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120),
  email: z.string().trim().email('Format email tidak valid').transform((v) => v.toLowerCase()),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(128),
  accountType: z.enum(['USER', 'MITRA']).default('USER'),
  cityId: z.string().uuid().optional().nullable(),
  homePowerVa: z.number().int().min(450).max(33000).optional(),
  companyName: z.string().trim().min(2).max(160).optional(),
  partnerCategory: z.string().trim().min(2).max(80).optional(),
  completedDocTypes: z.array(z.string()).optional(),
});

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan masuk.' });
      return;
    }

    if (body.accountType === 'MITRA' && (!body.companyName || !body.partnerCategory)) {
      res.status(400).json({ error: 'Nama perusahaan dan kategori mitra wajib diisi.' });
      return;
    }

    const defaultCity =
      (body.cityId
        ? await prisma.city.findUnique({ where: { id: body.cityId } })
        : null) ?? (await prisma.city.findFirst({ where: { slug: 'jakarta' } }));

    const passwordHash = await bcrypt.hash(body.password, 10);
    const completedSet = new Set(body.completedDocTypes ?? ['NIB', 'NPWP']);

    const created = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        passwordHash,
        role: body.accountType,
        cityId: defaultCity?.id ?? null,
        homePowerVa: body.homePowerVa ?? 1300,
        notificationPref: {
          create: { tariffIncentiveAlert: true, monthlyReportReminder: false },
        },
        ...(body.accountType === 'MITRA'
          ? {
              ownedPartner: {
                create: {
                  companyName: body.companyName!,
                  partnerCategory: body.partnerCategory!,
                  picEmail: body.email,
                  cityId: defaultCity?.id ?? null,
                  verificationStatus: 'PENDING',
                  documents: {
                    create: DEFAULT_PARTNER_DOCS.map((d) => ({
                      docType: d.docType,
                      docLabel: d.docLabel,
                      isComplete: completedSet.has(d.docType),
                      fileUrl: completedSet.has(d.docType)
                        ? `https://docs.mobilitiq.id/mitra/${d.docType.toLowerCase()}.pdf`
                        : null,
                    })),
                  },
                },
              },
            }
          : {}),
      },
      include: { city: true, notificationPref: true, ownedPartner: true },
    });

    await claimGuestRecords(created.id, req.guestSessionToken);
    signAuthCookie(res, { sub: created.id, role: created.role });
    res.status(201).json({ user: mapUser(created) });
  }),
);

const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { city: true, notificationPref: true, ownedPartner: true },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
      return;
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
      return;
    }

    await claimGuestRecords(user.id, req.guestSessionToken);
    signAuthCookie(res, { sub: user.id, role: user.role });
    res.json({ user: mapUser(user) });
  }),
);

const googleSimSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .default('user@mobilitiq.id')
    .transform((v) => v.toLowerCase()),
  fullName: z.string().trim().min(2).max(120).optional().default('Pengguna Google MobilitiQ'),
});

authRouter.post(
  '/google',
  asyncHandler(async (req, res) => {
    const body = googleSimSchema.parse(req.body ?? {});
    let user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { city: true, notificationPref: true, ownedPartner: true },
    });

    if (!user) {
      const jakarta = await prisma.city.findFirst({ where: { slug: 'jakarta' } });
      user = await prisma.user.create({
        data: {
          fullName: body.fullName,
          email: body.email,
          googleSub: `google-sim-${Date.now()}`,
          role: 'USER',
          cityId: jakarta?.id ?? null,
          homePowerVa: 1300,
          notificationPref: {
            create: { tariffIncentiveAlert: true, monthlyReportReminder: false },
          },
        },
        include: { city: true, notificationPref: true, ownedPartner: true },
      });
    }

    await claimGuestRecords(user.id, req.guestSessionToken);
    signAuthCookie(res, { sub: user.id, role: user.role });
    res.json({ user: mapUser(user) });
  }),
);

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.authUser) {
      res.json({ user: null });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.authUser.id },
      include: { city: true, notificationPref: true, ownedPartner: true },
    });
    res.json({ user: user ? mapUser(user) : null });
  }),
);

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  cityId: z.string().uuid().optional(),
  homePowerVa: z.number().int().min(450).max(33000).optional(),
  tariffIncentiveAlert: z.boolean().optional(),
  monthlyReportReminder: z.boolean().optional(),
});

authRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = updateProfileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.authUser!.id },
      data: {
        ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
        ...(body.cityId !== undefined ? { cityId: body.cityId } : {}),
        ...(body.homePowerVa !== undefined ? { homePowerVa: body.homePowerVa } : {}),
        ...(body.tariffIncentiveAlert !== undefined || body.monthlyReportReminder !== undefined
          ? {
              notificationPref: {
                upsert: {
                  create: {
                    tariffIncentiveAlert: body.tariffIncentiveAlert ?? true,
                    monthlyReportReminder: body.monthlyReportReminder ?? false,
                  },
                  update: {
                    ...(body.tariffIncentiveAlert !== undefined
                      ? { tariffIncentiveAlert: body.tariffIncentiveAlert }
                      : {}),
                    ...(body.monthlyReportReminder !== undefined
                      ? { monthlyReportReminder: body.monthlyReportReminder }
                      : {}),
                  },
                },
              },
            }
          : {}),
      },
      include: { city: true, notificationPref: true, ownedPartner: true },
    });
    res.json({ user: mapUser(updated) });
  }),
);

