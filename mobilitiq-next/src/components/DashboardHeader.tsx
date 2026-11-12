"use client";

import React from "react";

interface DashboardHeaderProps {
  onToggleMobileMenu?: () => void;
  onBackToLanding?: () => void;
}

export default function DashboardHeader({
  onToggleMobileMenu,
  onBackToLanding,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Buka Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-bold text-slate-900">MobilitiQ</span>
      </div>

      {/* Center Spacer */}
      <div className="hidden lg:block"></div>

      {/* Right User Avatar (Matching Figma RA - Rina Anggraini, Jakarta · 1.300 VA) */}
      <div className="flex items-center gap-4">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition"
          >
            ← Beranda
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-xs text-white shadow-xs">
            RA
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              Rina Anggraini
            </span>
            <span className="text-[11px] text-slate-500">
              Jakarta · 1.300 VA
            </span>
          </div>
        </div>

        {/* Exit / Logout Icon matching Figma */}
        <button
          type="button"
          onClick={onBackToLanding}
          title="Keluar / Kembali ke Beranda"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

