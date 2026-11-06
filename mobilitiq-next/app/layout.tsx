import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MobilitiQ — Platform Analisis & Simulasi Energi Kendaraan",
  description:
    "Hitung estimasi penghematan biaya operasional, konsumsi energi kendaraan listrik (EV), dan perbandingan bahan bakar konvensional secara objektif berbasis regulasi resmi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
            <div className="flex items-center justify-center gap-2 font-heading text-sm font-bold text-slate-900">
              <span className="grid h-5 w-5 place-items-center rounded bg-blue-700 text-white text-[10px]">
                ⚡
              </span>
              <span>Mobiliti<span className="text-blue-600">Q</span></span>
            </div>
            <p className="text-slate-600">
              Platform Simulasi Konsumsi Energi &amp; Analisis Efisiensi Kendaraan
            </p>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Data tarif listrik mengacu pada rujukan resmi Kementerian ESDM dan PT PLN (Persero).
              Hasil kalkulasi bersifat estimasi objektif untuk membantu perencanaan mobilitas Anda.
            </p>
            <p className="pt-2 text-slate-400">
              &copy; 2026 MobilitiQ. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
