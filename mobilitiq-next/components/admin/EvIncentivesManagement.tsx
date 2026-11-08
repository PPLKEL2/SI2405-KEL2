"use client";

import React, { useState, useEffect } from "react";
import type {
  EvIncentiveInput,
  EvIncentivePolicy,
  IncentiveCategory,
  IncentiveValueType,
} from "@/lib/types/ev-incentives";
import {
  formatPolicyValue,
  formatPolicyValidity,
  getPolicyPeriodStatus,
  INCENTIVE_CATEGORIES,
} from "@/lib/calculations/ev-incentives";

export function EvIncentivesManagement() {
  const [policies, setPolicies] = useState<EvIncentivePolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Toggle switch loading states per item id
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPolicy, setEditingPolicy] = useState<EvIncentivePolicy | null>(null);
  const [formData, setFormData] = useState<EvIncentiveInput>({
    name: "",
    category: "TAX",
    valueType: "PERCENTAGE",
    value: "",
    calculationBasis: "dari harga",
    validFrom: "2024-01-01",
    validTo: "2026-12-31",
    isActive: true,
    description: "",
  });
  const [isIndefinite, setIsIndefinite] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load Policies from API
  useEffect(() => {
    let ignore = false;

    fetch("/api/admin/ev-incentives")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.ok && Array.isArray(json.data)) {
            setPolicies(json.data);
          } else {
            setFetchError(json.error || "Gagal memuat data kebijakan insentif.");
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFetchError("Gagal menghubungi server untuk memuat data kebijakan.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleReload = () => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/admin/ev-incentives")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          setPolicies(json.data);
        } else {
          setFetchError(json.error || "Gagal memuat data kebijakan.");
        }
      })
      .catch(() => {
        setFetchError("Gagal menghubungi server untuk memuat data kebijakan.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Toggle Switch Handler
  const handleToggleStatus = async (policy: EvIncentivePolicy) => {
    if (togglingId) return;

    const newStatus = !policy.isActive;
    setTogglingId(policy.id);

    try {
      const res = await fetch(`/api/admin/ev-incentives/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: newStatus,
          changedBy: "Superadmin",
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setPolicies((prev) =>
          prev.map((p) => (p.id === policy.id ? json.data : p)),
        );
        setFeedback({
          type: "success",
          message: `Status "${policy.name}" diubah menjadi ${newStatus ? "Aktif" : "Mati"}.`,
        });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({
          type: "error",
          message: json.error || "Gagal mengubah status kebijakan.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan jaringan saat mengubah status.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPolicy(null);
    setFormData({
      name: "",
      category: "TAX",
      valueType: "PERCENTAGE",
      value: "",
      calculationBasis: "dari harga",
      validFrom: "2024-01-01",
      validTo: "2026-12-31",
      isActive: true,
      description: "",
    });
    setIsIndefinite(false);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (policy: EvIncentivePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      id: policy.id,
      code: policy.code,
      name: policy.name,
      category: policy.category,
      valueType: policy.valueType,
      value: policy.value.toString(),
      calculationBasis: policy.calculationBasis,
      validFrom: policy.validFrom,
      validTo: policy.validTo,
      isActive: policy.isActive,
      description: policy.description || "",
    });
    setIsIndefinite(!policy.validTo);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side quick check
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama kebijakan wajib diisi";
    if (formData.value === "" || isNaN(Number(formData.value))) {
      errors.value = "Nilai kebijakan harus berupa angka valid";
    } else if (Number(formData.value) < 0) {
      errors.value = "Nilai kebijakan tidak boleh negatif";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const payload: EvIncentiveInput = {
      ...formData,
      validTo: isIndefinite ? null : formData.validTo,
      changedBy: "Superadmin",
    };

    try {
      const isEdit = Boolean(editingPolicy);
      const url = isEdit
        ? `/api/admin/ev-incentives/${editingPolicy!.id}`
        : "/api/admin/ev-incentives";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        if (isEdit) {
          setPolicies((prev) =>
            prev.map((p) => (p.id === json.data.id ? json.data : p)),
          );
        } else {
          setPolicies((prev) => [json.data, ...prev]);
        }
        setIsModalOpen(false);
        setFeedback({
          type: "success",
          message: isEdit
            ? "Kebijakan berhasil diperbarui."
            : "Kebijakan baru berhasil ditambahkan.",
        });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        if (json.errors) {
          setFormErrors(json.errors);
        } else {
          setFeedback({
            type: "error",
            message: json.error || "Gagal menyimpan data kebijakan.",
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan koneksi ke server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-6">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-sm transition animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✓" : "✕"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Halaman (Sesuai Screenshot Acuan) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Insentif &amp; Pajak EV
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Aturan yang otomatis dihitung di kalkulator pembelian dan TCO.
          </p>
        </div>

        {/* Tombol + Tambah Insentif */}
        <div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            <span>+</span>
            <span>Tambah Insentif</span>
          </button>
        </div>
      </div>

      {/* Kontainer Tabel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p>Memuat data aturan insentif dan pajak...</p>
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-rose-600">{fetchError}</p>
            <button
              type="button"
              onClick={handleReload}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : policies.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Belum ada kebijakan insentif atau pajak yang terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 bg-white">
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    INSENTIF / PAJAK
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    NILAI
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    BERLAKU SAMPAI
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                    AKTIF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {policies.map((item) => {
                  const periodStatus = getPolicyPeriodStatus(item);
                  const isExpired = periodStatus === "EXPIRED";

                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      {/* Kolom Insentif / Pajak */}
                      <td className="py-4.5 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="text-left font-bold text-slate-900 hover:text-blue-600 transition"
                            title="Klik untuk mengubah parameter"
                          >
                            {item.name}
                          </button>
                          {isExpired && (
                            <span className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                              Kedaluwarsa
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kolom Nilai */}
                      <td className="py-4.5 px-6 text-xs sm:text-sm text-slate-500 whitespace-nowrap font-medium">
                        {formatPolicyValue(item)}
                      </td>

                      {/* Kolom Berlaku Sampai */}
                      <td className="py-4.5 px-6 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                        {formatPolicyValidity(item.validTo)}
                      </td>

                      {/* Kolom Aktif (Label Teks + Toggle Switch) */}
                      <td className="py-4.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-3">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              item.isActive ? "text-slate-900" : "text-slate-600"
                            }`}
                          >
                            {item.isActive ? "Aktif" : "Mati"}
                          </span>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.isActive}
                            disabled={togglingId === item.id}
                            onClick={() => handleToggleStatus(item)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                              item.isActive ? "bg-blue-600" : "bg-slate-300"
                            } ${togglingId === item.id ? "opacity-50 cursor-wait" : ""}`}
                            aria-label={`Ubah status ${item.name}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                item.isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah & Ubah Kebijakan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  {editingPolicy ? "Ubah Kebijakan Insentif / Pajak" : "Tambah Insentif / Pajak Baru"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parameter ini akan digunakan oleh kalkulator pembelian dan simulasi TCO.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Nama Kebijakan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kebijakan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: PPN DTP mobil listrik CKD"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
                {formErrors.name && (
                  <p className="text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Kategori & Jenis Nilai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as IncentiveCategory,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.entries(INCENTIVE_CATEGORIES).map(([catKey, catLabel]) => (
                      <option key={catKey} value={catKey}>
                        {catLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Nilai <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.valueType}
                    onChange={(e) => {
                      const vType = e.target.value as IncentiveValueType;
                      setFormData({
                        ...formData,
                        valueType: vType,
                        calculationBasis:
                          vType === "PERCENTAGE" ? "dari harga" : "nominal tetap",
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                  </select>
                </div>
              </div>

              {/* Nilai & Dasar Perhitungan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nilai ({formData.valueType === "PERCENTAGE" ? "%" : "Rp"}{" "}
                    <span className="text-rose-500">*</span>)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={formData.valueType === "PERCENTAGE" ? 100 : undefined}
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder={formData.valueType === "PERCENTAGE" ? "10" : "5000000"}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none font-heading"
                    required
                  />
                  {formErrors.value && (
                    <p className="text-rose-600 mt-1">{formErrors.value}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dasar Perhitungan (Keterangan Satuan)
                  </label>
                  <input
                    type="text"
                    value={formData.calculationBasis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calculationBasis: e.target.value,
                      })
                    }
                    placeholder="Contoh: dari harga OTR"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Periode Berlaku */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mulai Berlaku <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Berlaku Sampai
                    </label>
                    <input
                      type="date"
                      disabled={isIndefinite}
                      value={formData.validTo || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, validTo: e.target.value })
                      }
                      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none ${
                        isIndefinite ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="indefinite-check"
                    checked={isIndefinite}
                    onChange={(e) => {
                      setIsIndefinite(e.target.checked);
                      if (e.target.checked) {
                        setFormData({ ...formData, validTo: null });
                      }
                    }}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label
                    htmlFor="indefinite-check"
                    className="text-xs font-medium text-slate-600 cursor-pointer"
                  >
                    Berlaku seterusnya (Tanpa batas waktu)
                  </label>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Rujukan Regulasi
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Keterangan dasar hukum atau syarat TKDN..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                >
                  {isSubmitting ? "Menyimpan..." : editingPolicy ? "Perbarui" : "Simpan Kebijakan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

