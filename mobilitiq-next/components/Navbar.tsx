"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo matching Figma: rounded-[10px] icon + MobilitiQ */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-heading text-[19px] font-extrabold tracking-tight text-blue-900 transition hover:opacity-90"
          aria-label="Beranda MobilitiQ"
        >
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-700 text-white shadow-xs">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>
          <span className="text-slate-900">
            Mobiliti<span className="text-blue-600">Q</span>
          </span>
          <span className="hidden text-xs font-normal text-slate-400 sm:inline sm:border-l sm:border-slate-200 sm:pl-2.5">
            Platform Analisis Energi Kendaraan
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Navigasi Utama">
          <Link
            href="/"
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              isActive("/")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/kalkulator/energi-ev"
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              isActive("/kalkulator")
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Simulasi Energi EV
          </Link>
          <Link
            href="/admin/parameter-energi"
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              isActive("/admin")
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Kelola Tarif
          </Link>
          <div className="ml-2 border-l border-slate-200 pl-3">
            <Link
              href="/kalkulator/energi-ev"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:bg-blue-800"
            >
              Mulai Simulasi
            </Link>
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Menu navigasi"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
              isActive("/") ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/kalkulator/energi-ev"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
              isActive("/kalkulator") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Simulasi Energi Kendaraan Listrik
          </Link>
          <Link
            href="/admin/parameter-energi"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
              isActive("/admin") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Kelola Tarif Energi
          </Link>
        </div>
      )}
    </header>
  );
}
