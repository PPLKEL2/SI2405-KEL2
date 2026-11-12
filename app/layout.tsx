import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "MobilitiQ — Ekosistem Kendaraan Listrik",
  description: "Manajemen lokasi dan harga layanan fasilitas kendaraan listrik.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line bg-white py-8 text-center text-xs text-muted">
          <p className="font-heading text-sm font-semibold text-foreground">MobilitiQ</p>
          <p className="mt-1">Manajemen lokasi dan harga layanan fasilitas kendaraan listrik.</p>
        </footer>
      </body>
    </html>
  );
}
