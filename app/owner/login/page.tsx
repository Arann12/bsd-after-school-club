"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function OwnerLoginPage() {
  return (
    <AuthForm
      role="owner"
      dashboardRoute="/owner/dashboard"
    />
  );
}
