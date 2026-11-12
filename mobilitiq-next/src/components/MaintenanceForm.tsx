"use client";

import React, { useState } from "react";
import {
  VEHICLE_OPTIONS,
  FIGMA_FUEL_PRICES,
  formatRupiah,
} from "../utils/calculator";
import { VehicleOption, OwnershipPeriod } from "../types/calculator";

interface MaintenanceFormProps {
  selectedVehicle: string;
  onVehicleChange: (vehicleName: string) => void;

  fuelEfficiency: number;
  onFuelEfficiencyChange: (val: number) => void;

  fuelType: string;
  onFuelTypeChange: (fuel: string) => void;

  dailyDistance: number;
  onDailyDistanceChange: (val: number) => void;

  ownershipPeriod: OwnershipPeriod;
  onOwnershipPeriodChange: (years: OwnershipPeriod) => void;

  customPrice?: number;
  onCustomPriceChange?: (price: number) => void;
}

export default function MaintenanceForm({
  selectedVehicle,
  onVehicleChange,
  fuelEfficiency,
  onFuelEfficiencyChange,
  fuelType,
  onFuelTypeChange,
  dailyDistance,
  onDailyDistanceChange,
  ownershipPeriod,
  onOwnershipPeriodChange,
  customPrice,
  onCustomPriceChange,
}: MaintenanceFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentVehicle =
    VEHICLE_OPTIONS.find((v) => v.name === selectedVehicle) ||
    VEHICLE_OPTIONS[0];

  const currentPrice =
    customPrice !== undefined && customPrice > 0
      ? customPrice
      : FIGMA_FUEL_PRICES[fuelType] || 10000;

  // Calculate percentage for custom slider background track
  const efficiencyPercent = Math.min(
    100,
    Math.max(0, ((fuelEfficiency - 5) / (60 - 5)) * 100)
  );
  const distancePercent = Math.min(
    100,
    Math.max(0, ((dailyDistance - 5) / (150 - 5)) * 100)
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* 1. Kendaraan BBM Dropdown */}
      <div className="space-y-1.5">
        <label
          htmlFor="vehicle-select"
          className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between"
        >
          <span>Kendaraan BBM</span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {currentVehicle.jenis}
          </span>
        </label>
        <div className="relative">
          <select
            id="vehicle-select"
            value={selectedVehicle}
            onChange={(e) => onVehicleChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
          >
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.jenis} · {v.kmL} km/l)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Konsumsi BBM Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="fuel-efficiency-range"
            className="text-xs font-bold text-slate-800"
          >
            Konsumsi BBM
          </label>
          <span className="text-xs font-bold text-blue-600">
            {fuelEfficiency.toFixed(1).replace(".", ",")} km/l
          </span>
        </div>
        <div className="relative flex items-center">
          <input
            id="fuel-efficiency-range"
            type="range"
            min={5}
            max={60}
            step={0.5}
            value={fuelEfficiency}
            onChange={(e) => onFuelEfficiencyChange(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${efficiencyPercent}%, #e2e8f0 ${efficiencyPercent}%, #e2e8f0 100%)`,
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-blue-600 transition"
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>5 km/l</span>
          <span>Standar {currentVehicle.name}: {currentVehicle.kmL} km/l</span>
          <span>60 km/l</span>
        </div>
      </div>

      {/* 3. Jenis BBM Select */}
      <div className="space-y-1.5">
        <label
          htmlFor="fuel-type-select"
          className="text-xs font-bold text-slate-800"
        >
          Jenis BBM
        </label>
        <div className="relative">
          <select
            id="fuel-type-select"
            value={fuelType}
            onChange={(e) => onFuelTypeChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
          >
            <option value="Pertalite">Pertalite</option>
            <option value="Pertamax">Pertamax</option>
            <option value="Solar">Solar</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium pt-0.5">
          {formatRupiah(currentPrice)} per liter
        </p>
      </div>

      {/* 4. Jarak per hari Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="distance-range"
            className="text-xs font-bold text-slate-800"
          >
            Jarak per hari
          </label>
          <span className="text-xs font-bold text-blue-600">
            {dailyDistance} km
          </span>
        </div>
        <div className="relative flex items-center">
          <input
            id="distance-range"
            type="range"
            min={5}
            max={150}
            step={5}
            value={dailyDistance}
            onChange={(e) => onDailyDistanceChange(parseInt(e.target.value, 10))}
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${distancePercent}%, #e2e8f0 ${distancePercent}%, #e2e8f0 100%)`,
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-blue-600 transition"
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>5 km</span>
          <span>{(dailyDistance * 30).toLocaleString("id-ID")} km / bln</span>
          <span>150 km</span>
        </div>
      </div>

      {/* 5. Periode Kepemilikan (Subtask 1: Membuat Form Input Kendaraan dan Periode Kepemilikan) */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>Periode Kepemilikan</span>
          <span className="text-[11px] font-semibold text-slate-500">
            {ownershipPeriod} Tahun ({ownershipPeriod * 12} bulan)
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([1, 3, 5] as OwnershipPeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => onOwnershipPeriodChange(period)}
              className={`rounded-xl py-2 text-xs font-bold transition-all ${
                ownershipPeriod === period
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              {period} Tahun
            </button>
          ))}
        </div>
      </div>

      {/* Optional: Manual price override accordion */}
      <div className="pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <span>Penyesuaian Manual Harga</span>
          <span className="text-sm">{showAdvanced ? "−" : "+"}</span>
        </button>

        {showAdvanced && onCustomPriceChange && (
          <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
            <label className="text-[11px] font-semibold text-slate-600">
              Ubah Harga BBM Manual (Rp/L):
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => onCustomPriceChange(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
              min={1000}
              step={500}
            />
          </div>
        )}
      </div>
    </div>
  );
}

