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

  return (
    <div className="app-shell">
      <OrangTuaSidebar />
      <div className="main-area">
        <Header
          greetingText={`Halo, ${userName}!`}
          showChildSelector={false}
          userRole="Orang Tua"
        />
        <main className="page-content">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
