import { AdminSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — BSD After School Club",
  description: "Panel manajemen Admin BSD After School Club",
};

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
