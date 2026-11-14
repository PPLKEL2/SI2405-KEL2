import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import { app } from "../index.js";
import { evModelRepository } from "../storage/ev-model-repository.js";
import { facilityRepository } from "../storage/facility-repository.js";
import { energyTariffRepository } from "../storage/energy-tariff-repository.js";
import { evIncentiveRepository } from "../storage/ev-incentive-repository.js";
import {
  PRECOMPUTED_DEMO_USERS,
  userRepository,
} from "../storage/user-repository.js";

process.env.NODE_ENV = "test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server: Server;
let baseUrl = "";

async function apiRequest(
  endpointPath: string,
  options: {
    method?: string;
    body?: unknown;
    cookie?: string;
    extraHeaders?: Record<string, string>;
  } = {}
): Promise<{
  status: number;
  data: any;
  setCookie: string | null;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Connection: "close",
    ...(options.extraHeaders || {}),
  };
  if (options.cookie) {
    headers["Cookie"] = options.cookie;
  }

  const res = await fetch(`${baseUrl}${endpointPath}`, {
    method: options.method || "GET",
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const setCookie = res.headers.get("set-cookie");
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, setCookie };
}

function extractCookieToken(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader.split(";")[0];
}

describe("MobilitiQ Sprint 1 API & Auth RBAC Suite", () => {
  let userCookie = "";
  let mitraCookie = "";
  let superadminCookie = "";

  before(async () => {
    userRepository.replaceAllUsers(PRECOMPUTED_DEMO_USERS);
    evModelRepository.resetToDefaultSeed();
    facilityRepository.resetToDefaultSeed();
    energyTariffRepository.resetToDefaultSeed();
    evIncentiveRepository.resetToDefaultSeed();

    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        if (addr && typeof addr === "object") {
          baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;
        }
        resolve();
      });
      server.unref();
    });
  });

  after(async () => {
    userRepository.replaceAllUsers(PRECOMPUTED_DEMO_USERS);
    evModelRepository.resetToDefaultSeed();
    facilityRepository.resetToDefaultSeed();
    energyTariffRepository.resetToDefaultSeed();
    evIncentiveRepository.resetToDefaultSeed();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test("Seed & Penyimpanan Akun Demo: Tidak menyimpan password teks biasa di kode seed maupun users.json", () => {
    const usersJsonPath = path.resolve(__dirname, "../../data/users.json");
    const seedScriptPath = path.resolve(__dirname, "../scripts/seed-users.ts");
    const userRepoPath = path.resolve(__dirname, "../storage/user-repository.ts");

    const usersRaw = fs.readFileSync(usersJsonPath, "utf-8");
    const seedRaw = fs.readFileSync(seedScriptPath, "utf-8");
    const repoRaw = fs.readFileSync(userRepoPath, "utf-8");

    for (const content of [usersRaw, seedRaw, repoRaw]) {
      assert.equal(content.includes("Pengguna123!"), false);
      assert.equal(content.includes("Mitra123!"), false);
      assert.equal(content.includes("Superadmin123!"), false);
    }

    const parsedUsers = JSON.parse(usersRaw);
    for (const u of parsedUsers) {
      assert.equal(typeof u.passwordHash, "string");
      assert.ok(u.passwordHash.startsWith("scrypt$"));
      assert.equal((u as any).password, undefined);
    }
  });

  test("Akses Guest: Pengunjung tanpa login dapat mengakses data referensi dan kalkulator (200 OK)", async () => {
    const bootstrapRes = await apiRequest("/reference/bootstrap");
    assert.equal(bootstrapRes.status, 200);
    assert.ok(bootstrapRes.data.data.icePresets.length > 0);

    const calcRes = await apiRequest("/calculations/fuel-cost", {
      method: "POST",
      body: {
        vehicleCategory: "Motor",
        fuelPricePerLiter: 10000,
        kmPerLiter: 48,
        distanceInputKm: 60,
        distancePeriod: "DAILY",
      },
    });
    assert.equal(calcRes.status, 200);
    assert.equal(calcRes.data.data.dailyCostIdr, 12500);
  });

  test("Proteksi Role: Menolak akses aksi manajemen Mitra/Superadmin jika belum login (401)", async () => {
    const unauthMitra = await apiRequest("/ev-models", {
      method: "POST",
      body: { brand: "Test" },
    });
    assert.equal(unauthMitra.status, 401);
    assert.equal(unauthMitra.data.code, "UNAUTHENTICATED");

    const unauthAdmin = await apiRequest("/admin/energy-tariffs");
    assert.equal(unauthAdmin.status, 401);
    assert.equal(unauthAdmin.data.code, "UNAUTHENTICATED");
  });

  test("Auth: Menolak login dengan password salah (401)", async () => {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: "pengguna@mobilitiq.id",
        password: "PasswordSalah999",
      },
    });
    assert.equal(res.status, 401);
    assert.equal(res.data.code, "INVALID_CREDENTIALS");
  });

  test("Auth: Login berhasil untuk USER, MITRA, dan SUPERADMIN dengan masa berlaku sesi, cookie Secure di HTTPS, GET /auth/me tanpa passwordHash, dan POST /auth/logout", async () => {
    // 1. Login USER melalui HTTP localhost development (tanpa atribut Secure)
    const resUser = await apiRequest("/auth/login", {
      method: "POST",
      body: { email: "pengguna@mobilitiq.id", password: "Pengguna123!" },
    });
    assert.equal(resUser.status, 200);
    assert.equal(resUser.data.data.user.role, "USER");
    assert.equal(resUser.data.data.user.passwordHash, undefined);
    assert.equal(resUser.data.data.redirectTo, "/kalkulator/bbm");
    assert.ok(resUser.data.data.session.expiresAt);
    assert.equal(resUser.data.data.session.maxAgeSeconds, 86400);
    assert.ok(resUser.setCookie?.includes("HttpOnly"));
    assert.ok(resUser.setCookie?.includes("Max-Age=86400"));
    assert.ok(resUser.setCookie?.includes("Expires="));
    assert.ok(resUser.setCookie?.includes("SameSite=Lax"));
    assert.equal(resUser.setCookie?.includes("; Secure"), false);
    userCookie = extractCookieToken(resUser.setCookie);

    // 2. Uji GET /api/v1/auth/me mengembalikan identitas & role tanpa passwordHash
    const meRes = await apiRequest("/auth/me", {
      cookie: userCookie,
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.data.data.user.email, "pengguna@mobilitiq.id");
    assert.equal(meRes.data.data.user.role, "USER");
    assert.equal(meRes.data.data.user.passwordHash, undefined);
    assert.ok(meRes.data.data.session.expiresAt);

    // 3. Uji login melalui HTTPS (X-Forwarded-Proto: https) menyertakan atribut cookie Secure
    const httpsLoginRes = await apiRequest("/auth/login", {
      method: "POST",
      extraHeaders: { "X-Forwarded-Proto": "https" },
      body: { email: "pengguna@mobilitiq.id", password: "Pengguna123!" },
    });
    assert.equal(httpsLoginRes.status, 200);
    assert.ok(httpsLoginRes.setCookie?.includes("; Secure"));
    const tempHttpsCookie = extractCookieToken(httpsLoginRes.setCookie);

    // 4. Uji POST /api/v1/auth/logout mengakhiri sesi di server dan menghapus cookie
    const logoutRes = await apiRequest("/auth/logout", {
      method: "POST",
      cookie: tempHttpsCookie,
      extraHeaders: { "X-Forwarded-Proto": "https" },
    });
    assert.equal(logoutRes.status, 200);
    assert.ok(logoutRes.setCookie?.includes("Max-Age=0"));
    assert.ok(logoutRes.setCookie?.includes("; Secure"));

    const meAfterLogout = await apiRequest("/auth/me", {
      cookie: tempHttpsCookie,
    });
    assert.equal(meAfterLogout.status, 401);

    // 5. Login MITRA & SUPERADMIN
    const resMitra = await apiRequest("/auth/login", {
      method: "POST",
      body: { email: "mitra@mobilitiq.id", password: "Mitra123!" },
    });
    assert.equal(resMitra.status, 200);
    assert.equal(resMitra.data.data.user.role, "MITRA");
    assert.equal(resMitra.data.data.user.passwordHash, undefined);
    assert.equal(resMitra.data.data.redirectTo, "/mitra");
    mitraCookie = extractCookieToken(resMitra.setCookie);

    const resSuper = await apiRequest("/auth/login", {
      method: "POST",
      body: { email: "superadmin@mobilitiq.id", password: "Superadmin123!" },
    });
    assert.equal(resSuper.status, 200);
    assert.equal(resSuper.data.data.user.role, "SUPERADMIN");
    assert.equal(resSuper.data.data.user.passwordHash, undefined);
    assert.equal(resSuper.data.data.redirectTo, "/admin/tarif-energi");
    superadminCookie = extractCookieToken(resSuper.setCookie);
  });

  test("RBAC: Penolakan akses lintas role (USER ditolak akses CRUD Mitra & Superadmin dengan 403)", async () => {
    const tryMitraFromUser = await apiRequest("/ev-models", {
      method: "POST",
      cookie: userCookie,
      body: {
        brand: "Unofficial",
        modelName: "Test",
        category: "Motor",
        otrPriceIdr: 20000000,
        batteryKwh: 2,
        consumptionKwh100km: 3,
        wltpRangeKm: 80,
        motorPowerKw: 2,
        chargerType: "AC",
      },
    });
    assert.equal(tryMitraFromUser.status, 403);
    assert.equal(tryMitraFromUser.data.code, "FORBIDDEN_ROLE");

    const trySuperFromMitra = await apiRequest("/admin/energy-tariffs", {
      method: "GET",
      cookie: mitraCookie,
    });
    assert.equal(trySuperFromMitra.status, 403);
    assert.equal(trySuperFromMitra.data.code, "FORBIDDEN_ROLE");

    const tryMitraFromSuper = await apiRequest("/facilities", {
      method: "POST",
      cookie: superadminCookie,
      body: {
        name: "SPKLU Test",
        category: "SPKLU",
        city: "Jakarta",
        address: "Jl Test",
        latitude: -6.2,
        longitude: 106.8,
        operatingHours: "24 Jam",
        contact: "021-111",
      },
    });
    assert.equal(tryMitraFromSuper.status, 403);
  });

  test("PBI 01: Kalkulator Biaya BBM menghitung liter & biaya harian/bulanan/tahunan serta menolak input tidak valid", async () => {
    const okRes = await apiRequest("/calculations/fuel-cost", {
      method: "POST",
      cookie: userCookie,
      body: {
        vehicleCategory: "Motor",
        vehiclePresetName: "Honda Vario 125",
        fuelTypeCode: "BBM_PERTALITE_RON90",
        fuelPricePerLiter: 10000,
        kmPerLiter: 48,
        distanceInputKm: 60,
        distancePeriod: "DAILY",
      },
    });
    assert.equal(okRes.status, 200);
    assert.equal(okRes.data.data.dailyLiters, 1.25);
    assert.equal(okRes.data.data.monthlyLiters, 37.5);
    assert.equal(okRes.data.data.dailyCostIdr, 12500);
    assert.equal(okRes.data.data.monthlyCostIdr, 375000);

    const badRes = await apiRequest("/calculations/fuel-cost", {
      method: "POST",
      cookie: userCookie,
      body: {
        vehicleCategory: "Motor",
        fuelPricePerLiter: -100,
        kmPerLiter: 0,
        distanceInputKm: 0,
      },
    });
    assert.equal(badRes.status, 400);
  });

  test("PBI 02: Kalkulator Biaya Perawatan Kendaraan Konvensional menghitung komponen servis & periode kepemilikan", async () => {
    const res = await apiRequest("/calculations/ice-maintenance", {
      method: "POST",
      cookie: userCookie,
      body: {
        vehicleCategory: "Mobil",
        vehiclePresetId: "ice-avanza-15",
        dailyDistanceKm: 40,
        ownershipYears: 5,
        includeOilAndFilter: true,
        includeSparkPlugAndIgnition: true,
        includePeriodicService: true,
        includeTiresAndBrakes: true,
        includeAnnualStnkTax: true,
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.data.ownershipYears, 5);
    assert.ok(res.data.data.annualMaintenanceIdr > 0);
    assert.equal(
      res.data.data.totalOwnershipMaintenanceIdr,
      res.data.data.annualMaintenanceIdr * 5
    );
  });

  test("PBI 03 & PBI 04: Manajemen Katalog EV oleh Mitra & Pencarian/Filter oleh Pengguna", async () => {
    const createRes = await apiRequest("/ev-models", {
      method: "POST",
      cookie: mitraCookie,
      body: {
        brand: "Smoot",
        modelName: "Tempur Facelift",
        category: "Motor",
        otrPriceIdr: 18500000,
        batteryKwh: 1.5,
        consumptionKwh100km: 2.5,
        wltpRangeKm: 60,
        motorPowerKw: 1.5,
        chargerType: "Swap Baterai SPBKLU",
      },
    });
    assert.equal(createRes.status, 201);
    const createdId = createRes.data.data.id;

    // PBI 04: Filter pencarian berdasarkan kata kunci
    const searchRes = await apiRequest("/ev-models?q=Smoot&category=Motor", {
      cookie: userCookie,
    });
    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.data.count, 1);
    assert.equal(searchRes.data.data[0].brand, "Smoot");

    // Nonaktifkan unit oleh Mitra -> tidak muncul di pencarian aktif pengguna
    const deactRes = await apiRequest(`/ev-models/${createdId}/status`, {
      method: "PATCH",
      cookie: mitraCookie,
      body: { isActive: false },
    });
    assert.equal(deactRes.status, 200);

    const searchAfterDeact = await apiRequest(
      "/ev-models?q=Smoot&activeOnly=true",
      { cookie: userCookie }
    );
    assert.equal(searchAfterDeact.data.count, 0);
  });

  test("PBI 05, PBI 06, PBI 11, PBI 12: Fasilitas EV, Tarif Layanan, Peta Aktif, dan Rute Jarak/Waktu", async () => {
    // PBI 05: Tambah lokasi SPKLU oleh Mitra
    const facRes = await apiRequest("/facilities", {
      method: "POST",
      cookie: mitraCookie,
      body: {
        name: "SPKLU Kemang Village",
        category: "SPKLU",
        city: "Jakarta",
        address: "Jl. Pangeran Antasari No. 36, Jakarta Selatan",
        latitude: -6.2615,
        longitude: 106.8128,
        operatingHours: "09.00 - 22.00 WIB",
        contact: "021-7199999",
      },
    });
    assert.equal(facRes.status, 201);
    const facId = facRes.data.data.id;

    // PBI 06: Tambah tarif layanan CHARGING
    const tariffRes = await apiRequest("/service-tariffs", {
      method: "POST",
      cookie: mitraCookie,
      body: {
        facilityId: facId,
        serviceType: "CHARGING",
        priceIdr: 2475,
        validFrom: "2026-01-01",
        validUntil: "2026-12-31",
      },
    });
    assert.equal(tariffRes.status, 201);

    // PBI 06: Tolak tabrakan periode (409)
    const conflictRes = await apiRequest("/service-tariffs", {
      method: "POST",
      cookie: mitraCookie,
      body: {
        facilityId: facId,
        serviceType: "CHARGING",
        priceIdr: 2600,
        validFrom: "2026-06-01",
        validUntil: "2026-10-01",
      },
    });
    assert.equal(conflictRes.status, 409);

    // PBI 06 AC 5: Baca tarif aktif pada tanggal tertentu
    const activeTariffRes = await apiRequest(
      `/service-tariffs/active?facilityId=${facId}&serviceType=CHARGING&date=2026-07-01`,
      { cookie: userCookie }
    );
    assert.equal(activeTariffRes.status, 200);
    assert.equal(activeTariffRes.data.data.priceIdr, 2475);

    // PBI 12: Kalkulator Jarak & Waktu ke Fasilitas EV
    const routeRes = await apiRequest("/facilities/route", {
      method: "POST",
      cookie: userCookie,
      body: {
        originLat: -6.1944,
        originLon: 106.8229,
        facilityId: facId,
        travelMode: "Mobil",
      },
    });
    assert.equal(routeRes.status, 200);
    assert.ok(routeRes.data.data.distanceMeters > 1000);
    assert.ok(routeRes.data.data.durationMinutes >= 1);
  });

  test("PBI 07 & PBI 08: Simulator Energi EV dan Komparasi Biaya BBM vs Listrik", async () => {
    const evRes = await apiRequest("/calculations/ev-energy", {
      method: "POST",
      cookie: userCookie,
      body: {
        consumptionKwh100km: 2.9,
        dailyDistanceKm: 60,
        homeChargingPercentage: 85,
        homeTariffPerKwh: 1444.7,
        spkluTariffPerKwh: 2466,
      },
    });
    assert.equal(evRes.status, 200);
    assert.equal(evRes.data.data.monthlyKwh, 52.2);

    const compRes = await apiRequest("/calculations/comparison", {
      method: "POST",
      cookie: userCookie,
      body: {
        dailyDistanceKm: 60,
        iceKmPerLiter: 48,
        fuelPricePerLiter: 10000,
        evConsumptionKwh100km: 2.9,
        homeTariffPerKwh: 1444.7,
        spkluTariffPerKwh: 2466,
        homeChargingPercentage: 85,
      },
    });
    assert.equal(compRes.status, 200);
    assert.equal(compRes.data.data.status, "SAVING");
    assert.ok(compRes.data.data.costDifferenceMonthly > 0);
  });

  test("PBI 09 & PBI 10: Manajemen Tarif Energi & Insentif Pajak EV oleh Superadmin", async () => {
    const updateTariffRes = await apiRequest(
      "/admin/energy-tariffs/tariff-bbm-pertalite",
      {
        method: "PUT",
        cookie: superadminCookie,
        body: {
          code: "BBM_PERTALITE_RON90",
          name: "Pertalite (RON 90)",
          category: "BBM",
          pricePerUnit: 10200,
          unit: "Rp/liter",
          validFrom: "2024-01-01",
          reason: "Penyesuaian uji coba Superadmin",
        },
      }
    );
    assert.equal(updateTariffRes.status, 200);
    assert.equal(updateTariffRes.data.data.pricePerUnit, 10200);

    const histRes = await apiRequest("/admin/energy-tariffs/histories", {
      cookie: superadminCookie,
    });
    assert.equal(histRes.status, 200);
    assert.ok(histRes.data.count >= 1);

    const createIncentiveRes = await apiRequest("/admin/ev-incentives", {
      method: "POST",
      cookie: superadminCookie,
      body: {
        code: "INSENTIF_UJI_COBA",
        name: "Insentif Uji Coba Kendaraan Listrik",
        category: "INCENTIVE",
        vehicleType: "Mobil",
        valueType: "PERCENTAGE",
        value: 5,
        validFrom: "2026-01-01",
      },
    });
    assert.equal(createIncentiveRes.status, 201);
  });

  test("Dashboard Mitra (Figma Frame 22): Agregasi real-time unit aktif, fasilitas, dan proteksi role", async () => {
    // Unauthenticated -> 401
    const anonRes = await apiRequest("/mitra/dashboard-summary");
    assert.equal(anonRes.status, 401);

    // USER -> 403
    const userRes = await apiRequest("/mitra/dashboard-summary", {
      cookie: userCookie,
    });
    assert.equal(userRes.status, 403);

    // MITRA -> 200 OK
    const mitraRes = await apiRequest("/mitra/dashboard-summary", {
      cookie: mitraCookie,
    });
    assert.equal(mitraRes.status, 200);
    assert.equal(mitraRes.data.success, true);
    assert.ok(typeof mitraRes.data.data.activeCatalogUnits === "number");
    assert.ok(typeof mitraRes.data.data.totalFacilities === "number");
    assert.ok(mitraRes.data.data.facilityBreakdown.length > 0);
    assert.equal(mitraRes.data.data.dailyLeads.length, 7);
    assert.ok(mitraRes.data.data.topRecommendedUnits.length >= 3);
  });
});
