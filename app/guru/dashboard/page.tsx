"use client";
import Link from "next/link";

export default function GuruDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Selamat Datang, Ms. Sarah</h1>
          <p className="page-subtitle">Ringkasan kelas mengajar Anda hari ini dan rekap statistik mengajar.</p>
        </div>
        <Link href="/guru/jadwal" className="btn btn-primary">Lihat Semua Jadwal Saya</Link>
      </div>

      {/* Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Sesi Mengajar Hari Ini</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#059669" }}>2 Sesi</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>KLS-A & KLS-D</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Total Jam Mengajar Bulan Ini</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#1d4ed8" }}>18 Jam</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>18 sesi selesai</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Logbook Tersimpan</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#7c3aed" }}>100%</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Semua sesi sudah diabsen</div>
        </div>
      </div>

      {/* Main Focus: Kelas Hari Ini */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Kelas Mengajar Hari Ini</h2>
          <span style={{ fontSize: 12.5, color: "#059669", fontWeight: 700, background: "#d1fae5", padding: "4px 12px", borderRadius: 999 }}>Senin, 2 Sept 2026</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { id: "SES-001", jam: "14:00 – 15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 7, total: 12, status: "Siap Mulai" },
            { id: "SES-002", jam: "16:00 – 17:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 1", siswa: 5, pertemuan: 3, total: 8, status: "Mendatang" },
          ].map(k => (
            <div key={k.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "var(--color-bg)", borderRadius: 14, border: "1px solid var(--color-border)", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>{k.kelas} — {k.program}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                  {k.jam} · {k.ruang} · {k.siswa} Siswa · Pertemuan ke-{k.pertemuan} dari {k.total}
                </div>
              </div>

              <Link href={`/guru/kelas/${k.id}`} className="btn btn-accent" style={{ textDecoration: "none" }}>
                Mulai Kelas & Isi Logbook
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
