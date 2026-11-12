"use client";

import React from "react";

export type DashboardTab =
  | "ringkasan"
  | "biaya-bbm"
  | "energi-ev"
  | "katalog-ev"
  | "bandingkan"
  | "pembelian"
  | "degradasi"
  | "sinking-fund"
  | "daya-rumah"
  | "jarak-tempuh"
  | "tco-payback"
  | "emisi"
  | "peta"
  | "laporan-pdf"
  | "riwayat";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onBackToLanding?: () => void;
}

export default function DashboardSidebar({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  onBackToLanding,
}: DashboardSidebarProps) {
  const menuItems: { id: DashboardTab; label: string; icon: string }[] = [
    { id: "ringkasan", label: "Ringkasan", icon: "squares" },
    { id: "biaya-bbm", label: "Biaya BBM", icon: "gas" },
    { id: "energi-ev", label: "Energi EV", icon: "bolt" },
    { id: "katalog-ev", label: "Katalog EV", icon: "car" },
    { id: "bandingkan", label: "Bandingkan", icon: "arrows-left-right" },
    { id: "pembelian", label: "Pembelian", icon: "credit-card" },
    { id: "degradasi", label: "Degradasi", icon: "battery" },
    { id: "sinking-fund", label: "Sinking Fund", icon: "wallet" },
    { id: "daya-rumah", label: "Daya Rumah", icon: "home" },
    { id: "jarak-tempuh", label: "Jarak Tempuh", icon: "gauge" },
    { id: "tco-payback", label: "TCO & Payback", icon: "chart" },
    { id: "emisi", label: "Emisi", icon: "leaf" },
    { id: "peta", label: "Peta", icon: "map-pin" },
    { id: "laporan-pdf", label: "Laporan PDF", icon: "document" },
    { id: "riwayat", label: "Riwayat", icon: "history" },
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case "squares":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "gas":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 14V6a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-2m0-6h1.5a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H19M7 10h10" />
          </svg>
        );
      case "bolt":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "car":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM19 17h-6m-4 0H5m14-5l-2-5H7L5 12m14 0v5M5 12v5" />
          </svg>
        );
      case "arrows-left-right":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case "credit-card":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "battery":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h12a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2zm15 3h1v2h-1v-2z" />
          </svg>
        );
      case "wallet":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm13 5a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case "home":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "gauge":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "chart":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "leaf":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "map-pin":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "history":
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="3" strokeWidth={1.75} />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Mobiliti<span className="text-blue-600">Q</span>
              </span>
            </div>
          </button>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Tutup Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {renderIcon(item.icon)}
                </span>
                <span className="truncate">{item.label}</span>
                {item.id === "biaya-bbm" && (
                  <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User / Quick Action */}
        <div className="border-t border-slate-100 p-3">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Halaman Utama</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

