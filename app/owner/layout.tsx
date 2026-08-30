import { OwnerSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Dashboard — BSD After School Club",
  description: "Panel manajemen Owner BSD After School Club",
};

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
