"use client";

import React, { useState } from "react";
import { calculateEvEnergy } from "@/lib/calculations/ev";
import {
  EV_SAMPLE_PRESETS,
  PLN_TARIFF_REFERENCES,
  type EvPreset,
} from "@/lib/data/reference-data";
import { formatIdr, formatNumber } from "@/lib/format";

export function EvCalculatorForm() {
  // Preset model EV aktif (default: Polytron Fox-R seperti di Figma Screen 09)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("fox-r");
  const [customConsumption, setCustomConsumption] = useState<string>("15");

  // Kontrol Slider reaktif persis Figma (nilai awal jarak 60 km/hari)
  const [dailyDistanceKm, setDailyDistanceKm] = useState<number>(60);
  const [homeChargingPct, setHomeChargingPct] = useState<number>(85);

  // ponytail: hitung posisi fill track (--p) deklaratif dari state dengan offset thumb 22px
  const distRatio = Math.min(1, Math.max(0, (dailyDistanceKm - 5) / (150 - 5)));
  const distFillStyle = {
    "--p": `calc(${distRatio * 100}% + ${(0.5 - distRatio) * 22}px)`,
  } as React.CSSProperties;

  const homeRatio = Math.min(1, Math.max(0, homeChargingPct / 100));
  const homeFillStyle = {
    "--p": `calc(${homeRatio * 100}% + ${(0.5 - homeRatio) * 22}px)`,
  } as React.CSSProperties;

  // Parameter tarif listrik
  const [homeTariff, setHomeTariff] = useState<number>(1444.7);
  const [spkluTariff, setSpkluTariff] = useState<number>(2466);
  const [showAdvancedTariff, setShowAdvancedTariff] = useState<boolean>(false);

  // Ambil data preset aktif
  const currentPreset: EvPreset | undefined = EV_SAMPLE_PRESETS.find(
    (p) => p.id === selectedPresetId
  );

  const effectiveConsumption =
    selectedPresetId === "custom"
      ? parseFloat(customConsumption) || 15
      : currentPreset
      ? currentPreset.consumptionKwh100km
      : 3.2;

  // Jalankan fungsi perhitungan resmi KEL2-67
  const calcResult = calculateEvEnergy({
    consumptionKwh100km: effectiveConsumption,
    dailyDistanceKm: dailyDistanceKm,
    homeChargingPercentage: homeChargingPct,
    homeTariffPerKwh: homeTariff,
    spkluTariffPerKwh: spkluTariff,
  });

  const calculationData = calcResult.ok ? calcResult.data : null;

  // Benchmark kendaraan BBM pembanding (persis model Figma)
  const isMotor = currentPreset
    ? currentPreset.vehicleType === "Motor"
    : effectiveConsumption < 8;

  const iceName = currentPreset?.iceName || (isMotor ? "Honda Vario 125" : "Toyota Avanza");
  const iceKmL = currentPreset?.iceKmL || (isMotor ? 48 : 13);
  const bbmPricePerLiter = 10000; // Pertalite acuan resmi per liter

  const monthlyKm = dailyDistanceKm * 30;
  const bbmMonthlyCost = Math.round((monthlyKm / iceKmL) * bbmPricePerLiter);
  const evMonthlyCost = calculationData ? calculationData.totalCostMonthly : 0;
  const savingsMonthly = Math.max(0, bbmMonthlyCost - evMonthlyCost);
  const savingsPercent =
    bbmMonthlyCost > 0 ? Math.round((savingsMonthly / bbmMonthlyCost) * 100) : 0;

  // Bar chart normalization
  const maxBarValue = Math.max(bbmMonthlyCost, evMonthlyCost, 1);
  const bbmBarPercent = (bbmMonthlyCost / maxBarValue) * 100;
  const evBarPercent = (evMonthlyCost / maxBarValue) * 100;

  // Donut chart SVG geometry (radius 44, circumference 276.46)
  const circumference = 2 * Math.PI * 44;
  const homeDash = (homeChargingPct / 100) * circumference;
  const spkluDash = circumference - homeDash;

  return (
    <div className="grid items-start gap-5 @5xl:grid-cols-[360px_minmax(0,1fr)]">
      {/* ============================================================== */}
      {/* KOLOM KIRI: Form Input & Kontrol Parameter Kendaraan           */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-6 @5xl:sticky @5xl:top-24">
        {/* Input 1: Dropdown Unit EV */}
        <div>
          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold text-ink">
              Unit EV
            </span>
            <div className="relative">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-line bg-white pl-3.5 pr-10 text-sm text-ink transition hover:border-slate-300 focus:border-electric focus:outline-none"
              >
                <optgroup label="Motor Listrik">
                  {EV_SAMPLE_PRESETS.filter((p) => p.vehicleType === "Motor").map(
                    (p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.consumptionKwh100km} kWh/100 km)
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="Mobil Listrik">
                  {EV_SAMPLE_PRESETS.filter((p) => p.vehicleType === "Mobil").map(
                    (p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.consumptionKwh100km} kWh/100 km)
                      </option>
                    )
                  )}
                </optgroup>
                <option value="custom">Kustom (Input Efisiensi Sendiri)</option>
              </select>
              <svg
                width="16"
                height="16"
                style={{ width: 16, height: 16 }}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mute"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </label>

          {/* Input Kustom jika user memilih Kustom */}
          {selectedPresetId === "custom" && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Konsumsi Energi (kWh / 100 km):
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={customConsumption}
                onChange={(e) => setCustomConsumption(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink focus:border-electric focus:outline-none"
                placeholder="Misal: 12.5"
              />
            </div>
          )}
        </div>

        {/* Input 2: Slider Jarak per hari */}
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-ink">
              Jarak per hari
            </span>
            <span className="num text-sm font-bold text-brand">
              {dailyDistanceKm} km
            </span>
          </div>
          <input
            type="range"
            aria-label="Jarak per hari"
            min={5}
            max={150}
            step={5}
            value={dailyDistanceKm}
            onChange={(e) => setDailyDistanceKm(Number(e.target.value))}
            style={distFillStyle}
            className="block w-full cursor-pointer"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-mute">
            <span>5 km</span>
            <span>150 km</span>
          </div>
        </div>

        {/* Input 3: Slider Porsi charging di rumah */}
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-ink">
              Porsi charging di rumah
            </span>
            <span className="num text-sm font-bold text-brand">
              {homeChargingPct}%
            </span>
          </div>
          <input
            type="range"
            aria-label="Porsi charging di rumah"
            min={0}
            max={100}
            step={5}
            value={homeChargingPct}
            onChange={(e) => setHomeChargingPct(Number(e.target.value))}
            style={homeFillStyle}
            className="block w-full cursor-pointer"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-mute">
            <span>0%</span>
            <span>100%</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            Sisanya di SPKLU ({formatIdr(spkluTariff)}/kWh). Rumah{" "}
            {formatIdr(homeTariff)}/kWh.
          </p>
        </div>

        {/* Pengaturan Tambahan Tarif Listrik (Collapsible) */}
        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setShowAdvancedTariff(!showAdvancedTariff)}
            className="flex w-full items-center justify-between text-xs font-semibold text-mute hover:text-electric"
          >
            <span>Sesuaikan Golongan Tarif PLN</span>
            <svg
              width="14"
              height="14"
              style={{ width: 14, height: 14 }}
              className={`transition-transform ${showAdvancedTariff ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showAdvancedTariff && (
            <div className="mt-3 space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-mute mb-1">
                  Pilih Golongan PLN Rumah:
                </label>
                <select
                  value={homeTariff}
                  onChange={(e) => setHomeTariff(Number(e.target.value))}
                  className="w-full rounded-lg border border-line bg-white p-2 text-xs text-ink"
                >
                  {PLN_TARIFF_REFERENCES.map((t) => (
                    <option key={t.id} value={t.tariffPerKwh}>
                      {t.label} (Rp {formatNumber(t.tariffPerKwh, 2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-mute mb-1">
                  Tarif SPKLU (Rp / kWh):
                </label>
                <input
                  type="number"
                  value={spkluTariff}
                  onChange={(e) => setSpkluTariff(Number(e.target.value))}
                  className="w-full rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* KOLOM KANAN: Hasil Metrik, Komparasi, & Sumber Charging        */}
      {/* ============================================================== */}
      <div className="space-y-5">
        {/* 1. Baris 3 Kartu Metrik Persis Figma Screen 09 */}
        <div className="grid gap-4 @3xl:grid-cols-3">
          {/* Kartu 1: Konsumsi energi */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-mute">
                Konsumsi energi
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-tint text-electric">
                <svg
                  width="18"
                  height="18"
                  style={{ width: 18, height: 18 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="num text-2xl font-extrabold text-ink">
                  {calculationData
                    ? formatNumber(calculationData.monthlyKwh, 1)
                    : "-"}
                </span>
                <span className="text-xs font-semibold text-mute">
                  kWh/bulan
                </span>
              </div>
              <p className="mt-1 text-xs text-mute">
                {formatNumber(effectiveConsumption, 1)} kWh/100 km
              </p>
            </div>
          </div>

          {/* Kartu 2: Biaya listrik */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-mute">
                Biaya listrik
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="num text-2xl font-extrabold text-ink">
                  {calculationData
                    ? formatIdr(calculationData.totalCostMonthly)
                    : "-"}
                </span>
              </div>
              <p className="mt-1 text-xs text-mute">
                {calculationData
                  ? `${formatIdr(calculationData.costPerKm)}/km`
                  : "-"}
              </p>
            </div>
          </div>

          {/* Kartu 3: Hemat vs BBM */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-mute">
                Hemat vs BBM
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-ok">
                {savingsPercent}%
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="num text-2xl font-extrabold text-ok">
                  {formatIdr(savingsMonthly)}
                </span>
              </div>
              <p className="mt-1 text-xs text-mute">
                vs {iceName} ({formatIdr(bbmMonthlyCost)}/bln)
              </p>
            </div>
          </div>
        </div>

        {/* 2. Kartu Komparasi Biaya Bulanan (Figma Bar Chart Component ar) */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">
                Komparasi biaya bulanan
              </h3>
              <p className="mt-0.5 text-[13px] text-mute">
                BBM vs listrik ({dailyDistanceKm} km/hari &middot; {monthlyKm} km/bulan)
              </p>
            </div>
          </div>

          <div className="flex items-end justify-center gap-12 pt-4 pb-2" style={{ height: 210 }}>
            {/* Bar BBM */}
            <div className="flex flex-1 max-w-[160px] flex-col items-center justify-end h-full">
              <span className="num mb-2 text-sm font-extrabold text-ink">
                {formatIdr(bbmMonthlyCost)}
              </span>
              <div
                className="w-full rounded-t-xl bg-slate-400 transition-all duration-300"
                style={{ height: `${Math.max(12, bbmBarPercent)}%` }}
              />
              <span className="mt-3 block text-center text-xs font-semibold text-mute">
                BBM &middot; {iceName}
              </span>
            </div>

            {/* Bar Listrik EV */}
            <div className="flex flex-1 max-w-[160px] flex-col items-center justify-end h-full">
              <span className="num mb-2 text-sm font-extrabold text-electric">
                {formatIdr(evMonthlyCost)}
              </span>
              <div
                className="w-full rounded-t-xl bg-electric transition-all duration-300"
                style={{ height: `${Math.max(12, evBarPercent)}%` }}
              />
              <span className="mt-3 block text-center text-xs font-bold text-electric">
                {currentPreset?.name || "EV"} &middot; listrik
              </span>
            </div>
          </div>
        </div>

        {/* 3. Kartu Sumber Charging (Figma Donut Chart Component sr & cr) */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-ink">Sumber charging</h3>
            <p className="mt-0.5 text-[13px] text-mute">
              Proporsi pemakaian energi dan alokasi biaya pengisian bulanan
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 py-2 @3xl:flex-row @3xl:justify-around">
            {/* Donut Chart SVG */}
            <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
              <svg
                viewBox="0 0 120 120"
                width="150"
                height="150"
                role="img"
                aria-label="Grafik donat sumber charging"
                className="-rotate-90"
              >
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="16"
                />
                {/* Home Charging Arc (Biru Terang) */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="16"
                  strokeDasharray={`${Math.max(0, homeDash - 1.5)} ${circumference}`}
                  strokeDashoffset={0}
                  className="transition-all duration-300"
                />
                {/* SPKLU Arc (Biru Gelap) */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="16"
                  strokeDasharray={`${Math.max(0, spkluDash - 1.5)} ${circumference}`}
                  strokeDashoffset={-homeDash}
                  className="transition-all duration-300"
                />
              </svg>
              {/* Teks Persentase Tengah */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="num text-2xl font-extrabold text-ink">
                  {homeChargingPct}%
                </span>
                <span className="text-[10px] font-semibold text-mute uppercase tracking-wider">
                  Rumah
                </span>
              </div>
            </div>

            {/* Legend List (cr) */}
            <ul className="min-w-0 flex-1 space-y-3 w-full max-w-sm">
              <li className="flex items-center justify-between gap-3 text-sm rounded-xl border border-line bg-canvas p-3">
                <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="h-3 w-3 rounded-sm bg-[#2563eb] shrink-0" />
                  Charging rumah ({calculationData?.homeKwh ?? 0} kWh)
                </span>
                <span className="num font-bold text-ink">
                  {calculationData
                    ? formatIdr(calculationData.homeCostMonthly)
                    : "-"}
                </span>
              </li>

              <li className="flex items-center justify-between gap-3 text-sm rounded-xl border border-line bg-canvas p-3">
                <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="h-3 w-3 rounded-sm bg-[#1e3a8a] shrink-0" />
                  SPKLU publik ({calculationData?.spkluKwh ?? 0} kWh)
                </span>
                <span className="num font-bold text-ink">
                  {calculationData
                    ? formatIdr(calculationData.spkluCostMonthly)
                    : "-"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dasar Rujukan Resmi */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs text-xs space-y-2 text-mute">
          <div className="font-bold text-ink">Dasar Rujukan Tarif:</div>
          <p>
            Tarif listrik rumah menggunakan penetapan resmi PLN Triwulan IV 2024
            (R-1/1.300–2.200 VA: Rp 1.444,70/kWh) sesuai{" "}
            <a
              href="https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric underline font-medium"
            >
              Siaran Pers ESDM No. 544/2024
            </a>
            . Tarif SPKLU ({formatIdr(spkluTariff)}/kWh) merupakan nilai contoh
            berdasarkan regulasi{" "}
            <a
              href="https://peraturan.go.id/id/permen-esdm-no-1-tahun-2023"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric underline font-medium"
            >
              Permen ESDM No. 1/2023
            </a>{" "}
            &amp;{" "}
            <a
              href="https://jdih.esdm.go.id/dokumen/view?id=2388"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric underline font-medium"
            >
              Kepmen ESDM No. 182.K/2023
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
