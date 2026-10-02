"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login, type AuthUser } from "@/lib/api/auth";

export type RoleType = "owner" | "admin" | "guru" | "orang-tua";

interface AuthFormProps {
  role: RoleType;
  dashboardRoute: string;
}

export default function AuthForm({
  role,
  dashboardRoute,
}: AuthFormProps) {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await login({
        email: loginData.username.trim(),
        password: loginData.password,
      });

      // Redirect otomatis ke dashboard sesuai role yang dikembalikan backend
      const userRole: AuthUser["role"] = res.user.role;
      let targetDashboard = dashboardRoute;
      if (userRole === "owner") targetDashboard = "/owner/dashboard";
      else if (userRole === "admin") targetDashboard = "/admin/dashboard";
      else if (userRole === "teacher") targetDashboard = "/guru/dashboard";
      else if (userRole === "parent") targetDashboard = "/orang-tua/dashboard";

      if (typeof window !== "undefined") {
        window.location.href = targetDashboard;
      } else {
        router.push(targetDashboard);
      }
    } catch (err: any) {
      console.error("Login gagal:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal masuk. Periksa kembali email dan password Anda.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
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

          {errorMsg && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form
            className="form-panel"
            onSubmit={handleLoginSubmit}
          >
            <div className="form-group">
              <label htmlFor="login-username" className="form-label">
                Username / Email
              </label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="Masukan Username atau Email"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                autoComplete="username"
                required
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
              />
            </div>

            <a href="#" id="forgot-password-link" className="forgot-link">
              Lupa Password?
            </a>

            <button
              id="login-submit"
              type="submit"
              className="auth-submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
