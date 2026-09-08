"use client";

import { AdminSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="main-area">
        <Header
          userName="Admin"
          userEmail="admin@bsdafterschool.com"
          userInitial="A"
          userColor="linear-gradient(135deg, #10b981, #059669)"
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
