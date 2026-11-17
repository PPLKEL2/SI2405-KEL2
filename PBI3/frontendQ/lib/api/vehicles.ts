import { getApiBaseUrl, type ApiResponse } from "./base.ts";
import type { Vehicle, VehiclePayload } from "../vehicles.ts";

/** Error dari API; fieldErrors berisi pesan per field (untuk ditampilkan di form). */
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...init.headers },
    });
  } catch {
    if (init.signal?.aborted) throw new ApiError("Permintaan dibatalkan.", 0);
    throw new ApiError("Tidak dapat terhubung ke server. Pastikan backendQ berjalan di port 4000.", 0);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error ?? `Permintaan gagal (status ${res.status}).`, res.status, json?.errors ?? {});
  }
  return json.data as T;
}

export const fetchMitraVehicles = (signal?: AbortSignal) =>
  request<Vehicle[]>("/mitra/vehicles", { signal });

export const createMitraVehicle = (payload: VehiclePayload) =>
  request<Vehicle>("/mitra/vehicles", { method: "POST", body: JSON.stringify(payload) });

export const updateMitraVehicle = (id: string, payload: Partial<VehiclePayload>) =>
  request<Vehicle>(`/mitra/vehicles/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const setMitraVehicleActive = (id: string, isActive: boolean) =>
  request<Vehicle>(`/mitra/vehicles/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) });

export const deleteMitraVehicle = (id: string) =>
  request<{ id: string }>(`/mitra/vehicles/${id}`, { method: "DELETE" });
