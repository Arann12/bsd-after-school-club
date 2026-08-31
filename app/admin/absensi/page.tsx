"use client";

const rekapAbsensi = [
  { tgl: "Senin, 30 Agt 2026", kelas: "KLS-A", guru: "Ms. Sarah", totalSiswa: 6, hadir: 6, izin: 0, statusLogbook: "Lengkap" },
  { tgl: "Rabu, 28 Agt 2026", kelas: "KLS-B", guru: "Mr. Andi", totalSiswa: 5, hadir: 4, izin: 1, statusLogbook: "Lengkap" },
  { tgl: "Jumat, 26 Agt 2026", kelas: "KLS-C", guru: "Ms. Nina", totalSiswa: 4, hadir: 4, izin: 0, statusLogbook: "Lengkap" },
];

export default function AdminAbsensiPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Absensi & Logbook</h1>
          <p className="page-subtitle">Monitoring kehadiran siswa dan keterisian logbook pengajaran oleh Guru.</p>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Tanggal Sesi", "Kelas", "Pengajar", "Presensi Siswa", "Logbook Materi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rekapAbsensi.map((a, i) => (
              <tr key={i} style={{ borderBottom: i < rekapAbsensi.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{a.tgl}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-primary)" }}>{a.kelas}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{a.guru}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{a.hadir}/{a.totalSiswa} Hadir</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{a.statusLogbook}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
