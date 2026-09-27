"use client";

import { GuruSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";

import { useState, useEffect } from "react";
import { getMe } from "@/lib/api/auth";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{name: string, email: string, role: string} | null>(null);

  useEffect(() => {
    getMe().then(res => {
      setUser({
        name: res.name || "Guru",
        email: res.email || "",
        role: "Guru Pengajar"
      });
    }).catch(e => console.error("Error fetching user", e));
  }, []);

  return (
    <div className="app-shell">
      <GuruSidebar />
      <div className="main-area">
        <Header
          userName={user?.name || "Loading..."}
          userEmail={user?.email || ""}
          userInitial={user?.name ? user.name[0].toUpperCase() : "G"}
          userRole={user?.role || "Guru Pengajar"}
          userColor="linear-gradient(135deg, #1a5c8a, #3AABE3)"
        />
        <main className="page-content">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
