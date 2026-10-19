"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAcademicDashboard } from "@/lib/api/academic";

export default function OwnerLaporanPage() {
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeTeachers: 0,
    activeClasses: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getAcademicDashboard();
        setStats({
          activeStudents: res.summary?.active_students ?? 0,
          activeTeachers: res.summary?.active_teachers ?? 0,
          activeClasses: res.summary?.active_classrooms ?? 0,
        });
      } catch (e) {
        console.warn("Gagal memuat metrik akademik laporan:", e);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a5c8a 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "32px 36px", color: "white", boxShadow: "0 10px 25px -5px rgba(26,92,138,0.3)" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>Laporan &amp; Analitik</h1>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
          Akses seluruh laporan operasional, keuangan, dan kehadiran BSD After School Club dalam satu tempat. Pilih kategori laporan di bawah untuk melihat detail.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 20 }}>
          {[
            { label: "Siswa Aktif", val: stats.activeStudents },
            { label: "Guru Aktif", val: stats.activeTeachers },
            { label: "Kelas Berjalan", val: stats.activeClasses },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {/* Laporan Keuangan */}
        <Link href="/owner/laporan/keuangan" style={{ textDecoration: "none" }}>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", cursor: "pointer", transition: "all 0.15s ease", height: "100%", display: "flex", flexDirection: "column" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 8px" }}>Laporan Keuangan</h3>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6, flex: 1 }}>
              Pendapatan, pengeluaran, laba bersih, rincian per program, metode pembayaran, dan honor guru.
            </p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "var(--color-primary)" }}>
              Buka Laporan
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Laporan Inventaris */}
        <Link href="/owner/laporan/inventaris" style={{ textDecoration: "none" }}>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px 24px", boxShadow: "var(--shadow-sm)", cursor: "pointer", transition: "all 0.15s ease", height: "100%", display: "flex", flexDirection: "column" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 8px" }}>Laporan Inventaris &amp; Aset</h3>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6, flex: 1 }}>
              Kondisi aset, nilai perolehan, barang rusak/perlu perbaikan, dan pengadaan baru.
            </p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "var(--color-primary)" }}>
              Buka Laporan
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
