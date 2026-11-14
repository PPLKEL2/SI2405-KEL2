"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RoleGuard, useAuth } from "@/lib/auth-context";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/mitra",
    label: "Dashboard",
    exact: true,
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#1E40AF]" : "text-slate-500"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/mitra/katalog",
    label: "Katalog EV",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#1E40AF]" : "text-slate-500"}`}
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
    ),
  },
  {
    href: "/mitra/fasilitas",
    label: "Showroom & Fasilitas",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#1E40AF]" : "text-slate-500"}`}
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
    ),
  },
  {
    href: "/mitra/harga-layanan",
    label: "Harga Layanan",
    icon: (active) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#1E40AF]" : "text-slate-500"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
];

export default function MitraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <RoleGuard allowedRoles={["MITRA", "SUPERADMIN"]}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col md:flex-row">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sticky top-0 z-40">
          <Link href="/mitra" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-slate-900">MobilitiQ</span>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#1E40AF] border border-blue-200">
              MITRA
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Buka navigasi mitra"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 tracking-wider">
              PORTAL MITRA
            </div>
            {NAV_ITEMS.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-[#1E40AF] font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon(active)}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Desktop Sidebar (1:1 with Figma Frame 22) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white min-h-screen px-4 py-6 shrink-0 sticky top-0 h-screen">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              M
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              MobilitiQ
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E40AF] border border-blue-200 tracking-wider">
              MITRA
            </span>
          </div>

          {/* Section Heading */}
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 tracking-wider">
            PORTAL MITRA
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-[#1E40AF]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon(active)}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
