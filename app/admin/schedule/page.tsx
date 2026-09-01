"use client";
import { useState } from "react";

export interface ScheduleSession {
  id: string;
  hari: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
  jamMulai: string;
  jamSelesai: string;
  program: string;
  kelas: string;
  level: string;
  guru: string;
  ruangan: string;
  siswaCount: number;
  warna: string;
}

const initialSchedule: ScheduleSession[] = [
  { id: "SCH-001", hari: "Senin", jamMulai: "14:00", jamSelesai: "15:00", program: "Calistung", kelas: "KLS-A", level: "Level 1", guru: "Ms. Sarah", ruangan: "Ruang A (Lt 1)", siswaCount: 8, warna: "#0284c7" },
  { id: "SCH-002", hari: "Senin", jamMulai: "15:30", jamSelesai: "16:30", program: "English", kelas: "KLS-B", level: "Level 2 (B1)", guru: "Mr. Andi", ruangan: "Ruang B (Lt 1)", siswaCount: 6, warna: "#7c3aed" },
  { id: "SCH-003", hari: "Selasa", jamMulai: "14:00", jamSelesai: "15:00", program: "Calistung", kelas: "KLS-E", level: "Level 2", guru: "Mr. Budi", ruangan: "Ruang A (Lt 1)", siswaCount: 5, warna: "#0284c7" },
  { id: "SCH-004", hari: "Selasa", jamMulai: "15:30", jamSelesai: "16:30", program: "English", kelas: "KLS-B", level: "Level 2 (B1)", guru: "Mr. Andi", ruangan: "Ruang B (Lt 1)", siswaCount: 6, warna: "#7c3aed" },
  { id: "SCH-005", hari: "Rabu", jamMulai: "14:00", jamSelesai: "15:00", program: "Calistung", kelas: "KLS-A", level: "Level 1", guru: "Ms. Sarah", ruangan: "Ruang A (Lt 1)", siswaCount: 8, warna: "#0284c7" },
  { id: "SCH-006", hari: "Rabu", jamMulai: "16:00", jamSelesai: "17:00", program: "Math", kelas: "KLS-C", level: "Level 3 (Advance)", guru: "Ms. Nina", ruangan: "Ruang Lab Math", siswaCount: 7, warna: "#059669" },
  { id: "SCH-007", hari: "Kamis", jamMulai: "14:00", jamSelesai: "15:00", program: "Calistung", kelas: "KLS-E", level: "Level 2", guru: "Mr. Budi", ruangan: "Ruang A (Lt 1)", siswaCount: 5, warna: "#0284c7" },
  { id: "SCH-008", hari: "Kamis", jamMulai: "15:30", jamSelesai: "16:30", program: "Phonics", kelas: "KLS-D", level: "Level 1", guru: "Ms. Sarah", ruangan: "Ruang Phonics", siswaCount: 6, warna: "#ea580c" },
  { id: "SCH-009", hari: "Jumat", jamMulai: "16:00", jamSelesai: "17:00", program: "Math", kelas: "KLS-C", level: "Level 3 (Advance)", guru: "Ms. Nina", ruangan: "Ruang Lab Math", siswaCount: 7, warna: "#059669" },
  { id: "SCH-010", hari: "Sabtu", jamMulai: "10:00", jamSelesai: "11:30", program: "Phonics", kelas: "KLS-D", level: "Level 1", guru: "Ms. Sarah", ruangan: "Ruang Phonics", siswaCount: 8, warna: "#ea580c" },
];

const hariList: ("Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu")[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleSession[]>(initialSchedule);
  const [filterGuru, setFilterGuru] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const gurus = ["Semua", ...Array.from(new Set(schedules.map(s => s.guru)))];
  const programs = ["Semua", ...Array.from(new Set(schedules.map(s => s.program)))];

  const filtered = schedules.filter(s => {
    const matchGuru = filterGuru === "Semua" || s.guru === filterGuru;
    const matchProg = filterProgram === "Semua" || s.program === filterProgram;
    return matchGuru && matchProg;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .schedule-card { transition: all 0.15s ease; }
        .schedule-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Jadwal Kelas & Sesi Pembelajaran</h1>
          <p className="page-subtitle">Kalender jadwal mingguan interaktif. Filter berdasarkan guru pengajar atau program kursus.</p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{ padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer", background: viewMode === "grid" ? "#fff" : "transparent", color: viewMode === "grid" ? "var(--color-primary)" : "var(--color-text-muted)" }}
            >
              📅 Matriks Mingguan
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{ padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer", background: viewMode === "list" ? "#fff" : "transparent", color: viewMode === "list" ? "var(--color-primary)" : "var(--color-text-muted)" }}
            >
              ☰ Daftar Sesi
            </button>
          </div>
          <button className="btn btn-accent" onClick={() => setShowAddModal(true)}>
            + Tambah Sesi Jadwal
          </button>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: 2 }}>FILTER GURU</label>
              <select className="select-control" value={filterGuru} onChange={e => setFilterGuru(e.target.value)} style={{ padding: "8px 14px", fontSize: 13 }}>
                {gurus.map(g => <option key={g} value={g}>{g === "Semua" ? "Semua Guru" : `Guru: ${g}`}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: 2 }}>FILTER PROGRAM</label>
              <select className="select-control" value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ padding: "8px 14px", fontSize: 13 }}>
                {programs.map(p => <option key={p} value={p}>{p === "Semua" ? "Semua Program" : `Program: ${p}`}</option>)}
              </select>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0284c7" }} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Calistung</span>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed" }} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>English</span>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669" }} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Math</span>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ea580c" }} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Phonics</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE GRID MATRIKS MINGGUAN */}
      {viewMode === "grid" && (
        <div className="card" style={{ overflow: "hidden", padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {hariList.map(hari => {
              const sessionsHari = filtered.filter(s => s.hari === hari);

              return (
                <div key={hari} style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 10, minHeight: 380 }}>
                  <div style={{ paddingBottom: 8, borderBottom: "2px solid var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{hari}</span>
                    <span style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)", fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 999 }}>
                      {sessionsHari.length} Sesi
                    </span>
                  </div>

                  {sessionsHari.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 12, fontStyle: "italic", textAlign: "center" }}>
                      Tidak ada kelas
                    </div>
                  ) : (
                    sessionsHari.map(s => (
                      <div
                        key={s.id}
                        className="schedule-card"
                        onClick={() => setSelectedSession(s)}
                        style={{
                          background: "#fff",
                          borderLeft: `4px solid ${s.warna}`,
                          borderRadius: 8,
                          padding: "10px 12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, color: s.warna, marginBottom: 2 }}>
                          ⏰ {s.jamMulai} – {s.jamSelesai}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{s.program} ({s.kelas})</div>
                        <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>👩‍🏫 {s.guru}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                          <span>📍 {s.ruangan}</span>
                          <span>👥 {s.siswaCount} Siswa</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE LIST DAFTAR SESI */}
      {viewMode === "list" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ID Sesi", "Hari & Jam", "Program & Level", "Kelas", "Guru Pengajar", "Ruangan", "Kapasitas Siswa", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{s.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <strong style={{ color: "var(--color-text-primary)", fontSize: 13.5 }}>{s.hari}</strong>
                      <div style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 700 }}>{s.jamMulai} – {s.jamSelesai} WIB</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{s.program}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{s.level}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6 }}>{s.kelas}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>👩‍🏫 {s.guru}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>📍 {s.ruangan}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>👥 {s.siswaCount} Anak</td>
                    <td style={{ padding: "14px 16px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSession(s)}>Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETAIL SESI */}
      {selectedSession && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Sesi Jadwal</h2>
              <button onClick={() => setSelectedSession(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", borderLeft: `5px solid ${selectedSession.warna}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: selectedSession.warna }}>{selectedSession.hari}, {selectedSession.jamMulai} – {selectedSession.jamSelesai} WIB</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedSession.program} — {selectedSession.kelas}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>Tingkatan: {selectedSession.level}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Guru Pengajar</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>👩‍🏫 {selectedSession.guru}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Lokasi Ruangan</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>📍 {selectedSession.ruangan}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedSession(null)}>Tutup</button>
                <button className="btn btn-accent" onClick={() => { alert("Reschedule jadwal diproses"); setSelectedSession(null); }}>Reschedule Sesi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SESI */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Tambah Sesi Jadwal Baru</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hari</label>
                  <select className="form-input">
                    {hariList.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jam (WIB)</label>
                  <input className="form-input" placeholder="14:00 - 15:00" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kelas & Program</label>
                  <input className="form-input" placeholder="KLS-A (Calistung)" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Guru Pengajar</label>
                  <input className="form-input" placeholder="Ms. Sarah" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ruangan</label>
                <input className="form-input" placeholder="Ruang A (Lt 1)" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={() => { alert("Sesi jadwal ditambahkan!"); setShowAddModal(false); }}>Simpan Sesi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
