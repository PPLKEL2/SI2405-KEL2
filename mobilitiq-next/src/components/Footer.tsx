"use client";

import React from "react";

interface FooterProps {
  onNavigateToCalculator?: () => void;
  onNavigateToLanding?: () => void;
}

export default function Footer({ onNavigateToCalculator, onNavigateToLanding }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-5 sm:px-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-3">
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="flex items-center gap-2.5 text-left transition hover:opacity-90"
          >
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-800 text-white shadow-sm">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="text-lg font-bold text-slate-900">MobilitiQ</span>
          </button>
          <p className="max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">
            Kalkulator &amp; konsultasi transisi kendaraan BBM ke listrik untuk pengendara Indonesia.
          </p>
        </div>

        {/* Links: Produk */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Produk</h4>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-500">
            <li>
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="hover:text-blue-600 transition"
              >
                Kalkulator Biaya BBM
              </button>
            </li>
            <li><span className="text-slate-400">Katalog EV</span></li>
            <li><span className="text-slate-400">Peta Fasilitas</span></li>
          </ul>
        </div>

        {/* Links: Portal */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Portal</h4>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-500">
            <li><span className="text-slate-400">Dashboard Mitra</span></li>
            <li><span className="text-slate-400">Superadmin</span></li>
            <li><span className="text-slate-400">Design System</span></li>
          </ul>
        </div>

        {/* Links: Bantuan */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Bantuan</h4>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-500">
            <li>
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="hover:text-blue-600 transition"
              >
                Konsultasi Biaya
              </button>
            </li>
            <li><span className="text-slate-400">Laporan PDF</span></li>
            <li><span className="text-slate-400">Kebijakan</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-5 text-center text-xs text-slate-400 sm:text-[13px]">
        © 2026 MobilitiQ. Estimasi bersifat indikatif dan bukan penawaran resmi.
      </div>
    </footer>
  );
}
