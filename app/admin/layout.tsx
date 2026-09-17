"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Halaman login tidak perlu AuthGuard
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <AuthGuard requiredRole="admin">
      <div className="app-shell">
        <AdminSidebar />
        <div className="main-area">
          <Header
            userName="Admin"
            userEmail="admin@bsdafterschool.com"
            userInitial="A"
            userColor="linear-gradient(135deg, #10b981, #059669)"
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
