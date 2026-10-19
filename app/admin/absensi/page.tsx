"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import {
  getClassSessions,
  getClassroomById,
  getClassrooms,
  submitAttendanceAndLogbook,
  type ClassSession,
  type Classroom,
  type SubmitAttendancePayload,
} from "@/lib/api/academic";
import { getStudents, type Student } from "@/lib/api/students";
import { getTeachers, type Teacher } from "@/lib/api/teachers";

export default function AbsensiPage() {
  const [activeTab, setActiveTab] = useState<"agenda" | "rekap">("agenda");

  // Filter States - Tab Agenda
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const currentMonthPrefix = useMemo(() => todayStr.substring(0, 7), [todayStr]); // YYYY-MM

  const [dateFilterMode, setDateFilterMode] = useState<"today" | "month" | "all" | "custom">("today");
  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter States - Tab Rekap
  const [searchStudent, setSearchStudent] = useState<string>("");
  const [rekapClassFilter, setRekapClassFilter] = useState<string>("all");

  // Core Data States
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal Form State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [loadingClassroom, setLoadingClassroom] = useState<boolean>(false);

  const [studentsAttendance, setStudentsAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  const [logbookForm, setLogbookForm] = useState({
    check_in: "",
    check_out: "",
    teaching_minutes: 60,
    material: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: "success" | "danger" } | null>(null);
  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calculateMinutes = (start: string, end: string) => {
    try {
      const [h1, m1] = start.split(":").map(Number);
      const [h2, m2] = end.split(":").map(Number);
      const diff = h2 * 60 + m2 - (h1 * 60 + m1);
      return diff > 0 ? diff : 60;
    } catch {
      return 60;
    }
  };

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, classroomsRes, teachersRes, studentsRes] = await Promise.allSettled([
        getClassSessions({ per_page: 500 }),
        getClassrooms({ per_page: 100 }),
        getTeachers({ per_page: 100 }),
        getStudents({ per_page: 250 }),
      ]);

      if (sessionsRes.status === "fulfilled") {
        setSessions(sessionsRes.value || []);
      }
      if (classroomsRes.status === "fulfilled") {
        setClassrooms(classroomsRes.value?.data || []);
      }
      if (teachersRes.status === "fulfilled") {
        setTeachers(teachersRes.value?.data || []);
      }
      if (studentsRes.status === "fulfilled") {
        setStudents(studentsRes.value?.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      showToast("Gagal memuat data absensi.", "danger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Klasifikasi Metrik Sesi & Kehadiran (Akurat & Tidak Menyesatkan)
  const metrics = useMemo(() => {
    let completedSessions = 0;
    let pendingPastSessions = 0; // Sesi lampau yang belum diabsen (Backlog)
    let pendingTodaySessions = 0; // Sesi hari ini yang belum diabsen
    let futureScheduledSessions = 0; // Sesi masa depan

    let totalPresent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalAbsent = 0;
    let totalMinutes = 0;

    sessions.forEach((s) => {
      const sDate = s.sessionDate?.split("T")[0] || "";
      const isCompleted = s.status === "completed" || s.teacherLogbook != null;

      if (isCompleted) {
        completedSessions++;
      } else {
        if (sDate < todayStr) {
          pendingPastSessions++;
        } else if (sDate === todayStr) {
          pendingTodaySessions++;
        } else {
          futureScheduledSessions++;
        }
      }

      if (s.teacherLogbook?.teaching_minutes) {
        totalMinutes += Number(s.teacherLogbook.teaching_minutes) || 0;
      }

      if (Array.isArray(s.studentAttendances)) {
        s.studentAttendances.forEach((att: any) => {
          const st = att.attendance_status || att.attendanceStatus;
          if (st === "present") totalPresent++;
          else if (st === "late") totalLate++;
          else if (st === "excused") totalExcused++;
          else if (st === "absent") totalAbsent++;
        });
      }
    });

    const totalPresensiFisik = totalPresent + totalLate + totalExcused + totalAbsent;
    const rate = totalPresensiFisik > 0
      ? Math.round(((totalPresent + totalLate) / totalPresensiFisik) * 100)
      : 100;

    const hours = (totalMinutes / 60).toFixed(1);

    return {
      rate,
      totalPresensiFisik,
      totalPresent,
      totalLate,
      totalExcused,
      totalAbsent,
      completedSessions,
      pendingPastSessions,
      pendingTodaySessions,
      futureScheduledSessions,
      totalSessions: sessions.length,
      hours,
    };
  }, [sessions, todayStr]);

  // Filter Agenda Sesi
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sDate = s.sessionDate?.split("T")[0] || "";
      const isCompleted = s.status === "completed" || s.teacherLogbook != null;

      // Filter Tanggal
      if (dateFilterMode === "today") {
        if (sDate !== todayStr) return false;
      } else if (dateFilterMode === "month") {
        if (!sDate.startsWith(currentMonthPrefix)) return false;
      } else if (dateFilterMode === "custom") {
        if (sDate !== customDate) return false;
      }

      // Filter Kelas
      if (filterClassId !== "all") {
        const cid = s.classroomId || s.classroom?.id;
        if (cid !== filterClassId) return false;
      }

      // Filter Status
      if (filterStatus === "completed" && !isCompleted) return false;
      if (filterStatus === "pending") {
        // Perlu Diabsen (Hari ini atau sudah lewat)
        if (isCompleted || sDate > todayStr) return false;
      }
      if (filterStatus === "future") {
        // Masa Depan
        if (isCompleted || sDate <= todayStr) return false;
      }

      // Filter Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cName = s.classroom?.name?.toLowerCase() || "";
        const tName = s.teacher?.name?.toLowerCase() || (s.teacher as any)?.user?.name?.toLowerCase() || "";
        const mat = s.teacherLogbook?.material?.toLowerCase() || "";
        if (!cName.includes(q) && !tName.includes(q) && !mat.includes(q)) return false;
      }

      return true;
    });
  }, [sessions, dateFilterMode, customDate, todayStr, currentMonthPrefix, filterClassId, filterStatus, searchQuery]);

  // Rekapitulasi Partisipasi per Siswa
  const studentRecapList = useMemo(() => {
    const recapMap = new Map<
      string,
      {
        id: string;
        name: string;
        code: string;
        className: string;
        total: number;
        present: number;
        late: number;
        excused: number;
        absent: number;
      }
    >();

    students.forEach((st) => {
      const cName = st.enrollments?.[0]?.classroom?.name || st.program?.name || "Reguler";
      recapMap.set(st.id, {
        id: st.id,
        name: st.name,
        code: st.studentCode || st.nis || "-",
        className: cName,
        total: 0,
        present: 0,
        late: 0,
        excused: 0,
        absent: 0,
      });
    });

    sessions.forEach((s) => {
      if (Array.isArray(s.studentAttendances)) {
        s.studentAttendances.forEach((att: any) => {
          const sid = att.student_id || att.studentId || att.student?.id;
          if (!sid) return;

          let entry = recapMap.get(sid);
          if (!entry) {
            entry = {
              id: sid,
              name: att.student?.name || att.student?.full_name || "Siswa",
              code: att.student?.student_code || att.student?.studentCode || "-",
              className: s.classroom?.name || "Reguler",
              total: 0,
              present: 0,
              late: 0,
              excused: 0,
              absent: 0,
            };
            recapMap.set(sid, entry);
          }

          const st = att.attendance_status || att.attendanceStatus;
          entry.total++;
          if (st === "present") entry.present++;
          else if (st === "late") entry.late++;
          else if (st === "excused") entry.excused++;
          else if (st === "absent") entry.absent++;
        });
      }
    });

    return Array.from(recapMap.values())
      .map((r) => {
        const rate = r.total > 0 ? Math.round(((r.present + r.late) / r.total) * 100) : 100;
        return { ...r, rate };
      })
      .filter((item) => {
        if (searchStudent.trim()) {
          const q = searchStudent.toLowerCase();
          if (!item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return false;
        }
        if (rekapClassFilter !== "all") {
          if (!item.className.toLowerCase().includes(rekapClassFilter.toLowerCase())) return false;
        }
        return true;
      });
  }, [students, sessions, searchStudent, rekapClassFilter]);

  // Buka Modal Form
  const handleOpenForm = async (session: ClassSession) => {
    setActiveSession(session);
    setActiveClassroom(null);
    setStudentsAttendance({});

    const existingLog = session.teacherLogbook;
    const sessionDateOnly = session.sessionDate?.split("T")[0] || todayStr;
    const defaultCheckIn = `${sessionDateOnly}T${session.startTime?.substring(0, 5) || "14:00"}`;
    const defaultCheckOut = `${sessionDateOnly}T${session.endTime?.substring(0, 5) || "15:30"}`;

    setLogbookForm({
      check_in: existingLog?.check_in ? existingLog.check_in.replace(" ", "T").substring(0, 16) : defaultCheckIn,
      check_out: existingLog?.check_out ? existingLog.check_out.replace(" ", "T").substring(0, 16) : defaultCheckOut,
      teaching_minutes: existingLog?.teaching_minutes || calculateMinutes(session.startTime, session.endTime),
      material: existingLog?.material || "",
      notes: existingLog?.notes || "",
    });

    setShowModal(true);
    setLoadingClassroom(true);

    try {
      const cId = session.classroomId || session.classroom?.id;
      if (cId) {
        const classroom = await getClassroomById(cId);
        setActiveClassroom(classroom);

        const initAtt: Record<string, { status: string; notes: string }> = {};
        const existingAttList = session.studentAttendances || [];

        classroom.students.forEach((st) => {
          const found = existingAttList.find((ea: any) => (ea.student_id || ea.studentId) === st.id);
          initAtt[st.id] = {
            status: found?.attendance_status || found?.attendanceStatus || "present",
            notes: found?.notes || "",
          };
        });

        existingAttList.forEach((ea: any) => {
          const sid = ea.student_id || ea.studentId;
          if (sid && !initAtt[sid]) {
            initAtt[sid] = {
              status: ea.attendance_status || ea.attendanceStatus || "present",
              notes: ea.notes || "",
            };
          }
        });

        setStudentsAttendance(initAtt);
      }
    } catch (err) {
      console.warn("Gagal memuat murid kelas:", err);
    } finally {
      setLoadingClassroom(false);
    }
  };

  const handleAttendanceChange = (studentId: string, field: "status" | "notes", value: string) => {
    setStudentsAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!activeSession) return;
    if (!logbookForm.check_in || !logbookForm.check_out || !logbookForm.material.trim()) {
      showToast("Lengkapi jam masuk, keluar, dan materi pelajaran.", "danger");
      return;
    }

    setSubmitting(true);
    try {
      const payload: SubmitAttendancePayload = {
        students: Object.entries(studentsAttendance).map(([id, data]) => ({
          student_id: id,
          attendance_status: data.status as "present" | "absent" | "late" | "excused",
          notes: data.notes || undefined,
        })),
        logbook: {
          check_in: logbookForm.check_in.includes("T") ? logbookForm.check_in.replace("T", " ") : logbookForm.check_in,
          check_out: logbookForm.check_out.includes("T") ? logbookForm.check_out.replace("T", " ") : logbookForm.check_out,
          teaching_minutes: Number(logbookForm.teaching_minutes) || 60,
          material: logbookForm.material.trim(),
          notes: logbookForm.notes?.trim() || undefined,
        },
      };

      await submitAttendanceAndLogbook(activeSession.id, payload);
      showToast("Absensi dan logbook berhasil disimpan.", "success");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || "Gagal menyimpan data.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === "success" ? "#065f46" : "#991b1b",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 8,
            boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER UTAMA */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Absensi &amp; Logbook Guru</h1>
          <p className="page-subtitle">Pencatatan kehadiran murid dan verifikasi jurnal mengajar per sesi kelas.</p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => window.print()} style={{ fontSize: 13 }}>
            Cetak Rekap
          </button>
          <button className="btn btn-primary" onClick={fetchData} disabled={loading} style={{ fontSize: 13 }}>
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* 4 KARTU METRIK UTAMA (DETAIL & AKURAT) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        {/* Kartu 1: Kehadiran Siswa */}
        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Tingkat Kehadiran Murid</span>
          <div className="stat-card-value" style={{ fontSize: 24, color: "#059669", fontWeight: 800 }}>
            {loading ? "..." : `${metrics.rate}%`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            Dari total {metrics.totalPresensiFisik} presensi tercatat
          </div>
        </div>

        {/* Kartu 2: Sesi Selesai vs Mendatang */}
        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Sesi Selesai</span>
          <div className="stat-card-value" style={{ fontSize: 24, color: "#1d4ed8", fontWeight: 800 }}>
            {loading ? "..." : metrics.completedSessions}
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}> / {metrics.totalSessions} total jadwal</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            {metrics.futureScheduledSessions} jadwal sesi mendatang
          </div>
        </div>

        {/* Kartu 3: Perlu Diabsen (Backlog/Hari Ini) */}
        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Perlu Diabsen (Hari Ini / Lewat)</span>
          <div className="stat-card-value" style={{ fontSize: 24, color: metrics.pendingPastSessions + metrics.pendingTodaySessions > 0 ? "#b45309" : "#059669", fontWeight: 800 }}>
            {loading ? "..." : metrics.pendingPastSessions + metrics.pendingTodaySessions}
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}> sesi</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            {metrics.pendingTodaySessions} sesi hari ini • {metrics.pendingPastSessions} sesi terlewat
          </div>
        </div>

        {/* Kartu 4: Jam Mengajar Guru */}
        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Total Jam Mengajar</span>
          <div className="stat-card-value" style={{ fontSize: 24, color: "#7c3aed", fontWeight: 800 }}>
            {loading ? "..." : `${metrics.hours} Jam`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            Tervalidasi dari logbook guru
          </div>
        </div>
      </div>

      {/* RINCIAN FISIK PRESENSI MURID */}
      <div
        className="card"
        style={{
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          background: "#f8fafc",
          border: "1px solid var(--color-border-light)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)" }}>
          Rincian Presensi Murid Terdata:
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534" }}>
            Hadir: {metrics.totalPresent}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#fef3c7", color: "#92400e" }}>
            Telat: {metrics.totalLate}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#e0f2fe", color: "#0369a1" }}>
            Izin / Sakit: {metrics.totalExcused}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#fee2e2", color: "#991b1b" }}>
            Alpa: {metrics.totalAbsent}
          </span>
        </div>
      </div>

      {/* DUA TAB UTAMA */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab("agenda")}
          className={`btn ${activeTab === "agenda" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Sesi &amp; Logbook Harian ({filteredSessions.length})
        </button>
        <button
          onClick={() => setActiveTab("rekap")}
          className={`btn ${activeTab === "rekap" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Rekap Kehadiran Siswa ({studentRecapList.length})
        </button>
      </div>

      {/* TAB 1: AGENDA SESI & LOGBOOK */}
      {activeTab === "agenda" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Filter Bar Lengkap */}
          <div
            className="card"
            style={{
              padding: "12px 16px",
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Filter Tanggal */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                className={`btn btn-sm ${dateFilterMode === "today" ? "btn-primary" : "btn-outline"}`}
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => setDateFilterMode("today")}
              >
                Hari Ini
              </button>
              <button
                type="button"
                className={`btn btn-sm ${dateFilterMode === "month" ? "btn-primary" : "btn-outline"}`}
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => setDateFilterMode("month")}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                className={`btn btn-sm ${dateFilterMode === "all" ? "btn-primary" : "btn-outline"}`}
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => setDateFilterMode("all")}
              >
                Semua Jadwal
              </button>

              <input
                type="date"
                className="form-input"
                style={{ width: 140, padding: "4px 8px", fontSize: 12 }}
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateFilterMode("custom");
                }}
              />

              {/* Filter Kelas */}
              <select
                className="form-input"
                style={{ width: "auto", minWidth: 140, padding: "4px 8px", fontSize: 12 }}
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
              >
                <option value="all">Semua Kelas</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Filter Status Sesi */}
              <select
                className="form-input"
                style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="completed">Sudah Selesai</option>
                <option value="pending">Perlu Diabsen (Hari Ini / Lewat)</option>
                <option value="future">Jadwal Mendatang</option>
              </select>
            </div>

            {/* Pencarian */}
            <div style={{ minWidth: 200, maxWidth: 280, flex: 1 }}>
              <input
                type="text"
                placeholder="Cari kelas / guru / materi..."
                className="form-input"
                style={{ padding: "5px 10px", fontSize: 12.5 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabel Sesi & Logbook */}
          {loading ? (
            <div className="card" style={{ padding: 24 }}>
              <SkeletonTable rows={5} cols={6} />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: "center", color: "var(--color-text-muted)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Tidak Ada Jadwal Sesi Ditemukan
              </div>
              <p style={{ fontSize: 12.5, margin: "4px 0 12px" }}>
                Tidak ada sesi kelas pada filter yang dipilih.
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setDateFilterMode("all");
                  setFilterClassId("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                }}
              >
                Tampilkan Semua Jadwal
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                    <tr>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Tanggal &amp; Jam
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Kelas
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Guru
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Jurnal Logbook Guru
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Presensi Siswa
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                        Status
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((s, idx) => {
                      const sDate = s.sessionDate?.split("T")[0] || "";
                      const isCompleted = s.status === "completed" || s.teacherLogbook != null;
                      const isPast = sDate < todayStr;
                      const isToday = sDate === todayStr;

                      const tName = s.teacher?.name || (s.teacher as any)?.user?.name || "–";
                      const logbook = s.teacherLogbook;
                      const attendances = s.studentAttendances || [];
                      const presentCount = attendances.filter(
                        (a: any) => a.attendance_status === "present" || a.attendanceStatus === "present"
                      ).length;

                      // Label Status Sesi yang Logis & Akurat
                      let statusBadge = { text: "Terjadwal", bg: "#f1f5f9", color: "#64748b" };
                      if (isCompleted) {
                        statusBadge = { text: "Selesai", bg: "#dcfce7", color: "#166534" };
                      } else if (isToday) {
                        statusBadge = { text: "Hari Ini", bg: "#fef3c7", color: "#92400e" };
                      } else if (isPast) {
                        statusBadge = { text: "Belum Diabsen", bg: "#fee2e2", color: "#991b1b" };
                      }

                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom: idx < filteredSessions.length - 1 ? "1px solid var(--color-border-light)" : "none",
                            background: isCompleted ? "#fff" : isToday ? "#fffbeb" : "#fafafa",
                          }}
                        >
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 13 }}>
                              {sDate}
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                              {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)} (Pertemuan ke-{s.sessionNumber})
                            </div>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                              {s.classroom?.name || "Kelas"}
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                              {s.classroom?.programLevel?.name || "Reguler"}
                            </div>
                          </td>

                          <td style={{ padding: "12px 14px", color: "var(--color-text-primary)", fontWeight: 600 }}>
                            {tName}
                          </td>

                          <td style={{ padding: "12px 14px", maxWidth: 220 }}>
                            {logbook?.material ? (
                              <div>
                                <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: 12.5 }}>
                                  {logbook.material}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                                  {logbook.teaching_minutes || 60} menit mengajar
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}>
                                Belum ada jurnal
                              </span>
                            )}
                          </td>

                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            {attendances.length > 0 ? (
                              <div style={{ fontSize: 12 }}>
                                <strong style={{ color: "#166534" }}>{presentCount}</strong> / {attendances.length} Hadir
                              </div>
                            ) : (
                              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>–</span>
                            )}
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "3px 8px",
                                borderRadius: 4,
                                background: statusBadge.bg,
                                color: statusBadge.color,
                              }}
                            >
                              {statusBadge.text}
                            </span>
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <button
                              className={`btn btn-sm ${isCompleted ? "btn-outline" : "btn-primary"}`}
                              style={{ fontSize: 11.5, padding: "4px 10px" }}
                              onClick={() => handleOpenForm(s)}
                            >
                              {isCompleted ? "Edit" : "Input Absen"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAP KEHADIRAN SISWA */}
      {activeTab === "rekap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Filter Bar Rekap */}
          <div
            className="card"
            style={{
              padding: "12px 16px",
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 240 }}>
              <input
                type="text"
                placeholder="Cari nama siswa / NIS..."
                className="form-input"
                style={{ padding: "5px 10px", fontSize: 12.5 }}
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
              <select
                className="form-input"
                style={{ width: "auto", minWidth: 150, padding: "5px 8px", fontSize: 12.5 }}
                value={rekapClassFilter}
                onChange={(e) => setRekapClassFilter(e.target.value)}
              >
                <option value="all">Semua Kelas</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Total: <strong>{studentRecapList.length}</strong> siswa
            </div>
          </div>

          {/* Tabel Rekap Siswa */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                  <tr>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      NIS
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      Nama Siswa
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      Kelas
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Pertemuan Berjalan
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Hadir
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Telat
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Izin / Sakit
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Alpa
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      % Kehadiran
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecapList.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>
                        Tidak ada data siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    studentRecapList.map((row, idx) => (
                      <tr
                        key={row.id + idx}
                        style={{ borderBottom: idx < studentRecapList.length - 1 ? "1px solid var(--color-border-light)" : "none" }}
                      >
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
                          {row.code}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                          {row.name}
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--color-text-secondary)" }}>
                          {row.className}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600 }}>
                          {row.total}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#166534" }}>
                          {row.present}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", color: "#92400e" }}>
                          {row.late}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", color: "#0369a1" }}>
                          {row.excused}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", color: "#991b1b" }}>
                          {row.absent}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, minWidth: 50, height: 5, background: "#e2e8f0", borderRadius: 999 }}>
                              <div
                                style={{
                                  width: `${row.rate}%`,
                                  height: "100%",
                                  background: row.rate >= 80 ? "#10b981" : row.rate >= 60 ? "#f59e0b" : "#ef4444",
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 11.5, fontWeight: 700, width: 30 }}>{row.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT ABSENSI & LOGBOOK */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={`Absensi: ${activeSession?.classroom?.name || "Kelas"} (Pertemuan #${activeSession?.sessionNumber || 1})`}
        maxWidth={640}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 6, fontSize: 12.5, color: "var(--color-text-secondary)" }}>
            Tanggal: <strong>{activeSession?.sessionDate?.split("T")[0]}</strong> ({activeSession?.startTime?.substring(0, 5)} - {activeSession?.endTime?.substring(0, 5)}) • Guru: <strong>{activeSession?.teacher?.name || "–"}</strong>
          </div>

          {/* Checklist Siswa */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>
              Daftar Presensi Murid
            </div>
            {loadingClassroom ? (
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Memuat murid...</div>
            ) : !activeClassroom || activeClassroom.students.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Tidak ada siswa di kelas ini.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeClassroom.students.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      padding: "6px 10px",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700 }}>{st.name}</div>
                    <select
                      className="form-input"
                      style={{ width: "auto", padding: "3px 6px", fontSize: 12 }}
                      value={studentsAttendance[st.id]?.status || "present"}
                      onChange={(e) => handleAttendanceChange(st.id, "status", e.target.value)}
                    >
                      <option value="present">Hadir</option>
                      <option value="late">Telat</option>
                      <option value="excused">Izin / Sakit</option>
                      <option value="absent">Alpa</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Catatan..."
                      className="form-input"
                      style={{ width: 140, padding: "3px 6px", fontSize: 12 }}
                      value={studentsAttendance[st.id]?.notes || ""}
                      onChange={(e) => handleAttendanceChange(st.id, "notes", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jurnal Logbook Guru */}
          <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>
              Jurnal Mengajar Guru
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Jam Masuk</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  style={{ fontSize: 11.5 }}
                  value={logbookForm.check_in}
                  onChange={(e) => setLogbookForm({ ...logbookForm, check_in: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Jam Keluar</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  style={{ fontSize: 11.5 }}
                  value={logbookForm.check_out}
                  onChange={(e) => setLogbookForm({ ...logbookForm, check_out: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Durasi (Menit)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: 11.5 }}
                  value={logbookForm.teaching_minutes}
                  onChange={(e) => setLogbookForm({ ...logbookForm, teaching_minutes: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label" style={{ fontSize: 11 }}>Materi Pelajaran *</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Materi yang diajarkan pada sesi ini..."
                style={{ fontSize: 12 }}
                value={logbookForm.material}
                onChange={(e) => setLogbookForm({ ...logbookForm, material: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 11 }}>Catatan Sesi (Opsional)</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Catatan kelas atau evaluasi siswa..."
                style={{ fontSize: 12 }}
                value={logbookForm.notes}
                onChange={(e) => setLogbookForm({ ...logbookForm, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={submitting}>
              Batal
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Absensi"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
