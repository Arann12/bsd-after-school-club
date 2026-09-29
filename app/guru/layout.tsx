"use client";

import { GuruSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <GuruSidebar />
      <div className="main-area">
        <Header userRole="Guru Pengajar" />
        <main className="page-content">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
