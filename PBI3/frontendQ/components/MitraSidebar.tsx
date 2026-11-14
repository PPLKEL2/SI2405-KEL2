"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  href?: string; // tanpa href = belum tersedia
  icon: ReactNode;
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    label: "Katalog EV",
    href: "/mitra/katalog",
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      </svg>
    ),
  },
  {
    label: "Showroom & Fasilitas",
    icon: (
      <svg {...svgProps}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    label: "Harga Layanan",
    icon: (
      <svg {...svgProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function MitraSidebar() {
  const pathname = usePathname();

  return (
    <aside className="mq-side" aria-label="Menu portal mitra">
      <div className="mq-brand">
        <b>MobilitiQ</b>
        <span className="mq-tag">MITRA</span>
      </div>
      <div className="mq-sec">PORTAL MITRA</div>
      <ul className="mq-nav">
        {ITEMS.map((item) =>
          item.href ? (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`mq-nav-item${pathname.startsWith(item.href) ? " is-active" : ""}`}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ) : (
            <li key={item.label}>
              <span className="mq-nav-item is-disabled" aria-disabled="true" title="Segera hadir">
                {item.icon}
                {item.label}
              </span>
            </li>
          )
        )}
        <li className="mq-nav-gap" aria-hidden="true" />
        <li>
          <span className="mq-nav-item is-disabled" aria-disabled="true" title="Segera hadir">
            <svg {...svgProps}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </span>
        </li>
      </ul>
    </aside>
  );
}
