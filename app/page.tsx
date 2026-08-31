"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function RootLoginPage() {
  return (
    <AuthForm
      role="owner"
      dashboardRoute="/owner/dashboard"
    />
  );
}
