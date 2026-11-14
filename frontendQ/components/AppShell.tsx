"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/lib/auth-context";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const sidebarLinks = [
    {
      label: "Biaya BBM",
      href: "/kalkulator/bbm",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
          <path d="M15 11h2a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-3-3" />
          <line x1="7" y1="9" x2="11" y2="9" />
        </svg>
      ),
    },
    {
      label: "Perawatan BBM",
      href: "/kalkulator/perawatan",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      label: "Energi EV",
      href: "/kalkulator/energi-ev",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      label: "Katalog EV",
      href: "/katalog",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      label: "Bandingkan",
      href: "/kalkulator/komparasi-biaya",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      label: "Peta & Rute",
      href: "/fasilitas/peta",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
  ];

  const mitraLinks = [
    { label: "Kelola Katalog", href: "/mitra/katalog" },
    { label: "Lokasi Fasilitas", href: "/mitra/fasilitas" },
    { label: "Harga Layanan", href: "/mitra/harga-layanan" },
  ];

  const adminLinks = [
    { label: "Tarif Energi", href: "/admin/tarif-energi" },
    { label: "Insentif & Pajak", href: "/admin/insentif-pajak" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
      {/* Sidebar Desktop */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-slate-200 bg-white py-6 lg:block">
        <div className="px-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Simulasi &amp; Layanan
          </p>
          <nav className="mt-2 space-y-1">
            {sidebarLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-[#EEF5FF] text-[#2563EB]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className={active ? "text-[#2563EB]" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bagian Khusus Mitra jika login sebagai MITRA */}
          {user?.role === "MITRA" && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Portal Mitra
              </p>
              <nav className="mt-2 space-y-1">
                {mitraLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "bg-[#EEF5FF] text-[#2563EB]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Bagian Khusus Superadmin jika login sebagai SUPERADMIN */}
          {user?.role === "SUPERADMIN" && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Portal Superadmin
              </p>
              <nav className="mt-2 space-y-1">
                {adminLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "bg-[#EEF5FF] text-[#2563EB]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}

export default AppShell;

