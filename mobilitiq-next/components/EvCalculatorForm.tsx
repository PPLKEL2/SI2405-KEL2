"use client";

import React, { useState, useEffect, useId } from "react";
import {
  calculateEvEnergy,
  type EvCalculationInput,
} from "@/lib/calculations/ev";
import {
  PLN_TARIFF_REFERENCES,
  EV_SAMPLE_PRESETS,
  type TariffReference,
} from "@/lib/data/reference-data";
import { formatIdr, formatNumber } from "@/lib/format";
import { parseStrictNumber } from "@/lib/parser";
import { InputField } from "./InputField";
import { ResultCard } from "./ResultCard";

export function EvCalculatorForm() {
  const selectId = useId();
  // Form raw string states (untuk menangani pengetikan pengguna secara natural)
  const [consumptionInput, setConsumptionInput] = useState<string>("15");
  const [dailyDistanceInput, setDailyDistanceInput] = useState<string>("30");
  const [homeChargingPctInput, setHomeChargingPctInput] = useState<string>("80");
  const [homeTariffInput, setHomeTariffInput] = useState<string>("1444.70");
  const [spkluTariffInput, setSpkluTariffInput] = useState<string>("2466");
  const [selectedTariffId, setSelectedTariffId] = useState<string>("pln-1300-2200");
  const [activeTariffs, setActiveTariffs] = useState<TariffReference[]>(PLN_TARIFF_REFERENCES);

  // Sinkronisasi dinamis parameter tarif aktif dari sistem pengelolaan tarif
  useEffect(() => {
    fetch("/api/energy-tariffs/active?category=PLN_HOME")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: TariffReference[] = json.data.map(
            (item: {
              id: string;
              name: string;
              pricePerUnit: number;
              validFrom: string;
              validTo: string | null;
              sourceLabel?: string;
              sourceUrl?: string;
              notes?: string;
            }) => ({
              id: item.id,
              category: "PLN_HOME" as const,
              label: item.name,
              tariffPerKwh: item.pricePerUnit,
              period: item.validTo
                ? `${item.validFrom} s.d. ${item.validTo}`
                : `Mulai ${item.validFrom}`,
              sourceLabel: item.sourceLabel || "Tarif Resmi Aktif",
              sourceUrl: item.sourceUrl || "",
              notes: item.notes || "",
            }),
          );
          setActiveTariffs(mapped);
        }
      })
      .catch(() => {
        // Fallback aman ke PLN_TARIFF_REFERENCES jika offline / SSR
      });
  }, []);

  // Parser 2-tahap
  const parsedConsumption = parseStrictNumber(consumptionInput);
  const parsedDistance = parseStrictNumber(dailyDistanceInput);
  const parsedHomePct = parseStrictNumber(homeChargingPctInput);
  const parsedHomeTariff = parseStrictNumber(homeTariffInput);
  const parsedSpkluTariff = parseStrictNumber(spkluTariffInput);

  // Kumpulkan input valid jika semua parsing sukses
  const isInputSyntacticallyValid =
    parsedConsumption.valid &&
    parsedDistance.valid &&
    parsedHomePct.valid &&
    parsedHomeTariff.valid &&
    parsedSpkluTariff.valid;

  let calculationResult = null;
  let validationErrors: Record<string, string> = {};

  if (isInputSyntacticallyValid) {
    const calculationInput: EvCalculationInput = {
      consumptionKwh100km: parsedConsumption.value!,
      dailyDistanceKm: parsedDistance.value!,
      homeChargingPercentage: parsedHomePct.value!,
      homeTariffPerKwh: parsedHomeTariff.value!,
      spkluTariffPerKwh: parsedSpkluTariff.value!,
    };

    const res = calculateEvEnergy(calculationInput);
    if (res.ok) {
      calculationResult = res.data;
    } else {
      validationErrors = (res.errors as Record<string, string>) || {};
    }
  }

  // Handler pergantian preset EV
  const handleSelectPreset = (presetId: string) => {
    const preset = EV_SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setConsumptionInput(preset.consumptionKwh100km.toString());
    }
  };

  // Handler pergantian golongan tarif PLN
  const handleSelectPlnTariff = (tariffId: string) => {
    setSelectedTariffId(tariffId);
    const ref =
      activeTariffs.find((t) => t.id === tariffId) ||
      PLN_TARIFF_REFERENCES.find((t) => t.id === tariffId);
    if (ref) {
      setHomeTariffInput(ref.tariffPerKwh.toString());
    }
  };

  const clampedHomePct = parsedHomePct.valid
    ? Math.max(0, Math.min(100, parsedHomePct.value!))
    : 80;
  const clampedSpkluPct = 100 - clampedHomePct;

  return (
    <div className="space-y-8">
      {/* Grid Utama: Form Input (Kiri) & Ringkasan Hasil (Kanan) */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Formulir Parameter Input */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading text-base font-bold text-slate-900">
                1. Parameter Kendaraan &amp; Perjalanan Harian
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Tentukan efisiensi konsumsi daya kendaraan listrik dan estimasi jarak tempuh harian Anda.
              </p>
            </div>

            {/* Pilihan Preset Contoh Cepat (Pill Buttons sesuai Figma) */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-2">
                Pilih Contoh Spesifikasi Kendaraan (Preset Populer):
              </span>
              <div className="flex flex-wrap gap-2">
                {EV_SAMPLE_PRESETS.map((p) => {
                  const isSelected = consumptionInput === p.consumptionKwh100km.toString();
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition shadow-2xs ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{p.vehicleType === "Motor" ? "🛵" : "🚗"}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Konsumsi Energi EV"
                unitSuffix="kWh / 100 km"
                value={consumptionInput}
                onChange={(e) => setConsumptionInput(e.target.value)}
                placeholder="Contoh: 15"
                helperText="Konsumsi daya spesifikasi resmi atau pengujian."
                errorMessage={
                  !parsedConsumption.valid
                    ? parsedConsumption.error
                    : validationErrors.consumptionKwh100km
                }
              />

              <InputField
                label="Jarak Tempuh Harian"
                unitSuffix="km / hari"
                value={dailyDistanceInput}
                onChange={(e) => setDailyDistanceInput(e.target.value)}
                placeholder="Contoh: 30"
                helperText="Rata-rata jarak tempuh yang ditempuh setiap hari."
                errorMessage={
                  !parsedDistance.valid
                    ? parsedDistance.error
                    : validationErrors.dailyDistanceKm
                }
              />
            </div>
          </div>

          {/* Bagian 2: Pengisian Daya & Tarif */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading text-base font-bold text-slate-900">
                2. Lokasi Pengisian Daya &amp; Tarif Listrik
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Atur proporsi pengisian di rumah vs stasiun umum (SPKLU) serta tarif listrik yang berlaku.
              </p>
            </div>

            {/* Slider & Input Persentase Rumah vs SPKLU */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="home-charging-slider" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Proporsi Pengisian di Rumah
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={homeChargingPctInput}
                    onChange={(e) => setHomeChargingPctInput(e.target.value)}
                    className="w-16 rounded-xl border border-slate-300 px-2 py-1 text-right text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>

              <input
                id="home-charging-slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={clampedHomePct}
                onChange={(e) => setHomeChargingPctInput(e.target.value)}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />

              {/* Visual Proportion Bar matching Figma */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 flex">
                <div
                  className="bg-blue-600 transition-all duration-200"
                  style={{ width: `${clampedHomePct}%` }}
                />
                <div
                  className="bg-purple-600 transition-all duration-200"
                  style={{ width: `${clampedSpkluPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Pengisian Rumah: <strong className="text-slate-900">{clampedHomePct}%</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                  SPKLU Publik: <strong className="text-slate-900">{clampedSpkluPct}%</strong>
                </span>
              </div>
              {!parsedHomePct.valid && (
                <p className="text-xs font-medium text-red-600">{parsedHomePct.error}</p>
              )}
            </div>

            {/* Pilihan Tarif Rumah Tangga PLN */}
            <div className="space-y-2">
              <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Golongan Daya &amp; Tarif PLN Rumah:
              </label>
              <select
                id={selectId}
                value={selectedTariffId}
                onChange={(e) => handleSelectPlnTariff(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 transition focus:border-blue-500 focus:outline-none"
              >
                {activeTariffs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — Rp {formatNumber(t.tariffPerKwh, 2)} / kWh
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Tarif Listrik Rumah"
                unitSuffix="Rp / kWh"
                value={homeTariffInput}
                onChange={(e) => {
                  setHomeTariffInput(e.target.value);
                  setSelectedTariffId("custom");
                }}
                placeholder="Contoh: 1444.70"
                helperText="Tarif listrik per kWh sesuai golongan daya rumah Anda."
                errorMessage={
                  !parsedHomeTariff.valid
                    ? parsedHomeTariff.error
                    : validationErrors.homeTariffPerKwh
                }
              />

              <InputField
                label="Tarif SPKLU (Contoh Input)"
                unitSuffix="Rp / kWh"
                value={spkluTariffInput}
                onChange={(e) => setSpkluTariffInput(e.target.value)}
                placeholder="Contoh: 2466"
                helperText="Nilai acuan pengujian pengisian daya di stasiun umum."
                errorMessage={
                  !parsedSpkluTariff.valid
                    ? parsedSpkluTariff.error
                    : validationErrors.spkluTariffPerKwh
                }
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Hasil Kalkulasi */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  Ringkasan Estimasi
                </span>
                <span className="text-xs text-slate-400">Periode: 30 Hari</span>
              </div>
              <h2 className="font-heading mt-2 text-lg font-bold text-slate-900">
                Estimasi Konsumsi &amp; Biaya Energi
              </h2>
            </div>

            {calculationResult ? (
              <div className="space-y-4">
                <ResultCard
                  label="Estimasi Total Biaya Listrik Bulanan"
                  value={formatIdr(calculationResult.totalCostMonthly)}
                  tone="brand"
                  subtext={`Untuk estimasi jarak tempuh ${formatNumber(calculationResult.monthlyDistanceKm)} km/bulan (30 hari).`}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <ResultCard
                    label="Biaya Energi per Km"
                    value={formatIdr(calculationResult.costPerKm)}
                    unit="/ km"
                    tone="ok"
                  />
                  <ResultCard
                    label="Total Daya Listrik"
                    value={formatNumber(calculationResult.monthlyKwh, 2)}
                    unit="kWh / bln"
                  />
                </div>

                {/* Rincian Pembagian Energi & Biaya */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Rincian Pembagian Pengisian:
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Pengisian Rumah ({calculationResult.homeKwh} kWh)</span>
                    <span className="font-bold text-slate-900">
                      {formatIdr(calculationResult.homeCostMonthly)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Pengisian SPKLU ({calculationResult.spkluKwh} kWh)</span>
                    <span className="font-bold text-slate-900">
                      {formatIdr(calculationResult.spkluCostMonthly)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs font-extrabold text-slate-900">
                    <span>Total Pengeluaran Energi</span>
                    <span className="text-blue-700">
                      {formatIdr(calculationResult.totalCostMonthly)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Masukkan parameter input yang valid di sisi kiri untuk melihat hasil kalkulasi.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Pastikan seluruh field angka terisi dengan nilai numerik positif.
                </p>
              </div>
            )}
          </div>

          {/* Rujukan & Catatan Regulasi Resmi */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3 text-slate-600">
            <div className="font-bold text-slate-900">Dasar Rujukan Tarif Resmi:</div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong>Tarif Listrik Rumah Tangga PLN:</strong> Mengacu pada{" "}
                <a
                  href="https://www.esdm.go.id/id/media-center/arsip-berita/pemerintah-putuskan-tarif-listrik-triwulan-iv-tetap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  Siaran Pers ESDM No. 544/2024
                </a>{" "}
                &amp;{" "}
                <a
                  href="https://web.pln.co.id/pelanggan/tarif-tenaga-listrik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  Laman Resmi Tarif PT PLN
                </a>.
              </li>
              <li>
                <strong>Regulasi SPKLU B2B:</strong> Diatur dalam{" "}
                <a
                  href="https://peraturan.go.id/id/permen-esdm-no-1-tahun-2023"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  Permen ESDM No. 1 Tahun 2023
                </a>{" "}
                (formula pengali tarif curah B2B).
              </li>
              <li>
                <strong>Biaya Layanan SPKLU Sesi:</strong> Diatur dalam{" "}
                <a
                  href="https://jdih.esdm.go.id/dokumen/view?id=2388"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  Kepmen ESDM No. 182.K/TL.04/MEM.S/2023
                </a>{" "}
                (maks Rp 25.000 fast, Rp 57.000 ultrafast). Biaya per sesi tidak termasuk dalam perhitungan energi per kWh bulanan.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
