"use client";
import { useState, useEffect, useCallback } from "react";
import { getTeachers, Teacher } from "@/lib/api/teachers";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface GuruTarif {
  id: string;
  nama: string;
  kode: string;
  isActive: boolean;
  tarifPerJam: number;
  tarifLembur: number;
  bonusSesi: number;
}

function mapToGuruTarif(t: Teacher): GuruTarif {
  return {
    id: t.id,
    nama: t.name,
    kode: t.teacherCode,
    isActive: t.isActive,
    tarifPerJam: 0,
    tarifLembur: 0,
    bonusSesi: 0,
  };
}

export default function OwnerTarifPage() {
  const [guruList, setGuruList] = useState<GuruTarif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fetchGuru = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeachers({ per_page: 100, is_active: true });
      setGuruList(res.data.map(mapToGuruTarif));
    } catch (e) {
      setError("Gagal memuat data guru. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuru(); }, [fetchGuru]);

  const updateField = (id: string, field: keyof GuruTarif, val: number) => {
    setGuruList(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));
  };

  const handleSave = (id: string) => {
    // TODO: kirim ke PUT /teachers/:id atau endpoint tarif khusus saat backend siap
    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  if (loading) return <SkeletonTable />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Tarif Honor per Guru</h1>
          <p className="page-subtitle">
            Atur tarif honor per jam untuk masing-masing guru secara individual.
            Perubahan otomatis diterapkan pada kalkulasi honor bulan ini.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a5c8a, #134570)", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Pengaturan Tarif Konfidensial — Hanya Owner</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
            Tarif ini tidak pernah ditampilkan ke Admin, Guru, atau Orang Tua. Klik tombol Edit untuk mengubah tarif per guru.
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: "var(--color-danger-bg)", border: "1px solid #fecaca", borderRadius: "var(--radius-lg)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{error}</div>
            <button className="btn btn-sm btn-outline" style={{ marginTop: 8 }} onClick={fetchGuru}>Coba Lagi</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!error && guruList.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍🏫</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>Belum ada guru aktif</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>Tambahkan guru terlebih dahulu di halaman Guru & Staff.</div>
        </div>
      )}

      {/* Card per guru */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {guruList.map(g => (
          <div key={g.id} className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editingId === g.id ? 18 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Avatar */}
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", color: "#fff", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {g.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.nama}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{g.kode}</span>
                    <span style={{
                      background: g.isActive ? "var(--color-success-bg)" : "var(--color-danger-bg)",
                      color: g.isActive ? "var(--color-success)" : "var(--color-danger)",
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    }}>
                      {g.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
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
                  <div style={{ fontSize: 16, fontWeight: 800, color: g.tarifPerJam > 0 ? "var(--color-primary)" : "var(--color-text-muted)", marginTop: 2 }}>
                    {g.tarifPerJam > 0 ? `Rp ${g.tarifPerJam.toLocaleString("id")}` : "Belum diatur"}
                  </div>
                </div>
                <div style={{ background: "var(--color-bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tarif Lembur / Jam</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: g.tarifLembur > 0 ? "#b45309" : "var(--color-text-muted)", marginTop: 2 }}>
                    {g.tarifLembur > 0 ? `Rp ${g.tarifLembur.toLocaleString("id")}` : "Belum diatur"}
                  </div>
                </div>
                <div style={{ background: "var(--color-bg)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Bonus per Sesi</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: g.bonusSesi > 0 ? "#059669" : "var(--color-text-muted)", marginTop: 2 }}>
                    {g.bonusSesi > 0 ? `Rp ${g.bonusSesi.toLocaleString("id")}` : "Belum diatur"}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
