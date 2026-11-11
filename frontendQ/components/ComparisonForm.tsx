"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  calculateComparison,
  type ComparisonCalculationOutput,
  type ComparisonCalculationInput,
} from "@/lib/calculations/comparison";
import type { ValidationErrors } from "@/lib/calculations/ev";
import { fetchComparisonCalculation } from "@/lib/api/calculator";
import {
  EV_SAMPLE_PRESETS,
  ICE_SAMPLE_PRESETS,
  FUEL_PRICE_REFERENCES,
  FUEL_METADATA,
  PLN_TARIFF_REFERENCES,
  type EvPreset,
  type IcePreset,
  type FuelPriceReference,
} from "@/lib/data/reference-data";
import { formatIdr, formatNumber } from "@/lib/format";

export function ComparisonForm() {
  // 1. Parameter Pola Perjalanan (Shared)
  const [dailyDistanceKm, setDailyDistanceKm] = useState<number>(60);

  // 2. Parameter Kendaraan BBM
  const [selectedIceId, setSelectedIceId] = useState<string>("vario-125");
  const [customIceKmL, setCustomIceKmL] = useState<string>("48");
  const [selectedFuelId, setSelectedFuelId] = useState<string>("pertalite");
  const [customFuelPrice, setCustomFuelPrice] = useState<string>("10000");

  // 3. Parameter Kendaraan Listrik (EV)
  const [selectedEvId, setSelectedEvId] = useState<string>("fox-r");
  const [customEvConsumption, setCustomEvConsumption] = useState<string>("3.2");
  const [homeChargingPct, setHomeChargingPct] = useState<number>(85);
  const [homeTariff, setHomeTariff] = useState<number>(1444.7);
  const [spkluTariff, setSpkluTariff] = useState<number>(2466);
  const [showAdvancedTariff, setShowAdvancedTariff] = useState<boolean>(false);

  // Status perhitungan backend dan proteksi race condition
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const requestSeqRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Resolusi data BBM
  const currentIce: IcePreset | undefined = ICE_SAMPLE_PRESETS.find(
    (p) => p.id === selectedIceId
  );
  const effectiveIceKmL =
    selectedIceId === "custom"
      ? parseFloat(customIceKmL) || 0
      : currentIce
      ? currentIce.kmPerLiter
      : 48;

  const currentFuel: FuelPriceReference | undefined = FUEL_PRICE_REFERENCES.find(
    (f) => f.id === selectedFuelId
  );
  const effectiveFuelPrice =
    selectedFuelId === "custom"
      ? parseFloat(customFuelPrice) || 0
      : currentFuel
      ? currentFuel.pricePerLiter
      : 10000;

  // Resolusi data EV
  const currentEv: EvPreset | undefined = EV_SAMPLE_PRESETS.find(
    (p) => p.id === selectedEvId
  );
  const effectiveEvConsumption =
    selectedEvId === "custom"
      ? parseFloat(customEvConsumption) || 0
      : currentEv
      ? currentEv.consumptionKwh100km
      : 3.2;

  // Inisialisasi hasil kalkulasi (fallback awal untuk hidrasi SSR)
  const [comparisonData, setComparisonData] = useState<ComparisonCalculationOutput | null>(() => {
    const initRes = calculateComparison({
      dailyDistanceKm: 60,
      iceKmPerLiter: 48,
      fuelPricePerLiter: 10000,
      evConsumptionKwh100km: 3.2,
      homeTariffPerKwh: 1444.7,
      spkluTariffPerKwh: 2466,
      homeChargingPercentage: 85,
    });
    return initRes.ok ? initRes.data : null;
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors<ComparisonCalculationInput>>({});

  // Debounced API fetcher (200ms) dengan AbortController dan sequence protection
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    requestSeqRef.current += 1;
    const currentSeq = requestSeqRef.current;

    const timer = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const res = await fetchComparisonCalculation(
          {
            dailyDistanceKm,
            iceKmPerLiter: effectiveIceKmL,
            fuelPricePerLiter: effectiveFuelPrice,
            evConsumptionKwh100km: effectiveEvConsumption,
            homeTariffPerKwh: homeTariff,
            spkluTariffPerKwh: spkluTariff,
            homeChargingPercentage: homeChargingPct,
          },
          abortController.signal
        );

        if (currentSeq !== requestSeqRef.current) return;

        if (res.success && res.data) {
          setComparisonData(res.data);
          setValidationErrors({});
        } else {
          // Fallback lokal jika backend mengembalikan error
          const fallback = calculateComparison({
            dailyDistanceKm,
            iceKmPerLiter: effectiveIceKmL,
            fuelPricePerLiter: effectiveFuelPrice,
            evConsumptionKwh100km: effectiveEvConsumption,
            homeTariffPerKwh: homeTariff,
            spkluTariffPerKwh: spkluTariff,
            homeChargingPercentage: homeChargingPct,
          });
          if (fallback.ok) {
            setComparisonData(fallback.data);
            setValidationErrors({});
          } else {
            setValidationErrors(fallback.errors);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (currentSeq === requestSeqRef.current) {
          const fallback = calculateComparison({
            dailyDistanceKm,
            iceKmPerLiter: effectiveIceKmL,
            fuelPricePerLiter: effectiveFuelPrice,
            evConsumptionKwh100km: effectiveEvConsumption,
            homeTariffPerKwh: homeTariff,
            spkluTariffPerKwh: spkluTariff,
            homeChargingPercentage: homeChargingPct,
          });
          if (fallback.ok) {
            setComparisonData(fallback.data);
            setValidationErrors({});
          } else {
            setValidationErrors(fallback.errors);
          }
        }
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setIsCalculating(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [
    dailyDistanceKm,
    effectiveIceKmL,
    effectiveFuelPrice,
    effectiveEvConsumption,
    homeTariff,
    spkluTariff,
    homeChargingPct,
  ]);

  // Formula posisi fill track slider deklaratif dengan offset center thumb 22px
  const distRatio = Math.min(1, Math.max(0, (dailyDistanceKm - 5) / (150 - 5)));
  const distFillStyle = {
    "--p": `calc(${distRatio * 100}% + ${(0.5 - distRatio) * 22}px)`,
  } as React.CSSProperties;

  const homeRatio = Math.min(1, Math.max(0, homeChargingPct / 100));
  const homeFillStyle = {
    "--p": `calc(${homeRatio * 100}% + ${(0.5 - homeRatio) * 22}px)`,
  } as React.CSSProperties;

  // Normalisasi visual bar chart
  const bbmCost = comparisonData ? comparisonData.bbmMonthlyCost : 0;
  const evCost = comparisonData ? comparisonData.evMonthlyCost : 0;
  const maxBarValue = Math.max(bbmCost, evCost, 1);
  const bbmBarWidth = Math.min(100, Math.max(4, (bbmCost / maxBarValue) * 100));
  const evBarWidth = Math.min(100, Math.max(4, (evCost / maxBarValue) * 100));

  return (
    <div className="grid items-start gap-5 @5xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* ============================================================== */}
      {/* KOLOM KIRI: Form Input Parameter Perbandingan                 */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-6 @5xl:sticky @5xl:top-24">
        {/* Kontrol 1: Jarak Tempuh Harian Bersama */}
        <div className="border-b border-line pb-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-ink">
              Jarak per hari (sama untuk kedua kendaraan)
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
          {validationErrors.dailyDistanceKm && (
            <p className="mt-1 text-xs text-bad">
              {validationErrors.dailyDistanceKm}
            </p>
          )}
        </div>

        {/* Kontrol 2: Parameter Kendaraan BBM */}
        <div className="space-y-4 border-b border-line pb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mute">
              Kendaraan BBM (Konvensional)
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              BBM
            </span>
          </div>

          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Model Kendaraan BBM
              </span>
              <div className="relative">
                <select
                  value={selectedIceId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedIceId(id);
                    const preset = ICE_SAMPLE_PRESETS.find((p) => p.id === id);
                    if (preset) {
                      setCustomIceKmL(String(preset.kmPerLiter));
                      setSelectedFuelId(preset.defaultFuelId);
                    }
                  }}
                  className="h-10 w-full appearance-none rounded-xl border border-line bg-white pl-3.5 pr-10 text-xs text-ink transition hover:border-slate-300 focus:border-electric focus:outline-none"
                >
                  <optgroup label="Sepeda Motor BBM">
                    {ICE_SAMPLE_PRESETS.filter((p) => p.vehicleType === "Motor").map(
                      (p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.kmPerLiter} km/L)
                        </option>
                      )
                    )}
                  </optgroup>
                  <optgroup label="Mobil BBM">
                    {ICE_SAMPLE_PRESETS.filter((p) => p.vehicleType === "Mobil").map(
                      (p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.kmPerLiter} km/L)
                        </option>
                      )
                    )}
                  </optgroup>
                  <option value="custom">Kustom (Input Efisiensi Sendiri)</option>
                </select>
                <svg
                  width="14"
                  height="14"
                  style={{ width: 14, height: 14 }}
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

            {selectedIceId === "custom" && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Efisiensi Konsumsi (km / Liter):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={customIceKmL}
                  onChange={(e) => setCustomIceKmL(e.target.value)}
                  className="h-9 w-full rounded-xl border border-line px-3 text-xs text-ink focus:border-electric focus:outline-none"
                  placeholder="Misal: 45"
                />
              </div>
            )}
            {validationErrors.iceKmPerLiter && (
              <p className="mt-1 text-xs text-bad">
                {validationErrors.iceKmPerLiter}
              </p>
            )}
          </div>

          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Bahan Bakar &amp; Harga per Liter
              </span>
              <div className="relative">
                <select
                  value={selectedFuelId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedFuelId(id);
                    const fuel = FUEL_PRICE_REFERENCES.find((f) => f.id === id);
                    if (fuel) {
                      setCustomFuelPrice(String(fuel.pricePerLiter));
                    }
                  }}
                  className="h-10 w-full appearance-none rounded-xl border border-line bg-white pl-3.5 pr-10 text-xs text-ink transition hover:border-slate-300 focus:border-electric focus:outline-none"
                >
                  <optgroup label="Bensin">
                    {FUEL_PRICE_REFERENCES.filter((f) => f.category === "Bensin").map(
                      (f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} — {formatIdr(f.pricePerLiter)}/L
                        </option>
                      )
                    )}
                  </optgroup>
                  <optgroup label="Diesel">
                    {FUEL_PRICE_REFERENCES.filter((f) => f.category === "Diesel").map(
                      (f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} — {formatIdr(f.pricePerLiter)}/L
                        </option>
                      )
                    )}
                  </optgroup>
                  <option value="custom">Kustom (Input Harga Sendiri)</option>
                </select>
                <svg
                  width="14"
                  height="14"
                  style={{ width: 14, height: 14 }}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mute"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <p className="mt-1 text-[11px] text-mute">
                Sumber: {FUEL_METADATA.source} ({FUEL_METADATA.lastUpdated})
              </p>
            </label>

            {selectedFuelId === "custom" && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Harga BBM (Rp / Liter):
                </label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  value={customFuelPrice}
                  onChange={(e) => setCustomFuelPrice(e.target.value)}
                  className="h-9 w-full rounded-xl border border-line px-3 text-xs text-ink focus:border-electric focus:outline-none"
                  placeholder="Misal: 10000"
                />
              </div>
            )}
            {validationErrors.fuelPricePerLiter && (
              <p className="mt-1 text-xs text-bad">
                {validationErrors.fuelPricePerLiter}
              </p>
            )}
          </div>
        </div>

        {/* Kontrol 3: Parameter Kendaraan Listrik (EV) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mute">
              Kendaraan Listrik (EV)
            </span>
            <span className="rounded bg-tint px-2 py-0.5 text-[11px] font-semibold text-electric">
              Listrik
            </span>
          </div>

          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Model Kendaraan Listrik
              </span>
              <div className="relative">
                <select
                  value={selectedEvId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedEvId(id);
                    const preset = EV_SAMPLE_PRESETS.find((p) => p.id === id);
                    if (preset) {
                      setCustomEvConsumption(String(preset.consumptionKwh100km));
                    }
                  }}
                  className="h-10 w-full appearance-none rounded-xl border border-line bg-white pl-3.5 pr-10 text-xs text-ink transition hover:border-slate-300 focus:border-electric focus:outline-none"
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
                  width="14"
                  height="14"
                  style={{ width: 14, height: 14 }}
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

            {selectedEvId === "custom" && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Konsumsi Energi (kWh / 100 km):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={customEvConsumption}
                  onChange={(e) => setCustomEvConsumption(e.target.value)}
                  className="h-9 w-full rounded-xl border border-line px-3 text-xs text-ink focus:border-electric focus:outline-none"
                  placeholder="Misal: 3.2"
                />
              </div>
            )}
            {validationErrors.evConsumptionKwh100km && (
              <p className="mt-1 text-xs text-bad">
                {validationErrors.evConsumptionKwh100km}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold text-ink">
                Porsi charging di rumah
              </span>
              <span className="num text-xs font-bold text-electric">
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
            <div className="mt-1 flex justify-between text-[11px] text-mute">
              <span>0% (100% SPKLU)</span>
              <span>100% Rumah</span>
            </div>
          </div>

          {/* Pengaturan Lanjutan Tarif Listrik */}
          <div className="border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setShowAdvancedTariff(!showAdvancedTariff)}
              className="flex w-full items-center justify-between text-xs font-semibold text-mute hover:text-electric"
            >
              <span>Sesuaikan Tarif Listrik</span>
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
                    Golongan Tarif PLN Rumah:
                  </label>
                  <select
                    value={homeTariff}
                    onChange={(e) => setHomeTariff(Number(e.target.value))}
                    className="w-full rounded-lg border border-line bg-white p-2 text-xs text-ink"
                  >
                    {PLN_TARIFF_REFERENCES.map((t) => (
                      <option key={t.id} value={t.tariffPerKwh}>
                        {t.label} ({formatIdr(t.tariffPerKwh)}/kWh)
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
                    step="50"
                    min="500"
                    value={spkluTariff}
                    onChange={(e) => setSpkluTariff(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-line px-2 text-xs text-ink"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* KOLOM KANAN: Hasil Komparasi Biaya & Konsumsi                 */}
      {/* ============================================================== */}
      <div className="space-y-5">
        {/* Card 1: Hero Metric (Selisih Biaya / Penghematan atau Biaya Tambahan) */}
        {comparisonData && (
          <div
            className={`rounded-3xl border p-6 shadow-sm sm:p-8 transition-colors ${
              comparisonData.status === "SAVING"
                ? "border-emerald-200 bg-emerald-50/50"
                : comparisonData.status === "ADDITIONAL_COST"
                ? "border-amber-200 bg-amber-50/50"
                : "border-line bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mute">
                  {comparisonData.status === "SAVING"
                    ? "Hasil Komparasi: Penghematan Energi"
                    : comparisonData.status === "ADDITIONAL_COST"
                    ? "Hasil Komparasi: Biaya Tambahan Energi"
                    : "Hasil Komparasi: Biaya Energi Setara"}
                </span>
                {isCalculating && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-tint px-2 py-0.5 text-[10px] font-semibold text-brand animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-electric animate-ping" />
                    Menghitung...
                  </span>
                )}
              </div>

              {comparisonData.status === "SAVING" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-ok px-3 py-1 text-xs font-extrabold text-white">
                  Hemat {comparisonData.percentageDifference}%
                </span>
              )}
              {comparisonData.status === "ADDITIONAL_COST" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warn px-3 py-1 text-xs font-extrabold text-white">
                  Biaya EV +{comparisonData.percentageDifference}%
                </span>
              )}
              {comparisonData.status === "EQUAL" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700">
                  Biaya Setara
                </span>
              )}
            </div>

            <div className="mt-4">
              <p
                className={`num text-3xl font-extrabold sm:text-4xl ${
                  comparisonData.status === "SAVING"
                    ? "text-ok"
                    : comparisonData.status === "ADDITIONAL_COST"
                    ? "text-warn-ink"
                    : "text-ink"
                }`}
              >
                {formatIdr(comparisonData.costDifferenceMonthly)}
                <span className="text-base font-medium text-mute"> / bulan</span>
              </p>

              <p className="mt-2 text-sm text-slate-600">
                {comparisonData.status === "SAVING" && (
                  <>
                    Dengan beralih ke{" "}
                    <strong>
                      {currentEv?.name || "kendaraan listrik pilihan Anda"}
                    </strong>
                    , Anda menghemat pengeluaran energi hingga{" "}
                    <strong>
                      {formatIdr(comparisonData.costDifferenceMonthly)}
                    </strong>{" "}
                    setiap bulan dibandingkan memakai{" "}
                    <strong>{currentIce?.name || "kendaraan BBM"}</strong>.
                  </>
                )}
                {comparisonData.status === "ADDITIONAL_COST" && (
                  <>
                    Untuk kombinasi dan tarif ini, pengeluaran energi{" "}
                    <strong>
                      {currentEv?.name || "kendaraan listrik"}
                    </strong>{" "}
                    lebih tinggi{" "}
                    <strong>
                      {formatIdr(comparisonData.costDifferenceMonthly)}/bulan
                    </strong>{" "}
                    dibandingkan{" "}
                    <strong>{currentIce?.name || "kendaraan BBM"}</strong>.
                  </>
                )}
                {comparisonData.status === "EQUAL" && (
                  <>
                    Biaya energi bulanan kedua kendaraan seimbang untuk pola
                    perjalanan {dailyDistanceKm} km/hari.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Card 2: Perbandingan Dua Kolom Side-by-Side */}
        {comparisonData && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Box BBM */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <span className="text-xs font-semibold text-mute">
                    Kendaraan BBM
                  </span>
                  <h3 className="text-base font-bold text-ink">
                    {currentIce?.name || "Kustom BBM"}
                  </h3>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {currentFuel?.name || "BBM"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Konsumsi Bulanan</span>
                  <span className="num font-bold text-ink">
                    {formatNumber(comparisonData.bbmMonthlyLiters, 1)} Liter
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Efisiensi Bahan Bakar</span>
                  <span className="num font-semibold text-slate-700">
                    {effectiveIceKmL} km/L
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Biaya per Kilometer</span>
                  <span className="num font-semibold text-slate-700">
                    {formatIdr(comparisonData.bbmCostPerKm)}/km
                  </span>
                </div>
                <div className="border-t border-line pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-ink">Total Biaya Bulanan</span>
                  <span className="num text-lg font-extrabold text-ink">
                    {formatIdr(comparisonData.bbmMonthlyCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Box EV */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <span className="text-xs font-semibold text-electric">
                    Kendaraan Listrik
                  </span>
                  <h3 className="text-base font-bold text-ink">
                    {currentEv?.name || "Kustom EV"}
                  </h3>
                </div>
                <span className="rounded bg-tint px-2 py-0.5 text-xs font-semibold text-electric">
                  Listrik
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Konsumsi Bulanan</span>
                  <span className="num font-bold text-ink">
                    {formatNumber(comparisonData.evMonthlyKwh, 1)} kWh
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Efisiensi Energi</span>
                  <span className="num font-semibold text-slate-700">
                    {effectiveEvConsumption} kWh/100 km
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mute">Biaya per Kilometer</span>
                  <span className="num font-semibold text-slate-700">
                    {formatIdr(comparisonData.evCostPerKm)}/km
                  </span>
                </div>
                <div className="border-t border-line pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-electric">Total Biaya Bulanan</span>
                  <span className="num text-lg font-extrabold text-electric">
                    {formatIdr(comparisonData.evMonthlyCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Visual Comparison Progress Bar */}
        {comparisonData && (
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-ink">
                Visualisasi Perbandingan Biaya Energi Bulanan
              </h4>
              <span className="text-xs text-mute">
                Standar 30 Hari ({dailyDistanceKm * 30} km/bulan)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">
                    BBM: {currentIce?.name || "Kendaraan BBM"}
                  </span>
                  <span className="num font-bold text-ink">
                    {formatIdr(comparisonData.bbmMonthlyCost)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full transition-all duration-300"
                    style={{ width: `${bbmBarWidth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-electric">
                    EV: {currentEv?.name || "Kendaraan Listrik"}
                  </span>
                  <span className="num font-bold text-electric">
                    {formatIdr(comparisonData.evMonthlyCost)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-electric rounded-full transition-all duration-300"
                    style={{ width: `${evBarWidth}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-3 text-[11px] leading-relaxed text-mute">
              *Perhitungan biaya energi menggunakan acuan standar 30 hari kalender
              dengan tarif listrik PLN resmi dan harga BBM yang berlaku. Tidak
              mencakup biaya servis, oli, maupun penggantian suku cadang.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

