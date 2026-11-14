"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, formatRupiah } from "@/lib/api";

interface EvIncentivePolicyItem {
  id: string;
  code: string;
  name: string;
  category: "TAX" | "CUSTOMS" | "INCENTIVE" | "SUBSIDY";
  vehicleType: "Motor" | "Mobil" | "Semua";
  valueType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  calculationBasis: string;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  description?: string;
  updatedAt: string;
  updatedBy: string;
}

const INITIAL_POLICY_FORM = {
  code: "",
  name: "",
  category: "INCENTIVE" as "TAX" | "CUSTOMS" | "INCENTIVE" | "SUBSIDY",
  vehicleType: "Mobil" as "Motor" | "Mobil" | "Semua",
  valueType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
  value: "10",
  calculationBasis: "Harga Jual / OTR (PPN DTP TKDN >= 40%)",
  validFrom: "2026-01-01",
  validTo: "",
  isActive: true,
  description: "",
};

export default function AdminInsentifPajakPage() {
  const [policies, setPolicies] = useState<EvIncentivePolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_POLICY_FORM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function fetchPolicies() {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/ev-incentives");
      setPolicies(res?.data ?? []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat daftar kebijakan insentif EV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPolicies();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(INITIAL_POLICY_FORM);
    setErrorMsg(null);
    setFieldErrors({});
  }

  function handleEdit(p: EvIncentivePolicyItem) {
    setEditingId(p.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setForm({
      code: p.code,
      name: p.name,
      category: p.category,
      vehicleType: p.vehicleType,
      valueType: p.valueType,
      value: String(p.value),
      calculationBasis: p.calculationBasis,
      validFrom: p.validFrom,
      validTo: p.validTo || "",
      isActive: p.isActive,
      description: p.description || "",
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
        value: Number(form.value),
        validTo: form.validTo.trim() ? form.validTo.trim() : null,
      };

      if (editingId) {
        const res = await apiFetch(`/admin/ev-incentives/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Kebijakan insentif/pajak EV berhasil diperbarui."
        );
      } else {
        const res = await apiFetch("/admin/ev-incentives", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Kebijakan insentif/pajak EV berhasil disimpan."
        );
      }

      resetForm();
      await fetchPolicies();
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Gagal menyimpan kebijakan insentif/pajak EV."
      );
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(p: EvIncentivePolicyItem) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch(`/admin/ev-incentives/${p.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      setSuccessMsg(
        res?.message || "Status kebijakan insentif/pajak EV diperbarui."
      );
      await fetchPolicies();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memperbarui status kebijakan.");
    }
  }

  async function handleDelete(p: EvIncentivePolicyItem) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch(`/admin/ev-incentives/${p.id}`, {
        method: "DELETE",
      });
      setSuccessMsg(res?.message || "Kebijakan insentif/pajak EV dihapus.");
      await fetchPolicies();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal menghapus kebijakan insentif.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form Konfigurasi Kebijakan Insentif & Pajak EV */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId
                ? "Ubah Kebijakan Insentif & Pajak EV"
                : "Tambah Kebijakan Insentif & Pajak EV"}
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
              data-testid="admin-incentive-error"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              data-testid="admin-incentive-success"
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Kebijakan
                </label>
                <input
                  type="text"
                  data-testid="incentive-form-code"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="INS_PPN_DTP_10"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Regulasi *
                </label>
                <select
                  data-testid="incentive-form-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as
                        | "TAX"
                        | "CUSTOMS"
                        | "INCENTIVE"
                        | "SUBSIDY",
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="INCENTIVE">INCENTIVE (Insentif Fiskal)</option>
                  <option value="TAX">TAX (Pajak Daerah PKB / BBNKB)</option>
                  <option value="SUBSIDY">SUBSIDY (Subsidi Pembelian)</option>
                  <option value="CUSTOMS">CUSTOMS (Bea Masuk / PPnBM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kebijakan / Regulasi *
              </label>
              <input
                type="text"
                data-testid="incentive-form-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Insentif PPN DTP 10% Mobil Listrik TKDN >= 40%"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kendaraan
                </label>
                <select
                  data-testid="incentive-form-vehicle"
                  value={form.vehicleType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      vehicleType: e.target.value as
                        | "Motor"
                        | "Mobil"
                        | "Semua",
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
                >
                  <option value="Mobil">Mobil</option>
                  <option value="Motor">Motor</option>
                  <option value="Semua">Semua EV</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Nilai *
                </label>
                <select
                  data-testid="incentive-form-valuetype"
                  value={form.valueType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      valueType: e.target.value as
                        | "PERCENTAGE"
                        | "FIXED_AMOUNT",
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Besaran Nilai *
                </label>
                <input
                  type="number"
                  step="any"
                  data-testid="incentive-form-value"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-900"
                />
                {fieldErrors.value && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.value}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dasar Perhitungan
              </label>
              <input
                type="text"
                data-testid="incentive-form-basis"
                value={form.calculationBasis}
                onChange={(e) =>
                  setForm({ ...form, calculationBasis: e.target.value })
                }
                placeholder="Harga Jual OTR / Nilai Jual Kendaraan Bermotor"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berlaku Mulai *
                </label>
                <input
                  type="date"
                  data-testid="incentive-form-from"
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
                  data-testid="incentive-form-to"
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
                Deskripsi / Dasar Hukum Regulasi
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="PMK tentang PPN Ditanggung Pemerintah atau Perda PKB Kendaraan Listrik"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              data-testid="incentive-form-submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#1E40AF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition"
            >
              {submitting
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan Kebijakan"
                : "Tambahkan Kebijakan Insentif / Pajak"}
            </button>
          </form>
        </div>
      </div>

      {/* Tabel Daftar Kebijakan Insentif & Pajak EV */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Kebijakan Insentif & Pajak EV ({policies.length})
              </h2>
              <p className="text-xs text-slate-500">
                Kebijakan yang berstatus aktif diteruskan secara otomatis ke modul katalog dan simulasi pengguna.
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
                  <th className="py-2.5 pr-3 font-semibold">Nama Kebijakan</th>
                  <th className="py-2.5 px-2 font-semibold">Kategori</th>
                  <th className="py-2.5 px-2 font-semibold">Nilai</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 pl-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {policies.map((p) => (
                  <tr
                    key={p.id}
                    data-testid={`admin-incentive-row-${p.id}`}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="py-3 pr-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.code} • Kendaraan: {p.vehicleType} • Berlaku{" "}
                        {p.validFrom}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium">{p.category}</td>
                    <td className="py-3 px-2 font-bold text-[#1E40AF]">
                      {p.valueType === "PERCENTAGE"
                        ? `${p.value}%`
                        : formatRupiah(p.value)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-300"
                        }`}
                      >
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        data-testid={`edit-incentive-${p.id}`}
                        onClick={() => handleEdit(p)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        data-testid={`toggle-incentive-${p.id}`}
                        onClick={() => handleToggleStatus(p)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E40AF] hover:bg-blue-100"
                      >
                        {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-incentive-${p.id}`}
                        onClick={() => handleDelete(p)}
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
      </div>
    </div>
  );
}

