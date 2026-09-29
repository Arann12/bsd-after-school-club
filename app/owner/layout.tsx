"use client";

import { OwnerSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <OwnerSidebar />
      <div className="main-area">
        <Header userRole="Owner & Founder" />
        <main className="page-content">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
