"use client";
import { useState, useEffect } from "react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getMyParentProfile, type Parent } from "@/lib/api/parents";

export default function OrangTuaAnakPage() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyParentProfile()
      .then(setParent)
      .catch((e) => setError(e?.response?.data?.message || e.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonTable rows={3} cols={3} />;

  if (error) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>⚠ Gagal Memuat Data</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
      </div>
    );
  }

  const children = parent?.students || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Anak Saya</h1>
          <p className="page-subtitle">Daftar anak yang terhubung dengan akun {parent?.name}.</p>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👶</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum Ada Data Anak</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Hubungi Admin untuk menghubungkan data anak ke akun Anda.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {children.map((child, idx) => (
            <div key={child.id} className="card" style={{ padding: "24px 28px" }}>
              {/* Header Kartu */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: idx === 0 ? "var(--color-primary)" : "#7c3aed", color: "#fff", fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-text-primary)" }}>{child.name}</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {child.isPrimary ? "🌟 Anak Utama" : "Anak"} · Hubungan: {child.relation}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{ background: "var(--color-success-bg)", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
                    Terdaftar
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  { label: "ID Siswa", value: child.id.substring(0, 8) + "..." },
                  { label: "Status Hubungan", value: child.relation },
                  { label: "Prioritas", value: child.isPrimary ? "Utama" : "Tambahan" },
                ].map(item => (
                  <div key={item.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <a href="/orang-tua/absensi" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none", padding: "7px 16px", border: "1.5px solid var(--color-primary)", borderRadius: 8 }}>
                  ✅ Lihat Absensi
                </a>
                <a href="/orang-tua/progress" style={{ fontSize: 12.5, fontWeight: 700, color: "#7c3aed", textDecoration: "none", padding: "7px 16px", border: "1.5px solid #7c3aed", borderRadius: 8 }}>
                  📈 Progress Belajar
                </a>
                <a href="/orang-tua/laporan" style={{ fontSize: 12.5, fontWeight: 700, color: "#d97706", textDecoration: "none", padding: "7px 16px", border: "1.5px solid #d97706", borderRadius: 8 }}>
                  📋 Laporan
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
