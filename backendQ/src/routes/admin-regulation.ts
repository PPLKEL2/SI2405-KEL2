import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../auth/security.js";
import { energyTariffRepository } from "../storage/energy-tariff-repository.js";
import { evIncentiveRepository } from "../storage/ev-incentive-repository.js";
import type { ApplicableVehicleType } from "../types/domain.js";

export const adminRegulationRouter = Router();

// PBI 09 AC 4: Endpoint baca tarif energi aktif untuk modul simulasi pengguna (Publik / Guest)
adminRegulationRouter.get(
  "/energy-tariffs/active",
  (req: Request, res: Response) => {
    const date = req.query.date
      ? String(req.query.date)
      : new Date().toISOString().slice(0, 10);
    const items = energyTariffRepository.getActiveTariffs(date);
    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  }
);

// PBI 10 AC 5: Endpoint baca insentif & pajak EV aktif untuk modul simulasi pengguna (Publik / Guest)
adminRegulationRouter.get(
  "/ev-incentives/active",
  (req: Request, res: Response) => {
    const date = req.query.date
      ? String(req.query.date)
      : new Date().toISOString().slice(0, 10);
    const vehicleType = req.query.vehicleType
      ? (String(req.query.vehicleType) as ApplicableVehicleType)
      : undefined;
    const items = evIncentiveRepository.getActivePolicies(date, vehicleType);
    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  }
);

// ==================== PBI 09: MANAJEMEN TARIF ENERGI (SUPERADMIN) ====================

adminRegulationRouter.get(
  "/admin/energy-tariffs",
  requireRole("SUPERADMIN"),
  (_req: Request, res: Response) => {
    const tariffs = energyTariffRepository.getAllTariffs();
    res.json({
      success: true,
      count: tariffs.length,
      data: tariffs,
    });
  }
);

adminRegulationRouter.get(
  "/admin/energy-tariffs/histories",
  requireRole("SUPERADMIN"),
  (_req: Request, res: Response) => {
    const histories = energyTariffRepository.getHistories();
    res.json({
      success: true,
      count: histories.length,
      data: histories,
    });
  }
);

adminRegulationRouter.post(
  "/admin/energy-tariffs",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const author = req.authSession?.name || "Superadmin";
    const result = energyTariffRepository.createOrUpdateTariff(req.body ?? {}, author);
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter tarif energi tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Parameter tarif energi berhasil disimpan.",
      data: result.data,
    });
  }
);

adminRegulationRouter.put(
  "/admin/energy-tariffs/:id",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const author = req.authSession?.name || "Superadmin";
    const result = energyTariffRepository.createOrUpdateTariff(
      { ...(req.body ?? {}), id: String(req.params.id) },
      author
    );
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter perubahan tarif tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      message: "Parameter tarif energi berhasil diperbarui.",
      data: result.data,
    });
  }
);

adminRegulationRouter.patch(
  "/admin/energy-tariffs/:id/status",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const author = req.authSession?.name || "Superadmin";
    const isActive = Boolean(req.body?.isActive);
    const updated = energyTariffRepository.setStatus(
      String(req.params.id),
      isActive,
      author
    );
    if (!updated) {
      res.status(404).json({
        success: false,
        error: "Parameter tarif energi tidak ditemukan.",
      });
      return;
    }

    res.json({
      success: true,
      message: `Tarif ${updated.name} berhasil ${
        isActive ? "diaktifkan" : "dinonaktifkan"
      }.`,
      data: updated,
    });
  }
);

// ==================== PBI 10: MANAJEMEN INSENTIF & PAJAK EV (SUPERADMIN) ====================

adminRegulationRouter.get(
  "/admin/ev-incentives",
  requireRole("SUPERADMIN"),
  (_req: Request, res: Response) => {
    const policies = evIncentiveRepository.getAllPolicies();
    res.json({
      success: true,
      count: policies.length,
      data: policies,
    });
  }
);

adminRegulationRouter.post(
  "/admin/ev-incentives",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const author = req.authSession?.name || "Superadmin";
    const result = evIncentiveRepository.createOrUpdatePolicy(req.body ?? {}, author);
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Parameter kebijakan insentif tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Kebijakan insentif/pajak EV berhasil disimpan.",
      data: result.data,
    });
  }
);

adminRegulationRouter.put(
  "/admin/ev-incentives/:id",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const author = req.authSession?.name || "Superadmin";
    const result = evIncentiveRepository.createOrUpdatePolicy(
      { ...(req.body ?? {}), id: String(req.params.id) },
      author
    );
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Perubahan kebijakan insentif tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      message: "Kebijakan insentif/pajak EV berhasil diperbarui.",
      data: result.data,
    });
  }
);

adminRegulationRouter.patch(
  "/admin/ev-incentives/:id/status",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const author = req.authSession?.name || "Superadmin";
    const isActive = Boolean(req.body?.isActive);
    const updated = evIncentiveRepository.setPolicyStatus(
      String(req.params.id),
      isActive,
      author
    );
    if (!updated) {
      res.status(404).json({
        success: false,
        error: "Kebijakan insentif/pajak EV tidak ditemukan.",
      });
      return;
    }

    res.json({
      success: true,
      message: `Kebijakan ${updated.name} berhasil ${
        isActive ? "diaktifkan" : "dinonaktifkan"
      }.`,
      data: updated,
    });
  }
);

adminRegulationRouter.delete(
  "/admin/ev-incentives/:id",
  requireRole("SUPERADMIN"),
  (req: Request, res: Response) => {
    const ok = evIncentiveRepository.deletePolicy(String(req.params.id));
    if (!ok) {
      res.status(404).json({
        success: false,
        error: "Kebijakan insentif/pajak EV tidak ditemukan.",
      });
      return;
    }
    res.json({
      success: true,
      message: "Kebijakan insentif/pajak EV berhasil dihapus.",
    });
  }
);

