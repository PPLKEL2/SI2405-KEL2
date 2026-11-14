import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  EnergyCategory,
  EnergyTariff,
  EnergyTariffHistory,
  EnergyTariffInput,
  EnergyUnit,
} from "../types/domain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const TARIFFS_FILE = path.join(DATA_DIR, "energy-tariffs.json");
const HISTORIES_FILE = path.join(DATA_DIR, "energy-tariff-histories.json");

export const DEFAULT_ENERGY_TARIFFS: EnergyTariff[] = [
  {
    id: "tariff-pln-r1-900",
    code: "PLN_R1_900VA",
    name: "PLN R-1/TR 900 VA (RTM)",
    category: "PLN_HOME",
    pricePerUnit: 1352,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "Tarif rumah tangga mampu 900 VA",
    sourceLabel: "Penetapan Tarif Tenaga Listrik PLN",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-pln-r1-1300-2200",
    code: "PLN_R1_1300_2200VA",
    name: "PLN R-1/TR 1.300 VA – 2.200 VA",
    category: "PLN_HOME",
    pricePerUnit: 1444.7,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "Tarif dasar rumah tangga 1.300 VA & 2.200 VA",
    sourceLabel: "Penetapan Tarif Tenaga Listrik PLN",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-pln-r2-3500-5500",
    code: "PLN_R2_3500_5500VA",
    name: "PLN R-2/TR 3.500 VA – 5.500 VA",
    category: "PLN_HOME",
    pricePerUnit: 1699.53,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "Tarif rumah tangga menengah R-2",
    sourceLabel: "Penetapan Tarif Tenaga Listrik PLN",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-spklu-reguler",
    code: "SPKLU_AC_DC_REGULER",
    name: "Tarif Acuan SPKLU Publik Reguler",
    category: "SPKLU",
    pricePerUnit: 2466,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "Batas tarif acuan pengisian daya SPKLU publik",
    sourceLabel: "Permen ESDM No. 1 Tahun 2023",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-bbm-pertalite",
    code: "BBM_PERTALITE_RON90",
    name: "Pertalite (RON 90)",
    category: "BBM",
    pricePerUnit: 10000,
    unit: "Rp/liter",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "BBM Penugasan RON 90",
    sourceLabel: "Pertamina Patra Niaga",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-bbm-pertamax",
    code: "BBM_PERTAMAX_RON92",
    name: "Pertamax (RON 92)",
    category: "BBM",
    pricePerUnit: 12950,
    unit: "Rp/liter",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "BBM Umum Non-Subsidi RON 92",
    sourceLabel: "Pertamina Patra Niaga",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-bbm-pertamax-turbo",
    code: "BBM_PERTAMAX_TURBO_RON98",
    name: "Pertamax Turbo (RON 98)",
    category: "BBM",
    pricePerUnit: 14400,
    unit: "Rp/liter",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "BBM Umum Non-Subsidi RON 98",
    sourceLabel: "Pertamina Patra Niaga",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "tariff-bbm-biosolar",
    code: "BBM_BIOSOLAR_CN48",
    name: "Bio Solar Subsidi (CN 48)",
    category: "BBM",
    pricePerUnit: 6800,
    unit: "Rp/liter",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    notes: "BBM Subsidi Solar",
    sourceLabel: "Pertamina Patra Niaga",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateEnergyTariffInput(input: Partial<EnergyTariffInput>): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    code: string;
    name: string;
    category: EnergyCategory;
    pricePerUnit: number;
    unit: EnergyUnit;
    validFrom: string;
    validTo: string | null;
    isActive: boolean;
    notes?: string;
    sourceLabel?: string;
    reason?: string;
  };
} {
  const errors: Record<string, string> = {};

  const code = String(input.code ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_");
  const name = String(input.name ?? "").trim();
  const category = String(input.category ?? "").trim() as EnergyCategory;
  const unit = String(input.unit ?? "").trim() as EnergyUnit;

  if (!code || code.length < 3) {
    errors.code = "Kode parameter wajib diisi (minimal 3 karakter).";
  }
  if (!name) {
    errors.name = "Nama tarif energi wajib diisi.";
  }
  if (!["PLN_HOME", "SPKLU", "BBM"].includes(category)) {
    errors.category = "Kategori tarif harus PLN_HOME, SPKLU, atau BBM.";
  }

  const pricePerUnit = Number(input.pricePerUnit);
  if (
    input.pricePerUnit === undefined ||
    input.pricePerUnit === "" ||
    !Number.isFinite(pricePerUnit) ||
    pricePerUnit <= 0 ||
    pricePerUnit > 500000
  ) {
    errors.pricePerUnit = "Nilai tarif wajib berupa angka positif (lebih dari 0).";
  }

  if (!["Rp/kWh", "Rp/liter", "Rp/kVA"].includes(unit)) {
    errors.unit = "Satuan tarif harus Rp/kWh, Rp/liter, atau Rp/kVA.";
  } else {
    if (category === "BBM" && unit !== "Rp/liter") {
      errors.unit = "Kategori BBM wajib menggunakan satuan Rp/liter.";
    }
    if ((category === "PLN_HOME" || category === "SPKLU") && unit === "Rp/liter") {
      errors.unit = "Kategori listrik PLN/SPKLU wajib menggunakan satuan Rp/kWh atau Rp/kVA.";
    }
  }

  const validFrom = String(input.validFrom ?? "").trim();
  if (!ISO_DATE_RE.test(validFrom)) {
    errors.validFrom = "Tanggal mulai berlaku wajib menggunakan format YYYY-MM-DD.";
  }

  const rawTo = input.validTo ? String(input.validTo).trim() : "";
  const validTo = rawTo === "" ? null : rawTo;
  if (validTo !== null) {
    if (!ISO_DATE_RE.test(validTo)) {
      errors.validTo = "Tanggal akhir berlaku wajib menggunakan format YYYY-MM-DD.";
    } else if (ISO_DATE_RE.test(validFrom) && validTo < validFrom) {
      errors.validTo = "Tanggal akhir tidak boleh lebih awal dari tanggal mulai.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      code,
      name,
      category,
      pricePerUnit: Number(pricePerUnit.toFixed(2)),
      unit,
      validFrom,
      validTo,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      notes: input.notes ? String(input.notes).trim() : undefined,
      sourceLabel: input.sourceLabel ? String(input.sourceLabel).trim() : undefined,
      reason: input.reason ? String(input.reason).trim() : "Pembaruan parameter tarif energi",
    },
  };
}

export function isTariffActiveOnDate(tariff: EnergyTariff, dateStr: string): boolean {
  if (!tariff.isActive) return false;
  if (tariff.validFrom > dateStr) return false;
  if (tariff.validTo !== null && tariff.validTo < dateStr) return false;
  return true;
}

class EnergyTariffRepository {
  private tariffs: EnergyTariff[] = [];
  private histories: EnergyTariffHistory[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(TARIFFS_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(TARIFFS_FILE, "utf-8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tariffs = parsed;
        }
      } catch {
        // fallback
      }
    }
    if (this.tariffs.length === 0) {
      this.tariffs = [...DEFAULT_ENERGY_TARIFFS];
      this.saveTariffs();
    }

    if (fs.existsSync(HISTORIES_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(HISTORIES_FILE, "utf-8"));
        if (Array.isArray(parsed)) {
          this.histories = parsed;
        }
      } catch {
        // fallback
      }
    }
    this.initialized = true;
  }

  private saveTariffs(): void {
    fs.writeFileSync(TARIFFS_FILE, JSON.stringify(this.tariffs, null, 2), "utf-8");
  }

  private saveHistories(): void {
    fs.writeFileSync(HISTORIES_FILE, JSON.stringify(this.histories, null, 2), "utf-8");
  }

  public getAllTariffs(): EnergyTariff[] {
    this.ensureInitialized();
    return [...this.tariffs];
  }

  public getActiveTariffs(dateStr = new Date().toISOString().slice(0, 10)): EnergyTariff[] {
    this.ensureInitialized();
    return this.tariffs.filter((t) => isTariffActiveOnDate(t, dateStr));
  }

  public getHistories(): EnergyTariffHistory[] {
    this.ensureInitialized();
    return [...this.histories].sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  }

  public createOrUpdateTariff(
    input: EnergyTariffInput,
    author = "Superadmin"
  ): {
    ok: boolean;
    data?: EnergyTariff;
    errors?: Record<string, string>;
  } {
    this.ensureInitialized();
    const validation = validateEnergyTariffInput(input);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const s = validation.sanitized;
    const nowIso = new Date().toISOString();
    const existingIdx = input.id
      ? this.tariffs.findIndex((t) => t.id === input.id)
      : this.tariffs.findIndex((t) => t.code === s.code);

    if (existingIdx >= 0) {
      const prev = this.tariffs[existingIdx];
      const updated: EnergyTariff = {
        ...prev,
        code: s.code,
        name: s.name,
        category: s.category,
        pricePerUnit: s.pricePerUnit,
        unit: s.unit,
        validFrom: s.validFrom,
        validTo: s.validTo,
        isActive: s.isActive,
        notes: s.notes ?? prev.notes,
        sourceLabel: s.sourceLabel ?? prev.sourceLabel,
        updatedAt: nowIso,
        updatedBy: author,
      };

      const historyItem: EnergyTariffHistory = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tariffId: prev.id,
        tariffCode: updated.code,
        tariffName: updated.name,
        category: updated.category,
        action:
          prev.pricePerUnit !== updated.pricePerUnit ? "UPDATE_PRICE" : "UPDATE_ALL",
        oldPrice: prev.pricePerUnit,
        newPrice: updated.pricePerUnit,
        oldUnit: prev.unit,
        newUnit: updated.unit,
        oldValidFrom: prev.validFrom,
        newValidFrom: updated.validFrom,
        oldValidTo: prev.validTo,
        newValidTo: updated.validTo,
        oldIsActive: prev.isActive,
        newIsActive: updated.isActive,
        changedBy: author,
        reason: s.reason || "Pembaruan parameter tarif energi",
        changedAt: nowIso,
      };

      this.tariffs[existingIdx] = updated;
      this.histories.unshift(historyItem);
      this.saveTariffs();
      this.saveHistories();
      return { ok: true, data: updated };
    }

    const created: EnergyTariff = {
      id: `tariff-${Date.now().toString(36)}`,
      code: s.code,
      name: s.name,
      category: s.category,
      pricePerUnit: s.pricePerUnit,
      unit: s.unit,
      validFrom: s.validFrom,
      validTo: s.validTo,
      isActive: s.isActive,
      notes: s.notes,
      sourceLabel: s.sourceLabel,
      updatedAt: nowIso,
      updatedBy: author,
    };

    const historyItem: EnergyTariffHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tariffId: created.id,
      tariffCode: created.code,
      tariffName: created.name,
      category: created.category,
      action: "CREATE",
      oldPrice: null,
      newPrice: created.pricePerUnit,
      oldUnit: null,
      newUnit: created.unit,
      oldValidFrom: null,
      newValidFrom: created.validFrom,
      oldValidTo: null,
      newValidTo: created.validTo,
      oldIsActive: null,
      newIsActive: created.isActive,
      changedBy: author,
      reason: s.reason || "Penambahan parameter tarif energi baru",
      changedAt: nowIso,
    };

    this.tariffs.push(created);
    this.histories.unshift(historyItem);
    this.saveTariffs();
    this.saveHistories();
    return { ok: true, data: created };
  }

  public setStatus(id: string, isActive: boolean, author = "Superadmin"): EnergyTariff | null {
    this.ensureInitialized();
    const idx = this.tariffs.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const prev = this.tariffs[idx];
    const nowIso = new Date().toISOString();
    const updated: EnergyTariff = {
      ...prev,
      isActive,
      updatedAt: nowIso,
      updatedBy: author,
    };

    this.tariffs[idx] = updated;
    this.histories.unshift({
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tariffId: prev.id,
      tariffCode: prev.code,
      tariffName: prev.name,
      category: prev.category,
      action: "STATUS_CHANGE",
      oldPrice: prev.pricePerUnit,
      newPrice: prev.pricePerUnit,
      oldUnit: prev.unit,
      newUnit: prev.unit,
      oldValidFrom: prev.validFrom,
      newValidFrom: prev.validFrom,
      oldValidTo: prev.validTo,
      newValidTo: prev.validTo,
      oldIsActive: prev.isActive,
      newIsActive: isActive,
      changedBy: author,
      reason: isActive ? "Mengaktifkan tarif energi" : "Menonaktifkan tarif energi",
      changedAt: nowIso,
    });

    this.saveTariffs();
    this.saveHistories();
    return updated;
  }

  public resetToDefaultSeed(): void {
    this.tariffs = [...DEFAULT_ENERGY_TARIFFS];
    this.histories = [];
    this.initialized = true;
    this.saveTariffs();
    this.saveHistories();
  }
}

export const energyTariffRepository = new EnergyTariffRepository();

