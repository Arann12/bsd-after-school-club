"use client";

import React, { useState, useEffect } from "react";
import { getMe, getLocalUser, updateProfile, updatePassword } from "@/lib/api/auth";
import { getStudents } from "@/lib/api/students";
import { getTeachers } from "@/lib/api/teachers";
import { getClassrooms } from "@/lib/api/academic";

export interface ProfileViewProps {
  role: "owner" | "admin" | "guru" | "orang-tua";
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  roleTitle?: string;
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
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  roleTitle: propRoleTitle,
  roleBadgeColor = "linear-gradient(135deg, #10b981, #059669)",
  initials: propInitials,
  userId: propUserId,
  branch = "BSD City Utama",
  joinDate: propJoinDate,
  specialFields: propSpecialFields = [],
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const [loading, setLoading] = useState(true);
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [submittingSecurity, setSubmittingSecurity] = useState(false);

  // User Core State
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState("BSD City, Tangerang Selatan");
  const [bio, setBio] = useState("");
  const [userId, setUserId] = useState(propUserId || "USR-2026-001");
  const [joinDate, setJoinDate] = useState(propJoinDate || "Member Aktif");

  // Operational system stats (for Admin & Owner)
  const [stats, setStats] = useState<{
    studentsCount: number;
    teachersCount: number;
    classroomsCount: number;
  }>({
    studentsCount: 0,
    teachersCount: 0,
    classroomsCount: 0,
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Load Real User Profile & System Data ───────────────────────────
  useEffect(() => {
    // 1. Initial quick load from local storage
    const local = getLocalUser();
    if (local) {
      setName(local.name || initialName);
      setEmail(local.email || initialEmail);
      if (local.phone) setPhone(local.phone);
      if (local.user_code) setUserId(local.user_code);
    }

    // Load persisted local extra info (address & bio)
    try {
      const savedExtra = localStorage.getItem(`profile_extra_${role}`);
      if (savedExtra) {
        const parsed = JSON.parse(savedExtra);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.bio) setBio(parsed.bio);
      }
    } catch {
      // ignore
    }

    // 2. Fetch fresh real data from backend
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        const user = await getMe();
        if (user) {
          setUserData(user);
          setName(user.name || local?.name || initialName);
          setEmail(user.email || local?.email || initialEmail);
          setPhone(user.phone || local?.phone || initialPhone || "-");
          setUserId(user.user_code || user.id?.substring(0, 8).toUpperCase() || propUserId || "USR-2026");

          if (user.created_at) {
            const d = new Date(user.created_at);
            setJoinDate(
              d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            );
          }
        }

        // For Admin & Owner, fetch real system statistics
        if (role === "admin" || role === "owner") {
          try {
            const [stRes, tcRes, clRes] = await Promise.allSettled([
              getStudents({ per_page: 100 }),
              getTeachers({ per_page: 100 }),
              getClassrooms({ per_page: 100 }),
            ]);

            const studentsCount = stRes.status === "fulfilled" ? stRes.value.data.length || stRes.value.total || 0 : 0;
            const teachersCount = tcRes.status === "fulfilled" ? tcRes.value.data.length || tcRes.value.total || 0 : 0;
            const classroomsCount = clRes.status === "fulfilled" ? clRes.value.data.length || clRes.value.total || 0 : 0;

            setStats({
              studentsCount,
              teachersCount,
              classroomsCount,
            });
          } catch (e) {
            console.warn("Gagal mengambil statistik operasional:", e);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat profil realtime dari server:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, [role]);

  // Compute Initials
  const computedInitials =
    (name || "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || propInitials || "U";

  // Compute Role Title
  const computedRoleTitle =
    propRoleTitle ||
    (role === "owner"
      ? "Executive Owner"
      : role === "admin"
      ? "Administrator Operasional"
      : role === "guru"
      ? "Guru Pengajar"
      : "Orang Tua / Wali Murid");

  // Compute Special Fields based on Real Data
  const computedSpecialFields = () => {
    if (propSpecialFields && propSpecialFields.length > 0 && !userData) {
      return propSpecialFields;
    }

    if (role === "guru") {
      const classrooms = userData?.teacher?.classrooms || [];
      const classNames = classrooms.map((c: any) => c.name).join(", ");
      return [
        {
          label: "STATUS AKUN",
          value: userData?.is_active !== false ? "Guru Aktif Terverifikasi" : "Non-Aktif",
        },
        {
          label: "TOTAL KELAS AKTIF",
          value: classrooms.length > 0 ? `${classrooms.length} Kelas (${classNames})` : "Belum ada kelas",
        },
        {
          label: "CABANG TUGAS",
          value: branch,
        },
      ];
    }

    if (role === "orang-tua") {
      const students = userData?.parent?.students || [];
      const studentNames = students.map((s: any) => s.name || s.full_name).join(", ");
      return [
        {
          label: "STATUS AKUN",
          value: "Wali Murid Terdaftar",
        },
        {
          label: "ANAK TERDAFTAR",
          value: students.length > 0 ? studentNames : "Belum ada siswa terhubung",
        },
        {
          label: "JUMLAH ANAK",
          value: `${students.length} Siswa`,
        },
      ];
    }

    if (role === "admin") {
      return [
        {
          label: "TOTAL SISWA TERDATA",
          value: `${stats.studentsCount} Siswa Terdaftar`,
        },
        {
          label: "TOTAL GURU AKTIF",
          value: `${stats.teachersCount} Guru Pengajar`,
        },
        {
          label: "TOTAL KELAS BERJALAN",
          value: `${stats.classroomsCount} Ruang Kelas`,
        },
        {
          label: "HAK AKSES SISTEM",
          value: "Akademik, Siswa, & Verifikasi Pembayaran",
        },
      ];
    }

    // Owner
    return [
      {
        label: "STATUS KEPEMILIKAN",
        value: "Founder / Executive Owner",
      },
      {
        label: "TOTAL SISWA SISTEM",
        value: `${stats.studentsCount} Siswa Aktif`,
      },
      {
        label: "TOTAL GURU & STAFF",
        value: `${stats.teachersCount} Pengajar Terdaftar`,
      },
      {
        label: "OTORISASI KEUANGAN",
        value: "Full Authorization (Seluruh Modul)",
      },
    ];
  };

  // ── Handle Save Info ───────────────────────────────────────────────
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInfo(true);
    try {
      await updateProfile({
        name,
        email,
        phone: phone === "-" ? "" : phone,
      });

      // Simpan address & bio ke storage lokal per role
      localStorage.setItem(
        `profile_extra_${role}`,
        JSON.stringify({
          address,
          bio,
        })
      );

      showToast("Data profil Anda berhasil diperbarui ke database!");
    } catch (err: any) {
      console.error("Gagal simpan profil:", err);
      const msg = err?.response?.data?.message || err?.message || "Gagal menyimpan profil.";
      showToast(msg, "error");
    } finally {
      setSubmittingInfo(false);
    }
  };

  // ── Handle Save Security ───────────────────────────────────────────
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Password baru dan konfirmasi password tidak cocok!", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password baru minimal 8 karakter!", "error");
      return;
    }

    setSubmittingSecurity(true);
    try {
      await updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast("Password Anda berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Gagal ubah password:", err);
      const msg = err?.response?.data?.message || err?.message || "Password saat ini salah atau tidak sesuai.";
      showToast(msg, "error");
    } finally {
      setSubmittingSecurity(false);
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
            Kelola data diri, kontak, dan keamanan akun Anda.
          </p>
        </div>

        {/* Status Toast Notification */}
        {toastMessage && (
          <div
            style={{
              background: toastMessage.type === "success" ? "#d1fae5" : "#fee2e2",
              color: toastMessage.type === "success" ? "#065f46" : "#b91c1c",
              border: `1px solid ${toastMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
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
            {toastMessage.type === "success" ? (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toastMessage.text}
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
                {computedInitials}
              </div>
              <div style={{ paddingBottom: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    {name || "Memuat Profil..."}
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
                    {computedRoleTitle}
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
                    Akun Aktif Terverifikasi
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
                  ID Akun: <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{userId}</span> • Cabang: <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{branch}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats / Meta */}
            <div style={{ display: "flex", gap: 20, paddingBottom: 4 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>TERDAFTAR SEJAK</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{joinDate}</div>
              </div>
            </div>
          </div>

          {/* Additional details row */}
          {computedSpecialFields().length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 12,
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-light)",
                marginTop: 8,
              }}
            >
              {computedSpecialFields().map((f, i) => (
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
                  placeholder="Masukkan nama lengkap"
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
                  placeholder="email@domain.com"
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
                  value={phone === "-" ? "" : phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
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
                placeholder="Alamat domisili saat ini"
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
                placeholder="Deskripsi singkat mengenai diri atau peran Anda"
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
                disabled={submittingInfo}
                style={{
                  padding: "10px 22px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  cursor: submittingInfo ? "not-allowed" : "pointer",
                  opacity: submittingInfo ? 0.7 : 1,
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {submittingInfo ? "Menyimpan..." : "Simpan Perubahan"}
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
                <li>Minimal 8 karakter.</li>
                <li>Password akan langsung terenkripsi secara aman di database server.</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 26 }}>
              <button
                type="submit"
                disabled={submittingSecurity}
                style={{
                  padding: "10px 22px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  cursor: submittingSecurity ? "not-allowed" : "pointer",
                  opacity: submittingSecurity ? 0.7 : 1,
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {submittingSecurity ? "Mengubah Password..." : "Ubah Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
