"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type TabType = "login" | "daftar";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login:", loginData);
    router.push("/owner/dashboard");
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Register:", registerData);
    setActiveTab("login");
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        {/* Tab Header */}
        <div className="auth-tabs">
          <button
            id="tab-login"
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            id="tab-daftar"
            className={`auth-tab ${activeTab === "daftar" ? "active" : ""}`}
            onClick={() => setActiveTab("daftar")}
          >
            Daftar
          </button>
          <div className="tab-indicator" data-active={activeTab} />
        </div>

        {/* Form Body */}
        <div className="auth-body">
          {/* Logo */}
          <div className="auth-logo-section">
            <Image
              src="/logo.png"
              alt="BSD After School Club Logo"
              width={200}
              height={120}
              className="auth-logo"
              priority
            />
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form
              key="login"
              className="form-panel"
              onSubmit={handleLoginSubmit}
            >
              <div className="form-group">
                <label htmlFor="login-username" className="form-label">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  className="form-input"
                  placeholder="Masukan Username"
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value })
                  }
                  autoComplete="username"
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
                />
              </div>

              <a href="#" id="forgot-password-link" className="forgot-link">
                Lupa Password?
              </a>

              <button id="login-submit" type="submit" className="auth-submit">
                Masuk
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "daftar" && (
            <form
              key="daftar"
              className="form-panel"
              onSubmit={handleRegisterSubmit}
            >
              <div className="form-group">
                <label htmlFor="register-username" className="form-label">
                  Username
                </label>
                <input
                  id="register-username"
                  type="text"
                  className="form-input"
                  placeholder="Masukan Username"
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      username: e.target.value,
                    })
                  }
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="form-input"
                  placeholder="Masukan Email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password" className="form-label">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="form-input"
                  placeholder="Masukan Password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  autoComplete="new-password"
                />
              </div>

              <button
                id="register-submit"
                type="submit"
                className="auth-submit"
              >
                Masuk
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
