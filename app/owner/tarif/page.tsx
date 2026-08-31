"use client";
import { useState } from "react";

const tarifInitial = [
  { id: "TRF-001", program: "Calistung Level 1 & 2", tarifJam: 75000, bonusSesi: 5000, overtimeJam: 85000 },
  { id: "TRF-002", program: "English B1 & B2", tarifJam: 80000, bonusSesi: 10000, overtimeJam: 90000 },
  { id: "TRF-003", program: "Math Advance", tarifJam: 80000, bonusSesi: 10000, overtimeJam: 90000 },
  { id: "TRF-004", program: "Phonics Starter", tarifJam: 75000, bonusSesi: 5000, overtimeJam: 85000 },
];

export default function OwnerTarifPage() {
  const [tarifList, setTarifList] = useState(tarifInitial);
  const [tersimpan, setTersimpan] = useState(false);

  const updateTarif = (id: string, field: string, val: number) => {
    setTarifList(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  const handleSimpan = () => {
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Tarif Honor Guru</h1>
          <p className="page-subtitle">Kelola tarif standar mengajar per jam, bonus per sesi, dan lembur (Owner Only).</p>
        </div>
        <button className="btn btn-accent" onClick={handleSimpan}>
          {tersimpan ? "Tarif Berhasil Disimpan!" : "Simpan Pengaturan Tarif"}
        </button>
      </div>

      <div style={{ background: "linear-gradient(135deg, #1a5c8a 0%, #134570 100%)", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Pengaturan Rahasia Owner</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Perubahan tarif di sini akan otomatis diterapkan pada kalkulasi modul Honor Guru.</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Program", "Tarif Dasar / Jam (Rp)", "Bonus per Sesi (Rp)", "Tarif Lembur / Jam (Rp)"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tarifList.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < tarifList.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{t.program}</td>
                <td style={{ padding: "14px 16px" }}>
                  <input className="form-input" type="number" value={t.tarifJam} onChange={e => updateTarif(t.id, "tarifJam", Number(e.target.value))} style={{ width: 140, fontWeight: 700, color: "var(--color-primary)" }} />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <input className="form-input" type="number" value={t.bonusSesi} onChange={e => updateTarif(t.id, "bonusSesi", Number(e.target.value))} style={{ width: 130 }} />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <input className="form-input" type="number" value={t.overtimeJam} onChange={e => updateTarif(t.id, "overtimeJam", Number(e.target.value))} style={{ width: 140 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
