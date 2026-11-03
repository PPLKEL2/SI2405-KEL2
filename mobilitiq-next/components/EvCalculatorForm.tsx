"use client";

import React, { useState, useId } from "react";
import {
  calculateEvEnergy,
  type EvCalculationInput,
} from "@/lib/calculations/ev";
import {
  PLN_TARIFF_REFERENCES,
  EV_SAMPLE_PRESETS,
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
    const ref = PLN_TARIFF_REFERENCES.find((t) => t.id === tariffId);
    if (ref) {
      setHomeTariffInput(ref.tariffPerKwh.toString());
    }
  };

  return (
    <div className="space-y-8">
      {/* Grid Utama: Form Input (Kiri) & Ringkasan Hasil (Kanan) */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Formulir Parameter Input */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                1. Parameter Kendaraan &amp; Perjalanan Harian
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Tentukan efisiensi konsumsi daya kendaraan listrik dan estimasi jarak tempuh harian Anda.
              </p>
            </div>

            {/* Pilihan Preset Contoh Cepat */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-2">
                Pilih Contoh Spesifikasi Kendaraan (Preset Opsional):
              </span>
              <div className="flex flex-wrap gap-2">
                {EV_SAMPLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    {p.name}
                  </button>
                ))}
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
              <h2 className="text-base font-bold text-slate-900">
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
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-right text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
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
                value={parsedHomePct.valid ? Math.max(0, Math.min(100, parsedHomePct.value!)) : 80}
                onChange={(e) => setHomeChargingPctInput(e.target.value)}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />

              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span>
                  Rumah:{" "}
                  <strong>
                    {parsedHomePct.valid
                      ? Math.max(0, Math.min(100, parsedHomePct.value!))
                      : 0}
                    %
                  </strong>
                </span>
                <span>
                  SPKLU:{" "}
                  <strong>
                    {parsedHomePct.valid
                      ? 100 - Math.max(0, Math.min(100, parsedHomePct.value!))
                      : 0}
                    %
                  </strong>
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
                {PLN_TARIFF_REFERENCES.map((t) => (
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
                helperText="Nilai contoh pengujian form (bukan tarif baku pemerintah)."
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
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                  Hasil Simulasi
                </span>
                <span className="text-xs text-slate-400">Periode: 30 Hari</span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                Estimasi Konsumsi &amp; Biaya Energi
              </h2>
            </div>

            {calculationResult ? (
              <div className="space-y-4">
                <ResultCard
                  label="Estimasi Total Biaya Listrik Bulanan"
                  value={formatIdr(calculationResult.totalCostMonthly)}
                  tone="brand"
                  subtext={`Untuk jarak tempuh ${formatNumber(calculationResult.monthlyDistanceKm)} km/bulan (30 hari).`}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <ResultCard
                    label="Biaya Energi per Km"
                    value={formatIdr(calculationResult.costPerKm)}
                    unit="/ km"
                    tone="ok"
                  />
                  <ResultCard
                    label="Total Kebutuhan Listrik"
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
                    <span>Total Biaya Energi</span>
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
                <strong>Tarif PLN TW IV 2024:</strong> Mengacu pada{" "}
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
