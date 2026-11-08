import type { Metadata } from "next";
import { EnergyPricingManagement } from "@/components/admin/EnergyPricingManagement";

export const metadata: Metadata = {
  title: "Manajemen Tarif Energi — Superadmin MobilitiQ",
  description:
    "Portal pengelolaan acuan parameter harga BBM dan tarif PLN per golongan yang dipakai di seluruh kalkulator MobilitiQ.",
};

export default function AdminEnergyPricingPage() {
  return <EnergyPricingManagement />;
}
