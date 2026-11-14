"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, formatRupiah } from "@/lib/api";

interface EnergyTariffItem {
  id: string;
  code: string;
  name: string;
  category: "PLN_HOME" | "SPKLU" | "BBM";
  pricePerUnit: number;
  unit: "Rp/kWh" | "Rp/liter" | "Rp/kVA";
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  notes?: string;
  sourceLabel?: string;
  updatedAt: string;
  updatedBy: string;
}

interface EnergyTariffHistoryItem {
  id: string;
  tariffId: string;
  tariffCode: string;
  tariffName: string;
  category: string;
  action: string;
  oldPrice: number | null;
  newPrice: number;
  oldUnit: string | null;
  newUnit: string;
  changedBy: string;
  reason: string;
  changedAt: string;
}

const INITIAL_FORM = {
  code: "",
  name: "",
  category: "PLN_HOME" as "PLN_HOME" | "SPKLU" | "BBM",
  pricePerUnit: "",
  unit: "Rp/kWh" as "Rp/kWh" | "Rp/liter" | "Rp/kVA",
  validFrom: "2026-01-01",
  validTo: "",
  isActive: true,
  notes: "",
  sourceLabel: "Regulasi Resmi ESDM / PLN",
  reason: "Penyesuaian berkala parameter tarif energi sistem",
};

export default function AdminTarifEnergiPage() {
  const [tariffs, setTariffs] = useState<EnergyTariffItem[]>([]);
  const [histories, setHistories] = useState<EnergyTariffHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    try {
      const [tarRes, histRes] = await Promise.all([
        apiFetch("/admin/energy-tariffs"),
        apiFetch("/admin/energy-tariffs/histories"),
      ]);
      setTariffs(tarRes?.data ?? []);
      setHistories(histRes?.data ?? []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat parameter tarif energi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setErrorMsg(null);
    setFieldErrors({});
  }

  function handleEdit(t: EnergyTariffItem) {
    setEditingId(t.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setForm({
      code: t.code,
      name: t.name,
      category: t.category,
      pricePerUnit: String(t.pricePerUnit),
      unit: t.unit,
      validFrom: t.validFrom,
      validTo: t.validTo || "",
      isActive: t.isActive,
      notes: t.notes || "",
      sourceLabel: t.sourceLabel || "",
      reason: "Pembaruan parameter tarif energi oleh Superadmin",
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
        pricePerUnit: Number(form.pricePerUnit),
        validTo: form.validTo.trim() ? form.validTo.trim() : null,
      };

      if (editingId) {
        const res = await apiFetch(`/admin/energy-tariffs/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Parameter tarif energi berhasil diperbarui."
        );
      } else {
        const res = await apiFetch("/admin/energy-tariffs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Parameter tarif energi berhasil disimpan."
        );
      }

      resetForm();
      await fetchAll();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal menyimpan parameter tarif energi.");
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(item: EnergyTariffItem) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch(`/admin/energy-tariffs/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setSuccessMsg(res?.message || "Status tarif energi berhasil diperbarui.");
      await fetchAll();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengubah status tarif energi.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Konfigurasi Tarif Energi */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId
                  ? "Ubah Parameter Tarif Energi"
                  : "Tambah Parameter Tarif Energi Baru"}
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
                data-testid="admin-tariff-error"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                data-testid="admin-tariff-success"
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
              >
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Parameter *
                  </label>
                  <input
                    type="text"
                    data-testid="tariff-form-code"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    placeholder="PLN_R1_2200VA"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                  {fieldErrors.code && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {fieldErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Energi *
                  </label>
                  <select
                    data-testid="tariff-form-category"
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value as
                        | "PLN_HOME"
                        | "SPKLU"
                        | "BBM";
                      setForm({
                        ...form,
                        category: cat,
                        unit: cat === "BBM" ? "Rp/liter" : "Rp/kWh",
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="PLN_HOME">PLN_HOME (Listrik Rumah)</option>
                    <option value="SPKLU">SPKLU (Charging Publik)</option>
                    <option value="BBM">BBM (Bahan Bakar Minyak)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tarif Energi *
                </label>
                <input
                  type="text"
                  data-testid="tariff-form-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Tarif Listrik Rumah Tangga R1 2.200 VA"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga per Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    data-testid="tariff-form-price"
                    value={form.pricePerUnit}
                    onChange={(e) =>
                      setForm({ ...form, pricePerUnit: e.target.value })
                    }
                    placeholder="Contoh: 1445"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                  {fieldErrors.pricePerUnit && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {fieldErrors.pricePerUnit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan *
                  </label>
                  <select
                    data-testid="tariff-form-unit"
                    value={form.unit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unit: e.target.value as
                          | "Rp/kWh"
                          | "Rp/liter"
                          | "Rp/kVA",
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="Rp/kWh">Rp/kWh</option>
                    <option value="Rp/liter">Rp/liter</option>
                    <option value="Rp/kVA">Rp/kVA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berlaku Mulai *
                  </label>
                  <input
                    type="date"
                    data-testid="tariff-form-from"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm({ ...form, validFrom: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berlaku Sampai (Opsional)
                  </label>
                  <input
                    type="date"
                    data-testid="tariff-form-to"
                    value={form.validTo}
                    onChange={(e) =>
                      setForm({ ...form, validTo: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Perubahan (Tercatat pada Log Audit)
                </label>
                <input
                  type="text"
                  data-testid="tariff-form-reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                data-testid="tariff-form-submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#1E40AF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition"
              >
                {submitting
                  ? "Menyimpan..."
                  : editingId
                  ? "Simpan Perubahan Tarif Energi"
                  : "Tambahkan Parameter Tarif Energi"}
              </button>
            </form>
          </div>
        </div>

        {/* Tabel Parameter Tarif Energi */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Daftar Parameter Tarif Energi ({tariffs.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Digunakan sebagai acuan resmi pada kalkulator BBM, simulator energi EV, dan komparasi biaya operasional.
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
                    <th className="py-2.5 pr-3 font-semibold">Nama & Kode</th>
                    <th className="py-2.5 px-2 font-semibold">Kategori</th>
                    <th className="py-2.5 px-2 font-semibold">Tarif</th>
                    <th className="py-2.5 px-2 font-semibold">Status</th>
                    <th className="py-2.5 pl-2 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tariffs.map((t) => (
                    <tr
                      key={t.id}
                      data-testid={`admin-tariff-row-${t.id}`}
                      className="hover:bg-slate-50/80"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {t.code} • Berlaku {t.validFrom}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium">{t.category}</td>
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {formatRupiah(t.pricePerUnit)}{" "}
                        <span className="font-normal text-slate-500 text-xs">
                          ({t.unit})
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            t.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {t.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          data-testid={`edit-tariff-${t.id}`}
                          onClick={() => handleEdit(t)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          data-testid={`toggle-tariff-${t.id}`}
                          onClick={() => handleToggleStatus(t)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E40AF] hover:bg-blue-100"
                        >
                          {t.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Audit Perubahan Tarif Energi (PBI 09 AC 3) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Riwayat Audit Perubahan Tarif Energi ({histories.length})
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Setiap penambahan, perubahan nilai tarif, periode berlaku, maupun status terekam secara otomatis.
        </p>

        <div className="overflow-x-auto">
          <table
            data-testid="tariff-history-table"
            className="w-full text-left border-collapse text-xs"
          >
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-semibold">Waktu Perubahan</th>
                <th className="py-2 px-2 font-semibold">Parameter Tarif</th>
                <th className="py-2 px-2 font-semibold">Aksi</th>
                <th className="py-2 px-2 font-semibold">Nilai Lama → Baru</th>
                <th className="py-2 px-2 font-semibold">Oleh & Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {histories.slice(0, 15).map((h) => (
                <tr key={h.id}>
                  <td className="py-2.5 pr-3 text-slate-500">
                    {new Date(h.changedAt).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-900">
                    {h.tariffName}{" "}
                    <span className="font-normal text-slate-500">
                      ({h.tariffCode})
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-[#1E40AF]">
                      {h.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-medium text-slate-800">
                    {h.oldPrice !== null ? formatRupiah(h.oldPrice) : "—"} →{" "}
                    <strong>{formatRupiah(h.newPrice)}</strong> ({h.newUnit})
                  </td>
                  <td className="py-2.5 px-2 text-slate-600">
                    <strong>{h.changedBy}:</strong> {h.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

