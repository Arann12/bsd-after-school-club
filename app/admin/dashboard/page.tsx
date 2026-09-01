"use client";
import Link from "next/link";

const urgentUnpaidParents = [
  { nama: "Sari Pratama", anak: "Dian Pratama", program: "Phonics Starter", jumlah: "Rp 50.000", overdueSince: "3 hari lalu", wa: "6281234567890" },
  { nama: "Eko Hartono", anak: "Hana Pertiwi", program: "Phonics Starter", jumlah: "Rp 100.000", overdueSince: "5 hari lalu", wa: "6289876543210" },
  { nama: "Gilang Prasetyo", anak: "Gilang Ramadan", program: "Math Advance", jumlah: "Rp 60.000", overdueSince: "1 hari lalu", wa: "6285551234567" },
];

const menuShortcuts = [
  { label: "Data Siswa", sub: "84 Siswa Aktif", href: "/admin/students", color: "#1d4ed8", bg: "#dbeafe" },
  { label: "Orang Tua", sub: "3 Overdue Bayar", href: "/admin/orang-tua", color: "#dc2626", bg: "#fee2e2" },
  { label: "Guru & Staff", sub: "4 Guru Aktif", href: "/admin/guru", color: "#7c3aed", bg: "#ede9fe" },
  { label: "Jadwal Kelas", sub: "4 Sesi Hari Ini", href: "/admin/schedule", color: "#059669", bg: "#d1fae5" },
  { label: "Absensi & Logbook", sub: "Senin terkini", href: "/admin/absensi", color: "#0369a1", bg: "#e0f2fe" },
  { label: "Tagihan & Cash", sub: "2 Menunggu Verifikasi", href: "/admin/tagihan", color: "#b45309", bg: "#fef3c7" },
  { label: "Program & Level", sub: "5 Program Aktif", href: "/admin/programs", color: "#059669", bg: "#d1fae5" },
  { label: "Pendaftaran Baru", sub: "Form Enrollment", href: "/admin/pendaftaran", color: "#1d4ed8", bg: "#dbeafe" },
];

export default function AdminDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Operasional Admin</h1>
          <p className="page-subtitle">Pusat kendali harian — pendaftaran, tagihan, absensi, dan jadwal kelas BSD After School Club.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/admin/pendaftaran" className="btn btn-accent">+ Pendaftaran Baru</Link>
          <Link href="/admin/verifikasi-cash" className="btn btn-outline">Verifikasi Cash</Link>
        </div>
      </div>

      {/* URGENT: Banner Cash Menunggu */}
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>2 Pembayaran Cash Menunggu Verifikasi Anda</div>
            <div style={{ fontSize: 12.5, color: "#b45309", marginTop: 1 }}>Andi Setiawan (Rp 100.000) & Citra Kirana (Rp 120.000)</div>
          </div>
        </div>
        <Link href="/admin/tagihan" className="btn btn-sm" style={{ background: "#d97706", color: "#fff", border: "none" }}>
          Konfirmasi Sekarang →
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Siswa Aktif", value: "84", detail: "8 program berjalan", warna: "#1d4ed8", bg: "#dbeafe" },
          { label: "Sesi Kelas Hari Ini", value: "4 Sesi", detail: "2 selesai, 2 terjadwal", warna: "#7c3aed", bg: "#ede9fe" },
          { label: "Tagihan Overdue", value: "3", detail: "Perlu follow up WA", warna: "#dc2626", bg: "#fee2e2" },
          { label: "Pendaftaran Bulan Ini", value: "5", detail: "+2 dibanding bulan lalu", warna: "#059669", bg: "#d1fae5" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.warna, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{k.detail}</div>
          </div>
        ))}
      </div>

      {/* Menu Shortcuts Grid */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Shortcut Menu</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {menuShortcuts.map(m => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
              <div style={{ background: m.bg, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${m.color}22`, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.label}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{m.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Jadwal Hari ini + Urgent Orang Tua */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Jadwal Hari Ini */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Mengajar Hari Ini</h3>
            <Link href="/admin/schedule" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { jam: "14:00–15:00", kelas: "KLS-A", program: "Calistung Level 1", guru: "Ms. Sarah", status: "Selesai", warna: "#059669", statusBg: "#d1fae5" },
              { jam: "15:00–16:00", kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", status: "Berlangsung", warna: "#1d4ed8", statusBg: "#dbeafe" },
              { jam: "16:00–17:00", kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", status: "Terjadwal", warna: "#b45309", statusBg: "#fef3c7" },
              { jam: "16:00–17:00", kelas: "KLS-D", program: "Phonics Starter", guru: "Mr. Budi", status: "Terjadwal", warna: "#b45309", statusBg: "#fef3c7" },
            ].map((j, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)" }}>{j.kelas} — {j.program}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{j.jam} · {j.guru}</div>
                </div>
                <span style={{ background: j.statusBg, color: j.warna, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* URGENT: Orang Tua Belum Bayar */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#dc2626", margin: 0 }}>Orang Tua Belum Bayar</h3>
            <Link href="/admin/orang-tua" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Ke Halaman Orang Tua →</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {urgentUnpaidParents.map((p, i) => (
              <div key={i} style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#991b1b" }}>{p.nama}</div>
                    <div style={{ fontSize: 11.5, color: "#dc2626", marginTop: 1 }}>Anak: {p.anak} · {p.program}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Overdue sejak {p.overdueSince}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>{p.jumlah}</div>
                    <a
                      href={`https://wa.me/${p.wa}?text=Halo ${p.nama}, mohon segera lakukan pembayaran SPP anak Anda. Terima kasih.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, fontWeight: 700, color: "#059669", textDecoration: "none", background: "#d1fae5", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4 }}
                    >
                      Hubungi WA
                    </a>
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
