"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<"login" | "daftar">("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    namaSiswa: "",
    usia: "",
    kelas: "",
    sekolah: "",
    program: "",
    noWa: "",
    username: "",
    email: "",
    password: "",
  });

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(`Login as ${role}:`, loginData);
    router.push(dashboardRoute);
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(`Register as ${role}:`, registerData);
    router.push(dashboardRoute);
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
          {role === "orang-tua" && (
            <button
              id="tab-daftar"
              className={`auth-tab ${activeTab === "daftar" ? "active" : ""}`}
              onClick={() => setActiveTab("daftar")}
            >
              Daftar Kursus Baru
            </button>
          )}
          {role === "orang-tua" && <div className="tab-indicator" data-active={activeTab} />}
        </div>

        {/* Form Body */}
        <div className="auth-body">
          {/* Logo Section */}
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

          {role !== "orang-tua" && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.8rem", color: "#64748b", textAlign: "center" }}>
              Portal {role.toUpperCase()} BSD After School Club.<br />
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {role === "owner" ? "Akun Owner dikelola oleh Developer." : role === "admin" ? "Akun Admin dibuat oleh Owner." : "Akun Guru dibuat oleh Owner & Admin."}
              </span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form
              key="login"
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
          )}

          {/* Register Form (Khusus Orang Tua / Pendaftaran Kursus Siswa Baru) */}
          {activeTab === "daftar" && role === "orang-tua" && (
            <form
              key="daftar"
              className="form-panel"
              onSubmit={handleRegisterSubmit}
            >
              <div style={{ background: "#e0f2fe", border: "1px solid #7dd3fc", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: "0.8rem", color: "#0369a1" }}>
                <strong>Form Pendaftaran Siswa Baru</strong><br />
                Akun Orang Tua & Siswa akan digenerate otomatis setelah pendaftaran disetujui oleh Owner/Admin.
              </div>

              <div className="form-group">
                <label htmlFor="register-nama-siswa" className="form-label">
                  Nama Lengkap Siswa
                </label>
                <input
                  id="register-nama-siswa"
                  type="text"
                  className="form-input"
                  placeholder="Masukan nama lengkap siswa"
                  value={registerData.namaSiswa}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      namaSiswa: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label htmlFor="register-usia" className="form-label">
                    Usia / Tgl Lahir
                  </label>
                  <input
                    id="register-usia"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 7 Tahun"
                    value={registerData.usia}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        usia: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-kelas" className="form-label">
                    Kelas Sekolah
                  </label>
                  <input
                    id="register-kelas"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Kelas 2 SD"
                    value={registerData.kelas}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        kelas: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-sekolah" className="form-label">
                  Sekolah Asal
                </label>
                <input
                  id="register-sekolah"
                  type="text"
                  className="form-input"
                  placeholder="Masukan nama sekolah asal"
                  value={registerData.sekolah}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      sekolah: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-program" className="form-label">
                  Pilih Program Kursus
                </label>
                <select
                  id="register-program"
                  className="form-input"
                  value={registerData.program}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      program: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Pilih Program Kursus --</option>
                  <option value="Calistung Level 1">Calistung (Membaca, Menulis, Berhitung)</option>
                  <option value="Phonics Starter">Phonics</option>
                  <option value="English B1">English</option>
                  <option value="Math Advance">Math</option>
                  <option value="Bimbingan Belajar">Bimbingan Belajar</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="register-nowa" className="form-label">
                  No WA Orang Tua / Wali
                </label>
                <input
                  id="register-nowa"
                  type="tel"
                  className="form-input"
                  placeholder="08xxxxxxxxxx (untuk terima konfirmasi & kredensial)"
                  value={registerData.noWa}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      noWa: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">
                  Email Orang Tua / Wali
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="form-input"
                  placeholder="email@domain.com"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button
                id="register-submit"
                type="submit"
                className="auth-submit"
              >
                Kirim Pendaftaran Kursus
              </button>
            </form>
          )}

          {/* Portal Switcher Footer Links */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#64748b",
            }}
          >
            <span>Navigasi Portal Role: </span>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              {role !== "owner" && (
                <Link href="/" style={{ color: "#3AABE3", textDecoration: "none", fontWeight: 600 }}>
                  Owner
                </Link>
              )}
              {role !== "admin" && (
                <Link href="/admin/login" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 600 }}>
                  Admin
                </Link>
              )}
              {role !== "guru" && (
                <Link href="/guru/login" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>
                  Guru
                </Link>
              )}
              {role !== "orang-tua" && (
                <Link href="/orang-tua/login" style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>
                  Orang Tua / Siswa
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
