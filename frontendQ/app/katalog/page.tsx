"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { apiFetch, formatNumberId, formatRupiah } from "@/lib/api";

interface EvModel {
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
  acChargerKw?: number;
  dcChargerKw?: number;
  warrantyLabel: string;
  promoLabel?: string;
}

export default function EvCatalogFilterPage() {
  const [models, setModels] = useState<EvModel[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Semua");
  const [maxPriceMillion, setMaxPriceMillion] = useState("900");
  const [minBattery, setMinBattery] = useState("0");
  const [minRange, setMinRange] = useState("0");

  // State untuk perbandingan berdampingan (Figma F08)
  const [compareUnitAId, setCompareUnitAId] = useState<string>("ev-polytron-fox-r");
  const [compareUnitBId, setCompareUnitBId] = useState<string>("ev-gesits-g1");

  const fetchFiltered = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("activeOnly", "true");
      if (q.trim()) params.set("q", q.trim());
      if (category !== "Semua") params.set("category", category);
      if (Number(maxPriceMillion) < 900) {
        params.set("maxPrice", String(Number(maxPriceMillion) * 1000000));
      }
      if (Number(minBattery) > 0) params.set("minBattery", minBattery);
      if (Number(minRange) > 0) params.set("minRange", minRange);

      const res = await apiFetch<{ data: EvModel[] }>(`/ev-models?${params.toString()}`);
      setModels(res.data || []);
    } catch {
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [q, category, maxPriceMillion, minBattery, minRange]);

  useEffect(() => {
    fetchFiltered();
  }, [fetchFiltered]);

  const handleResetFilters = () => {
    setQ("");
    setCategory("Semua");
    setMaxPriceMillion("900");
    setMinBattery("0");
    setMinRange("0");
  };

  // Objek model untuk perbandingan Figma F08
  const unitA = models.find((m) => m.id === compareUnitAId) || models[0];
  const unitB = models.find((m) => m.id === compareUnitBId) || models[1] || models[0];

  return (
    <AppShell>
      <div className="max-w-[1180px]">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Katalog &amp; Filter Kendaraan Listrik
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Eksplorasi motor dan mobil listrik resmi, spesifikasi teknis, harga OTR, dan perbandingan spesifikasi berdampingan.
            </p>
          </div>
          <span
            data-testid="catalog-count-badge"
            className="rounded-xl bg-[#EEF5FF] px-3.5 py-1.5 text-xs font-bold text-[#2563EB]"
          >
            {models.length} Unit Tersedia
          </span>
        </div>

        {/* Filter Card */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label htmlFor="catalog-search-input" className="mb-1 block text-xs font-bold text-slate-800">
                Pencarian
              </label>
              <input
                id="catalog-search-input"
                data-testid="catalog-search-input"
                type="text"
                placeholder="Cari merek, tipe, charger..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Kategori */}
            <div>
              <label htmlFor="catalog-category-select" className="mb-1 block text-xs font-bold text-slate-800">
                Kategori
              </label>
              <select
                id="catalog-category-select"
                data-testid="catalog-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Motor">Motor Listrik</option>
                <option value="Mobil">Mobil Listrik</option>
              </select>
            </div>

            {/* Maksimal Harga */}
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold text-slate-800">
                <span>Maks. Harga OTR</span>
                <span className="num text-[#2563EB]">
                  {Number(maxPriceMillion) >= 900 ? "Semua Harga" : `≤ Rp ${maxPriceMillion} jt`}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="900"
                step="10"
                value={maxPriceMillion}
                onChange={(e) => setMaxPriceMillion(e.target.value)}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
            </div>

            {/* Tombol Reset */}
            <div className="flex items-end">
              <button
                type="button"
                data-testid="catalog-reset-btn"
                onClick={handleResetFilters}
                className="h-9 w-full rounded-xl border border-slate-200 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: Detail EV & Komparasi Berdampingan (Figma F08) */}
        {models.length >= 2 && unitA && unitB && (
          <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-slate-900">
                Detail EV &amp; Komparasi
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Bandingkan dua unit berdampingan. Nilai terbaik per baris ditandai hijau.
              </p>
            </div>

            {/* 2 Selector Cards (Figma F08) */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Unit A Card */}
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  Unit A
                </label>
                <select
                  value={compareUnitAId}
                  onChange={(e) => setCompareUnitAId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-[#2563EB] focus:outline-none"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.modelName} · {m.category}
                    </option>
                  ))}
                </select>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500">{unitA.brand}</span>
                    <h3 className="font-heading text-xl font-extrabold text-slate-900">
                      {unitA.modelName}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                        {unitA.category}
                      </span>
                      {unitA.promoLabel && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {unitA.promoLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="num font-heading text-xl font-extrabold text-[#2563EB]">
                    Rp {(unitA.otrPriceIdr / 1000000).toFixed(1).replace(".", ",")} jt
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/kalkulator/energi-ev?evId=${unitA.id}`}
                    className="inline-block text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Pakai untuk simulasi →
                  </Link>
                </div>
              </div>

              {/* Unit B Card */}
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  Unit B
                </label>
                <select
                  value={compareUnitBId}
                  onChange={(e) => setCompareUnitBId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-[#2563EB] focus:outline-none"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.modelName} · {m.category}
                    </option>
                  ))}
                </select>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500">{unitB.brand}</span>
                    <h3 className="font-heading text-xl font-extrabold text-slate-900">
                      {unitB.modelName}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                        {unitB.category}
                      </span>
                      {unitB.promoLabel && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {unitB.promoLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="num font-heading text-xl font-extrabold text-[#2563EB]">
                    Rp {(unitB.otrPriceIdr / 1000000).toFixed(1).replace(".", ",")} jt
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/kalkulator/energi-ev?evId=${unitB.id}`}
                    className="inline-block text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Pakai untuk simulasi →
                  </Link>
                </div>
              </div>
            </div>

            {/* Specification Comparison Table with Green Checkmarks (Figma F08) */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-2.5 font-semibold">SPESIFIKASI</th>
                    <th className="pb-2.5 font-semibold text-slate-700">A · {unitA.modelName}</th>
                    <th className="pb-2.5 font-semibold text-slate-700">B · {unitB.modelName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Harga OTR */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Harga OTR</td>
                    <td className="py-3">
                      {unitA.otrPriceIdr <= unitB.otrPriceIdr ? (
                        <span className="font-bold text-emerald-600">✓ {formatRupiah(unitA.otrPriceIdr)}</span>
                      ) : (
                        <span>{formatRupiah(unitA.otrPriceIdr)}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {unitB.otrPriceIdr < unitA.otrPriceIdr ? (
                        <span className="font-bold text-emerald-600">✓ {formatRupiah(unitB.otrPriceIdr)}</span>
                      ) : (
                        <span>{formatRupiah(unitB.otrPriceIdr)}</span>
                      )}
                    </td>
                  </tr>

                  {/* Kapasitas Baterai */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Kapasitas baterai</td>
                    <td className="py-3">
                      {unitA.batteryKwh >= unitB.batteryKwh ? (
                        <span className="font-bold text-emerald-600">✓ {unitA.batteryKwh} kWh</span>
                      ) : (
                        <span>{unitA.batteryKwh} kWh</span>
                      )}
                    </td>
                    <td className="py-3">
                      {unitB.batteryKwh > unitA.batteryKwh ? (
                        <span className="font-bold text-emerald-600">✓ {unitB.batteryKwh} kWh</span>
                      ) : (
                        <span>{unitB.batteryKwh} kWh</span>
                      )}
                    </td>
                  </tr>

                  {/* Jarak Tempuh WLTP */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Jarak tempuh (WLTP)</td>
                    <td className="py-3">
                      {unitA.wltpRangeKm >= unitB.wltpRangeKm ? (
                        <span className="font-bold text-emerald-600">✓ {unitA.wltpRangeKm} km</span>
                      ) : (
                        <span>{unitA.wltpRangeKm} km</span>
                      )}
                    </td>
                    <td className="py-3">
                      {unitB.wltpRangeKm > unitA.wltpRangeKm ? (
                        <span className="font-bold text-emerald-600">✓ {unitB.wltpRangeKm} km</span>
                      ) : (
                        <span>{unitB.wltpRangeKm} km</span>
                      )}
                    </td>
                  </tr>

                  {/* Konsumsi Energi */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Konsumsi</td>
                    <td className="py-3">
                      {unitA.consumptionKwh100km <= unitB.consumptionKwh100km ? (
                        <span className="font-bold text-emerald-600">✓ {unitA.consumptionKwh100km} kWh/100 km</span>
                      ) : (
                        <span>{unitA.consumptionKwh100km} kWh/100 km</span>
                      )}
                    </td>
                    <td className="py-3">
                      {unitB.consumptionKwh100km < unitA.consumptionKwh100km ? (
                        <span className="font-bold text-emerald-600">✓ {unitB.consumptionKwh100km} kWh/100 km</span>
                      ) : (
                        <span>{unitB.consumptionKwh100km} kWh/100 km</span>
                      )}
                    </td>
                  </tr>

                  {/* Charger Type & Spesifikasi */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Tipe Charger</td>
                    <td className="py-3">{unitA.chargerType}</td>
                    <td className="py-3">{unitB.chargerType}</td>
                  </tr>

                  {/* Garansi Baterai */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Garansi baterai</td>
                    <td className="py-3">{unitA.warrantyLabel}</td>
                    <td className="py-3">{unitB.warrantyLabel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid Kartu Model Katalog */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Memuat katalog kendaraan...
          </div>
        ) : models.length === 0 ? (
          <div
            data-testid="catalog-empty-state"
            className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"
          >
            <p className="font-heading text-base font-bold text-slate-900">
              Tidak ada kendaraan yang cocok
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Coba sesuaikan filter pencarian atau klik tombol Reset di atas.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m) => (
              <div
                key={m.id}
                data-testid={`ev-card-${m.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#2563EB]"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-slate-400">{m.brand}</span>
                      <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-[#2563EB]">
                        {m.modelName}
                      </h3>
                    </div>
                    <span className="rounded-md bg-[#EEF5FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                      {m.category}
                    </span>
                  </div>

                  <p className="mt-2 num font-heading text-xl font-extrabold text-slate-900">
                    {formatRupiah(m.otrPriceIdr)}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Jarak</span>
                      <p className="num font-bold text-slate-800">{m.wltpRangeKm} km</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Baterai</span>
                      <p className="num font-bold text-slate-800">{m.batteryKwh} kWh</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Konsumsi</span>
                      <p className="num font-bold text-slate-800">{m.consumptionKwh100km} kWh</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">{m.warrantyLabel}</span>
                    <Link
                      href={`/kalkulator/energi-ev?evId=${m.id}`}
                      className="font-bold text-[#2563EB] hover:underline"
                    >
                      Simulasi →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
