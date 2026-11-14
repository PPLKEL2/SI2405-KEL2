import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  EvFacility,
  EvFacilityInput,
  FacilityCategory,
  FacilityServiceTariff,
  FacilityServiceTariffInput,
  FacilityServiceType,
} from "../types/domain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const FACILITIES_FILE = path.join(DATA_DIR, "facilities.json");
const SERVICE_TARIFFS_FILE = path.join(DATA_DIR, "service-tariffs.json");

export const VALID_FACILITY_CATEGORIES: FacilityCategory[] = [
  "Showroom",
  "SPKLU",
  "SPBKLU",
];

export const DEFAULT_FACILITIES: EvFacility[] = [
  {
    id: 1,
    name: "SPKLU PLN UID Jakarta Raya Gambir",
    category: "SPKLU",
    city: "Jakarta",
    address: "Jl. M.I. Ridwan Rais No. 1, Gambir, Jakarta Pusat",
    latitude: -6.1783,
    longitude: 106.8317,
    operatingHours: "24 Jam",
    contact: "(021) 3455000",
    powerSpec: "DC Ultra Fast 200 kW · CCS2 & CHAdeMO · AC 22 kW",
    operator: "PLN",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "SPKLU Senayan City Mall",
    category: "SPKLU",
    city: "Jakarta",
    address: "Jl. Asia Afrika Lot 19, Tanah Abang, Jakarta Pusat",
    latitude: -6.2272,
    longitude: 106.7973,
    operatingHours: "10.00 - 22.00 WIB",
    contact: "(021) 72781000",
    powerSpec: "DC Fast 60 kW · AC Type 2 22 kW (4 Slot)",
    operator: "Starvo / Mitra Mall",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "SPBKLU Swap Poin Kuningan",
    category: "SPBKLU",
    city: "Jakarta",
    address: "Jl. HR Rasuna Said Kav. C-22, Setiabudi, Jakarta Selatan",
    latitude: -6.2185,
    longitude: 106.8325,
    operatingHours: "24 Jam",
    contact: "0811-8899-771",
    powerSpec: "Kabinet Swap 12 Slot Baterai 72V (Motor Listrik)",
    operator: "Swap Energi Indonesia",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 4,
    name: "Showroom Nusantara EV Hub Sudirman",
    category: "Showroom",
    city: "Jakarta",
    address: "Jl. Jenderal Sudirman Kav. 52-53, SCBD, Jakarta Selatan",
    latitude: -6.2244,
    longitude: 106.8097,
    operatingHours: "08.30 - 20.00 WIB",
    contact: "(021) 5150888",
    powerSpec: "Showroom Mobil & Motor Listrik · Test Drive · Bengkel Resmi",
    operator: "Nusantara EV Hub",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 5,
    name: "SPKLU PLN Braga Surapati Bandung",
    category: "SPKLU",
    city: "Bandung",
    address: "Jl. Soekarno Hatta No. 436, Regol, Kota Bandung",
    latitude: -6.9425,
    longitude: 107.6192,
    operatingHours: "24 Jam",
    contact: "(022) 5202424",
    powerSpec: "DC Fast 50 kW · CCS2 · AC Type 2 22 kW",
    operator: "PLN UID Jawa Barat",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 6,
    name: "SPBKLU Volta & Gesits Dago",
    category: "SPBKLU",
    city: "Bandung",
    address: "Jl. Ir. H. Juanda No. 112, Coblong, Kota Bandung",
    latitude: -6.8906,
    longitude: 107.6132,
    operatingHours: "06.00 - 23.00 WIB",
    contact: "0812-2334-4556",
    powerSpec: "Kabinet Swap 8 Slot Baterai Motor Listrik",
    operator: "Mitra Swap Jabar",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 7,
    name: "Showroom EV Center Asia Afrika Bandung",
    category: "Showroom",
    city: "Bandung",
    address: "Jl. Asia Afrika No. 129, Sumur Bandung, Kota Bandung",
    latitude: -6.9218,
    longitude: 107.6122,
    operatingHours: "09.00 - 18.00 WIB",
    contact: "(022) 4230999",
    powerSpec: "Dealer Resmi Motor & Mobil Listrik · Layanan Purnajual",
    operator: "Nusantara EV Hub",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 8,
    name: "SPKLU PLN Embong Wungu Surabaya",
    category: "SPKLU",
    city: "Surabaya",
    address: "Jl. Embong Trengguli No. 19-21, Genteng, Surabaya",
    latitude: -7.2665,
    longitude: 112.7448,
    operatingHours: "24 Jam",
    contact: "(031) 5340651",
    powerSpec: "DC Ultra Fast 100 kW · CCS2 · AC 22 kW",
    operator: "PLN UID Jawa Timur",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 9,
    name: "SPBKLU Gubeng Swap Station",
    category: "SPBKLU",
    city: "Surabaya",
    address: "Jl. Raya Gubeng No. 54, Gubeng, Surabaya",
    latitude: -7.2721,
    longitude: 112.7503,
    operatingHours: "24 Jam",
    contact: "0813-3000-8899",
    powerSpec: "Kabinet Swap 10 Slot Baterai Motor Listrik",
    operator: "Swap Energi Jatim",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const DEFAULT_SERVICE_TARIFFS: FacilityServiceTariff[] = [
  {
    id: 1,
    facilityId: 1,
    serviceType: "CHARGING",
    unit: "kWh",
    priceIdr: 2466,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    facilityId: 2,
    serviceType: "CHARGING",
    unit: "kWh",
    priceIdr: 2550,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    facilityId: 3,
    serviceType: "SWAP",
    unit: "transaksi",
    priceIdr: 15000,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 4,
    facilityId: 5,
    serviceType: "CHARGING",
    unit: "kWh",
    priceIdr: 2466,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 5,
    facilityId: 6,
    serviceType: "SWAP",
    unit: "transaksi",
    priceIdr: 14000,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 6,
    facilityId: 8,
    serviceType: "CHARGING",
    unit: "kWh",
    priceIdr: 2466,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 7,
    facilityId: 9,
    serviceType: "SWAP",
    unit: "transaksi",
    priceIdr: 14500,
    validFrom: "2024-01-01",
    validUntil: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function validateFacilityInput(input: Partial<EvFacilityInput>): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: Omit<EvFacility, "id" | "createdAt" | "updatedAt">;
} {
  const errors: Record<string, string> = {};

  const name = String(input.name ?? "").trim();
  const category = String(input.category ?? "").trim() as FacilityCategory;
  const city = String(input.city ?? "").trim() || "Jakarta";
  const address = String(input.address ?? "").trim();
  const operatingHours = String(input.operatingHours ?? "").trim();
  const contact = String(input.contact ?? "").trim();

  if (!name) errors.name = "Nama fasilitas wajib diisi.";
  if (!VALID_FACILITY_CATEGORIES.includes(category)) {
    errors.category = "Kategori fasilitas harus Showroom, SPKLU, atau SPBKLU.";
  }
  if (!address) errors.address = "Alamat fasilitas wajib diisi.";
  if (!operatingHours) errors.operatingHours = "Jam operasional wajib diisi.";
  if (!contact) errors.contact = "Kontak fasilitas wajib diisi.";

  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);

  if (
    input.latitude === undefined ||
    input.latitude === "" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    errors.latitude = "Latitude harus berupa angka antara -90 s.d. 90.";
  }

  if (
    input.longitude === undefined ||
    input.longitude === "" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    errors.longitude = "Longitude harus berupa angka antara -180 s.d. 180.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      name,
      category,
      city,
      address,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      operatingHours,
      contact,
      powerSpec:
        String(input.powerSpec ?? "").trim() ||
        (category === "SPKLU"
          ? "DC Fast 50 kW · AC Type 2 22 kW"
          : category === "SPBKLU"
          ? "Kabinet Swap Baterai 8 Slot"
          : "Showroom & Layanan Konsultasi EV"),
      operator: String(input.operator ?? "").trim() || "Mitra MobilitiQ",
      active: input.active !== undefined ? Boolean(input.active) : true,
    },
  };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isPeriodOverlapping(
  startA: string,
  endA: string | null,
  startB: string,
  endB: string | null
): boolean {
  const maxEndA = endA ?? "9999-12-31";
  const maxEndB = endB ?? "9999-12-31";
  return startA <= maxEndB && startB <= maxEndA;
}

class FacilityRepository {
  private facilities: EvFacility[] = [];
  private serviceTariffs: FacilityServiceTariff[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(FACILITIES_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(FACILITIES_FILE, "utf-8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.facilities = parsed;
        }
      } catch {
        // fallback
      }
    }
    if (this.facilities.length === 0) {
      this.facilities = [...DEFAULT_FACILITIES];
      this.saveFacilities();
    }

    if (fs.existsSync(SERVICE_TARIFFS_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(SERVICE_TARIFFS_FILE, "utf-8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.serviceTariffs = parsed;
        }
      } catch {
        // fallback
      }
    }
    if (this.serviceTariffs.length === 0) {
      this.serviceTariffs = [...DEFAULT_SERVICE_TARIFFS];
      this.saveServiceTariffs();
    }

    this.initialized = true;
  }

  private saveFacilities(): void {
    fs.writeFileSync(FACILITIES_FILE, JSON.stringify(this.facilities, null, 2), "utf-8");
  }

  private saveServiceTariffs(): void {
    fs.writeFileSync(
      SERVICE_TARIFFS_FILE,
      JSON.stringify(this.serviceTariffs, null, 2),
      "utf-8"
    );
  }

  public listFacilities(filters: {
    category?: string;
    city?: string;
    q?: string;
    activeOnly?: boolean;
  } = {}): (EvFacility & { activeTariff?: FacilityServiceTariff | null })[] {
    this.ensureInitialized();
    const today = new Date().toISOString().slice(0, 10);

    return this.facilities
      .filter((f) => {
        if (filters.activeOnly && !f.active) return false;
        if (
          filters.category &&
          filters.category !== "Semua" &&
          f.category.toLowerCase() !== filters.category.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.city &&
          filters.city !== "Semua" &&
          f.city.toLowerCase() !== filters.city.toLowerCase()
        ) {
          return false;
        }
        if (filters.q && filters.q.trim() !== "") {
          const kw = filters.q.trim().toLowerCase();
          const haystack = `${f.name} ${f.address} ${f.city} ${f.operator}`.toLowerCase();
          if (!haystack.includes(kw)) return false;
        }
        return true;
      })
      .map((f) => {
        const serviceType: FacilityServiceType | null =
          f.category === "SPKLU"
            ? "CHARGING"
            : f.category === "SPBKLU"
            ? "SWAP"
            : null;
        const activeTariff = serviceType
          ? this.getActiveServiceTariff(f.id, serviceType, today)
          : null;
        return {
          ...f,
          activeTariff,
        };
      });
  }

  public getFacilityById(id: number): EvFacility | undefined {
    this.ensureInitialized();
    return this.facilities.find((f) => f.id === id);
  }

  public createFacility(input: EvFacilityInput): {
    ok: boolean;
    data?: EvFacility;
    errors?: Record<string, string>;
  } {
    this.ensureInitialized();
    const validation = validateFacilityInput(input);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const nextId =
      this.facilities.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const now = new Date().toISOString();
    const created: EvFacility = {
      id: nextId,
      ...validation.sanitized,
      createdAt: now,
      updatedAt: now,
    };

    this.facilities.push(created);
    this.saveFacilities();
    return { ok: true, data: created };
  }

  public updateFacility(
    id: number,
    input: Partial<EvFacilityInput>
  ): {
    ok: boolean;
    data?: EvFacility;
    errors?: Record<string, string>;
    notFound?: boolean;
  } {
    this.ensureInitialized();
    const idx = this.facilities.findIndex((f) => f.id === id);
    if (idx === -1) return { ok: false, notFound: true };

    const current = this.facilities[idx];
    const merged: EvFacilityInput = {
      name: input.name ?? current.name,
      category: (input.category as FacilityCategory) ?? current.category,
      city: input.city ?? current.city,
      address: input.address ?? current.address,
      latitude: input.latitude ?? current.latitude,
      longitude: input.longitude ?? current.longitude,
      operatingHours: input.operatingHours ?? current.operatingHours,
      contact: input.contact ?? current.contact,
      powerSpec: input.powerSpec ?? current.powerSpec,
      operator: input.operator ?? current.operator,
      active: input.active !== undefined ? Boolean(input.active) : current.active,
    };

    const validation = validateFacilityInput(merged);
    if (!validation.valid || !validation.sanitized) {
      return { ok: false, errors: validation.errors };
    }

    const updated: EvFacility = {
      ...current,
      ...validation.sanitized,
      updatedAt: new Date().toISOString(),
    };

    this.facilities[idx] = updated;
    this.saveFacilities();
    return { ok: true, data: updated };
  }

  public setFacilityActiveStatus(id: number, active: boolean): EvFacility | null {
    this.ensureInitialized();
    const idx = this.facilities.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.facilities[idx] = {
      ...this.facilities[idx],
      active,
      updatedAt: new Date().toISOString(),
    };
    this.saveFacilities();
    return this.facilities[idx];
  }

  // PBI 06: Manajemen Harga Layanan Fasilitas EV
  public listServiceTariffs(filters: {
    facilityId?: number;
    serviceType?: string;
  } = {}): (FacilityServiceTariff & { facilityName?: string; facilityCategory?: string })[] {
    this.ensureInitialized();
    return this.serviceTariffs
      .filter((t) => {
        if (filters.facilityId !== undefined && t.facilityId !== filters.facilityId) {
          return false;
        }
        if (
          filters.serviceType &&
          filters.serviceType !== "Semua" &&
          t.serviceType !== filters.serviceType
        ) {
          return false;
        }
        return true;
      })
      .map((t) => {
        const fac = this.getFacilityById(t.facilityId);
        return {
          ...t,
          facilityName: fac?.name,
          facilityCategory: fac?.category,
        };
      });
  }

  public getActiveServiceTariff(
    facilityId: number,
    serviceType: FacilityServiceType,
    dateStr: string = new Date().toISOString().slice(0, 10)
  ): FacilityServiceTariff | null {
    this.ensureInitialized();
    const candidates = this.serviceTariffs.filter(
      (t) =>
        t.facilityId === facilityId &&
        t.serviceType === serviceType &&
        t.validFrom <= dateStr &&
        (t.validUntil === null || t.validUntil >= dateStr)
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0];
  }

  public validateAndSaveServiceTariff(
    input: FacilityServiceTariffInput,
    editingId?: number
  ): {
    ok: boolean;
    data?: FacilityServiceTariff;
    errors?: Record<string, string>;
    conflict?: boolean;
    notFound?: boolean;
  } {
    this.ensureInitialized();
    const errors: Record<string, string> = {};

    const facilityId = Number(input.facilityId);
    const facility = Number.isInteger(facilityId)
      ? this.getFacilityById(facilityId)
      : undefined;

    if (!facility) {
      errors.facilityId = "Fasilitas tujuan wajib dipilih dan terdaftar.";
    }

    const serviceType = String(input.serviceType ?? "").trim() as FacilityServiceType;
    if (serviceType !== "CHARGING" && serviceType !== "SWAP") {
      errors.serviceType = "Jenis layanan harus CHARGING atau SWAP.";
    } else if (facility) {
      if (serviceType === "CHARGING" && facility.category !== "SPKLU") {
        errors.serviceType = "Layanan CHARGING hanya berlaku untuk fasilitas kategori SPKLU.";
      }
      if (serviceType === "SWAP" && facility.category !== "SPBKLU") {
        errors.serviceType = "Layanan SWAP hanya berlaku untuk fasilitas kategori SPBKLU.";
      }
    }

    const unit = serviceType === "CHARGING" ? "kWh" : "transaksi";
    if (input.unit && input.unit !== unit) {
      errors.unit = `Satuan untuk ${serviceType} harus berupa ${unit}.`;
    }

    const priceIdr = Number(input.priceIdr);
    if (!Number.isFinite(priceIdr) || priceIdr <= 0) {
      errors.priceIdr = "Nilai tarif layanan harus berupa angka positif (> 0).";
    }

    const validFrom = String(input.validFrom ?? "").trim();
    if (!ISO_DATE_RE.test(validFrom)) {
      errors.validFrom = "Tanggal mulai berlaku wajib menggunakan format YYYY-MM-DD.";
    }

    const rawUntil = input.validUntil ? String(input.validUntil).trim() : "";
    const validUntil = rawUntil === "" ? null : rawUntil;
    if (validUntil !== null) {
      if (!ISO_DATE_RE.test(validUntil)) {
        errors.validUntil = "Tanggal berakhir wajib menggunakan format YYYY-MM-DD.";
      } else if (ISO_DATE_RE.test(validFrom) && validUntil < validFrom) {
        errors.validUntil = "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    // Cek konflik periode untuk fasilitas + jenis layanan yang sama
    const overlapping = this.serviceTariffs.find(
      (existing) =>
        existing.id !== editingId &&
        existing.facilityId === facilityId &&
        existing.serviceType === serviceType &&
        isPeriodOverlapping(
          validFrom,
          validUntil,
          existing.validFrom,
          existing.validUntil
        )
    );

    if (overlapping) {
      return {
        ok: false,
        conflict: true,
        errors: {
          validFrom: `Periode bertabrakan dengan tarif yang sudah ada (${overlapping.validFrom} s/d ${overlapping.validUntil ?? "seterusnya"}).`,
        },
      };
    }

    const now = new Date().toISOString();

    if (editingId !== undefined) {
      const idx = this.serviceTariffs.findIndex((t) => t.id === editingId);
      if (idx === -1) return { ok: false, notFound: true };
      const updated: FacilityServiceTariff = {
        id: editingId,
        facilityId,
        serviceType,
        unit,
        priceIdr: Math.round(priceIdr),
        validFrom,
        validUntil,
        updatedAt: now,
      };
      this.serviceTariffs[idx] = updated;
      this.saveServiceTariffs();
      return { ok: true, data: updated };
    }

    const nextId =
      this.serviceTariffs.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const created: FacilityServiceTariff = {
      id: nextId,
      facilityId,
      serviceType,
      unit,
      priceIdr: Math.round(priceIdr),
      validFrom,
      validUntil,
      updatedAt: now,
    };

    this.serviceTariffs.push(created);
    this.saveServiceTariffs();
    return { ok: true, data: created };
  }

  public resetToDefaultSeed(): void {
    this.facilities = [...DEFAULT_FACILITIES];
    this.serviceTariffs = [...DEFAULT_SERVICE_TARIFFS];
    this.initialized = true;
    this.saveFacilities();
    this.saveServiceTariffs();
  }
}

export const facilityRepository = new FacilityRepository();

