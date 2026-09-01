"use client";
import { useState } from "react";

export interface TeachingSessionHonor {
  id: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  kelas: string;
  program: string;
  tarifPerJam: number;
  totalHonor: number;
  statusCair: "Belum Dibayar" | "Sudah Cair";
}

const initialHonorSessions: TeachingSessionHonor[] = [
  { id: "HON-2026-001", tanggal: "01 Sep 2026", jamMulai: "14:00", jamSelesai: "16:00", durasiJam: 2, kelas: "KLS-A", program: "Calistung Level 1", tarifPerJam: 100000, totalHonor: 200000, statusCair: "Belum Dibayar" },
  { id: "HON-2026-002", tanggal: "02 Sep 2026", jamMulai: "14:00", jamSelesai: "15:00", durasiJam: 1, kelas: "KLS-D", program: "Phonics Starter", tarifPerJam: 100000, totalHonor: 100000, statusCair: "Belum Dibayar" },
  { id: "HON-2026-003", tanggal: "03 Sep 2026", jamMulai: "15:30", jamSelesai: "17:30", durasiJam: 2, kelas: "KLS-A", program: "Calistung Level 1", tarifPerJam: 100000, totalHonor: 200000, statusCair: "Belum Dibayar" },
  { id: "HON-2026-004", tanggal: "25 Agt 2026", jamMulai: "14:00", jamSelesai: "16:00", durasiJam: 2, kelas: "KLS-A", program: "Calistung Level 1", tarifPerJam: 100000, totalHonor: 200000, statusCair: "Sudah Cair" },
  { id: "HON-2026-005", tanggal: "27 Agt 2026", jamMulai: "15:30", jamSelesai: "17:30", durasiJam: 2, kelas: "KLS-D", program: "Phonics Starter", tarifPerJam: 100000, totalHonor: 200000, statusCair: "Sudah Cair" },
];

export default function GuruHonorPage() {
  const [sessions, setSessions] = useState<TeachingSessionHonor[]>(initialHonorSessions);
  const [filterPeriode, setFilterPeriode] = useState("Bulan Ini");

  const totalJamBulanIni = sessions.reduce((acc, s) => acc + s.durasiJam, 0);
  const honorBelumCair = sessions.filter(s => s.statusCair === "Belum Dibayar").reduce((acc, s) => acc + s.totalHonor, 0);
  const honorSudahCair = sessions.filter(s => s.statusCair === "Sudah Cair").reduce((acc, s) => acc + s.totalHonor, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Honorarium Saya</h1>
          <p className="page-subtitle">Rincian akumulasi honor mengajar berdasarkan durasi jam sesi kelas (Jam Mengajar × Tarif Per Jam).</p>
        </div>
      </div>

      {/* Info Banner Sesuai Spec Meeting */}
      <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", color: "#1e40af", fontSize: 13, lineHeight: 1.5 }}>
        <strong>ℹ️ Ketentuan Perhitungan Honor Guru:</strong> Honor dihitung berdasarkan durasi jam mengajar yang tercatat pada jadwal & logbook (Durasi Jam × Rp 100.000/Jam). Angka di bawah menampilkan estimasi honor berjalan yang belum dan sudah dicairkan oleh Bimbel.
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Estimasi Honor Belum Dicairkan</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#b45309" }}>
            Rp {honorBelumCair.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Akumulasi sesi berjalan</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Total Jam Mengajar</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#1d4ed8" }}>
            {totalJamBulanIni} Jam
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>5 Sesi Kelas Selesai</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Honor Sudah Dicairkan</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#059669" }}>
            Rp {honorSudahCair.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Transfer periode lalu</div>
        </div>
      </div>

      {/* Riwayat Sesi Mengajar & Honor */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="card-title">Rincian Jam Mengajar & Honorarium Sesi</h2>
          <select className="select-control" value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)} style={{ fontSize: 13, padding: "6px 12px" }}>
            <option value="Bulan Ini">September 2026 (Bulan Ini)</option>
            <option value="Bulan Lalu">Agustus 2026</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["ID Sesi", "Tanggal", "Jam Mengajar", "Durasi (Jam)", "Kelas & Program", "Tarif / Jam", "Total Honor", "Status Pencairan"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < sessions.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "var(--color-text-muted)", fontWeight: 700 }}>{s.id}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.tanggal}</td>
                  <td style={{ padding: "14px 16px" }}>⏰ {s.jamMulai} – {s.jamSelesai} WIB</td>
                  <td style={{ padding: "14px 16px", fontWeight: 800, color: "#1d4ed8" }}>{s.durasiJam} Jam</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800 }}>{s.kelas}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{s.program}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>Rp {s.tarifPerJam.toLocaleString("id-ID")}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 900, color: "#059669" }}>
                    Rp {s.totalHonor.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: s.statusCair === "Sudah Cair" ? "#d1fae5" : "#fef3c7",
                      color: s.statusCair === "Sudah Cair" ? "#059669" : "#b45309",
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
                    }}>
                      {s.statusCair}
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
