"use client";

import { GuruSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <GuruSidebar />
      <div className="main-area">
        <Header
          userName="Ibu Sarah"
          userEmail="sarah@bsdafterschool.com"
          userInitial="S"
          userRole="Guru Pengajar"
          userColor="linear-gradient(135deg, #1a5c8a, #3AABE3)"
        />
        <main className="page-content">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
