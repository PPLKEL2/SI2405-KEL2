import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EvModel, EvModelInput, VehicleCategory } from "../types/domain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const EV_MODELS_FILE = path.join(DATA_DIR, "ev-models.json");

export const DEFAULT_EV_MODELS: EvModel[] = [
  {
    id: "ev-polytron-fox-r",
    brand: "Polytron",
    modelName: "Fox-R",
    category: "Motor",
    otrPriceIdr: 20500000,
    batteryKwh: 3.74,
    consumptionKwh100km: 2.9,
    wltpRangeKm: 130,
    motorPowerKw: 3.0,
    chargerType: "AC Portable 800W / Fast Charging",
    acChargerKw: 0.8,
    dcChargerKw: 1.5,
    warrantyLabel: "Garansi seumur hidup (sewa baterai)",
    promoLabel: "Subsidi Rp 7 Jt",
    serviceCostPerKmIdr: 35,
    comparableIceName: "Honda Vario 125",
    comparableIcePriceIdr: 24500000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-alva-one",
    brand: "Alva",
    modelName: "One XP",
    category: "Motor",
    otrPriceIdr: 38500000,
    batteryKwh: 2.7,
    consumptionKwh100km: 3.1,
    wltpRangeKm: 90,
    motorPowerKw: 4.0,
    chargerType: "AC Home Charger 840W",
    acChargerKw: 0.84,
    dcChargerKw: 1.2,
    warrantyLabel: "3 Tahun / 25.000 km",
    promoLabel: "Gratis Home Charger",
    serviceCostPerKmIdr: 40,
    comparableIceName: "Yamaha NMAX 155",
    comparableIcePriceIdr: 32500000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-gesits-g1",
    brand: "Gesits",
    modelName: "G1 DLX",
    category: "Motor",
    otrPriceIdr: 28970000,
    batteryKwh: 2.88,
    consumptionKwh100km: 3.0,
    wltpRangeKm: 100,
    motorPowerKw: 5.0,
    chargerType: "Swap Baterai SPBKLU / AC 450W",
    acChargerKw: 0.45,
    dcChargerKw: 0,
    warrantyLabel: "3 Tahun Baterai",
    promoLabel: "Siap Swap SPBKLU",
    serviceCostPerKmIdr: 35,
    comparableIceName: "Honda Vario 125",
    comparableIcePriceIdr: 24500000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-united-t1800",
    brand: "United",
    modelName: "T1800",
    category: "Motor",
    otrPriceIdr: 30500000,
    batteryKwh: 1.68,
    consumptionKwh100km: 2.6,
    wltpRangeKm: 65,
    motorPowerKw: 1.8,
    chargerType: "AC Portable 450W",
    acChargerKw: 0.45,
    dcChargerKw: 0,
    warrantyLabel: "3 Tahun Baterai Lithium",
    serviceCostPerKmIdr: 30,
    comparableIceName: "Honda BeAT 110",
    comparableIcePriceIdr: 19500000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-wuling-air-ev",
    brand: "Wuling",
    modelName: "Air ev Long Range",
    category: "Mobil",
    otrPriceIdr: 275000000,
    batteryKwh: 26.7,
    consumptionKwh100km: 9.2,
    wltpRangeKm: 300,
    motorPowerKw: 30.0,
    chargerType: "AC Type 2 (6.6 kW)",
    acChargerKw: 6.6,
    dcChargerKw: 0,
    warrantyLabel: "Seumur Hidup Komponen Inti EV",
    promoLabel: "PPN DTP 1%",
    serviceCostPerKmIdr: 120,
    comparableIceName: "Honda Brio Satya 1.2",
    comparableIcePriceIdr: 198000000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-wuling-binguo",
    brand: "Wuling",
    modelName: "BinguoEV 410 km",
    category: "Mobil",
    otrPriceIdr: 372000000,
    batteryKwh: 37.9,
    consumptionKwh100km: 11.4,
    wltpRangeKm: 410,
    motorPowerKw: 50.0,
    chargerType: "AC 7 kW / DC Fast Charging",
    acChargerKw: 7.0,
    dcChargerKw: 50.0,
    warrantyLabel: "Seumur Hidup Komponen Inti EV",
    promoLabel: "Gratis Wallbox 7 kW",
    serviceCostPerKmIdr: 135,
    comparableIceName: "Toyota Avanza 1.5 G",
    comparableIcePriceIdr: 276000000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-byd-atto-3",
    brand: "BYD",
    modelName: "Atto 3 Extended Range",
    category: "Mobil",
    otrPriceIdr: 515000000,
    batteryKwh: 60.48,
    consumptionKwh100km: 14.9,
    wltpRangeKm: 480,
    motorPowerKw: 150.0,
    chargerType: "AC Type 2 (7 kW) / DC CCS2 (88 kW)",
    acChargerKw: 7.0,
    dcChargerKw: 88.0,
    warrantyLabel: "8 Tahun / 160.000 km Blade Battery",
    promoLabel: "Bebas Ganjil Genap",
    serviceCostPerKmIdr: 155,
    comparableIceName: "Toyota Kijang Innova 2.0",
    comparableIcePriceIdr: 430000000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ev-hyundai-ioniq-5",
    brand: "Hyundai",
    modelName: "Ioniq 5 Long Range",
    category: "Mobil",
    otrPriceIdr: 785000000,
    batteryKwh: 72.6,
    consumptionKwh100km: 15.8,
    wltpRangeKm: 481,
    motorPowerKw: 160.0,
    chargerType: "AC Type 2 (11 kW) / Ultra Fast DC (220 kW)",
    acChargerKw: 11.0,
    dcChargerKw: 220.0,
    warrantyLabel: "8 Tahun / 160.000 km",
    promoLabel: "PPN DTP 1%",
    serviceCostPerKmIdr: 175,
    comparableIceName: "Toyota Kijang Innova 2.0",
    comparableIcePriceIdr: 430000000,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export interface EvModelValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: Omit<EvModel, "id" | "createdAt" | "updatedAt">;
}

export function validateEvModelInput(input: Partial<EvModelInput>): EvModelValidationResult {
  const errors: Record<string, string> = {};

  const brand = String(input.brand ?? "").trim();
  const modelName = String(input.modelName ?? "").trim();
  const category = String(input.category ?? "").trim() as VehicleCategory;
  const chargerType = String(input.chargerType ?? "").trim();

  if (!brand) errors.brand = "Merek kendaraan wajib diisi.";
  if (!modelName) errors.modelName = "Nama/model kendaraan wajib diisi.";
  if (category !== "Motor" && category !== "Mobil") {
    errors.category = "Kategori kendaraan wajib dipilih antara Motor atau Mobil.";
  }
  if (!chargerType) errors.chargerType = "Tipe charger wajib diisi.";

  const otrPriceIdr = Number(input.otrPriceIdr);
  if (!Number.isFinite(otrPriceIdr) || otrPriceIdr < 1000000) {
    errors.otrPriceIdr = "Harga OTR wajib berupa angka minimal Rp 1.000.000.";
  }

  const batteryKwh = Number(input.batteryKwh);
  if (!Number.isFinite(batteryKwh) || batteryKwh <= 0 || batteryKwh > 300) {
    errors.batteryKwh = "Kapasitas baterai wajib berupa angka antara 0,1 s.d. 300 kWh.";
  }

  const consumptionKwh100km = Number(input.consumptionKwh100km);
  if (
    !Number.isFinite(consumptionKwh100km) ||
    consumptionKwh100km <= 0 ||
    consumptionKwh100km > 100
  ) {
    errors.consumptionKwh100km =
      "Konsumsi energi wajib berupa angka antara 0,1 s.d. 100 kWh/100km.";
  }

  const wltpRangeKm = Number(input.wltpRangeKm);
  if (!Number.isFinite(wltpRangeKm) || wltpRangeKm <= 0 || wltpRangeKm > 2000) {
    errors.wltpRangeKm = "Estimasi jarak tempuh wajib berupa angka antara 1 s.d. 2.000 km.";
  }

  const motorPowerKw = Number(input.motorPowerKw);
  if (!Number.isFinite(motorPowerKw) || motorPowerKw <= 0 || motorPowerKw > 1500) {
    errors.motorPowerKw = "Daya motor wajib berupa angka lebih besar dari 0 kW.";
  }

  const acChargerKw = input.acChargerKw !== undefined && input.acChargerKw !== ""
    ? Number(input.acChargerKw)
    : category === "Mobil" ? 7.0 : 0.8;
  if (!Number.isFinite(acChargerKw) || acChargerKw < 0) {
    errors.acChargerKw = "Daya AC charger tidak boleh negatif.";
  }

  const dcChargerKw = input.dcChargerKw !== undefined && input.dcChargerKw !== ""
    ? Number(input.dcChargerKw)
    : 0;
  if (!Number.isFinite(dcChargerKw) || dcChargerKw < 0) {
    errors.dcChargerKw = "Daya DC charger tidak boleh negatif.";
  }

  const serviceCostPerKmIdr =
    input.serviceCostPerKmIdr !== undefined && input.serviceCostPerKmIdr !== ""
      ? Number(input.serviceCostPerKmIdr)
      : category === "Mobil"
      ? 140
      : 35;

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      brand,
      modelName,
      category,
      otrPriceIdr: Math.round(otrPriceIdr),
      batteryKwh: Number(batteryKwh.toFixed(2)),
      consumptionKwh100km: Number(consumptionKwh100km.toFixed(2)),
      wltpRangeKm: Math.round(wltpRangeKm),
      motorPowerKw: Number(motorPowerKw.toFixed(2)),
      chargerType,
      acChargerKw: Number(acChargerKw.toFixed(2)),
      dcChargerKw: Number(dcChargerKw.toFixed(2)),
      warrantyLabel: String(input.warrantyLabel ?? "Garansi Pabrikan 3 Tahun").trim(),
      promoLabel: input.promoLabel ? String(input.promoLabel).trim() : undefined,
      serviceCostPerKmIdr: Math.max(0, Math.round(serviceCostPerKmIdr)),
      comparableIceName: input.comparableIceName ? String(input.comparableIceName).trim() : undefined,
      comparableIcePriceIdr: input.comparableIcePriceIdr
        ? Math.round(Number(input.comparableIcePriceIdr))
        : undefined,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
    },
  };
}

export interface EvModelFilterOptions {
  q?: string;
  category?: string;
  maxPrice?: number;
  minBattery?: number;
  minRange?: number;
  activeOnly?: boolean;
}

class EvModelRepository {
  private models: EvModel[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(EV_MODELS_FILE)) {
      try {
        const raw = fs.readFileSync(EV_MODELS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.models = parsed;
          this.initialized = true;
          return;
        }
      } catch {
        // Fallback ke default seed
      }
    }
    this.models = [...DEFAULT_EV_MODELS];
    this.saveToFile();
    this.initialized = true;
  }

  private saveToFile(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(EV_MODELS_FILE, JSON.stringify(this.models, null, 2), "utf-8");
  }

  public list(filters: EvModelFilterOptions = {}): EvModel[] {
    this.ensureInitialized();
    return this.models.filter((item) => {
      if (filters.activeOnly && !item.isActive) return false;
      if (
        filters.category &&
        filters.category !== "Semua" &&
        item.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
        return false;
      }
      if (filters.q && filters.q.trim() !== "") {
        const kw = filters.q.trim().toLowerCase();
        const combined = `${item.brand} ${item.modelName} ${item.chargerType}`.toLowerCase();
        if (!combined.includes(kw)) return false;
      }
      if (
        filters.maxPrice !== undefined &&
        Number.isFinite(filters.maxPrice) &&
        filters.maxPrice > 0 &&
        item.otrPriceIdr > filters.maxPrice
      ) {
        return false;
      }
      if (
        filters.minBattery !== undefined &&
        Number.isFinite(filters.minBattery) &&
        filters.minBattery > 0 &&
        item.batteryKwh < filters.minBattery
      ) {
        return false;
      }
      if (
        filters.minRange !== undefined &&
        Number.isFinite(filters.minRange) &&
        filters.minRange > 0 &&
        item.wltpRangeKm < filters.minRange
      ) {
        return false;
      }
      return true;
    });
  }

  public getById(id: string): EvModel | undefined {
    this.ensureInitialized();
    return this.models.find((m) => m.id === id);
  }

  public create(input: EvModelInput): {
    ok: boolean;
    data?: EvModel;
    errors?: Record<string, string>;
  } {
    this.ensureInitialized();
    const validation = validateEvModelInput(input);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const slug = `${validation.sanitized.brand}-${validation.sanitized.modelName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const id = `ev-${slug}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const created: EvModel = {
      id,
      ...validation.sanitized,
      createdAt: now,
      updatedAt: now,
    };

    this.models.unshift(created);
    this.saveToFile();
    return { ok: true, data: created };
  }

  public update(
    id: string,
    input: Partial<EvModelInput>
  ): {
    ok: boolean;
    data?: EvModel;
    errors?: Record<string, string>;
    notFound?: boolean;
  } {
    this.ensureInitialized();
    const idx = this.models.findIndex((m) => m.id === id);
    if (idx === -1) return { ok: false, notFound: true };

    const current = this.models[idx];
    const merged: EvModelInput = {
      brand: input.brand ?? current.brand,
      modelName: input.modelName ?? current.modelName,
      category: (input.category as VehicleCategory) ?? current.category,
      otrPriceIdr: input.otrPriceIdr ?? current.otrPriceIdr,
      batteryKwh: input.batteryKwh ?? current.batteryKwh,
      consumptionKwh100km: input.consumptionKwh100km ?? current.consumptionKwh100km,
      wltpRangeKm: input.wltpRangeKm ?? current.wltpRangeKm,
      motorPowerKw: input.motorPowerKw ?? current.motorPowerKw,
      chargerType: input.chargerType ?? current.chargerType,
      acChargerKw: input.acChargerKw ?? current.acChargerKw,
      dcChargerKw: input.dcChargerKw ?? current.dcChargerKw,
      warrantyLabel: input.warrantyLabel ?? current.warrantyLabel,
      promoLabel: input.promoLabel !== undefined ? input.promoLabel : current.promoLabel,
      serviceCostPerKmIdr: input.serviceCostPerKmIdr ?? current.serviceCostPerKmIdr,
      comparableIceName: input.comparableIceName ?? current.comparableIceName,
      comparableIcePriceIdr: input.comparableIcePriceIdr ?? current.comparableIcePriceIdr,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : current.isActive,
    };

    const validation = validateEvModelInput(merged);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const updated: EvModel = {
      ...current,
      ...validation.sanitized,
      updatedAt: new Date().toISOString(),
    };

    this.models[idx] = updated;
    this.saveToFile();
    return { ok: true, data: updated };
  }

  public setActiveStatus(id: string, isActive: boolean): EvModel | null {
    this.ensureInitialized();
    const idx = this.models.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.models[idx] = {
      ...this.models[idx],
      isActive,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.models[idx];
  }

  public delete(id: string): boolean {
    this.ensureInitialized();
    const lenBefore = this.models.length;
    this.models = this.models.filter((m) => m.id !== id);
    if (this.models.length === lenBefore) return false;
    this.saveToFile();
    return true;
  }

  public resetToDefaultSeed(): void {
    this.models = [...DEFAULT_EV_MODELS];
    this.initialized = true;
    this.saveToFile();
  }
}

export const evModelRepository = new EvModelRepository();

