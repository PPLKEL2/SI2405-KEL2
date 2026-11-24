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

// Mendukung Private Network Access (PNA) untuk Chrome saat diakses via IP jaringan
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

// Root welcome & API explorer (menampilkan katalog API saat membuka localhost:4000)
const handleRootExplorer = (req: Request, res: Response) => {
  const acceptsHtml = req.headers.accept?.includes("text/html");

  const apiData = {
    service: "MobilitiQ Sprint 1 REST API",
    status: "ONLINE",
    version: "1.0.0",
    frontendUrl: "http://localhost:3000",
    publicEndpoints: [
      { method: "GET", path: "/api/v1/health", desc: "Status kesehatan server backend" },
      { method: "GET", path: "/api/v1/reference/bootstrap", desc: "Data referensi kendaraan, tarif, insentif & fasilitas" },
      { method: "GET", path: "/api/v1/ev-models", desc: "Katalog & filter kendaraan listrik (PBI 04)" },
      { method: "GET", path: "/api/v1/facilities", desc: "Daftar titik lokasi SPKLU, SPBKLU, dan Showroom (PBI 05 & 11)" },
    ],
    calculatorEndpoints: [
      { method: "POST", path: "/api/v1/calculations/fuel-cost", desc: "Kalkulator biaya BBM (PBI 01)" },
      { method: "POST", path: "/api/v1/calculations/ice-maintenance", desc: "Kalkulator perawatan konvensional (PBI 02)" },
      { method: "POST", path: "/api/v1/calculations/ev-energy", desc: "Simulator konsumsi energi EV (PBI 07 / KEL2-62)" },
      { method: "POST", path: "/api/v1/calculations/comparison", desc: "Komparasi biaya bulanan BBM vs Listrik (PBI 08 / KEL2-72)" },
      { method: "POST", path: "/api/v1/facilities/route-eta", desc: "Kalkulasi rute, jarak & durasi ke SPKLU (PBI 12)" },
    ],
    authEndpoints: [
      { method: "POST", path: "/api/v1/auth/login", desc: "Login akun (USER, MITRA, SUPERADMIN)" },
      { method: "POST", path: "/api/v1/auth/logout", desc: "Logout dan pembatalan sesi" },
      { method: "GET", path: "/api/v1/auth/me", desc: "Profil pengguna & peran sesi aktif" },
    ],
    mitraEndpoints: [
      { method: "GET", path: "/api/v1/mitra/dashboard-summary", desc: "Ringkasan statistik Dashboard Mitra (Figma Frame 22)" },
      { method: "POST/PUT/DELETE", path: "/api/v1/ev-models", desc: "Manajemen katalog EV mitra (PBI 03)" },
      { method: "POST/PUT/DELETE", path: "/api/v1/facilities", desc: "Manajemen fasilitas mitra (PBI 05)" },
      { method: "POST/PUT/DELETE", path: "/api/v1/facilities/:id/services", desc: "Manajemen tarif layanan fasilitas (PBI 06)" },
    ],
    adminEndpoints: [
      { method: "GET/PUT", path: "/api/v1/admin/tariffs", desc: "Manajemen tarif energi resmi BBM & Listrik (PBI 09)" },
      { method: "GET/POST/PUT", path: "/api/v1/admin/incentives", desc: "Manajemen kebijakan insentif pajak EV (PBI 10)" },
    ],
  };

  if (acceptsHtml) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MobilitiQ Sprint 1 API Explorer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 2rem 1rem; }
    .container { max-width: 960px; margin: 0 auto; }
    .header { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .title-group h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .title-group p { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
    .badge-status { display: inline-flex; align-items: center; gap: 0.5rem; background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 9999px; }
    .badge-status::before { content: ""; display: inline-block; width: 8px; height: 8px; background: #16a34a; border-radius: 50%; }
    .btn-frontend { display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 0.8125rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: 10px; transition: background 0.15s; }
    .btn-frontend:hover { background: #1d4ed8; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .endpoint-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
    .endpoint-item { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; }
    .endpoint-left { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .method { font-size: 0.6875rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; letter-spacing: 0.05em; }
    .method.get { background: #e0f2fe; color: #0369a1; }
    .method.post { background: #dcfce7; color: #15803d; }
    .method.multi { background: #fef3c7; color: #b45309; }
    .path-link { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8125rem; font-weight: 600; color: #2563eb; text-decoration: none; }
    .path-link:hover { text-decoration: underline; }
    .desc { font-size: 0.8125rem; color: #64748b; }
    .footer { text-align: center; font-size: 0.75rem; color: #94a3b8; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <h1>MobilitiQ Sprint 1 Backend API</h1>
        <p>Port 4000 &middot; Express.js &middot; Siap melayani Frontend di port 3000</p>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span class="badge-status">ONLINE</span>
        <a href="http://localhost:3000" class="btn-frontend" target="_blank">&rarr; Buka Frontend (UI)</a>
      </div>
    </div>

    <!-- Public GET Endpoints -->
    <div class="card">
      <h2 class="card-title">Endpoint Publik (Klik untuk lihat JSON langsung)</h2>
      <ul class="endpoint-list">
        ${apiData.publicEndpoints.map(ep => `
          <li class="endpoint-item">
            <div class="endpoint-left">
              <span class="method get">GET</span>
              <a href="${ep.path}" class="path-link" target="_blank">${ep.path}</a>
            </div>
            <span class="desc">${ep.desc}</span>
          </li>
        `).join("")}
      </ul>
    </div>

    <!-- Calculations Endpoints -->
    <div class="card">
      <h2 class="card-title">Kalkulator &amp; Simulasi Energi (PBI 01, 02, 07, 08, 12)</h2>
      <ul class="endpoint-list">
        ${apiData.calculatorEndpoints.map(ep => `
          <li class="endpoint-item">
            <div class="endpoint-left">
              <span class="method post">${ep.method}</span>
              <span class="path-link" style="color: #334155;">${ep.path}</span>
            </div>
            <span class="desc">${ep.desc}</span>
          </li>
        `).join("")}
      </ul>
    </div>

    <!-- Auth Endpoints -->
    <div class="card">
      <h2 class="card-title">Autentikasi &amp; RBAC (User, Mitra, Superadmin)</h2>
      <ul class="endpoint-list">
        ${apiData.authEndpoints.map(ep => `
          <li class="endpoint-item">
            <div class="endpoint-left">
              <span class="method ${ep.method === 'GET' ? 'get' : 'post'}">${ep.method}</span>
              ${ep.method === 'GET' ? `<a href="${ep.path}" class="path-link" target="_blank">${ep.path}</a>` : `<span class="path-link" style="color: #334155;">${ep.path}</span>`}
            </div>
            <span class="desc">${ep.desc}</span>
          </li>
        `).join("")}
      </ul>
    </div>

    <!-- Mitra & Admin Endpoints -->
    <div class="card">
      <h2 class="card-title">Portal Mitra &amp; Regulasi Superadmin</h2>
      <ul class="endpoint-list">
        ${apiData.mitraEndpoints.map(ep => `
          <li class="endpoint-item">
            <div class="endpoint-left">
              <span class="method ${ep.method === 'GET' ? 'get' : 'multi'}">${ep.method}</span>
              <span class="path-link" style="color: #334155;">${ep.path}</span>
            </div>
            <span class="desc">${ep.desc}</span>
          </li>
        `).join("")}
        ${apiData.adminEndpoints.map(ep => `
          <li class="endpoint-item">
            <div class="endpoint-left">
              <span class="method multi">${ep.method}</span>
              <span class="path-link" style="color: #334155;">${ep.path}</span>
            </div>
            <span class="desc">${ep.desc}</span>
          </li>
        `).join("")}
      </ul>
    </div>

    <div class="footer">
      MobilitiQ &copy; 2026 Kelompok 2 Sprint 1 &middot; RESTful JSON API
    </div>
  </div>
</body>
</html>`);
    return;
  }

  res.json({
    success: true,
    ...apiData,
    timestamp: new Date().toISOString(),
  });
};

app.get("/", handleRootExplorer);
app.get("/api/v1", handleRootExplorer);

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

