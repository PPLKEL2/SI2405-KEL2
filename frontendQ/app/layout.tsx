import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "MobilitiQ — Platform Simulasi & Ekosistem Kendaraan Listrik",
  description:
    "Hitung biaya BBM & perawatan, jelajahi katalog EV, simulasikan konsumsi kWh, bandingkan biaya operasional, dan temukan rute ke SPKLU/SPBKLU terdekat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-[#f8fafc] text-slate-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

