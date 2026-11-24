"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  onNotify?: (message: string) => void;
}

export function AdminSidebar({ onNotify }: AdminSidebarProps) {
  const pathname = usePathname();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const showDevNotice = (featureName: string) => {
    const msg = `Fitur ${featureName} sedang dalam tahap pengembangan.`;
    if (onNotify) {
      onNotify(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const isTarifActive =
    pathname.startsWith("/admin/parameter-energi") ||
    pathname.startsWith("/admin/tarif-energi") ||
    pathname === "/admin";

  const isIncentiveActive = pathname.startsWith("/admin/insentif-pajak");

  const renderNavItems = () => (
    <nav className="space-y-1 px-3" aria-label="Menu Superadmin">
      {/* 1. Analitik */}
      <button
        type="button"
        onClick={() => {
          showDevNotice("Analitik");
          setMobileMenuOpen(false);
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        <svg
          className="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Analitik</span>
      </button>

      {/* 2. Tarif Energi */}
      <Link
        href="/admin/parameter-energi"
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
          isTarifActive
            ? "bg-blue-50/90 text-blue-700 shadow-2xs font-bold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <svg
          className={`h-4 w-4 ${isTarifActive ? "text-blue-600" : "text-slate-400"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 2v6h6" />
          <path d="M3 8a9 9 0 0 1 15.3-6.4" />
          <path d="M21 22v-6h-6" />
          <path d="M21 16a9 9 0 0 1-15.3 6.4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>Tarif Energi</span>
      </Link>

      {/* 3. Insentif & Pajak (PBI 10) */}
      <Link
        href="/admin/insentif-pajak"
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
          isIncentiveActive
            ? "bg-blue-50/90 text-blue-700 shadow-2xs font-bold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <svg
          className={`h-4 w-4 ${isIncentiveActive ? "text-blue-600" : "text-slate-400"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span>Insentif &amp; Pajak</span>
      </Link>

      {/* 4. Verifikasi Mitra */}
      <button
        type="button"
        onClick={() => {
          showDevNotice("Verifikasi Mitra");
          setMobileMenuOpen(false);
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        <svg
          className="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
        <span>Verifikasi Mitra</span>
      </button>
    </nav>
  );

  return (
    <>
      {/* 1. Mobile Header Bar (Screen < md) */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-heading text-lg font-extrabold tracking-tight text-blue-900"
          >
            Mobiliti<span className="text-blue-600">Q</span>
          </Link>
          <span className="rounded bg-slate-100 border border-slate-200/70 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-slate-500 uppercase">
            SUPERADMIN
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle menu admin"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 2. Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white pb-4 shadow-xl z-50">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
              <span className="font-heading text-lg font-extrabold text-blue-900">
                Mobiliti<span className="text-blue-600">Q</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 pt-4 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                KENDALI PLATFORM
              </p>
            </div>
            {renderNavItems()}
            <div className="mt-auto px-4 pt-4 border-t border-slate-100">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                <span>Keluar ke Beranda</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Sidebar (Screen >= md, Fixed Left) */}
      <aside className="w-64 flex-col justify-between border-r border-slate-200/80 bg-white h-screen shrink-0 hidden md:flex select-none">
        <div>
          {/* Brand Header with SUPERADMIN Badge */}
          <div className="flex items-center gap-2.5 px-6 pt-6 pb-4">
            <Link
              href="/"
              className="font-heading text-xl font-extrabold tracking-tight text-blue-900 transition hover:opacity-90"
            >
              Mobiliti<span className="text-blue-600">Q</span>
            </Link>
            <span className="rounded bg-slate-100 border border-slate-200/70 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
              SUPERADMIN
            </span>
          </div>

          {/* Section: KENDALI PLATFORM */}
          <div className="px-6 pt-5 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              KENDALI PLATFORM
            </p>
          </div>

          {/* Navigation Links */}
          {renderNavItems()}
        </div>

        {/* Footer Sidebar: Keluar / Kembali ke Publik */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            title="Keluar ke Beranda MobilitiQ (Mode Pengembangan)"
          >
            <svg
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Keluar</span>
          </Link>
          <div className="mt-2 px-3 text-[11px] text-slate-400">
            Superadmin (mode dev)
          </div>
        </div>
      </aside>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <span className="text-blue-600">ℹ</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
