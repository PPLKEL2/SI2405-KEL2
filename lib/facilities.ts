export const FACILITY_CATEGORIES = ["Showroom", "SPKLU", "SPBKLU"] as const;
export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

export type Facility = {
  id: string;
  name: string;
  category: FacilityCategory;
  address: string;
  latitude: number;
  longitude: number;
  operationalHours: string;
  contact: string;
  isActive: boolean;
};

export const FACILITY_STORAGE_KEY = "mobilitiq-facilities";

export const FACILITY_COLORS: Record<FacilityCategory, string> = {
  Showroom: "#64748b",
  SPKLU: "#38bdf8",
  SPBKLU: "#1e40af",
};

export const SAMPLE_FACILITIES: Facility[] = [
  { id: "sample-1", name: "SPKLU Sudirman", category: "SPKLU", address: "Jl. Jenderal Sudirman No. 1, Jakarta", latitude: -6.2088, longitude: 106.8456, operationalHours: "24 jam", contact: "021-000000", isActive: true },
  { id: "sample-2", name: "Showroom MobilitiQ Kemang", category: "Showroom", address: "Jl. Kemang Raya No. 10, Jakarta", latitude: -6.2607, longitude: 106.8136, operationalHours: "08.00 - 20.00", contact: "021-111111", isActive: true },
];

export function validateFacility(input: Omit<Facility, "id" | "isActive">) {
  const errors: Partial<Record<keyof Facility, string>> = {};
  if (!input.name.trim()) errors.name = "Nama wajib diisi";
  if (!FACILITY_CATEGORIES.includes(input.category)) errors.category = "Kategori tidak valid";
  if (!input.address.trim()) errors.address = "Alamat wajib diisi";
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) errors.latitude = "Latitude harus antara -90 dan 90";
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) errors.longitude = "Longitude harus antara -180 dan 180";
  return errors;
}
