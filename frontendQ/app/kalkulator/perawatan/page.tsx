"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { apiFetch, ApiHttpError, formatNumberId, formatRupiah } from "@/lib/api";

interface IcePreset {
  id: string;
  name: string;
  category: "Motor" | "Mobil";
}

interface EvMaintenancePreset {
  id: string;
  name: string;
  category: "Motor" | "Mobil";
}

export default function IceMaintenanceCalculatorPage() {
  const [presets, setPresets] = useState<IcePreset[]>([]);
  const [vehicleCategory, setVehicleCategory] = useState<"Motor" | "Mobil">("Motor");
  const [vehiclePresetId, setVehiclePresetId] = useState("ice-vario-125");
  const [dailyDistanceKm, setDailyDistanceKm] = useState("60");
  const [ownershipYears, setOwnershipYears] = useState("3");

  const [includeOilAndFilter, setIncludeOilAndFilter] = useState(true);
  const [includeSparkPlugAndIgnition, setIncludeSparkPlugAndIgnition] = useState(true);
  const [includePeriodicService, setIncludePeriodicService] = useState(true);
  const [includeTiresAndBrakes, setIncludeTiresAndBrakes] = useState(true);
  const [includeAnnualStnkTax, setIncludeAnnualStnkTax] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    apiFetch<{ data: { icePresets: IcePreset[] } }>("/reference/bootstrap")
      .then((res) => {
        setPresets(res.data.icePresets || []);
      })
      .catch(() => {});
  }, []);

  const runCalc = async (override?: Record<string, any>) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const payload = {
        vehicleCategory,
        vehiclePresetId,
        dailyDistanceKm: Number(dailyDistanceKm),
        ownershipYears: Number(ownershipYears),
        includeOilAndFilter,
        includeSparkPlugAndIgnition,
        includePeriodicService,
        includeTiresAndBrakes,
        includeAnnualStnkTax,
        ...override,
      };
      const res = await apiFetch<{ data: any }>("/calculations/ice-maintenance", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res.data);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal menghitung estimasi biaya perawatan.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    vehicleCategory,
    vehiclePresetId,
    ownershipYears,
    includeOilAndFilter,
    includeSparkPlugAndIgnition,
    includePeriodicService,
    includeTiresAndBrakes,
    includeAnnualStnkTax,
  ]);

  const handlePresetChange = (id: string) => {
    setVehiclePresetId(id);
    const p = presets.find((item) => item.id === id);
    if (p) {
      setVehicleCategory(p.category);
    }
  };

  const evData = result?.evComparison;
  const bbmMonthly = result?.monthlyMaintenanceIdr || 84600;
  const bbmAnnual = result?.annualMaintenanceIdr || 1015200;
  const bbmTotal = result?.totalOwnershipMaintenanceIdr || bbmAnnual * Number(ownershipYears);

  const evMonthly = evData?.evMonthlyMaintenanceIdr || 41666;
  const evAnnual = evData?.evAnnualMaintenanceIdr || 500000;
  const evTotal = evData?.evTotalOwnershipMaintenanceIdr || evAnnual * Number(ownershipYears);

  const savingsMonthly = evData?.monthlySavingsIdr || Math.max(0, bbmMonthly - evMonthly);
  const savingsTotal = evData?.totalOwnershipSavingsIdr || Math.max(0, bbmTotal - evTotal);
  const savingsPct = evData?.savingsPercentage || (bbmMonthly > 0 ? Math.round((savingsMonthly / bbmMonthly) * 100) : 51);

  return (
    <AppShell>
      <div className="max-w-[1180px]">
        {/* Header (Figma F06) */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Estimasi Biaya Perawatan BBM vs EV
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Bandingkan biaya servis rutin, penggantian suku cadang aus, dan pajak tahunan antara kendaraan BBM dan kendaraan listrik.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Panel Kiri: Form Parameter */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            {/* Pilihan Kendaraan BBM */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-800">
                Pilih Kendaraan Konvensional
              </label>
              <select
                value={vehiclePresetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Jarak per hari */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Jarak Tempuh Harian
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {dailyDistanceKm} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={dailyDistanceKm}
                onChange={(e) => {
                  setDailyDistanceKm(e.target.value);
                  runCalc({ dailyDistanceKm: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  value={dailyDistanceKm}
                  onChange={(e) => {
                    setDailyDistanceKm(e.target.value);
                    runCalc({ dailyDistanceKm: Number(e.target.value) });
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">km / hari</span>
              </div>
            </div>

            {/* Periode Kepemilikan (Tahun) */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Periode Kepemilikan
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {ownershipYears} Tahun
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={ownershipYears}
                onChange={(e) => {
                  setOwnershipYears(e.target.value);
                  runCalc({ ownershipYears: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={ownershipYears}
                  onChange={(e) => {
                    setOwnershipYears(e.target.value);
                    runCalc({ ownershipYears: Number(e.target.value) });
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">Tahun</span>
              </div>
            </div>

            {/* Checklist Komponen BBM */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Komponen Servis BBM
              </p>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeOilAndFilter}
                    onChange={(e) => setIncludeOilAndFilter(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#2563EB]"
                  />
                  <span>Oli mesin &amp; filter</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeSparkPlugAndIgnition}
                    onChange={(e) => setIncludeSparkPlugAndIgnition(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#2563EB]"
                  />
                  <span>Busi &amp; sistem pengapian</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={includePeriodicService}
                    onChange={(e) => setIncludePeriodicService(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#2563EB]"
                  />
                  <span>Jasa tune-up berkala</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeTiresAndBrakes}
                    onChange={(e) => setIncludeTiresAndBrakes(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#2563EB]"
                  />
                  <span>Ban &amp; kampas rem</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeAnnualStnkTax}
                    onChange={(e) => setIncludeAnnualStnkTax(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#2563EB]"
                  />
                  <span>Pajak STNK tahunan</span>
                </label>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Preset EV:</span> Biaya servis motor/mobil listrik dihitung otomatis berdasarkan data pabrikan (tanpa penggantian oli/busi).
            </div>
          </div>

          {/* Panel Kanan: Metrik + Komparasi Berdampingan */}
          <div className="space-y-6">
            {/* Top 3 Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: Perawatan BBM */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Perawatan BBM / bulan</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatRupiah(bbmMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatRupiah(bbmAnnual)} / tahun
                </span>
              </div>

              {/* Card 2: Perawatan EV */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Perawatan EV / bulan</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-[#2563EB]">
                  {formatRupiah(evMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatRupiah(evAnnual)} / tahun
                </span>
              </div>

              {/* Card 3: Hemat Perawatan */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
                <span className="text-xs font-semibold text-emerald-800">Hemat Perawatan</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-[#059669]">
                  {formatRupiah(savingsMonthly)}
                </p>
                <span className="mt-1 inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  Hemat {savingsPct}% per bulan
                </span>
              </div>
            </div>

            {/* Total Kepemilikan N Tahun Banner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    AKUMULASI {ownershipYears} TAHUN KEPEMILIKAN
                  </span>
                  <h3 className="mt-0.5 font-heading text-lg font-extrabold text-slate-900">
                    Perbandingan Total Biaya Perawatan
                  </h3>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[11px] text-slate-400">Total BBM ({ownershipYears} Thn)</p>
                    <p className="num text-base font-extrabold text-slate-900">{formatRupiah(bbmTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Total EV ({ownershipYears} Thn)</p>
                    <p className="num text-base font-extrabold text-[#2563EB]">{formatRupiah(evTotal)}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-right">
                    <p className="text-[10px] font-bold text-emerald-700">Total Penghematan</p>
                    <p className="num text-base font-extrabold text-emerald-700">{formatRupiah(savingsTotal)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Rincian Komponen BBM vs EV Berdampingan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Rincian Komponen Servis Berkala
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Transparansi perbandingan suku cadang mekanis BBM vs powertrain elektrik EV.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Kolom Komponen BBM */}
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Kendaraan BBM
                    </span>
                    <span className="num text-xs font-bold text-slate-900">
                      {formatRupiah(bbmAnnual)} / thn
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {(result?.components || []).map((c: any) => (
                      <div key={c.id} className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.description}</p>
                        </div>
                        <span className="num font-bold text-slate-900 whitespace-nowrap">
                          {c.enabled ? formatRupiah(c.annualCostIdr) : "Dilewati"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom Komponen EV */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-blue-200 pb-2">
                    <span className="text-xs font-bold text-[#2563EB]">
                      Kendaraan Listrik (EV)
                    </span>
                    <span className="num text-xs font-bold text-[#2563EB]">
                      {formatRupiah(evAnnual)} / thn
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {(evData?.evComponents || []).map((c: any) => (
                      <div key={c.id} className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.description}</p>
                        </div>
                        <span className="num font-bold text-[#2563EB] whitespace-nowrap">
                          {formatRupiah(c.annualCostIdr)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
