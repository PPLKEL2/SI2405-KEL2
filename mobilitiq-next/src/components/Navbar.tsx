"use client";

import React from "react";

interface NavbarProps {
  activeTab: "landing" | "calculator";
  onSelectTab: (tab: "landing" | "calculator") => void;
}

export default function Navbar({ activeTab, onSelectTab }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        {/* Brand Logo & Name (Clicks to Landing Page) */}
        <button
          type="button"
          onClick={() => onSelectTab("landing")}
          className="flex items-center gap-2.5 text-left transition hover:opacity-90 cursor-pointer"
          aria-label="Beranda MobilitiQ"
        >
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-800 text-white shadow-sm">
            {/* Speedometer Gauge Icon matching Figma Re icon */}
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.25"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            MobilitiQ
          </span>
        </button>

        {/* Center Navigation Links matching Figma */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Menu utama">
          <button
            type="button"
            onClick={() => onSelectTab("landing")}
            className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition-colors ${
              activeTab === "landing"
                ? "bg-blue-50 text-blue-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Beranda
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("calculator")}
            className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition-colors ${
              activeTab === "calculator"
                ? "bg-blue-50 text-blue-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Kalkulator
          </button>

          <span className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Bandingkan
          </span>
          <span className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Peta Fasilitas
          </span>
          <span className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Konsultasi
          </span>
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab("calculator")}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
          >
            Kalkulator BBM
          </button>
        </div>
      </div>
    </header>
  );
}
