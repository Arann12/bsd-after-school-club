"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getMyParentProfile } from "@/lib/api/parents";
import { getStudentAttendances, type AttendanceRecord } from "@/lib/api/attendances";

// ── Types ─────────────────────────────────────────────────────

interface ChildOption {
  id: string;
  name: string;
  relation: string;
}

interface ClassGroup {
  classroomId: string;
  classroomName: string;
  teacherName: string;
  records: AttendanceRecord[];
  totalSessions: number;
  hadirCount: number;
  kehadiranPercent: number;
}

// ── Helpers ───────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case "present": return { bg: "#d1fae5", color: "#059669" };
    case "late":    return { bg: "#e0f2fe", color: "#0369a1" };
    case "excused": return { bg: "#fef3c7", color: "#b45309" };
    default:        return { bg: "#fce7f3", color: "#be185d" }; // absent
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

// ── Page Component ────────────────────────────────────────────

export default function OrangTuaAbsensiPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildOption | null>(null);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");

  // Load parent + children
  useEffect(() => {
    getMyParentProfile()
      .then(parent => {
        const opts: ChildOption[] = parent.students.map(s => ({
          id: s.id, name: s.name, relation: s.relation
        }));
        setChildren(opts);
        if (opts.length > 0) setSelectedChild(opts[0]);
      })
      .catch(e => setError(e?.response?.data?.message || e.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  // Load attendance when child changes
  const loadAttendance = useCallback(async (child: ChildOption) => {
    setLoadingAttendance(true);
    setSelectedClass(null);
    try {
      const res = await getStudentAttendances({ student_id: child.id, per_page: 500 });
      
      // Group by classroom
      const map = new Map<string, AttendanceRecord[]>();
      for (const r of res.data) {
        const key = r.classroomId || "unknown";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
      }

      const groups: ClassGroup[] = [];
      map.forEach((records, cid) => {
        const hadir = records.filter(r => r.status === "present" || r.status === "late").length;
        groups.push({
          classroomId: cid,
          classroomName: records[0]?.classroomName || "Kelas",
          teacherName: records[0]?.teacherName || "-",
          records: records.sort((a, b) => a.sessionDate.localeCompare(b.sessionDate)),
          totalSessions: records.length,
          hadirCount: hadir,
          kehadiranPercent: records.length > 0 ? Math.round((hadir / records.length) * 100) : 0,
        });
      });
      setClassGroups(groups);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Gagal memuat absensi.");
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) loadAttendance(selectedChild);
  }, [selectedChild, loadAttendance]);

  // Calendar helpers
  const calYear = calMonth.year;
  const calMonthIdx = calMonth.month;
  const daysInMonth = getDaysInMonth(calYear, calMonthIdx);
  const firstDay = getFirstDayOfMonth(calYear, calMonthIdx);
  const monthName = new Date(calYear, calMonthIdx, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const recordsByDate = selectedClass
    ? Object.fromEntries(selectedClass.records.map(r => [r.sessionDate, r]))
    : {};

  // ── Render ──────────────────────────────────────────────────

  if (loading) return <SkeletonTable rows={4} cols={4} />;

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
        .cls-card { transition: all .2s ease; cursor: pointer; }
        .cls-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08)!important; }
        .cal-day { min-height: 80px; padding: 6px; border-radius: 8px; border: 1px solid var(--color-border-light); background: #fff; transition: all .15s; }
        .cal-day:hover { border-color: var(--color-primary); background: #f0f9ff; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Absensi Anak</h1>
          <p className="page-subtitle">Pantau kehadiran dan catatan pembelajaran dari guru.</p>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {children.map(c => (
            <button key={c.id} onClick={() => { setSelectedChild(c); setSelectedClass(null); }}
              style={{
                padding: "8px 18px", borderRadius: 999, border: "1.5px solid",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: selectedChild?.id === c.id ? "var(--color-primary)" : "#fff",
                color: selectedChild?.id === c.id ? "#fff" : "var(--color-text-secondary)",
                borderColor: selectedChild?.id === c.id ? "var(--color-primary)" : "var(--color-border)",
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Child Info Banner */}
      {selectedChild && (
        <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff" }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
            {selectedChild.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Siswa: {selectedChild.name}</div>
            <div style={{ fontSize: 12.5, opacity: 0.9 }}>Hubungan: {selectedChild.relation}</div>
          </div>
          {loadingAttendance && (
            <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>Memuat data...</div>
          )}
        </div>
      )}

      {loadingAttendance ? (
        <SkeletonTable rows={3} cols={3} />
      ) : !selectedClass ? (
        /* Daftar Kelas */
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 14 }}>
            Kelas yang Diikuti {selectedChild?.name}
          </h2>

          {classGroups.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Belum Ada Data Absensi
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Data absensi akan muncul setelah guru menyimpan kehadiran sesi kelas.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {classGroups.map(g => (
                <div key={g.classroomId} className="card cls-card" onClick={() => setSelectedClass(g)}
                  style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#ede9fe", color: "#6d28d9", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {g.classroomName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>{g.classroomName}</h3>
                      <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>Guru: {g.teacherName}</div>
                    </div>
                  </div>

                  <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Sesi</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.totalSessions} Pertemuan</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Kehadiran</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: g.kehadiranPercent >= 75 ? "#059669" : "#dc2626" }}>
                        {g.kehadiranPercent}% ({g.hadirCount}/{g.totalSessions})
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
                    Buka Kalender Absensi →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tampilan Kalender & Tabel */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedClass(null)}>← Kembali</button>
                <div style={{ height: 24, width: 1, background: "var(--color-border)" }} />
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    {selectedClass.classroomName}
                  </h2>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Guru: {selectedClass.teacherName}</span>
                </div>
              </div>

              {/* Month Navigator */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setCalMonth(p => {
                  const d = new Date(p.year, p.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}>‹</button>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-primary)", minWidth: 130, textAlign: "center" }}>{monthName}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setCalMonth(p => {
                  const d = new Date(p.year, p.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}>›</button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="card" style={{ padding: 20, overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center", marginBottom: 10 }}>
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", padding: 4 }}>{h}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {/* Empty offset cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-day" style={{ opacity: 0, pointerEvents: "none" }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const rec = recordsByDate[dateStr];
                const sc = rec ? statusColor(rec.status) : null;
                return (
                  <div key={dateStr} className="cal-day"
                    onClick={() => rec && setSelectedRecord(rec)}
                    style={{
                      cursor: rec ? "pointer" : "default",
                      borderColor: rec ? sc!.color : "var(--color-border-light)",
                      background: rec ? `${sc!.bg}` : "#fff",
                    }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-primary)", display: "flex", justifyContent: "space-between" }}>
                      <span>{dayNum}</span>
                      {rec && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 999, background: sc!.color, color: "#fff" }}>
                          {rec.statusLabel}
                        </span>
                      )}
                    </div>
                    {rec && (
                      <div style={{ marginTop: 5 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#1e293b", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {rec.material !== "-" ? rec.material : rec.classroomName}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-primary)", fontWeight: 700, marginTop: 3 }}>Buka →</div>
                      </div>
                    )}
                    {!rec && <div style={{ fontSize: 10, color: "#e2e8f0", marginTop: 10, fontStyle: "italic" }}>–</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rekap Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[
              { label: "Total Sesi", value: selectedClass.totalSessions, color: "#1d4ed8" },
              { label: "Hadir", value: selectedClass.records.filter(r => r.status === "present").length, color: "#059669" },
              { label: "Terlambat", value: selectedClass.records.filter(r => r.status === "late").length, color: "#0369a1" },
              { label: "Izin", value: selectedClass.records.filter(r => r.status === "excused").length, color: "#b45309" },
              { label: "Alpha", value: selectedClass.records.filter(r => r.status === "absent").length, color: "#dc2626" },
              { label: "% Kehadiran", value: `${selectedClass.kehadiranPercent}%`, color: selectedClass.kehadiranPercent >= 75 ? "#059669" : "#dc2626" },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: "14px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-header">
              <h2 className="card-title">Riwayat Absensi — {selectedClass.classroomName}</h2>
            </div>
            {selectedClass.records.length === 0 ? (
              <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>Belum ada data absensi</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                    {["Sesi", "Tanggal", "Jam", "Status", "Materi", "Catatan Guru", ""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedClass.records.map((r, idx) => {
                    const sc = statusColor(r.status);
                    return (
                      <tr key={r.id} style={{ borderBottom: idx < selectedClass.records.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--color-text-muted)" }}>#{r.sessionNumber}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.sessionDateDisplay}</td>
                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{r.startTime}–{r.endTime}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                            {r.statusLabel}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--color-text-primary)", maxWidth: 200 }}>
                          {r.material !== "-" ? r.material : <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Tidak ada materi</span>}
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)", lineHeight: 1.5, maxWidth: 220 }}>
                          {r.teacherNotes || <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>–</span>}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button onClick={() => setSelectedRecord(r)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0284c7", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail */}
      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Detail Absensi & Logbook" maxWidth={500}>
        {selectedRecord && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0369a1" }}>
                {selectedRecord.sessionDateDisplay} · {selectedRecord.startTime}–{selectedRecord.endTime}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", marginTop: 4 }}>
                {selectedRecord.classroomName} — Pertemuan #{selectedRecord.sessionNumber}
              </div>
              <div style={{ fontSize: 12.5, color: "#0369a1", marginTop: 2 }}>Guru: {selectedRecord.teacherName}</div>
              {(() => {
                const sc = statusColor(selectedRecord.status);
                return (
                  <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 999, marginTop: 8, display: "inline-block" }}>
                    Status: {selectedRecord.statusLabel}
                  </span>
                );
              })()}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Materi Pembelajaran</div>
              <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 16px", fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
                {selectedRecord.material !== "-" ? selectedRecord.material : <em style={{ color: "var(--color-text-muted)" }}>Tidak ada informasi materi</em>}
              </div>
            </div>

            {selectedRecord.teacherNotes && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Catatan Guru</div>
                <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
                  "{selectedRecord.teacherNotes}"
                </div>
              </div>
            )}

            {selectedRecord.notes && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Keterangan</div>
                <div style={{ background: "#fef3c7", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
                  {selectedRecord.notes}
                </div>
              </div>
            )}

            <button className="btn btn-ghost" onClick={() => setSelectedRecord(null)} style={{ marginTop: 4 }}>Tutup</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
