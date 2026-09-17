"use client";

import { usePathname } from "next/navigation";
import { OrangTuaSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AuthGuard from "@/components/auth/AuthGuard";

export default function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Halaman login tidak perlu AuthGuard
  if (pathname === "/orang-tua/login") return <>{children}</>;

  return (
    <AuthGuard requiredRole="parent">
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
          <main className="page-content">
            <Breadcrumb />
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
