import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../auth/security.js";
import { evModelRepository } from "../storage/ev-model-repository.js";

export const evModelsRouter = Router();

// PBI 03 & PBI 04: Daftar & Pencarian/Filter Katalog EV (Publik / Guest)
evModelsRouter.get("/ev-models", (req: Request, res: Response) => {
  const q = req.query.q ? String(req.query.q) : undefined;
  const category = req.query.category ? String(req.query.category) : undefined;
  const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
  const minBattery =
    req.query.minBattery !== undefined ? Number(req.query.minBattery) : undefined;
  const minRange = req.query.minRange !== undefined ? Number(req.query.minRange) : undefined;

  // Untuk role USER/Guest, default tampilkan hanya yang aktif kecuali MITRA meminta semua
  const activeOnlyParam = req.query.activeOnly;
  const activeOnly =
    activeOnlyParam !== undefined
      ? String(activeOnlyParam) === "true"
      : req.authSession?.role !== "MITRA";

  const items = evModelRepository.list({
    q,
    category,
    maxPrice,
    minBattery,
    minRange,
    activeOnly,
  });

  res.json({
    success: true,
    count: items.length,
    data: items,
  });
});

evModelsRouter.get("/ev-models/:id", (req: Request, res: Response) => {
  const item = evModelRepository.getById(String(req.params.id));
  if (!item) {
    res.status(404).json({
      success: false,
      error: "Data kendaraan listrik tidak ditemukan.",
    });
    return;
  }
  res.json({
    success: true,
    data: item,
  });
});

// PBI 03: Tambah Kendaraan Listrik (Khusus Admin Mitra)
evModelsRouter.post(
  "/ev-models",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const result = evModelRepository.create(req.body ?? {});
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Data spesifikasi EV tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Unit kendaraan listrik berhasil ditambahkan ke katalog.",
      data: result.data,
    });
  }
);

// PBI 03: Ubah Kendaraan Listrik (Khusus Admin Mitra)
evModelsRouter.put(
  "/ev-models/:id",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const result = evModelRepository.update(String(req.params.id), req.body ?? {});
    if (result.notFound) {
      res.status(404).json({
        success: false,
        error: "Unit kendaraan listrik tidak ditemukan.",
      });
      return;
    }
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Data perubahan EV tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      message: "Data kendaraan listrik berhasil diperbarui.",
      data: result.data,
    });
  }
);

// PBI 03: Aktifkan / Nonaktifkan Kendaraan Listrik (Khusus Admin Mitra)
evModelsRouter.patch(
  "/ev-models/:id/status",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const isActive = Boolean(req.body?.isActive);
    const updated = evModelRepository.setActiveStatus(String(req.params.id), isActive);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: "Unit kendaraan listrik tidak ditemukan.",
      });
      return;
    }
    res.json({
      success: true,
      message: `Unit ${updated.brand} ${updated.modelName} berhasil ${
        isActive ? "diaktifkan" : "dinonaktifkan"
      }.`,
      data: updated,
    });
  }
);

// PBI 03: Hapus Kendaraan Listrik (Khusus Admin Mitra)
evModelsRouter.delete(
  "/ev-models/:id",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const deleted = evModelRepository.delete(String(req.params.id));
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: "Unit kendaraan listrik tidak ditemukan.",
      });
      return;
    }
    res.json({
      success: true,
      message: "Data kendaraan listrik berhasil dihapus.",
    });
  }
);

