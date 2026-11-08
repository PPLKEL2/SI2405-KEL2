"use client";

import React, { useState, useEffect } from "react";
import type { EnergyTariff } from "@/lib/types/energy-pricing";

interface EditedPrices {
  [tariffId: string]: string; // raw input string for natural editing
}

export function EnergyPricingManagement() {
  // 1. Data States
  const [tariffs, setTariffs] = useState<EnergyTariff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 2. Tab State: "BBM" | "PLN"
  const [activeTab, setActiveTab] = useState<"BBM" | "PLN">("BBM");

  // 3. Staged Edits & Dirty Tracking
  const [editedPrices, setEditedPrices] = useState<EditedPrices>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 4. Metadata Pembaruan
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string>("2024-10-01T00:00:00.000Z");
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("Superadmin");

  useEffect(() => {
    let ignore = false;

    fetch("/api/admin/energy-tariffs")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.ok && Array.isArray(json.data)) {
            setTariffs(json.data);

            // Cari timestamp pembaruan paling akhir dari data yang ada
            let latestTimestamp = "";
            let latestAuthor = "Superadmin";
            for (const t of json.data) {
              if (!latestTimestamp || t.updatedAt > latestTimestamp) {
                latestTimestamp = t.updatedAt;
                latestAuthor = t.updatedBy || "Superadmin";
              }
            }
            if (latestTimestamp) {
              setLastUpdatedDate(latestTimestamp);
              setLastUpdatedBy(latestAuthor);
            }
          } else {
            setFetchError(json.error || "Gagal memuat data tarif dari server.");
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFetchError("Gagal menghubungi server untuk memuat data tarif.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Handler reload manual jika tombol coba lagi diklik
  const handleReload = () => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/admin/energy-tariffs")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          setTariffs(json.data);
          let latestTimestamp = "";
          let latestAuthor = "Superadmin";
          for (const t of json.data) {
            if (!latestTimestamp || t.updatedAt > latestTimestamp) {
              latestTimestamp = t.updatedAt;
              latestAuthor = t.updatedBy || "Superadmin";
            }
          }
          if (latestTimestamp) {
            setLastUpdatedDate(latestTimestamp);
            setLastUpdatedBy(latestAuthor);
          }
        } else {
          setFetchError(json.error || "Gagal memuat data tarif dari server.");
        }
      })
      .catch(() => {
        setFetchError("Gagal menghubungi server untuk memuat data tarif.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Filter tarif per tab aktif
  // Tab BBM: kategori BBM
  // Tab PLN: kategori PLN_HOME (dan SPKLU bila perlu)
  const currentTabTariffs = tariffs.filter((t) => {
    if (activeTab === "BBM") return t.category === "BBM";
    return t.category === "PLN_HOME";
  });

  // Handler perubahan input tarif per baris
  const handlePriceChange = (id: string, rawValue: string) => {
    // Hanya izinkan angka dan titik desimal
    const sanitized = rawValue.replace(/[^0-9.]/g, "");
    setEditedPrices((prev) => ({
      ...prev,
      [id]: sanitized,
    }));
  };

  // Cek apakah ada perubahan yang belum disimpan (Dirty Check)
  const hasUnsavedChanges = Object.keys(editedPrices).some((id) => {
    const tariff = tariffs.find((t) => t.id === id);
    if (!tariff) return false;
    const editedStr = editedPrices[id]?.trim();
    if (!editedStr) return false;
    const parsed = parseFloat(editedStr);
    return !isNaN(parsed) && parsed !== tariff.pricePerUnit;
  });

  // Handler Simpan Perubahan
  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges || isSaving) return;

    // Kumpulkan seluruh data yang berubah
    const updates: Array<{ id: string; pricePerUnit: number }> = [];
    const validationErrors: string[] = [];

    for (const id of Object.keys(editedPrices)) {
      const tariff = tariffs.find((t) => t.id === id);
      if (!tariff) continue;

      const rawVal = editedPrices[id]?.trim();
      const numVal = parseFloat(rawVal);

      if (isNaN(numVal) || numVal <= 0) {
        validationErrors.push(`Tarif untuk "${tariff.name}" harus berupa angka positif lebih dari 0.`);
        continue;
      }

      if (numVal !== tariff.pricePerUnit) {
        updates.push({
          id,
          pricePerUnit: numVal,
        });
      }
    }

    if (validationErrors.length > 0) {
      setFeedback({
        type: "error",
        message: validationErrors[0],
      });
      setTimeout(() => setFeedback(null), 5000);
      return;
    }

    if (updates.length === 0) {
      setEditedPrices({});
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const res = await fetch("/api/admin/energy-tariffs/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          changedBy: "Superadmin",
        }),
      });

      const json = await res.json();

      if (json.ok && Array.isArray(json.data)) {
        setTariffs(json.data);
        setEditedPrices({});
        if (json.updatedAt) {
          setLastUpdatedDate(json.updatedAt);
          setLastUpdatedBy("Superadmin");
        }
        setFeedback({
          type: "success",
          message: "Perubahan tarif berhasil disimpan ke sistem.",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: "error",
          message: json.error || "Gagal menyimpan perubahan tarif.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan jaringan saat menyimpan data.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format tanggal bahasa Indonesia
  const formatIndonesianDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "1 Oktober 2026";
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "1 Oktober 2026";
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

      {/* Header Halaman (Sesuai Referensi Gambar) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Tarif Energi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Harga BBM dan tarif PLN per golongan yang dipakai di seluruh kalkulator.
          </p>
        </div>

        {/* Tombol Simpan Perubahan */}
        <div>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
              hasUnsavedChanges && !isSaving
                ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-95 cursor-pointer"
                : "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed"
            }`}
          >
            {isSaving && (
              <svg
                className="h-4 w-4 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigasi: Harga BBM vs Tarif PLN (Segmented Pill Control) */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab("BBM")}
          className={`rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
            activeTab === "BBM"
              ? "bg-white text-blue-600 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Harga BBM
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("PLN")}
          className={`rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
            activeTab === "PLN"
              ? "bg-white text-blue-600 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tarif PLN
        </button>
      </div>

      {/* Area Tabel Tarif */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p>Memuat data tarif parameter...</p>
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
        ) : currentTabTariffs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Tidak ada parameter tarif yang tersedia untuk kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 bg-white">
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    JENIS / GOLONGAN
                  </th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    SATUAN
                  </th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                    TARIF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTabTariffs.map((item) => {
                  const rawEdited = editedPrices[item.id];
                  const displayValue =
                    rawEdited !== undefined ? rawEdited : item.pricePerUnit.toString();
                  const isDirty =
                    rawEdited !== undefined &&
                    parseFloat(rawEdited) !== item.pricePerUnit;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      {/* Kolom Jenis / Golongan */}
                      <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">
                        {item.name}
                      </td>

                      {/* Kolom Satuan */}
                      <td className="py-4 px-6 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                        {item.unit === "Rp/liter"
                          ? "per liter"
                          : item.unit === "Rp/kWh"
                          ? "per kWh"
                          : item.unit}
                      </td>

                      {/* Kolom Input Tarif */}
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end">
                          <div
                            className={`flex items-center rounded-xl border bg-white px-3.5 py-1.5 w-44 sm:w-52 transition focus-within:ring-2 ${
                              isDirty
                                ? "border-blue-500 ring-2 ring-blue-100"
                                : "border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-100"
                            }`}
                          >
                            <span className="text-xs font-semibold text-slate-400 mr-2 select-none">
                              Rp
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={displayValue}
                              onChange={(e) =>
                                handlePriceChange(item.id, e.target.value)
                              }
                              className="w-full text-right font-heading text-sm font-semibold text-slate-900 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
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

      {/* Informasi Terakhir Diperbarui (Sesuai Referensi Gambar) */}
      <div className="pt-1">
        <p className="text-xs text-blue-600/90 font-medium select-none">
          Terakhir diperbarui {formatIndonesianDate(lastUpdatedDate)} oleh {lastUpdatedBy}.
        </p>
      </div>
    </div>
  );
}
