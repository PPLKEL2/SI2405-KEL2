import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { SessionPayload, UserAccount, UserRole } from "../types/domain.js";
import { userRepository } from "../storage/user-repository.js";

export const SESSION_COOKIE_NAME = "mobilitiq_sid";

export function getSessionTtlSeconds(): number {
  const raw = Number(process.env.SESSION_TTL_SECONDS);
  if (Number.isFinite(raw) && raw >= 60) {
    return Math.floor(raw);
  }
  return 24 * 60 * 60; // Default: 86.400 detik (24 jam)
}

const activeSessions = new Map<string, SessionPayload>();

function getSigningSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.SESSION_DEV_KEY ||
    "mobilitiq-local-sprint1-session-hmac-key-2026"
  );
}

export function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, actualSalt, 64).toString("hex");
  return `scrypt$${actualSalt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  const [, salt, expectedHex] = parts;
  const actualHex = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");
  const actualBuf = Buffer.from(actualHex, "hex");
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function toPublicUser(user: UserAccount | SessionPayload) {
  const id = "userId" in user ? user.userId : user.id;
  return {
    id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationName: user.organizationName,
    city: user.city,
    homePowerVa: user.homePowerVa,
  };
}

function signSessionId(sessionId: string): string {
  const hmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(sessionId)
    .digest("hex");
  return `${sessionId}.${hmac}`;
}

function verifySignedToken(token: string): string | null {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx <= 0) return null;
  const sessionId = token.slice(0, dotIdx);
  const providedHmac = token.slice(dotIdx + 1);
  const expectedHmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(sessionId)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedHmac, "hex");
  const providedBuf = Buffer.from(providedHmac, "hex");
  if (expectedBuf.length !== providedBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) return null;
  return sessionId;
}

export function createSessionForUser(user: UserAccount): {
  signedToken: string;
  session: SessionPayload;
} {
  const sessionId = crypto.randomBytes(24).toString("hex");
  const now = new Date();
  const ttlMs = getSessionTtlSeconds() * 1000;
  const expires = new Date(now.getTime() + ttlMs);

  const session: SessionPayload = {
    sessionId,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationName: user.organizationName,
    city: user.city,
    homePowerVa: user.homePowerVa,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  activeSessions.set(sessionId, session);
  return {
    signedToken: signSessionId(sessionId),
    session,
  };
}

export function destroySessionByToken(token: string | undefined): void {
  if (!token) return;
  const sessionId = verifySignedToken(token);
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
}

export function parseCookieHeader(
  cookieHeader: string | undefined
): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim();
      const val = decodeURIComponent(part.slice(eqIdx + 1).trim());
      result[key] = val;
    }
  }
  return result;
}

export function getSessionFromRequest(req: Request): SessionPayload | null {
  const cookies = parseCookieHeader(req.headers.cookie);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return null;

  const sessionId = verifySignedToken(rawToken);
  if (!sessionId) return null;

  const session = activeSessions.get(sessionId);
  if (!session) return null;

  if (Date.now() > new Date(session.expiresAt).getTime()) {
    activeSessions.delete(sessionId);
    return null;
  }

  const user = userRepository.findById(session.userId);
  if (!user || !user.isActive) {
    activeSessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Menentukan apakah atribut cookie `Secure` wajib diaktifkan:
 * - Aktif otomatis apabila request berjalan di atas HTTPS (`req.secure` atau `X-Forwarded-Proto: https`),
 *   atau `COOKIE_SECURE=true`, atau `NODE_ENV=production` (kecuali `COOKIE_SECURE=false`).
 * - Pada mode development localhost (`http://localhost`), `Secure` tidak disematkan secara default
 *   agar browser mengizinkan penyimpanan cookie HTTP-only melalui koneksi HTTP lokal.
 */
export function shouldUseSecureCookie(req?: Request): boolean {
  const envFlag = process.env.COOKIE_SECURE?.toLowerCase();
  if (envFlag === "true") return true;
  if (envFlag === "false") return false;

  if (req) {
    const protoHeader = String(req.headers["x-forwarded-proto"] || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    if (req.secure || protoHeader === "https") {
      return true;
    }
  }

  return process.env.NODE_ENV === "production";
}

export function setSessionCookie(
  res: Response,
  signedToken: string,
  req?: Request
): void {
  const maxAgeSec = getSessionTtlSeconds();
  const expiresUtc = new Date(Date.now() + maxAgeSec * 1000).toUTCString();
  const secureAttr = shouldUseSecureCookie(req) ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      signedToken
    )}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; Expires=${expiresUtc}; SameSite=Lax${secureAttr}`
  );
}

export function clearSessionCookie(res: Response, req?: Request): void {
  const epochUtc = new Date(0).toUTCString();
  const secureAttr = shouldUseSecureCookie(req) ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; Expires=${epochUtc}; SameSite=Lax${secureAttr}`
  );
}

declare global {
  namespace Express {
    interface Request {
      authSession?: SessionPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({
      success: false,
      code: "UNAUTHENTICATED",
      error:
        "Sesi login tidak ditemukan atau telah berakhir. Silakan masuk terlebih dahulu.",
    });
    return;
  }
  req.authSession = session;
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const session = getSessionFromRequest(req);
    if (!session) {
      res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error:
          "Sesi login tidak ditemukan atau telah berakhir. Silakan masuk terlebih dahulu.",
      });
      return;
    }

    if (!allowedRoles.includes(session.role)) {
      res.status(403).json({
        success: false,
        code: "FORBIDDEN_ROLE",
        error: `Akses ditolak. Halaman atau tindakan ini memerlukan hak akses ${allowedRoles.join(
          " / "
        )}, sedangkan peran akun Anda adalah ${session.role}.`,
      });
      return;
    }

    req.authSession = session;
    next();
  };
}

export function resolveRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "MITRA":
      return "/mitra/katalog";
    case "SUPERADMIN":
      return "/admin/tarif-energi";
    case "USER":
    default:
      return "/kalkulator/bbm";
  }
}
