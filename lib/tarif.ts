import type { Facility, FacilityCategory } from "./facilities.ts";

export const SERVICE_TYPES = ["CHARGING", "SWAP"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

// Satuan mengikuti jenis layanan. Charging hanya untuk SPKLU, swap hanya untuk SPBKLU.
export const SERVICE_META: Record<ServiceType, { label: string; unit: string; facilityCategory: FacilityCategory }> = {
  CHARGING: { label: "Charging", unit: "kWh", facilityCategory: "SPKLU" },
  SWAP: { label: "Swap baterai", unit: "transaksi", facilityCategory: "SPBKLU" },
};

export type Tariff = {
  id: string;
  facilityId: string;
  serviceType: ServiceType;
  price: number;
  validFrom: string;
  validUntil: string | null;
};

export type TariffInput = Omit<Tariff, "id">;
export type TariffErrors = Partial<Record<keyof TariffInput, string>>;
export type TariffStatus = "active" | "upcoming" | "expired";

export const SAMPLE_TARIFFS: Tariff[] = [
  { id: "tariff-1", facilityId: "sample-1", serviceType: "CHARGING", price: 2466, validFrom: "2026-01-01", validUntil: null },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OPEN_ENDED = "9999-12-31";

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function periodsOverlap(a: Pick<Tariff, "validFrom" | "validUntil">, b: Pick<Tariff, "validFrom" | "validUntil">): boolean {
  return a.validFrom <= (b.validUntil ?? OPEN_ENDED) && b.validFrom <= (a.validUntil ?? OPEN_ENDED);
}

// Satu fasilitas tidak boleh punya dua tarif untuk layanan yang sama di periode yang bertabrakan.
export function validateTariff(input: TariffInput, facility: Facility | undefined, existing: Tariff[], editingId?: string): TariffErrors {
  const errors: TariffErrors = {};
  const meta = SERVICE_META[input.serviceType];

  if (!meta) errors.serviceType = "Jenis layanan tidak valid";
  if (!facility) errors.facilityId = "Fasilitas wajib dipilih";
  else if (meta && facility.category !== meta.facilityCategory) {
    errors.facilityId = `Layanan ${meta.label} hanya untuk fasilitas kategori ${meta.facilityCategory}`;
  }

  if (!Number.isFinite(input.price) || input.price < 0) errors.price = "Nilai tarif harus angka 0 atau lebih";
  if (!isValidDate(input.validFrom)) errors.validFrom = "Tanggal mulai berlaku wajib diisi dengan benar";
  if (input.validUntil !== null) {
    if (!isValidDate(input.validUntil)) errors.validUntil = "Tanggal akhir berlaku tidak valid";
    else if (isValidDate(input.validFrom) && input.validUntil < input.validFrom) errors.validUntil = "Tanggal akhir tidak boleh sebelum tanggal mulai";
  }

  if (!errors.validFrom && !errors.validUntil && !errors.facilityId && !errors.serviceType) {
    const conflict = existing.some((t) => t.id !== editingId && t.facilityId === input.facilityId && t.serviceType === input.serviceType && periodsOverlap(t, input));
    if (conflict) errors.validFrom = "Periode bertabrakan dengan tarif lain untuk fasilitas dan layanan yang sama";
  }

  return errors;
}

// Tarif yang berlaku pada tanggal tertentu. Dipakai modul lain yang membutuhkan biaya fasilitas.
export function getActiveTariff(tariffs: Tariff[], facilityId: string, serviceType: ServiceType, date: string = todayIso()): Tariff | undefined {
  return tariffs.find((t) => t.facilityId === facilityId && t.serviceType === serviceType && t.validFrom <= date && (t.validUntil === null || date <= t.validUntil));
}

export function tariffStatus(tariff: Tariff, date: string = todayIso()): TariffStatus {
  if (date < tariff.validFrom) return "upcoming";
  if (tariff.validUntil !== null && date > tariff.validUntil) return "expired";
  return "active";
}
