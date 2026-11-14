import { Router, type Request, type Response } from "express";
import { requireAuth } from "../auth/security.js";
import {
  calculateComparison,
  calculateEvEnergy,
  calculateFuelCost,
  calculateIceMaintenance,
} from "../calculations/sprint1-calculators.js";
import {
  ICE_VEHICLE_PRESETS,
  EV_MAINTENANCE_PRESETS,
  ORIGIN_LOCATION_PRESETS,
} from "../data/reference-presets.js";
import { energyTariffRepository } from "../storage/energy-tariff-repository.js";
import { evIncentiveRepository } from "../storage/ev-incentive-repository.js";
import { evModelRepository } from "../storage/ev-model-repository.js";
import { facilityRepository } from "../storage/facility-repository.js";

export const calculationsRouter = Router();

// Health check publik
calculationsRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "MobilitiQ Sprint 1 API",
    timestamp: new Date().toISOString(),
  });
});

// Bootstrap data referensi untuk kalkulator & halaman pengguna (dapat diakses pengunjung/guest)
calculationsRouter.get(
  "/reference/bootstrap",
  (_req: Request, res: Response) => {
    const activeTariffs = energyTariffRepository.getActiveTariffs();
    const activeIncentives = evIncentiveRepository.getActivePolicies();
    const activeEvModels = evModelRepository.list({ activeOnly: true });
    const activeFacilities = facilityRepository.listFacilities({ activeOnly: true });

    res.json({
      success: true,
      data: {
        icePresets: ICE_VEHICLE_PRESETS,
        evMaintenancePresets: EV_MAINTENANCE_PRESETS,
        originPresets: ORIGIN_LOCATION_PRESETS,
        energyTariffs: activeTariffs,
        evIncentives: activeIncentives,
        evModels: activeEvModels,
        facilities: activeFacilities,
      },
      timestamp: new Date().toISOString(),
    });
  }
);

// PBI 01: Kalkulator Biaya BBM Kendaraan Konvensional (Publik / Guest)
calculationsRouter.post(
  "/calculations/fuel-cost",
  (req: Request, res: Response) => {
    const result = calculateFuelCost(req.body ?? {});
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter masukan tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  }
);

// PBI 02: Kalkulator Biaya Perawatan Kendaraan Konvensional (Publik / Guest)
calculationsRouter.post(
  "/calculations/ice-maintenance",
  (req: Request, res: Response) => {
    const result = calculateIceMaintenance(req.body ?? {});
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter perawatan tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  }
);

// PBI 07: Simulator Konsumsi Energi EV (Publik / Guest)
calculationsRouter.post(
  "/calculations/ev-energy",
  (req: Request, res: Response) => {
    const body = { ...(req.body ?? {}) };
    if (body.evModelId) {
      const ev = evModelRepository.getById(String(body.evModelId));
      if (ev && !body.consumptionKwh100km) {
        body.consumptionKwh100km = ev.consumptionKwh100km;
      }
    }

    const result = calculateEvEnergy(body);
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter konsumsi energi EV tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  }
);

// PBI 08: Kalkulator Biaya Operasional BBM vs Listrik (Publik / Guest)
calculationsRouter.post(
  "/calculations/comparison",
  (req: Request, res: Response) => {
    const result = calculateComparison(req.body ?? {});
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter komparasi tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  }
);

