"use client";

import { OwnerSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AuthGuard from "@/components/auth/AuthGuard";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="owner">
      <div className="app-shell">
        <OwnerSidebar />
        <div className="main-area">
          <Header />
          <main className="page-content">
            <Breadcrumb />
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
