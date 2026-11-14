import { Router, type Request, type Response } from "express";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  createSessionForUser,
  destroySessionByToken,
  getSessionFromRequest,
  getSessionTtlSeconds,
  parseCookieHeader,
  resolveRoleRedirectPath,
  setSessionCookie,
  toPublicUser,
  verifyPassword,
} from "../auth/security.js";
import { userRepository } from "../storage/user-repository.js";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      error: "Email dan kata sandi wajib diisi.",
    });
    return;
  }

  const user = userRepository.findByEmail(email);
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({
      success: false,
      code: "INVALID_CREDENTIALS",
      error: "Email atau kata sandi yang Anda masukkan tidak sesuai.",
    });
    return;
  }

  const { signedToken, session } = createSessionForUser(user);
  setSessionCookie(res, signedToken, req);

  res.json({
    success: true,
    data: {
      user: toPublicUser(session),
      session: {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        maxAgeSeconds: getSessionTtlSeconds(),
      },
      redirectTo: resolveRoleRedirectPath(session.role),
    },
  });
});

authRouter.post("/logout", (req: Request, res: Response) => {
  const cookies = parseCookieHeader(req.headers.cookie);
  destroySessionByToken(cookies[SESSION_COOKIE_NAME]);
  clearSessionCookie(res, req);
  res.json({
    success: true,
    message: "Berhasil keluar dari sesi.",
  });
});

authRouter.get("/me", (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({
      success: false,
      code: "UNAUTHENTICATED",
      error: "Belum masuk atau sesi telah berakhir.",
    });
    return;
  }

  res.json({
    success: true,
    data: {
      user: toPublicUser(session),
      session: {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        maxAgeSeconds: getSessionTtlSeconds(),
      },
      redirectTo: resolveRoleRedirectPath(session.role),
    },
  });
});
