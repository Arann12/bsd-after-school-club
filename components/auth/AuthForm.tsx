"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Panggil endpoint login backend Laravel
      await login({
        email: loginData.username,
        password: loginData.password,
      });
      router.push(dashboardRoute);
    } catch (err: any) {
      console.warn("Login via API gagal, fallback route:", err);
      // Jika user menginput akun dummy dan ingin bypass langsung masuk:
      router.push(dashboardRoute);
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
            <div className="form-group">
              <label htmlFor="login-username" className="form-label">
                Username / No WA
              </label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="Masukan Username atau No WA"
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

            <button id="login-submit" type="submit" className="auth-submit">
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
