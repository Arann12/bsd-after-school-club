"use client";
import { useState } from "react";
import { classes, teachers, programs } from "@/lib/data";
import Modal from "@/components/ui/Modal";

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
const uniqueRooms = Array.from(new Set(classes.map(c => c.room)));
const activeTeachers = teachers.filter(t => t.status === "Aktif");
const activePrograms = programs.filter(p => p.status === "Aktif");

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isOverlapping(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(aEnd) > timeToMinutes(bStart);
}

function ClockFace({ value, onChange, onClose, title }: { value: string; onChange: (v: string) => void; onClose: () => void; title: string }) {
  const [step, setStep] = useState<"hour" | "minute">("hour");
  const [selectedHour, setSelectedHour] = useState(value ? value.split(":")[0] : "14");
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(":")[1] || "00" : "00");
  const [pendingHour, setPendingHour] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  function handleHourClick(val: string) {
    setPendingHour(val);
    setAnimating(true);
    /* tunggu animasi jarum selesai (~500ms) lalu pindah ke menit */
    setTimeout(() => {
      setSelectedHour(val);
      setPendingHour(null);
      setAnimating(false);
      setStep("minute");
    }, 500);
  }

  function handleMinuteClick(m: string) {
    setSelectedMinute(m);
    setAnimating(true);
    /* tunggu animasi jarum selesai lalu tutup */
    setTimeout(() => {
      setAnimating(false);
      onChange(`${selectedHour}:${m}`);
      onClose();
    }, 500);
  }

  const SIZE = 300;
  const CX = SIZE / 2;

  const midRing = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const innerRing = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const minuteRing = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  /* step-aware radii */
  const R_HOUR_OUTER = 110;
  const R_HOUR_INNER = 65;
  const R_MINUTE = 105;

  function pos(i: number, r: number) {
    const rad = (i * 30 * Math.PI) / 180;
    return { x: CX + r * Math.sin(rad), y: CX - r * Math.cos(rad) };
  }

  function hourLabel(h: number) { return h === 0 ? "24" : String(h); }
  function hourVal(h: number) { return h === 0 ? "00" : String(h).padStart(2, "0"); }

  const displayHour = pendingHour ?? selectedHour;
  const hourDeg = (parseInt(displayHour) % 12) * 30;
  const minuteDeg = (parseInt(selectedMinute) / 5) * 30;

  return (
    <Modal open={true} onClose={onClose} title={title} maxWidth={360}>
      <style>{`
        @keyframes clockPop { 0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; } 60% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1); } }
        @keyframes clockRingIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .clock-hand { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .clock-num { transition: all 0.15s ease; }
        .clock-num:hover { transform: translate(-50%, -50%) scale(1.15); }
        .clock-num-active { animation: clockPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .clock-ring { animation: clockRingIn 0.3s ease-out forwards; }
      `}</style>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* header */}
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--color-primary)", marginBottom: 10 }}>
          {displayHour}:{step === "minute" ? selectedMinute : "--"}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, marginBottom: 10 }}>
          {step === "hour" ? "Pilih Jam" : "Pilih Menit"}
        </div>

        {/* clock face */}
        <div style={{ position: "relative", width: SIZE, height: SIZE }}>
          {/* background circle */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#f1f5f9", border: "2px solid #e2e8f0" }} />

          {/* clock hands */}
          {step === "hour" ? (
            <div className="clock-hand" style={{
              position: "absolute", left: CX - 2.5, top: CX - (R_HOUR_OUTER - 10),
              width: 5, height: R_HOUR_OUTER - 10, borderRadius: 3,
              background: "#334155", transformOrigin: "center bottom",
              transform: `rotate(${hourDeg}deg)`, zIndex: 2, opacity: 0.45,
            }} />
          ) : (
            <div className="clock-hand" style={{
              position: "absolute", left: CX - 1.5, top: CX - (R_MINUTE - 10),
              width: 3, height: R_MINUTE - 10, borderRadius: 2,
              background: "var(--color-primary)", transformOrigin: "center bottom",
              transform: `rotate(${minuteDeg}deg)`, zIndex: 3, opacity: 0.5,
            }} />
          )}
          {/* center dot */}
          <div style={{ position: "absolute", left: CX - 6, top: CX - 6, width: 12, height: 12, borderRadius: "50%", background: "var(--color-primary)", zIndex: 4, border: "2px solid #fff" }} />

          {/* minute ring (only in minute step) */}
          {step === "minute" && (
            <div className="clock-ring" style={{ position: "absolute", inset: 0 }}>
              {minuteRing.map((m, i) => {
                const p = pos(i, R_MINUTE);
                const mVal = String(m).padStart(2, "0");
                const active = mVal === selectedMinute;
                return (
                  <div key={m} className={`clock-num${active ? " clock-num-active" : ""}`}
                    onClick={() => !animating && handleMinuteClick(mVal)} style={{
                    position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -50%)",
                    width: 30, height: 30, borderRadius: "50%", cursor: "pointer", zIndex: 5,
                    background: active ? "var(--color-primary)" : "transparent",
                    color: active ? "#fff" : "#475569",
                    fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{mVal}</div>
                );
              })}
            </div>
          )}

          {/* middle ring: hours 1–12 (only in hour step) */}
          {step === "hour" && (
            <div className="clock-ring" style={{ position: "absolute", inset: 0 }}>
              {midRing.map((h, i) => {
                const p = pos(i, R_HOUR_OUTER);
                const val = hourVal(h);
                const active = val === displayHour;
                return (
                  <div key={`m${h}`} className={`clock-num${active ? " clock-num-active" : ""}`}
                    onClick={() => !animating && handleHourClick(val)} style={{
                    position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -50%)",
                    width: 34, height: 34, borderRadius: "50%", cursor: "pointer", zIndex: 5,
                    background: "transparent",
                    color: active ? "var(--color-primary)" : "#1e293b",
                    fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{h}</div>
                );
              })}
            </div>
          )}

          {/* inner ring: hours 13–24 (only in hour step) */}
          {step === "hour" && (
            <div className="clock-ring" style={{ position: "absolute", inset: 0 }}>
              {innerRing.map((h, i) => {
                const p = pos(i, R_HOUR_INNER);
                const val = hourVal(h);
                const active = val === displayHour;
                return (
                  <div key={`i${h}`} className={`clock-num${active ? " clock-num-active" : ""}`}
                    onClick={() => !animating && handleHourClick(val)} style={{
                    position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -50%)",
                    width: 30, height: 30, borderRadius: "50%", cursor: "pointer", zIndex: 5,
                    background: "transparent",
                    color: active ? "var(--color-primary)" : "#64748b",
                    fontWeight: 800, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{hourLabel(h)}</div>
                );
              })}
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {step === "minute" && (
            <button onClick={() => setStep("hour")} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: "var(--color-text-muted)" }}>
              ← Jam
            </button>
          )}
          <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: "var(--color-text-muted)" }}>
            Batal
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleSession[]>(initialSchedule);
  const [filterGuru, setFilterGuru] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formHari, setFormHari] = useState<string>(hariList[0]);
  const [formKelas, setFormKelas] = useState(activePrograms[0]?.name || "");
  const [formGuru, setFormGuru] = useState(activeTeachers[0]?.name || "");
  const [formRuangan, setFormRuangan] = useState(uniqueRooms[0] || "");
  const [formJamMulai, setFormJamMulai] = useState("14:00");
  const [formJamSelesai, setFormJamSelesai] = useState("15:00");

  const [clockTarget, setClockTarget] = useState<"mulai" | "selesai" | null>(null);

  const gurus = ["Semua", ...Array.from(new Set(schedules.map(s => s.guru)))];
  const programs = ["Semua", ...Array.from(new Set(schedules.map(s => s.program)))];

  const filtered = schedules.filter(s => {
    const matchGuru = filterGuru === "Semua" || s.guru === filterGuru;
    const matchProg = filterProgram === "Semua" || s.program === filterProgram;
    return matchGuru && matchProg;
  });

  /* conflict check: guru + hari + overlapping time */
  const conflictSession = schedules.find(s =>
    s.guru === formGuru &&
    s.hari === formHari &&
    isOverlapping(formJamMulai, formJamSelesai, s.jamMulai, s.jamSelesai)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
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
          <div className="view-toggle-group">
            <button
              onClick={() => setViewMode("grid")}
              className={`view-toggle-btn${viewMode === "grid" ? " active" : ""}`}
            >
              Matriks Mingguan
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`view-toggle-btn${viewMode === "list" ? " active" : ""}`}
            >
              Daftar Sesi
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
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
                          {s.jamMulai} – {s.jamSelesai}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{s.program} ({s.kelas})</div>
                        <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>Guru: {s.guru}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                          <span>{s.ruangan}</span>
                          <span>{s.siswaCount} Siswa</span>
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
                    <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{s.guru}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{s.ruangan}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{s.siswaCount} Anak</td>
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
      {selectedSession && (<Modal open onClose={() => setSelectedSession(null)} title="Detail Sesi Jadwal" maxWidth={500}>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", borderLeft: `5px solid ${selectedSession.warna}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: selectedSession.warna }}>{selectedSession.hari}, {selectedSession.jamMulai} – {selectedSession.jamSelesai} WIB</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedSession.program} — {selectedSession.kelas}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>Tingkatan: {selectedSession.level}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Guru Pengajar</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{selectedSession.guru}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Lokasi Ruangan</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{selectedSession.ruangan}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedSession(null)}>Tutup</button>
                <button className="btn btn-accent" onClick={() => setSelectedSession(null)}>Reschedule Sesi</button>
              </div>
            </div>
      </Modal>)}

      {/* MODAL TAMBAH SESI */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setClockTarget(null); }} title="Tambah Sesi Jadwal Baru" maxWidth={520}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Hari */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hari</label>
                <select className="form-input" value={formHari} onChange={e => setFormHari(e.target.value)}>
                  {hariList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Jam Mulai & Jam Selesai */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jam Mulai</label>
                  <button
                    onClick={() => setClockTarget("mulai")}
                    className="form-input"
                    style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-primary)" }}>{formJamMulai}</span>
                  </button>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jam Selesai</label>
                  <button
                    onClick={() => setClockTarget("selesai")}
                    className="form-input"
                    style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-primary)" }}>{formJamSelesai}</span>
                  </button>
                </div>
              </div>

              {/* Conflict Warning */}
              {conflictSession && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#dc2626" }}>Bentrok Jadwal!</div>
                    <div style={{ fontSize: 11.5, color: "#991b1b", marginTop: 2 }}>
                      {conflictSession.guru} sudah mengajar <strong>{conflictSession.program} ({conflictSession.kelas})</strong> pada {conflictSession.hari}, {conflictSession.jamMulai} – {conflictSession.jamSelesai}.
                    </div>
                  </div>
                </div>
              )}

              {/* Kelas & Program, Guru, Ruangan */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kelas & Program</label>
                  <select className="form-input" value={formKelas} onChange={e => setFormKelas(e.target.value)}>
                    {activePrograms.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Guru Pengajar</label>
                  <select className="form-input" value={formGuru} onChange={e => setFormGuru(e.target.value)}>
                    {activeTeachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name} — {t.specialization}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ruangan</label>
                <select className="form-input" value={formRuangan} onChange={e => setFormRuangan(e.target.value)}>
                  {uniqueRooms.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => { setShowAddModal(false); setClockTarget(null); }}>Batal</button>
                <button className="btn btn-accent" onClick={() => { setShowAddModal(false); setClockTarget(null); }} disabled={!!conflictSession}>Simpan Sesi</button>
              </div>
            </div>
      </Modal>

      {/* CLOCK PICKER MODAL — separate overlay */}
      {clockTarget && (
        <ClockFace
          key={clockTarget}
          value={clockTarget === "mulai" ? formJamMulai : formJamSelesai}
          onChange={(v) => clockTarget === "mulai" ? setFormJamMulai(v) : setFormJamSelesai(v)}
          onClose={() => setClockTarget(null)}
          title={clockTarget === "mulai" ? "Jam Mulai" : "Jam Selesai"}
        />
      )}
    </div>
  );
}
