import "./mitra.css";
import { MitraSidebar } from "@/components/MitraSidebar";

export default function MitraLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mq-shell">
      <MitraSidebar />
      <main className="mq-main">{children}</main>
    </div>
  );
}
