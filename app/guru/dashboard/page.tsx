"use client";
import Link from "next/link";

const menuShortcutsGuru = [
  { label: "Kalender & Logbook", sub: "Klik Tgl 1/5 untuk History", href: "/guru/logbook", color: "#059669", bg: "#d1fae5" },
  { label: "Jadwal Mengajar", sub: "2 Sesi Hari Ini", href: "/guru/jadwal", color: "#1d4ed8", bg: "#dbeafe" },
  { label: "Kelas & Absensi", sub: "Isi Logbook Sesi", href: "/guru/kelas", color: "#7c3aed", bg: "#ede9fe" },
  { label: "Jam Mengajar Saya", sub: "18 Jam Bulan Ini", href: "/guru/honor", color: "#0369a1", bg: "#e0f2fe" },
  { label: "Pengumuman", sub: "1 Pengumuman Baru", href: "/guru/pengumuman", color: "#b45309", bg: "#fef3c7" },
];

// Siswa yang perlu diperhatikan (belum bayar / absensi sering kosong)
const urgentSiswa = [
  { nama: "Dian Pratama", program: "Phonics Starter", catatan: "3x absensi berurutan tidak hadir", levelProgress: "40%", statusBayar: "Belum Bayar" },
  { nama: "Gilang Ramadan", program: "Math Advance", catatan: "Progress belajar masih rendah", levelProgress: "35%", statusBayar: "Bayar Sebagian" },
];

export default function GuruDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Selamat Datang, Ms. Sarah</h1>
          <p className="page-subtitle">Ringkasan aktivitas mengajar Anda hari ini — kelas, logbook, dan progress siswa.</p>
        </div>
        <Link href="/guru/jadwal" className="btn btn-accent">Lihat Jadwal Lengkap →</Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Sesi Mengajar Hari Ini", value: "2 Sesi", detail: "KLS-A & KLS-D", color: "#059669" },
          { label: "Total Jam Bulan Ini", value: "18 Jam", detail: "18 sesi selesai", color: "#1d4ed8" },
          { label: "Logbook Tersimpan", value: "100%", detail: "Semua sesi sudah diisi", color: "#7c3aed" },
          { label: "Siswa Diajar", value: "34 Siswa", detail: "Dari 2 kelas aktif", color: "#0369a1" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{k.detail}</div>
          </div>
        ))}
      </div>

      {/* Shortcut Menu */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Menu Cepat</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {menuShortcutsGuru.map(m => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
              <div
                style={{ background: m.bg, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${m.color}22`, cursor: "pointer", transition: "transform .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.label}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{m.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom: Kelas Hari Ini + Siswa Perlu Perhatian */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Kelas Hari Ini */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Kelas Mengajar Hari Ini</h3>
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 700, background: "#d1fae5", padding: "3px 10px", borderRadius: 999 }}>Senin, 2 Sep 2026</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { id: "SES-001", jam: "14:00–15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 7, total: 12, statusBg: "#d1fae5", statusColor: "#059669", status: "Siap Mulai" },
              { id: "SES-002", jam: "16:00–17:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 1", siswa: 5, pertemuan: 3, total: 8, statusBg: "#dbeafe", statusColor: "#1d4ed8", status: "Mendatang" },
            ].map(k => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--color-bg)", borderRadius: 12, border: "1px solid var(--color-border)", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{k.kelas} — {k.program}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {k.jam} · {k.ruang} · {k.siswa} Siswa · Pertemuan ke-{k.pertemuan}/{k.total}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: k.statusBg, color: k.statusColor, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>{k.status}</span>
                  <Link href={`/guru/kelas/${k.id}`} className="btn btn-accent btn-sm" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
                    Buka Kelas & Logbook →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Siswa Perlu Perhatian */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#dc2626", margin: 0 }}>Siswa Perlu Perhatian</h3>
            <Link href="/guru/progress" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Progress →</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {urgentSiswa.map((s, i) => (
              <div key={i} style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#991b1b" }}>{s.nama}</div>
                    <div style={{ fontSize: 11.5, color: "#dc2626", marginTop: 1 }}>{s.program}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.catatan}</div>
                  </div>
                  <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>
                    {s.statusBayar}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 3 }}>
                    <span>Progress Level</span><span>{s.levelProgress}</span>
                  </div>
                  <div style={{ background: "#e2e8f0", borderRadius: 99, height: 5, overflow: "hidden" }}>
                    <div style={{ background: "#f87171", height: "100%", width: s.levelProgress, borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
