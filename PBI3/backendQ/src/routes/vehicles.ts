import { Router, type Request, type Response } from "express";
import { z, ZodError } from "zod";
import {
  VEHICLE_LIMITS,
  VEHICLE_TYPES,
  createVehicle,
  deleteVehicle,
  findDuplicateModel,
  getVehicle,
  listActiveVehicles,
  listVehicles,
  setVehicleActive,
  updateVehicle,
} from "../data/vehicles.js";

export const vehiclesRouter = Router();

const now = () => new Date().toISOString();
const fmt = (n: number) => n.toLocaleString("id-ID");

// ---------- Skema validasi spesifikasi kendaraan (PBI3) ----------
const numberField = (label: string, unit: string, min: number, max: number) => {
  const show = (n: number) => (unit === "Rp" ? `Rp ${fmt(n)}` : `${fmt(n)} ${unit}`);
  return z
    .number({
      required_error: `${label} wajib diisi.`,
      invalid_type_error: `${label} harus berupa angka.`,
    })
    .finite(`${label} harus berupa angka.`)
    .min(min, `${label} minimal ${show(min)}.`)
    .max(max, `${label} maksimal ${show(max)}.`);
};

const vehicleSchema = z.object({
  model: z
    .string({ required_error: "Model wajib diisi.", invalid_type_error: "Model harus berupa teks." })
    .trim()
    .min(1, "Model wajib diisi.")
    .max(80, "Model maksimal 80 karakter."),
  type: z.enum(VEHICLE_TYPES, { errorMap: () => ({ message: "Tipe harus Motor atau Mobil." }) }),
  batteryKwh: numberField("Baterai", "kWh", VEHICLE_LIMITS.batteryKwh.min, VEHICLE_LIMITS.batteryKwh.max),
  priceOtr: numberField("Harga OTR", "Rp", VEHICLE_LIMITS.priceOtr.min, VEHICLE_LIMITS.priceOtr.max),
  acChargerKw: numberField("Charger AC", "kW", VEHICLE_LIMITS.acChargerKw.min, VEHICLE_LIMITS.acChargerKw.max),
  promo: z
    .string({ invalid_type_error: "Promo harus berupa teks." })
    .trim()
    .max(100, "Promo maksimal 100 karakter.")
    .default(""),
  isActive: z.boolean({ invalid_type_error: "Status tidak valid." }).default(true),
});

const vehicleUpdateSchema = vehicleSchema.partial();
const statusSchema = z.object({
  isActive: z.boolean({
    required_error: "Status wajib diisi.",
    invalid_type_error: "Status tidak valid.",
  }),
});

// ---------- Helper respons ----------
function toFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

function sendValidationError(res: Response, err: ZodError): void {
  res.status(400).json({
    success: false,
    error: "Data kendaraan tidak valid.",
    errors: toFieldErrors(err),
  });
}

function sendNotFound(res: Response): void {
  res.status(404).json({ success: false, error: "Unit kendaraan tidak ditemukan." });
}

function sendDuplicate(res: Response): void {
  res.status(409).json({
    success: false,
    error: "Model sudah ada di katalog.",
    errors: { model: "Model sudah ada di katalog." },
  });
}

// ---------- API Publik: referensi kendaraan untuk simulasi pengguna (hanya unit aktif) ----------
vehiclesRouter.get("/vehicles", (req: Request, res: Response) => {
  const { type } = req.query;
  let list = listActiveVehicles();
  if (typeof type === "string" && type !== "Semua") {
    list = list.filter((v) => v.type.toLowerCase() === type.toLowerCase());
  }
  res.json({
    success: true,
    data: list.map(({ createdAt: _c, updatedAt: _u, ...pub }) => pub),
    meta: { total: list.length },
    timestamp: now(),
  });
});

// ---------- API Admin Mitra: kelola katalog kendaraan ----------
vehiclesRouter.get("/mitra/vehicles", (_req: Request, res: Response) => {
  const list = listVehicles();
  res.json({
    success: true,
    data: list,
    meta: { total: list.length, activeCount: list.filter((v) => v.isActive).length },
    timestamp: now(),
  });
});

vehiclesRouter.get("/mitra/vehicles/:id", (req: Request, res: Response) => {
  const vehicle = getVehicle(req.params.id);
  if (!vehicle) {
    sendNotFound(res);
    return;
  }
  res.json({ success: true, data: vehicle, timestamp: now() });
});

vehiclesRouter.post("/mitra/vehicles", (req: Request, res: Response) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  if (findDuplicateModel(parsed.data.model)) {
    sendDuplicate(res);
    return;
  }
  const created = createVehicle(parsed.data);
  res.status(201).json({ success: true, data: created, timestamp: now() });
});

vehiclesRouter.put("/mitra/vehicles/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (!getVehicle(id)) {
    sendNotFound(res);
    return;
  }
  const parsed = vehicleUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  if (parsed.data.model && findDuplicateModel(parsed.data.model, id)) {
    sendDuplicate(res);
    return;
  }
  const updated = updateVehicle(id, parsed.data);
  res.json({ success: true, data: updated, timestamp: now() });
});

vehiclesRouter.patch("/mitra/vehicles/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  if (!getVehicle(id)) {
    sendNotFound(res);
    return;
  }
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  const updated = setVehicleActive(id, parsed.data.isActive);
  res.json({ success: true, data: updated, timestamp: now() });
});

vehiclesRouter.delete("/mitra/vehicles/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (!deleteVehicle(id)) {
    sendNotFound(res);
    return;
  }
  res.json({ success: true, data: { id }, timestamp: now() });
});
