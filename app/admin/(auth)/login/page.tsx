import AuthForm from "@/components/auth/AuthForm";

export default function AdminLoginPage() {
  return (
    <AuthForm
      role="admin"
      dashboardRoute="/admin/dashboard"
    />
  );
}
