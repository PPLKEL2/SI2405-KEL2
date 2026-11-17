import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const VEHICLE_TYPES = ["Motor", "Mobil"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export interface Vehicle {
  id: string;
  model: string;
  type: VehicleType;
  /** Kapasitas baterai (kWh) */
  batteryKwh: number;
  /** Harga On The Road (Rupiah) */
  priceOtr: number;
  /** Daya charger AC (kW) */
  acChargerKw: number;
  /** Promo dealer; string kosong = tidak ada promo */
  promo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VehicleInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;

/** Batas wajar spesifikasi kendaraan (dipakai validasi backend & frontend). */
export const VEHICLE_LIMITS = {
  batteryKwh: { min: 0.1, max: 500 },
  priceOtr: { min: 1_000_000, max: 5_000_000_000 },
  acChargerKw: { min: 0.1, max: 350 },
} as const;

function seedVehicles(): Vehicle[] {
  const ts = new Date().toISOString();
  const make = (
    n: number,
    model: string,
    type: VehicleType,
    batteryKwh: number,
    priceOtr: number,
    acChargerKw: number,
    promo: string
  ): Vehicle => ({
    id: `veh-${String(n).padStart(3, "0")}`,
    model,
    type,
    batteryKwh,
    priceOtr,
    acChargerKw,
    promo,
    isActive: true,
    createdAt: ts,
    updatedAt: ts,
  });

  return [
    make(1, "Polytron Fox-R", "Motor", 2.4, 23_900_000, 0.4, "Gratis wallbox"),
    make(2, "Gesits G1", "Motor", 1.8, 29_900_000, 0.4, ""),
    make(3, "United T1800", "Motor", 3.0, 33_500_000, 0.6, "Cashback Rp 2 jt"),
    make(4, "Honda EM1e:", "Motor", 1.5, 40_000_000, 0.3, ""),
    make(5, "Alva One", "Motor", 3.4, 36_800_000, 0.7, "Bunga 0% 12 bln"),
    make(6, "BYD Seagull", "Mobil", 38.9, 150_000_000, 7.0, "DP mulai 10%"),
    make(7, "Wuling Air ev Long Range", "Mobil", 41.3, 238_000_000, 6.6, ""),
  ];
}

// ---------- Penyimpanan: in-memory + disimpan ke file JSON (dinonaktifkan saat NODE_ENV=test) ----------
const dataFile = () =>
  process.env.VEHICLES_DATA_FILE || path.join(process.cwd(), "data", "vehicles.json");
const shouldPersist = () => process.env.NODE_ENV !== "test";

function loadInitial(): Vehicle[] {
  try {
    if (shouldPersist() && fs.existsSync(dataFile())) {
      return JSON.parse(fs.readFileSync(dataFile(), "utf8")) as Vehicle[];
    }
  } catch {
    // File rusak -> mulai ulang dari data awal
  }
  return seedVehicles();
}

let store: Vehicle[] = loadInitial();

function save(): void {
  if (!shouldPersist()) return;
  fs.mkdirSync(path.dirname(dataFile()), { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify(store, null, 2));
}

/** Mengembalikan katalog ke data awal (dipakai oleh pengujian). */
export function resetVehicles(): void {
  store = seedVehicles();
}

export function listVehicles(): Vehicle[] {
  return [...store];
}

/** Hanya unit aktif: inilah referensi yang boleh dipakai pengguna pada simulasi. */
export function listActiveVehicles(): Vehicle[] {
  return store.filter((v) => v.isActive);
}

export function getVehicle(id: string): Vehicle | undefined {
  return store.find((v) => v.id === id);
}

export function findDuplicateModel(model: string, exceptId?: string): Vehicle | undefined {
  const key = model.trim().toLowerCase();
  return store.find((v) => v.id !== exceptId && v.model.trim().toLowerCase() === key);
}

export function createVehicle(input: VehicleInput): Vehicle {
  const ts = new Date().toISOString();
  const vehicle: Vehicle = { ...input, id: randomUUID(), createdAt: ts, updatedAt: ts };
  store.push(vehicle);
  save();
  return vehicle;
}

export function updateVehicle(id: string, patch: Partial<VehicleInput>): Vehicle | undefined {
  const index = store.findIndex((v) => v.id === id);
  if (index < 0) return undefined;
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<VehicleInput>;
  const updated: Vehicle = { ...store[index], ...clean, updatedAt: new Date().toISOString() };
  store[index] = updated;
  save();
  return updated;
}

export function setVehicleActive(id: string, isActive: boolean): Vehicle | undefined {
  return updateVehicle(id, { isActive });
}

export function deleteVehicle(id: string): boolean {
  const before = store.length;
  store = store.filter((v) => v.id !== id);
  if (store.length === before) return false;
  save();
  return true;
}
