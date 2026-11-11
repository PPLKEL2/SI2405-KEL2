/**
 * Klien API Fasilitas & Rute Menuju Backend (backendQ)
 * 
 * Terhubung ke backend Express pada /api/v1/facilities dan /api/v1/routes/driving.
 * Dilengkapi fallback otomatis ke client-side OSRM & data lokal jika server backend offline.
 */

import { getApiBaseUrl, type ApiResponse } from "./calculator.ts";
import type { Facility, FacilityCategory } from "../data/facilities.ts";
import { getActiveFacilities } from "../data/facilities.ts";
import {
  calculateDrivingRoute as clientCalculateDrivingRoute,
  type LatLng,
  type RouteResult,
} from "../routing.ts";

export interface FetchFacilitiesParams {
  city?: string;
  category?: FacilityCategory | "Semua";
  activeOnly?: boolean;
}

/**
 * Mengambil daftar fasilitas dari backendQ (dengan fallback data demo aktif).
 */
export async function fetchFacilities(
  params?: FetchFacilitiesParams,
  signal?: AbortSignal
): Promise<Facility[]> {
  try {
    const url = new URL(`${getApiBaseUrl()}/facilities`);
    if (params?.city && params.city !== "Semua") {
      url.searchParams.set("city", params.city);
    }
    if (params?.category && params.category !== "Semua") {
      url.searchParams.set("category", params.category);
    }
    if (params?.activeOnly !== undefined) {
      url.searchParams.set("activeOnly", String(params.activeOnly));
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });

    if (res.ok) {
      const json: ApiResponse<Facility[]> = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Backend offline atau tidak dapat dijangkau -> gunakan data demo lokal
  }

  // Fallback lokal
  let list = getActiveFacilities();
  if (params?.city && params.city !== "Semua") {
    list = list.filter((f) => f.city.toLowerCase() === params.city!.toLowerCase());
  }
  if (params?.category && params.category !== "Semua") {
    list = list.filter((f) => f.category.toLowerCase() === params.category!.toLowerCase());
  }
  return list;
}

/**
 * Meminta perhitungan rute jalan dari backendQ (dengan fallback ke OSRM klien).
 */
export async function fetchDrivingRoute(
  origin: LatLng,
  destination: LatLng,
  destinationName: string,
  signal?: AbortSignal
): Promise<RouteResult> {
  try {
    const url = `${getApiBaseUrl()}/routes/driving`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        origin,
        destination,
        destinationName,
      }),
      signal,
    });

    if (res.ok) {
      const json: ApiResponse<RouteResult> = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Jika backend offline, hitung langsung via OSRM publik di sisi klien
  }

  return await clientCalculateDrivingRoute(origin, destination, destinationName);
}

