import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Manajemen Tarif Energi — Superadmin MobilitiQ",
  description:
    "Portal pengelolaan acuan parameter harga BBM dan tarif PLN per golongan yang dipakai di seluruh kalkulator MobilitiQ.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white overflow-hidden antialiased">
      <AdminSidebar />
      <main className="flex-1 flex flex-col bg-white overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
