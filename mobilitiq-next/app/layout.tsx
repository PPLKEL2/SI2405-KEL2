import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "MobilitiQ — Platform Transisi & Kalkulator Kendaraan Listrik",
  description:
    "Hitung perbandingan biaya BBM dan listrik, cek kesiapan daya meteran rumah, dan temukan EV yang tepat untuk pengendara Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-[#f8fafc] text-slate-900 antialiased font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
