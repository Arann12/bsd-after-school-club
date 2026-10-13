"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { getMyParentProfile, type Parent } from "@/lib/api/parents";
import { getLocalUser, type AuthUser } from "@/lib/api/auth";

export default function OrangTuaDashboardPage() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getLocalUser();
    setCurrentUser(user);

    getMyParentProfile()
      .then(setParent)
      .catch((e) => setError(e?.response?.data?.message || e.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;

  const isManagementPreview =
    currentUser && (currentUser.role === "owner" || currentUser.role === "admin");

  if (error) {
    const isRoleMismatch =
      error.toLowerCase().includes("profil orang tua tidak ditemukan") ||
      (currentUser && currentUser.role !== "parent");

    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center", maxWidth: 540, margin: "20px auto" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: isRoleMismatch ? "#eff6ff" : "var(--color-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: isRoleMismatch ? "#1d4ed8" : "var(--color-danger)" }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {isRoleMismatch ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 8 }}>
          {isRoleMismatch ? "Akses Panel Orang Tua" : "Gagal Memuat Data"}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
          {isRoleMismatch ? (
            <>
              Anda saat ini sedang login dengan akun <strong>{currentUser?.name || "Pengguna"}</strong> (Peran:{" "}
              <strong>{currentUser?.role?.toUpperCase() || "MANAJEMEN"}</strong>). Halaman ini dikhususkan untuk akun orang tua murid.
              <br />
              <span style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginTop: 6 }}>
                Gunakan kredensial <strong>ortu@bsd.test</strong> (password: <strong>password</strong>) untuk masuk sebagai orang tua.
              </span>
            </>
          ) : (
            error
          )}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {isRoleMismatch && currentUser ? (
            <Link
              href={currentUser.role === "admin" ? "/admin/dashboard" : currentUser.role === "teacher" ? "/guru/dashboard" : "/owner/dashboard"}
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              Kembali ke Dashboard {currentUser.role === "admin" ? "Admin" : currentUser.role === "teacher" ? "Guru" : "Owner"}
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Coba Lagi
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                const exp = "; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "auth_token=" + exp;
                document.cookie = "auth_user=" + exp;
                window.location.href = "/";
              }
            }}
          >
            Keluar & Ganti Akun
          </button>
        </div>
      </div>
    );
  }

  const children = parent?.students || [];
  const primaryChild = children[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Banner Mode Pratinjau Jika Diakses Owner/Admin */}
      {isManagementPreview && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: "#1d4ed8", color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
              Mode Pratinjau {currentUser?.role?.toUpperCase()}
            </span>
            <span style={{ fontSize: 12.5, color: "#1e40af" }}>
              Menampilkan simulasi profil orang tua: <strong>{parent?.name}</strong>.
            </span>
          </div>
          <Link
            href={currentUser?.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
            style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}
          >
            Kembali ke Dashboard Utama →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Selamat Datang, {parent?.name || "Orang Tua"}!</h1>
          <p className="page-subtitle">Ringkasan aktivitas akademik anak Anda di BSD After School Club.</p>
        </div>
      </div>

      {/* HERO — anak terhubung */}
      {primaryChild ? (
        <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{primaryChild.name}</h2>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Hubungan: {primaryChild.relation}</div>
            {children.length > 1 && (
              <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 4 }}>+{children.length - 1} anak lainnya terhubung</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/orang-tua/anak" className="btn btn-accent" style={{ textDecoration: "none" }}>Lihat Detail Anak</Link>
          </div>
        </div>
      ) : (
        <div style={{ background: "linear-gradient(135deg, #64748b, #475569)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Belum ada anak yang terhubung</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Hubungi Admin untuk menghubungkan akun Anda dengan data anak.</div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Jumlah Anak</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#1d4ed8" }}>{children.length}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Terhubung ke akun ini</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Status Akun</span>
          <div className="stat-card-value" style={{ fontSize: 22, color: parent?.isActive ? "#059669" : "#dc2626" }}>
            {parent?.isActive ? "Aktif" : "Tidak Aktif"}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Akun orang tua</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Hubungan</span>
          <div className="stat-card-value" style={{ fontSize: 22, color: "#7c3aed" }}>{parent?.relationship || "Orang Tua"}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Peran dalam keluarga</div>
        </div>
      </div>

      {/* Daftar Anak */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Anak Saya</h3>
          <Link href="/orang-tua/anak" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Detail →</Link>
        </div>

        {children.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>
            Belum ada data anak yang terhubung.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {children.map((child, idx) => (
              <div key={child.id} style={{ padding: "16px 20px", background: "var(--color-bg)", borderRadius: 12, border: "1px solid var(--color-border)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: idx === 0 ? "var(--color-primary)" : "#7c3aed", color: "#fff", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{child.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    Hubungan: {child.relation} {child.isPrimary ? "· Utama" : ""}
                  </div>
                </div>
                <Link href="/orang-tua/anak" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none", padding: "6px 14px", border: "1.5px solid var(--color-primary)", borderRadius: 8 }}>
                  Detail
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info & Links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {[
          { href: "/orang-tua/jadwal", label: "Jadwal Kelas", desc: "Lihat jadwal belajar anak" },
          { href: "/orang-tua/absensi", label: "Absensi", desc: "Pantau kehadiran anak" },
          { href: "/orang-tua/progress", label: "Progress Belajar", desc: "Perkembangan akademik anak" },
          { href: "/orang-tua/pembayaran", label: "Pembayaran", desc: "Status SPP dan tagihan" },
          { href: "/orang-tua/laporan", label: "Laporan", desc: "Laporan akhir & evaluasi" },
          { href: "/orang-tua/pengumuman", label: "Pengumuman", desc: "Info terbaru dari sekolah" },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "18px 20px", cursor: "pointer", transition: "all .2s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Profil Info */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Informasi Akun</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "Nama", value: parent?.name },
            { label: "Email", value: parent?.email },
            { label: "No. HP", value: parent?.phone || "-" },
            { label: "Alamat", value: parent?.address || "-" },
            { label: "Kode Orang Tua", value: parent?.parentCode },
          ].map(item => (
            <div key={item.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{item.value || "-"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
