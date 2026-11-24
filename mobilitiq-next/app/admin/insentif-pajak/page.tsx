import type { Metadata } from "next";
import { EvIncentivesManagement } from "@/components/admin/EvIncentivesManagement";

export const metadata: Metadata = {
  title: "Insentif & Pajak EV — Superadmin MobilitiQ",
  description:
    "Portal pengelolaan aturan parameter insentif, bea masuk, pajak, dan subsidi kendaraan listrik (EV) untuk kalkulator pembelian dan simulasi TCO.",
};

export default function AdminIncentivesPage() {
  return <EvIncentivesManagement />;
}

