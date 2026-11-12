"use client";

import React from "react";
import { CalculationResult } from "../types/calculator";
import { formatRupiah, formatLiters, formatNumberId } from "../utils/calculator";

interface ResultSectionProps {
  result: CalculationResult | null;
  onLoadExample: () => void;
}

export default function ResultSection({ result, onLoadExample }: ResultSectionProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center sm:p-12">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-6 ring-blue-50/60">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900 sm:text-lg">Belum Ada Hasil Estimasi</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
          Masukkan parameter kendaraan di sebelah kiri, lalu tekan tombol{" "}
          <span className="font-semibold text-slate-800">Hitung Estimasi BBM</span>.
        </p>
        <button
          type="button"
          onClick={onLoadExample}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
        >
          Coba Contoh (60 km, 12 km/L)
        </button>
      </div>
    );
  }

  const { daily, monthly, yearly, inputs } = result;
  const isZeroDistance = inputs.distanceKm === 0;

  return (
    <div className="space-y-5">
      {/* Parameter Recap Header */}
      <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Hasil Estimasi Kebutuhan & Biaya BBM
            </h2>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
            Perhitungan Aktif
          </span>
        </div>

        {/* Input Parameters Recap */}
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
          <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-400">Jarak Rata-rata:</span>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {formatNumberId(inputs.distanceKm)} <span className="text-xs font-medium text-slate-500">km / hari</span>
            </p>
          </div>
          <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-400">Efisiensi BBM:</span>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {formatNumberId(inputs.efficiencyKmPerLiter)} <span className="text-xs font-medium text-slate-500">km / Liter</span>
            </p>
          </div>
          <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-400">BBM & Harga:</span>
            <p className="mt-0.5 text-sm font-bold text-slate-900 truncate" title={`${inputs.fuelName} (${formatRupiah(inputs.pricePerLiter)}/L)`}>
              {inputs.fuelName} <span className="text-xs font-medium text-slate-500">({formatRupiah(inputs.pricePerLiter)}/L)</span>
            </p>
          </div>
        </div>

        {isZeroDistance && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="font-semibold">Informasi: Jarak tempuh harian bernilai 0 km.</p>
            <p className="mt-0.5">
              Kendaraan tidak menempuh jarak perjalanan harian, sehingga hasil konsumsi liter dan biaya bahan bakar adalah 0 L dan Rp0 untuk semua periode.
            </p>
          </div>
        )}
      </div>

      {/* 3 Main Period Cards matching Figma P component */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Harian */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-500">
                Estimasi Harian
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                1 Hari
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs text-slate-400">Biaya BBM:</span>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {formatRupiah(daily.cost)}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Konsumsi Liter:</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                {formatLiters(daily.liters)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {inputs.distanceKm} km ÷ {inputs.efficiencyKmPerLiter} km/L
            </div>
          </div>
        </div>

        {/* Card 2: Bulanan (Highlighted Primary Period) */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm shadow-blue-500/10">
          <div className="absolute top-0 right-0 bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded-bl-lg">
            30 Hari Konsisten
          </div>

          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-blue-800">
                Estimasi Bulanan
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs text-slate-400">Biaya BBM:</span>
              <p className="text-2xl font-black tracking-tight text-blue-700">
                {formatRupiah(monthly.cost)}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Konsumsi Liter:</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                {formatLiters(monthly.liters)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              {formatLiters(daily.liters)} × 30 hari
            </div>
          </div>
        </div>

        {/* Card 3: Tahunan */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-500">
                Estimasi Tahunan
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                365 Hari Konsisten
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs text-slate-400">Biaya BBM:</span>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {formatRupiah(yearly.cost)}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Konsumsi Liter:</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                {formatLiters(yearly.liters)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {formatLiters(daily.liters)} × 365 hari
            </div>
          </div>
        </div>
      </div>

      {/* Rincian & Formula Perhitungan matching Figma M & Bn */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-slate-900">
          Rincian Transparansi Perhitungan
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Perhitungan kebutuhan volume liter dan biaya bahan bakar minyak:
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Durasi</th>
                <th className="py-2.5 px-3">Perhitungan Liter</th>
                <th className="py-2.5 px-3">Volume (Liter)</th>
                <th className="py-2.5 px-3">Perhitungan Biaya</th>
                <th className="py-2.5 px-3 text-right">Total Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Harian</td>
                <td className="py-3 px-3">1 hari</td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                  {formatNumberId(inputs.distanceKm)} km ÷ {formatNumberId(inputs.efficiencyKmPerLiter)} km/L
                </td>
                <td className="py-3 px-3 font-bold text-blue-700">
                  {formatLiters(daily.liters)}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                  {formatLiters(daily.liters)} × {formatRupiah(inputs.pricePerLiter)}/L
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  {formatRupiah(daily.cost)}
                </td>
              </tr>
              <tr className="bg-blue-50/40">
                <td className="py-3 px-3 font-semibold text-blue-900">Bulanan</td>
                <td className="py-3 px-3 font-medium text-blue-800">30 hari</td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                  {formatLiters(daily.liters)} × 30 hari
                </td>
                <td className="py-3 px-3 font-bold text-blue-700">
                  {formatLiters(monthly.liters)}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                  {formatLiters(monthly.liters)} × {formatRupiah(inputs.pricePerLiter)}/L
                </td>
                <td className="py-3 px-3 text-right font-bold text-blue-800">
                  {formatRupiah(monthly.cost)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Tahunan</td>
                <td className="py-3 px-3">365 hari</td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                  {formatLiters(daily.liters)} × 365 hari
                </td>
                <td className="py-3 px-3 font-bold text-blue-700">
                  {formatLiters(yearly.liters)}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                  {formatLiters(yearly.liters)} × {formatRupiah(inputs.pricePerLiter)}/L
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  {formatRupiah(yearly.cost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
