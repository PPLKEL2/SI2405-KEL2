"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard, useAuth } from "@/lib/auth-context";

const ADMIN_TABS = [
  {
    href: "/admin/tarif-energi",
    label: "Manajemen Tarif Energi",
    subtitle: "Tarif Listrik PLN, SPKLU & BBM + Riwayat Audit",
  },
  {
    href: "/admin/insentif-pajak",
    label: "Insentif & Pajak EV",
    subtitle: "PPN DTP, PKB, BBNKB & Subsidi Konversi",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <div className="bg-[#F8FAFC] text-[#0F172A]">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1E40AF] border border-blue-200">
                  Konsol Regulasi Superadmin • {user?.name || "Superadmin"}
                </span>
                <h1 className="mt-1.5 text-2xl font-bold text-slate-900">
                  Manajemen Parameter Tarif Energi & Kebijakan Fiskal EV
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                {ADMIN_TABS.map((tab) => {
                  const active = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition border ${
                        active
                          ? "bg-[#1E40AF] text-white border-[#1E40AF] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div>{tab.label}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
