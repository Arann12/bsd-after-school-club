import { OrangTuaSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Orang Tua — BSD After School Club",
  description: "Portal monitoring dan pembayaran orang tua BSD After School Club",
};

export default function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <OrangTuaSidebar />
      <div className="main-area">
        <Header
          greetingText="Halo, Ayah Budi!"
          showChildSelector={true}
          userName="Ayah Budi"
          userRole="Orang Tua"
          userInitial="AB"
          userColor="linear-gradient(135deg, #0284c7, #0369a1)"
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
