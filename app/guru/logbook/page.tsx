"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getClassSessions, getClassSchedules, type ClassSession, type ClassSchedule } from "@/lib/api/academic";

export interface SiswaAbsenItem {
  nama: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alpha";
  catatan?: string;
}

export interface LogbookEntry {
  id: string;
  tanggal: string;
  tglDisplay: string;
  dayNum: number;
  bulanKey: string; // YYYY-MM
  kelas: string;
  program: string;
  jam: string;
  ruang: string;
  pertemuan: number;
  totalPertemuan: number;
  materi: string;
  catatanGuru: string;
  hadir: number;
  totalSiswa: number;
  izin: number;
  sakit: number;
  alpha: number;
  status: "Selesai" | "Hari Ini" | "Mendatang";
  warna: string;
  siswaAbsensi: SiswaAbsenItem[];
  isLibur: boolean;
  classroomId: string;
}

// Helper date
function getMonthMeta(year: number, month: number) {
  const d = new Date(year, month - 1, 1);
  const days = new Date(year, month, 0).getDate();
  let offsetStart = d.getDay() - 1;
  if (offsetStart < 0) offsetStart = 6;
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  return { year, month, key, label, days, offsetStart };
}

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"];

function getStatusSesi(sessionDate: string): "Hari Ini" | "Mendatang" | "Selesai" {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(sessionDate); d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Hari Ini";
  if (d > today) return "Mendatang";
  return "Selesai";
}

function warnaStatus(status: string) {
  if (status === "Hari Ini") return "#059669";
  if (status === "Mendatang") return "#1d4ed8";
  return "#64748b";
}

function statusBadgeStyle(status: string): { bg: string; color: string } {
  if (status === "Selesai") return { bg: "#d1fae5", color: "#059669" };
  if (status === "Hari Ini") return { bg: "#dbeafe", color: "#1d4ed8" };
  return { bg: "#fef3c7", color: "#d97706" };
}

function isLogbookCompleted(entry: LogbookEntry) {
  return Boolean(entry.materi && entry.materi !== "Belum diisi" && entry.materi.trim() !== "");
}

export default function GuruKalenderLogbookPage() {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1);

  const currentBulan = getMonthMeta(viewYear, viewMonth);
  const selectedBulanKey = currentBulan.key;

  const [logbookList, setLogbookList] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null);
  const [selectedDaySessions, setSelectedDaySessions] = useState<{ dayNum: number; date: string; sessions: LogbookEntry[] } | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<{ dayNum: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchLogbooks = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, schedulesRes] = await Promise.allSettled([
        getClassSessions({ per_page: 500 }),
        getClassSchedules(),
      ]);

      const rawSessions: ClassSession[] = sessionsRes.status === "fulfilled"
        ? (Array.isArray(sessionsRes.value) ? sessionsRes.value : ((sessionsRes.value as any)?.data || []))
        : [];

      const rawSchedules: ClassSchedule[] = schedulesRes.status === "fulfilled" && Array.isArray(schedulesRes.value)
        ? schedulesRes.value
        : [];

      // Calculate total sessions per classroom from real database records
      const sessionCountsByClass: Record<string, number> = {};
      rawSessions.forEach((s) => {
        const cid = s.classroomId || s.classroom?.id;
        if (cid) {
          sessionCountsByClass[cid] = (sessionCountsByClass[cid] || 0) + 1;
        }
      });

      const entries: LogbookEntry[] = rawSessions.map((s) => {
        const dateKey = s.sessionDate?.split("T")[0] ?? "";
        const bulanKey = dateKey.substring(0, 7);
        const dayNum = parseInt(dateKey.substring(8, 10), 10);
        const tglDisplay = new Date(dateKey).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const status = getStatusSesi(dateKey);

        const attendances = s.studentAttendances || [];
        const hadir = attendances.filter((a: any) => a.attendance_status === "present").length;
        const izin = attendances.filter((a: any) => a.attendance_status === "excused").length;
        const sakit = attendances.filter((a: any) => a.attendance_status === "absent" && (a.notes || "").toLowerCase().includes("sakit")).length;
        const alpha = attendances.filter((a: any) => a.attendance_status === "absent" && !(a.notes || "").toLowerCase().includes("sakit")).length;

        const siswaAbsensi: SiswaAbsenItem[] = attendances.map((a: any) => {
           let sts: "Hadir" | "Izin" | "Sakit" | "Alpha" = "Hadir";
           if (a.attendance_status === "present") sts = "Hadir";
           else if (a.attendance_status === "excused") sts = "Izin";
           else if (a.attendance_status === "absent") sts = (a.notes || "").toLowerCase().includes("sakit") ? "Sakit" : "Alpha";

           return {
             nama: a.student?.full_name || a.student?.name || "Unknown Student",
             status: sts,
             catatan: a.notes || undefined,
           };
        });

        const cid = s.classroomId || s.classroom?.id || "";
        const totalPertemuan = cid ? (sessionCountsByClass[cid] || 0) : 0;

        return {
          id: s.id,
          tanggal: dateKey,
          tglDisplay,
          dayNum,
          bulanKey,
          kelas: s.classroom?.name || "Kelas",
          program: s.classroom?.programLevel?.name || s.classSchedule?.classroom?.programLevel?.name || "Program",
          jam: `${s.startTime?.substring(0,5) || "--"} - ${s.endTime?.substring(0,5) || "--"}`,
          ruang: "Ruang Kelas",
          pertemuan: s.sessionNumber || 0,
          totalPertemuan,
          materi: s.teacherLogbook?.material || "Belum diisi",
          catatanGuru: s.teacherLogbook?.notes || "Tidak ada catatan.",
          hadir,
          totalSiswa: attendances.length,
          izin,
          sakit,
          alpha,
          status,
          warna: warnaStatus(status),
          siswaAbsensi,
          isLibur: s.isHoliday,
          classroomId: cid,
        };
      });

      // Proyeksikan jadwal mendatang dari recurring class schedules ke kalender (hingga 90 hari ke depan)
      const existingSessionDates = new Set(entries.map((e) => `${e.classroomId}_${e.tanggal}`));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
        minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6,
      };

      const projectedEntries: LogbookEntry[] = [];

      rawSchedules.forEach((sc) => {
        const targetDay = dayMap[(sc.dayOfWeek || "").toLowerCase()];
        if (targetDay === undefined) return;

        const cid = sc.classroomId || sc.classroom?.id || "";
        const totalPertemuan = sessionCountsByClass[cid] || 0;

        for (let offset = 0; offset <= 90; offset++) {
          const checkD = new Date(today);
          checkD.setDate(checkD.getDate() + offset);

          if (checkD.getDay() === targetDay) {
            const yyyy = checkD.getFullYear();
            const mm = String(checkD.getMonth() + 1).padStart(2, "0");
            const dd = String(checkD.getDate()).padStart(2, "0");
            const dateKey = `${yyyy}-${mm}-${dd}`;

            if (sc.effectiveFrom && sc.effectiveFrom > dateKey) continue;
            if (sc.effectiveUntil && sc.effectiveUntil < dateKey) continue;

            if (existingSessionDates.has(`${cid}_${dateKey}`)) continue;

            const isToday = offset === 0;
            const status = isToday ? "Hari Ini" : "Mendatang";
            const bulanKey = `${yyyy}-${mm}`;
            const dayNum = parseInt(dd, 10);
            const tglDisplay = checkD.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            projectedEntries.push({
              id: `sched-${sc.id}-${dateKey}`,
              tanggal: dateKey,
              tglDisplay,
              dayNum,
              bulanKey,
              kelas: sc.classroom?.name || "Kelas",
              program: sc.classroom?.programLevel?.name || "Program",
              jam: `${sc.startTime?.substring(0, 5) || "--"} - ${sc.endTime?.substring(0, 5) || "--"}`,
              ruang: "Ruang Kelas",
              pertemuan: totalPertemuan + Math.floor(offset / 7) + 1,
              totalPertemuan: totalPertemuan > 0 ? totalPertemuan + 8 : 12,
              materi: isToday ? "Sesi Hari Ini (Siap Diisi)" : "Jadwal Mendatang",
              catatanGuru: isToday
                ? "Jadwal kelas hari ini. Klik untuk memulai absensi dan mengisi materi logbook."
                : "Sesi mendatang terjadwal rutin. Materi dan absensi dapat diisi pada hari H sesi.",
              hadir: 0,
              totalSiswa: 0,
              izin: 0,
              sakit: 0,
              alpha: 0,
              status,
              warna: warnaStatus(status),
              siswaAbsensi: [],
              isLibur: false,
              classroomId: cid,
            });
          }
        }
      });

      const allEntries = [...entries, ...projectedEntries].sort((a, b) =>
        a.tanggal.localeCompare(b.tanggal)
      );

      setLogbookList(allEntries);

      // Auto-align calendar to active month if current month has 0 sessions
      if (entries.length > 0) {
        const now = new Date();
        const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const hasInThisMonth = entries.some(e => e.bulanKey === thisMonthKey);
        if (!hasInThisMonth) {
          const target = entries.find(e => e.status === "Hari Ini" || e.status === "Mendatang") || entries[entries.length - 1];
          if (target?.bulanKey) {
            const [y, m] = target.bulanKey.split("-").map(Number);
            if (y && m) {
              setViewYear(y);
              setViewMonth(m);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load logbooks", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogbooks();
  }, [fetchLogbooks]);

  const handlePrevBulan = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextBulan = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth() + 1);
  };

  const sessionsInCurrentMonth = logbookList.filter((l) => l.bulanKey === selectedBulanKey);
  const completedSessionsInMonth = sessionsInCurrentMonth.filter(isLogbookCompleted);
  const upcomingSessionsInMonth = sessionsInCurrentMonth.filter((s) => s.status === "Mendatang");
  const pendingSessionsInMonth = sessionsInCurrentMonth.filter((s) => s.status !== "Mendatang" && !isLogbookCompleted(s));
  const totalPresentInMonth = sessionsInCurrentMonth.reduce((acc, s) => acc + s.hadir, 0);
  const percentCompleted = sessionsInCurrentMonth.length > 0
    ? Math.round((completedSessionsInMonth.length / sessionsInCurrentMonth.length) * 100)
    : 0;

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
    const foundSessions = logbookList.filter((l) => l.tanggal === dateStr);
    if (foundSessions.length > 1) {
      // Multiple sessions — show session picker
      setSelectedDaySessions({ dayNum, date: dateStr, sessions: foundSessions });
    } else if (foundSessions.length === 1) {
      // Single session — go directly to detail
      setSelectedLogbook(foundSessions[0]);
    } else {
      // No sessions — show empty day
      setSelectedEmptyDay({ dayNum });
    }
  };

  const handlePickSession = (entry: LogbookEntry) => {
    setSelectedDaySessions(null);
    setSelectedLogbook(entry);
  };

  const handleBackToSessionList = () => {
    if (selectedLogbook) {
      const dateStr = selectedLogbook.tanggal;
      const dayNum = selectedLogbook.dayNum;
      const foundSessions = logbookList.filter((l) => l.tanggal === dateStr);
      if (foundSessions.length > 1) {
        setSelectedLogbook(null);
        setSelectedDaySessions({ dayNum, date: dateStr, sessions: foundSessions });
        return;
      }
    }
    setSelectedLogbook(null);
  };

  const calendarDays = Array.from({ length: currentBulan.days }, (_, i) => i + 1);
  const emptyOffsets = Array.from({ length: currentBulan.offsetStart }, (_, i) => i);

  // Check if today's date is in the current month to highlight it
  const today = new Date();
  const todayStr = today.toISOString().substring(0, 10);

  if (loading) return <SkeletonTable rows={5} cols={7} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        .cal-cell {
          min-height: 120px;
          border-radius: 14px;
          border: 1.5px solid #e8ecf1;
          background: #ffffff;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }
        .cal-cell:hover {
          border-color: #c5d0db;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .cal-cell.has-class {
          background: linear-gradient(135deg, #f0fdf8 0%, #ecfdf5 100%);
          border-color: #b2e8d8;
        }
        .cal-cell.has-class:hover {
          border-color: #059669;
          box-shadow: 0 6px 20px rgba(5,150,105,0.14);
        }
        .cal-cell.has-upcoming {
          background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
          border-color: #bae6fd;
        }
        .cal-cell.has-upcoming:hover {
          border-color: #0284c7;
          box-shadow: 0 6px 20px rgba(2,132,199,0.14);
        }
        .cal-cell.has-pending {
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          border-color: #fde68a;
        }
        .cal-cell.has-pending:hover {
          border-color: #ea580c;
          box-shadow: 0 6px 20px rgba(234,88,12,0.14);
        }
        .cal-cell.is-today {
          border-color: var(--color-primary);
          border-width: 2.5px;
        }
        .cal-cell.has-multi::after {
          content: '';
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 0 2px #fff;
        }

        .session-card {
          background: #fff;
          border: 1.5px solid #e8ecf1;
          border-radius: 14px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.3s ease-out backwards;
        }
        .session-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 6px 20px rgba(26,92,138,0.12);
          transform: translateY(-2px);
        }
        .session-card.completed {
          background: linear-gradient(135deg, #f0fdf8 0%, #ecfdf5 100%);
          border-color: #b2e8d8;
        }
        .session-card.completed:hover {
          border-color: #059669;
          box-shadow: 0 6px 20px rgba(5,150,105,0.15);
        }
        .session-card.upcoming {
          background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
          border-color: #bae6fd;
        }
        .session-card.upcoming:hover {
          border-color: #0284c7;
          box-shadow: 0 6px 20px rgba(2,132,199,0.15);
        }
        .session-card.pending {
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          border-color: #fde68a;
        }
        .session-card.pending:hover {
          border-color: #ea580c;
          box-shadow: 0 6px 20px rgba(234,88,12,0.15);
        }

        .mini-session-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      `}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff",
          padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13.5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 200, display: "flex", alignItems: "center", gap: 10,
          animation: "toastIn 0.25s ease-out",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header: Title + Month Nav + Legend */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          {/* Left: Month Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrevBulan}
              title="Bulan sebelumnya"
              style={{ padding: "6px 12px", fontSize: 16, lineHeight: 1, fontWeight: 800 }}
            >
              ‹
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: 0, minWidth: 200, textAlign: "center" }}>
              {currentBulan.label}
            </h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleNextBulan}
              title="Bulan berikutnya"
              style={{ padding: "6px 12px", fontSize: 16, lineHeight: 1, fontWeight: 800 }}
            >
              ›
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleJumpToToday}
              style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginLeft: 4 }}
            >
              Hari Ini
            </button>
          </div>

          {/* Right: Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 12.5, fontWeight: 600, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", flexShrink: 0 }} />
              <span style={{ color: "#059669" }}>Hadir & Logbook Terisi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0284c7", flexShrink: 0 }} />
              <span style={{ color: "#0284c7" }}>Jadwal Mendatang</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ea580c", flexShrink: 0 }} />
              <span style={{ color: "#ea580c" }}>Pending (Logbook Kosong)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", flexShrink: 0 }} />
              <span style={{ color: "#94a3b8" }}>Tidak Ada Kelas</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0 }} />
              <span style={{ color: "var(--color-primary)" }}>Multi-Sesi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Ringkasan Bulan Ini */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Total Sesi Bulan Ini</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#1d4ed8" }}>
            {sessionsInCurrentMonth.length} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Periode {currentBulan.label}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Logbook Terisi</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#059669" }}>
            {completedSessionsInMonth.length} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {percentCompleted}% dari total sesi bulan ini
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Menunggu Pengisian</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: pendingSessionsInMonth.length > 0 ? "#ea580c" : "#64748b" }}>
            {pendingSessionsInMonth.length} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {pendingSessionsInMonth.length === 0 ? "Semua logbook telah diisi" : "Perlu diisi absensi/logbook"}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Kehadiran Siswa</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#7c3aed" }}>
            {totalPresentInMonth} Hadir
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Akumulasi kehadiran bulan ini
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: 20, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 10 }}>
          {HARI.map((h, i) => (
            <div key={h} style={{
              fontSize: 13, fontWeight: 800, textAlign: "center",
              color: i >= 5 ? "#dc2626" : "#64748b",
              padding: "6px 0",
            }}>
              {h}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {emptyOffsets.map((_, idx) => (
            <div key={`off-${idx}`} style={{ minHeight: 120, borderRadius: 14, background: "#f9fafb", border: "1.5px solid #f1f5f9", opacity: 0.4 }} />
          ))}

          {calendarDays.map((dayNum) => {
            const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
            const sessionsToday = logbookList.filter((l) => l.tanggal === dateStr);
            const sessionCount = sessionsToday.length;
            const hasMulti = sessionCount > 1;

            // Determine overall status for the cell
            const allCompleted = sessionsToday.length > 0 && sessionsToday.every(isLogbookCompleted);
            const hasSomePending = sessionsToday.length > 0 && sessionsToday.some(s => s.status !== "Mendatang" && !isLogbookCompleted(s));
            const hasUpcoming = sessionsToday.length > 0 && sessionsToday.some(s => s.status === "Mendatang");
            const isToday = dateStr === todayStr;

            let cellClass = "cal-cell";
            if (allCompleted) cellClass += " has-class";
            else if (hasSomePending) cellClass += " has-pending";
            else if (hasUpcoming) cellClass += " has-upcoming";
            if (isToday) cellClass += " is-today";
            if (hasMulti) cellClass += " has-multi";

            return (
              <div
                key={dayNum}
                className={cellClass}
                onClick={() => handleDayClick(dayNum)}
              >
                {/* Day number + status badge row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 16, fontWeight: 900,
                    color: sessionCount > 0 ? "#1a202c" : "#94a3b8",
                    ...(isToday ? {
                      background: "var(--color-primary)",
                      color: "#fff",
                      width: 28, height: 28,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    } : {}),
                  }}>
                    {dayNum}
                  </span>
                  {sessionCount > 1 && (
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      padding: "2px 7px", borderRadius: 999,
                      background: "var(--color-primary-bg)",
                      color: "var(--color-primary)",
                    }}>
                      {sessionCount} Kelas
                    </span>
                  )}
                  {sessionCount === 1 && allCompleted && (
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 9px", borderRadius: 999, background: "#d1fae5", color: "#059669" }}>
                      Selesai
                    </span>
                  )}
                  {sessionCount === 1 && hasSomePending && (
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 9px", borderRadius: 999, background: "#fef3c7", color: "#d97706" }}>
                      Pending
                    </span>
                  )}
                  {sessionCount === 1 && !allCompleted && !hasSomePending && hasUpcoming && (
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 9px", borderRadius: 999, background: "#e0f2fe", color: "#0284c7" }}>
                      Mendatang
                    </span>
                  )}
                </div>

                {/* Session pills */}
                {sessionCount > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto", overflow: "hidden" }}>
                    {sessionsToday.slice(0, 3).map((sess, idx) => {
                      const completed = isLogbookCompleted(sess);
                      const isUpcoming = sess.status === "Mendatang";
                      return (
                        <div
                          key={sess.id}
                          className="mini-session-pill"
                          style={{
                            background: completed ? "#d1fae5" : isUpcoming ? "#e0f2fe" : "#fef3c7",
                            color: completed ? "#059669" : isUpcoming ? "#0284c7" : "#b45309",
                            animationDelay: `${idx * 0.05}s`,
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: completed ? "#059669" : isUpcoming ? "#0284c7" : "#b45309", display: "inline-block", flexShrink: 0 }} />
                          {sess.kelas}
                          <span style={{ opacity: 0.7 }}>·</span>
                          <span style={{ opacity: 0.8 }}>{sess.jam.split(" - ")[0]}</span>
                        </div>
                      );
                    })}
                    {sessionCount > 3 && (
                      <div style={{ fontSize: 10.5, color: "var(--color-primary)", fontWeight: 700, paddingLeft: 2 }}>
                        + {sessionCount - 3} lagi
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#c1c9d4", fontStyle: "italic", marginTop: "auto" }}>
                    Kosong
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          MODAL: Day Session Picker (Multiple Classes)
          ============================================================ */}
      {selectedDaySessions && (
        <Modal
          open
          onClose={() => setSelectedDaySessions(null)}
          title={`Kelas & Absensi — ${new Date(selectedDaySessions.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
          maxWidth={640}
        >
          {/* Summary badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--color-primary-bg)", padding: "6px 14px",
              borderRadius: 999, fontSize: 13, fontWeight: 800, color: "var(--color-primary)",
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {selectedDaySessions.sessions.length} Sesi Mengajar
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#d1fae5", padding: "6px 14px",
              borderRadius: 999, fontSize: 13, fontWeight: 800, color: "#059669",
            }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {selectedDaySessions.sessions.filter(isLogbookCompleted).length} Selesai
            </div>
            {selectedDaySessions.sessions.filter(s => s.status === "Mendatang").length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#e0f2fe", padding: "6px 14px",
                borderRadius: 999, fontSize: 13, fontWeight: 800, color: "#0284c7",
              }}>
                ● {selectedDaySessions.sessions.filter(s => s.status === "Mendatang").length} Mendatang
              </div>
            )}
            {selectedDaySessions.sessions.filter(s => s.status !== "Mendatang" && !isLogbookCompleted(s)).length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#fef3c7", padding: "6px 14px",
                borderRadius: 999, fontSize: 13, fontWeight: 800, color: "#d97706",
              }}>
                ○ {selectedDaySessions.sessions.filter(s => s.status !== "Mendatang" && !isLogbookCompleted(s)).length} Pending
              </div>
            )}
          </div>

          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
            Pilih kelas untuk melihat detail logbook dan absensi siswa.
          </p>

          {/* Session cards list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedDaySessions.sessions.map((session, idx) => {
              const completed = isLogbookCompleted(session);
              const isUpcoming = session.status === "Mendatang";
              const badge = statusBadgeStyle(session.status);
              return (
                <div
                  key={session.id}
                  className={`session-card ${completed ? "completed" : isUpcoming ? "upcoming" : "pending"}`}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  onClick={() => handlePickSession(session)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    {/* Left side */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        {/* Session number indicator */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: completed ? "linear-gradient(135deg, #059669, #10b981)" : isUpcoming ? "linear-gradient(135deg, #0284c7, #38bdf8)" : "linear-gradient(135deg, #d97706, #f59e0b)",
                          color: "#fff", fontWeight: 900, fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#1a202c", lineHeight: 1.3 }}>
                            {session.kelas}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                            {session.program}
                          </div>
                        </div>
                      </div>

                      {/* Details row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#64748b", fontWeight: 600, flexWrap: "wrap", paddingLeft: 40 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {session.jam}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          {session.hadir}/{session.totalSiswa} Siswa
                        </span>
                        {session.pertemuan > 0 && (
                          <span>Pertemuan {session.pertemuan}{session.totalPertemuan > 0 ? `/${session.totalPertemuan}` : ""}</span>
                        )}
                      </div>

                      {/* Materi preview */}
                      {completed && (
                        <div style={{
                          marginTop: 8, paddingLeft: 40,
                          fontSize: 12, color: "#166534", fontWeight: 600,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                          </svg>
                          <span>{session.materi}</span>
                        </div>
                      )}
                    </div>

                    {/* Right side: status + arrow */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800,
                        padding: "3px 10px", borderRadius: 999,
                        background: badge.bg, color: badge.color,
                      }}>
                        {completed ? "Selesai" : session.status}
                      </span>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom action */}
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setSelectedDaySessions(null)} style={{ flex: 1, justifyContent: "center" }}>
              Tutup
            </button>
          </div>
        </Modal>
      )}

      {/* ============================================================
          MODAL: Detail Logbook (Single Session)
          ============================================================ */}
      {selectedLogbook && (
      <Modal open onClose={() => setSelectedLogbook(null)} title="Detail Logbook" maxWidth={600}>
        {/* Back button (if came from multi-session day) */}
        {(() => {
          const dateStr = selectedLogbook.tanggal;
          const sessionsOnDay = logbookList.filter((l) => l.tanggal === dateStr);
          if (sessionsOnDay.length > 1) {
            return (
              <button
                onClick={handleBackToSessionList}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)",
                  background: "var(--color-primary-bg)",
                  border: "none", borderRadius: 8, padding: "5px 12px",
                  cursor: "pointer", marginBottom: 14,
                  transition: "all 0.15s ease",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Kembali ke Daftar Sesi ({sessionsOnDay.length} kelas)
              </button>
            );
          }
          return null;
        })()}

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ background: selectedLogbook?.warna, color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
              {selectedLogbook?.kelas}
            </span>
            <span style={{
              background: isLogbookCompleted(selectedLogbook) ? "#d1fae5" : selectedLogbook?.status === "Mendatang" ? "#e0f2fe" : "#fef3c7",
              color: isLogbookCompleted(selectedLogbook) ? "#059669" : selectedLogbook?.status === "Mendatang" ? "#0284c7" : "#d97706",
              fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
            }}>
              {isLogbookCompleted(selectedLogbook) ? "Logbook Tersimpan" : selectedLogbook?.status === "Mendatang" ? "Jadwal Mendatang" : "Belum Diisi"}
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a202c", margin: 0 }}>
            {selectedLogbook?.tglDisplay}
          </h2>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
            {selectedLogbook?.program} · Pertemuan {selectedLogbook?.pertemuan}{selectedLogbook?.totalPertemuan ? ` dari ${selectedLogbook.totalPertemuan} Sesi` : ""} · {selectedLogbook?.jam} · {selectedLogbook?.ruang}
          </div>
        </div>

        {/* Materi */}
        <div style={{ background: "linear-gradient(135deg, #f0fdf8, #dcfce7)", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Materi Pembelajaran</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#14532d", lineHeight: 1.4 }}>{selectedLogbook?.materi}</div>
        </div>

        {/* Kehadiran */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Rekap Kehadiran</span>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook?.hadir} Hadir</span>
              {selectedLogbook && selectedLogbook.izin > 0 && <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.izin} Izin</span>}
              {selectedLogbook && selectedLogbook.sakit > 0 && <span style={{ background: "#fce7f3", color: "#be185d", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.sakit} Sakit</span>}
              {selectedLogbook && selectedLogbook.alpha > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.alpha} Alpha</span>}
            </div>
          </div>
          {selectedLogbook?.siswaAbsensi.length === 0 ? (
            <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, textAlign: "center", color: "#94a3b8", fontSize: 13, border: "1px solid #e2e8f0" }}>
              Absensi belum diisi
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedLogbook?.siswaAbsensi.map((s, i) => {
                const bg = s.status === "Hadir" ? "#d1fae5" : s.status === "Izin" ? "#fef3c7" : s.status === "Sakit" ? "#fce7f3" : "#fee2e2";
                const clr = s.status === "Hadir" ? "#059669" : s.status === "Izin" ? "#b45309" : s.status === "Sakit" ? "#be185d" : "#dc2626";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: bg, color: clr, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.nama[0]}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a202c" }}>{s.nama}</div>
                        {s.catatan && <div style={{ fontSize: 11, color: clr, fontWeight: 600 }}>{s.catatan}</div>}
                      </div>
                    </div>
                    <span style={{ background: bg, color: clr, fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{s.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Catatan Guru */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Catatan Guru</div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#334155", lineHeight: 1.6, border: "1px solid #e2e8f0", fontStyle: "italic" }}>
            {selectedLogbook?.catatanGuru === "Tidak ada catatan." || !selectedLogbook?.catatanGuru ? 
               <span style={{ color: "#94a3b8" }}>Tidak ada catatan.</span> : 
               `"${selectedLogbook?.catatanGuru}"`
            }
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-outline"
            onClick={() => window.print()}
            style={{ flex: 1, minWidth: 140, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Cetak Logbook
          </button>

          <Link
            href={`/guru/kelas/${selectedLogbook?.classroomId || selectedLogbook?.id}`}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: 160, textDecoration: "none", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {selectedLogbook?.status === "Mendatang" ? "Lihat Detail Kelas" : selectedLogbook?.materi === "Belum diisi" ? "Isi Absensi & Logbook" : "Perbarui Absensi"}
          </Link>

          <button
            className="btn btn-ghost"
            onClick={() => setSelectedLogbook(null)}
            style={{ padding: "8px 16px" }}
          >
            Tutup
          </button>
        </div>
      </Modal>
      )}

      {/* MODAL: Hari Kosong */}
      <Modal open={!!selectedEmptyDay} onClose={() => setSelectedEmptyDay(null)} title={`Tanggal ${selectedEmptyDay?.dayNum} ${currentBulan.label}`} maxWidth={440}>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 18 }}>
          Tidak ada jadwal sesi mengajar pada tanggal ini.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/guru/jadwal" className="btn btn-accent" style={{ flex: 1, textAlign: "center", textDecoration: "none", justifyContent: "center" }}>Lihat Jadwal</Link>
          <button className="btn btn-ghost" onClick={() => setSelectedEmptyDay(null)} style={{ flex: 1, justifyContent: "center" }}>Tutup</button>
        </div>
      </Modal>
    </div>
  );
}
