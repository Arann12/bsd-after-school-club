"use client";
import { useState } from "react";
import Link from "next/link";

export interface ClassItem {
  id: string;
  name: string;
  program: string;
  level: string;
  guru: string;
  guruHp: string;
  ruangan: string;
  jadwalHari: string;
  jadwalJam: string;
  kapasitas: number;
  terisi: number;
  status: "Aktif" | "Penuh" | "Selesai";
  siswaList: { id: string; name: string; parent: string; parentPhone: string; statusBayar: string }[];
}

const initialClasses: ClassItem[] = [
  {
    id: "KLS-A",
    name: "Kelas A — Calistung Basic",
    program: "Calistung",
    level: "Level 1",
    guru: "Ms. Sarah",
    guruHp: "081299887766",
    ruangan: "Ruang A (Lantai 1)",
    jadwalHari: "Senin & Rabu",
    jadwalJam: "14:00 – 15:00 WIB",
    kapasitas: 8,
    terisi: 2,
    status: "Aktif",
    siswaList: [
      { id: "STD-2026-0001", name: "Andi Setiawan", parent: "Budi Setiawan", parentPhone: "081234567890", statusBayar: "Lunas" },
      { id: "STD-2026-0009", name: "Ivan Kurnia", parent: "Lestari Kurnia", parentPhone: "081888990011", statusBayar: "Belum Bayar" },
    ],
  },
  {
    id: "KLS-B",
    name: "Kelas B — English Intermediate",
    program: "English",
    level: "Level 2 (B1)",
    guru: "Mr. Andi",
    guruHp: "081388776655",
    ruangan: "Ruang B (Lantai 1)",
    jadwalHari: "Selasa & Kamis",
    jadwalJam: "15:30 – 16:30 WIB",
    kapasitas: 8,
    terisi: 2,
    status: "Aktif",
    siswaList: [
      { id: "STD-2026-0002", name: "Budi Santoso", parent: "Hendra Santoso", parentPhone: "081987654321", statusBayar: "Belum Bayar" },
      { id: "STD-2026-0006", name: "Fitri Handayani", parent: "Rina Handayani", parentPhone: "081399887766", statusBayar: "Lunas" },
    ],
  },
  {
    id: "KLS-C",
    name: "Kelas C — Math Advance",
    program: "Math",
    level: "Level 3 (Advance)",
    guru: "Ms. Nina",
    guruHp: "081477665544",
    ruangan: "Ruang Lab Math (Lantai 2)",
    jadwalHari: "Rabu & Jumat",
    jadwalJam: "16:00 – 17:00 WIB",
    kapasitas: 8,
    terisi: 2,
    status: "Aktif",
    siswaList: [
      { id: "STD-2026-0003", name: "Citra Kirana", parent: "Dewi Kirana", parentPhone: "085678901234", statusBayar: "Lunas" },
      { id: "STD-2026-0007", name: "Gilang Ramadan", parent: "Ahmad Ramadan", parentPhone: "081555443322", statusBayar: "Lunas" },
    ],
  },
  {
    id: "KLS-D",
    name: "Kelas D — Phonics Starter",
    program: "Phonics",
    level: "Level 1 (Starter)",
    guru: "Ms. Sarah",
    guruHp: "081299887766",
    ruangan: "Ruang Phonics (Lantai 1)",
    jadwalHari: "Sabtu",
    jadwalJam: "10:00 – 11:30 WIB",
    kapasitas: 8,
    terisi: 2,
    status: "Aktif",
    siswaList: [
      { id: "STD-2026-0004", name: "Dian Pratama", parent: "Sari Pratama", parentPhone: "082112233445", statusBayar: "Belum Bayar" },
      { id: "STD-2026-0008", name: "Hana Pertiwi", parent: "Siska Pertiwi", parentPhone: "081777889900", statusBayar: "Overdue" },
    ],
  },
  {
    id: "KLS-E",
    name: "Kelas E — Calistung Level 2",
    program: "Calistung",
    level: "Level 2",
    guru: "Mr. Budi",
    guruHp: "081566554433",
    ruangan: "Ruang A (Lantai 1)",
    jadwalHari: "Selasa & Kamis",
    jadwalJam: "14:00 – 15:00 WIB",
    kapasitas: 8,
    terisi: 1,
    status: "Aktif",
    siswaList: [
      { id: "STD-2026-0005", name: "Eko Wijaya", parent: "Joko Wijaya", parentPhone: "081987654322", statusBayar: "Lunas" },
    ],
  },
];

export default function AdminClassesPage() {
  const [classesList, setClassesList] = useState<ClassItem[]>(initialClasses);
  const [cari, setCari] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const terfilter = classesList.filter(c =>
    c.name.toLowerCase().includes(cari.toLowerCase()) ||
    c.guru.toLowerCase().includes(cari.toLowerCase()) ||
    c.program.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .cls-card { transition: all 0.2s ease; cursor: pointer; }
        .cls-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Kelas</h1>
          <p className="page-subtitle">Daftar kelas aktif, guru pengajar, dan seluruh siswa yang terdaftar di setiap kelas.</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setSelectedClass(null); setShowModal(true); }}>
          + Buat Kelas Baru
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Kelas", value: classesList.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Kelas Aktif", value: classesList.filter(c => c.status === "Aktif").length, color: "#059669", bg: "#d1fae5" },
          { label: "Total Siswa Terdistribusi", value: classesList.reduce((a, c) => a + c.terisi, 0), color: "#7c3aed", bg: "#ede9fe" },
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
            <input className="search-input" style={{ paddingLeft: 38, width: "100%" }} placeholder="Cari nama kelas, guru, atau program..." value={cari} onChange={e => setCari(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Grid Class Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {terfilter.map(c => (
          <div
            key={c.id}
            className="card cls-card"
            style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}
            onClick={() => setSelectedClass(c)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{c.id}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>{c.name}</h3>
              </div>
              <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>{c.status}</span>
            </div>

            {/* GURU PENGAJAR (Requirement #8) */}
            <div style={{ background: "#ede9fe", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7c3aed", color: "#fff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.guru[0]}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#6d28d9", fontWeight: 800, textTransform: "uppercase" }}>Guru Pengajar</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#4c1d95" }}>{c.guru}</div>
                </div>
              </div>
              <a href={`https://wa.me/62${c.guruHp.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9", background: "#fff", padding: "4px 8px", borderRadius: 6, textDecoration: "none" }}>
                WA Guru
              </a>
            </div>

            {/* Program & Jadwal */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, fontSize: 12 }}>
              <div style={{ background: "var(--color-bg)", padding: 8, borderRadius: 6 }}>
                <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: 10 }}>Program & Level</span>
                <strong style={{ color: "var(--color-text-primary)" }}>{c.program} — {c.level}</strong>
              </div>
              <div style={{ background: "var(--color-bg)", padding: 8, borderRadius: 6 }}>
                <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: 10 }}>Jadwal & Ruang</span>
                <strong style={{ color: "var(--color-text-primary)" }}>{c.jadwalHari} ({c.jadwalJam})</strong>
              </div>
            </div>

            {/* DAFTAR SISWA PREVIEW (Requirement #8) */}
            <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  👨‍🎓 Siswa Terdaftar ({c.siswaList.length} / {c.kapasitas})
                </span>
                <span style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700 }}>Klik untuk Detail &rarr;</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.siswaList.map(s => (
                  <span key={s.id} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL KELAS & SISWA INSIDE (Requirement #8) */}
      {selectedClass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 620, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                Detail Kelas — {selectedClass.name}
              </h2>
              <button onClick={() => setSelectedClass(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header Info Guru & Jadwal */}
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Guru Pengajar</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)", marginTop: 2 }}>👩‍🏫 {selectedClass.guru}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedClass.guruHp}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Jadwal & Ruangan</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedClass.jadwalHari}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedClass.jadwalJam} ({selectedClass.ruangan})</div>
                </div>
              </div>

              {/* RINCIAN DAFTAR SISWA DI KELAS INI (Requirement #8) */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 10 }}>
                  👨‍🎓 Daftar Siswa Terdaftar di {selectedClass.id} ({selectedClass.siswaList.length} Anak)
                </div>

                {selectedClass.siswaList.length === 0 ? (
                  <div style={{ background: "var(--color-bg)", padding: 20, borderRadius: 10, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                    Belum ada siswa yang dimasukkan ke kelas ini.
                  </div>
                ) : (
                  <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                          <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-text-muted)" }}>ID Siswa</th>
                          <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-text-muted)" }}>Nama Siswa</th>
                          <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-text-muted)" }}>Orang Tua</th>
                          <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-text-muted)" }}>Status Bayar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass.siswaList.map((s, idx) => (
                          <tr key={s.id} style={{ borderBottom: idx < selectedClass.siswaList.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{s.id}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.name}</td>
                            <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                              <div>{s.parent}</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.parentPhone}</div>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                background: s.statusBayar === "Lunas" ? "#d1fae5" : "#fee2e2",
                                color: s.statusBayar === "Lunas" ? "#059669" : "#dc2626",
                                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999
                              }}>
                                {s.statusBayar}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedClass(null)}>Tutup</button>
                <button className="btn btn-accent" onClick={() => setSelectedClass(null)}>+ Masukkan Siswa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
