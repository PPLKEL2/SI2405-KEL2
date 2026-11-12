"use client";

import React from "react";
import { FuelPreset, CalculatorInput, ValidationErrors } from "../types/calculator";
import { FUEL_PRESETS } from "../utils/calculator";

interface FuelFormProps {
  input: CalculatorInput;
  errors: ValidationErrors;
  onChange: (field: keyof CalculatorInput, value: string) => void;
  onSelectPreset: (preset: FuelPreset) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onLoadExample: () => void;
}

export default function FuelForm({
  input,
  errors,
  onChange,
  onSelectPreset,
  onSubmit,
  onReset,
  onLoadExample,
}: FuelFormProps) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Parameter Perjalanan & BBM
          </h2>
          <p className="text-xs text-slate-500">
            Masukkan data jarak harian, konsumsi BBM kendaraan, dan harga per liter.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadExample}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95"
          title="Isi otomatis dengan contoh acuan: 60 km/hari, 12 km/L, Rp10.000"
        >
          <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Muat Contoh (60 km, 12 km/L)
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* 1. Jarak Tempuh Rata-rata per Hari */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="dailyDistance" className="block text-[13px] font-semibold text-slate-900">
              Jarak Tempuh Harian
            </label>
            <span className="text-xs text-slate-400">km / hari</span>
          </div>

          <div className="relative rounded-xl shadow-xs">
            <input
              type="number"
              id="dailyDistance"
              name="dailyDistance"
              step="any"
              min="0"
              placeholder="Contoh: 60"
              value={input.dailyDistance}
              onChange={(e) => onChange("dailyDistance", e.target.value)}
              className={`h-11 block w-full rounded-xl border bg-white pl-3.5 pr-20 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                errors.dailyDistance
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-100"
              }`}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                km / hari
              </span>
            </div>
          </div>

          {errors.dailyDistance ? (
            <p className="flex items-center gap-1 text-xs font-medium text-red-600">
              <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.dailyDistance}
            </p>
          ) : (
            <p className="text-[12px] text-slate-500">
              Perkiraan total rute harian. (Jarak 0 km aman dan menghasilkan 0 L serta Rp0).
            </p>
          )}

          {/* Quick chips for Distance */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Pilihan:</span>
            {[
              { label: "15 km", val: "15" },
              { label: "30 km", val: "30" },
              { label: "60 km (Contoh)", val: "60" },
              { label: "100 km", val: "100" },
            ].map((chip) => (
              <button
                key={chip.val}
                type="button"
                onClick={() => onChange("dailyDistance", chip.val)}
                className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium transition ${
                  input.dailyDistance === chip.val
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Efisiensi Kendaraan */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="vehicleEfficiency" className="block text-[13px] font-semibold text-slate-900">
              Efisiensi Kendaraan (Konsumsi BBM)
            </label>
            <span className="text-xs text-slate-400">km / L</span>
          </div>

          <div className="relative rounded-xl shadow-xs">
            <input
              type="number"
              id="vehicleEfficiency"
              name="vehicleEfficiency"
              step="any"
              min="0.1"
              placeholder="Contoh: 12"
              value={input.vehicleEfficiency}
              onChange={(e) => onChange("vehicleEfficiency", e.target.value)}
              className={`h-11 block w-full rounded-xl border bg-white pl-3.5 pr-20 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                errors.vehicleEfficiency
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-100"
              }`}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                km / L
              </span>
            </div>
          </div>

          {errors.vehicleEfficiency ? (
            <p className="flex items-center gap-1 text-xs font-medium text-red-600">
              <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.vehicleEfficiency}
            </p>
          ) : (
            <p className="text-[12px] text-slate-500">
              Jarak yang dapat ditempuh tiap 1 liter BBM (harus lebih dari 0 km/L).
            </p>
          )}

          {/* Quick chips for Efficiency */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Tipe:</span>
            {[
              { label: "SUV / MPV (8 km/L)", val: "8" },
              { label: "Mobil (12 km/L)", val: "12" },
              { label: "Hemat (16 km/L)", val: "16" },
              { label: "Motor (45 km/L)", val: "45" },
            ].map((chip) => (
              <button
                key={chip.val}
                type="button"
                onClick={() => onChange("vehicleEfficiency", chip.val)}
                className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium transition ${
                  input.vehicleEfficiency === chip.val
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Jenis BBM & Harga per Liter */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="space-y-1.5">
            <label htmlFor="fuelTypeSelect" className="block text-[13px] font-semibold text-slate-900">
              Jenis Bahan Bakar Minyak (BBM)
            </label>
            <div className="relative">
              <select
                id="fuelTypeSelect"
                value={input.fuelTypeId}
                onChange={(e) => {
                  const selected = FUEL_PRESETS.find((p) => p.id === e.target.value);
                  if (selected) {
                    onSelectPreset(selected);
                  }
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 text-sm font-medium text-slate-900 shadow-xs outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {FUEL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.defaultPrice > 0 ? `— Rp ${p.defaultPrice.toLocaleString("id-ID")}/L` : "(Input Manual)"}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              *Harga BBM preset adalah referensi resmi yang dapat berubah dan dapat Anda sesuaikan langsung di bawah.
            </p>
          </div>

          {/* Custom fuel name if custom is selected */}
          {input.fuelTypeId === "custom" && (
            <div className="space-y-1">
              <label htmlFor="fuelTypeName" className="block text-xs font-semibold text-slate-700">
                Nama Bahan Bakar Kustom
              </label>
              <input
                type="text"
                id="fuelTypeName"
                value={input.fuelTypeName}
                placeholder="Contoh: Shell Super / Revvo 92"
                onChange={(e) => onChange("fuelTypeName", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          {/* Harga per Liter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="fuelPricePerLiter" className="block text-[13px] font-semibold text-slate-900">
                Harga per Liter (Dapat Disesuaikan)
              </label>
              <span className="text-xs text-slate-400">Rp / L</span>
            </div>

            <div className="relative rounded-xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-sm font-semibold text-slate-500">Rp</span>
              </div>
              <input
                type="number"
                id="fuelPricePerLiter"
                name="fuelPricePerLiter"
                step="any"
                min="1"
                placeholder="Contoh: 10000"
                value={input.fuelPricePerLiter}
                onChange={(e) => onChange("fuelPricePerLiter", e.target.value)}
                className={`h-11 block w-full rounded-xl border bg-white pl-11 pr-20 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                  errors.fuelPricePerLiter
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  / Liter
                </span>
              </div>
            </div>

            {errors.fuelPricePerLiter ? (
              <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.fuelPricePerLiter}
              </p>
            ) : (
              <p className="text-[12px] text-slate-500">
                Harga dapat Anda ubah kapan saja sesuai harga SPBU terkini di lokasi Anda.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Hitung Estimasi BBM
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
