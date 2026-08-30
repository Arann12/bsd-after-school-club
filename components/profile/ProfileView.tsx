"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface ProfileViewProps {
  role: "owner" | "admin" | "guru" | "orang-tua";
  initialName: string;
  initialEmail: string;
  initialPhone?: string;
  roleTitle: string;
  roleBadgeColor?: string;
  initials?: string;
  userId?: string;
  branch?: string;
  joinDate?: string;
  specialFields?: {
    label: string;
    value: string;
  }[];
}

export default function ProfileView({
  role,
  initialName,
  initialEmail,
  initialPhone = "0812-3456-7890",
  roleTitle,
  roleBadgeColor = "linear-gradient(135deg, #1a5c8a, #3AABE3)",
  initials = "U",
  userId = "USR-2024-001",
  branch = "BSD City Utama",
  joinDate = "15 Januari 2023",
  specialFields = [],
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");

  // Form State
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState("Jl. Boulevard BSD Timur No. 12, Serpong, Tangerang Selatan");
  const [bio, setBio] = useState("Pendidik & staf profesional berdedikasi di BSD After School Club.");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setSaveSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      alert("Password baru dan konfirmasi password tidak cocok!");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", paddingBottom: "var(--space-8)" }}>
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
            Pengaturan Akun & Profil
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
            Kelola data diri, kontak, keamanan akun, dan preferensi notifikasi Anda.
          </p>
        </div>

        {/* Status Toast */}
        {saveSuccess && (
          <div
            style={{
              background: "#d1fae5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "var(--shadow-sm)",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Perubahan profil berhasil disimpan!
          </div>
        )}
      </div>

      {/* ============================================================
          PROFILE HERO CARD
          ============================================================ */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {/* Profile Info */}
        <div style={{ padding: "24px 28px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 18,
            }}
          >
            {/* Avatar & Basic Info */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: roleBadgeColor,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 800,
                  border: "3px solid var(--color-border-light)",
                  boxShadow: "var(--shadow-sm)",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ paddingBottom: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    {name}
                  </h2>
                  <span
                    style={{
                      background: "var(--color-primary-bg)",
                      color: "var(--color-primary)",
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    {roleTitle}
                  </span>
                  <span
                    style={{
                      background: "#d1fae5",
                      color: "#065f46",
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                    Akun Aktif
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
                  ID: <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{userId}</span> • Cabang: <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{branch}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats / Meta */}
            <div style={{ display: "flex", gap: 20, paddingBottom: 4 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>BERGABUNG SEJAK</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{joinDate}</div>
              </div>
            </div>
          </div>

          {/* Additional details row */}
          {specialFields.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-light)",
                marginTop: 8,
              }}
            >
              {specialFields.map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          TAB NAVIGATION & CONTENT
          ============================================================ */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {/* Tabs Bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            background: "#f8fafc",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <button
            onClick={() => setActiveTab("info")}
            style={{
              padding: "14px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "info" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "info" ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Informasi Pribadi & Kontak
          </button>

          <button
            onClick={() => setActiveTab("security")}
            style={{
              padding: "14px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "security" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "security" ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Keamanan & Password
          </button>


        </div>

        {/* Tab 1: Info Form */}
        {activeTab === "info" && (
          <form onSubmit={handleSaveInfo} style={{ padding: "26px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Cabang / Unit
                </label>
                <input
                  type="text"
                  disabled
                  value={branch}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "#f8fafc",
                    color: "var(--color-text-muted)",
                    fontSize: 13.5,
                    outline: "none",
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Alamat Domisili
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Catatan Singkat / Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 26 }}>
              <button
                type="submit"
                style={{
                  padding: "10px 22px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security Form */}
        {activeTab === "security" && (
          <form onSubmit={handleSaveSecurity} style={{ padding: "26px 28px", maxWidth: 600 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 24, padding: "14px 16px", background: "#f8fafc", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-light)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)" }}>Ketentuan Keamanan Password:</div>
              <ul style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "6px 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                <li>Minimal 8 karakter kombinasi huruf dan angka.</li>
                <li>Disarankan menyertakan simbol atau huruf kapital untuk proteksi lebih baik.</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 26 }}>
              <button
                type="submit"
                style={{
                  padding: "10px 22px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                Update Password
              </button>
            </div>
          </form>
        )}


      </div>
    </div>
  );
}
