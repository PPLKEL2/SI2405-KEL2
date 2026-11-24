import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MobilitiQ — Portal Mitra",
  description: "Kelola katalog kendaraan listrik dealer sebagai referensi simulasi pengguna MobilitiQ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
