"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(`Login as ${role}:`, loginData);
    router.push(dashboardRoute);
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
