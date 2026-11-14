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
  },
  {
    href: "/mitra/fasilitas",
    label: "Showroom & Fasilitas",
    icon: "facility",
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
      </div>
    </RoleGuard>
  );
}
