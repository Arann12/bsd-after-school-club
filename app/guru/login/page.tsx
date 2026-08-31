"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function GuruLoginPage() {
  return (
    <AuthForm
      role="guru"
      dashboardRoute="/guru/dashboard"
    />
  );
}
