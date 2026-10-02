"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getMyParentProfile } from "@/lib/api/parents";
import { getStudentAttendances } from "@/lib/api/attendances";
import { getLocalUser } from "@/lib/api/auth";
import axiosInstance from "@/lib/api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────

interface ChildOption {
  id: string;
  name: string;
  relation: string;
}

interface EnrollmentRaw {
  id: string;
  status: string;
  enrollment_date?: string;
  classroom?: { id: string; name: string };
  program?: { id: string; name: string };
  program_level?: { id: string; name: string };
}

interface AssessmentRaw {
  id: string;
  assessment_type: string;
  score: number | null;
  max_score: number | null;
  assessment_date: string;
  notes?: string;
  program_level?: { name: string };
  recorded_by?: { name: string };
  enrollment?: { id: string };
}

interface ProgressClass {
  enrollmentId: string;
  classroomName: string;
  programName: string;
  levelName: string;
  status: string;
  enrollmentDate: string;
  // attendance
  totalSessions: number;
  hadirCount: number;
  kehadiranPct: number;
  // assessments
  assessments: AssessmentRaw[];
  latestScore: number | null;
  avgScore: number | null;
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

function scoreColor(score: number | null) {
  if (score === null) return "#64748b";
  if (score >= 80) return "#059669";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 999, transition: "width .6s ease" }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function OrangTuaProgressPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildOption | null>(null);
  const [progressData, setProgressData] = useState<ProgressClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState("");

  // Load parent & children
  useEffect(() => {
    getMyParentProfile()
      .then(parent => {
        const opts: ChildOption[] = parent.students.map(s => ({ id: s.id, name: s.name, relation: s.relation }));
        setChildren(opts);
        if (opts.length > 0) setSelectedChild(opts[0]);
      })
      .catch(e => setError(e?.response?.data?.message || e.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  // Load progress for selected child
  const loadProgress = useCallback(async (child: ChildOption) => {
    setLoadingProgress(true);
    setProgressData([]);
    try {
      // 1. Get enrollments
      const enrollRes = await axiosInstance.get<any>("/enrollments", {
        params: { student_id: child.id, per_page: 100 },
      });
      const enrollments: EnrollmentRaw[] = enrollRes.data.data?.data || enrollRes.data.data || [];

      // 2. Get all assessments for this student
      const assessRes = await axiosInstance.get<any>("/assessments", {
        params: { student_id: child.id, per_page: 200 },
      });
      const allAssessments: AssessmentRaw[] = assessRes.data.data?.data || [];

      // 3. Get attendance summary for this student
      const attendRes = await getStudentAttendances({ student_id: child.id, per_page: 500 });
      const allAttendance = attendRes.data;

      // 4. Build progress per enrollment/class
      const progress: ProgressClass[] = enrollments.map(enroll => {
        // Attendance for this class
        const classAttend = allAttendance.filter(a => a.classroomId === enroll.classroom?.id);
        const hadir = classAttend.filter(a => a.status === "present" || a.status === "late").length;

        // Assessments for this enrollment
        const classAssessments = allAssessments.filter(a => a.enrollment?.id === enroll.id);
        const scores = classAssessments.filter(a => a.score !== null).map(a => a.score as number);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
        const latestScore = classAssessments.length > 0 ? classAssessments[0].score : null;

        return {
          enrollmentId: enroll.id,
          classroomName: enroll.classroom?.name || "-",
          programName: enroll.program?.name || "-",
          levelName: enroll.program_level?.name || "",
          status: enroll.status,
          enrollmentDate: enroll.enrollment_date ? formatDate(enroll.enrollment_date) : "-",
          totalSessions: classAttend.length,
          hadirCount: hadir,
          kehadiranPct: classAttend.length > 0 ? Math.round((hadir / classAttend.length) * 100) : 0,
          assessments: classAssessments,
          latestScore,
          avgScore,
        };
      });

      setProgressData(progress);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Gagal memuat progress.");
    } finally {
      setLoadingProgress(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) loadProgress(selectedChild);
  }, [selectedChild, loadProgress]);

  // ── Render ──────────────────────────────────────────────────

  if (loading) return <SkeletonTable rows={4} cols={3} />;

  if (error && children.length === 0) {
    const user = getLocalUser();
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center", maxWidth: 520, margin: "20px auto" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--color-danger)" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>Gagal Memuat Progress Belajar Anak</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{error}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
          {user && (
            <Link href={user.role === "admin" ? "/admin/dashboard" : user.role === "teacher" ? "/guru/dashboard" : "/owner/dashboard"} className="btn btn-outline" style={{ textDecoration: "none" }}>
              Kembali ke Dashboard
            </Link>
          )}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                window.location.href = "/";
              }
            }}
          >
            Keluar & Ganti Akun
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress Belajar</h1>
          <p className="page-subtitle">Pantau perkembangan akademik, kehadiran, dan hasil penilaian anak Anda.</p>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c)}
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
        <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff" }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
            {selectedChild.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Siswa: {selectedChild.name}</div>
            <div style={{ fontSize: 12.5, opacity: 0.9 }}>
              {progressData.length > 0
                ? `Terdaftar di ${progressData.length} kelas`
                : "Memuat data..."}
            </div>
          </div>
          {loadingProgress && <div style={{ fontSize: 12, opacity: 0.75 }}>Memuat...</div>}
        </div>
      )}

      {loadingProgress ? (
        <SkeletonTable rows={3} cols={3} />
      ) : progressData.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum Ada Data Progress</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {selectedChild?.name} belum memiliki pendaftaran kelas. Hubungi Admin untuk mendaftarkan anak.
          </div>
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Kelas Aktif", value: progressData.filter(p => p.status === "active").length, color: "#059669" },
              { label: "Total Sesi", value: progressData.reduce((s, p) => s + p.totalSessions, 0), color: "#1d4ed8" },
              { label: "Total Hadir", value: progressData.reduce((s, p) => s + p.hadirCount, 0), color: "#7c3aed" },
              {
                label: "Rata-rata Nilai",
                value: (() => {
                  const scores = progressData.filter(p => p.avgScore !== null).map(p => p.avgScore as number);
                  return scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) + "/100" : "–";
                })(),
                color: "#d97706",
              },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Per-Class Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {progressData.map(prog => (
              <div key={prog.enrollmentId} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Class Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>
                      {prog.programName}{prog.levelName ? ` — ${prog.levelName}` : ""}
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>
                      {prog.classroomName}
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                      Daftar: {prog.enrollmentDate}
                    </div>
                  </div>
                  <span style={{
                    background: prog.status === "active" ? "#d1fae5" : "#fef3c7",
                    color: prog.status === "active" ? "#059669" : "#b45309",
                    fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
                  }}>
                    {prog.status === "active" ? "Aktif" : prog.status === "completed" ? "Selesai" : prog.status}
                  </span>
                </div>

                {/* Attendance */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kehadiran</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(prog.kehadiranPct) }}>
                      {prog.hadirCount}/{prog.totalSessions} sesi ({prog.kehadiranPct}%)
                    </span>
                  </div>
                  <ProgressBar value={prog.kehadiranPct} color={scoreColor(prog.kehadiranPct)} />
                </div>

                {/* Assessment Scores */}
                {prog.assessments.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                      Penilaian ({prog.assessments.length} rekam)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {prog.assessments.slice(0, 3).map(a => (
                        <div key={a.id} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                              {a.assessment_type}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                              {formatDate(a.assessment_date)}
                              {a.recorded_by?.name && ` · oleh ${a.recorded_by.name}`}
                            </div>
                            {a.notes && (
                              <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 4, fontStyle: "italic" }}>
                                "{a.notes}"
                              </div>
                            )}
                          </div>
                          {a.score !== null && (
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(a.score) }}>
                                {a.score}
                              </div>
                              <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                                /{a.max_score ?? 100}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {prog.assessments.length > 3 && (
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", padding: "6px 0" }}>
                          +{prog.assessments.length - 3} penilaian lainnya
                        </div>
                      )}
                    </div>

                    {/* Avg Score Bar */}
                    {prog.avgScore !== null && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Rata-rata Nilai</span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: scoreColor(prog.avgScore) }}>{prog.avgScore}/100</span>
                        </div>
                        <ProgressBar value={prog.avgScore} color={scoreColor(prog.avgScore)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                      Belum ada penilaian
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                      Nilai akan muncul setelah guru menginput hasil penilaian.
                    </div>
                  </div>
                )}

                {/* No sessions info */}
                {prog.totalSessions === 0 && (
                  <div style={{ background: "#fef9c3", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#854d0e" }}>
                    Sesi kelas belum dimulai atau guru belum menyimpan absensi.
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
