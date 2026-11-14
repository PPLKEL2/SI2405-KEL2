import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ApplicableVehicleType,
  EvIncentiveInput,
  EvIncentivePolicy,
  IncentiveCategory,
  IncentiveValueType,
} from "../types/domain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const INCENTIVES_FILE = path.join(DATA_DIR, "ev-incentives.json");

export const DEFAULT_EV_INCENTIVES: EvIncentivePolicy[] = [
  {
    id: "inc-ppn-dtp-mobil",
    code: "PPN_DTP_EV_TKDN40",
    name: "Insentif PPN DTP 10% (PPN Efektif 1%)",
    category: "INCENTIVE",
    vehicleType: "Mobil",
    valueType: "PERCENTAGE",
    value: 10,
    calculationBasis: "Potongan 10% PPN dari harga jual untuk EV TKDN >= 40%",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
    isActive: true,
    description: "PMK Insentif PPN Ditanggung Pemerintah untuk KBLBB Roda 4",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-subsidi-motor-listrik",
    code: "SUBSIDI_MOTOR_7JT",
    name: "Subsidi Pembelian Motor Listrik Roda 2",
    category: "SUBSIDY",
    vehicleType: "Motor",
    valueType: "FIXED_AMOUNT",
    value: 7000000,
    calculationBasis: "Potongan langsung Rp 7.000.000 per NIK untuk motor listrik TKDN >= 40%",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
    isActive: true,
    description: "Program Bantuan Pemerintah Kendaraan Bermotor Listrik Berbasis Baterai Roda 2",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-pkb-0-persen",
    code: "PKB_EV_0_PERSEN",
    name: "Pembebasan PKB & BBN-KB KBLBB (0%)",
    category: "TAX",
    vehicleType: "Semua",
    valueType: "PERCENTAGE",
    value: 0,
    calculationBasis: "Pengenaan tarif 0% atas Pajak Kendaraan Bermotor (PKB) & BBN-KB",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    description: "Permendagri Pembebasan PKB dan BBN-KB Kendaraan Listrik Murni",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-bea-masuk-cbu",
    code: "BEA_MASUK_EV_0",
    name: "Insentif Bea Masuk 0% KBLBB Komitmen Produksi",
    category: "CUSTOMS",
    vehicleType: "Mobil",
    valueType: "PERCENTAGE",
    value: 0,
    calculationBasis: "Tarif bea masuk 0% atas impor unit EV dengan komitmen investasi",
    validFrom: "2024-02-15",
    validTo: "2026-12-31",
    isActive: false,
    description: "PMK Bea Masuk Ditanggung Pemerintah untuk produsen dengan komitmen perakitan lokal",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateEvIncentiveInput(input: Partial<EvIncentiveInput>): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    code: string;
    name: string;
    category: IncentiveCategory;
    vehicleType: ApplicableVehicleType;
    valueType: IncentiveValueType;
    value: number;
    calculationBasis: string;
    validFrom: string;
    validTo: string | null;
    isActive: boolean;
    description?: string;
  };
} {
  const errors: Record<string, string> = {};

  const name = String(input.name ?? "").trim();
  if (!name) {
    errors.name = "Nama kebijakan insentif/pajak wajib diisi.";
  }

  const rawCode = input.code
    ? String(input.code).trim()
    : name.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  const code = rawCode.toUpperCase().replace(/[^A-Z0-9_]/g, "_").slice(0, 40);
  if (!code || code.length < 3) {
    errors.code = "Kode kebijakan minimal 3 karakter.";
  }

  const category = String(input.category ?? "").trim() as IncentiveCategory;
  if (!["TAX", "CUSTOMS", "INCENTIVE", "SUBSIDY"].includes(category)) {
    errors.category = "Kategori harus TAX, CUSTOMS, INCENTIVE, atau SUBSIDY.";
  }

  const vehicleType = (String(input.vehicleType ?? "Semua").trim() ||
    "Semua") as ApplicableVehicleType;
  if (!["Motor", "Mobil", "Semua"].includes(vehicleType)) {
    errors.vehicleType = "Jenis kendaraan harus Motor, Mobil, atau Semua.";
  }

  const valueType = String(input.valueType ?? "").trim() as IncentiveValueType;
  if (!["PERCENTAGE", "FIXED_AMOUNT"].includes(valueType)) {
    errors.valueType = "Tipe nilai harus PERCENTAGE atau FIXED_AMOUNT.";
  }

  const value = Number(input.value);
  if (input.value === undefined || input.value === "" || !Number.isFinite(value) || value < 0) {
    errors.value = "Nilai kebijakan harus berupa angka >= 0.";
  } else if (valueType === "PERCENTAGE" && value > 100) {
    errors.value = "Nilai persentase tidak boleh melebihi 100%.";
  } else if (valueType === "FIXED_AMOUNT" && value <= 0) {
    errors.value = "Nominal subsidi/insentif tetap harus lebih besar dari Rp 0.";
  }

  const validFrom = String(input.validFrom ?? "").trim();
  if (!ISO_DATE_RE.test(validFrom)) {
    errors.validFrom = "Tanggal mulai berlaku wajib berformat YYYY-MM-DD.";
  }

  const rawTo = input.validTo ? String(input.validTo).trim() : "";
  const validTo = rawTo === "" ? null : rawTo;
  if (validTo !== null) {
    if (!ISO_DATE_RE.test(validTo)) {
      errors.validTo = "Tanggal berakhir wajib berformat YYYY-MM-DD.";
    } else if (ISO_DATE_RE.test(validFrom) && validTo < validFrom) {
      errors.validTo = "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const defaultBasis =
    valueType === "PERCENTAGE"
      ? `Persentase ${value}% terhadap dasar pengenaan kendaraan ${vehicleType}`
      : `Potongan nominal tetap Rp ${Math.round(value).toLocaleString("id-ID")}`;

  return {
    valid: true,
    errors: {},
    sanitized: {
      code,
      name,
      category,
      vehicleType,
      valueType,
      value: valueType === "PERCENTAGE" ? Number(value.toFixed(2)) : Math.round(value),
      calculationBasis: String(input.calculationBasis ?? "").trim() || defaultBasis,
      validFrom,
      validTo,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      description: input.description ? String(input.description).trim() : undefined,
    },
  };
}

export function isPolicyActiveOnDate(policy: EvIncentivePolicy, dateStr: string): boolean {
  if (!policy.isActive) return false;
  if (policy.validFrom > dateStr) return false;
  if (policy.validTo !== null && policy.validTo < dateStr) return false;
  return true;
}

class EvIncentiveRepository {
  private policies: EvIncentivePolicy[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(INCENTIVES_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(INCENTIVES_FILE, "utf-8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.policies = parsed;
          this.initialized = true;
          return;
        }
      } catch {
        // fallback
      }
    }
    this.policies = [...DEFAULT_EV_INCENTIVES];
    this.saveToFile();
    this.initialized = true;
  }

  private saveToFile(): void {
    fs.writeFileSync(INCENTIVES_FILE, JSON.stringify(this.policies, null, 2), "utf-8");
  }

  public getAllPolicies(): EvIncentivePolicy[] {
    this.ensureInitialized();
    return [...this.policies];
  }

  public getActivePolicies(
    dateStr = new Date().toISOString().slice(0, 10),
    vehicleType?: ApplicableVehicleType
  ): EvIncentivePolicy[] {
    this.ensureInitialized();
    return this.policies.filter((p) => {
      if (!isPolicyActiveOnDate(p, dateStr)) return false;
      if (
        vehicleType &&
        vehicleType !== "Semua" &&
        p.vehicleType !== "Semua" &&
        p.vehicleType !== vehicleType
      ) {
        return false;
      }
      return true;
    });
  }

  public createOrUpdatePolicy(
    input: EvIncentiveInput,
    author = "Superadmin"
  ): {
    ok: boolean;
    data?: EvIncentivePolicy;
    errors?: Record<string, string>;
  } {
    this.ensureInitialized();
    const validation = validateEvIncentiveInput(input);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const s = validation.sanitized;
    const nowIso = new Date().toISOString();
    const existingIdx = input.id
      ? this.policies.findIndex((p) => p.id === input.id)
      : this.policies.findIndex((p) => p.code === s.code);

    if (existingIdx >= 0) {
      const prev = this.policies[existingIdx];
      const updated: EvIncentivePolicy = {
        ...prev,
        ...s,
        updatedAt: nowIso,
        updatedBy: author,
      };
      this.policies[existingIdx] = updated;
      this.saveToFile();
      return { ok: true, data: updated };
    }

    const created: EvIncentivePolicy = {
      id: `inc-${Date.now().toString(36)}`,
      ...s,
      updatedAt: nowIso,
      updatedBy: author,
    };
    this.policies.unshift(created);
    this.saveToFile();
    return { ok: true, data: created };
  }

  public setPolicyStatus(
    id: string,
    isActive: boolean,
    author = "Superadmin"
  ): EvIncentivePolicy | null {
    this.ensureInitialized();
    const idx = this.policies.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.policies[idx] = {
      ...this.policies[idx],
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: author,
    };
    this.saveToFile();
    return this.policies[idx];
  }

  public deletePolicy(id: string): boolean {
    this.ensureInitialized();
    const lenBefore = this.policies.length;
    this.policies = this.policies.filter((p) => p.id !== id);
    if (this.policies.length === lenBefore) return false;
    this.saveToFile();
    return true;
  }

  public resetToDefaultSeed(): void {
    this.policies = [...DEFAULT_EV_INCENTIVES];
    this.initialized = true;
    this.saveToFile();
  }
}

export const evIncentiveRepository = new EvIncentiveRepository();

