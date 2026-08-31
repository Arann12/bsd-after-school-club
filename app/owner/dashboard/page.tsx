"use client";
import Link from "next/link";

export default function OwnerDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Eksekutif Owner</h1>
          <p className="page-subtitle">Ringkasan performa finansial, akademik, dan aktivitas operasional club.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/owner/honor" className="btn btn-accent">💸 Kelola Honor Guru</Link>
          <Link href="/owner/laporan" className="btn btn-outline">📊 Laporan Lengkap</Link>
        </div>
      </div>

      {/* Banner Ringkasan Eksekutif */}
      <div style={{ background: "linear-gradient(135deg, #1a5c8a 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, boxShadow: "0 10px 25px -5px rgba(26,92,138,0.3)" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pendapatan Bulan Ini (Agustus 2026)</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>Rp 24.700.000</div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "#d1fae5", color: "#059669", fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>↑ +14.2%</span>
            <span>dibanding bulan lalu (Rp 21.600.000)</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 24 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Honor Terbayar</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Rp 8.450.000</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Laba Bersih Operasional</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7" }}>Rp 16.250.000</div>
          </div>
        </div>
      </div>

      {/* Grid Statistik Utama */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Siswa Aktif", value: "84 Siswa", detail: "8 program berjalan", warna: "#1d4ed8", bg: "#dbeafe" },
          { label: "Total Guru & Staff", value: "12 Pengajar", detail: "Semua aktif mengajar", warna: "#059669", bg: "#d1fae5" },
          { label: "Kelas Berjalan Hari Ini", value: "6 Sesi", detail: "100% tepat waktu", warna: "#7c3aed", bg: "#ede9fe" },
          { label: "Sertifikat Terbit", value: "12 Sertifikat", detail: "Program Graduated", warna: "#d97706", bg: "#fef3c7" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: k.warna }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{k.detail}</div>
          </div>
        ))}
      </div>

      {/* Grid Grafik & Aktivitas Terakhir */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Grafik Distribusi Pendapatan per Program */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Pendapatan per Program Utama</h3>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Agustus 2026</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { pro: "Calistung Level 1 & 2", jumlah: "Rp 9.500.000", persen: 88, warna: "var(--color-primary)" },
              { pro: "English B1 & B2", jumlah: "Rp 6.800.000", persen: 65, warna: "#059669" },
              { pro: "Math Advance", jumlah: "Rp 5.200.000", persen: 50, warna: "#7c3aed" },
              { pro: "Phonics Starter", jumlah: "Rp 3.200.000", persen: 32, warna: "#d97706" },
            ].map(p => (
              <div key={p.pro}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text-primary)" }}>{p.pro}</span>
                  <span style={{ color: p.warna }}>{p.jumlah}</span>
                </div>
                <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: p.warna, width: `${p.persen}%`, borderRadius: 999, transition: "width .4s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Aktivitas Sistem Terakhir */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Aktivitas Terbaru</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { teks: "Konfirmasi Cash Rp 100.000 (Andi Setiawan)", waktu: "10 menit lalu", jenis: "pembayaran" },
              { teks: "Pendaftaran Siswa Baru: Anisa Putri", waktu: "1 jam lalu", jenis: "siswa" },
              { teks: "Logbook KLS-A diisi oleh Ms. Sarah", waktu: "2 jam lalu", jenis: "logbook" },
              { teks: "Honor Ms. Sarah disetujui (Rp 1.450.000)", waktu: "Yesterday", jenis: "honor" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: i < 3 ? 12 : 0, borderBottom: i < 3 ? "1px solid var(--color-border-light)" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.jenis === "pembayaran" ? "#059669" : a.jenis === "siswa" ? "#1d4ed8" : "#7c3aed", marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.4 }}>{a.teks}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{a.waktu}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
