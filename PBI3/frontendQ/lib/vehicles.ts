/**
 * Tipe, batas spesifikasi, format tampilan, dan validasi form katalog kendaraan (PBI3).
 * Batas harus sama dengan backendQ/src/data/vehicles.ts (VEHICLE_LIMITS).
 */

export const VEHICLE_TYPES = ["Motor", "Mobil"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export interface Vehicle {
  id: string;
  model: string;
  type: VehicleType;
  batteryKwh: number;
  priceOtr: number;
  acChargerKw: number;
  promo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehiclePayload {
  model: string;
  type: VehicleType;
  batteryKwh: number;
  priceOtr: number;
  acChargerKw: number;
  promo: string;
  isActive: boolean;
}

/** Nilai form berupa string agar bisa menampung input yang belum valid. */
export interface VehicleFormValues {
  model: string;
  type: string;
  batteryKwh: string;
  priceOtr: string;
  acChargerKw: string;
  promo: string;
  isActive: string;
}

export const VEHICLE_LIMITS = {
  batteryKwh: { min: 0.1, max: 500 },
  priceOtr: { min: 1_000_000, max: 5_000_000_000 },
  acChargerKw: { min: 0.1, max: 350 },
} as const;

// ---------- Format tampilan (mengikuti mockup: "2,4 kWh", "Rp 23.900.000") ----------
export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatDecimal(value: number): string {
  return value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// ---------- Form ----------
export function emptyFormValues(): VehicleFormValues {
  return { model: "", type: "Motor", batteryKwh: "", priceOtr: "", acChargerKw: "", promo: "", isActive: "true" };
}

export function toFormValues(v: Vehicle): VehicleFormValues {
  return {
    model: v.model,
    type: v.type,
    batteryKwh: String(v.batteryKwh),
    priceOtr: String(v.priceOtr),
    acChargerKw: String(v.acChargerKw),
    promo: v.promo,
    isActive: String(v.isActive),
  };
}

function checkNumber(
  raw: string,
  label: string,
  unit: string,
  min: number,
  max: number
): { error?: string; value?: number } {
  const show = (n: number) =>
    unit === "Rp" ? `Rp ${n.toLocaleString("id-ID")}` : `${n.toLocaleString("id-ID")} ${unit}`;
  const text = raw.trim().replace(",", ".");
  if (text === "") return { error: `${label} wajib diisi.` };
  const value = Number(text);
  if (!Number.isFinite(value)) return { error: `${label} harus berupa angka.` };
  if (value < min) return { error: `${label} minimal ${show(min)}.` };
  if (value > max) return { error: `${label} maksimal ${show(max)}.` };
  return { value };
}

/** Validasi di sisi klien (pesan sama dengan backend) agar pengguna mendapat umpan balik instan. */
export function validateVehicleForm(values: VehicleFormValues): {
  errors: Record<string, string>;
  payload?: VehiclePayload;
} {
  const errors: Record<string, string> = {};

  const model = values.model.trim();
  if (!model) errors.model = "Model wajib diisi.";
  else if (model.length > 80) errors.model = "Model maksimal 80 karakter.";

  if (!(VEHICLE_TYPES as readonly string[]).includes(values.type)) {
    errors.type = "Tipe harus Motor atau Mobil.";
  }

  const promo = values.promo.trim();
  if (promo.length > 100) errors.promo = "Promo maksimal 100 karakter.";

  const l = VEHICLE_LIMITS;
  const battery = checkNumber(values.batteryKwh, "Baterai", "kWh", l.batteryKwh.min, l.batteryKwh.max);
  const price = checkNumber(values.priceOtr, "Harga OTR", "Rp", l.priceOtr.min, l.priceOtr.max);
  const charger = checkNumber(values.acChargerKw, "Charger AC", "kW", l.acChargerKw.min, l.acChargerKw.max);
  if (battery.error) errors.batteryKwh = battery.error;
  if (price.error) errors.priceOtr = price.error;
  if (charger.error) errors.acChargerKw = charger.error;

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    payload: {
      model,
      type: values.type as VehicleType,
      batteryKwh: battery.value as number,
      priceOtr: price.value as number,
      acChargerKw: charger.value as number,
      promo,
      isActive: values.isActive !== "false",
    },
  };
}
