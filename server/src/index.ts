import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ZodError } from 'zod';
import { optionalAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { simulationsRouter } from './routes/simulations.js';
import { partnerRouter } from './routes/partner.js';
import { adminRouter } from './routes/admin.js';

export const app = express();

const allowedOrigins = new Set([
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(optionalAuth);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', (req, res, next) => {
  if (req.path === '/me') {
    req.url = '/me';
    authRouter(req, res, next);
    return;
  }
  next();
});
app.use('/api/v1', publicRouter);
app.use('/api/v1', simulationsRouter);
app.use('/api/v1/partner', partnerRouter);
app.use('/api/v1/admin', adminRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: err.issues[0]?.message || 'Data masukan tidak valid.',
      issues: err.issues,
    });
    return;
  }
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
  console.error('[MobilitiQ Server Error]', err);
  res.status(500).json({ error: message });
});

const PORT = Number(process.env.PORT || 4000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[MobilitiQ API] listening on http://localhost:${PORT}`);
  });
}

