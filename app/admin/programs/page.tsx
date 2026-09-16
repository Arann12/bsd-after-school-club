"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

export interface Program {
  id: string;
  name: string;
  desc: string;
  levels: string[];
  sessions: number;
  price: number;
  status: "Aktif" | "Nonaktif";
  students: number;
  teachers: string[];
  studentList: { name: string; kelas: string; parent: string }[];
}

const initialPrograms: Program[] = [
  {
    id: "PRG-001",
    name: "Calistung",
    desc: "Membaca, menulis, dan berhitung untuk anak usia dini dengan metode interaktif & menyenangkan.",
    levels: ["Level 1 (Pemula)", "Level 2 (Sedang)", "Level 3 (Mahir)"],
    sessions: 12,
    price: 50000,
    status: "Aktif",
    students: 34,
    teachers: ["Ms. Sarah", "Mr. Budi"],
    studentList: [
      { name: "Andi Setiawan", kelas: "KLS-A", parent: "Budi Setiawan" },
      { name: "Eko Wijaya", kelas: "KLS-E", parent: "Joko Wijaya" },
      { name: "Ivan Kurnia", kelas: "KLS-A", parent: "Lestari Kurnia" },
    ],
  },
  {
    id: "PRG-002",
    name: "English",
    desc: "Kursus bahasa Inggris komunikatif untuk meningkatkan kosa kata, tata bahasa, dan rasa percaya diri anak.",
    levels: ["Starter (A1)", "Intermediate (B1)", "Advanced (B2)"],
    sessions: 12,
    price: 75000,
    status: "Aktif",
    students: 28,
    teachers: ["Mr. Andi"],
    studentList: [
      { name: "Budi Santoso", kelas: "KLS-B", parent: "Hendra Santoso" },
      { name: "Fitri Handayani", kelas: "KLS-B", parent: "Rina Handayani" },
    ],
  },
  {
    id: "PRG-003",
    name: "Math",
    desc: "Matematika dasar hingga lanjutan menggunakan alat peraga visual dan logika penalaran.",
    levels: ["Basic Math", "Math Intermediate", "Math Advance"],
    sessions: 12,
    price: 60000,
    status: "Aktif",
    students: 22,
    teachers: ["Ms. Nina"],
    studentList: [
      { name: "Citra Kirana", kelas: "KLS-C", parent: "Dewi Kirana" },
      { name: "Gilang Ramadan", kelas: "KLS-C", parent: "Ahmad Ramadan" },
    ],
  },
  {
    id: "PRG-004",
    name: "Phonics",
    desc: "Pembelajaran fonik struktur suara kata untuk mempercepat pengenalan bacaan bahasa Inggris.",
    levels: ["Phonics Starter", "Phonics Level 2"],
    sessions: 8,
    price: 50000,
    status: "Aktif",
    students: 18,
    teachers: ["Ms. Sarah"],
    studentList: [
      { name: "Dian Pratama", kelas: "KLS-D", parent: "Sari Pratama" },
      { name: "Hana Pertiwi", kelas: "KLS-D", parent: "Siska Pertiwi" },
    ],
  },
  {
    id: "PRG-005",
    name: "Coding Junior",
    desc: "Pengenalan logika komputer, algoritma dasar, dan pemrograman visual dengan Scratch.",
    levels: ["Scratch Junior", "Python Kids"],
    sessions: 10,
    price: 90000,
    status: "Nonaktif",
    students: 0,
    teachers: ["Mr. Budi"],
    studentList: [],
  },
];

export default function AdminProgramsPage() {
  const [programList, setProgramList] = useState<Program[]>(initialPrograms);
  const [search, setSearch] = useState("");
  const [isEditMode, setIsEditMode] = useState(false); // Toggle Edit Program mode (Requirement #5)

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsTab, setShowStudentsTab] = useState(false);

  const filtered = programList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCardClick = (p: Program) => {
    setSelectedProgram(p);
    if (isEditMode) {
      // In edit mode: open Edit Modal
      setShowEditModal(true);
    } else {
      // In normal mode: open Detail Modal
      setShowStudentsTab(false);
      setShowDetailModal(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .prog-card{transition:all .2s ease;cursor:pointer}
        .prog-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.12)!important;transform:translateY(-2px)}
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Program Kursus</h1>
          <p className="page-subtitle">Kelola daftar program, tingkat level, pengajar, serta daftar siswa di setiap program.</p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 10 }}>
          {/* BUTTON EDIT PROGRAM TOGGLE (Requirement #5) */}
          <button
            className={`btn ${isEditMode ? "btn-accent" : "btn-outline"}`}
            style={{
              background: isEditMode ? "#ea580c" : "#fff",
              borderColor: isEditMode ? "#ea580c" : "var(--color-border)",
              color: isEditMode ? "#fff" : "var(--color-text-primary)",
              fontWeight: 700,
            }}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            ✏️ {isEditMode ? "Mode Edit: AKTIF (Klik Card untuk Edit)" : "Edit Program"}
          </button>

          {/* Button Tambah Program */}
          <button className="btn btn-accent" onClick={() => { setSelectedProgram(null); setShowEditModal(true); }}>
            + Tambah Program
          </button>
        </div>
      </div>

      {/* Banner status mode edit */}
      {isEditMode && (
        <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: 12, padding: "12px 18px", fontSize: 13, color: "#c2410c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span><strong>MODE EDIT PROGRAM AKTIF:</strong> Klik pada card program mana saja di bawah ini untuk langsung membuka form pengeditan program.</span>
          <button className="btn btn-ghost btn-sm" style={{ color: "#c2410c" }} onClick={() => setIsEditMode(false)}>Keluar Mode Edit</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Program", value: programList.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Program Aktif", value: programList.filter(p => p.status === "Aktif").length, color: "#059669", bg: "#d1fae5" },
          { label: "Total Siswa Terdaftar", value: programList.reduce((a, p) => a + p.students, 0), color: "#7c3aed", bg: "#ede9fe" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search Bar dengan Icon */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="search-input" style={{ paddingLeft: 38, width: "100%" }} placeholder="Cari nama program..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            className="card prog-card"
            onClick={() => handleCardClick(p)}
            style={{
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              border: isEditMode ? "2px dashed #ea580c" : "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)", marginBottom: 4 }}>{p.id}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>{p.name}</div>
              </div>
              <span style={{ background: p.status === "Aktif" ? "#d1fae5" : "#f1f5f9", color: p.status === "Aktif" ? "#059669" : "#64748b", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{p.status}</span>
            </div>

            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>{p.desc}</p>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Guru Pengajar</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.teachers.map(t => (
                  <span key={t} style={{ background: "#ede9fe", color: "#6d28d9", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, borderTop: "1px solid var(--color-border-light)", paddingTop: 14 }}>
              {[{ label: "Pertemuan", value: `${p.sessions}x` }, { label: "Harga/sesi", value: `Rp ${p.price.toLocaleString("id-ID")}` }, { label: "Siswa", value: `${p.students} Anak` }].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {isEditMode && (
              <div style={{ background: "#ea580c", color: "#fff", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                Klik Card Ini untuk Edit Program
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL DETAIL PROGRAM (Mode Normal — Requirement #5) */}
      <Modal open={showDetailModal && !!selectedProgram} onClose={() => setShowDetailModal(false)} title={selectedProgram ? `Detail Informasi Program — ${selectedProgram.name}` : ""} maxWidth={580}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Card Banner */}
          <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{selectedProgram?.id}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedProgram?.name}</div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{selectedProgram?.desc}</p>
          </div>

          {/* Grid Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { label: "Jumlah Pertemuan", val: `${selectedProgram?.sessions} Sesi` },
              { label: "Biaya / Pertemuan", val: `Rp ${selectedProgram?.price.toLocaleString("id-ID")}` },
              { label: "Total Siswa", val: `${selectedProgram?.students} Siswa` },
            ].map(m => (
              <div key={m.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* GURU YANG MENGAJAR (Requirement #5) */}
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Guru / Tenaga Pengajar Program Ini
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {selectedProgram?.teachers.map(t => (
                <div key={t} style={{ background: "#fff", border: "1px solid #86efac", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>
                    {t[0]}
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* LEVEL-LEVEL DALAM PROGRAM */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Tingkatan Level</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedProgram?.levels.map(l => (
                <span key={l} style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>{l}</span>
              ))}
            </div>
          </div>

          {/* DAFTAR SISWA PROGRAM (Requirement #5) */}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
            <button
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}
              onClick={() => setShowStudentsTab(!showStudentsTab)}
            >
              {showStudentsTab ? "Sembunyikan Daftar Siswa" : `Lihat Siswa Program Ini (${selectedProgram?.studentList.length})`}
            </button>

            {showStudentsTab && (
              <div style={{ marginTop: 12, background: "var(--color-bg)", borderRadius: 10, padding: 14 }}>
                {selectedProgram?.studentList.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", padding: 12 }}>Belum ada siswa terdaftar pada program ini.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <th style={{ textAlign: "left", padding: 6, fontSize: 11, color: "var(--color-text-muted)" }}>Nama Siswa</th>
                        <th style={{ textAlign: "left", padding: 6, fontSize: 11, color: "var(--color-text-muted)" }}>Kelas</th>
                        <th style={{ textAlign: "left", padding: 6, fontSize: 11, color: "var(--color-text-muted)" }}>Orang Tua</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProgram?.studentList.map(s => (
                        <tr key={s.name} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                          <td style={{ padding: "8px 6px", fontWeight: 700 }}>{s.name}</td>
                          <td style={{ padding: "8px 6px" }}>{s.kelas}</td>
                          <td style={{ padding: "8px 6px", color: "var(--color-text-secondary)" }}>{s.parent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>Tutup</button>
            <button className="btn btn-accent" onClick={() => { setShowDetailModal(false); setShowEditModal(true); }}>Edit Program Ini</button>
          </div>
        </div>
      </Modal>

      {/* MODAL EDIT / TAMBAH PROGRAM */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={selectedProgram ? `Edit Program — ${selectedProgram.name}` : "Tambah Program Baru"} maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Program</label>
            <input className="form-input" defaultValue={selectedProgram?.name || ""} placeholder="Contoh: Calistung" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" defaultValue={selectedProgram?.desc || ""} placeholder="Deskripsi program..." style={{ minHeight: 80 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Harga Per Pertemuan (Rp)</label>
              <input className="form-input" defaultValue={selectedProgram?.price.toString() || ""} placeholder="50000" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jumlah Pertemuan Paket</label>
              <input className="form-input" defaultValue={selectedProgram?.sessions.toString() || ""} placeholder="12" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status Program</label>
            <select className="form-input" defaultValue={selectedProgram?.status || "Aktif"}>
              <option>Aktif</option>
              <option>Nonaktif</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Batal</button>
            <button className="btn btn-accent" onClick={() => setShowEditModal(false)}>Simpan Program</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
