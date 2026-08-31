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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
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
              {["Tanggal Sesi", "Status Presensi", "Materi Dipelajari"].map(h => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
