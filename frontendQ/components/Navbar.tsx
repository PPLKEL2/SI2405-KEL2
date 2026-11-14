"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isLandingPage = pathname === "/";

  const publicNavLinks = [
    { label: "Kalkulator BBM", href: "/kalkulator/bbm" },
    { label: "Perawatan", href: "/kalkulator/perawatan" },
    { label: "Energi EV", href: "/kalkulator/energi-ev" },
    { label: "Bandingkan", href: "/kalkulator/komparasi-biaya" },
    { label: "Katalog EV", href: "/katalog" },
    { label: "Peta Fasilitas", href: "/fasilitas/peta" },
  ];

  const roleNavLinks =
    user?.role === "MITRA"
      ? [
          { label: "Katalog EV", href: "/mitra/katalog" },
          { label: "Lokasi Fasilitas", href: "/mitra/fasilitas" },
          { label: "Harga Layanan", href: "/mitra/harga-layanan" },
          { label: "Peta Fasilitas", href: "/fasilitas/peta" },
        ]
      : user?.role === "SUPERADMIN"
      ? [
          { label: "Tarif Energi", href: "/admin/tarif-energi" },
          { label: "Insentif & Pajak", href: "/admin/insentif-pajak" },
          { label: "Katalog EV", href: "/katalog" },
          { label: "Peta Fasilitas", href: "/fasilitas/peta" },
        ]
      : publicNavLinks;

  const roleLabel =
    user?.role === "MITRA"
      ? "Admin Mitra"
      : user?.role === "SUPERADMIN"
      ? "Superadmin"
      : user?.role === "USER"
      ? "Pengguna"
      : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-heading text-[19px] font-extrabold tracking-tight text-slate-900"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB] text-white shadow-xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
          <span>
            Mobiliti<span className="text-[#2563EB]">Q</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu navigasi">
          {roleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#EEF5FF] text-[#2563EB]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{user.name}</span>
                  {roleLabel && (
                    <span
                      data-testid="navbar-role-badge"
                      className="rounded-md bg-[#EEF5FF] px-2 py-0.5 text-[11px] font-bold text-[#2563EB]"
                    >
                      {roleLabel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{user.city || user.email}</p>
              </div>

              {/* Avatar circle */}
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#2563EB] text-xs font-bold text-white shadow-xs">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "U"}
              </div>

              <button
                type="button"
                data-testid="logout-button"
                onClick={logout}
                title="Keluar dari akun"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Keluar"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              data-testid="nav-login-link"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#1D4ED8]"
            >
              Masuk
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Buka menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-3 lg:hidden">
          <div className="space-y-1">
            {roleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex h-10 items-center rounded-xl px-3 text-sm font-semibold transition ${
                  pathname === link.href
                    ? "bg-[#EEF5FF] text-[#2563EB]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
                <button
                  type="button"
                  data-testid="logout-button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                data-testid="nav-login-link"
                onClick={() => setMobileOpen(false)}
                className="block w-full rounded-xl bg-[#2563EB] py-2 text-center text-xs font-bold text-white"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
