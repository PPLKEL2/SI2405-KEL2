export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export type UserRole = "USER" | "MITRA" | "SUPERADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string;
  city?: string;
  homePowerVa?: number;
}

export class ApiHttpError extends Error {
  public status: number;
  public code?: string;
  public errors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    code?: string,
    errors?: Record<string, string>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.success === false) {
    throw new ApiHttpError(
      payload?.error || `Permintaan gagal dengan status HTTP ${res.status}`,
      res.status,
      payload?.code,
      payload?.errors
    );
  }

  return payload as T;
}

export function formatRupiah(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "Rp 0";
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

export function formatNumberId(
  value: number | null | undefined,
  decimals = 0
): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export interface MitraDailyLead {
  day: string;
  leads: number;
}

export interface MitraTopRecommendedUnit {
  name: string;
  recommendations: number;
  leadRate: number;
}

export interface MitraDashboardSummary {
  activeCatalogUnits: number;
  promoUnits: number;
  weeklyLeads: number;
  weeklyLeadsGrowth: string;
  totalRecommendedInSimulations: number;
  totalFacilities: number;
  facilityBreakdown: string;
  dailyLeads: MitraDailyLead[];
  topRecommendedUnits: MitraTopRecommendedUnit[];
}

export async function getMitraDashboardSummary(): Promise<MitraDashboardSummary> {
  const res = await apiFetch<{ success: boolean; data: MitraDashboardSummary }>(
    "/mitra/dashboard-summary"
  );
  return res.data;
}


