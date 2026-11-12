import type {
  EnergyCategory,
  EnergyTariff,
  EnergyTariffInput,
  EnergyUnit,
  SimulationTariffSnapshot,
  TariffSnapshotItem,
  TariffValidationResult,
} from "../types/energy-pricing.ts";
import { parseStrictNumber } from "../parser.ts";

export const ALLOWED_UNITS: Record<EnergyCategory, EnergyUnit[]> = {
  PLN_HOME: ["Rp/kWh", "Rp/kVA"],
  SPKLU: ["Rp/kWh"],
  BBM: ["Rp/liter"],
};

/**
 * Validasi format tanggal YYYY-MM-DD
 */
export function isValidIsoDate(dateStr: string): boolean {
  if (typeof dateStr !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Validasi input parameter tarif energi (Subtugas KEL2-90)
 * Memeriksa:
 * 1. Nilai numerik: positif (> 0), bukan NaN, bukan Infinity.
 * 2. Satuan: harus sesuai dengan kategori energi yang diizinkan.
 * 3. Periode berlaku: validFrom wajib tanggal valid, validTo opsional dan jika diisi harus >= validFrom.
 */
export function validateEnergyTariffInput(
  input: EnergyTariffInput,
  isEdit = false,
): TariffValidationResult {
  const errors: Record<string, string> = {};

  // 1. Validasi Kode & Nama
  const trimmedCode = (input.code || "").trim();
  if (!trimmedCode) {
    errors.code = "Kode parameter tidak boleh kosong";
  } else if (!/^[A-Za-z0-9_.-]{3,50}$/.test(trimmedCode)) {
    errors.code =
      "Kode parameter harus 3-50 karakter alfanumerik (dapat memakai _, -, .)";
  }

  const trimmedName = (input.name || "").trim();
  if (!trimmedName) {
    errors.name = "Nama parameter tarif tidak boleh kosong";
  } else if (trimmedName.length < 3) {
    errors.name = "Nama parameter minimal 3 karakter";
  }

  // 2. Validasi Kategori
  const validCategories: EnergyCategory[] = ["PLN_HOME", "SPKLU", "BBM"];
  if (!validCategories.includes(input.category)) {
    errors.category = `Kategori energi harus salah satu dari: ${validCategories.join(", ")}`;
  }

  // 3. Validasi Nilai Numerik (Harga)
  const parsedPrice = parseStrictNumber(input.pricePerUnit);
  if (!parsedPrice.valid) {
    errors.pricePerUnit =
      parsedPrice.error || "Nilai tarif harus berupa angka numerik valid";
  } else if (parsedPrice.value! <= 0) {
    errors.pricePerUnit =
      "Nilai tarif harus berupa angka positif lebih besar dari 0";
  } else if (parsedPrice.value! > 100_000_000) {
    errors.pricePerUnit = "Nilai tarif melebihi batas wajar maksimum (Rp 100.000.000)";
  }

  // 4. Validasi Satuan
  const trimmedUnit = (input.unit || "").trim() as EnergyUnit;
  if (!trimmedUnit) {
    errors.unit = "Satuan tarif tidak boleh kosong";
  } else if (
    validCategories.includes(input.category) &&
    !ALLOWED_UNITS[input.category].includes(trimmedUnit)
  ) {
    errors.unit = `Satuan '${trimmedUnit}' tidak sesuai untuk kategori '${input.category}'. Satuan yang diizinkan: ${ALLOWED_UNITS[input.category].join(", ")}`;
  }

  // 5. Validasi Periode Berlaku (Subtugas KEL2-90 & KEL2-115)
  const validFromStr = (input.validFrom || "").trim();
  if (!validFromStr) {
    errors.validFrom = "Tanggal mulai berlaku (validFrom) wajib diisi";
  } else if (!isValidIsoDate(validFromStr)) {
    errors.validFrom =
      "Format tanggal mulai berlaku tidak valid (gunakan format YYYY-MM-DD)";
  }

  let sanitizedValidTo: string | null = null;
  const rawValidTo =
    typeof input.validTo === "string" ? input.validTo.trim() : null;
  if (rawValidTo && rawValidTo !== "") {
    if (!isValidIsoDate(rawValidTo)) {
      errors.validTo =
        "Format tanggal berakhir berlaku tidak valid (gunakan format YYYY-MM-DD)";
    } else if (isValidIsoDate(validFromStr) && rawValidTo < validFromStr) {
      errors.validTo =
        "Tanggal berakhir berlaku tidak boleh lebih awal dari tanggal mulai berlaku";
    } else {
      sanitizedValidTo = rawValidTo;
    }
  }

  // 6. Validasi Alasan Perubahan untuk Jejak Audit (Subtugas KEL2-116)
  if (isEdit) {
    const trimmedReason = (input.reason || "").trim();
    if (!trimmedReason) {
      errors.reason =
        "Alasan/catatan perubahan wajib diisi untuk pencatatan riwayat audit";
    }
  }

  const valid = Object.keys(errors).length === 0;

  if (!valid) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      code: trimmedCode,
      name: trimmedName,
      category: input.category,
      pricePerUnit: parsedPrice.value!,
      unit: trimmedUnit,
      validFrom: validFromStr,
      validTo: sanitizedValidTo,
      isActive: input.isActive ?? true,
      notes: input.notes?.trim() || undefined,
      sourceLabel: input.sourceLabel?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      reason: input.reason?.trim() || undefined,
    },
  };
}

/**
 * Mengecek apakah suatu parameter tarif sedang aktif pada tanggal target (Subtugas KEL2-115)
 * Kriteria:
 * 1. tariff.isActive === true
 * 2. targetDate >= tariff.validFrom
 * 3. tariff.validTo == null ATAU targetDate <= tariff.validTo
 */
export function isTariffActiveOnDate(
  tariff: EnergyTariff,
  targetDate: string | Date,
): boolean {
  if (!tariff.isActive) return false;

  const dateStr =
    targetDate instanceof Date
      ? targetDate.toISOString().slice(0, 10)
      : targetDate.trim().slice(0, 10);

  if (!isValidIsoDate(dateStr)) return false;

  if (dateStr < tariff.validFrom) return false;
  if (tariff.validTo && dateStr > tariff.validTo) return false;

  return true;
}

/**
 * Menyaring daftar parameter tarif yang sedang aktif pada tanggal tertentu (Subtugas KEL2-115)
 * Simulasi HANYA memakai parameter yang aktif pada tanggal/periode terkait.
 */
export function resolveActiveTariffs(
  tariffs: EnergyTariff[],
  targetDate: string | Date,
): EnergyTariff[] {
  return tariffs.filter((t) => isTariffActiveOnDate(t, targetDate));
}

/**
 * Mencari tarif aktif spesifik berdasarkan kode parameter pada tanggal tertentu
 */
export function findActiveTariffByCode(
  tariffs: EnergyTariff[],
  code: string,
  targetDate: string | Date,
): EnergyTariff | null {
  const activeTariffs = resolveActiveTariffs(tariffs, targetDate);
  const found = activeTariffs.find((t) => t.code === code || t.id === code);
  return found || null;
}

/**
 * Menghitung status periode berlaku suatu tarif terhadap tanggal referensi:
 * - "ACTIVE": Berlaku saat ini
 * - "EXPIRED": Masa berlaku sudah berakhir
 * - "SCHEDULED": Terjadwal di masa depan (belum mulai)
 * - "INACTIVE": Dinonaktifkan manual
 */
export function getTariffPeriodStatus(
  tariff: EnergyTariff,
  referenceDate = new Date().toISOString().slice(0, 10),
): "ACTIVE" | "EXPIRED" | "SCHEDULED" | "INACTIVE" {
  if (!tariff.isActive) return "INACTIVE";
  if (referenceDate < tariff.validFrom) return "SCHEDULED";
  if (tariff.validTo && referenceDate > tariff.validTo) return "EXPIRED";
  return "ACTIVE";
}

/**
 * Membuat snapshot tarif untuk simulasi (Subtugas KEL2-116)
 * Menangkap kondisi tarif aktif pada tanggal simulasi sehingga hasil simulasi
 * masa lalu bersifat imutable (tidak berubah sembarangan saat tarif baru diperbarui).
 */
export function createTariffSnapshot(
  tariffs: EnergyTariff[],
  simulationDate: string,
): SimulationTariffSnapshot {
  const activeTariffs = resolveActiveTariffs(tariffs, simulationDate);
  const items: TariffSnapshotItem[] = activeTariffs.map((t) => ({
    tariffId: t.id,
    tariffCode: t.code,
    tariffName: t.name,
    category: t.category,
    pricePerUnit: t.pricePerUnit,
    unit: t.unit,
    effectiveDate: simulationDate,
  }));

  return {
    snapshotId: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    simulationDate,
    capturedAt: new Date().toISOString(),
    items,
  };
}

/**
 * Mengambil harga tarif dari snapshot historis.
 * Menjamin hasil simulasi historis selalu stabil dan tidak terpengaruh update masa depan.
 */
export function getPriceFromSnapshot(
  snapshot: SimulationTariffSnapshot,
  tariffCode: string,
): number | null {
  const item = snapshot.items.find((i) => i.tariffCode === tariffCode || i.tariffId === tariffCode);
  return item ? item.pricePerUnit : null;
}

