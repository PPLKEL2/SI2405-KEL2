import { Router, type Request, type Response } from "express";
import { z, ZodError } from "zod";
import {
  DEMO_FACILITIES,
  getActiveFacilities,
  FACILITY_CATEGORIES,
  CITIES,
  type Facility,
} from "../data/facilities.js";
import { MAP_CONFIG } from "../config/map-config.js";

export const facilitiesRouter = Router();

/**
 * Format jarak ke kilometer dengan format bahasa Indonesia (e.g. "4,2 km")
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  if (km < 1) {
    return `${Math.round(meters)} m`;
  }
  return `${km.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

/**
 * Format durasi detik ke menit / jam bahasa Indonesia (e.g. "18 menit", "1 jam 20 menit")
 */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return "< 1 menit";
  if (totalMinutes < 60) return `${totalMinutes} menit`;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return remainingMinutes > 0 ? `${hours} jam ${remainingMinutes} menit` : `${hours} jam`;
}

// 1. Endpoint Daftar Fasilitas EV (KEL2-71)
facilitiesRouter.get("/facilities", (req: Request, res: Response) => {
  const { city, category, activeOnly = "true" } = req.query;

  const shouldFilterActive = activeOnly !== "false";
  let list: Facility[] = shouldFilterActive ? getActiveFacilities() : [...DEMO_FACILITIES];

  if (city && typeof city === "string" && city !== "Semua") {
    list = list.filter((f) => f.city.toLowerCase() === city.toLowerCase());
  }

  if (category && typeof category === "string" && category !== "Semua") {
    list = list.filter((f) => f.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    success: true,
    data: list,
    meta: {
      total: list.length,
      activeOnly: shouldFilterActive,
      availableCategories: FACILITY_CATEGORIES,
      availableCities: CITIES,
      isDemo: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Schema Validasi Titik Asal & Tujuan Rute Mengemudi (KEL2-70)
const latLngSchema = z.object({
  lat: z
    .number({ invalid_type_error: "Latitude harus berupa angka." })
    .min(-90, "Latitude minimal -90.")
    .max(90, "Latitude maksimal 90."),
  lng: z
    .number({ invalid_type_error: "Longitude harus berupa angka." })
    .min(-180, "Longitude minimal -180.")
    .max(180, "Longitude maksimal 180."),
});

const drivingRouteInputSchema = z.object({
  origin: latLngSchema,
  destination: latLngSchema,
  destinationName: z.string().optional().default("Fasilitas EV"),
});

// 3. Endpoint Kalkulasi Jarak dan Estimasi Waktu Rute Jalan (KEL2-70)
facilitiesRouter.post("/routes/driving", async (req: Request, res: Response) => {
  try {
    const validated = drivingRouteInputSchema.parse(req.body);
    const { origin, destination, destinationName } = validated;

    // Format OSRM: lon,lat;lon,lat
    const start = `${origin.lng},${origin.lat}`;
    const end = `${destination.lng},${destination.lat}`;
    const url = `${MAP_CONFIG.routingApiUrl}/${start};${end}?overview=full&geometries=geojson&steps=false`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MAP_CONFIG.timeoutMs);

    let osrmRes: globalThis.Response;
    try {
      osrmRes = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        res.status(504).json({
          success: false,
          error: "Waktu permintaan ke layanan rute habis (timeout). Silakan coba beberapa saat lagi.",
          code: "TIMEOUT",
        });
        return;
      }
      res.status(503).json({
        success: false,
        error: "Gagal terhubung ke layanan rute OSRM. Periksa koneksi internet Anda lalu coba lagi.",
        code: "NETWORK_ERROR",
      });
      return;
    } finally {
      clearTimeout(timeout);
    }

    if (!osrmRes.ok) {
      res.status(502).json({
        success: false,
        error: `Layanan rute OSRM mengembalikan status ${osrmRes.status}. Silakan coba kembali nanti.`,
        code: "UPSTREAM_ERROR",
      });
      return;
    }

    const data: any = await osrmRes.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      res.status(404).json({
        success: false,
        error: "Rute jalan tidak dapat ditemukan untuk sepasang titik yang dipilih (misalnya terpisah perairan atau di luar jaringan jalan). Coba tentukan titik asal lain.",
        code: "NO_ROUTE",
      });
      return;
    }

    const primaryRoute = data.routes[0];
    const geojsonCoords: [number, number][] = primaryRoute.geometry.coordinates;

    // Konversi GeoJSON [lon, lat] ke Leaflet [lat, lon]
    const leafletCoords: [number, number][] = geojsonCoords.map(([lon, lat]) => [lat, lon]);

    res.json({
      success: true,
      data: {
        distanceMeters: primaryRoute.distance,
        durationSeconds: primaryRoute.duration,
        distanceFormatted: formatDistance(primaryRoute.distance),
        durationFormatted: formatDuration(primaryRoute.duration),
        coordinates: leafletCoords,
        destinationName,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      res.status(400).json({
        success: false,
        error: firstIssue?.message || "Format koordinat titik asal atau tujuan tidak valid.",
        issues: err.issues,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan internal pada server saat menghitung rute.",
    });
  }
});

