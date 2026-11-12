import type {
  EvCalculationInput,
  EvCalculationOutput,
} from "../calculations/ev.js";
import type {
  ComparisonCalculationInput,
  ComparisonCalculationOutput,
} from "../calculations/comparison.js";

/**
 * Menentukan URL dasar API secara dinamis:
 * 1. Menggunakan NEXT_PUBLIC_API_URL jika dikonfigurasi.
 * 2. Jika diakses melalui IP jaringan (misal http://192.168.3.97:3000), otomatis
 *    mengarahkan ke backend di IP yang sama pada port 4000 (http://192.168.3.97:4000/api/v1).
 * 3. Default ke http://localhost:4000/api/v1 untuk akses lokal.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location) {
    const { hostname } = window.location;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:4000/api/v1`;
    }
  }
  return "http://localhost:4000/api/v1";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

/**
 * Mengirim permintaan perhitungan konsumsi energi EV ke API backend.
 * Mendukung pembatalan via AbortSignal untuk mencegah race condition.
 */
export async function fetchEvEnergyCalculation(
  input: EvCalculationInput,
  signal?: AbortSignal
): Promise<ApiResponse<EvCalculationOutput>> {
  const url = `${getApiBaseUrl()}/calculations/ev-energy`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
    signal,
  });

  const json = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: json.error || "Gagal menghitung konsumsi energi EV dari server.",
      errors: json.errors,
    };
  }

  return json;
}

/**
 * Mengirim permintaan komparasi biaya BBM vs EV ke API backend.
 * Mendukung pembatalan via AbortSignal untuk mencegah race condition.
 */
export async function fetchComparisonCalculation(
  input: ComparisonCalculationInput,
  signal?: AbortSignal
): Promise<ApiResponse<ComparisonCalculationOutput>> {
  const url = `${getApiBaseUrl()}/calculations/comparison`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
    signal,
  });

  const json = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: json.error || "Gagal menghitung komparasi biaya dari server.",
      errors: json.errors,
    };
  }

  return json;
}

