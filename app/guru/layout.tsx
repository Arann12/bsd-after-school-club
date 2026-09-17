"use client";

import { usePathname } from "next/navigation";
import { GuruSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AuthGuard from "@/components/auth/AuthGuard";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Halaman login tidak perlu AuthGuard
  if (pathname === "/guru/login") return <>{children}</>;

  return (
    <AuthGuard requiredRole="teacher">
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
    </AuthGuard>
  );
}
