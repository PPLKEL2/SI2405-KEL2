"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, formatRupiah } from "@/lib/api";

interface FacilityOption {
  id: number;
  name: string;
  category: "Showroom" | "SPKLU" | "SPBKLU";
  city: string;
  active: boolean;
}

interface ServiceTariffItem {
  id: number;
  facilityId: number;
  serviceType: "CHARGING" | "SWAP";
  unit: "kWh" | "transaksi";
  priceIdr: number;
  validFrom: string;
  validUntil: string | null;
  updatedAt: string;
}

export default function MitraHargaLayananPage() {
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [tariffs, setTariffs] = useState<ServiceTariffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [facilityId, setFacilityId] = useState<string>("");
  const [serviceType, setServiceType] = useState<"CHARGING" | "SWAP">(
    "CHARGING"
  );
  const [priceIdr, setPriceIdr] = useState<string>("2466");
  const [validFrom, setValidFrom] = useState<string>("2026-01-01");
  const [validUntil, setValidUntil] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tester Cek Tarif Aktif pada Tanggal (PBI 06 AC 5)
  const [checkFacilityId, setCheckFacilityId] = useState<string>("");
  const [checkServiceType, setCheckServiceType] = useState<"CHARGING" | "SWAP">(
    "CHARGING"
  );
  const [checkDate, setCheckDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [activeTariffResult, setActiveTariffResult] =
    useState<ServiceTariffItem | null>(null);
  const [activeCheckError, setActiveCheckError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [facRes, tarRes] = await Promise.all([
        apiFetch("/facilities?activeOnly=false"),
        apiFetch("/service-tariffs"),
      ]);
      const facList: FacilityOption[] = (facRes?.data ?? []).filter(
        (f: FacilityOption) =>
          f.category === "SPKLU" || f.category === "SPBKLU"
      );
      setFacilities(facList);
      setTariffs(tarRes?.data ?? []);

      if (facList.length > 0 && !facilityId) {
        const first = facList[0];
        setFacilityId(String(first.id));
        setServiceType(first.category === "SPBKLU" ? "SWAP" : "CHARGING");
        setCheckFacilityId(String(first.id));
        setCheckServiceType(first.category === "SPBKLU" ? "SWAP" : "CHARGING");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data tarif layanan fasilitas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleSelectFacilityChange(nextId: string) {
    setFacilityId(nextId);
    const found = facilities.find((f) => String(f.id) === nextId);
    if (found) {
      setServiceType(found.category === "SPBKLU" ? "SWAP" : "CHARGING");
    }
  }

  function handleEdit(item: ServiceTariffItem) {
    setEditingId(item.id);
    setFacilityId(String(item.facilityId));
    setServiceType(item.serviceType);
    setPriceIdr(String(item.priceIdr));
    setValidFrom(item.validFrom);
    setValidUntil(item.validUntil || "");
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  function resetForm() {
    setEditingId(null);
    setPriceIdr("2466");
    setValidFrom("2026-01-01");
    setValidUntil("");
    setErrorMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        facilityId: Number(facilityId),
        serviceType,
        unit: serviceType === "CHARGING" ? "kWh" : "transaksi",
        priceIdr: Number(priceIdr),
        validFrom,
        validUntil: validUntil.trim() ? validUntil.trim() : null,
      };

      if (editingId !== null) {
        const res = await apiFetch(`/service-tariffs/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Tarif layanan fasilitas berhasil diperbarui."
        );
      } else {
        const res = await apiFetch("/service-tariffs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg(
          res?.message || "Tarif layanan fasilitas berhasil disimpan."
        );
      }

      resetForm();
      await loadAll();
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Gagal menyimpan konfigurasi tarif layanan fasilitas."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckActiveTariff(e: React.FormEvent) {
    e.preventDefault();
    setActiveCheckError(null);
    setActiveTariffResult(null);
    try {
      const res = await apiFetch(
        `/service-tariffs/active?facilityId=${checkFacilityId}&serviceType=${checkServiceType}&date=${checkDate}`
      );
      setActiveTariffResult(res?.data ?? null);
    } catch (err: any) {
      setActiveCheckError(
        err?.message || "Tidak ada tarif aktif pada tanggal tersebut."
      );
    }
  }

  function getFacilityName(id: number): string {
    const f = facilities.find((item) => item.id === id);
    return f ? `[${f.category}] ${f.name}` : `Fasilitas #${id}`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Kiri: Form Konfigurasi Tarif Layanan + Simulasi Cek Tarif Aktif */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId !== null
                ? `Ubah Tarif Layanan #${editingId}`
                : "Atur Tarif Layanan Fasilitas EV"}
            </h2>
            {editingId !== null && (
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
              data-testid="service-tariff-error"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              data-testid="service-tariff-success"
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Lokasi Fasilitas (SPKLU / SPBKLU) *
              </label>
              <select
                data-testid="service-tariff-facility"
                value={facilityId}
                onChange={(e) => handleSelectFacilityChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.category}] {f.name} ({f.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Layanan *
                </label>
                <select
                  data-testid="service-tariff-type"
                  value={serviceType}
                  onChange={(e) =>
                    setServiceType(e.target.value as "CHARGING" | "SWAP")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="CHARGING">CHARGING (Rp / kWh)</option>
                  <option value="SWAP">SWAP (Rp / transaksi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Layanan (Rp) *
                </label>
                <input
                  type="number"
                  data-testid="service-tariff-price"
                  value={priceIdr}
                  onChange={(e) => setPriceIdr(e.target.value)}
                  placeholder="Contoh: 2466"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berlaku Mulai (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  data-testid="service-tariff-from"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berlaku Sampai (Opsional)
                </label>
                <input
                  type="date"
                  data-testid="service-tariff-until"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="service-tariff-submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#1E40AF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition"
            >
              {submitting
                ? "Menyimpan..."
                : editingId !== null
                ? "Simpan Perubahan Tarif Layanan"
                : "Simpan Tarif Layanan"}
            </button>
          </form>
        </div>

        {/* Simulasi Pembacaan Tarif Aktif pada Tanggal Tertentu (PBI 06 AC 5) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">
            Cek Tarif Layanan Aktif Berdasarkan Tanggal
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Verifikasi tarif fasilitas yang digunakan oleh modul kalkulator dan peta pengguna.
          </p>

          <form onSubmit={handleCheckActiveTariff} className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fasilitas
              </label>
              <select
                value={checkFacilityId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setCheckFacilityId(nextId);
                  const found = facilities.find((f) => String(f.id) === nextId);
                  if (found) {
                    setCheckServiceType(
                      found.category === "SPBKLU" ? "SWAP" : "CHARGING"
                    );
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.category}] {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Layanan
                </label>
                <select
                  value={checkServiceType}
                  onChange={(e) =>
                    setCheckServiceType(e.target.value as "CHARGING" | "SWAP")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  <option value="CHARGING">CHARGING</option>
                  <option value="SWAP">SWAP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Referensi
                </label>
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="check-active-tariff-btn"
              className="w-full rounded-xl border border-[#2563EB] bg-blue-50 px-3 py-2 text-xs font-bold text-[#1E40AF] hover:bg-blue-100"
            >
              Periksa Tarif Aktif
            </button>
          </form>

          {activeTariffResult && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <div className="font-bold text-emerald-900">
                Tarif Aktif Ditemukan:
              </div>
              <div className="mt-1 text-base font-extrabold text-slate-900">
                {formatRupiah(activeTariffResult.priceIdr)} /{" "}
                {activeTariffResult.unit}
              </div>
              <div className="text-[11px] text-slate-600">
                Periode: {activeTariffResult.validFrom} s.d.{" "}
                {activeTariffResult.validUntil || "Berlaku Seterusnya"}
              </div>
            </div>
          )}

          {activeCheckError && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              {activeCheckError}
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Tabel Riwayat & Periode Tarif Layanan Fasilitas */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Konfigurasi Harga Layanan ({tariffs.length})
              </h2>
              <p className="text-xs text-slate-500">
                Sistem menolak otomatis periode tarif yang saling bertabrakan pada fasilitas dan jenis layanan yang sama.
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
                  <th className="py-2.5 pr-3 font-semibold">Fasilitas EV</th>
                  <th className="py-2.5 px-2 font-semibold">Jenis Layanan</th>
                  <th className="py-2.5 px-2 font-semibold">Harga Satuan</th>
                  <th className="py-2.5 px-2 font-semibold">Periode Berlaku</th>
                  <th className="py-2.5 pl-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tariffs.map((t) => (
                  <tr
                    key={t.id}
                    data-testid={`service-tariff-row-${t.id}`}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="py-3 pr-3 font-bold text-slate-900">
                      {getFacilityName(t.facilityId)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          t.serviceType === "CHARGING"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {t.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      {formatRupiah(t.priceIdr)}{" "}
                      <span className="font-normal text-slate-500">
                        / {t.unit}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-600">
                      {t.validFrom} → {t.validUntil || "Seterusnya"}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <button
                        type="button"
                        data-testid={`edit-service-tariff-${t.id}`}
                        onClick={() => handleEdit(t)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ubah
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

