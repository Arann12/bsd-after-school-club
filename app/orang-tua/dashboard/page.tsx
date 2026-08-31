"use client";
import Link from "next/link";

export default function OrangTuaDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Selamat Datang, Bapak Budi 👋</h1>
          <p className="page-subtitle">Ringkasan aktivitas akademik dan pembayaran anak Anda di BSD After School Club.</p>
        </div>
      </div>

      {/* Hero Child Summary Banner */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
            Anak Terhubung
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "8px 0 4px" }}>Andi Setiawan</h2>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Program: Calistung Level 1 · Kelas KLS-A (Ms. Sarah)</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/orang-tua/anak" className="btn btn-accent" style={{ textDecoration: "none" }}>
            👤 Lihat Detail Progress
          </Link>
          <Link href="/orang-tua/pembayaran" className="btn btn-outline" style={{ color: "white", borderColor: "white", textDecoration: "none" }}>
            💳 Status SPP
          </Link>
        </div>
      </div>

      {/* Grid Informasi Cepat */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Jadwal Terdekat */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Sesi Terdekat</h3>
            <Link href="/orang-tua/jadwal" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>

          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ background: "#059669", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>HARI INI</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#166534", marginTop: 6 }}>Senin, 14:00 – 15:00 WIB</div>
              <div style={{ fontSize: 13, color: "#15803d", marginTop: 2 }}>Calistung Level 1 · Ruang 1</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11.5, color: "#166534", fontWeight: 700 }}>Pengajar</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#166534" }}>Ms. Sarah</div>
            </div>
          </div>
        </div>

        {/* Status Tagihan Ringkas */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Tagihan September 2026</h3>
          <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px", border: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>SPP Bulanan</span>
              <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>Lunas</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)" }}>Rp 500.000</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 4 }}>Dibayar via Virtual Account BCA</div>
          </div>
        </div>
      </div>

      {/* Pengumuman Terbaru untuk Orang Tua */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Pengumuman Terbaru</h3>
          <Link href="/orang-tua/pengumuman" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Semua Pengumuman →</Link>
        </div>

        <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", borderLeft: "4px solid var(--color-accent)" }}>
          <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>🔴 PENTING</span>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", margin: "6px 0 4px" }}>Pembayaran SPP September Jatuh Tempo 10 September</h4>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Batas waktu pembayaran SPP bulan September adalah tanggal 10 September 2026. Pembayaran dapat dilakukan melalui Virtual Account, QRIS, E-Wallet, atau tunai di kantor.
          </p>
        </div>
      </div>
    </div>
  );
}
