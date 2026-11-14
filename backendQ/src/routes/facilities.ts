import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../auth/security.js";
import {
  computeFacilityRouteLocal,
  formatDistanceLabel,
  formatDurationLabel,
} from "../calculations/sprint1-calculators.js";
import { facilityRepository } from "../storage/facility-repository.js";
import type { FacilityServiceType } from "../types/domain.js";

export const facilitiesRouter = Router();

// PBI 05 & PBI 11: Daftar Lokasi Fasilitas EV (Publik / Guest)
facilitiesRouter.get("/facilities", (req: Request, res: Response) => {
  const category = req.query.category
    ? String(req.query.category)
    : req.query.kategori
    ? String(req.query.kategori)
    : undefined;
  const city = req.query.city ? String(req.query.city) : undefined;
  const q = req.query.q ? String(req.query.q) : undefined;

  const activeOnlyParam = req.query.activeOnly ?? req.query.aktif;
  const activeOnly =
    activeOnlyParam !== undefined
      ? String(activeOnlyParam) === "true"
      : req.authSession?.role !== "MITRA";

  const items = facilityRepository.listFacilities({
    category,
    city,
    q,
    activeOnly,
  });

  res.json({
    success: true,
    count: items.length,
    data: items,
  });
});

facilitiesRouter.get("/facilities/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = facilityRepository.getFacilityById(id);
  if (!item) {
    res.status(404).json({
      success: false,
      error: "Fasilitas tidak ditemukan.",
    });
    return;
  }
  res.json({
    success: true,
    data: item,
  });
});

// PBI 05: Tambah Lokasi Fasilitas EV (Khusus Admin Mitra)
facilitiesRouter.post(
  "/facilities",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const result = facilityRepository.createFacility(req.body ?? {});
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Data lokasi fasilitas tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Lokasi fasilitas berhasil ditambahkan.",
      data: result.data,
    });
  }
);

// PBI 05: Ubah Lokasi Fasilitas EV (Khusus Admin Mitra)
facilitiesRouter.put(
  "/facilities/:id",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = facilityRepository.updateFacility(id, req.body ?? {});
    if (result.notFound) {
      res.status(404).json({
        success: false,
        error: "Fasilitas tidak ditemukan.",
      });
      return;
    }
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Perubahan lokasi fasilitas tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      message: "Data fasilitas berhasil diperbarui.",
      data: result.data,
    });
  }
);

// PBI 05: Aktifkan / Nonaktifkan Fasilitas EV (Khusus Admin Mitra)
facilitiesRouter.patch(
  "/facilities/:id/status",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const active = Boolean(req.body?.active);
    const updated = facilityRepository.setFacilityActiveStatus(id, active);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: "Fasilitas tidak ditemukan.",
      });
      return;
    }
    res.json({
      success: true,
      message: `Fasilitas ${updated.name} berhasil ${
        active ? "diaktifkan" : "dinonaktifkan"
      }.`,
      data: updated,
    });
  }
);

// PBI 05: Nonaktifkan Fasilitas via DELETE (Khusus Admin Mitra)
facilitiesRouter.delete(
  "/facilities/:id",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = facilityRepository.setFacilityActiveStatus(id, false);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: "Fasilitas tidak ditemukan.",
      });
      return;
    }
    res.json({
      success: true,
      message: `Fasilitas ${updated.name} berhasil dinonaktifkan.`,
      data: updated,
    });
  }
);

// PBI 06: Daftar Harga Layanan Fasilitas EV
facilitiesRouter.get(
  "/service-tariffs",
  requireAuth,
  (req: Request, res: Response) => {
    const facilityId =
      req.query.facilityId !== undefined ? Number(req.query.facilityId) : undefined;
    const serviceType = req.query.serviceType
      ? String(req.query.serviceType)
      : undefined;

    const items = facilityRepository.listServiceTariffs({
      facilityId,
      serviceType,
    });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  }
);

// PBI 06 AC 5: Baca Tarif Layanan Aktif pada Tanggal Tertentu (Publik / Guest)
facilitiesRouter.get(
  "/service-tariffs/active",
  (req: Request, res: Response) => {
    const facilityId = Number(req.query.facilityId);
    const serviceType = String(req.query.serviceType ?? "CHARGING") as FacilityServiceType;
    const date = req.query.date
      ? String(req.query.date)
      : new Date().toISOString().slice(0, 10);

    if (!Number.isInteger(facilityId) || facilityId <= 0) {
      res.status(400).json({
        success: false,
        error: "Parameter facilityId wajib berupa angka bulat positif.",
      });
      return;
    }

    const activeTariff = facilityRepository.getActiveServiceTariff(
      facilityId,
      serviceType,
      date
    );

    if (!activeTariff) {
      res.status(404).json({
        success: false,
        error: `Tidak ditemukan tarif ${serviceType} aktif untuk fasilitas #${facilityId} pada tanggal ${date}.`,
      });
      return;
    }

    res.json({
      success: true,
      data: activeTariff,
    });
  }
);

// PBI 06: Buat Tarif Layanan Fasilitas EV (Khusus Admin Mitra)
facilitiesRouter.post(
  "/service-tariffs",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const result = facilityRepository.validateAndSaveServiceTariff(req.body ?? {});
    if (result.conflict) {
      res.status(409).json({
        success: false,
        error:
          Object.values(result.errors ?? {})[0] ||
          "Periode tarif bertabrakan dengan tarif layanan yang sudah ada.",
        errors: result.errors,
      });
      return;
    }
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Data tarif layanan tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Tarif layanan fasilitas berhasil disimpan.",
      data: result.data,
    });
  }
);

// PBI 06: Ubah Tarif Layanan Fasilitas EV (Khusus Admin Mitra)
facilitiesRouter.put(
  "/service-tariffs/:id",
  requireRole("MITRA"),
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = facilityRepository.validateAndSaveServiceTariff(req.body ?? {}, id);
    if (result.notFound) {
      res.status(404).json({
        success: false,
        error: "Data tarif layanan tidak ditemukan.",
      });
      return;
    }
    if (result.conflict) {
      res.status(409).json({
        success: false,
        error:
          Object.values(result.errors ?? {})[0] ||
          "Periode tarif bertabrakan dengan tarif layanan yang sudah ada.",
        errors: result.errors,
      });
      return;
    }
    if (!result.ok || !result.data) {
      const firstErr =
        Object.values(result.errors ?? {})[0] || "Data perubahan tarif tidak valid.";
      res.status(400).json({
        success: false,
        error: firstErr,
        errors: result.errors,
      });
      return;
    }

    res.json({
      success: true,
      message: "Tarif layanan fasilitas berhasil diperbarui.",
      data: result.data,
    });
  }
);

// PBI 12: Kalkulator Jarak dan Waktu ke Fasilitas EV (Publik / Guest)
facilitiesRouter.post(
  "/facilities/route",
  async (req: Request, res: Response) => {
    const originLat = Number(req.body?.originLat);
    const originLon = Number(req.body?.originLon);
    const facilityId =
      req.body?.facilityId !== undefined ? Number(req.body.facilityId) : undefined;
    const travelMode = req.body?.travelMode === "Motor" ? "Motor" : "Mobil";

    let destinationLat =
      req.body?.destinationLat !== undefined ? Number(req.body.destinationLat) : NaN;
    let destinationLon =
      req.body?.destinationLon !== undefined ? Number(req.body.destinationLon) : NaN;
    let destinationName = String(req.body?.destinationName ?? "").trim();

    if (facilityId !== undefined && Number.isInteger(facilityId)) {
      const fac = facilityRepository.getFacilityById(facilityId);
      if (!fac || !fac.active) {
        res.status(404).json({
          success: false,
          error: "Fasilitas tujuan tidak ditemukan atau sedang tidak aktif.",
        });
        return;
      }
      destinationLat = fac.latitude;
      destinationLon = fac.longitude;
      destinationName = fac.name;
    }

    if (
      !Number.isFinite(originLat) ||
      !Number.isFinite(originLon) ||
      originLat < -90 ||
      originLat > 90 ||
      originLon < -180 ||
      originLon > 180
    ) {
      res.status(400).json({
        success: false,
        error: "Koordinat titik asal wajib diisi dengan rentang latitude/longitude yang valid.",
      });
      return;
    }

    if (
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLon) ||
      destinationLat < -90 ||
      destinationLat > 90 ||
      destinationLon < -180 ||
      destinationLon > 180
    ) {
      res.status(400).json({
        success: false,
        error: "Fasilitas tujuan wajib dipilih.",
      });
      return;
    }

    // Coba OSRM terlebih dahulu bila diizinkan dan tersedia, lalu fallback deterministik lokal
    const localResult = computeFacilityRouteLocal({
      originLat,
      originLon,
      destinationLat,
      destinationLon,
      destinationName: destinationName || "Fasilitas EV Tujuan",
      facilityId,
      travelMode,
    });

    if (!localResult.ok || !localResult.data) {
      res.status(422).json({
        success: false,
        error: localResult.error || "Rute perjalanan tidak dapat dihitung untuk lokasi tersebut.",
      });
      return;
    }

    if (process.env.ENABLE_EXTERNAL_OSRM === "true") {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destinationLon},${destinationLat}?overview=full&geometries=geojson`;
        const resp = await fetch(osrmUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (resp.ok) {
          const json: any = await resp.json();
          if (json?.code === "Ok" && json?.routes?.[0]) {
            const route = json.routes[0];
            const coords: [number, number][] = route.geometry.coordinates.map(
              ([lon, lat]: [number, number]) => [lat, lon]
            );
            res.json({
              success: true,
              data: {
                ...localResult.data,
                distanceMeters: Math.round(route.distance),
                distanceKm: Number((route.distance / 1000).toFixed(2)),
                durationSeconds: Math.round(route.duration),
                durationMinutes: Math.max(1, Math.round(route.duration / 60)),
                distanceFormatted: formatDistanceLabel(route.distance),
                durationFormatted: formatDurationLabel(route.duration),
                coordinates: coords,
                calculationMethod: "OSRM_ROAD_NETWORK",
              },
            });
            return;
          }
        }
      } catch {
        // Gunakan hasil localResult deterministik
      }
    }

    res.json({
      success: true,
      data: localResult.data,
    });
  }
);

