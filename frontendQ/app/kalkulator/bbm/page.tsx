"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { apiFetch, ApiHttpError, formatNumberId, formatRupiah } from "@/lib/api";

interface IcePreset {
  id: string;
  name: string;
  category: "Motor" | "Mobil";
  defaultKmPerLiter: number;
  defaultFuelCode: string;
  annualOilAndFilterIdr: number;
  annualSparkPlugIdr: number;
  annualPeriodicServiceIdr: number;
  annualTiresAndBrakesIdr: number;
  annualStnkTaxIdr: number;
}

interface EnergyTariffItem {
  id: string;
  code: string;
  name: string;
  category: string;
  pricePerUnit: number;
}

export default function FuelCostCalculatorPage() {
  const [icePresets, setIcePresets] = useState<IcePreset[]>([]);
  const [fuelTariffs, setFuelTariffs] = useState<EnergyTariffItem[]>([]);

  const [vehicleCategory, setVehicleCategory] = useState<"Motor" | "Mobil">("Motor");
  const [selectedPresetId, setSelectedPresetId] = useState("ice-vario-125");
  const [presetName, setPresetName] = useState("Honda Vario 125");
  const [fuelTypeCode, setFuelTypeCode] = useState("BBM_PERTALITE_RON90");
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState("10000");
  const [kmPerLiter, setKmPerLiter] = useState("45");
  const [distanceInputKm, setDistanceInputKm] = useState("60");
  const [distancePeriod, setDistancePeriod] = useState<"DAILY" | "MONTHLY">("DAILY");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    apiFetch<{
      data: { icePresets: IcePreset[]; energyTariffs: EnergyTariffItem[] };
    }>("/reference/bootstrap")
      .then((res) => {
        setIcePresets(res.data.icePresets || []);
        const bbmList = (res.data.energyTariffs || []).filter((t) => t.category === "BBM");
        setFuelTariffs(bbmList);
        if (bbmList.length > 0) {
          const pertalite =
            bbmList.find((t) => t.code === "BBM_PERTALITE_RON90") || bbmList[0];
          setFuelTypeCode(pertalite.code);
          setFuelPricePerLiter(String(pertalite.pricePerUnit));
        }
      })
      .catch(() => {});
  }, []);

  const runCalculation = async (overrideParams?: Record<string, any>) => {
    setErrorMsg(null);
    setFieldErrors({});
    setLoading(true);

    const payload = {
      vehicleCategory,
      vehiclePresetName: presetName,
      fuelTypeCode,
      fuelPricePerLiter: Number(fuelPricePerLiter),
      kmPerLiter: Number(kmPerLiter),
      distanceInputKm: Number(distanceInputKm),
      distancePeriod,
      ...overrideParams,
    };

    try {
      const res = await apiFetch<{ data: any }>("/calculations/fuel-cost", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res.data);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setErrorMsg(err.message);
        setFieldErrors(err.errors || {});
      } else {
        setErrorMsg("Gagal menghitung biaya BBM.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCalculation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = icePresets.find((p) => p.id === presetId);
    if (!found) return;
    setVehicleCategory(found.category);
    setPresetName(found.name);
    setKmPerLiter(String(found.defaultKmPerLiter));

    const tariff = fuelTariffs.find((t) => t.code === found.defaultFuelCode);
    if (tariff) {
      setFuelTypeCode(tariff.code);
      setFuelPricePerLiter(String(tariff.pricePerUnit));
      runCalculation({
        vehicleCategory: found.category,
        vehiclePresetName: found.name,
        kmPerLiter: found.defaultKmPerLiter,
        fuelTypeCode: tariff.code,
        fuelPricePerLiter: tariff.pricePerUnit,
      });
    } else {
      runCalculation({
        vehicleCategory: found.category,
        vehiclePresetName: found.name,
        kmPerLiter: found.defaultKmPerLiter,
      });
    }
  };

  const handleFuelTypeChange = (code: string) => {
    setFuelTypeCode(code);
    const tariff = fuelTariffs.find((t) => t.code === code);
    if (tariff) {
      setFuelPricePerLiter(String(tariff.pricePerUnit));
      runCalculation({
        fuelTypeCode: code,
        fuelPricePerLiter: tariff.pricePerUnit,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCalculation();
  };

  // Estimasi perawatan dasar untuk melengkapi F06
  const currentPreset = icePresets.find((p) => p.id === selectedPresetId) || icePresets[0];
  const dailyKmNum = Number(distanceInputKm) || 60;
  const usageScale = Math.max(0.4, (dailyKmNum * 365) / 14600);

  const monthlyBbmCost = result?.monthlyCostIdr || 400000;
  const monthlyLiters = result?.monthlyLiters || 40.0;
  const annualBbmCost = result?.annualCostIdr || 4800000;

  const estOilAnnual = Math.round((currentPreset?.annualOilAndFilterIdr || 360000) * usageScale);
  const estServiceAnnual = Math.round((currentPreset?.annualPeriodicServiceIdr || 480000) * usageScale);
  const estTiresAnnual = Math.round((currentPreset?.annualTiresAndBrakesIdr || 360000) * usageScale);
  const estStnkAnnual = currentPreset?.annualStnkTaxIdr || 350000;

  const totalMaintAnnual = estOilAnnual + estServiceAnnual + estTiresAnnual + estStnkAnnual;
  const totalMaintMonthly = Math.round(totalMaintAnnual / 12);
  const grandTotalMonthly = monthlyBbmCost + totalMaintMonthly;
  const grandTotalAnnual = annualBbmCost + totalMaintAnnual;

  return (
    <AppShell>
      <div className="max-w-[1180px]">
        {/* Header (Figma F06) */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Kalkulator Biaya BBM &amp; Perawatan
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Berapa sebenarnya yang Anda keluarkan tiap bulan untuk kendaraan BBM saat ini.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Grid 2 Kolom (Figma F06) */}
        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          {/* Kolom Kiri: Form Parameter F06 */}
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            noValidate
          >
            {/* Kendaraan BBM Dropdown */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-800">
                Kendaraan BBM
              </label>
              <select
                data-testid="fuel-preset-select"
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                {icePresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Konsumsi BBM Slider & Input Sync */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="fuel-kml-input" className="text-xs font-bold text-slate-800">
                  Konsumsi BBM
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {kmPerLiter} km/l
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="0.5"
                value={kmPerLiter}
                onChange={(e) => {
                  setKmPerLiter(e.target.value);
                  runCalculation({ kmPerLiter: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="fuel-kml-input"
                  data-testid="fuel-kml-input"
                  type="number"
                  step="0.5"
                  value={kmPerLiter}
                  onChange={(e) => {
                    setKmPerLiter(e.target.value);
                    runCalculation({ kmPerLiter: Number(e.target.value) });
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">km / liter</span>
              </div>
              {fieldErrors.kmPerLiter && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  {fieldErrors.kmPerLiter}
                </p>
              )}
            </div>

            {/* Jenis BBM */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="fuel-type-select" className="text-xs font-bold text-slate-800">
                  Jenis BBM
                </label>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Tarif Superadmin
                </span>
              </div>
              <select
                id="fuel-type-select"
                data-testid="fuel-type-select"
                value={fuelTypeCode}
                onChange={(e) => handleFuelTypeChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                {fuelTariffs.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
                <span>Harga resmi per liter:</span>
                <span className="num font-bold text-slate-900">
                  {formatRupiah(Number(fuelPricePerLiter))} / liter
                </span>
              </div>
            </div>

            {/* Jarak per hari */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="fuel-distance-input" className="text-xs font-bold text-slate-800">
                  Jarak per hari
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {distanceInputKm} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={distanceInputKm}
                onChange={(e) => {
                  setDistanceInputKm(e.target.value);
                  runCalculation({ distanceInputKm: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="fuel-distance-input"
                  data-testid="fuel-distance-input"
                  type="number"
                  value={distanceInputKm}
                  onChange={(e) => {
                    setDistanceInputKm(e.target.value);
                    runCalculation({ distanceInputKm: Number(e.target.value) });
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">km / hari</span>
              </div>
              {fieldErrors.distanceInputKm && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  {fieldErrors.distanceInputKm}
                </p>
              )}
            </div>

            <button
              type="submit"
              data-testid="fuel-calc-submit"
              className="mt-6 flex h-9 w-full items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              {loading ? "Menghitung..." : "Perbarui Hitungan"}
            </button>
          </form>

          {/* Kolom Kanan: 3 Metrik Atas + Donut Komposisi + Tabel Perawatan (Figma F06) */}
          <div className="space-y-6">
            {/* Top 3 Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: BBM / bulan */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">BBM / bulan</span>
                <p
                  data-testid="fuel-monthly-cost"
                  className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900"
                >
                  {formatRupiah(monthlyBbmCost)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatNumberId(monthlyLiters, 1)} liter
                </span>
                <div className="mt-3 hidden border-t border-slate-100 pt-2 text-[10px] text-slate-400 sm:block">
                  Harian: <span data-testid="fuel-daily-cost">{formatRupiah(result?.dailyCostIdr || 0)}</span> · Tahunan: <span data-testid="fuel-annual-cost">{formatRupiah(annualBbmCost)}</span>
                </div>
              </div>

              {/* Card 2: Perawatan / bulan */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Perawatan / bulan</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatRupiah(totalMaintMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  oli, servis, ban
                </span>
              </div>

              {/* Card 3: Total / bulan */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Total / bulan</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatRupiah(grandTotalMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  termasuk pajak STNK
                </span>
              </div>
            </div>

            {/* Middle Card: Komposisi Biaya Per Tahun + SVG Donut Chart (F06) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Komposisi biaya per tahun
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Total {formatRupiah(grandTotalAnnual)}
              </p>

              <div className="mt-6 flex flex-col items-center justify-around gap-6 sm:flex-row">
                {/* SVG Donut Chart */}
                <div className="relative grid h-44 w-44 place-items-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    {/* Lingkaran Background */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="14"
                    />
                    {/* Segmen BBM (Blue) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#2563EB"
                      strokeWidth="14"
                      strokeDasharray="180 238"
                      strokeDashoffset="0"
                    />
                    {/* Segmen Ganti Oli (Sky) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#38BDF8"
                      strokeWidth="14"
                      strokeDasharray="20 238"
                      strokeDashoffset="-180"
                    />
                    {/* Segmen Servis (Indigo) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#6366F1"
                      strokeWidth="14"
                      strokeDasharray="15 238"
                      strokeDashoffset="-200"
                    />
                    {/* Segmen Ban & Rem (Slate) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#94A3B8"
                      strokeWidth="14"
                      strokeDasharray="12 238"
                      strokeDashoffset="-215"
                    />
                    {/* Segmen Pajak STNK (Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="14"
                      strokeDasharray="11 238"
                      strokeDashoffset="-227"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="num font-heading text-sm font-extrabold text-slate-900">
                      Rp {(grandTotalAnnual / 1000000).toFixed(1).replace(".", ",")} jt
                    </p>
                    <p className="text-[10px] text-slate-400">per tahun</p>
                  </div>
                </div>

                {/* Legend List */}
                <div className="w-full max-w-xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                      <span className="text-slate-700">BBM</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(annualBbmCost)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8]" />
                      <span className="text-slate-700">Ganti oli &amp; filter</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(estOilAnnual)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#6366F1]" />
                      <span className="text-slate-700">Servis berkala</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(estServiceAnnual)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#94A3B8]" />
                      <span className="text-slate-700">Ban &amp; rem</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(estTiresAnnual)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-slate-700">Pajak STNK</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(estStnkAnnual)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: Rincian Perawatan Per Bulan (F06) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Rincian perawatan per bulan
                </h3>
                <Link
                  href="/kalkulator/perawatan"
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Bandingkan vs EV →
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-600">Ganti oli &amp; filter</span>
                  <span className="num font-bold text-slate-900">
                    {formatRupiah(Math.round(estOilAnnual / 12))}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-600">Servis berkala</span>
                  <span className="num font-bold text-slate-900">
                    {formatRupiah(Math.round(estServiceAnnual / 12))}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-600">Ban &amp; rem</span>
                  <span className="num font-bold text-slate-900">
                    {formatRupiah(Math.round(estTiresAnnual / 12))}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-600">Pajak STNK (dibagi 12)</span>
                  <span className="num font-bold text-slate-900">
                    {formatRupiah(Math.round(estStnkAnnual / 12))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
