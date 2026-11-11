import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { calculatorRouter } from "./routes/calculator.js";
import { facilitiesRouter } from "./routes/facilities.js";

export const app = express();

const staticOrigins = new Set([
  process.env.CLIENT_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean) as string[]);

// Regex pola alamat IP jaringan lokal aman (Private IP RFC 1918)
// Mencakup: 192.168.x.x, 10.x.x.x, 172.16-31.x.x dengan atau tanpa port
const lanIpRegex =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan permintaan tanpa header origin (seperti curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (staticOrigins.has(origin) || lanIpRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`Origin ${origin} diblokir oleh kebijakan CORS MobilitiQ.`)
      );
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Route API v1
app.use("/api/v1", calculatorRouter);
app.use("/api/v1", facilitiesRouter);

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message =
    err instanceof Error ? err.message : "Terjadi kesalahan internal pada server.";
  console.error("[MobilitiQ Server Error]", err);
  res.status(500).json({ success: false, error: message });
});

const PORT = Number(process.env.PORT || 4000);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MobilitiQ API] Server listening on http://0.0.0.0:${PORT}`);
  });
}

