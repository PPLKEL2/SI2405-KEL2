/**
 * Layanan Perhitungan Rute dan Estimasi Waktu (KEL2-70)
 * 
 * Menghitung rute jalan raya riil menggunakan OSRM Driving API publik
 * (bukan jarak garis lurus / Euclidean).
 */

import { MAP_CONFIG } from "./map-config.ts";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  distanceFormatted: string;
  durationFormatted: string;
  coordinates: [number, number][]; // [lat, lng] array untuk Leaflet Polyline
  destinationName: string;
}

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

export class RoutingError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "RoutingError";
    this.code = code;
  }
}

/**
 * Mengambil rute mengemudi jalan raya nyata antara titik asal dan titik tujuan via OSRM.
 */
export async function calculateDrivingRoute(
  origin: LatLng,
  destination: LatLng,
  destinationName: string
): Promise<RouteResult> {
  // Validasi koordinat input
  if (
    !Number.isFinite(origin.lat) ||
    !Number.isFinite(origin.lng) ||
    !Number.isFinite(destination.lat) ||
    !Number.isFinite(destination.lng)
  ) {
    throw new RoutingError("Koordinat titik asal atau tujuan tidak valid.");
  }

  // Format OSRM: lon,lat;lon,lat
  const start = `${origin.lng},${origin.lat}`;
  const end = `${destination.lng},${destination.lat}`;
  const url = `${MAP_CONFIG.routingApiUrl}/${start};${end}?overview=full&geometries=geojson&steps=false`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (err) {
    throw new RoutingError(
      "Gagal terhubung ke layanan rute. Periksa koneksi internet Anda lalu coba lagi.",
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    throw new RoutingError(
      `Layanan rute mengembalikan status ${response.status}. Silakan coba beberapa saat lagi.`,
      "HTTP_ERROR"
    );
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new RoutingError(
      "Rute jalan tidak dapat ditemukan untuk sepasang titik yang dipilih (misalnya terpisah pulau atau tidak terhubung jaringan jalan). Coba tentukan titik asal lain.",
      "NO_ROUTE"
    );
  }

  const primaryRoute = data.routes[0];
  const geojsonCoords: [number, number][] = primaryRoute.geometry.coordinates;

  // Konversi GeoJSON [lon, lat] ke Leaflet [lat, lon]
  const leafletCoords: [number, number][] = geojsonCoords.map(([lon, lat]) => [lat, lon]);

  return {
    distanceMeters: primaryRoute.distance,
    durationSeconds: primaryRoute.duration,
    distanceFormatted: formatDistance(primaryRoute.distance),
    durationFormatted: formatDuration(primaryRoute.duration),
    coordinates: leafletCoords,
    destinationName,
  };
}

