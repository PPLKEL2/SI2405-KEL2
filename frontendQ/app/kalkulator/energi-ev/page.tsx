"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { apiFetch, ApiHttpError, formatNumberId, formatRupiah } from "@/lib/api";

interface EvModel {
  id: string;
  brand: string;
  modelName: string;
  category: string;
  consumptionKwh100km: number;
}

export default function EvEnergySimulatorPage() {
  const [evModels, setEvModels] = useState<EvModel[]>([]);
  const [selectedEvId, setSelectedEvId] = useState("ev-polytron-fox-r");
  const [consumptionKwh100km, setConsumptionKwh100km] = useState("3.2");
  const [dailyDistanceKm, setDailyDistanceKm] = useState("60");
  const [homeChargingPercentage, setHomeChargingPercentage] = useState("85");
  const [homeTariffPerKwh, setHomeTariffPerKwh] = useState("1444.7");
  const [spkluTariffPerKwh, setSpkluTariffPerKwh] = useState("2466");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    apiFetch<{ data: { evModels: EvModel[]; energyTariffs: any[] } }>("/reference/bootstrap")
      .then((res) => {
        const list = res.data.evModels || [];
        setEvModels(list);
        const pln = (res.data.energyTariffs || []).find(
          (t: any) => t.code === "PLN_R1_1300_2200VA"
        );
        const spklu = (res.data.energyTariffs || []).find((t: any) => t.category === "SPKLU");
        if (pln) setHomeTariffPerKwh(String(pln.pricePerUnit));
        if (spklu) setSpkluTariffPerKwh(String(spklu.pricePerUnit));
      })
      .catch(() => {});
  }, []);

  const runCalc = async (override?: Record<string, any>) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const payload = {
        evModelId: selectedEvId,
        consumptionKwh100km: Number(consumptionKwh100km),
        dailyDistanceKm: Number(dailyDistanceKm),
        homeChargingPercentage: Number(homeChargingPercentage),
        homeTariffPerKwh: Number(homeTariffPerKwh),
        spkluTariffPerKwh: Number(spkluTariffPerKwh),
        ...override,
      };
      const res = await apiFetch<{ data: any }>("/calculations/ev-energy", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res.data);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal menghitung simulasi konsumsi energi EV.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEv = (id: string) => {
    setSelectedEvId(id);
    const ev = evModels.find((m) => m.id === id);
    if (ev) {
      setConsumptionKwh100km(String(ev.consumptionKwh100km));
      runCalc({ evModelId: id, consumptionKwh100km: ev.consumptionKwh100km });
    }
  };

  const selectedModel = evModels.find((m) => m.id === selectedEvId);
  const selectedName = selectedModel ? `${selectedModel.brand} ${selectedModel.modelName}` : "Polytron Fox-R";

  // Nilai perhitungan bulanan
  const monthlyKwh = result?.monthlyKwh || 57.6;
  const costMonthly = result?.totalCostMonthly || 92039;
  const costPerKm = result?.costPerKm || 51;
  const homeCost = result?.homeCostMonthly || 70735;
  const spkluCost = result?.spkluCostMonthly || 21304;

  // Nilai komparasi baseline BBM (Vario 125, Pertalite 45 km/l + servis = ~Rp 484.600)
  const bbmBenchmarkMonthly = 484600;
  const evTotalWithServiceMonthly = costMonthly + 25200; // listrik + estimasi servis bulanan
  const savingsMonthly = Math.max(0, bbmBenchmarkMonthly - evTotalWithServiceMonthly);
  const savingsPct = Math.round((savingsMonthly / bbmBenchmarkMonthly) * 100);

  const homePct = Number(homeChargingPercentage) || 85;

  return (
    <AppShell>
      <div className="max-w-[1180px]">
        {/* Header (Figma F07) */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Simulator Konsumsi Energi EV
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Berapa kWh dan rupiah yang Anda butuhkan tiap bulan, dibandingkan dengan BBM.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Grid 2 Kolom (Figma F07) */}
        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          {/* Kolom Kiri: Form Parameter F07 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runCalc();
            }}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            noValidate
          >
            {/* Unit EV Dropdown */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-800">
                Unit EV
              </label>
              <select
                value={selectedEvId}
                onChange={(e) => handleSelectEv(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                {evModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.modelName} · {m.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Jarak per hari */}
            <div className="mt-5">
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

            {/* Porsi charging rumah */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Porsi charging rumah
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
                value={homeChargingPercentage}
                onChange={(e) => {
                  setHomeChargingPercentage(e.target.value);
                  runCalc({ homeChargingPercentage: Number(e.target.value) });
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Sisanya di SPKLU ({formatRupiah(Number(spkluTariffPerKwh))}/kWh). PLN {formatRupiah(Number(homeTariffPerKwh))}/kWh.
              </p>
            </div>

            {/* Konsumsi Energi Input Manual */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Efisiensi konsumsi (kWh/100 km)
              </label>
              <input
                type="number"
                step="0.1"
                value={consumptionKwh100km}
                onChange={(e) => {
                  setConsumptionKwh100km(e.target.value);
                  runCalc({ consumptionKwh100km: Number(e.target.value) });
                }}
                className="h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs num focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-6 flex h-9 w-full items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              {loading ? "Menghitung..." : "Perbarui Simulasi"}
            </button>
          </form>

          {/* Kolom Kanan: 3 Metrik Atas + Komparasi Bulanan + Donut Sumber Charging (Figma F07) */}
          <div className="space-y-6">
            {/* Top 3 Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: Konsumsi energi */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Konsumsi energi</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatNumberId(monthlyKwh, 1)} kWh/bulan
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {consumptionKwh100km} kWh/100 km
                </span>
              </div>

              {/* Card 2: Biaya listrik */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs text-slate-500">Biaya listrik</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatRupiah(costMonthly)}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatRupiah(costPerKm)}/km
                </span>
              </div>

              {/* Card 3: Hemat vs BBM */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Hemat vs BBM</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {savingsPct}%
                  </span>
                </div>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-[#059669]">
                  {formatRupiah(savingsMonthly)}
                </p>
                <span className="mt-1 block text-xs text-emerald-700">
                  per bulan vs motor BBM
                </span>
              </div>
            </div>

            {/* Middle Card: Komparasi Biaya Bulanan (Vertical Bar Proportions F07) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Komparasi biaya bulanan
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                BBM + servis vs listrik + servis
              </p>

              <div className="mt-6 flex items-end justify-center gap-12 pb-4">
                {/* Bar BBM */}
                <div className="flex w-44 flex-col items-center">
                  <span className="num mb-2 text-xs font-bold text-slate-900">
                    {formatRupiah(bbmBenchmarkMonthly)}
                  </span>
                  <div className="h-28 w-full rounded-2xl bg-[#94A3B8]" />
                  <span className="mt-2 text-center text-xs font-semibold text-slate-500">
                    BBM · Honda Vario 125
                  </span>
                </div>

                {/* Bar EV */}
                <div className="flex w-44 flex-col items-center">
                  <span className="num mb-2 text-xs font-bold text-[#2563EB]">
                    {formatRupiah(evTotalWithServiceMonthly)}
                  </span>
                  <div className="h-10 w-full rounded-2xl bg-[#2563EB]" />
                  <span className="mt-2 text-center text-xs font-semibold text-[#2563EB]">
                    {selectedModel?.modelName || "Fox-R"} · listrik
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Card: Sumber Charging + SVG Donut Chart (F07) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Sumber charging
              </h3>

              <div className="mt-6 flex flex-col items-center justify-around gap-6 sm:flex-row">
                {/* SVG Donut Chart 85% */}
                <div className="relative grid h-40 w-40 place-items-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#1E40AF"
                      strokeWidth="14"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#2563EB"
                      strokeWidth="14"
                      strokeDasharray={`${homePct * 2.38} 238`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="num font-heading text-xl font-extrabold text-slate-900">
                      {homePct}%
                    </p>
                    <p className="text-[10px] text-slate-400">rumah</p>
                  </div>
                </div>

                {/* Legend List */}
                <div className="w-full max-w-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#2563EB]" />
                      <span className="text-slate-700">Charging rumah ({homePct}%)</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(homeCost)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#1E40AF]" />
                      <span className="text-slate-700">SPKLU publik ({100 - homePct}%)</span>
                    </div>
                    <span className="num font-bold text-slate-900">{formatRupiah(spkluCost)}</span>
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
