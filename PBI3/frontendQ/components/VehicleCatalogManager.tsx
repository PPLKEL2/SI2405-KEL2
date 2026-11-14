"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  createMitraVehicle,
  deleteMitraVehicle,
  fetchMitraVehicles,
  setMitraVehicleActive,
  updateMitraVehicle,
} from "@/lib/api/vehicles";
import { formatDecimal, formatRupiah, type Vehicle, type VehiclePayload } from "@/lib/vehicles";
import { VehicleFormDialog } from "@/components/VehicleFormDialog";

type DialogState = { mode: "create" } | { mode: "edit"; vehicle: Vehicle } | null;
type Notice = { type: "ok" | "error"; text: string } | null;

const errorText = (err: unknown) => (err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

export function VehicleCatalogManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchMitraVehicles(controller.signal)
      .then((data) => {
        setVehicles(data);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(errorText(err));
        setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  function retry() {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  }

  async function handleSubmit(payload: VehiclePayload) {
    if (dialog?.mode === "edit") {
      const updated = await updateMitraVehicle(dialog.vehicle.id, payload);
      setVehicles((list) => list.map((v) => (v.id === updated.id ? updated : v)));
      setNotice({ type: "ok", text: `"${updated.model}" berhasil diperbarui.` });
    } else {
      const created = await createMitraVehicle(payload);
      setVehicles((list) => [...list, created]);
      setNotice({ type: "ok", text: `"${created.model}" berhasil ditambahkan ke katalog.` });
    }
    setDialog(null);
  }

  async function toggleStatus(vehicle: Vehicle) {
    setBusyId(vehicle.id);
    setNotice(null);
    try {
      const updated = await setMitraVehicleActive(vehicle.id, !vehicle.isActive);
      setVehicles((list) => list.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setNotice({ type: "error", text: errorText(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    if (!window.confirm(`Hapus "${vehicle.model}" dari katalog? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusyId(vehicle.id);
    setNotice(null);
    try {
      await deleteMitraVehicle(vehicle.id);
      setVehicles((list) => list.filter((v) => v.id !== vehicle.id));
      setNotice({ type: "ok", text: `"${vehicle.model}" telah dihapus dari katalog.` });
    } catch (err) {
      setNotice({ type: "error", text: err instanceof ApiError ? err.message : errorText(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mq-container">
      <div className="mq-head">
        <div>
          <h1 className="mq-title">Manajemen Katalog EV</h1>
          <p className="mq-sub">{status === "ready" ? `${vehicles.length} unit di katalog Anda.` : "Memuat katalog…"}</p>
        </div>
        <button type="button" className="mq-btn" onClick={() => setDialog({ mode: "create" })}>
          + Tambah Unit
        </button>
      </div>

      {notice ? (
        <div className={`mq-notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Tutup notifikasi">
            Tutup
          </button>
        </div>
      ) : null}

      <div className="mq-card">
        {status === "loading" ? (
          <div className="mq-state">Memuat data kendaraan…</div>
        ) : status === "error" ? (
          <div className="mq-state">
            <strong>Katalog gagal dimuat</strong>
            <p>{loadError}</p>
            <button type="button" className="mq-btn ghost" onClick={retry}>
              Coba lagi
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="mq-state">
            <strong>Belum ada unit di katalog</strong>
            Klik &ldquo;Tambah Unit&rdquo; untuk menambahkan kendaraan listrik pertama.
          </div>
        ) : (
          <div className="mq-scroll">
            <table className="mq-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Tipe</th>
                  <th>Baterai</th>
                  <th>Harga OTR</th>
                  <th>Charger AC</th>
                  <th>Promo</th>
                  <th>Status</th>
                  <th>
                    <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="mq-model">{v.model}</td>
                    <td>
                      <span className="mq-pill">{v.type}</span>
                    </td>
                    <td>{formatDecimal(v.batteryKwh)} kWh</td>
                    <td>{formatRupiah(v.priceOtr)}</td>
                    <td>{formatDecimal(v.acChargerKw)} kW</td>
                    <td>{v.promo || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className={`mq-pill mq-status${v.isActive ? "" : " off"}`}
                        onClick={() => toggleStatus(v)}
                        disabled={busyId === v.id}
                        title="Klik untuk mengubah status"
                      >
                        {v.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td>
                      <div className="mq-actions">
                        <button type="button" className="mq-icon" aria-label={`Ubah ${v.model}`} title="Ubah" onClick={() => setDialog({ mode: "edit", vehicle: v })} disabled={busyId === v.id}>
                          <PencilIcon />
                        </button>
                        <button type="button" className="mq-icon danger" aria-label={`Hapus ${v.model}`} title="Hapus" onClick={() => handleDelete(v)} disabled={busyId === v.id}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialog ? (
        <VehicleFormDialog
          key={dialog.mode === "edit" ? dialog.vehicle.id : "create"}
          vehicle={dialog.mode === "edit" ? dialog.vehicle : undefined}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
