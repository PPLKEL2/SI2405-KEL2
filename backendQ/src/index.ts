import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { calculationsRouter } from "./routes/calculations.js";
import { evModelsRouter } from "./routes/ev-models.js";
import { facilitiesRouter } from "./routes/facilities.js";
import { adminRegulationRouter } from "./routes/admin-regulation.js";

export const app = express();

const staticOrigins = new Set(
  [
    process.env.CLIENT_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ].filter(Boolean) as string[]
);

const lanIpRegex =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || staticOrigins.has(origin) || lanIpRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS.`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Mount API v1 routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", calculationsRouter);
app.use("/api/v1", evModelsRouter);
app.use("/api/v1", facilitiesRouter);
app.use("/api/v1", adminRegulationRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message =
    err instanceof Error ? err.message : "Terjadi kesalahan internal pada server.";
  res.status(500).json({ success: false, error: message });
});

const PORT = Number(process.env.PORT || 4000);
const isTestRunner =
  process.env.NODE_ENV === "test" ||
  process.execArgv.includes("--test") ||
  process.argv.some((arg) => arg.includes("--test") || arg.includes(".test."));

if (!isTestRunner) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MobilitiQ Sprint 1 API] Berjalan di http://localhost:${PORT}`);
  });
}

