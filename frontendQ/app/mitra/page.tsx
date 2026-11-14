"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getMitraDashboardSummary,
  formatNumberId,
  type MitraDashboardSummary,
} from "@/lib/api";

const DEFAULT_SUMMARY: MitraDashboardSummary = {
  activeCatalogUnits: 14,
  promoUnits: 2,
  weeklyLeads: 187,
  weeklyLeadsGrowth: "+18%",
  totalRecommendedInSimulations: 1061,
  totalFacilities: 3,
  facilityBreakdown: "2 SPKLU · 1 showroom",
  dailyLeads: [
    { day: "Sen", leads: 22 },
    { day: "Sel", leads: 31 },
    { day: "Rab", leads: 27 },
    { day: "Kam", leads: 35 },
    { day: "Jum", leads: 29 },
    { day: "Sab", leads: 24 },
    { day: "Min", leads: 19 },
  ],
  topRecommendedUnits: [
    { name: "BYD Seagull", recommendations: 482, leadRate: 36 },
    { name: "Wuling Air ev Long Range", recommendations: 311, leadRate: 22 },
    { name: "Polytron Fox-R", recommendations: 268, leadRate: 41 },
  ],
};

export default function MitraDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<MitraDashboardSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getMitraDashboardSummary();
        if (isMounted && data) {
          setSummary(data);
        }
      } catch {
        // Fallback to default summary if offline or guest preview
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const maxDailyLead = Math.max(
    ...summary.dailyLeads.map((d) => d.leads),
    35
  );

  const maxRecommendation = Math.max(
    ...summary.topRecommendedUnits.map((u) => u.recommendations),
    482
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Mitra
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.organizationName || "Showroom EV Pondok Indah"} · {user?.city || "Jakarta Selatan"}
          </p>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3.5 py-1 text-xs font-semibold text-[#15803D] border border-[#BBF7D0]">
            <svg
              className="w-3.5 h-3.5 text-[#15803D]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Terverifikasi</span>
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unit aktif di katalog */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Unit aktif di katalog
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9l2-4h14l2 4v7a1 1 0 01-1 1h-1a2 2 0 01-4 0H9a2 2 0 01-4 0H4a1 1 0 01-1-1V9z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "..." : summary.activeCatalogUnits}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summary.promoUnits} unit sedang promo
            </div>
          </div>
        </div>

        {/* Card 2: Lead 7 hari */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Lead 7 hari
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#059669]">
              {loading ? "..." : summary.weeklyLeads}
            </div>
            <div className="mt-1">
              <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#059669]">
                {summary.weeklyLeadsGrowth}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Direkomendasikan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Direkomendasikan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "..." : formatNumberId(summary.totalRecommendedInSimulations)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              dalam hasil simulasi
            </div>
          </div>
        </div>

        {/* Card 4: Titik fasilitas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Titik fasilitas
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? "..." : summary.totalFacilities}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summary.facilityBreakdown}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Panels: Lead per hari & Unit paling sering direkomendasikan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Lead per hari */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Lead per hari</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengguna yang menekan &quot;Hubungi showroom&quot;
            </p>
          </div>

          {/* Bar Chart Container */}
          <div className="mt-8 pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 sm:h-56">
              {summary.dailyLeads.map((item) => {
                const heightPercent = Math.max(
                  15,
                  Math.round((item.leads / maxDailyLead) * 100)
                );
                return (
                  <div
                    key={item.day}
                    className="flex flex-col items-center h-full justify-end group"
                  >
                    {/* Value label on top of bar */}
                    <span className="text-xs font-bold text-slate-700 mb-1.5 transition-transform group-hover:-translate-y-0.5">
                      {item.leads}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-full">
                      <div
                        className="w-full bg-[#2563EB] rounded-t-lg transition-all duration-500 hover:bg-[#1D4ED8]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label at bottom */}
                    <span className="text-xs font-medium text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Unit paling sering direkomendasikan */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Unit paling sering direkomendasikan
            </h2>
          </div>

          <div className="mt-6 space-y-6 flex-1 flex flex-col justify-around">
            {summary.topRecommendedUnits.map((unit) => {
              const barWidth = Math.max(
                20,
                Math.round((unit.recommendations / maxRecommendation) * 100)
              );
              return (
                <div key={unit.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">
                      {unit.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {unit.recommendations}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="text-xs text-slate-500">
                    {unit.leadRate}% lanjut ke lead
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

