import fs from "node:fs";
import path from "node:path";
import type {
  EnergyCategory,
  EnergyTariff,
  EnergyTariffHistory,
  EnergyTariffInput,
  TariffActionType,
} from "../types/energy-pricing.ts";
import {
  isTariffActiveOnDate,
  validateEnergyTariffInput,
} from "../calculations/energy-pricing.ts";

const DATA_DIR = path.join(process.cwd(), "data");
const TARIFFS_FILE = path.join(DATA_DIR, "energy-tariffs.json");
const HISTORIES_FILE = path.join(DATA_DIR, "energy-tariff-histories.json");

/**
 * Seed data awal resmi mengacu pada ESDM & PLN Triwulan IV 2024 serta SPKLU & BBM Acuan
 */
export const DEFAULT_INITIAL_TARIFFS: EnergyTariff[] = [
  {
    id: "pln-900-subsidized",
    code: "PLN_R1_900_SUB",
    name: "R-1 / 900 VA (Bersubsidi APBN)",
    category: "PLN_HOME",
    pricePerUnit: 605,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Keputusan Menteri ESDM / Siaran Pers ESDM 544/2024",
    sourceUrl:
      "https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap",
    notes: "Dikhususkan bagi rumah tangga terdaftar pada DTKS (Data Terpadu Kesejahteraan Sosial).",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Sistem (Migrasi Seed)",
  },
  {
    id: "pln-900-rtm",
    code: "PLN_R1_900_RTM",
    name: "R-1 / 900 VA RTM (Rumah Tangga Mampu / Non-Subsidi)",
    category: "PLN_HOME",
    pricePerUnit: 1352,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Permen ESDM 28/2016 jo. Tarif PLN TW IV 2024",
    sourceUrl: "https://web.pln.co.id/pelanggan/tarif-tenaga-listrik",
    notes: "Tarif pelanggan Rumah Tangga Mampu 900 VA tanpa subsidi APBN.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Sistem (Migrasi Seed)",
  },
  {
    id: "pln-1300-2200",
    code: "PLN_R1_1300_2200",
    name: "R-1 / 1.300 VA s.d. 2.200 VA (Non-Subsidi)",
    category: "PLN_HOME",
    pricePerUnit: 1444.7,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Siaran Pers Kementerian ESDM No. 544.Pers/04/SIND/2024",
    sourceUrl:
      "https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap",
    notes: "Tarif batas daya menengah umum non-subsidi di Indonesia.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Sistem (Migrasi Seed)",
  },
  {
    id: "pln-3500-5500",
    code: "PLN_R2_3500_5500",
    name: "R-2 / 3.500 VA s.d. 5.500 VA (Non-Subsidi)",
    category: "PLN_HOME",
    pricePerUnit: 1699.53,
    unit: "Rp/kWh",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Siaran Pers Kementerian ESDM No. 544.Pers/04/SIND/2024",
    sourceUrl:
      "https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap",
    notes: "Tarif batas daya menengah-tinggi non-subsidi.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Sistem (Migrasi Seed)",
  },
  {
    id: "spklu-public-fast",
    code: "SPKLU_PUBLIC_FAST",
    name: "Tarif Acuan SPKLU Publik (Fast & Medium Charging)",
    category: "SPKLU",
    pricePerUnit: 2466,
    unit: "Rp/kWh",
    validFrom: "2024-01-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Permen ESDM 1/2023 & Kepmen ESDM 182.K/2023",
    sourceUrl: "https://peraturan.go.id/id/permen-esdm-no-1-tahun-2023",
    notes: "Tarif acuan rata-rata operator SPKLU publik di Indonesia.",
    updatedAt: "2024-01-01T00:00:00.000Z",
    updatedBy: "Sistem (Migrasi Seed)",
  },
  {
    id: "bbm-pertalite",
    code: "BBM_PERTALITE",
    name: "Pertalite",
    category: "BBM",
    pricePerUnit: 10000,
    unit: "Rp/liter",
    validFrom: "2022-09-03",
    validTo: null,
    isActive: true,
    sourceLabel: "Kepmen ESDM No. 245.K/MG.01/MEM.M/2022",
    sourceUrl: "https://mypertamina.id/fuels-harga",
    notes: "Harga resmi BBM penugasan Pertalite.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "bbm-pertamax",
    code: "BBM_PERTAMAX",
    name: "Pertamax",
    category: "BBM",
    pricePerUnit: 12500,
    unit: "Rp/liter",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Penetapan Harga Pertamina Acuan",
    sourceUrl: "https://mypertamina.id/fuels-harga",
    notes: "Harga BBM RON 92 acuan.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "bbm-pertamax-turbo",
    code: "BBM_PERTAMAX_TURBO",
    name: "Pertamax Turbo",
    category: "BBM",
    pricePerUnit: 14000,
    unit: "Rp/liter",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Penetapan Harga Pertamina Acuan",
    sourceUrl: "https://mypertamina.id/fuels-harga",
    notes: "Harga BBM RON 98 acuan.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "bbm-biosolar",
    code: "BBM_BIOSOLAR",
    name: "Biosolar",
    category: "BBM",
    pricePerUnit: 6800,
    unit: "Rp/liter",
    validFrom: "2022-09-03",
    validTo: null,
    isActive: true,
    sourceLabel: "Kepmen ESDM / Pertamina Acuan",
    sourceUrl: "https://mypertamina.id/fuels-harga",
    notes: "Harga resmi Solar bersubsidi.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
  {
    id: "bbm-dexlite",
    code: "BBM_DEXLITE",
    name: "Dexlite",
    category: "BBM",
    pricePerUnit: 13300,
    unit: "Rp/liter",
    validFrom: "2024-10-01",
    validTo: null,
    isActive: true,
    sourceLabel: "Penetapan Harga Pertamina Acuan",
    sourceUrl: "https://mypertamina.id/fuels-harga",
    notes: "Harga BBM Diesel CN 51 acuan.",
    updatedAt: "2024-10-01T00:00:00.000Z",
    updatedBy: "Superadmin",
  },
];

export class EnergyTariffRepository {
  private inMemoryTariffs: EnergyTariff[] = [];
  private inMemoryHistories: EnergyTariffHistory[] = [];
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

      if (fs.existsSync(TARIFFS_FILE)) {
        const raw = fs.readFileSync(TARIFFS_FILE, "utf-8");
        this.inMemoryTariffs = JSON.parse(raw);
      } else {
        this.inMemoryTariffs = [...DEFAULT_INITIAL_TARIFFS];
        this.saveTariffsToFile();
      }

      if (fs.existsSync(HISTORIES_FILE)) {
        const rawHist = fs.readFileSync(HISTORIES_FILE, "utf-8");
        this.inMemoryHistories = JSON.parse(rawHist);
      } else {
        // Initial audit seed
        this.inMemoryHistories = this.inMemoryTariffs.map((t) => ({
          id: `hist_init_${t.id}`,
          tariffId: t.id,
          tariffCode: t.code,
          tariffName: t.name,
          category: t.category,
          action: "CREATE" as TariffActionType,
          oldPrice: null,
          newPrice: t.pricePerUnit,
          oldUnit: null,
          newUnit: t.unit,
          oldValidFrom: null,
          newValidFrom: t.validFrom,
          oldValidTo: null,
          newValidTo: t.validTo,
          oldIsActive: null,
          newIsActive: t.isActive,
          changedBy: "Sistem",
          reason: "Inisialisasi parameter regulasi resmi bawaan",
          changedAt: t.updatedAt,
        }));
        this.saveHistoriesToFile();
      }

      this.initialized = true;
    } catch {
      // Fallback in memory
      if (this.inMemoryTariffs.length === 0) {
        this.inMemoryTariffs = [...DEFAULT_INITIAL_TARIFFS];
      }
      this.initialized = true;
    }
  }

  private saveTariffsToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        TARIFFS_FILE,
        JSON.stringify(this.inMemoryTariffs, null, 2),
        "utf-8",
      );
    } catch {
      // Ignore disk error on readonly environment
    }
  }

  private saveHistoriesToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        HISTORIES_FILE,
        JSON.stringify(this.inMemoryHistories, null, 2),
        "utf-8",
      );
    } catch {
      // Ignore disk error
    }
  }

  public getAllTariffs(filters?: {
    category?: EnergyCategory;
    isActive?: boolean;
    search?: string;
  }): EnergyTariff[] {
    this.ensureInitialized();
    let result = [...this.inMemoryTariffs];

    if (filters?.category) {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters?.isActive !== undefined) {
      result = result.filter((t) => t.isActive === filters.isActive);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)),
      );
    }

    return result;
  }

  public getTariffById(id: string): EnergyTariff | null {
    this.ensureInitialized();
    return this.inMemoryTariffs.find((t) => t.id === id) || null;
  }

  public getTariffByCode(code: string): EnergyTariff | null {
    this.ensureInitialized();
    return this.inMemoryTariffs.find((t) => t.code === code) || null;
  }

  /**
   * Mengambil tarif aktif pada tanggal tertentu (KEL2-115)
   */
  public getActiveTariffsOnDate(
    date: string | Date,
    category?: EnergyCategory,
  ): EnergyTariff[] {
    this.ensureInitialized();
    let active = this.inMemoryTariffs.filter((t) =>
      isTariffActiveOnDate(t, date),
    );
    if (category) {
      active = active.filter((t) => t.category === category);
    }
    return active;
  }

  /**
   * Menambah parameter harga energi baru (Subtugas KEL2-90 & KEL2-116)
   */
  public createTariff(
    input: EnergyTariffInput,
    author = "Superadmin",
  ): { ok: true; data: EnergyTariff } | { ok: false; error: string; errors?: Record<string, string> } {
    this.ensureInitialized();
    const validation = validateEnergyTariffInput(input, false);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, error: "Validasi parameter gagal", errors: validation.errors };
    }

    const { sanitized } = validation;

    // Cek keunikan kode
    const existingCode = this.inMemoryTariffs.find((t) => t.code === sanitized.code);
    if (existingCode) {
      return {
        ok: false,
        error: `Kode parameter '${sanitized.code}' sudah digunakan oleh '${existingCode.name}'`,
        errors: { code: "Kode parameter harus unik" },
      };
    }

    const newId =
      input.id ||
      `tariff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newTariff: EnergyTariff = {
      id: newId,
      code: sanitized.code,
      name: sanitized.name,
      category: sanitized.category,
      pricePerUnit: sanitized.pricePerUnit,
      unit: sanitized.unit,
      validFrom: sanitized.validFrom,
      validTo: sanitized.validTo,
      isActive: sanitized.isActive,
      notes: sanitized.notes,
      sourceLabel: sanitized.sourceLabel,
      sourceUrl: sanitized.sourceUrl,
      updatedAt: nowIso,
      updatedBy: author,
    };

    this.inMemoryTariffs.unshift(newTariff);
    this.saveTariffsToFile();

    // Catat histori penambahan (KEL2-116)
    const historyEntry: EnergyTariffHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tariffId: newTariff.id,
      tariffCode: newTariff.code,
      tariffName: newTariff.name,
      category: newTariff.category,
      action: "CREATE",
      oldPrice: null,
      newPrice: newTariff.pricePerUnit,
      oldUnit: null,
      newUnit: newTariff.unit,
      oldValidFrom: null,
      newValidFrom: newTariff.validFrom,
      oldValidTo: null,
      newValidTo: newTariff.validTo,
      oldIsActive: null,
      newIsActive: newTariff.isActive,
      changedBy: author,
      reason: input.reason?.trim() || "Penambahan parameter harga energi baru",
      changedAt: nowIso,
    };

    this.inMemoryHistories.unshift(historyEntry);
    this.saveHistoriesToFile();

    return { ok: true, data: newTariff };
  }

  /**
   * Mengubah parameter harga energi yang sudah ada (Subtugas KEL2-90 & KEL2-116)
   */
  public updateTariff(
    id: string,
    input: EnergyTariffInput,
    author = "Superadmin",
  ): { ok: true; data: EnergyTariff } | { ok: false; error: string; errors?: Record<string, string> } {
    this.ensureInitialized();
    const existingIndex = this.inMemoryTariffs.findIndex((t) => t.id === id);
    if (existingIndex === -1) {
      return { ok: false, error: "Parameter energi tidak ditemukan" };
    }

    const existing = this.inMemoryTariffs[existingIndex];

    const validation = validateEnergyTariffInput(input, true);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, error: "Validasi pengubahan parameter gagal", errors: validation.errors };
    }

    const { sanitized } = validation;

    // Cek keunikan kode jika kode diubah
    if (sanitized.code !== existing.code) {
      const codeConflict = this.inMemoryTariffs.find(
        (t) => t.code === sanitized.code && t.id !== id,
      );
      if (codeConflict) {
        return {
          ok: false,
          error: `Kode '${sanitized.code}' sudah digunakan oleh parameter lain`,
          errors: { code: "Kode parameter harus unik" },
        };
      }
    }

    const nowIso = new Date().toISOString();

    // Deteksi jenis aksi untuk riwayat audit
    let actionType: TariffActionType = "UPDATE_ALL";
    const priceChanged = existing.pricePerUnit !== sanitized.pricePerUnit;
    const periodChanged =
      existing.validFrom !== sanitized.validFrom ||
      existing.validTo !== sanitized.validTo;
    const statusChanged = existing.isActive !== sanitized.isActive;

    if (priceChanged && !periodChanged && !statusChanged) {
      actionType = "UPDATE_PRICE";
    } else if (!priceChanged && periodChanged && !statusChanged) {
      actionType = "UPDATE_PERIOD";
    } else if (!priceChanged && !periodChanged && statusChanged) {
      actionType = "STATUS_CHANGE";
    }

    const updatedTariff: EnergyTariff = {
      ...existing,
      code: sanitized.code,
      name: sanitized.name,
      category: sanitized.category,
      pricePerUnit: sanitized.pricePerUnit,
      unit: sanitized.unit,
      validFrom: sanitized.validFrom,
      validTo: sanitized.validTo,
      isActive: sanitized.isActive,
      notes: sanitized.notes,
      sourceLabel: sanitized.sourceLabel,
      sourceUrl: sanitized.sourceUrl,
      updatedAt: nowIso,
      updatedBy: author,
    };

    this.inMemoryTariffs[existingIndex] = updatedTariff;
    this.saveTariffsToFile();

    // Catat ke log histori audit (KEL2-116)
    const historyEntry: EnergyTariffHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tariffId: updatedTariff.id,
      tariffCode: updatedTariff.code,
      tariffName: updatedTariff.name,
      category: updatedTariff.category,
      action: actionType,
      oldPrice: existing.pricePerUnit,
      newPrice: updatedTariff.pricePerUnit,
      oldUnit: existing.unit,
      newUnit: updatedTariff.unit,
      oldValidFrom: existing.validFrom,
      newValidFrom: updatedTariff.validFrom,
      oldValidTo: existing.validTo,
      newValidTo: updatedTariff.validTo,
      oldIsActive: existing.isActive,
      newIsActive: updatedTariff.isActive,
      changedBy: author,
      reason: sanitized.reason || "Pembaruan parameter oleh Superadmin",
      changedAt: nowIso,
    };

    this.inMemoryHistories.unshift(historyEntry);
    this.saveHistoriesToFile();

    return { ok: true, data: updatedTariff };
  }

  /**
   * Mengubah status aktif/nonaktif parameter (Subtugas KEL2-90 & KEL2-116)
   */
  public toggleTariffStatus(
    id: string,
    isActive: boolean,
    author = "Superadmin",
    reason?: string,
  ): { ok: true; data: EnergyTariff } | { ok: false; error: string } {
    this.ensureInitialized();
    const existing = this.inMemoryTariffs.find((t) => t.id === id);
    if (!existing) {
      return { ok: false, error: "Parameter energi tidak ditemukan" };
    }

    return this.updateTariff(
      id,
      {
        ...existing,
        isActive,
        reason:
          reason?.trim() ||
          (isActive
            ? "Pengaktifan kembali parameter energi"
            : "Penonaktifan parameter energi"),
      },
      author,
    );
  }

  /**
   * Mengambil riwayat perubahan tarif (Subtugas KEL2-116)
   */
  public getHistories(filters?: {
    tariffId?: string;
    category?: EnergyCategory;
    limit?: number;
  }): EnergyTariffHistory[] {
    this.ensureInitialized();
    let result = [...this.inMemoryHistories];

    if (filters?.tariffId) {
      result = result.filter((h) => h.tariffId === filters.tariffId);
    }

    if (filters?.category) {
      result = result.filter((h) => h.category === filters.category);
    }

    if (filters?.limit && filters.limit > 0) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  /**
   * Memperbarui beberapa nilai tarif sekaligus (PBI 9: Simpan Perubahan)
   */
  public updateMultiplePrices(
    updates: Array<{ id: string; pricePerUnit: number; reason?: string }>,
    author = "Superadmin",
  ): { ok: true; data: EnergyTariff[]; updatedAt: string } | { ok: false; error: string } {
    this.ensureInitialized();
    const nowIso = new Date().toISOString();
    const updatedList: EnergyTariff[] = [];

    // Validasi awal: pastikan semua nilai numerik valid
    for (const item of updates) {
      const existing = this.inMemoryTariffs.find((t) => t.id === item.id);
      if (!existing) continue;

      if (
        typeof item.pricePerUnit !== "number" ||
        isNaN(item.pricePerUnit) ||
        !Number.isFinite(item.pricePerUnit) ||
        item.pricePerUnit <= 0
      ) {
        return {
          ok: false,
          error: `Tarif untuk "${existing.name}" harus berupa angka positif lebih dari 0.`,
        };
      }
    }

    // Terapkan perubahan
    for (const item of updates) {
      const existing = this.inMemoryTariffs.find((t) => t.id === item.id);
      if (!existing) continue;

      if (existing.pricePerUnit === item.pricePerUnit) {
        continue;
      }

      const historyEntry: EnergyTariffHistory = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tariffId: existing.id,
        tariffCode: existing.code,
        tariffName: existing.name,
        category: existing.category,
        action: "UPDATE_PRICE",
        oldPrice: existing.pricePerUnit,
        newPrice: item.pricePerUnit,
        oldUnit: existing.unit,
        newUnit: existing.unit,
        oldValidFrom: existing.validFrom,
        newValidFrom: existing.validFrom,
        oldValidTo: existing.validTo,
        newValidTo: existing.validTo,
        oldIsActive: existing.isActive,
        newIsActive: existing.isActive,
        changedBy: author,
        reason: item.reason || "Pembaruan tarif dari halaman Manajemen Tarif Energi",
        changedAt: nowIso,
      };

      existing.pricePerUnit = item.pricePerUnit;
      existing.updatedAt = nowIso;
      existing.updatedBy = author;

      this.inMemoryHistories.unshift(historyEntry);
      updatedList.push({ ...existing });
    }

    if (updatedList.length > 0) {
      this.saveTariffsToFile();
      this.saveHistoriesToFile();
    }

    return { ok: true, data: this.getAllTariffs(), updatedAt: nowIso };
  }

  /**
   * Reset ke data awal (untuk kebutuhan pengujian/demo)
   */
  public resetToDefaultSeed(): void {
    this.inMemoryTariffs = [...DEFAULT_INITIAL_TARIFFS];
    this.inMemoryHistories = this.inMemoryTariffs.map((t) => ({
      id: `hist_reset_${t.id}`,
      tariffId: t.id,
      tariffCode: t.code,
      tariffName: t.name,
      category: t.category,
      action: "CREATE" as TariffActionType,
      oldPrice: null,
      newPrice: t.pricePerUnit,
      oldUnit: null,
      newUnit: t.unit,
      oldValidFrom: null,
      newValidFrom: t.validFrom,
      oldValidTo: null,
      newValidTo: t.validTo,
      oldIsActive: null,
      newIsActive: t.isActive,
      changedBy: "Sistem (Reset)",
      reason: "Reset ke parameter default regulasi resmi",
      changedAt: new Date().toISOString(),
    }));
    this.saveTariffsToFile();
    this.saveHistoriesToFile();
  }
}

// Singleton instance
export const energyTariffRepository = new EnergyTariffRepository();

