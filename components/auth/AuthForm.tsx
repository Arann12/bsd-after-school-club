"use client";

import { useState, FormEvent, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";

export type RoleType = "owner" | "admin" | "guru" | "orang-tua";

interface AuthFormProps {
  role: RoleType;
  dashboardRoute: string;
}

function AuthFormInner({ role, dashboardRoute }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** Mapping role dari backend → dashboard URL */
  const ROLE_DASHBOARD: Record<string, string> = {
    owner:   "/owner/dashboard",
    admin:   "/admin/dashboard",
    teacher: "/guru/dashboard",
    parent:  "/orang-tua/dashboard",
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login({ email: loginData.email, password: loginData.password });

      // Tentukan tujuan redirect:
      // 1. Jika ada ?redirect=... dari proxy, pastikan prefix-nya sesuai role user
      // 2. Jika tidak valid, gunakan dashboard sesuai ROLE dari response backend
      const ROLE_PREFIX: Record<string, string> = {
        owner:   "/owner",
        admin:   "/admin",
        teacher: "/guru",
        parent:  "/orang-tua",
      };
      const dashboardByRole = ROLE_DASHBOARD[result.user.role] ?? dashboardRoute;
      const redirectParam = searchParams.get("redirect");
      const rolePrefix = ROLE_PREFIX[result.user.role] ?? "";
      const isValidRedirect = redirectParam && redirectParam.startsWith(rolePrefix);
      const redirectTo = isValidRedirect ? redirectParam : dashboardByRole;

      router.push(redirectTo);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Email atau password salah.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-background">
      <div className="auth-card">
        <div className="auth-body">
          <div className="auth-logo-section">
            <Image
              src="/logo.png"
              alt="BSD After School Club Logo"
              width={200}
              height={120}
              style={{ width: "200px", height: "auto" }}
              className="auth-logo"
              priority
            />
          </div>

          <form
            className="form-panel"
            onSubmit={handleLoginSubmit}
          >
            {error && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(220, 38, 38, 0.12)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "8px",
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="Masukan Email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Masukan Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
            </div>

            <a href="#" id="forgot-password-link" className="forgot-link">
              Lupa Password?
            </a>

            <button
              id="login-submit"
              type="submit"
              className="auth-submit"
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              {isLoading ? "Memverifikasi…" : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// useSearchParams() perlu Suspense boundary
export default function AuthForm(props: AuthFormProps) {
  return (
    <Suspense>
      <AuthFormInner {...props} />
    </Suspense>
  );
}
