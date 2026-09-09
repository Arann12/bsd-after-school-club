"use client";
import { useState } from "react";

interface GuruTarif {
  id: string;
  nama: string;
  spesialisasi: string;
  tarifPerJam: number;
  tarifLembur: number;
  bonusSesi: number;
}

const initialGuruTarif: GuruTarif[] = [
  { id: "GUR-2026-0001", nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", tarifPerJam: 75000, tarifLembur: 90000, bonusSesi: 5000 },
  { id: "GUR-2026-0002", nama: "Mr. Andi", spesialisasi: "English & Coding", tarifPerJam: 80000, tarifLembur: 95000, bonusSesi: 10000 },
  { id: "GUR-2026-0003", nama: "Ms. Nina", spesialisasi: "Matematika", tarifPerJam: 80000, tarifLembur: 95000, bonusSesi: 8000 },
  { id: "GUR-2026-0004", nama: "Mr. Budi", spesialisasi: "Calistung Lanjut", tarifPerJam: 75000, tarifLembur: 88000, bonusSesi: 5000 },
];

export default function OwnerTarifPage() {
  const [guruList, setGuruList] = useState<GuruTarif[]>(initialGuruTarif);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const updateField = (id: string, field: keyof GuruTarif, val: number) => {
    setGuruList(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));
  };

  const handleSave = (id: string) => {
    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Tarif Honor per Guru</h1>
          <p className="page-subtitle">Atur tarif honor per jam untuk masing-masing guru secara individual. Perubahan otomatis diterapkan pada kalkulasi honor bulan ini.</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a5c8a, #134570)", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Pengaturan Tarif Konfidensial — Hanya Owner</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Tarif ini tidak pernah ditampilkan ke Admin, Guru, atau Orang Tua. Klik tombol Edit untuk mengubah tarif per guru.</div>
        </div>
      </div>

      {/* Card per guru */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {guruList.map(g => (
          <div key={g.id} className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editingId === g.id ? 18 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", color: "#fff", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {g.nama[3]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.nama}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{g.spesialisasi} · {g.id}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {savedId === g.id && (
                  <span style={{ background: "#d1fae5", color: "#059669", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
                    Tarif Tersimpan!
                  </span>
                )}
                {editingId === g.id ? (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Batal</button>
                    <button className="btn btn-accent btn-sm" onClick={() => handleSave(g.id)}>Simpan Tarif</button>
                  </>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditingId(g.id)}>Edit Tarif</button>
                )}
              </div>
            </div>

            {editingId === g.id ? (
              /* Form Edit Mode */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, borderTop: "1px solid var(--color-border-light)", paddingTop: 16, marginTop: 4 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>Tarif Dasar / Jam (Rp)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={g.tarifPerJam}
                    onChange={e => updateField(g.id, "tarifPerJam", Number(e.target.value))}
                    style={{ fontWeight: 800, color: "var(--color-primary)" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>Tarif Lembur / Jam (Rp)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={g.tarifLembur}
                    onChange={e => updateField(g.id, "tarifLembur", Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>Bonus per Sesi (Rp)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={g.bonusSesi}
                    onChange={e => updateField(g.id, "bonusSesi", Number(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              /* Read-only View Mode */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, borderTop: "1px solid var(--color-border-light)", paddingTop: 14, marginTop: 10 }}>
                <div style={{ background: "var(--color-bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tarif Dasar / Jam</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)", marginTop: 2 }}>Rp {g.tarifPerJam.toLocaleString("id")}</div>
                </div>
                <div style={{ background: "var(--color-bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tarif Lembur / Jam</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#b45309", marginTop: 2 }}>Rp {g.tarifLembur.toLocaleString("id")}</div>
                </div>
                <div style={{ background: "var(--color-bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Bonus per Sesi</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#059669", marginTop: 2 }}>Rp {g.bonusSesi.toLocaleString("id")}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
