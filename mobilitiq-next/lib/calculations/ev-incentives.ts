import type {
  EvIncentiveInput,
  EvIncentivePolicy,
  IncentiveCategory,
  IncentiveValidationResult,
  IncentiveValueType,
} from "../types/ev-incentives.ts";
import { parseStrictNumber } from "../parser.ts";
import { isValidIsoDate } from "./energy-pricing.ts";

export const INCENTIVE_CATEGORIES: Record<IncentiveCategory, string> = {
  TAX: "Pajak",
  CUSTOMS: "Bea Masuk",
  INCENTIVE: "Insentif",
  SUBSIDY: "Subsidi / Bantuan",
};

/**
 * Validasi input kebijakan insentif dan pajak EV (PBI 10)
 */
export function validateEvIncentiveInput(
  input: EvIncentiveInput,
): IncentiveValidationResult {
  const errors: Record<string, string> = {};

  // 1. Validasi Nama Kebijakan
  const trimmedName = (input.name || "").trim();
  if (!trimmedName) {
    errors.name = "Nama kebijakan wajib diisi";
  } else if (trimmedName.length < 3) {
    errors.name = "Nama kebijakan minimal 3 karakter";
  }

  // 2. Validasi Kategori
  const validCategories: IncentiveCategory[] = [
    "TAX",
    "CUSTOMS",
    "INCENTIVE",
    "SUBSIDY",
  ];
  if (!validCategories.includes(input.category)) {
    errors.category = `Kategori harus salah satu dari: ${validCategories.join(", ")}`;
  }

  // 3. Validasi Jenis Nilai
  const validValueTypes: IncentiveValueType[] = [
    "PERCENTAGE",
    "FIXED_AMOUNT",
  ];
  if (!validValueTypes.includes(input.valueType)) {
    errors.valueType = "Jenis nilai harus berupa Persentase atau Nominal Tetap";
  }

  // 4. Validasi Nilai Kebijakan
  const parsedValue = parseStrictNumber(input.value);
  if (!parsedValue.valid) {
    errors.value = parsedValue.error || "Nilai kebijakan harus berupa angka valid";
  } else if (parsedValue.value! < 0) {
    errors.value = "Nilai kebijakan tidak boleh bernilai negatif";
  } else if (input.valueType === "PERCENTAGE" && parsedValue.value! > 100) {
    errors.value = "Nilai persentase tidak boleh melebihi 100%";
  }

  // 5. Validasi Periode Berlaku
  const validFromStr = (input.validFrom || "").trim();
  if (!validFromStr) {
    errors.validFrom = "Tanggal mulai berlaku wajib diisi";
  } else if (!isValidIsoDate(validFromStr)) {
    errors.validFrom = "Format tanggal mulai berlaku tidak valid (YYYY-MM-DD)";
  }

  let sanitizedValidTo: string | null = null;
  const rawValidTo =
    typeof input.validTo === "string" ? input.validTo.trim() : null;
  if (rawValidTo && rawValidTo !== "") {
    if (!isValidIsoDate(rawValidTo)) {
      errors.validTo = "Format tanggal berakhir tidak valid (YYYY-MM-DD)";
    } else if (isValidIsoDate(validFromStr) && rawValidTo < validFromStr) {
      errors.validTo =
        "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai berlaku";
    } else {
      sanitizedValidTo = rawValidTo;
    }
  }

  // 6. Generate atau sanitasi Kode Identitas
  let code = (input.code || "").trim().toUpperCase();
  if (!code) {
    code = trimmedName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 30);
  }

  const valid = Object.keys(errors).length === 0;
  if (!valid) {
    return { valid: false, errors };
  }

  // Sanitasi Basis Perhitungan
  let calculationBasis = (input.calculationBasis || "").trim();
  if (!calculationBasis) {
    if (input.valueType === "PERCENTAGE") {
      calculationBasis = "dari harga";
    } else {
      calculationBasis = "nominal per unit";
    }
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      code,
      name: trimmedName,
      category: input.category,
      valueType: input.valueType,
      value: parsedValue.value!,
      calculationBasis,
      validFrom: validFromStr,
      validTo: sanitizedValidTo,
      isActive: input.isActive ?? true,
      description: input.description?.trim() || undefined,
    },
  };
}

/**
 * Mengecek apakah kebijakan aktif pada tanggal target
 */
export function isPolicyActiveOnDate(
  policy: EvIncentivePolicy,
  targetDate: string | Date,
): boolean {
  if (!policy.isActive) return false;

  const dateStr =
    targetDate instanceof Date
      ? targetDate.toISOString().slice(0, 10)
      : targetDate.trim().slice(0, 10);

  if (!isValidIsoDate(dateStr)) return false;

  if (dateStr < policy.validFrom) return false;
  if (policy.validTo && dateStr > policy.validTo) return false;

  return true;
}

/**
 * Mendapatkan status periode kebijakan:
 * - "ACTIVE": Berlaku saat ini
 * - "EXPIRED": Masa berlaku sudah berakhir
 * - "SCHEDULED": Terjadwal di masa depan
 * - "INACTIVE": Dinonaktifkan secara administratif
 */
export function getPolicyPeriodStatus(
  policy: EvIncentivePolicy,
  referenceDate = "2026-11-08",
): "ACTIVE" | "EXPIRED" | "SCHEDULED" | "INACTIVE" {
  if (!policy.isActive) return "INACTIVE";
  if (referenceDate < policy.validFrom) return "SCHEDULED";
  if (policy.validTo && referenceDate > policy.validTo) return "EXPIRED";
  return "ACTIVE";
}

/**
 * Format tampilan nilai kebijakan sesuai gambar referensi:
 * Contoh: "10% dari harga", "0%", "0% (pengenaan 0%)", "Rp 5.000.000"
 */
export function formatPolicyValue(policy: {
  valueType: IncentiveValueType;
  value: number;
  calculationBasis?: string;
}): string {
  if (policy.valueType === "PERCENTAGE") {
    if (policy.calculationBasis && policy.calculationBasis.trim()) {
      return `${policy.value}% ${policy.calculationBasis}`;
    }
    return `${policy.value}%`;
  }

  // FIXED_AMOUNT (Nominal Rupiah)
  const formattedRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(policy.value);

  return formattedRupiah.replace(/\s+/g, " ");
}

/**
 * Format tanggal berlaku sampai sesuai gambar referensi:
 * Contoh: "31 Des 2026" atau "Tanpa batas"
 */
export function formatPolicyValidity(validTo: string | null): string {
  if (!validTo) return "Tanpa batas";

  const [year, month, day] = validTo.split("-");
  if (!year || !month || !day) return validTo;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const monthIdx = parseInt(month, 10) - 1;
  const monthStr = months[monthIdx] || month;

  return `${parseInt(day, 10)} ${monthStr} ${year}`;
}

