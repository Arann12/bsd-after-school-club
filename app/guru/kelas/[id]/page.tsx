"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  getClassroomById,
  getClassSessions,
  createClassSession,
  submitAttendanceAndLogbook,
  type Classroom,
  type ClassSession,
  type SubmitAttendancePayload,
} from "@/lib/api/academic";
import {
  getAssessments,
  createAssessment,
  deleteAssessment,
  type AssessmentItem,
} from "@/lib/api/assessments";
import { SkeletonTable } from "@/components/ui/Skeleton";

type StatusKehadiran = "present" | "absent" | "late" | "excused";

export default function GuruKelasPage() {
  const routeParams = useParams();
  const classId = (routeParams?.id as string) || "";
  const { toast, showToast } = useToast();

  const [activeMainTab, setActiveMainTab] = useState<"presensi" | "penilaian">("presensi");

  const classroomRef = useRef<Classroom | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [availableSessions, setAvailableSessions] = useState<ClassSession[]>([]);
  const [session, setSession] = useState<ClassSession | null>(null);

  // States: Presensi
  const [kehadiran, setKehadiran] = useState<Record<string, StatusKehadiran>>({});
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [sudahSimpan, setSudahSimpan] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [sedangMembuatSesi, setSedangMembuatSesi] = useState(false);

  // States: Penilaian
  const todayDateStr = new Date().toISOString().split("T")[0];
  const [assessmentForm, setAssessmentForm] = useState({
    name: "Tugas Harian",
    date: todayDateStr,
    weight: 1.0,
  });
  const [scores, setScores] = useState<Record<string, { score: number | ""; notes: string }>>({});
  const [savingScores, setSavingScores] = useState(false);
  const [pastAssessments, setPastAssessments] = useState<AssessmentItem[]>([]);
  const [loadingPastAssessments, setLoadingPastAssessments] = useState(false);

  const selectSession = useCallback((selected: ClassSession, currentClassroom?: Classroom | null) => {
    setSession(selected);
    const isCompleted = selected.status === "completed";
    setSudahSimpan(isCompleted);

    if (selected.teacherLogbook) {
      setMateri(selected.teacherLogbook.material || "");
      setCatatan(selected.teacherLogbook.notes || "");
    } else {
      setMateri("");
      setCatatan("");
    }

    const attMap: Record<string, StatusKehadiran> = {};
    if (selected.studentAttendances && selected.studentAttendances.length > 0) {
      selected.studentAttendances.forEach((a: any) => {
        attMap[a.student_id] = a.attendance_status;
      });
    } else {
      const cls = currentClassroom || classroomRef.current;
      if (cls?.students) {
        cls.students.forEach((st) => {
          attMap[st.id] = "present";
        });
      }
    }
    setKehadiran(attMap);
  }, []);

  // Fetch Assessment History for this class
  const fetchClassAssessments = useCallback(async () => {
    setLoadingPastAssessments(true);
    try {
      const res = await getAssessments({ per_page: 250 });
      const rawList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      // Filter assessments belonging to this class
      const filtered = rawList.filter(
        (a: any) => a.enrollment?.classroom?.id === classId || a.classroom_id === classId
      );
      setPastAssessments(filtered);
    } catch (err) {
      console.warn("Gagal mengambil riwayat penilaian:", err);
    } finally {
      setLoadingPastAssessments(false);
    }
  }, [classId]);

  const fetchData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const [clsRes, sessionsRes] = await Promise.allSettled([
        getClassroomById(classId),
        getClassSessions({ classroom_id: classId }),
      ]);

      let loadedClassroom: Classroom | null = null;
      if (clsRes.status === "fulfilled") {
        loadedClassroom = clsRes.value;
        classroomRef.current = loadedClassroom;
        setClassroom(loadedClassroom);

        // Inisialisasi form score
        const initScores: Record<string, { score: number | ""; notes: string }> = {};
        loadedClassroom.students.forEach((st) => {
          initScores[st.id] = { score: "", notes: "" };
        });
        setScores(initScores);
      } else {
        throw new Error("Gagal mengambil data kelas.");
      }

      if (sessionsRes.status === "fulfilled") {
        const allSessions = Array.isArray(sessionsRes.value) ? sessionsRes.value : [];

        // Filter sesi milik kelas ini
        const classSessions = allSessions
          .filter((s: ClassSession) => s.classroomId === classId || !s.classroomId)
          .sort((a: ClassSession, b: ClassSession) => (a.sessionNumber || 0) - (b.sessionNumber || 0));
        setAvailableSessions(classSessions);

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        // Cari sesi untuk kelas ini pada hari ini
        let targetSession = classSessions.find(
          (s: ClassSession) => s.sessionDate?.substring(0, 10) === today
        );

        // Jika tidak ada sesi hari ini, ambil sesi terdekat yang belum selesai
        if (!targetSession) {
          const upcoming = classSessions
            .filter((s: ClassSession) => s.status !== "completed")
            .sort((a: any, b: any) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
          if (upcoming.length > 0) {
            targetSession = upcoming[0];
          }
          if (!targetSession && classSessions.length > 0) {
            targetSession = classSessions[classSessions.length - 1];
          }
        }

        if (targetSession) {
          selectSession(targetSession, loadedClassroom);
        } else {
          setSession(null);
        }
      }
    } catch (e: any) {
      console.error("fetchData error:", e);
      setErrorMsg(e.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, [classId, selectSession]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "penilaian") {
        setActiveMainTab("penilaian");
      }
    }
  }, []);

  useEffect(() => {
    if (classId) {
      fetchData();
      fetchClassAssessments();
    }
  }, [classId, fetchData, fetchClassAssessments]);

  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getTodayDateStr();
  const adaSesiHariIni = availableSessions.some(
    (s) => s.sessionDate?.substring(0, 10) === todayStr
  );

  const now = new Date();
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNamesId = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const todayDayEn = dayNamesEn[now.getDay()];
  const todayDayId = dayNamesId[now.getDay()];

  const activeSchedules = classroom?.schedules || [];
  const scheduledDaysEn = activeSchedules.map((s) => s.dayOfWeek);
  const hariSesuaiJadwal =
    activeSchedules.length === 0 ||
    scheduledDaysEn.some((day) => day.toLowerCase() === todayDayEn.toLowerCase());

  const handleStartTodaySession = async () => {
    if (adaSesiHariIni) {
      showToast("Sesi untuk hari ini sudah dibuka.", "warning");
      return;
    }

    if (!hariSesuaiJadwal) {
      showToast(
        `Hari ini (${todayDayId}) bukan hari jadwal kelas ini. Jadwal reguler: ${scheduledDaysEn.join(", ")}.`,
        "danger"
      );
      return;
    }

    setSedangMembuatSesi(true);
    try {
      const nextSessionNum =
        availableSessions.length > 0
          ? Math.max(...availableSessions.map((s) => s.sessionNumber || 0)) + 1
          : 1;

      const scheduleForToday = activeSchedules.find(
        (s) => s.dayOfWeek.toLowerCase() === todayDayEn.toLowerCase()
      );

      const newSession = await createClassSession({
        classroom_id: classId,
        session_number: nextSessionNum,
        session_date: todayStr,
        start_time: scheduleForToday?.startTime?.substring(0, 5) || "14:00",
        end_time: scheduleForToday?.endTime?.substring(0, 5) || "15:30",
        status: "scheduled",
      });

      setAvailableSessions((prev) => [...prev, newSession]);
      selectSession(newSession, classroomRef.current || classroom);
      showToast("Sesi hari ini berhasil dibuka.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal membuka sesi: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setSedangMembuatSesi(false);
    }
  };

  const dataSiswa = classroom?.students || [];
  const sudahDiabsen = Object.keys(kehadiran).length;
  const totalSiswa = dataSiswa.length;
  const persenAbsen = totalSiswa > 0 ? Math.round((sudahDiabsen / totalSiswa) * 100) : 0;

  const setStatusKehadiran = (idSiswa: string, status: StatusKehadiran) => {
    if (sudahSimpan) return;
    setKehadiran((prev) => ({ ...prev, [idSiswa]: status }));
  };

  const simpanLogbook = async () => {
    if (!session) {
      showToast("Pilih sesi terlebih dahulu sebelum menyimpan absensi.", "warning");
      return;
    }
    if (sudahDiabsen < totalSiswa || !materi.trim()) return;

    setSedangSimpan(true);
    try {
      const sessionDate = session.sessionDate
        ? session.sessionDate.substring(0, 10)
        : new Date().toISOString().split("T")[0];
      const startTimeStr = session.startTime ? session.startTime.substring(0, 5) : "14:00";
      const endTimeStr = session.endTime ? session.endTime.substring(0, 5) : "15:00";
      const checkIn = `${sessionDate} ${startTimeStr}:00`;
      const checkOut = `${sessionDate} ${endTimeStr}:00`;

      const [sh, sm] = startTimeStr.split(":").map(Number);
      const [eh, em] = endTimeStr.split(":").map(Number);
      const teachingMins = Math.max(1, eh * 60 + em - (sh * 60 + sm));

      const payload: SubmitAttendancePayload = {
        students: dataSiswa.map((s) => ({
          student_id: s.id,
          attendance_status: kehadiran[s.id] || "absent",
          notes: catatan || undefined,
        })),
        logbook: {
          check_in: checkIn,
          check_out: checkOut,
          teaching_minutes: teachingMins,
          material: materi,
          notes: catatan || undefined,
        },
      };

      await submitAttendanceAndLogbook(session.id, payload);
      setSudahSimpan(true);
      setSession((prev) => (prev ? { ...prev, status: "completed" } : null));
      setAvailableSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: "completed" } : s))
      );
      showToast("Absensi dan logbook berhasil disimpan.", "success");
    } catch (e: any) {
      const backendMsg =
        e?.response?.data?.message || e?.response?.data?.errors || e?.message || "Gagal menyimpan absensi dan logbook.";
      const detail = typeof backendMsg === "object" ? JSON.stringify(backendMsg) : backendMsg;
      showToast("Gagal menyimpan: " + detail, "danger");
      console.error("Submit attendance error:", e?.response?.data || e);
    } finally {
      setSedangSimpan(false);
    }
  };

  // Simpan Batch Nilai Siswa
  const handleSaveAssessments = async () => {
    if (!assessmentForm.name.trim()) {
      showToast("Tentukan nama penilaian / materi tugas.", "warning");
      return;
    }

    const filledList = dataSiswa.filter(
      (s) => scores[s.id]?.score !== "" && scores[s.id]?.score !== undefined
    );

    if (filledList.length === 0) {
      showToast("Isi nilai setidaknya untuk satu siswa.", "warning");
      return;
    }

    setSavingScores(true);
    let successCount = 0;
    try {
      for (const st of filledList) {
        const item = scores[st.id];
        await createAssessment({
          student_id: st.id,
          enrollment_id: st.enrollmentId || st.id,
          program_level_id: classroom?.programLevelId || "",
          assessment_name: assessmentForm.name.trim(),
          score: Number(item.score),
          weight: Number(assessmentForm.weight) || 1.0,
          assessment_date: assessmentForm.date,
          status: "final",
        });
        successCount++;
      }

      showToast(`Berhasil menyimpan ${successCount} data nilai siswa.`, "success");
      // Reset input nilai
      const resetScores: Record<string, { score: number | ""; notes: string }> = {};
      dataSiswa.forEach((st) => {
        resetScores[st.id] = { score: "", notes: "" };
      });
      setScores(resetScores);
      await fetchClassAssessments();
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || "Gagal menyimpan data nilai.", "danger");
    } finally {
      setSavingScores(false);
    }
  };

  // Autofill nilai cepat untuk seluruh kelas (misal: 85)
  const handleAutofillScores = (defaultVal: number) => {
    const updated: Record<string, { score: number | ""; notes: string }> = {};
    dataSiswa.forEach((st) => {
      updated[st.id] = {
        score: defaultVal,
        notes: scores[st.id]?.notes || "",
      };
    });
    setScores(updated);
  };

  const handleDeleteAssessment = async (id: string, name: string) => {
    if (!confirm(`Hapus nilai "${name}" ini?`)) return;
    try {
      await deleteAssessment(id);
      showToast("Data nilai berhasil dihapus.", "success");
      await fetchClassAssessments();
    } catch (err) {
      showToast("Gagal menghapus nilai.", "danger");
    }
  };

  const warnaStatus: Record<StatusKehadiran, { bg: string; color: string; label: string }> = {
    present: { bg: "#d1fae5", color: "#059669", label: "Hadir" },
    absent: { bg: "#fce7f3", color: "#be185d", label: "Alpha/Sakit" },
    excused: { bg: "#fef3c7", color: "#b45309", label: "Izin" },
    late: { bg: "#e0f2fe", color: "#0369a1", label: "Terlambat" },
  };

  if (loading) return <SkeletonTable rows={3} cols={2} />;

  if (errorMsg) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>
          Gagal Memuat Data Kelas
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{errorMsg}</div>
        <button className="btn btn-primary" onClick={fetchData}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <Toast toast={toast} />

      <style>{`
        @keyframes munculMasuk { from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .tombol-absen { transition: all .15s ease; border: 2px solid transparent; }
        .tombol-absen:hover { transform: translateY(-1px); }
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            {classroom?.name} — {classroom?.programLevel?.name || "Program"}
          </h1>
          <p className="page-subtitle">
            {activeMainTab === "presensi"
              ? session
                ? `Pertemuan ke-${session.sessionNumber} · ${new Date(session.sessionDate || "").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${session.startTime?.substring(0, 5)}–${session.endTime?.substring(0, 5)}`
                : "Pencatatan kehadiran siswa dan logbook mengajar harian"
              : "Form input penilaian berkala dan riwayat rapor siswa kelas ini"}
          </p>
        </div>
        <div className="page-header-actions">
          {activeMainTab === "presensi" && (
            <>
              <span
                style={{
                  background: session?.status === "completed" ? "#d1fae5" : "#e0f2fe",
                  color: session?.status === "completed" ? "#059669" : "#0369a1",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 999,
                }}
              >
                {session?.status === "completed" ? "Selesai" : session ? "Berlangsung" : "Belum Ada Sesi"}
              </span>
              {!adaSesiHariIni &&
                (hariSesuaiJadwal ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleStartTodaySession}
                    disabled={sedangMembuatSesi}
                    style={{ fontWeight: 700 }}
                  >
                    {sedangMembuatSesi ? "Memproses..." : "+ Buka Sesi Hari Ini"}
                  </button>
                ) : (
                  <span
                    style={{
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px dashed #cbd5e1",
                    }}
                    title={`Hari ini (${todayDayId}) bukan hari jadwal kelas. Jadwal reguler: ${scheduledDaysEn.join(", ")}`}
                  >
                    Bukan hari jadwal ({todayDayId})
                  </span>
                ))}
            </>
          )}
        </div>
      </div>

      {/* DUA TAB UTAMA: PRESENSI & LOGBOOK vs PENILAIAN SISWA */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setActiveMainTab("presensi")}
          className={`btn ${activeMainTab === "presensi" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Presensi &amp; Logbook Sesi
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab("penilaian")}
          className={`btn ${activeMainTab === "penilaian" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Penilaian Siswa ({pastAssessments.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PRESENSI & LOGBOOK                               */}
      {/* ======================================================== */}
      {activeMainTab === "presensi" && (
        <>
          {/* Selector Sesi Kelas */}
          {availableSessions.length > 0 && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--color-border-light)",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflowX: "auto",
              }}
            >
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Daftar Sesi:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
                {availableSessions.map((s) => {
                  const isSelected = session?.id === s.id;
                  const isCompleted = s.status === "completed";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectSession(s)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: isSelected ? "2px solid #0284c7" : "1px solid var(--color-border)",
                        background: isSelected ? "#0284c7" : isCompleted ? "#dcfce7" : "#ffffff",
                        color: isSelected ? "#ffffff" : isCompleted ? "#166534" : "var(--color-text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>Sesi {s.sessionNumber}</span>
                      <span style={{ fontSize: 11, opacity: isSelected ? 0.9 : 0.7 }}>
                        ({s.sessionDate?.substring(5, 10)})
                      </span>
                      {isCompleted && (
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jika Belum Ada Sesi yang Dipilih / Dibuat */}
          {!session && (
            <div
              className="card"
              style={{
                padding: "32px 24px",
                textAlign: "center",
                border: "1.5px dashed var(--color-border)",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto",
                }}
              >
                <svg
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                {adaSesiHariIni ? "Pilih Sesi Kelas" : "Belum Ada Sesi Hari Ini"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  maxWidth: 440,
                  margin: "0 auto 16px auto",
                }}
              >
                {adaSesiHariIni
                  ? "Sesi untuk hari ini sudah dibuka. Silakan pilih nomor sesi pada daftar di atas untuk mengisi absensi dan logbook."
                  : availableSessions.length > 0
                  ? "Pilih nomor sesi di atas atau buka sesi baru untuk hari ini."
                  : "Belum ada sesi terjadwal di kelas ini. Buka sesi baru untuk mulai absensi siswa."}
              </div>
              {!adaSesiHariIni && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartTodaySession}
                  disabled={sedangMembuatSesi}
                  style={{ padding: "10px 22px", fontWeight: 700 }}
                >
                  {sedangMembuatSesi ? "Memproses..." : "+ Buka Sesi Hari Ini"}
                </button>
              )}
            </div>
          )}

          {/* Status Kehadiran Bar */}
          <div className="card" style={{ padding: "18px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>
                Status Kehadiran
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>
                {sudahDiabsen}/{totalSiswa} siswa
              </span>
            </div>
            <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: "var(--color-primary)",
                  width: `${persenAbsen}%`,
                  transition: "width .3s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
              {totalSiswa > 0
                ? `${sudahDiabsen} dari ${totalSiswa} siswa tercatat (${persenAbsen}%)`
                : "Belum ada siswa terdaftar"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {/* Panel Absensi */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Daftar Kehadiran</h2>
              </div>
              <div className="card-body" style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
                {dataSiswa.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
                    Belum ada siswa di kelas ini.
                  </div>
                ) : (
                  dataSiswa.map((siswa, i) => {
                    const st = kehadiran[siswa.id];
                    return (
                      <div
                        key={siswa.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom: i < dataSiswa.length - 1 ? "1px solid var(--color-border-light)" : "none",
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: st ? warnaStatus[st].bg : "var(--color-bg)",
                            color: st ? warnaStatus[st].color : "var(--color-text-muted)",
                            fontWeight: 800,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: `2px solid ${st ? warnaStatus[st].color : "var(--color-border)"}`,
                            transition: "all .2s ease",
                          }}
                        >
                          {siswa.name[0]?.toUpperCase()}
                        </div>

                        {/* Nama */}
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {siswa.name}
                        </span>

                        {/* Tombol Status Absensi */}
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {(["present", "excused", "late", "absent"] as StatusKehadiran[]).map((s) => (
                            <button
                              key={s}
                              className="tombol-absen"
                              onClick={() => setStatusKehadiran(siswa.id, s)}
                              style={{
                                padding: "5px 12px",
                                borderRadius: 999,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: sudahSimpan ? "not-allowed" : "pointer",
                                background: st === s ? warnaStatus[s].bg : "transparent",
                                color: st === s ? warnaStatus[s].color : "var(--color-text-muted)",
                                borderColor: st === s ? warnaStatus[s].color : "var(--color-border)",
                                animation: st === s ? "bounce .2s ease" : "none",
                                opacity: sudahSimpan && st !== s ? 0.5 : 1,
                              }}
                            >
                              {warnaStatus[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* Ringkasan */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                {(["present", "excused", "late", "absent"] as StatusKehadiran[]).map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: warnaStatus[s].color }} />
                    <span style={{ color: "var(--color-text-secondary)" }}>{warnaStatus[s].label}:</span>
                    <span style={{ fontWeight: 700, color: warnaStatus[s].color }}>
                      {Object.values(kehadiran).filter((v) => v === s).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel Logbook */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Materi Pembelajaran</h2>
                </div>
                <div className="card-body">
                  <textarea
                    value={materi}
                    onChange={(e) => setMateri(e.target.value)}
                    placeholder="Topik atau materi yang diajarkan hari ini..."
                    readOnly={sudahSimpan}
                    style={{
                      width: "100%",
                      minHeight: 120,
                      padding: "12px 14px",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 13.5,
                      color: "var(--color-text-primary)",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      transition: "border-color .2s ease, box-shadow .2s ease",
                      backgroundColor: sudahSimpan ? "var(--color-bg)" : "white",
                    }}
                    onFocus={(e) => {
                      if (!sudahSimpan) {
                        e.target.style.borderColor = "var(--color-primary)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Catatan Guru</h2>
                </div>
                <div className="card-body">
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Catatan perkembangan atau kendala belajar siswa (opsional)..."
                    readOnly={sudahSimpan}
                    style={{
                      width: "100%",
                      minHeight: 90,
                      padding: "12px 14px",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 13.5,
                      color: "var(--color-text-primary)",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      transition: "border-color .2s ease, box-shadow .2s ease",
                      backgroundColor: sudahSimpan ? "var(--color-bg)" : "white",
                    }}
                    onFocus={(e) => {
                      if (!sudahSimpan) {
                        e.target.style.borderColor = "var(--color-primary)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Validasi & Tombol Simpan */}
              {!session && (
                <div
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    fontSize: 12.5,
                    color: "#0369a1",
                  }}
                >
                  Pilih sesi di atas atau buka sesi baru untuk mengisi absensi.
                </div>
              )}
              {session && (sudahDiabsen < totalSiswa || !materi.trim()) && !sudahSimpan && (
                <div
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    fontSize: 12.5,
                    color: "#92400e",
                  }}
                >
                  Lengkapi kehadiran siswa dan materi kelas sebelum menyimpan.
                </div>
              )}

              <button
                onClick={simpanLogbook}
                disabled={
                  !session ||
                  sudahDiabsen < totalSiswa ||
                  !materi.trim() ||
                  sudahSimpan ||
                  sedangSimpan ||
                  totalSiswa === 0
                }
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor:
                    sudahSimpan || sedangSimpan || !session || totalSiswa === 0
                      ? "not-allowed"
                      : "pointer",
                  transition: "all .2s ease",
                  background: sudahSimpan
                    ? "#d1fae5"
                    : sudahDiabsen < totalSiswa || !materi.trim() || !session || totalSiswa === 0
                    ? "var(--color-border)"
                    : "var(--color-primary)",
                  color: sudahSimpan
                    ? "#059669"
                    : sudahDiabsen < totalSiswa || !materi.trim() || !session || totalSiswa === 0
                    ? "var(--color-text-muted)"
                    : "white",
                }}
              >
                {sedangSimpan
                  ? "Menyimpan..."
                  : sudahSimpan
                  ? "Data Tersimpan"
                  : "Simpan Absensi & Logbook"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PENILAIAN SISWA KELAS (INPUT & REKAP)             */}
      {/* ======================================================== */}
      {activeMainTab === "penilaian" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ketentuan Penilaian Sesuai Dokumen Kurikulum Bimbel */}
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 10,
              padding: "12px 16px",
              fontSize: 12.5,
              color: "#0369a1",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2, color: "#0284c7" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <div style={{ lineHeight: 1.5 }}>
              <div style={{ fontWeight: 800, color: "#0369a1", marginBottom: 3 }}>
                Standar Penilaian BSD After School Club:
              </div>
              <div style={{ color: "#334155" }}>
                1. <strong>Bahasa Inggris</strong> memiliki 4 komponen nilai: <strong>Vocabulary</strong>, <strong>Test 1</strong>, <strong>Test 2</strong>, dan <strong>Test Grammar</strong> (Rata-rata otomatis menjadi <strong>Penilaian Akhir</strong>).
              </div>
              <div style={{ color: "#334155", marginTop: 2 }}>
                2. <strong>AHE, ASE, &amp; Phonics</strong> tidak menggunakan penilaian angka, melainkan diberikan <strong>Piagam Kelulusan</strong>.
              </div>
              <div style={{ color: "#334155", marginTop: 2 }}>
                3. <strong>Matematika</strong> tidak menerbitkan sertifikat kelulusan.
              </div>
            </div>
          </div>

          {/* Form Setup Penilaian */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--color-text-primary)", marginBottom: 12 }}>
              Input Penilaian Siswa Kelas
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 11.5 }}>
                  Komponen / Nama Penilaian *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: 13 }}
                  placeholder="Misal: Vocabulary, Test 1, Test 2, Test Grammar"
                  value={assessmentForm.name}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 11.5 }}>
                  Tanggal Penilaian *
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ fontSize: 13 }}
                  value={assessmentForm.date}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, date: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 11.5 }}>
                  Bobot Nilai (Weight)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  style={{ fontSize: 13 }}
                  value={assessmentForm.weight}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, weight: Number(e.target.value) || 1.0 })}
                />
              </div>
            </div>

            {/* Quick Preset Buttons Sesuai Format Bimbel */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", fontWeight: 700 }}>
                Format English:
              </span>
              {["Vocabulary", "Test 1", "Test 2", "Test Grammar"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: 11.5,
                    padding: "3px 10px",
                    background: assessmentForm.name === preset ? "#dbeafe" : "#f1f5f9",
                    color: assessmentForm.name === preset ? "#1d4ed8" : "inherit",
                    fontWeight: 700,
                    borderRadius: 6,
                    border: assessmentForm.name === preset ? "1px solid #93c5fd" : "1px solid transparent",
                  }}
                  onClick={() => setAssessmentForm((prev) => ({ ...prev, name: preset }))}
                >
                  {preset}
                </button>
              ))}

              <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", fontWeight: 600, marginLeft: 8 }}>
                Materi:
              </span>
              {["Greeting", "What's your name?", "Numbers (1-50)", "Colors", "Farm Animals"].map((mat) => (
                <button
                  key={mat}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: "2px 8px", background: "#f8fafc", borderRadius: 4 }}
                  onClick={() => setAssessmentForm((prev) => ({ ...prev, name: mat }))}
                >
                  {mat}
                </button>
              ))}

              <div style={{ flex: 1 }} />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: 11, padding: "3px 10px" }}
                onClick={() => handleAutofillScores(85)}
              >
                Set Semua 85
              </button>
            </div>
          </div>

          {/* Tabel Input Nilai Siswa */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Daftar Nilai Murid Kelas ({dataSiswa.length} Siswa)
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Skala nilai: 0 - 100
              </div>
            </div>

            {dataSiswa.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                Tidak ada murid terdaftar di kelas ini.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                    <tr>
                      <th style={{ padding: "10px 14px", width: 50, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>NO</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>NAMA SISWA</th>
                      <th style={{ padding: "10px 14px", width: 140, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>NILAI (0–100) *</th>
                      <th style={{ padding: "10px 14px", width: 100, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textAlign: "center" }}>STATUS</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>CATATAN / EVALUASI SISWA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSiswa.map((siswa, idx) => {
                      const val = scores[siswa.id]?.score;
                      const numVal = Number(val);
                      let gradeLabel = { text: "Belum Diisi", bg: "#f1f5f9", color: "#64748b" };
                      if (val !== "" && val !== undefined) {
                        if (numVal >= 85) gradeLabel = { text: "Sangat Baik", bg: "#dcfce7", color: "#166534" };
                        else if (numVal >= 70) gradeLabel = { text: "Baik (Lulus)", bg: "#e0f2fe", color: "#0369a1" };
                        else gradeLabel = { text: "Perlu Latihan", bg: "#fee2e2", color: "#991b1b" };
                      }

                      return (
                        <tr key={siswa.id} style={{ borderBottom: idx < dataSiswa.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                          <td style={{ padding: "10px 14px", color: "var(--color-text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{siswa.name}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="0 - 100"
                              className="form-input"
                              style={{ width: "100%", padding: "5px 10px", fontSize: 13, fontWeight: 700 }}
                              value={scores[siswa.id]?.score ?? ""}
                              onChange={(e) => {
                                const v = e.target.value === "" ? "" : Number(e.target.value);
                                setScores((prev) => ({
                                  ...prev,
                                  [siswa.id]: {
                                    score: v,
                                    notes: prev[siswa.id]?.notes || "",
                                  },
                                }));
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: gradeLabel.bg, color: gradeLabel.color }}>
                              {gradeLabel.text}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <input
                              type="text"
                              placeholder="Catatan penguasaan materi (opsional)..."
                              className="form-input"
                              style={{ width: "100%", padding: "5px 10px", fontSize: 12.5 }}
                              value={scores[siswa.id]?.notes ?? ""}
                              onChange={(e) => {
                                const n = e.target.value;
                                setScores((prev) => ({
                                  ...prev,
                                  [siswa.id]: {
                                    score: prev[siswa.id]?.score ?? "",
                                    notes: n,
                                  },
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ padding: "12px 16px", background: "#f8fafc", borderTop: "1px solid var(--color-border-light)", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAssessments}
                disabled={savingScores || dataSiswa.length === 0}
                style={{ padding: "8px 24px", fontWeight: 700, fontSize: 13 }}
              >
                {savingScores ? "Menyimpan Nilai..." : "Simpan Nilai Kelas"}
              </button>
            </div>
          </div>

          {/* Riwayat Penilaian yang Pernah Diinput */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-light)", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Riwayat Nilai Kelas Ini ({pastAssessments.length} Tercatat)
              </div>
              <button className="btn btn-ghost btn-sm" onClick={fetchClassAssessments} disabled={loadingPastAssessments} style={{ fontSize: 12 }}>
                {loadingPastAssessments ? "Memuat..." : "Refresh Riwayat"}
              </button>
            </div>

            {loadingPastAssessments ? (
              <div style={{ padding: 24 }}>
                <SkeletonTable rows={3} cols={5} />
              </div>
            ) : pastAssessments.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                Belum ada data penilaian yang tercatat untuk kelas ini. Gunakan form di atas untuk mencatat nilai pertama.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                    <tr>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>TANGGAL</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>NAMA ASESMEN</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>SISWA</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>BOBOT</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textAlign: "center" }}>NILAI</th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textAlign: "center" }}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAssessments.map((item, idx) => {
                      const studentName = item.student?.name || (item.student as any)?.full_name || "Siswa";
                      const scoreNum = Number(item.score);
                      return (
                        <tr key={item.id} style={{ borderBottom: idx < pastAssessments.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                          <td style={{ padding: "10px 14px", color: "var(--color-text-muted)" }}>
                            {item.assessment_date}
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                            {item.assessment_name}
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--color-text-secondary)" }}>
                            {studentName}
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--color-text-muted)" }}>
                            {item.weight || 1.0}x
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <span style={{ fontWeight: 800, color: scoreNum >= 70 ? "#059669" : "#b45309" }}>
                              {scoreNum}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ color: "#ef4444", fontSize: 11, padding: "3px 8px" }}
                              onClick={() => handleDeleteAssessment(item.id, item.assessment_name)}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
