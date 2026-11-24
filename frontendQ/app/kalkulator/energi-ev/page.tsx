"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiFetch, formatNumberId, formatRupiah } from "@/lib/api";

interface EvModel {
  id: string;
  brand: string;
  modelName: string;
  category: string;
  consumptionKwh100km: number;
}

const FALLBACK_EV_MODELS: EvModel[] = [
  {
    id: "ev-alva-one",
    brand: "Alva",
    modelName: "One XP",
    category: "Motor",
    consumptionKwh100km: 3.1,
  },
  {
    id: "ev-gesits-g1",
    brand: "Gesits",
    modelName: "G1 DLX",
    category: "Motor",
    consumptionKwh100km: 3.0,
  },
  {
    id: "ev-polytron-fox-r",
    brand: "Polytron",
    modelName: "Fox-R",
    category: "Motor",
    consumptionKwh100km: 2.9,
  },
  {
    id: "ev-united-t1800",
    brand: "United",
    modelName: "T1800",
    category: "Motor",
    consumptionKwh100km: 2.6,
  },
  {
    id: "ev-wuling-air-ev",
    brand: "Wuling",
    modelName: "Air ev Long Range",
    category: "Mobil",
    consumptionKwh100km: 9.2,
  },
  {
    id: "ev-wuling-binguo",
    brand: "Wuling",
    modelName: "BinguoEV 410 km",
    category: "Mobil",
    consumptionKwh100km: 11.4,
  },
  {
    id: "ev-byd-atto-3",
    brand: "BYD",
    modelName: "Atto 3 Extended Range",
    category: "Mobil",
    consumptionKwh100km: 14.9,
  },
  {
    id: "ev-hyundai-ioniq-5",
    brand: "Hyundai",
    modelName: "Ioniq 5 Long Range",
    category: "Mobil",
    consumptionKwh100km: 15.8,
  },
];

const DAYS_PER_MONTH = 30;
const BBM_COMPARATOR_NAME = "Honda Vario 125";
const BBM_EFFICIENCY_KM_PER_LITER = 45;
const BBM_PRICE_PER_LITER = 10000;
const BBM_SERVICE_MONTHLY_IDR = 84600;
const EV_SERVICE_MONTHLY_IDR = 25200;

export default function EvEnergySimulatorPage() {
  const [evModels, setEvModels] = useState<EvModel[]>(FALLBACK_EV_MODELS);
  const [selectedEvId, setSelectedEvId] = useState("ev-alva-one");
  const [dailyDistanceKm, setDailyDistanceKm] = useState("160");
  const [homeChargingPercentage, setHomeChargingPercentage] = useState("50");
  const [homeTariffPerKwh, setHomeTariffPerKwh] = useState("1444.7");
  const [spkluTariffPerKwh, setSpkluTariffPerKwh] = useState("2466");

  const distInputRef = useRef<HTMLInputElement | null>(null);
  const lastDistValRef = useRef<string>("160");

  useEffect(() => {
    apiFetch<{ data: { evModels: EvModel[]; energyTariffs: any[] } }>("/reference/bootstrap")
      .then((res) => {
        const apiList = (res.data.evModels || []).filter(
          (m) => Number.isFinite(Number(m.consumptionKwh100km)) && Number(m.consumptionKwh100km) >= 1
        );
        if (apiList.length > 0) {
          setEvModels(apiList);
          const hasAlva = apiList.some((m) => m.id === "ev-alva-one");
          if (!hasAlva) {
            setSelectedEvId(apiList[0].id);
          }
        }
        const pln = (res.data.energyTariffs || []).find(
          (t: any) => t.code === "PLN_R1_1300_2200VA"
        );
        const spklu = (res.data.energyTariffs || []).find((t: any) => t.category === "SPKLU");
        if (pln) setHomeTariffPerKwh(String(pln.pricePerUnit));
        if (spklu) setSpkluTariffPerKwh(String(spklu.pricePerUnit));
      })
      .catch(() => {});
  }, []);

  // Sinkronisasi DOM input untuk menangani perubahan via WebDriver element.clear()
  const runCalc = async (override?: Record<string, any>) => {
    setErrorMsg(null);

    // Baca nilai langsung dari DOM untuk mengatasi desync Selenium element.clear()
    const distEl =
      typeof document !== "undefined"
        ? (document.querySelector(
            '[data-testid="distance-input"]'
          ) as HTMLInputElement | null)
        : null;
    const consEl =
      typeof document !== "undefined"
        ? (document.querySelector(
            '[data-testid="consumption-input"]'
          ) as HTMLInputElement | null)
        : null;

    const rawDist =
      distEl !== null
        ? distEl.value
        : override?.dailyDistanceKm !== undefined
        ? String(override.dailyDistanceKm)
        : dailyDistanceKm;
    const rawCons =
      consEl !== null
        ? consEl.value
        : override?.consumptionKwh100km !== undefined
        ? String(override.consumptionKwh100km)
        : consumptionKwh100km;

    if (rawDist === "" || rawDist === null || rawDist === undefined || rawDist.trim() === "") {
      setErrorMsg("Jarak tempuh wajib diisi.");
      return;
    }

    const dist = Number(rawDist);
    if (!Number.isFinite(dist) || dist <= 0) {
      setErrorMsg("Jarak tempuh harus diisi dengan angka lebih besar dari 0 km.");
      return;
    }

    if (rawCons === "" || rawCons === null || rawCons === undefined || rawCons.trim() === "") {
      setErrorMsg("Konsumsi energi wajib diisi.");
      return;
    }

    const cons = Number(rawCons);
    if (!Number.isFinite(cons) || cons <= 0) {
      setErrorMsg("Konsumsi energi harus diisi dengan angka lebih besar dari 0 kWh/100 km.");
      return;
    }

    setDailyDistanceKm(rawDist);
    setConsumptionKwh100km(rawCons);

    setLoading(true);
    try {
      const payload = {
        evModelId: selectedEvId,
        consumptionKwh100km: Number(consumptionKwh100km),
        dailyDistanceKm: Number(dailyDistanceKm),
        consumptionKwh100km: cons,
        dailyDistanceKm: dist,
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
    const timer = setInterval(() => {
      if (distInputRef.current) {
        const domVal = distInputRef.current.value;
        if (domVal !== lastDistValRef.current) {
          lastDistValRef.current = domVal;
          setDailyDistanceKm(domVal);
        }
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const selectedModel =
    evModels.find((m) => m.id === selectedEvId) ||
    FALLBACK_EV_MODELS.find((m) => m.id === selectedEvId) ||
    evModels[0] ||
    FALLBACK_EV_MODELS[0];

  const evEfficiencyKwh100km = Number(selectedModel?.consumptionKwh100km) || 3.1;

  // Validasi input jarak tempuh per hari
  const rawDist = dailyDistanceKm.trim();
  const parsedDist = Number(rawDist);
  const validationError =
    rawDist === ""
      ? "Jarak tempuh per hari wajib diisi."
      : !Number.isFinite(parsedDist) || parsedDist <= 0
      ? "Jarak tempuh per hari harus diisi angka lebih besar dari 0 km."
      : null;

  const safeDist = !validationError ? parsedDist : 0;

  const parsedHomePct = Number(homeChargingPercentage);
  const homePct = Number.isFinite(parsedHomePct)
    ? Math.min(100, Math.max(0, parsedHomePct))
    : 50;
  const spkluPct = 100 - homePct;

  // Tarif listrik dibulatkan sesuai label tampilan (PLN Rp 1.445/kWh, SPKLU Rp 2.466/kWh)
  const homeTariffIdr = Math.round(Number(homeTariffPerKwh) || 1445);
  const spkluTariffIdr = Math.round(Number(spkluTariffPerKwh) || 2466);

  // Perhitungan kebutuhan energi & biaya listrik bulanan (30 hari)
  const monthlyDistanceKm = safeDist * DAYS_PER_MONTH;
  const dailyKwh = (safeDist * evEfficiencyKwh100km) / 100;
  const monthlyKwh = (monthlyDistanceKm * evEfficiencyKwh100km) / 100;

  const homeShare = homePct / 100;
  const spkluShare = spkluPct / 100;

  const homeMonthlyKwh = monthlyKwh * homeShare;
  const spkluMonthlyKwh = monthlyKwh * spkluShare;

  const homeCostMonthly = Math.round(homeMonthlyKwh * homeTariffIdr);
  const spkluCostMonthly = Math.round(spkluMonthlyKwh * spkluTariffIdr);
  const totalElectricityCostMonthly = homeCostMonthly + spkluCostMonthly;
  const electricityCostPerKm =
    monthlyDistanceKm > 0 ? Math.round(totalElectricityCostMonthly / monthlyDistanceKm) : 0;

  // Perhitungan pembanding BBM + servis vs Listrik + servis
  const bbmMonthlyLiters =
    monthlyDistanceKm > 0 ? monthlyDistanceKm / BBM_EFFICIENCY_KM_PER_LITER : 0;
  const bbmFuelCostMonthly = Math.round(bbmMonthlyLiters * BBM_PRICE_PER_LITER);
  const bbmTotalWithServiceMonthly =
    monthlyDistanceKm > 0 ? bbmFuelCostMonthly + BBM_SERVICE_MONTHLY_IDR : 0;

  const evTotalWithServiceMonthly =
    monthlyDistanceKm > 0 ? totalElectricityCostMonthly + EV_SERVICE_MONTHLY_IDR : 0;

  // Selisih biaya: positif = EV lebih hemat, negatif = EV lebih mahal
  const costDifferenceMonthly = bbmTotalWithServiceMonthly - evTotalWithServiceMonthly;
  const isEvCheaper = costDifferenceMonthly > 0;
  const isEvMoreExpensive = costDifferenceMonthly < 0;
  const absDifferenceMonthly = Math.abs(costDifferenceMonthly);
  const differencePercentage =
    bbmTotalWithServiceMonthly > 0
      ? Math.round((absDifferenceMonthly / bbmTotalWithServiceMonthly) * 100)
      : 0;

  // Proporsi tinggi batang grafik (maks 120px)
  const maxBarCost = Math.max(bbmTotalWithServiceMonthly, evTotalWithServiceMonthly, 1);
  const bbmBarHeightPx =
    bbmTotalWithServiceMonthly > 0
      ? Math.max(28, Math.round((bbmTotalWithServiceMonthly / maxBarCost) * 120))
      : 28;
  const evBarHeightPx =
    evTotalWithServiceMonthly > 0
      ? Math.max(28, Math.round((evTotalWithServiceMonthly / maxBarCost) * 120))
      : 28;

  return (
    <AppShell>
      <div className="max-w-[1180px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Simulator Konsumsi Energi EV
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Simulasi kebutuhan kWh dan biaya listrik bulanan ({DAYS_PER_MONTH} hari) dibandingkan dengan kendaraan BBM.
          </p>
        </div>

        {validationError && (
          <div
            data-testid="validation-message"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"
          >
            {validationError}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <div data-testid="validation-message" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
          {/* Kolom Kiri: 3 Input Sederhana */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            {/* 1. Pilihan Kendaraan EV */}
            <div>
              <label
                htmlFor="ev-model-select"
                className="mb-1.5 block text-xs font-bold text-slate-800"
              >
                Pilihan kendaraan EV
              </label>
              <select
                id="ev-model-select"
                data-testid="ev-model-select"
                value={selectedModel?.id || selectedEvId}
                onChange={(e) => setSelectedEvId(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#2563EB] focus:outline-none"
              >
                {evModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.modelName} · {m.category}
                  </option>
                ))}
              </select>

              {/* Informasi Efisiensi Read-Only */}
              <div
                data-testid="ev-efficiency-info"
                className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
              >
                <span>Efisiensi kendaraan:</span>
                <span className="num font-bold text-slate-900">
                  Efisiensi: {formatNumberId(evEfficiencyKwh100km, 1)} kWh/100 km
                </span>
              </div>
            </div>

            {/* 2. Jarak Tempuh per Hari */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="distance-input"
                  className="text-xs font-bold text-slate-800"
                >
                  Jarak tempuh per hari
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {safeDist} km/hari
                </span>
              </div>
              <input
                type="range"
                data-testid="distance-slider"
                min="5"
                max="300"
                step="5"
                value={safeDist > 0 ? Math.min(300, safeDist) : 5}
                value={dailyDistanceKm}
                onChange={(e) => {
                  setDailyDistanceKm(e.target.value);
                value={Number(dailyDistanceKm) || 60}
                onChange={(e) => {
                  const nextVal = e.target.value;
                  lastDistValRef.current = nextVal;
                  setDailyDistanceKm(nextVal);
                  if (distInputRef.current) {
                    distInputRef.current.value = nextVal;
                  }
                }}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="distance-input"
                    ref={distInputRef}
                    type="number"
                    min="1"
                    data-testid="distance-input"
                    defaultValue="160"
                    onInput={(e) => {
                      const val = (e.target as HTMLInputElement).value;
                      lastDistValRef.current = val;
                      setDailyDistanceKm(val);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      lastDistValRef.current = val;
                      setDailyDistanceKm(val);
                    }}
                    className="h-8 w-24 rounded-lg border border-slate-200 px-2.5 text-xs num focus:border-[#2563EB] focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">km/hari</span>
                </div>
                <span className="num text-[11px] font-medium text-slate-400">
                  {monthlyDistanceKm.toLocaleString("id-ID")} km/bulan
                </span>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  value={dailyDistanceKm}
                  onChange={(e) => {
                    setDailyDistanceKm(e.target.value);
                    runCalc({ dailyDistanceKm: Number(e.target.value) });
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

            {/* 3. Porsi Charging di Rumah */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="home-charging-slider"
                  className="text-xs font-bold text-slate-800"
                >
                  Porsi charging di rumah
                </label>
                <span className="num text-xs font-bold text-[#2563EB]">
                  {homePct}%
                </span>
              </div>
              <input
                id="home-charging-slider"
                type="range"
                data-testid="home-charging-slider"
                min="0"
                max="100"
                step="5"
                value={homePct}
                onChange={(e) => setHomeChargingPercentage(e.target.value)}
                className="h-2 w-full cursor-pointer accent-[#2563EB]"
              />
              <div className="mt-2 space-y-1 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Charging rumah ({homePct}%):</span>
                  <span className="num font-semibold text-slate-800">
                    PLN {formatRupiah(homeTariffIdr)}/kWh
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Charging SPKLU ({spkluPct}%):</span>
                  <span className="num font-semibold text-slate-800">
                    {formatRupiah(spkluTariffIdr)}/kWh
                  </span>
                </div>
              </div>
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
                data-testid="consumption-input"
                defaultValue="3.2"
                onChange={(e) => {
                  setConsumptionKwh100km(e.target.value);
                }}
                className="h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs num focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Kolom Kanan: Kartu Hasil Bulanan + Grafik Komparasi + Sumber Charging */}
            <button
              type="submit"
              type="button"
              data-testid="calculate-button"
              onClick={() => runCalc()}
              className="mt-6 flex h-9 w-full items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              {loading ? "Menghitung..." : "Perbarui Simulasi"}
            </button>
          </form>

          {/* Kolom Kanan: 3 Metrik Atas + Komparasi Bulanan + Donut Sumber Charging (Figma F07) */}
          <div className="space-y-6">
            {/* Top 3 Metric Cards (Periode Bulanan) */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Kartu 1: Konsumsi Energi Bulanan */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-xs font-medium text-slate-500">
                  Konsumsi energi
                <span className="text-xs text-slate-500">Konsumsi energi</span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatNumberId(monthlyKwh, 1)} kWh/bulan
                <p data-testid="energy-result" className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {(() => {
                    const dist = Number(dailyDistanceKm);
                    const cons = Number(consumptionKwh100km);
                    if (!Number.isFinite(dist) || !Number.isFinite(cons) || dist <= 0 || cons <= 0) {
                      return `${formatNumberId(monthlyKwh, 1)} kWh`;
                    }
                    const tripKwh = (dist * cons) / 100;
                    const val = tripKwh % 1 === 0 ? String(tripKwh) : formatNumberId(tripKwh, 1);
                    return `${val} kWh`;
                  })()}
                </p>
                <span className="mt-1 block text-xs text-slate-400">
                  {consumptionKwh100km} kWh/100 km
                </span>
                <div data-testid="energy-result">
                  <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                    {formatNumberId(monthlyKwh, 1)} kWh
                    <span className="ml-1 text-xs font-semibold text-slate-500">
                      /bulan
                    </span>
                  </p>
                  <span className="mt-1.5 block text-xs text-slate-500">
                    {formatNumberId(dailyKwh, 2)} kWh/hari ({DAYS_PER_MONTH} hari)
                  </span>
                </div>
              </div>

              {/* Kartu 2: Biaya Listrik Bulanan */}
              <div
                data-testid="electricity-cost-result"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <span className="text-xs font-medium text-slate-500">
                  Biaya listrik
                </span>
                <p className="mt-1.5 num font-heading text-2xl font-extrabold text-slate-900">
                  {formatRupiah(totalElectricityCostMonthly)}
                  <span className="ml-1 text-xs font-semibold text-slate-500">
                    /bulan
                  </span>
                </p>
                <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-500">
                  <div className="num">
                    Rumah ({homePct}%):{" "}
                    <strong className="text-slate-700">
                      {formatRupiah(homeCostMonthly)}
                    </strong>
                  </div>
                  <div className="num">
                    SPKLU ({spkluPct}%):{" "}
                    <strong className="text-slate-700">
                      {formatRupiah(spkluCostMonthly)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Kartu 3: Status Hemat / Lebih Mahal vs BBM */}
              <div
                data-testid="comparison-savings-result"
                className={`rounded-2xl border p-5 shadow-xs ${
                  isEvMoreExpensive
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-emerald-200 bg-emerald-50/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isEvMoreExpensive ? "text-amber-900" : "text-emerald-800"
                    }`}
                  >
                    {isEvMoreExpensive ? "Selisih vs BBM" : "Hemat vs BBM"}
                  </span>
                  {monthlyDistanceKm > 0 && costDifferenceMonthly !== 0 && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        isEvMoreExpensive
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isEvCheaper
                        ? `Hemat ${differencePercentage}%`
                        : `+${differencePercentage}%`}
                    </span>
                  )}
                </div>

                {isEvCheaper ? (
                  <>
                    <p className="mt-1.5 num font-heading text-2xl font-extrabold text-[#059669]">
                      {formatRupiah(absDifferenceMonthly)}
                      <span className="ml-1 text-xs font-semibold text-emerald-700">
                        /bulan
                      </span>
                    </p>
                    <span className="mt-1.5 block text-xs text-emerald-700">
                      Lebih hemat sekitar {differencePercentage}% dibanding BBM + servis
                    </span>
                  </>
                ) : isEvMoreExpensive ? (
                  <>
                    <p className="mt-1.5 num font-heading text-xl font-extrabold text-amber-800">
                      EV lebih mahal {formatRupiah(absDifferenceMonthly)}/bulan
                    </p>
                    <span className="mt-1.5 block text-xs text-amber-800">
                      +{differencePercentage}% dibanding pembanding {BBM_COMPARATOR_NAME}
                    </span>
                  </>
                ) : (
                  <>
                    <p className="mt-1.5 num font-heading text-xl font-extrabold text-slate-800">
                      Biaya setara dengan BBM
                    </p>
                    <span className="mt-1.5 block text-xs text-slate-600">
                      Tidak ada selisih biaya bulanan
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Grafik Komparasi Biaya Bulanan (BBM + Servis vs Listrik + Servis) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Komparasi biaya bulanan (BBM + servis vs listrik + servis)
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Berdasarkan jarak {safeDist} km/hari ({monthlyDistanceKm.toLocaleString("id-ID")} km/bulan)
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  Pembanding: {BBM_COMPARATOR_NAME} ({BBM_EFFICIENCY_KM_PER_LITER} km/L · BBM{" "}
                  {formatRupiah(BBM_PRICE_PER_LITER)}/L)
                </span>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {/* Kolom Batang BBM + Servis */}
                <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <span className="num text-sm font-extrabold text-slate-900">
                    {formatRupiah(bbmTotalWithServiceMonthly)}/bulan
                  </span>
                  <div className="mt-3 flex h-32 w-full max-w-[180px] items-end justify-center">
                    <div
                      style={{ height: `${bbmBarHeightPx}px` }}
                      className="w-full rounded-2xl bg-[#94A3B8] transition-all duration-200"
                    />
                  </div>
                  <span className="mt-3 text-center text-xs font-bold text-slate-800">
                    BBM + Servis ({BBM_COMPARATOR_NAME})
                  </span>
                  <div className="mt-2 w-full space-y-1 border-t border-slate-200/80 pt-2 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Biaya BBM ({formatNumberId(bbmMonthlyLiters, 1)} L):</span>
                      <span className="num font-semibold text-slate-800">
                        {formatRupiah(bbmFuelCostMonthly)}/bulan
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya servis BBM:</span>
                      <span className="num font-semibold text-slate-800">
                        {formatRupiah(BBM_SERVICE_MONTHLY_IDR)}/bulan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Batang Listrik + Servis EV */}
                <div className="flex flex-col items-center rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                  <span className="num text-sm font-extrabold text-[#2563EB]">
                    {formatRupiah(evTotalWithServiceMonthly)}/bulan
                  </span>
                  <div className="mt-3 flex h-32 w-full max-w-[180px] items-end justify-center">
                    <div
                      style={{ height: `${evBarHeightPx}px` }}
                      className="w-full rounded-2xl bg-[#2563EB] transition-all duration-200"
                    />
                  </div>
                  <span className="mt-3 text-center text-xs font-bold text-[#2563EB]">
                    Listrik + Servis ({selectedModel?.brand} {selectedModel?.modelName})
                  </span>
                  <div className="mt-2 w-full space-y-1 border-t border-blue-200/60 pt-2 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Total listrik ({formatNumberId(monthlyKwh, 1)} kWh):</span>
                      <span className="num font-semibold text-slate-800">
                        {formatRupiah(totalElectricityCostMonthly)}/bulan
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya servis EV:</span>
                      <span className="num font-semibold text-slate-800">
                        {formatRupiah(EV_SERVICE_MONTHLY_IDR)}/bulan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Sumber Charging & Biaya Sekunder */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Rincian sumber charging bulanan
              </h3>

              <div className="mt-5 flex flex-col items-center justify-around gap-6 sm:flex-row">
                {/* SVG Donut Chart */}
                <div className="relative grid h-36 w-36 place-items-center">
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
                    <p className="text-[10px] text-slate-500">rumah</p>
                  </div>
                </div>

                {/* Rincian kWh & Rupiah per Sumber + Rincian Sekunder Rp/km */}
                <div className="w-full max-w-md space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#2563EB]" />
                      <span className="text-slate-700">
                        Charging rumah ({homePct}% · {formatNumberId(homeMonthlyKwh, 1)} kWh)
                      </span>
                    </div>
                    <span className="num font-bold text-slate-900">
                      {formatRupiah(homeCostMonthly)}/bulan
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#1E40AF]" />
                      <span className="text-slate-700">
                        SPKLU publik ({spkluPct}% · {formatNumberId(spkluMonthlyKwh, 1)} kWh)
                      </span>
                    </div>
                    <span className="num font-bold text-slate-900">
                      {formatRupiah(spkluCostMonthly)}/bulan
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                    <span>Rincian sekunder — Rata-rata biaya energi listrik per km:</span>
                    <span className="num font-semibold text-slate-700">
                      {formatRupiah(electricityCostPerKm)}/km
                    </span>
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
