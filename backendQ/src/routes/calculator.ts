import { Router, type Request, type Response } from "express";
import { z, ZodError } from "zod";
import { calculateEvEnergy } from "../calculations/ev.js";
import { calculateComparison } from "../calculations/comparison.js";
import {
  EV_SAMPLE_PRESETS,
  ICE_SAMPLE_PRESETS,
  FUEL_PRICE_REFERENCES,
  FUEL_METADATA,
} from "../data/reference-data.js";

export const calculatorRouter = Router();

// 1. Health check endpoint
calculatorRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "MobilitiQ Calculator Backend",
    timestamp: new Date().toISOString(),
  });
});

// 2. Schema dan Endpoint Perhitungan Konsumsi Energi EV (KEL2-67)
const evEnergyInputSchema = z.object({
  consumptionKwh100km: z
    .number({ invalid_type_error: "Konsumsi kendaraan harus berupa angka." })
    .positive("Konsumsi kendaraan harus lebih besar dari 0 kWh/100 km."),
  dailyDistanceKm: z
    .number({ invalid_type_error: "Jarak harian harus berupa angka." })
    .min(0, "Jarak harian tidak boleh negatif."),
  homeChargingPercentage: z
    .number({ invalid_type_error: "Porsi charging rumah harus berupa angka." })
    .min(0, "Porsi charging rumah minimal 0%.")
    .max(100, "Porsi charging rumah maksimal 100%."),
  homeTariffPerKwh: z
    .number({ invalid_type_error: "Tarif listrik rumah harus berupa angka." })
    .positive("Tarif listrik rumah harus lebih besar dari Rp 0 / kWh."),
  spkluTariffPerKwh: z
    .number({ invalid_type_error: "Tarif SPKLU harus berupa angka." })
    .positive("Tarif SPKLU harus lebih besar dari Rp 0 / kWh."),
  homePowerVa: z.number().optional(),
});

calculatorRouter.post("/calculations/ev-energy", (req: Request, res: Response) => {
  try {
    const validated = evEnergyInputSchema.parse(req.body);
    const result = calculateEvEnergy(validated);

    if (!result.ok) {
      res.status(400).json({
        success: false,
        error: "Data masukan tidak valid.",
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      res.status(400).json({
        success: false,
        error: firstIssue?.message || "Data masukan tidak valid.",
        issues: err.issues,
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan internal saat menghitung energi EV.",
    });
  }
});

// 3. Schema dan Endpoint Komparasi Biaya Energi BBM vs EV (KEL2-73)
const comparisonInputSchema = z.object({
  dailyDistanceKm: z
    .number({ invalid_type_error: "Jarak harian harus berupa angka." })
    .min(0, "Jarak harian tidak boleh negatif."),
  iceKmPerLiter: z
    .number({ invalid_type_error: "Efisiensi BBM harus berupa angka." })
    .positive("Efisiensi BBM harus lebih besar dari 0 km/L."),
  fuelPricePerLiter: z
    .number({ invalid_type_error: "Harga BBM per liter harus berupa angka." })
    .positive("Harga BBM per liter harus lebih besar dari Rp 0."),
  evConsumptionKwh100km: z
    .number({ invalid_type_error: "Konsumsi EV harus berupa angka." })
    .positive("Konsumsi EV harus lebih besar dari 0 kWh/100 km."),
  homeTariffPerKwh: z
    .number({ invalid_type_error: "Tarif listrik rumah harus berupa angka." })
    .positive("Tarif listrik rumah harus lebih besar dari Rp 0 / kWh."),
  spkluTariffPerKwh: z
    .number({ invalid_type_error: "Tarif SPKLU harus berupa angka." })
    .positive("Tarif SPKLU harus lebih besar dari Rp 0 / kWh."),
  homeChargingPercentage: z
    .number({ invalid_type_error: "Porsi charging rumah harus berupa angka." })
    .min(0, "Porsi charging rumah minimal 0%.")
    .max(100, "Porsi charging rumah maksimal 100%."),
});

calculatorRouter.post("/calculations/comparison", (req: Request, res: Response) => {
  try {
    const validated = comparisonInputSchema.parse(req.body);
    const result = calculateComparison(validated);

    if (!result.ok) {
      res.status(400).json({
        success: false,
        error: "Data masukan tidak valid.",
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      res.status(400).json({
        success: false,
        error: firstIssue?.message || "Data masukan tidak valid.",
        issues: err.issues,
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan internal saat menghitung komparasi biaya.",
    });
  }
});

// 4. Endpoint Preset Kendaraan EV & BBM
calculatorRouter.get("/presets/vehicles", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      evPresets: EV_SAMPLE_PRESETS,
      icePresets: ICE_SAMPLE_PRESETS,
    },
    timestamp: new Date().toISOString(),
  });
});

// 5. Endpoint Referensi Harga Bahan Bakar Statis dengan Sumber Regulasi Resmi
calculatorRouter.get("/presets/fuel-prices", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      items: FUEL_PRICE_REFERENCES,
      metadata: FUEL_METADATA,
    },
    timestamp: new Date().toISOString(),
  });
});

