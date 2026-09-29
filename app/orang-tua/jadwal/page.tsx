"use client";
import { useState, useEffect, useCallback } from "react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getMyParentProfile } from "@/lib/api/parents";
import axiosInstance from "@/lib/api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────

interface ChildOption {
  id: string;
  name: string;
  relation: string;
}

interface ClassSession {
  id: string;
  sessionNumber: number;
  sessionDate: string;       // YYYY-MM-DD
  sessionDateDisplay: string;
  dayName: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | string;
  classroomName: string;
  classroomId: string;
  programName: string;
  teacherName: string;
  material: string;
}

interface Enrollment {
  classroomId: string;
  classroomName: string;
  programName: string;
  levelName: string;
  teacherName: string;
}

type FilterType = "Semua" | "Mendatang" | "Selesai" | "Hari Ini";

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } catch { return iso; }
}

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

function getDayName(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { weekday: "long" });
  } catch { return ""; }
}

function getSessionStatus(dateStr: string, backendStatus: string): "Hari Ini" | "Mendatang" | "Selesai" {
  if (backendStatus === "completed") return "Selesai";
  if (backendStatus === "cancelled") return "Selesai";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Hari Ini";
  if (d > today) return "Mendatang";
  return "Selesai";
}

function statusStyle(s: string) {
  if (s === "Hari Ini")  return { bg: "#d1fae5", color: "#059669", border: "#059669" };
  if (s === "Mendatang") return { bg: "#dbeafe", color: "#1d4ed8", border: "#1d4ed8" };
  return { bg: "#f1f5f9", color: "#64748b", border: "#94a3b8" };
}

// ── Page ──────────────────────────────────────────────────────

export default function OrangTuaJadwalPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildOption | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [filter, setFilter] = useState<FilterType>("Semua");
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState("");

  // Load parent & children
  useEffect(() => {
    getMyParentProfile()
      .then(parent => {
        const opts = parent.students.map(s => ({ id: s.id, name: s.name, relation: s.relation }));
        setChildren(opts);
        if (opts.length > 0) setSelectedChild(opts[0]);
      })
      .catch(e => setError(e?.response?.data?.message || e.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  // Load sessions for selected child
  const loadSessions = useCallback(async (child: ChildOption) => {
    setLoadingSessions(true);
    setSessions([]);
    try {
      // 1. Get enrollments → classroom IDs
      const enrollRes = await axiosInstance.get<any>("/enrollments", {
        params: { student_id: child.id, per_page: 100 },
      });
      const enrollments: any[] = enrollRes.data.data?.data || enrollRes.data.data || [];

      if (enrollments.length === 0) {
        setSessions([]);
        return;
      }

      // 2. Fetch sessions for each classroom in parallel
      const allSessions: ClassSession[] = [];
      await Promise.all(
        enrollments.map(async (enroll: any) => {
          if (!enroll.classroom?.id) return;
          try {
            const sesRes = await axiosInstance.get<any>("/class-sessions", {
              params: { classroom_id: enroll.classroom.id },
            });
            const rawSessions: any[] = sesRes.data.data || [];
            for (const s of rawSessions) {
              const dateStr = s.session_date?.substring(0, 10) ?? "";
              const logbook = s.teacher_logbook || s.teacherLogbook || null;
              allSessions.push({
                id: s.id,
                sessionNumber: s.session_number ?? 0,
                sessionDate: dateStr,
                sessionDateDisplay: formatDateShort(dateStr),
                dayName: getDayName(dateStr),
                startTime: s.start_time ? s.start_time.substring(0, 5) : "--:--",
                endTime:   s.end_time   ? s.end_time.substring(0, 5)   : "--:--",
                status: getSessionStatus(dateStr, s.status ?? ""),
                classroomName: enroll.classroom?.name ?? s.classroom?.name ?? "-",
                classroomId: enroll.classroom.id,
                programName: `${enroll.program?.name ?? ""} ${enroll.program_level?.name ?? ""}`.trim(),
                teacherName: s.teacher?.user?.name ?? "-",
                material: logbook?.material ?? "",
              });
            }
          } catch { /* skip failed classroom */ }
        })
      );

      // Sort by date ascending
      allSessions.sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
      setSessions(allSessions);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Gagal memuat jadwal.");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) loadSessions(selectedChild);
  }, [selectedChild, loadSessions]);

  // ── Filter ────────────────────────────────────────────────

  const hariIni = sessions.filter(s => s.status === "Hari Ini");
  const filtered = filter === "Semua" ? sessions : sessions.filter(s => s.status === filter);
  const countOf = (f: FilterType) => f === "Semua" ? sessions.length : sessions.filter(s => s.status === f).length;

  // ── Render ────────────────────────────────────────────────

  if (loading) return <SkeletonTable rows={4} cols={3} />;

  if (error && children.length === 0) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>⚠ {error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        .sesi-card { transition: all .2s ease; }
        .sesi-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.07); }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Jadwal Kelas Anak</h1>
          <p className="page-subtitle">Jadwal sesi kelas yang diikuti anak Anda berdasarkan pendaftaran.</p>
        </div>
        <button className="btn btn-outline" onClick={() => selectedChild && loadSessions(selectedChild)}>↻ Refresh</button>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {children.map(c => (
            <button key={c.id} onClick={() => { setSelectedChild(c); setFilter("Semua"); }}
              style={{
                padding: "8px 18px", borderRadius: 999, border: "1.5px solid", fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: selectedChild?.id === c.id ? "var(--color-primary)" : "#fff",
                color: selectedChild?.id === c.id ? "#fff" : "var(--color-text-secondary)",
                borderColor: selectedChild?.id === c.id ? "var(--color-primary)" : "var(--color-border)",
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Child Banner */}
      {selectedChild && (
        <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
            {selectedChild.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{selectedChild.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              {loadingSessions ? "Memuat jadwal..." : `${sessions.length} sesi ditemukan`}
            </div>
          </div>
          {loadingSessions && (
            <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          )}
        </div>
      )}

      {loadingSessions ? (
        <SkeletonTable rows={3} cols={3} />
      ) : sessions.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum Ada Jadwal</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Jadwal kelas akan muncul setelah admin membuat sesi untuk kelas yang diikuti anak.
          </div>
        </div>
      ) : (
        <>
          {/* Today Highlight */}
          {hariIni.length > 0 && (
            <div style={{ background: "linear-gradient(135deg, #059669, #047857)", borderRadius: 16, padding: "20px 24px", color: "#fff", boxShadow: "0 8px 24px rgba(5,150,105,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#bbf7d0", animation: "pulse 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 16, fontWeight: 900 }}>Kelas Hari Ini</span>
                <span style={{ fontSize: 13, opacity: 0.85 }}>
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {hariIni.map(s => (
                  <div key={s.id} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div style={{ minWidth: 72, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{s.startTime}</div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>{s.endTime}</div>
                    </div>
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{s.classroomName}</div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                        {s.programName} · Guru: {s.teacherName}
                      </div>
                    </div>
                    <span style={{ background: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                      Sesi #{s.sessionNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["Semua", "Hari Ini", "Mendatang", "Selesai"] as FilterType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "7px 16px", borderRadius: 999, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: filter === f ? "var(--color-primary)" : "#fff",
                color: filter === f ? "#fff" : "var(--color-text-secondary)",
                borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
              }}>
                {f}
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 999,
                  background: filter === f ? "rgba(255,255,255,0.25)" : "var(--color-bg)",
                  color: filter === f ? "#fff" : "var(--color-text-muted)"
                }}>
                  {countOf(f)}
                </span>
              </button>
            ))}
          </div>

          {/* Session List */}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: "32px 24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
              Tidak ada jadwal untuk filter "{filter}"
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(s => {
                const ss = statusStyle(s.status);
                return (
                  <div key={s.id} className="sesi-card card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, borderLeft: `4px solid ${ss.border}` }}>
                    {/* Time */}
                    <div style={{ minWidth: 76, textAlign: "center", background: `${ss.bg}`, borderRadius: 10, padding: "8px 6px", flexShrink: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 900, color: ss.color, lineHeight: 1.1 }}>{s.startTime}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{s.endTime}</div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{s.classroomName}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: ss.bg, color: ss.color }}>
                          {s.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", fontWeight: 600 }}>
                        {s.programName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span>{s.dayName}, {s.sessionDateDisplay}</span>
                        <span>Guru: {s.teacherName}</span>
                        <span>Sesi #{s.sessionNumber}</span>
                      </div>
                      {s.material && s.status === "Selesai" && (
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4, fontStyle: "italic" }}>
                          Materi: {s.material}
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div style={{ flexShrink: 0 }}>
                      {s.status === "Selesai" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f1f5f9", color: "#64748b", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Selesai
                        </div>
                      ) : s.status === "Hari Ini" ? (
                        <div style={{ background: "#059669", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 800 }}>
                          Hari Ini
                        </div>
                      ) : (
                        <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                          Mendatang
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
