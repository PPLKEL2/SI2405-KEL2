"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard, useAuth } from "@/lib/auth-context";

const MITRA_MENU = [
  {
    href: "/mitra/katalog",
    label: "Katalog EV",
    icon: "catalog",
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
    icon: "facility",
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
    icon: "price",
  },
];

function MenuIcon({ name }: { name: string }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "catalog") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (name === "facility") {
    return (
      <svg {...common}>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M8 20v-6h8v6M10 10h.01M14 10h.01" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 7h16M4 12h16M4 17h10" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}

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
  const { user, logout } = useAuth();

  return (
    <RoleGuard allowedRoles={["MITRA"]}>
      <div className="min-h-[calc(100vh-64px)] bg-[#F6F8FB] text-[#0F172A]">
        <div className="flex min-h-[calc(100vh-64px)]">
          <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block">
            <div className="flex h-full flex-col px-3 py-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 px-2 font-heading text-[18px] font-extrabold tracking-tight text-slate-800"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2563EB] text-white">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4l2.5 1.5" />
                  </svg>
                </span>
                <span>
                  Mobiliti<span className="text-[#2563EB]">Q</span>
                </span>
              </Link>

              <div className="mt-8 px-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Portal Mitra
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-500">
                  {user?.organizationName || "Mitra Resmi EV"}
                </p>
              </div>

              <nav className="mt-5 space-y-1" aria-label="Menu portal mitra">
                <Link
                  href="/mitra"
                  className={`flex h-9 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition ${
                    pathname === "/mitra"
                      ? "bg-[#EEF5FF] text-[#2563EB]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-current">⌂</span>
                  Dashboard
                </Link>
                {MITRA_MENU.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex h-9 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition ${
                        active
                          ? "bg-[#EEF5FF] text-[#2563EB]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className={active ? "text-[#2563EB]" : "text-slate-400"}>
                        <MenuIcon name={item.icon} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5 font-heading text-[18px] font-extrabold tracking-tight text-slate-800 lg:hidden"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2563EB] text-white">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 8v4l2.5 1.5" />
                    </svg>
                  </span>
                  <span>
                    Mobiliti<span className="text-[#2563EB]">Q</span>
                  </span>
                </Link>
                <div className="hidden lg:block" />
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[11px] font-bold text-slate-800">
                        {user?.name || "Pengguna"}
                      </span>
                      <span className="rounded bg-[#EEF5FF] px-1.5 py-0.5 text-[9px] font-bold text-[#2563EB]">
                        {user?.role === "MITRA" ? "Admin Mitra" : user?.role || "User"}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400">{user?.city || user?.email}</p>
                  </div>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">
                    {(user?.name || "U")
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    title="Keluar dari akun"
                    aria-label="Keluar dari akun"
                    className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 17l5-5-5-5M15 12H3" />
                      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden" aria-label="Menu portal mitra">
                {MITRA_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                      pathname === item.href
                        ? "bg-[#EEF5FF] text-[#2563EB]"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
              {children}
            </div>
          </div>
        </div>
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
            <span className="font-bold text-slate-900 text-sm tracking-wide">
              PORTAL MITRA
            </span>

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
