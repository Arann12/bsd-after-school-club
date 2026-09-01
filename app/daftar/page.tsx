"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function DaftarKursusPage() {
  return (
    <AuthForm
      role="orang-tua"
      dashboardRoute="/orang-tua/dashboard"
    />
  );
}
