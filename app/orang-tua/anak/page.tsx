"use client";
import { useState } from "react";
import Link from "next/link";

const anakTerhubung = [
  {
    id: "STD-2026-001",
    nama: "Andi Setiawan",
    program: "Calistung Level 1",
    kelas: "KLS-A",
    guru: "Ms. Sarah",
    pertemuan: 7,
    totalPertemuan: 12,
    kehadiran: "92%",
    statusTagihan: "Lunas",
    riwayatAbsensi: [
      { tgl: "2 Agt 2026", status: "Hadir", materi: "Mengenal Abjad A-G" },
      { tgl: "9 Agt 2026", status: "Hadir", materi: "Mengenal Abjad H-N" },
      { tgl: "16 Agt 2026", status: "Izin", materi: "Menulis Angka 1-10" },
      { tgl: "23 Agt 2026", status: "Hadir", materi: "Membaca Suku Kata" },
      { tgl: "30 Agt 2026", status: "Hadir", materi: "Latihan Dikte Singkat" },
    ]
  }
];

export default function OrangTuaAnakPage() {
  const [anak, setAnak] = useState(anakTerhubung[0]);
  const [detailItem, setDetailItem] = useState<typeof anak.riwayatAbsensi[number] | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Anak Saya</h1>
          <p className="page-subtitle">Informasi akademik, progress kelas, dan riwayat presensi anak Anda.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {anak.nama[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)" }}>{anak.nama}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>{anak.id} · Guru: {anak.guru}</div>
          </div>
          <span style={{ background: "#d1fae5", color: "#059669", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 999 }}>
            Siswa Aktif
          </span>
        </div>
      </div>

      {/* Progress Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Progress Program</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--color-primary)", margin: "8px 0" }}>{anak.pertemuan}/{anak.totalPertemuan} Sesi</div>
          <div style={{ height: 6, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--color-primary)", width: `${(anak.pertemuan/anak.totalPertemuan)*100}%` }} />
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Persentase Kehadiran</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", marginTop: 8 }}>{anak.kehadiran}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>Sangat baik</div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Status SPP / Tagihan</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", marginTop: 8 }}>{anak.statusTagihan}</div>
          <Link href="/orang-tua/pembayaran" style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none", fontWeight: 700, marginTop: 4, display: "block" }}>Lihat Pembayaran →</Link>
        </div>
      </div>

      {/* Riwayat Absensi & Materi */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header"><h2 className="card-title">Riwayat Kehadiran & Materi Kelas</h2></div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Tanggal Sesi", "Status Presensi", "Materi Dipelajari", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {anak.riwayatAbsensi.map((r, i) => (
              <tr key={i} style={{ borderBottom: i < anak.riwayatAbsensi.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{r.tgl}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: r.status === "Hadir" ? "#d1fae5" : "#fef3c7", color: r.status === "Hadir" ? "#059669" : "#b45309", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{r.status}</span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{r.materi}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button
                    onClick={() => setDetailItem(r)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "6px 12px", borderRadius: 8,
                      background: "#f0f9ff", border: "1px solid #bae6fd",
                      color: "#0284c7", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.borderColor = "#7dd3fc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f9ff"; e.currentTarget.style.borderColor = "#bae6fd"; }}
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
            zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDetailItem(null); }}
        >
          <div style={{
            background: "#fff", borderRadius: 18, maxWidth: 460, width: "100%", padding: 24,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Kehadiran</h3>
              <button onClick={() => setDetailItem(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Status Badge */}
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8,
                background: detailItem.status === "Hadir" ? "#d1fae5" : "#fef3c7",
                color: detailItem.status === "Hadir" ? "#059669" : "#b45309",
              }}>
                {detailItem.status === "Hadir" ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                )}
                {detailItem.status}
              </span>
            </div>

            {/* Fields */}
            {[
              { label: "Siswa", value: anak.nama },
              { label: "Program", value: anak.program },
              { label: "Guru Pengajar", value: anak.guru },
              { label: "Tanggal Sesi", value: detailItem.tgl },
              { label: "Materi Pembelajaran", value: detailItem.materi },
            ].map((f) => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f1f5f9", gap: 16 }}>
                <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>{f.label}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)", textAlign: "right" }}>{f.value}</span>
              </div>
            ))}

            <button
              onClick={() => setDetailItem(null)}
              style={{
                width: "100%", marginTop: 20, padding: "11px",
                background: "#ffffff", color: "#64748b",
                border: "1px solid #cbd5e1", borderRadius: 10,
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
