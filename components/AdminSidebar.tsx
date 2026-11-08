"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LayoutDashboard, MapPin } from "lucide-react";

// Item tanpa href belum punya halaman dan tampil nonaktif.
const ITEMS = [
  { label: "Dashboard Mitra", icon: LayoutDashboard },
  { label: "Katalog EV", icon: Car },
  { label: "Showroom & Fasilitas", icon: MapPin, href: "/admin/fasilitas" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Menu admin mitra">
      {ITEMS.map(({ label, icon: Icon, href }) =>
        href ? (
          <Link
            key={label}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm transition ${pathname.startsWith(href) ? "bg-blue-50 font-semibold text-brand" : "font-medium text-muted hover:bg-slate-100 hover:text-foreground"}`}
          >
            <Icon className="h-4 w-4" aria-hidden />{label}
          </Link>
        ) : (
          <span key={label} aria-disabled="true" title="Segera hadir" className="flex min-h-11 shrink-0 cursor-not-allowed items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-slate-400">
            <Icon className="h-4 w-4" aria-hidden />{label}
          </span>
        ),
      )}
    </nav>
  );
}
