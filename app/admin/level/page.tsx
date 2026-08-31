"use client";

const daftarLevel = [
  { id: "LVL-001", program: "Calistung", level: "Level 1 (Pemula)", prasyarat: "Tidak ada", durasi: "12 Pertemuan" },
  { id: "LVL-002", program: "Calistung", level: "Level 2 (Lanjutan)", prasyarat: "Lulus Level 1", durasi: "12 Pertemuan" },
  { id: "LVL-003", program: "English", level: "Starter (A1)", prasyarat: "Usia min. 5 thn", durasi: "12 Pertemuan" },
  { id: "LVL-004", program: "English", level: "Intermediate (B1)", prasyarat: "Lulus A1", durasi: "12 Pertemuan" },
  { id: "LVL-005", program: "Math", level: "Basic Math", prasyarat: "Usia min. 6 thn", durasi: "12 Pertemuan" },
  { id: "LVL-006", program: "Math", level: "Math Advance", prasyarat: "Lulus Basic Math", durasi: "12 Pertemuan" },
];

export default function AdminLevelPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Level & Tingkatan Program</h1>
          <p className="page-subtitle">Pengelompokan tingkatan kesulitan dan kurikulum pembelajaran.</p>
        </div>
        <button className="btn btn-accent" onClick={() => alert("Form tambah level baru...")}>+ Tambah Level</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Level", "Nama Program", "Tingkatan Level", "Prasyarat", "Target Durasi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daftarLevel.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: i < daftarLevel.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{l.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{l.program}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-primary)", fontWeight: 700 }}>{l.level}</td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{l.prasyarat}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{l.durasi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
