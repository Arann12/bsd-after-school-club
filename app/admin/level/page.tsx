"use client";
import { useState } from "react";

export interface LevelItem {
  id: string;
  program: string;
  levelName: string;
  levelCode: string;
  prasyarat: string;
  durasi: string;
  totalSiswa: number;
  kurikulum: string;
}

const initialLevels: LevelItem[] = [
  // Calistung (3 Tingkatan Level)
  { id: "LVL-001", program: "Calistung", levelCode: "Level 1", levelName: "Calistung Level 1 (Mengenal Huruf & Angka)", prasyarat: "Usia Min. 4 Tahun", durasi: "12 Pertemuan", totalSiswa: 16, kurikulum: "Pengenalan abjad A-Z, pengenalan angka 1-20, menggambar pola garis." },
  { id: "LVL-002", program: "Calistung", levelCode: "Level 2", levelName: "Calistung Level 2 (Membaca Suku Kata & Penjumlahan)", prasyarat: "Lulus Level 1 / Tes Penempatan", durasi: "12 Pertemuan", totalSiswa: 12, kurikulum: "Membaca 2 suku kata, penjumlahan 1-10, menulis kata sederhana." },
  { id: "LVL-003", program: "Calistung", levelCode: "Level 3", levelName: "Calistung Level 3 (Membaca Kalimat & Pengurangan)", prasyarat: "Lulus Level 2", durasi: "12 Pertemuan", totalSiswa: 6, kurikulum: "Membaca cerita pendek, penjumlahan & pengurangan hingga 50, pemahaman soal cerita." },

  // English (3 Tingkatan Level)
  { id: "LVL-004", program: "English", levelCode: "Starter (A1)", levelName: "English Starter A1", prasyarat: "Usia Min. 5 Tahun", durasi: "12 Pertemuan", totalSiswa: 10, kurikulum: "Basic vocabulary, family members, colors, shapes, simple greetings." },
  { id: "LVL-005", program: "English", levelCode: "Intermediate (B1)", levelName: "English Intermediate B1", prasyarat: "Lulus A1 / Tes Lisan", durasi: "12 Pertemuan", totalSiswa: 12, kurikulum: "Daily conversation, present simple tense, sentence building, listening exercises." },
  { id: "LVL-006", program: "English", levelCode: "Advanced (B2)", levelName: "English Advanced B2", prasyarat: "Lulus B1", durasi: "12 Pertemuan", totalSiswa: 6, kurikulum: "Public speaking, story telling, essay writing, advanced grammar." },

  // Phonics (2 Tingkatan Level)
  { id: "LVL-007", program: "Phonics", levelCode: "Level 1", levelName: "Phonics Level 1 (Single Sound & Blends)", prasyarat: "Usia Min. 4.5 Tahun", durasi: "8 Pertemuan", totalSiswa: 10, kurikulum: "Letter sounds (s,a,t,p,i,n), CVC words (cat, dog, pin)." },
  { id: "LVL-008", program: "Phonics", levelCode: "Level 2", levelName: "Phonics Level 2 (Digraphs & Complex Sounds)", prasyarat: "Lulus Phonics Level 1", durasi: "8 Pertemuan", totalSiswa: 8, kurikulum: "Long vowels, digraphs (ch, sh, th, wh), reading short decodable books." },

  // Math (3 Tingkatan Level)
  { id: "LVL-009", program: "Math", levelCode: "Basic Math", levelName: "Basic Math (Matematika Dasar Visual)", prasyarat: "Usia Min. 6 Tahun", durasi: "12 Pertemuan", totalSiswa: 8, kurikulum: "Operasi hitung tambah kurang, pecahan sederhana dengan gambar, jam & waktu." },
  { id: "LVL-010", program: "Math", levelCode: "Intermediate", levelName: "Math Intermediate (Perkalian & Pembagian)", prasyarat: "Lulus Basic Math", durasi: "12 Pertemuan", totalSiswa: 9, kurikulum: "Perkalian 1-10, pembagian dasar, pengukuran panjang & berat." },
  { id: "LVL-011", program: "Math", levelCode: "Math Advance", levelName: "Math Advance (Penalaran Soal Cerita)", prasyarat: "Lulus Intermediate Math", durasi: "12 Pertemuan", totalSiswa: 5, kurikulum: "Bangun datar & ruang, logika olimpiade dasar, matematika nalar." },
];

export default function AdminLevelPage() {
  const [levelList, setLevelList] = useState<LevelItem[]>(initialLevels);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelItem | null>(null);

  const programs = ["Semua", "Calistung", "English", "Phonics", "Math"];

  const filtered = levelList.filter(l =>
    selectedProgramFilter === "Semua" || l.program === selectedProgramFilter
  );

  // Group by program for visual clarity
  const groupedPrograms = programs.filter(p => p !== "Semua");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Level & Tingkatan Program</h1>
          <p className="page-subtitle">Kelola tingkatan kesulitan (level) untuk setiap program kursus (Calistung, English, Phonics, Math, dll).</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setEditingLevel(null); setShowModal(true); }}>
          + Tambah Level Baru
        </button>
      </div>

      {/* Program Filter Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {programs.map(p => (
          <button
            key={p}
            onClick={() => setSelectedProgramFilter(p)}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: "1.5px solid",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .15s",
              background: selectedProgramFilter === p ? "var(--color-primary)" : "#fff",
              color: selectedProgramFilter === p ? "#fff" : "var(--color-text-secondary)",
              borderColor: selectedProgramFilter === p ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {p === "Semua" ? "Semua Program" : `Program ${p}`}
          </button>
        ))}
      </div>

      {/* Grouped View by Program */}
      {groupedPrograms
        .filter(progName => selectedProgramFilter === "Semua" || selectedProgramFilter === progName)
        .map(progName => {
          const levelsForProg = levelList.filter(l => l.program === progName);
          if (levelsForProg.length === 0) return null;

          return (
            <div key={progName} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    Program {progName}
                  </h2>
                  <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                    Total {levelsForProg.length} Tingkatan Level
                  </span>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => { setEditingLevel(null); setShowModal(true); }}
                >
                  + Tambah Level {progName}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {levelsForProg.map(l => (
                  <div
                    key={l.id}
                    style={{
                      background: "var(--color-bg)",
                      borderRadius: 12,
                      padding: 16,
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                          {l.levelCode}
                        </span>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{l.id}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{l.levelName}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6, lineHeight: 1.4 }}>
                        {l.kurikulum}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Prasyarat</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>{l.prasyarat}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingLevel(l); setShowModal(true); }}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Modal Edit / Tambah Level */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                {editingLevel ? `Edit Level — ${editingLevel.levelCode}` : "Tambah Level Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Program Kursus</label>
                <select className="form-input" defaultValue={editingLevel?.program || "Calistung"}>
                  <option value="Calistung">Calistung</option>
                  <option value="English">English</option>
                  <option value="Phonics">Phonics</option>
                  <option value="Math">Math</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Level & Kode</label>
                <input className="form-input" defaultValue={editingLevel?.levelName || ""} placeholder="Contoh: Calistung Level 1 (Mengenal Abjad)" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kode Level Singkat</label>
                  <input className="form-input" defaultValue={editingLevel?.levelCode || ""} placeholder="Level 1 / Starter" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Durasi</label>
                  <input className="form-input" defaultValue={editingLevel?.durasi || "12 Pertemuan"} placeholder="12 Pertemuan" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prasyarat Masuk Level</label>
                <input className="form-input" defaultValue={editingLevel?.prasyarat || ""} placeholder="Contoh: Lulus Level 1 / Usia min. 5 thn" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ringkasan Kurikulum & Target</label>
                <textarea className="form-input" defaultValue={editingLevel?.kurikulum || ""} placeholder="Ringkasan materi pembelajaran..." style={{ minHeight: 80 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={() => setShowModal(false)}>Simpan Level</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
