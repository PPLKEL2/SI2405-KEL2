import fs from "node:fs";
import path from "node:path";
import type {
  EvIncentiveInput,
  EvIncentivePolicy,
  IncentiveCategory,
} from "../types/ev-incentives.ts";
import {
  isPolicyActiveOnDate,
  validateEvIncentiveInput,
} from "../calculations/ev-incentives.ts";

const DATA_DIR = path.join(process.cwd(), "data");
const INCENTIVES_FILE = path.join(DATA_DIR, "ev-incentives.json");

export const DEFAULT_INITIAL_INCENTIVES: EvIncentivePolicy[] = [
  {
    id: "inc-ppn-dtp-ckd",
    code: "PPN_DTP_CKD",
    name: "PPN DTP mobil listrik CKD",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 10,
    calculationBasis: "dari harga",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
    isActive: true,
    description: "Insentif Pajak Pertambahan Nilai Ditanggung Pemerintah untuk KBLBB roda empat dengan TKDN minimal 40%.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-bea-masuk-cbu",
    code: "BEA_MASUK_CBU",
    name: "Bea masuk CBU mobil listrik",
    category: "CUSTOMS",
    valueType: "PERCENTAGE",
    value: 0,
    calculationBasis: "",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
    isActive: true,
    description: "Pembebasan bea masuk impor mobil listrik berbasis baterai CBU dalam skema komitmen investasi manufaktur.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-pkb-ev-0",
    code: "PKB_EV_0",
    name: "PKB kendaraan listrik",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 0,
    calculationBasis: "(pengenaan 0%)",
    validFrom: "2023-05-11",
    validTo: null,
    isActive: true,
    description: "Pengenaan Pajak Kendaraan Bermotor (PKB) sebesar 0% sesuai Permendagri No. 6 Tahun 2023.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-bbnkb-ev-0",
    code: "BBNKB_EV_0",
    name: "BBN-KB kendaraan listrik",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: 0,
    calculationBasis: "",
    validFrom: "2020-01-01",
    validTo: null,
    isActive: true,
    description: "Pembebasan Bea Balik Nama Kendaraan Bermotor (BBNKB) untuk penyerahan pertama KBLBB.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "inc-subsidi-motor-ev",
    code: "SUBSIDI_MOTOR_EV",
    name: "Bantuan pembelian motor listrik",
    category: "SUBSIDY",
    valueType: "FIXED_AMOUNT",
    value: 5000000,
    calculationBasis: "nominal per unit",
    validFrom: "2024-01-01",
    validTo: "2026-09-30",
    isActive: false,
    description: "Bantuan pemerintah untuk pembelian sepeda motor listrik berbasis baterai baru per 1 NIK KTP.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
];

export class EvIncentiveRepository {
  private inMemoryPolicies: EvIncentivePolicy[] = [];
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.initialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(INCENTIVES_FILE)) {
        const raw = fs.readFileSync(INCENTIVES_FILE, "utf-8");
        this.inMemoryPolicies = JSON.parse(raw);
      } else {
        this.inMemoryPolicies = [...DEFAULT_INITIAL_INCENTIVES];
        this.savePoliciesToFile();
      }
      this.initialized = true;
    } catch {
      this.inMemoryPolicies = [...DEFAULT_INITIAL_INCENTIVES];
      this.initialized = true;
    }
  }

  private savePoliciesToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        INCENTIVES_FILE,
        JSON.stringify(this.inMemoryPolicies, null, 2),
        "utf-8",
      );
    } catch {
      // In-memory fallback
    }
  }

  public getAllPolicies(filters?: {
    category?: IncentiveCategory;
    isActive?: boolean;
    date?: string;
  }): EvIncentivePolicy[] {
    this.ensureInitialized();
    let result = [...this.inMemoryPolicies];

    if (filters?.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters?.isActive !== undefined) {
      result = result.filter((p) => p.isActive === filters.isActive);
    }

    if (filters?.date) {
      result = result.filter((p) => isPolicyActiveOnDate(p, filters.date!));
    }

    return result;
  }

  public getPolicyById(id: string): EvIncentivePolicy | null {
    this.ensureInitialized();
    const found = this.inMemoryPolicies.find(
      (p) => p.id === id || p.code === id,
    );
    return found ? { ...found } : null;
  }

  public createPolicy(
    input: EvIncentiveInput,
    author = "Superadmin",
  ):
    | { ok: true; data: EvIncentivePolicy }
    | { ok: false; errors: Record<string, string> } {
    this.ensureInitialized();

    const validation = validateEvIncentiveInput(input);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const sanitized = validation.sanitized;
    const nowIso = new Date().toISOString();
    const newId = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newPolicy: EvIncentivePolicy = {
      id: newId,
      code: sanitized.code,
      name: sanitized.name,
      category: sanitized.category,
      valueType: sanitized.valueType,
      value: sanitized.value,
      calculationBasis: sanitized.calculationBasis,
      validFrom: sanitized.validFrom,
      validTo: sanitized.validTo,
      isActive: sanitized.isActive,
      description: sanitized.description,
      updatedAt: nowIso,
      updatedBy: author,
    };

    this.inMemoryPolicies.push(newPolicy);
    this.savePoliciesToFile();

    return { ok: true, data: newPolicy };
  }

  public updatePolicy(
    id: string,
    input: EvIncentiveInput,
    author = "Superadmin",
  ):
    | { ok: true; data: EvIncentivePolicy }
    | { ok: false; errors: Record<string, string> } {
    this.ensureInitialized();

    const existingIndex = this.inMemoryPolicies.findIndex((p) => p.id === id);
    if (existingIndex === -1) {
      return {
        ok: false,
        errors: { general: "Kebijakan insentif/pajak tidak ditemukan" },
      };
    }

    const validation = validateEvIncentiveInput(input);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const sanitized = validation.sanitized;
    const nowIso = new Date().toISOString();
    const existing = this.inMemoryPolicies[existingIndex];

    const updated: EvIncentivePolicy = {
      ...existing,
      code: sanitized.code || existing.code,
      name: sanitized.name,
      category: sanitized.category,
      valueType: sanitized.valueType,
      value: sanitized.value,
      calculationBasis: sanitized.calculationBasis,
      validFrom: sanitized.validFrom,
      validTo: sanitized.validTo,
      isActive: sanitized.isActive,
      description: sanitized.description,
      updatedAt: nowIso,
      updatedBy: author,
    };

    this.inMemoryPolicies[existingIndex] = updated;
    this.savePoliciesToFile();

    return { ok: true, data: updated };
  }

  public togglePolicyStatus(
    id: string,
    isActive: boolean,
    author = "Superadmin",
  ):
    | { ok: true; data: EvIncentivePolicy }
    | { ok: false; error: string } {
    this.ensureInitialized();

    const existingIndex = this.inMemoryPolicies.findIndex((p) => p.id === id);
    if (existingIndex === -1) {
      return { ok: false, error: "Kebijakan tidak ditemukan" };
    }

    const nowIso = new Date().toISOString();
    const updated: EvIncentivePolicy = {
      ...this.inMemoryPolicies[existingIndex],
      isActive,
      updatedAt: nowIso,
      updatedBy: author,
    };

    this.inMemoryPolicies[existingIndex] = updated;
    this.savePoliciesToFile();

    return { ok: true, data: updated };
  }

  public deletePolicy(id: string): { ok: boolean; error?: string } {
    this.ensureInitialized();
    const initialLen = this.inMemoryPolicies.length;
    this.inMemoryPolicies = this.inMemoryPolicies.filter((p) => p.id !== id);

    if (this.inMemoryPolicies.length === initialLen) {
      return { ok: false, error: "Kebijakan tidak ditemukan" };
    }

    this.savePoliciesToFile();
    return { ok: true };
  }

  public resetToDefaultSeed(): void {
    this.inMemoryPolicies = [...DEFAULT_INITIAL_INCENTIVES];
    this.savePoliciesToFile();
  }
}

export const evIncentiveRepository = new EvIncentiveRepository();

