"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

// Menu sesuai mockup. Item tanpa href belum punya halaman dan tampil nonaktif.
const MENU = [
  { label: "Bandingkan" },
  { label: "Peta Fasilitas", href: "/admin/fasilitas" },
  { label: "Konsultasi" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const itemClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-blue-50 text-brand" : "text-muted hover:bg-slate-100 hover:text-foreground"}`;
  const disabledClass = "cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium text-slate-400";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/admin/fasilitas" className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight text-brand">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-action text-white"><Zap className="h-4.5 w-4.5" aria-hidden /></span>
          MobilitiQ
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {MENU.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className={itemClass(pathname.startsWith(item.href))}>{item.label}</Link>
            ) : (
              <span key={item.label} className={disabledClass} aria-disabled="true" title="Segera hadir">{item.label}</span>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" disabled title="Segera hadir" className="hidden h-10 cursor-not-allowed rounded-lg bg-action px-5 text-sm font-semibold text-white opacity-60 md:block">Masuk</button>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Buka menu" className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-slate-100 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-white px-4 py-3 md:hidden" aria-label="Navigasi seluler">
          <div className="flex flex-col gap-1">
            {MENU.map((item) =>
              item.href ? (
                <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className={`${itemClass(pathname.startsWith(item.href))} flex min-h-11 items-center`}>{item.label}</Link>
              ) : (
                <span key={item.label} className={`${disabledClass} flex min-h-11 items-center`} aria-disabled="true">{item.label} <span className="ml-2 text-xs">Segera hadir</span></span>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
