"use client";

import React, { useState } from "react";
import MaintenanceForm from "./MaintenanceForm";
import { DonutChart, DonutLegend } from "./DonutChart";
import {
  calculateMaintenanceCost,
  formatRupiah,
  formatRupiahCompact,
  formatNumberId,
  VEHICLE_OPTIONS,
} from "../utils/calculator";
import { OwnershipPeriod } from "../types/calculator";

interface MaintenanceCalculatorViewProps {
  // Pure BBM & Perawatan view
}

export default function MaintenanceCalculatorView({}: MaintenanceCalculatorViewProps = {}) {
  // Input states with exact Figma defaults (Honda Vario 125, 45 km/l, Pertalite, 60 km/day)
  const [selectedVehicle, setSelectedVehicle] = useState<string>("Honda Vario 125");
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(45);
  const [fuelType, setFuelType] = useState<string>("Pertalite");
  const [dailyDistance, setDailyDistance] = useState<number>(60);
  const [ownershipPeriod, setOwnershipPeriod] = useState<OwnershipPeriod>(1);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);

  // When vehicle changes, update default fuel efficiency
  const handleVehicleChange = (vehicleName: string) => {
    setSelectedVehicle(vehicleName);
    const vehicle = VEHICLE_OPTIONS.find((v) => v.name === vehicleName);
    if (vehicle) {
      setFuelEfficiency(vehicle.kmL);
    }
  };

  // Reactive calculation result
  const result = calculateMaintenanceCost(
    selectedVehicle,
    dailyDistance,
    fuelType,
    customPrice,
    fuelEfficiency,
    ownershipPeriod
  );

  return (
    <div className="space-y-6">
      {/* Title Header matching Figma zn */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Kalkulator Biaya BBM &amp; Perawatan
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Berapa sebenarnya yang Anda keluarkan tiap bulan untuk kendaraan BBM saat ini.
        </p>
      </div>

      {/* Main Grid: Left Form, Right Results */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
        {/* Left Column: Input Form */}
        <div className="space-y-4">
          <MaintenanceForm
            selectedVehicle={selectedVehicle}
            onVehicleChange={handleVehicleChange}
            fuelEfficiency={fuelEfficiency}
            onFuelEfficiencyChange={setFuelEfficiency}
            fuelType={fuelType}
            onFuelTypeChange={setFuelType}
            dailyDistance={dailyDistance}
            onDailyDistanceChange={setDailyDistance}
            ownershipPeriod={ownershipPeriod}
            onOwnershipPeriodChange={setOwnershipPeriod}
            customPrice={customPrice}
            onCustomPriceChange={setCustomPrice}
          />
        </div>

        {/* Right Column: Cards & Breakdowns */}
        <div className="space-y-6">
          {/* Top 3 Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: BBM / bulan */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500">
                BBM / bulan
              </span>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-slate-900">
                  {formatRupiah(result.monthlyFuelCost)}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  {formatNumberId(result.monthlyLiters, 1)} liter
                </div>
              </div>
            </div>

            {/* Card 2: Perawatan / bulan */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Perawatan / bulan
              </span>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-slate-900">
                  {formatRupiah(result.monthlyMaintenanceCost)}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  oli, servis, ban
                </div>
              </div>
            </div>

            {/* Card 3: Total / bulan */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/40">
              <span className="text-xs font-semibold text-slate-500">
                Total / bulan
              </span>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-blue-900">
                  {formatRupiah(result.monthlyTotalCost)}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  termasuk pajak STNK
                </div>
              </div>
            </div>
          </div>

          {/* Card: Komposisi Biaya Per Tahun / Periode */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {ownershipPeriod === 1
                    ? "Komposisi biaya per tahun"
                    : `Komposisi biaya periode ${ownershipPeriod} tahun`}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Total{" "}
                  {formatRupiah(
                    ownershipPeriod === 1
                      ? result.yearlyTotalCost
                      : result.periodTotalCost
                  )}
                </p>
              </div>

              {/* Ownership Period Badges */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                {([1, 3, 5] as OwnershipPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setOwnershipPeriod(period)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      ownershipPeriod === period
                        ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                        : "hover:text-slate-900 text-slate-600"
                    }`}
                  >
                    {period} Thn
                  </button>
                ))}
              </div>
            </div>

            {/* Donut Chart + Legend */}
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
              <DonutChart
                data={result.compositionChartData}
                size={180}
                center={
                  <div className="px-2">
                    <p className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                      {formatRupiahCompact(
                        ownershipPeriod === 1
                          ? result.yearlyTotalCost
                          : result.periodTotalCost
                      )}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {ownershipPeriod === 1 ? "per tahun" : `per ${ownershipPeriod} thn`}
                    </p>
                  </div>
                }
              />

              <div className="w-full flex-1">
                <DonutLegend
                  data={result.compositionChartData}
                  formatValue={(val) => formatRupiah(val)}
                />
              </div>
            </div>
          </div>

          {/* Card: Rincian Perawatan per Bulan */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Rincian perawatan per bulan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimasi biaya komponen servis berkala untuk {result.vehicle.name} ({result.vehicle.jenis})
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              {result.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 hover:bg-slate-50/60 transition-colors px-1"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {formatRupiah(item.monthlyCost)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {formatRupiah(
                        ownershipPeriod === 1 ? item.yearlyCost : item.periodCost
                      )}
                      /{ownershipPeriod === 1 ? "thn" : `${ownershipPeriod}thn`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Komparasi Perawatan Kendaraan Listrik (EV) */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-100/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-950">
                    Bandingkan dengan Perawatan Kendaraan Listrik (EV)
                  </h3>
                  <p className="text-xs text-blue-800/80">
                    Model pembanding: {result.evComparison.evName} ({result.evComparison.evType})
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                Hemat ~{result.evComparison.savingsPercentage}%
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-1">
              <div className="rounded-xl border border-slate-200/60 bg-white p-4">
                <span className="text-xs font-semibold text-slate-500">
                  Servis BBM Saat Ini
                </span>
                <div className="mt-1 text-lg font-extrabold text-slate-800">
                  {formatRupiah(result.monthlyMaintenanceCost)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Rp {result.vehicle.jenis === "Motor" ? "47" : "230"}/km
                </span>
              </div>

              <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4">
                <span className="text-xs font-semibold text-blue-800">
                  Servis Kendaraan Listrik
                </span>
                <div className="mt-1 text-lg font-extrabold text-blue-700">
                  {formatRupiah(result.evComparison.evMonthlyMaintenance)}
                </div>
                <span className="text-[11px] text-blue-600 font-medium">
                  Rp {result.vehicle.jenis === "Motor" ? "14" : "89"}/km (tanpa oli & busi)
                </span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <span className="text-xs font-semibold text-emerald-800">
                  Hemat Servis / Bulan
                </span>
                <div className="mt-1 text-lg font-extrabold text-emerald-700">
                  {formatRupiah(
                    result.monthlyMaintenanceCost - result.evComparison.evMonthlyMaintenance
                  )}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {formatRupiah(
                    (result.monthlyMaintenanceCost - result.evComparison.evMonthlyMaintenance) * 12
                  )} / tahun
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

