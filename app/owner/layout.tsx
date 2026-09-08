"use client";

import { OwnerSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <OwnerSidebar />
      <div className="main-area">
        <Header />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
