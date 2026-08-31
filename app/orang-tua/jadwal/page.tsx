"use client";

const jadwalAnak = [
  { hari: "Senin", jam: "14:00 – 15:00", program: "Calistung Level 1", ruang: "Ruang 1", guru: "Ms. Sarah", status: "Hari Ini" },
  { hari: "Rabu", jam: "14:00 – 15:00", program: "Calistung Level 1", ruang: "Ruang 1", guru: "Ms. Sarah", status: "Mendatang" },
];

export default function OrangTuaJadwalPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Jadwal Kelas Anak</h1>
          <p className="page-subtitle">Jadwal mingguan les untuk Andi Setiawan.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {jadwalAnak.map((j, i) => (
          <div key={i} className="card" style={{ padding: "20px 24px", borderLeft: j.status === "Hari Ini" ? "4px solid #059669" : "4px solid var(--color-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{j.hari}, {j.jam}</span>
                  <span style={{ background: j.status === "Hari Ini" ? "#d1fae5" : "#dbeafe", color: j.status === "Hari Ini" ? "#059669" : "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>{j.status}</span>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", fontWeight: 600 }}>{j.program}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{j.ruang} · Pengajar: {j.guru}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => alert("Pengingat jadwal diaktifkan.")}>Ingatkan Saya</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
