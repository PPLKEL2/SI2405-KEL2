import Link from "next/link";

export function Footer() {
  const columns = [
    {
      title: "Produk",
      links: [
        { label: "Kalkulator Biaya", href: "/kalkulator/energi-ev" },
        { label: "Katalog EV", href: "/kalkulator/energi-ev" },
        { label: "Peta Fasilitas", href: "/fasilitas/peta" },
      ],
    },
    {
      title: "Portal",
      links: [
        { label: "Dashboard Mitra", href: "#" },
        { label: "Superadmin", href: "#" },
        { label: "Design System", href: "#" },
      ],
    },
    {
      title: "Bantuan",
      links: [
        { label: "Konsultasi", href: "#" },
        { label: "Laporan PDF", href: "#" },
        { label: "Riwayat", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-12 @3xl:grid-cols-[1.4fr_1fr_1fr_1fr] @3xl:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-[19px] font-extrabold tracking-tight text-brand">
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
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-mute">
            Kalkulator &amp; konsultasi transisi kendaraan BBM ke listrik untuk pengendara Indonesia.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold text-ink">{col.title}</h4>
            <ul className="mt-3 space-y-1">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="min-h-9 text-sm text-mute hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-5 py-5 text-center text-[13px] text-mute">
        &copy; 2026 MobilitiQ. Estimasi bersifat indikatif dan bukan penawaran resmi.
      </div>
    </footer>
  );
}
