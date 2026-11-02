import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@mobilitiq/shared';
import { prisma } from '../lib/prisma.js';

export const AUTH_COOKIE_NAME = 'mobilitiq_token';
const JWT_SECRET = process.env.JWT_SECRET || 'mobilitiq-kel2-dev-secret-change-in-production';

export interface AuthJwtPayload {
  sub: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        role: UserRole;
        partnerId: string | null;
        partnerStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
      };
      guestSessionToken?: string;
    }
  }
}

export function signAuthCookie(res: Response, payload: AuthJwtPayload): void {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const headerGuest = req.header('x-guest-session');
  if (headerGuest && headerGuest.trim().length > 0) {
    req.guestSessionToken = headerGuest.trim().slice(0, 128);
  }

  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { ownedPartner: true },
    });
    if (user) {
      req.authUser = {
        id: user.id,
        role: user.role as UserRole,
        partnerId: user.ownedPartner?.id ?? null,
        partnerStatus: user.ownedPartner?.verificationStatus ?? null,
      };
    }
  } catch {
    // ponytail: expired/tampered cookie degrades cleanly to anonymous guest
  }
  next();
};

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.authUser) {
    res.status(401).json({ error: 'Silakan masuk terlebih dahulu.' });
    return;
  }
  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.authUser) {
      res.status(401).json({ error: 'Silakan masuk terlebih dahulu.' });
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({ error: 'Akses ditolak untuk peran akun Anda.' });
      return;
    }
    next();
  };
}

export const requireApprovedPartner: RequestHandler = (req, res, next) => {
  if (!req.authUser || req.authUser.role !== 'MITRA' || !req.authUser.partnerId) {
    res.status(403).json({ error: 'Hanya akun Mitra yang dapat mengakses fitur ini.' });
    return;
  }
  if (req.authUser.partnerStatus !== 'APPROVED') {
    res.status(403).json({
      error:
        'Akun Mitra Anda belum disetujui Superadmin. Lengkapi dokumen legal dan tunggu verifikasi.',
    });
    return;
  }
  next();
};

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

