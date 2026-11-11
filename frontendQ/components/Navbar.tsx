"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Kalkulator", href: "/kalkulator/energi-ev" },
    { label: "Bandingkan", href: "/kalkulator/komparasi-biaya" },
    { label: "Peta Fasilitas", href: "/fasilitas/peta" },
    { label: "Konsultasi", href: "#konsultasi" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 @3xl:px-8">
        {/* Brand Logo persis Figma Fn */}
        <Link href="/" className="inline-flex items-center gap-2 font-heading text-[19px] font-extrabold tracking-tight text-brand" aria-label="Beranda MobilitiQ">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-white">
            <svg
              width="18"
              height="18"
              style={{ width: 18, height: 18, maxWidth: 18, maxHeight: 18 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <span className="text-ink">MobilitiQ</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 @3xl:flex" aria-label="Menu utama">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Action & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-xl bg-electric px-4 py-2 text-sm font-bold text-white transition hover:bg-electric-dark @3xl:inline-flex"
          >
            Masuk
          </button>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl border border-line text-slate-700 hover:bg-slate-100 @3xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="rise border-t border-line bg-white px-5 pb-5 pt-2 @3xl:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-12 w-full items-center border-b border-line text-left text-[15px] font-semibold text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-electric py-3 text-center text-[15px] font-bold text-white hover:bg-electric-dark"
          >
            Masuk
          </button>
        </div>
      )}
    </header>
  );
}
