"use client";
import { useState } from "react";

export interface ProgressItem {
  id: string;
  namaSiswa: string;
  kelas: string;
  program: string;
  level: string;
  tglUpdate: string;
  indikatorCapai: string[];
  catatanGuru: string;
  skorNilai: number;
}

const initialProgress: ProgressItem[] = [
  {
    id: "PRG-001",
    namaSiswa: "Andi Setiawan",
    kelas: "KLS-A",
    program: "Calistung",
    level: "Level 1",
    tglUpdate: "02 Sep 2026",
    indikatorCapai: ["Mengenal Abjad Vokal & Konsonan A–N", "Menulis Angka 1–20", "Membaca Suku Kata BA-BI-BU"],
    catatanGuru: "Fokus membaca sangat meningkat. Perlu latihan sedikit untuk membedakan b dan d.",
    skorNilai: 88,
  },
  {
    id: "PRG-002",
    namaSiswa: "Ivan Kurnia",
    kelas: "KLS-A",
    program: "Calistung",
    level: "Level 1",
    tglUpdate: "02 Sep 2026",
    indikatorCapai: ["Mengenal Abjad A–Z", "Membaca 2 Suku Kata Pola KVKV"],
    catatanGuru: "Sudah lancar membaca kata sederhana seperti 'ma-ma' dan 'su-su'.",
    skorNilai: 92,
  },
];

export default function GuruProgressPage() {
  const [progressList, setProgressList] = useState<ProgressItem[]>(initialProgress);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("Andi Setiawan");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress & Penilaian Belajar Siswa</h1>
          <p className="page-subtitle">Pengisian pencapaian indikator konkret perkembangan siswa per program & level (vokal/konsonan, membaca kalimat, matematika nalar).</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowInputModal(true)}>
          + Input Progress Belajar Siswa
        </button>
      </div>

      {/* Rincian Progress Siswa */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {progressList.map(p => (
          <div key={p.id} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{p.id}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>{p.namaSiswa}</h3>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{p.kelas} · {p.program} ({p.level})</div>
              </div>
              <div style={{ background: "#d1fae5", color: "#059669", fontSize: 16, fontWeight: 900, padding: "4px 12px", borderRadius: 999 }}>
                {p.skorNilai}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Indikator Pembelajaran Ter Capai</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.indikatorCapai.map((ind, idx) => (
                  <div key={idx} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, color: "#166534", fontWeight: 600 }}>
                    ✓ {ind}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Catatan Perkembangan Guru</div>
              <p style={{ fontSize: 12.5, color: "var(--color-text-primary)", margin: "4px 0 0", lineHeight: 1.5 }}>"{p.catatanGuru}"</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Input Progress */}
      {showInputModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Input Progress Belajar Siswa</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Siswa</label>
                <select className="form-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                  <option value="Andi Setiawan">Andi Setiawan (KLS-A — Calistung)</option>
                  <option value="Ivan Kurnia">Ivan Kurnia (KLS-A — Calistung)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Capaian Indikator (Centang)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6, fontSize: 13 }}>
                  <label><input type="checkbox" defaultChecked /> Mengenal vokal & konsonan dasar</label>
                  <label><input type="checkbox" defaultChecked /> Membaca kata sederhana 2 suku kata</label>
                  <label><input type="checkbox" /> Membaca cerita pendek bergambar</label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Skor Evaluasi (0-100)</label>
                <input className="form-input" placeholder="88" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Catatan Perkembangan Khusus Guru</label>
                <textarea className="form-input" placeholder="Tuliskan catatan perkembangan konkret..." style={{ minHeight: 80 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <button className="btn btn-ghost" onClick={() => setShowInputModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={() => { alert("Progress belajar tersimpan!"); setShowInputModal(false); }}>Simpan Progress</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
