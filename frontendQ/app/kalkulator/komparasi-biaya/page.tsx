"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { apiFetch, ApiHttpError, formatNumberId, formatRupiah } from "@/lib/api";

export default function ComparisonCalculatorPage() {
  const [evModels, setEvModels] = useState<any[]>([]);
  const [icePresets, setIcePresets] = useState<any[]>([]);
  const [fuelTariffs, setFuelTariffs] = useState<any[]>([]);
  const [fuelTypeCode, setFuelTypeCode] = useState("BBM_PERTALITE_RON90");

  const [dailyDistanceKm, setDailyDistanceKm] = useState("60");
  const [iceKmPerLiter, setIceKmPerLiter] = useState("45");
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState("10000");
  const [evConsumptionKwh100km, setEvConsumptionKwh100km] = useState("3.2");
  const [homeTariffPerKwh, setHomeTariffPerKwh] = useState("1444.7");
  const [spkluTariffPerKwh, setSpkluTariffPerKwh] = useState("2466");
  const [homeChargingPercentage, setHomeChargingPercentage] = useState("85");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    apiFetch<{ data: { evModels: any[]; icePresets: any[]; energyTariffs: any[] } }>(
      "/reference/bootstrap"
    )
      .then((res) => {
        setEvModels(res.data.evModels || []);
        setIcePresets(res.data.icePresets || []);
        const bbmList = (res.data.energyTariffs || []).filter((t: any) => t.category === "BBM");
        setFuelTariffs(bbmList);
        if (bbmList.length > 0) {
          const pertalite = bbmList.find((t: any) => t.code === "BBM_PERTALITE_RON90") || bbmList[0];
          setFuelTypeCode(pertalite.code);
          setFuelPricePerLiter(String(pertalite.pricePerUnit));
        }
      })
      .catch(() => {});
  }, []);

  const runCalc = async (override?: Record<string, any>) => {
    setErrorMsg(null);

    const getVal = (testId: string, fallback: string) => {
      if (typeof document === "undefined") return fallback;
      const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return el !== null ? el.value : fallback;
    };

    const rawDist = getVal(
      "distance-input",
      override?.dailyDistanceKm !== undefined ? String(override.dailyDistanceKm) : dailyDistanceKm
    );
    const rawBbmEff = getVal(
      "bbm-efficiency-input",
      override?.iceKmPerLiter !== undefined ? String(override.iceKmPerLiter) : iceKmPerLiter
    );
    const rawBbmPrice = getVal(
      "bbm-price-input",
      override?.fuelPricePerLiter !== undefined ? String(override.fuelPricePerLiter) : fuelPricePerLiter
    );
    const rawEvCons = getVal(
      "ev-consumption-input",
      override?.evConsumptionKwh100km !== undefined ? String(override.evConsumptionKwh100km) : evConsumptionKwh100km
    );
    const rawHomeTariff = getVal(
      "home-tariff-input",
      override?.homeTariffPerKwh !== undefined ? String(override.homeTariffPerKwh) : homeTariffPerKwh
    );
    const rawHomeShare = getVal(
      "home-charging-share-input",
      override?.homeChargingPercentage !== undefined ? String(override.homeChargingPercentage) : homeChargingPercentage
    );

    if (rawDist.trim() === "") {
      setErrorMsg("Jarak tempuh harian wajib diisi.");
      return;
    }
    const dist = Number(rawDist);
    if (!Number.isFinite(dist) || dist <= 0) {
      setErrorMsg("Jarak tempuh harus diisi angka lebih besar dari 0 km.");
      return;
    }

    if (rawBbmEff.trim() === "") {
      setErrorMsg("Efisiensi BBM wajib diisi.");
      return;
    }
    const bbmEff = Number(rawBbmEff);
    if (!Number.isFinite(bbmEff) || bbmEff <= 0) {
      setErrorMsg("Efisiensi BBM harus diisi angka lebih besar dari 0 km/liter.");
      return;
    }

    if (rawBbmPrice.trim() === "") {
      setErrorMsg("Harga BBM wajib diisi.");
      return;
    }
    const bbmPrice = Number(rawBbmPrice);
    if (!Number.isFinite(bbmPrice) || bbmPrice <= 0) {
      setErrorMsg("Harga BBM harus diisi angka lebih besar dari Rp 0.");
      return;
    }

    if (rawEvCons.trim() === "") {
      setErrorMsg("Konsumsi energi EV wajib diisi.");
      return;
    }
    const evCons = Number(rawEvCons);
    if (!Number.isFinite(evCons) || evCons <= 0) {
      setErrorMsg("Konsumsi energi EV harus diisi angka lebih besar dari 0 kWh/100 km.");
      return;
    }

    if (rawHomeTariff.trim() === "") {
      setErrorMsg("Tarif listrik PLN wajib diisi.");
      return;
    }
    const homeTariff = Number(rawHomeTariff);
    if (!Number.isFinite(homeTariff) || homeTariff <= 0) {
      setErrorMsg("Tarif listrik PLN harus diisi angka lebih besar dari Rp 0.");
      return;
    }

    setDailyDistanceKm(rawDist);
    setIceKmPerLiter(rawBbmEff);
    setFuelPricePerLiter(rawBbmPrice);
    setEvConsumptionKwh100km(rawEvCons);
    setHomeTariffPerKwh(rawHomeTariff);
    setHomeChargingPercentage(rawHomeShare);

    setLoading(true);
    try {
      const payload = {
        dailyDistanceKm: dist,
        iceKmPerLiter: bbmEff,
        fuelPricePerLiter: bbmPrice,
        evConsumptionKwh100km: evCons,
        homeTariffPerKwh: homeTariff,
        spkluTariffPerKwh: Number(spkluTariffPerKwh),
        homeChargingPercentage: Number(rawHomeShare || "100"),
        ...override,
      };
      const res = await apiFetch<{ data: any }>("/calculations/comparison", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res.data);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal menghitung perbandingan biaya operasional.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const distNum = Number(dailyDistanceKm) || 60;
  const bbmEffNum = Number(iceKmPerLiter) || 12;
  const bbmPriceNum = Number(fuelPricePerLiter) || 10000;
  const evConsNum = Number(evConsumptionKwh100km) || 15;
  const homeTariffNum = Number(homeTariffPerKwh) || 1444.7;
  const homeShareNum = Number(homeChargingPercentage || "100") / 100;
  const spkluTariffNum = Number(spkluTariffPerKwh || "2466");

  const blendedTariff =
    homeShareNum >= 1
      ? homeTariffNum
      : homeTariffNum * homeShareNum + spkluTariffNum * (1 - homeShareNum);

  const bbmMonthly = Math.round(((distNum * 30) / bbmEffNum) * bbmPriceNum);
  const evMonthly = Math.round(((distNum * 30 * evConsNum) / 100) * blendedTariff);
  const diffMonthly = bbmMonthly - evMonthly;
  const diffAnnual = diffMonthly * 12;
  const pct = bbmMonthly > 0 ? Math.round((diffMonthly / bbmMonthly) * 100) : 74;

  // Estimasi payback (asumsi selisih harga motor EV Rp 13,7 jt)
  const paybackMonths = diffMonthly > 0 ? Math.round(13700000 / diffMonthly) : 36;
  const paybackYears = Math.floor(paybackMonths / 12);
  const paybackRemMonths = paybackMonths % 12;

  return (
    <AppShell>
      <div className="max-w-[1180px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Komparasi Biaya BBM vs Listrik
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Bandingkan langsung pengeluaran energi kendaraan konvensional dan listrik pada rute tempuh yang sama.
          </p>
        </div>

        {errorMsg && (
          <div data-testid="validation-message" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Panel Kiri: Form Parameter */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runCalc();
            }}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            noValidate
          >
            {/* Jarak per hari */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Jarak per hari
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
                value={Number(dailyDistanceKm) || 60}
                onChange={(e) => {
                  setDailyDistanceKm(e.target.value);
                  const el = typeof document !== "undefined"
                    ? (document.querySelector('[data-testid="distance-input"]') as HTMLInputElement | null)
                    : null;
                  if (el) el.value = e.target.value;
                  runCalc({ dailyDistanceKm: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  data-testid="distance-input"
                  defaultValue="60"
                  onChange={(e) => {
                    setDailyDistanceKm(e.target.value);
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">km / hari</span>
              </div>
            </div>

            {/* Konsumsi BBM */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Konsumsi BBM
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {iceKmPerLiter} km/l
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="75"
                step="1"
                value={Number(iceKmPerLiter) || 45}
                onChange={(e) => {
                  setIceKmPerLiter(e.target.value);
                  const el = typeof document !== "undefined"
                    ? (document.querySelector('[data-testid="bbm-efficiency-input"]') as HTMLInputElement | null)
                    : null;
                  if (el) el.value = e.target.value;
                  runCalc({ iceKmPerLiter: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  data-testid="bbm-efficiency-input"
                  defaultValue="45"
                  onChange={(e) => {
                    setIceKmPerLiter(e.target.value);
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">km / liter</span>
              </div>
            </div>

            {/* Jenis BBM */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="comp-fuel-type" className="text-xs font-bold text-slate-800">
                  Jenis BBM &amp; Tarif
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
                id="comp-fuel-type"
                value={fuelTypeCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setFuelTypeCode(code);
                  const t = fuelTariffs.find((item) => item.code === code);
                  if (t) {
                    setFuelPricePerLiter(String(t.pricePerUnit));
                    const el = typeof document !== "undefined"
                      ? (document.querySelector('[data-testid="bbm-price-input"]') as HTMLInputElement | null)
                      : null;
                    if (el) el.value = String(t.pricePerUnit);
                    runCalc({ fuelPricePerLiter: t.pricePerUnit });
                  }
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                {fuelTariffs.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Rp</span>
                <input
                  type="number"
                  data-testid="bbm-price-input"
                  defaultValue="10000"
                  onChange={(e) => {
                    setFuelPricePerLiter(e.target.value);
                  }}
                  className="h-8 w-28 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">/ liter</span>
              </div>
            </div>

            {/* Konsumsi EV */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Konsumsi Listrik EV
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {evConsumptionKwh100km} kWh/100km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.1"
                value={Number(evConsumptionKwh100km) || 3.2}
                onChange={(e) => {
                  setEvConsumptionKwh100km(e.target.value);
                  const el = typeof document !== "undefined"
                    ? (document.querySelector('[data-testid="ev-consumption-input"]') as HTMLInputElement | null)
                    : null;
                  if (el) el.value = e.target.value;
                  runCalc({ evConsumptionKwh100km: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  data-testid="ev-consumption-input"
                  defaultValue="3.2"
                  onChange={(e) => {
                    setEvConsumptionKwh100km(e.target.value);
                  }}
                  className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">kWh / 100 km</span>
              </div>
            </div>

            {/* Porsi Home Charging */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Porsi Charging Rumah
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {homeChargingPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Number(homeChargingPercentage) || 85}
                onChange={(e) => {
                  setHomeChargingPercentage(e.target.value);
                  const el = typeof document !== "undefined"
                    ? (document.querySelector('[data-testid="home-charging-share-input"]') as HTMLInputElement | null)
                    : null;
                  if (el) el.value = e.target.value;
                  runCalc({ homeChargingPercentage: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  data-testid="home-charging-share-input"
                  defaultValue="85"
                  onChange={(e) => {
                    setHomeChargingPercentage(e.target.value);
                  }}
                  className="h-8 w-20 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">% di rumah</span>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Tarif Listrik PLN (Rumah)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    step="0.1"
                    data-testid="home-tariff-input"
                    defaultValue="1444.7"
                    onChange={(e) => {
                      setHomeTariffPerKwh(e.target.value);
                    }}
                    className="h-8 w-28 rounded-lg border border-slate-200 px-2 text-xs num focus:border-[#2563EB] focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">/ kWh</span>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                PLN {formatRupiah(Number(homeTariffPerKwh))}/kWh · SPKLU {formatRupiah(Number(spkluTariffPerKwh))}/kWh
              </p>
            </div>

            <button
              type="button"
              onClick={() => runCalc()}
              data-testid="calculate-button"
              className="mt-6 flex h-9 w-full items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              {loading ? "Menghitung..." : "Perbarui Perbandingan"}
            </button>
          </form>

          {/* Panel Kanan: Kartu Metrik + Grafik Vertikal + Tabel Rincian */}
          <div className="space-y-6">
            {/* Top 3 Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Biaya BBM / bulan</span>
                <p data-testid="bbm-monthly-cost" className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatRupiah(bbmMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatNumberId(result?.bbmMonthlyLiters || 40, 1)} liter · {formatRupiah(result?.bbmCostPerKm || 222)}/km
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Biaya Listrik / bulan</span>
                <p data-testid="ev-monthly-cost" className="mt-1.5 num font-heading text-2xl font-extrabold text-[#2563EB]">
                  {formatRupiah(evMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatNumberId(result?.evMonthlyKwh || 57.6, 1)} kWh · {formatRupiah(result?.evCostPerKm || 51)}/km
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Hemat Bulanan</span>
                  <span data-testid="savings-percentage" className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {pct}%
                  </span>
                </div>
                <p data-testid="monthly-savings" className="mt-1.5 num font-heading text-2xl font-extrabold text-[#059669]">
                  {formatRupiah(diffMonthly)}
                </p>
                <span className="mt-1 block text-xs text-emerald-700">
                  Hemat {formatRupiah(diffAnnual)} per tahun
                </span>
              </div>
            </div>

            {/* Perbandingan Batang Vertikal Sesuai Figma F01 & F07 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Perbandingan Pengeluaran Bulanan
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Estimasi biaya energi murni untuk jarak {dailyDistanceKm} km/hari ({(Number(dailyDistanceKm) * 30).toLocaleString("id-ID")} km/bulan)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Estimasi Balik Modal</span>
                  <p className="font-heading text-sm font-extrabold text-slate-900">
                    {paybackYears > 0 ? `${paybackYears} th ${paybackRemMonths} bln` : `${paybackMonths} bulan`}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-end justify-center gap-14 pb-4">
                {/* Bar BBM */}
                <div className="flex w-44 flex-col items-center">
                  <span className="num mb-2 text-xs font-bold text-slate-900">
                    {formatRupiah(bbmMonthly)}
                  </span>
                  <div className="h-32 w-full rounded-2xl bg-[#94A3B8]" />
                  <span className="mt-2 text-center text-xs font-semibold text-slate-500">
                    BBM (Konvensional)
                  </span>
                </div>

                {/* Bar EV */}
                <div className="flex w-44 flex-col items-center">
                  <span className="num mb-2 text-xs font-bold text-[#2563EB]">
                    {formatRupiah(evMonthly)}
                  </span>
                  <div className="h-10 w-full rounded-2xl bg-[#2563EB]" />
                  <span className="mt-2 text-center text-xs font-semibold text-[#2563EB]">
                    Listrik (EV)
                  </span>
                </div>
              </div>
            </div>

            {/* Tabel Rincian */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Rincian Parameter &amp; Perbandingan
              </h3>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400">
                      <th className="pb-2 font-semibold">Periode / Metrik</th>
                      <th className="pb-2 font-semibold text-slate-700">Kendaraan BBM</th>
                      <th className="pb-2 font-semibold text-[#2563EB]">Kendaraan Listrik (EV)</th>
                      <th className="pb-2 font-semibold text-emerald-700">Penghematan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 font-medium">Harian ({dailyDistanceKm} km)</td>
                      <td className="num py-2.5">{formatRupiah(result?.bbmDailyCost)}</td>
                      <td className="num py-2.5 text-[#2563EB]">{formatRupiah(result?.evDailyCost)}</td>
                      <td className="num py-2.5 font-bold text-emerald-700">{formatRupiah(result?.costDifferenceDaily)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Bulanan (30 hari)</td>
                      <td className="num py-2.5">{formatRupiah(bbmMonthly)}</td>
                      <td className="num py-2.5 text-[#2563EB]">{formatRupiah(evMonthly)}</td>
                      <td className="num py-2.5 font-bold text-emerald-700">{formatRupiah(diffMonthly)} ({pct}%)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Tahunan (365 hari)</td>
                      <td className="num py-2.5">{formatRupiah(result?.bbmAnnualCost)}</td>
                      <td className="num py-2.5 text-[#2563EB]">{formatRupiah(result?.evAnnualCost)}</td>
                      <td className="num py-2.5 font-bold text-emerald-700">{formatRupiah(diffAnnual)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Biaya per Kilometer</td>
                      <td className="num py-2.5">{formatRupiah(result?.bbmCostPerKm)} / km</td>
                      <td className="num py-2.5 text-[#2563EB]">{formatRupiah(result?.evCostPerKm)} / km</td>
                      <td className="num py-2.5 font-bold text-emerald-700">{formatRupiah((result?.bbmCostPerKm || 0) - (result?.evCostPerKm || 0))} / km</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
