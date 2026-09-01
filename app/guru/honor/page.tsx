"use client";
import { useState } from "react";

export interface TeachingSessionLog {
  id: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  kelas: string;
  program: string;
  statusLogbook: "Logbook Terverifikasi" | "Menunggu Verifikasi";
}

const initialTeachingLogs: TeachingSessionLog[] = [
  { id: "LOG-2026-001", tanggal: "01 Sep 2026", jamMulai: "14:00", jamSelesai: "16:00", durasiJam: 2, kelas: "KLS-A", program: "Calistung Level 1", statusLogbook: "Logbook Terverifikasi" },
  { id: "LOG-2026-002", tanggal: "02 Sep 2026", jamMulai: "14:00", jamSelesai: "15:00", durasiJam: 1, kelas: "KLS-D", program: "Phonics Starter", statusLogbook: "Logbook Terverifikasi" },
  { id: "LOG-2026-003", tanggal: "03 Sep 2026", jamMulai: "15:30", jamSelesai: "17:30", durasiJam: 2, kelas: "KLS-A", program: "Calistung Level 1", statusLogbook: "Logbook Terverifikasi" },
  { id: "LOG-2026-004", tanggal: "25 Agt 2026", jamMulai: "14:00", jamSelesai: "16:00", durasiJam: 2, kelas: "KLS-A", program: "Calistung Level 1", statusLogbook: "Logbook Terverifikasi" },
  { id: "LOG-2026-005", tanggal: "27 Agt 2026", jamMulai: "15:30", jamSelesai: "17:30", durasiJam: 2, kelas: "KLS-D", program: "Phonics Starter", statusLogbook: "Logbook Terverifikasi" },
];

export default function GuruHonorJamPage() {
  const [logs, setLogs] = useState<TeachingSessionLog[]>(initialTeachingLogs);
  const [filterPeriode, setFilterPeriode] = useState("Bulan Ini");

  const totalJamBulanIni = logs.reduce((acc, l) => acc + l.durasiJam, 0);
  const totalSesi = logs.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Rekap Jam Mengajar Saya</h1>
          <p className="page-subtitle">Rincian akumulasi durasi jam mengajar yang tercatat dari seluruh sesi kelas dan logbook.</p>
        </div>
      </div>

      {/* Info Banner Kebijakan Kerahasiaan Honor */}
      <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", color: "#1e40af", fontSize: 13, lineHeight: 1.5 }}>
        <strong>Kebijakan Privasi Honorarium:</strong> Pembayaran honorarium diproses secara privat dan langsung ditransfer oleh Owner/Pimpinan Bimbel. Halaman ini dikhususkan bagi Anda untuk memantau dan mencocokkan total durasi jam mengajar harian, mingguan, dan bulanan.
      </div>

      {/* Stats Cards (HANYA FOKUS JAM & SESI) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Total Jam Mengajar (Bulan Ini)</span>
          <div className="stat-card-value" style={{ fontSize: 32, color: "#1d4ed8" }}>
            {totalJamBulanIni} Jam
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Akumulasi dari logbook kelas</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Sesi Kelas Terverifikasi</span>
          <div className="stat-card-value" style={{ fontSize: 32, color: "#059669" }}>
            {totalSesi} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>100% Logbook Terisi</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Rata-rata Durasi per Sesi</span>
          <div className="stat-card-value" style={{ fontSize: 32, color: "#7c3aed" }}>
            {(totalJamBulanIni / (totalSesi || 1)).toFixed(1)} Jam
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Per sesi pertemuan</div>
        </div>
      </div>

      {/* Table Rincian Jam Mengajar */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="card-title">Rincian Durasi Jam Mengajar per Sesi</h2>
          <select className="select-control" value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)} style={{ fontSize: 13, padding: "6px 12px" }}>
            <option value="Bulan Ini">September 2026 (Bulan Ini)</option>
            <option value="Bulan Lalu">Agustus 2026</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["ID Sesi Logbook", "Tanggal Sesi", "Jam Mengajar", "Durasi Mengajar", "Kelas & Program", "Status Logbook"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: i < logs.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "var(--color-text-muted)", fontWeight: 700 }}>{l.id}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)" }}>{l.tanggal}</td>
                  <td style={{ padding: "14px 16px" }}>{l.jamMulai} – {l.jamSelesai} WIB</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 12.5, fontWeight: 800, padding: "4px 12px", borderRadius: 999 }}>
                      {l.durasiJam} Jam Mengajar
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800 }}>{l.kelas}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{l.program}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: "#d1fae5",
                      color: "#059669",
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
                    }}>
                      ✓ {l.statusLogbook}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
