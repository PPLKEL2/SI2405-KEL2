import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MobilitiQ - Kalkulator Biaya BBM",
  description: "Kalkulator kebutuhan volume liter dan estimasi biaya bahan bakar minyak (BBM) kendaraan konvensional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
