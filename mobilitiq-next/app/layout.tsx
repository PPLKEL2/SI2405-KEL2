import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MobilitiQ — Simulator Konsumsi Energi EV (KEL2-67)",
  description:
    "Aplikasi simulator konsumsi energi kendaraan listrik (EV) mandiri berbasis tarif resmi PLN dan data pengujian Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="font-medium text-slate-700">MobilitiQ — Sprint Implementation</p>
            <p className="mt-1">
              Fokus Implementasi: <strong>KEL2-67</strong> (Simulator Konsumsi Energi EV) &amp;{" "}
              <strong>KEL2-73</strong> (Penilai Efisiensi BBM — Menunggu Konfirmasi AC).
            </p>
            <p className="mt-2 text-slate-400">
              Data tarif listrik mengacu pada rujukan resmi ESDM/PLN Triwulan IV 2024. Nilai SPKLU
              bersifat contoh (mock placeholder) yang dapat diedit oleh pengguna.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
