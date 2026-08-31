"use client";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Operasional Admin</h1>
          <p className="page-subtitle">Pusat kendali harian pendaftaran, pembayaran, dan jadwal kelas.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/admin/pendaftaran" className="btn btn-accent">+ Pendaftaran Baru</Link>
          <Link href="/admin/tagihan" className="btn btn-outline">💳 Verifikasi Cash</Link>
        </div>
      </div>

      {/* Action Banner Antrian Cash */}
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 28 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#92400e" }}>
              2 Pembayaran Cash Menunggu Verifikasi Anda
            </div>
            <div style={{ fontSize: 13, color: "#b45309", marginTop: 2 }}>
              Andi Setiawan (Rp 100.000) & Citra Kirana (Rp 120.000)
            </div>
          </div>
        </div>
        <Link href="/admin/tagihan" className="btn btn-accent" style={{ background: "#d97706", borderColor: "#b45309" }}>
          Konfirmasi Pembayaran →
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Pendaftaran Minggu Ini", value: "5 Siswa Baru", detail: "+2 dibanding minggu lalu", warna: "#1d4ed8", bg: "#dbeafe" },
          { label: "Total Siswa Aktif", value: "84 Siswa", detail: "8 program berjalan", warna: "#059669", bg: "#d1fae5" },
          { label: "Sesi Kelas Hari Ini", value: "4 Sesi", detail: "2 selesai, 2 berlangsung", warna: "#7c3aed", bg: "#ede9fe" },
          { label: "Tagihan Belum Bayar", value: "3 Tagihan", detail: "Perlu di-follow up WA", warna: "#dc2626", bg: "#fee2e2" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: k.warna }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{k.detail}</div>
          </div>
        ))}
      </div>

      {/* Grid Kelas Hari Ini & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 20 }}>
        {/* Jadwal Hari Ini */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Mengajar Hari Ini</h3>
            <Link href="/admin/schedule" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Kalender →</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { jam: "14:00 – 15:00", kelas: "KLS-A", program: "Calistung Level 1", guru: "Ms. Sarah", ruang: "Ruang 1", status: "Selesai", warna: "#059669" },
              { jam: "15:00 – 16:00", kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", ruang: "Ruang 2", status: "Berlangsung", warna: "#1d4ed8" },
              { jam: "16:00 – 17:00", kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", ruang: "Ruang 1", status: "Terjadwal", warna: "#d97706" },
              { jam: "16:00 – 17:00", kelas: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", ruang: "Ruang 3", status: "Terjadwal", warna: "#d97706" },
            ].map((j, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--color-bg)", borderRadius: 12, border: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{j.kelas} — {j.program}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{j.jam} · {j.ruang} · Guru: {j.guru}</div>
                </div>
                <span style={{ background: j.status === "Selesai" ? "#d1fae5" : j.status === "Berlangsung" ? "#dbeafe" : "#fef3c7", color: j.warna, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Aksi Cepat Admin</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/admin/pendaftaran" className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                📝 Form Pendaftaran Siswa Baru
              </Link>
              <Link href="/admin/tagihan" className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                💵 Input Pembayaran Cash Manual
              </Link>
              <Link href="/admin/pengumuman" className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                📢 Buat Broadcast Pengumuman
              </Link>
              <Link href="/admin/laporan" className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                🎓 Generate Sertifikat Kelulusan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
