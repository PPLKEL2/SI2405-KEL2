import type { Metadata } from "next";
import { VehicleCatalogManager } from "@/components/VehicleCatalogManager";

export const metadata: Metadata = {
  title: "Manajemen Katalog EV — Portal Mitra MobilitiQ",
  description: "Kelola unit kendaraan listrik di katalog dealer Anda.",
};

export default function KatalogEvPage() {
  return <VehicleCatalogManager />;
}
