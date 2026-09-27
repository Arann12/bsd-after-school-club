"use client";

import { useEffect, useState } from "react";
import { OrangTuaSidebar } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getLocalUser } from "@/lib/api/auth";

export default function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("Orang Tua");

  useEffect(() => {
    const user = getLocalUser();
    if (user?.name) setUserName(user.name);
  }, []);

  const initial = userName.trim().charAt(0).toUpperCase() || "O";

  return (
    <div className="app-shell">
      <OrangTuaSidebar />
      <div className="main-area">
        <Header
          greetingText={`Halo, ${userName}!`}
          showChildSelector={false}
          userName={userName}
          userRole="Orang Tua"
          userInitial={initial}
          userColor="linear-gradient(135deg, #0284c7, #0369a1)"
        />
        <main className="page-content">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
