import { GuruSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Guru — BSD After School Club",
  description: "Panel Guru BSD After School Club",
};

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
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
