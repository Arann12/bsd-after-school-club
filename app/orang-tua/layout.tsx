"use client";

import { OrangTuaSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

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
