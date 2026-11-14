"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, formatNumberId, formatRupiah } from "@/lib/api";

interface EvModelItem {
  id: string;
  brand: string;
  modelName: string;
  category: "Motor" | "Mobil";
  otrPriceIdr: number;
  batteryKwh: number;
  consumptionKwh100km: number;
  wltpRangeKm: number;
  motorPowerKw: number;
  chargerType: string;
  acChargerKw: number;
  dcChargerKw: number;
  warrantyLabel: string;
  promoLabel?: string;
  serviceCostPerKmIdr: number;
  comparableIceName?: string;
  comparableIcePriceIdr?: number;
  isActive: boolean;
  updatedAt: string;
}

const INITIAL_FORM = {
  brand: "",
  modelName: "",
  category: "Mobil" as "Motor" | "Mobil",
  otrPriceIdr: "",
  batteryKwh: "",
  consumptionKwh100km: "",
  wltpRangeKm: "",
  motorPowerKw: "",
  chargerType: "CCS2 (AC/DC)",
  acChargerKw: "7.4",
  dcChargerKw: "50",
  warrantyLabel: "Garansi Baterai 8 Tahun / 160.000 km",
  promoLabel: "",
  serviceCostPerKmIdr: "95",
  comparableIceName: "",
  comparableIcePriceIdr: "",
  isActive: true,
};

export default function MitraKatalogPage() {
  const [models, setModels] = useState<EvModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<EvModelItem | null>(
    null
  );
  const [form, setForm] = useState(INITIAL_FORM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function fetchCatalog() {
    setLoading(true);
    try {
      const res = await apiFetch("/ev-models?activeOnly=false");
      const list: EvModelItem[] = res?.data ?? [];
      setModels(list);
      if (selectedDetail) {
        const updated = list.find((m) => m.id === selectedDetail.id);
        setSelectedDetail(updated || null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data katalog EV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCatalog();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setErrorMsg(null);
    setFieldErrors({});
  }

  function handleEdit(item: EvModelItem) {
    setEditingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setForm({
      brand: item.brand,
      modelName: item.modelName,
      category: item.category,
      otrPriceIdr: String(item.otrPriceIdr),
      batteryKwh: String(item.batteryKwh),
      consumptionKwh100km: String(item.consumptionKwh100km),
      wltpRangeKm: String(item.wltpRangeKm),
      motorPowerKw: String(item.motorPowerKw),
      chargerType: item.chargerType,
      acChargerKw: String(item.acChargerKw ?? 0),
      dcChargerKw: String(item.dcChargerKw ?? 0),
      warrantyLabel: item.warrantyLabel || "",
      promoLabel: item.promoLabel || "",
      serviceCostPerKmIdr: String(item.serviceCostPerKmIdr ?? 80),
      comparableIceName: item.comparableIceName || "",
      comparableIcePriceIdr: item.comparableIcePriceIdr
        ? String(item.comparableIcePriceIdr)
        : "",
      isActive: item.isActive,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        otrPriceIdr: Number(form.otrPriceIdr),
        batteryKwh: Number(form.batteryKwh),
        consumptionKwh100km: Number(form.consumptionKwh100km),
        wltpRangeKm: Number(form.wltpRangeKm),
        motorPowerKw: Number(form.motorPowerKw),
        acChargerKw: Number(form.acChargerKw || 0),
        dcChargerKw: Number(form.dcChargerKw || 0),
        serviceCostPerKmIdr: Number(form.serviceCostPerKmIdr || 80),
        comparableIcePriceIdr: form.comparableIcePriceIdr
          ? Number(form.comparableIcePriceIdr)
          : undefined,
      };

      if (editingId) {
        const res = await apiFetch(`/ev-models/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Data kendaraan listrik berhasil diperbarui."
        );
      } else {
        const res = await apiFetch("/ev-models", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message ||
            "Unit kendaraan listrik berhasil ditambahkan ke katalog."
        );
      }

      resetForm();
      await fetchCatalog();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal menyimpan data kendaraan listrik.");
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(item: EvModelItem) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch(`/ev-models/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setSuccessMsg(res?.message || "Status unit EV berhasil diperbarui.");
      await fetchCatalog();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengubah status keaktifan unit EV.");
    }
  }

  async function handleDelete(item: EvModelItem) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch(`/ev-models/${item.id}`, {
        method: "DELETE",
      });
      setSuccessMsg(res?.message || "Unit kendaraan listrik berhasil dihapus.");
      if (selectedDetail?.id === item.id) {
        setSelectedDetail(null);
      }
      await fetchCatalog();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal menghapus unit kendaraan listrik.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form Tambah / Ubah Unit EV */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId
                ? "Ubah Spesifikasi Unit EV"
                : "Tambah Unit Kendaraan Listrik Baru"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Batal Ubah
              </button>
            )}
          </div>

          {errorMsg && (
            <div
              data-testid="mitra-ev-error"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              data-testid="mitra-ev-success"
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merek Kendaraan *
                </label>
                <input
                  type="text"
                  data-testid="ev-form-brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Contoh: Wuling, BYD, Alva"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                {fieldErrors.brand && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.brand}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Model *
                </label>
                <input
                  type="text"
                  data-testid="ev-form-model"
                  value={form.modelName}
                  onChange={(e) =>
                    setForm({ ...form, modelName: e.target.value })
                  }
                  placeholder="Contoh: Air ev Long Range"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                {fieldErrors.modelName && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.modelName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Kendaraan *
                </label>
                <select
                  data-testid="ev-form-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as "Motor" | "Mobil",
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="Mobil">Mobil Listrik</option>
                  <option value="Motor">Motor Listrik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga OTR (Rp) *
                </label>
                <input
                  type="number"
                  data-testid="ev-form-price"
                  value={form.otrPriceIdr}
                  onChange={(e) =>
                    setForm({ ...form, otrPriceIdr: e.target.value })
                  }
                  placeholder="Contoh: 275000000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                {fieldErrors.otrPriceIdr && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.otrPriceIdr}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kapasitas Baterai (kWh) *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="ev-form-battery"
                  value={form.batteryKwh}
                  onChange={(e) =>
                    setForm({ ...form, batteryKwh: e.target.value })
                  }
                  placeholder="Contoh: 26.7"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konsumsi (kWh / 100 km) *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="ev-form-consumption"
                  value={form.consumptionKwh100km}
                  onChange={(e) =>
                    setForm({ ...form, consumptionKwh100km: e.target.value })
                  }
                  placeholder="Contoh: 11.5"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jarak Tempuh WLTP (km) *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="ev-form-range"
                  value={form.wltpRangeKm}
                  onChange={(e) =>
                    setForm({ ...form, wltpRangeKm: e.target.value })
                  }
                  placeholder="Contoh: 300"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daya Motor (kW) *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="ev-form-power"
                  value={form.motorPowerKw}
                  onChange={(e) =>
                    setForm({ ...form, motorPowerKw: e.target.value })
                  }
                  placeholder="Contoh: 50"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Konektor / Charger *
                </label>
                <input
                  type="text"
                  data-testid="ev-form-charger"
                  value={form.chargerType}
                  onChange={(e) =>
                    setForm({ ...form, chargerType: e.target.value })
                  }
                  placeholder="Contoh: CCS2 / Type 2"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Label Promo / Garansi
                </label>
                <input
                  type="text"
                  value={form.warrantyLabel}
                  onChange={(e) =>
                    setForm({ ...form, warrantyLabel: e.target.value })
                  }
                  placeholder="Garansi Baterai 8 Tahun"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="ev-active-check"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-[#1E40AF]"
              />
              <label
                htmlFor="ev-active-check"
                className="text-xs font-medium text-slate-700"
              >
                Tampilkan sebagai unit aktif di katalog publik pengguna
              </label>
            </div>

            <button
              type="submit"
              data-testid="ev-form-submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#1E40AF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition"
            >
              {submitting
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan Unit EV"
                : "Tambahkan ke Katalog EV"}
            </button>
          </form>
        </div>
      </div>

      {/* Daftar & Detail Unit Katalog EV */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Unit Katalog Kendaraan Listrik ({models.length})
              </h2>
              <p className="text-xs text-slate-500">
                Klik baris unit untuk melihat detail spesifikasi, mengubah data,
                atau mengatur status tayang.
              </p>
            </div>
            {loading && (
              <span className="text-xs font-medium text-blue-600">
                Memuat...
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3 font-semibold">Unit EV</th>
                  <th className="py-2.5 px-2 font-semibold">Kategori</th>
                  <th className="py-2.5 px-2 font-semibold">Harga OTR</th>
                  <th className="py-2.5 px-2 font-semibold">Baterai & Jarak</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 pl-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {models.map((item) => (
                  <tr
                    key={item.id}
                    data-testid={`mitra-ev-row-${item.id}`}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="py-3 pr-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDetail(item)}
                        className="text-left font-bold text-slate-900 hover:text-[#1E40AF]"
                      >
                        {item.brand} {item.modelName}
                      </button>
                      <div className="text-[11px] text-slate-500">
                        {item.chargerType}
                      </div>
                    </td>
                    <td className="py-3 px-2">{item.category}</td>
                    <td className="py-3 px-2 font-semibold text-slate-900">
                      {formatRupiah(item.otrPriceIdr)}
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-600">
                      {formatNumberId(item.batteryKwh, 1)} kWh •{" "}
                      {formatNumberId(item.wltpRangeKm, 0)} km
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-300"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        data-testid={`edit-ev-${item.id}`}
                        onClick={() => handleEdit(item)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        data-testid={`toggle-ev-${item.id}`}
                        onClick={() => handleToggleStatus(item)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E40AF] hover:bg-blue-100"
                      >
                        {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-ev-${item.id}`}
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kartu Detail Spesifikasi EV */}
        {selectedDetail && (
          <div
            data-testid="mitra-ev-detail-card"
            className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Detail Spesifikasi: {selectedDetail.brand}{" "}
                {selectedDetail.modelName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Tutup Detail
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <div className="text-slate-500">Konsumsi Energi</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedDetail.consumptionKwh100km} kWh / 100 km
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <div className="text-slate-500">Daya Motor</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedDetail.motorPowerKw} kW
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <div className="text-slate-500">Pengisian AC / DC</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedDetail.acChargerKw} kW / {selectedDetail.dcChargerKw}{" "}
                  kW
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <div className="text-slate-500">Garansi Resmi</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedDetail.warrantyLabel}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

