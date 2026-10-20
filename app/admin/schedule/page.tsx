"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  getClassSchedules,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  generateClassSessions,
  getClassSessions,
  createClassSession,
  rescheduleClassSession,
  deleteClassSession,
  updateClassSession,
  getHolidays,
  getClassrooms,
  type ClassSchedule,
  type Classroom,
  type ClassSession
} from "@/lib/api/academic";
import { getTeachers, type Teacher } from "@/lib/api/teachers";
import SearchableSelect from "@/components/ui/SearchableSelect";

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAYS: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu"
};

const DAY_INDEX_MAP: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6,
};

const DAY_LIST = [
  { index: 1, name: "Senin", en: "Monday" },
  { index: 2, name: "Selasa", en: "Tuesday" },
  { index: 3, name: "Rabu", en: "Wednesday" },
  { index: 4, name: "Kamis", en: "Thursday" },
  { index: 5, name: "Jumat", en: "Friday" },
  { index: 6, name: "Sabtu", en: "Saturday" },
  { index: 0, name: "Minggu", en: "Sunday" },
];

function getDayOfWeekFromDate(dateStr: string): string {
  if (!dateStr) return "Monday";
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return "Monday";
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return DAY_NAMES_EN[date.getDay()] || "Monday";
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const totalMins = h * 60 + m + minutesToAdd;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export default function SchedulePage() {
  const { toast, showToast } = useToast();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State: Tambah/Edit Jadwal Rutin Satuan
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [formData, setFormData] = useState({
    classroom_id: "",
    teacher_id: "",
    day_of_week: "Monday",
    start_time: "14:00",
    end_time: "14:45",
    effective_from: new Date().toISOString().split("T")[0],
    effective_until: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete Confirm State: Jadwal Rutin
  const [scheduleToDelete, setScheduleToDelete] = useState<ClassSchedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tab & Agenda Sesi State
  const [activeTab, setActiveTab] = useState<"jadwal_rutin" | "agenda_sesi">("jadwal_rutin");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<"Semua" | "Hari Ini" | "Mendatang" | "Di-reschedule" | "Selesai">("Semua");
  const [teacherFilter, setTeacherFilter] = useState<string>("");
  const [classroomFilter, setClassroomFilter] = useState<string>("");

  // Generate Sessions State (Per Jadwal Rutin - Cara Lama)
  const [scheduleToGenerate, setScheduleToGenerate] = useState<ClassSchedule | null>(null);
  const [generateForm, setGenerateForm] = useState({ total_sessions: 8, start_date: "" });
  const [generating, setGenerating] = useState(false);

  // ── FITUR BARU: GENERATE PERIODE MULTI-HARI (5-30 OKTOBER / SEN-RAB-JUM) ──
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [generatingPeriod, setGeneratingPeriod] = useState(false);
  const [periodForm, setPeriodForm] = useState({
    classroom_id: "",
    teacher_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 28);
      return d.toISOString().split("T")[0];
    })(),
    selected_days: [1, 3, 5] as number[], // default: Senin (1), Rabu (3), Jumat (5)
    start_time: "14:00",
    end_time: "14:45",
    skip_holidays: true,
    create_master_schedules: true,
  });

  // ── FITUR BARU: RESCHEDULE / GESER SESI ──
  const [sessionToReschedule, setSessionToReschedule] = useState<any | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    new_date: "",
    new_start_time: "",
    new_end_time: "",
    new_teacher_id: "",
  });
  const [savingReschedule, setSavingReschedule] = useState(false);

  // ── FITUR BARU: HAPUS / BATAL SESI AKTUAL ──
  const [sessionToDelete, setSessionToDelete] = useState<any | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);

  // Muat Hari Libur
  useEffect(() => {
    getHolidays({ per_page: 200 })
      .then((res: any) => {
        const raw = res?.data || res || [];
        if (Array.isArray(raw)) {
          const dates = raw.map((h: any) => h.date || h.holiday_date).filter(Boolean);
          setHolidays(dates);
        }
      })
      .catch(() => {});
  }, []);

  const fetchAgendaSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const [rawSessionsRes, schedRes] = await Promise.allSettled([
        getClassSessions({ per_page: 200 }),
        getClassSchedules(),
      ]);

      const rawSessions: ClassSession[] = rawSessionsRes.status === "fulfilled"
        ? (Array.isArray(rawSessionsRes.value) ? rawSessionsRes.value : [])
        : [];
      const rawSchedules: ClassSchedule[] = schedRes.status === "fulfilled"
        ? (Array.isArray(schedRes.value) ? schedRes.value : [])
        : [];

      const sessionCountsByClass: Record<string, number> = {};
      rawSessions.forEach((s) => {
        const cid = s.classroomId || s.classroom?.id;
        if (cid) {
          sessionCountsByClass[cid] = Math.max(sessionCountsByClass[cid] || 0, s.sessionNumber || 0);
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingDates = new Set<string>();
      const mappedList = rawSessions.map((s) => {
        const dateKey = s.sessionDate?.split("T")[0] ?? "";
        const cid = s.classroomId || s.classroom?.id || "";
        existingDates.add(`${cid}_${dateKey}`);

        let status: "Hari Ini" | "Mendatang" | "Selesai" | "Di-reschedule" = "Mendatang";
        if (s.isRescheduled) {
          status = "Di-reschedule";
        } else if (s.status === "completed") {
          status = "Selesai";
        } else {
          const d = new Date(dateKey);
          d.setHours(0, 0, 0, 0);
          if (d.getTime() === today.getTime()) status = "Hari Ini";
          else if (d > today) status = "Mendatang";
          else status = "Selesai";
        }

        return {
          id: s.id,
          classroomId: cid,
          teacherId: s.teacherId || (s.teacher as any)?.id || "",
          startTime: s.startTime || "14:00",
          endTime: s.endTime || "14:45",
          dateKey,
          tanggal: new Date(dateKey).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          hari: new Date(dateKey).toLocaleDateString("id-ID", { weekday: "long" }),
          jam: `${s.startTime?.substring(0, 5) || "--"} - ${s.endTime?.substring(0, 5) || "--"}`,
          kelas: s.classroom?.name || "Kelas",
          guru: s.teacher?.name || (s.teacher as any)?.user?.name || "Guru",
          pertemuan: s.sessionNumber || 0,
          status,
          isRescheduled: !!s.isRescheduled,
          isProjected: false,
        };
      });

      // Proyeksi jadwal rutin mingguan untuk 60 hari ke depan
      const projectedList: any[] = [];
      rawSchedules.forEach((sc) => {
        const targetDay = DAY_INDEX_MAP[(sc.dayOfWeek || "").toLowerCase()];
        if (targetDay === undefined) return;
        const cid = sc.classroomId || sc.classroom?.id || "";
        const baseCount = sessionCountsByClass[cid] || 0;

        for (let offset = 0; offset <= 60; offset++) {
          const checkD = new Date(today);
          checkD.setDate(checkD.getDate() + offset);

          if (checkD.getDay() === targetDay) {
            const yyyy = checkD.getFullYear();
            const mm = String(checkD.getMonth() + 1).padStart(2, "0");
            const dd = String(checkD.getDate()).padStart(2, "0");
            const dateKey = `${yyyy}-${mm}-${dd}`;

            if (sc.effectiveFrom && sc.effectiveFrom > dateKey) continue;
            if (sc.effectiveUntil && sc.effectiveUntil < dateKey) continue;
            if (existingDates.has(`${cid}_${dateKey}`)) continue;

            const isToday = offset === 0;
            const status: "Hari Ini" | "Mendatang" = isToday ? "Hari Ini" : "Mendatang";
            const teacherName = sc.teacher?.name || (sc.teacher as any)?.user?.name || "Guru";

            projectedList.push({
              id: `sched-${sc.id}-${dateKey}`,
              realScheduleId: sc.id,
              classroomId: cid,
              teacherId: sc.teacherId,
              startTime: sc.startTime,
              endTime: sc.endTime,
              dateKey,
              tanggal: checkD.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
              hari: checkD.toLocaleDateString("id-ID", { weekday: "long" }),
              jam: `${sc.startTime?.substring(0, 5) || "--"} - ${sc.endTime?.substring(0, 5) || "--"}`,
              kelas: sc.classroom?.name || "Kelas",
              guru: teacherName,
              pertemuan: baseCount + Math.floor(offset / 7) + 1,
              status,
              isRescheduled: false,
              isProjected: true,
            });
          }
        }
      });

      const all = [...mappedList, ...projectedList].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      setSessions(all);
    } catch (e) {
      console.error("Gagal memuat agenda sesi:", e);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const schedRes = await getClassSchedules();
      setSchedules(schedRes);

      try {
        const [clsRes, tchrRes] = await Promise.allSettled([
          getClassrooms({ per_page: 100 }),
          getTeachers({ per_page: 100 }),
        ]);
        if (clsRes.status === "fulfilled") setClassrooms(clsRes.value.data);
        if (tchrRes.status === "fulfilled") setTeachers(tchrRes.value.data);
      } catch (subErr) {
        console.warn("Gagal memuat opsi kelas/guru:", subErr);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data jadwal rutin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler: Modal Rutin Satuan
  const handleOpenModal = (sched?: ClassSchedule) => {
    if (sched) {
      const effFrom = sched.effectiveFrom || "";
      const derivedDay = effFrom ? getDayOfWeekFromDate(effFrom) : (sched.dayOfWeek || "Monday");
      setEditingSchedule(sched);
      setFormData({
        classroom_id: sched.classroomId,
        teacher_id: sched.teacherId,
        day_of_week: derivedDay,
        start_time: sched.startTime.substring(0, 5),
        end_time: sched.endTime.substring(0, 5),
        effective_from: effFrom,
        effective_until: sched.effectiveUntil || "",
      });
    } else {
      const todayStr = new Date().toISOString().split("T")[0];
      setEditingSchedule(null);
      setFormData({
        classroom_id: classrooms[0]?.id || "",
        teacher_id: teachers[0]?.id || "",
        day_of_week: getDayOfWeekFromDate(todayStr),
        start_time: "14:00",
        end_time: "14:45",
        effective_from: todayStr,
        effective_until: "",
      });
    }
    setShowModal(true);
  };

  const handleEffectiveFromChange = (dateVal: string) => {
    const calculatedDay = getDayOfWeekFromDate(dateVal);
    setFormData((prev) => ({
      ...prev,
      effective_from: dateVal,
      day_of_week: calculatedDay,
    }));
  };

  const handleSave = async () => {
    if (!formData.classroom_id || !formData.teacher_id || !formData.start_time || !formData.end_time || !formData.effective_from) {
      showToast("Lengkapi semua kolom bertanda bintang.", "warning");
      return;
    }
    setSaving(true);
    try {
      const calculatedDay = getDayOfWeekFromDate(formData.effective_from);
      const payload = {
        ...formData,
        day_of_week: calculatedDay,
        effective_until: formData.effective_until || null,
      };

      if (editingSchedule) {
        await updateClassSchedule(editingSchedule.id, payload);
        showToast("Jadwal rutin berhasil diperbarui.", "success");
      } else {
        await createClassSchedule(payload);
        showToast("Jadwal rutin berhasil ditambahkan.", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan jadwal: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    setDeleting(true);
    try {
      await deleteClassSchedule(scheduleToDelete.id);
      showToast("Jadwal berhasil dihapus.", "success");
      setScheduleToDelete(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus jadwal: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setDeleting(false);
    }
  };

  // Generate Sesi Tunggal (Cara Lama)
  const handleGenerateSubmit = async () => {
    if (!scheduleToGenerate) return;
    if (!generateForm.start_date || !generateForm.total_sessions) {
      showToast("Lengkapi tanggal mulai dan jumlah pertemuan.", "warning");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateClassSessions(scheduleToGenerate.id, {
        total_sessions: Number(generateForm.total_sessions),
        start_date: generateForm.start_date,
      });
      const count = res?.sessions_count || 0;
      const skipped = res?.skipped_holidays?.length || 0;
      showToast(
        `Berhasil membuat ${count} sesi pertemuan resmi.${skipped > 0 ? ` (${skipped} hari libur dilewati)` : ""}`,
        "success"
      );
      setScheduleToGenerate(null);
      fetchData();
      if (activeTab === "agenda_sesi") fetchAgendaSessions();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal generate sesi: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setGenerating(false);
    }
  };

  // ── LOGIKA KALKULASI TANGGAL PERIODE (FITUR BARU) ──
  const calculatedPeriodDates = useMemo(() => {
    if (!periodForm.start_date || !periodForm.end_date || periodForm.selected_days.length === 0) {
      return [];
    }
    const start = new Date(periodForm.start_date);
    const end = new Date(periodForm.end_date);
    if (start > end) return [];

    const matched: string[] = [];
    const curr = new Date(start);
    curr.setHours(0, 0, 0, 0);

    const holidaySet = new Set(holidays);

    while (curr <= end) {
      const dayOfWeek = curr.getDay();
      if (periodForm.selected_days.includes(dayOfWeek)) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, "0");
        const dd = String(curr.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        if (!periodForm.skip_holidays || !holidaySet.has(dateStr)) {
          matched.push(dateStr);
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
    return matched;
  }, [periodForm.start_date, periodForm.end_date, periodForm.selected_days, periodForm.skip_holidays, holidays]);

  const handleOpenPeriodModal = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 28);
    const endStr = defaultEnd.toISOString().split("T")[0];

    setShowPeriodModal(true);
    setPeriodForm({
      classroom_id: classrooms[0]?.id || "",
      teacher_id: teachers[0]?.id || "",
      start_date: todayStr,
      end_date: endStr,
      selected_days: [1, 3, 5], // Senin, Rabu, Jumat
      start_time: "14:00",
      end_time: "14:45",
      skip_holidays: true,
      create_master_schedules: true,
    });
  };

  const handleDayToggle = (dayIdx: number) => {
    setPeriodForm((prev) => {
      const exists = prev.selected_days.includes(dayIdx);
      const updated = exists ? prev.selected_days.filter((d) => d !== dayIdx) : [...prev.selected_days, dayIdx].sort();
      return { ...prev, selected_days: updated };
    });
  };

  const handlePresetDays = (preset: "srj" | "sk" | "sen_jum" | "weekend") => {
    if (preset === "srj") setPeriodForm((p) => ({ ...p, selected_days: [1, 3, 5] }));
    else if (preset === "sk") setPeriodForm((p) => ({ ...p, selected_days: [2, 4] }));
    else if (preset === "sen_jum") setPeriodForm((p) => ({ ...p, selected_days: [1, 2, 3, 4, 5] }));
    else if (preset === "weekend") setPeriodForm((p) => ({ ...p, selected_days: [6, 0] }));
  };

  const handlePresetDuration = (minutes: number) => {
    setPeriodForm((p) => ({
      ...p,
      end_time: addMinutesToTime(p.start_time, minutes),
    }));
  };

  const handleGeneratePeriodSubmit = async () => {
    if (!periodForm.classroom_id || !periodForm.teacher_id) {
      showToast("Pilih kelas dan guru terlebih dahulu.", "warning");
      return;
    }
    if (calculatedPeriodDates.length === 0) {
      showToast("Tidak ada tanggal yang cocok dalam rentang dan pilihan hari tersebut.", "warning");
      return;
    }

    setGeneratingPeriod(true);
    let successCount = 0;
    let conflictCount = 0;

    try {
      // 1. Jika opsi buat master schedule dicentang, buatkan ClassSchedule untuk hari yang belum terdaftar
      if (periodForm.create_master_schedules) {
        for (const dayIdx of periodForm.selected_days) {
          const dayNameEn = DAY_NAMES_EN[dayIdx];
          const exists = schedules.some(
            (sc) => sc.classroomId === periodForm.classroom_id && sc.dayOfWeek?.toLowerCase() === dayNameEn.toLowerCase()
          );
          if (!exists) {
            try {
              await createClassSchedule({
                classroom_id: periodForm.classroom_id,
                teacher_id: periodForm.teacher_id,
                day_of_week: dayNameEn,
                start_time: periodForm.start_time,
                end_time: periodForm.end_time,
                effective_from: periodForm.start_date,
                effective_until: periodForm.end_date || null,
              });
            } catch (ignoreSchedErr) {
              console.warn("Jadwal master mungkin sudah ada atau bentrok:", ignoreSchedErr);
            }
          }
        }
      }

      // 2. Buat sesi aktual untuk setiap tanggal
      // Hitung sesi terakhir yang sudah ada untuk kelas ini agar urutannya berkesinambungan
      const existingInClass = sessions.filter(
        (s) => s.classroomId === periodForm.classroom_id && !s.isProjected
      );
      let baseNumber = existingInClass.reduce((max, s) => Math.max(max, s.pertemuan || 0), 0);

      for (const targetDate of calculatedPeriodDates) {
        baseNumber++;
        try {
          await createClassSession({
            classroom_id: periodForm.classroom_id,
            teacher_id: periodForm.teacher_id,
            session_number: baseNumber,
            session_date: targetDate,
            start_time: periodForm.start_time,
            end_time: periodForm.end_time,
            status: "scheduled",
          });
          successCount++;
        } catch (sessErr: any) {
          conflictCount++;
          console.warn(`Bentrok atau gagal pada ${targetDate}:`, sessErr?.response?.data?.message || sessErr.message);
        }
      }

      if (successCount > 0) {
        showToast(
          `Berhasil men-generate ${successCount} sesi pertemuan resmi!${conflictCount > 0 ? ` (${conflictCount} dilewati karena bentrok waktu)` : ""}`,
          "success"
        );
      } else {
        showToast(`Gagal membuat sesi. Semua ${conflictCount} tanggal terdeteksi bentrok dengan jadwal lain.`, "danger");
      }

      setShowPeriodModal(false);
      fetchData();
      fetchAgendaSessions();
    } catch (err: any) {
      console.error(err);
      showToast("Terjadi kesalahan saat generate sesi periode: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setGeneratingPeriod(false);
    }
  };

  // ── RESCHEDULE / GESER SESI HANDLER ──
  const handleOpenReschedule = (s: any) => {
    setSessionToReschedule(s);
    setRescheduleData({
      new_date: s.dateKey,
      new_start_time: s.startTime?.substring(0, 5) || "14:00",
      new_end_time: s.endTime?.substring(0, 5) || "14:45",
      new_teacher_id: s.teacherId || teachers[0]?.id || "",
    });
  };

  const handleSaveReschedule = async () => {
    if (!sessionToReschedule) return;
    if (!rescheduleData.new_date || !rescheduleData.new_start_time || !rescheduleData.new_end_time) {
      showToast("Lengkapi tanggal dan jam baru.", "warning");
      return;
    }

    setSavingReschedule(true);
    try {
      if (!sessionToReschedule.isProjected) {
        // Sesi resmi: panggil POST /class-sessions/{id}/reschedule
        await rescheduleClassSession(sessionToReschedule.id, {
          session_date: rescheduleData.new_date,
          start_time: rescheduleData.new_start_time,
          end_time: rescheduleData.new_end_time,
        });

        // Jika guru juga diganti, bisa update sesi
        if (rescheduleData.new_teacher_id && rescheduleData.new_teacher_id !== sessionToReschedule.teacherId) {
          try {
            await updateClassSession(sessionToReschedule.id, { status: "rescheduled" });
          } catch (_) {}
        }
      } else {
        // Sesi proyeksi: ubah menjadi sesi resmi baru di tanggal reschedule
        await createClassSession({
          classroom_id: sessionToReschedule.classroomId,
          teacher_id: rescheduleData.new_teacher_id || sessionToReschedule.teacherId,
          session_number: sessionToReschedule.pertemuan,
          session_date: rescheduleData.new_date,
          start_time: rescheduleData.new_start_time,
          end_time: rescheduleData.new_end_time,
          status: "rescheduled",
        });
      }

      showToast(`Jadwal sesi berhasil digeser ke ${rescheduleData.new_date} (${rescheduleData.new_start_time} - ${rescheduleData.new_end_time}).`, "success");
      setSessionToReschedule(null);
      fetchAgendaSessions();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      showToast("Gagal menggeser sesi: " + msg, "danger");
    } finally {
      setSavingReschedule(false);
    }
  };

  // ── HAPUS SESI AKTUAL HANDLER ──
  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeletingSession(true);
    try {
      if (!sessionToDelete.isProjected) {
        await deleteClassSession(sessionToDelete.id);
        showToast("Sesi berhasil dihapus.", "success");
      } else {
        showToast("Sesi proyeksi tidak perlu dihapus manual. Ubah jadwal rutin jika ingin menonaktifkannya.", "warning");
      }
      setSessionToDelete(null);
      fetchAgendaSessions();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus sesi: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setDeletingSession(false);
    }
  };

  // Filter Agenda Sesi
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (sessionFilter !== "Semua") {
        if (sessionFilter === "Di-reschedule" && !s.isRescheduled) return false;
        if (sessionFilter !== "Di-reschedule" && s.status !== sessionFilter) return false;
      }
      if (teacherFilter && s.teacherId !== teacherFilter) return false;
      if (classroomFilter && s.classroomId !== classroomFilter) return false;
      return true;
    });
  }, [sessions, sessionFilter, teacherFilter, classroomFilter]);

  if (loading && schedules.length === 0) return <div style={{ padding: 24 }}>Memuat jadwal...</div>;
  if (error) return <div style={{ padding: 24, color: "var(--color-danger)" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", width: "100%", paddingBottom: 40 }}>
      <Toast toast={toast} />

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Jadwal Guru & Sesi Kelas</h1>
          <p className="page-subtitle">
            Kelola master jadwal rutin, generate sesi multi-hari (5–30 Okt), dan geser (reschedule) jadwal guru secara fleksibel jika siswa berhalangan.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
            onClick={handleOpenPeriodModal}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Periode (Multi-Hari)
          </button>
          <button className="btn btn-outline" onClick={() => handleOpenModal()}>
            + Tambah Rutin Satuan
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 10 }}>
        <button
          onClick={() => setActiveTab("jadwal_rutin")}
          className={`btn ${activeTab === "jadwal_rutin" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Master Jadwal Rutin ({schedules.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("agenda_sesi");
            if (sessions.length === 0) fetchAgendaSessions();
          }}
          className={`btn ${activeTab === "agenda_sesi" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Agenda Sesi & Reschedule {sessions.length > 0 ? `(${sessions.length})` : ""}
        </button>
      </div>

      {/* ── TAB 1: MASTER JADWAL RUTIN ── */}
      {activeTab === "jadwal_rutin" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Hari & Jam</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kelas</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Guru Utama</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Masa Berlaku</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>
                      Belum ada master jadwal rutin. Klik <strong>"Generate Periode"</strong> atau <strong>"+ Tambah Rutin Satuan"</strong> untuk membuat jadwal baru.
                    </td>
                  </tr>
                ) : (
                  schedules.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < schedules.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 14 }}>
                          {DAYS[s.dayOfWeek as keyof typeof DAYS] || s.dayOfWeek}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                          {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--color-text-primary)" }}>{s.classroom?.name}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {(() => {
                          const teacherName = s.teacher?.name || (s.teacher as any)?.user?.name || teachers.find((t) => t.id === s.teacherId)?.name;
                          return (
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: teacherName ? "#0369a1" : "#64748b",
                                background: teacherName ? "#e0f2fe" : "#f1f5f9",
                                padding: "3px 10px",
                                borderRadius: 6,
                              }}
                            >
                              {teacherName || "Tanpa Guru"}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--color-text-muted)" }}>
                        Mulai: {s.effectiveFrom}
                        {s.effectiveUntil && <div>S/D: {s.effectiveUntil}</div>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: 11.5, padding: "4px 8px" }}
                            title="Generate sesi pertemuan resmi otomatis ke database (skip hari libur)"
                            onClick={() => {
                              setScheduleToGenerate(s);
                              setGenerateForm({
                                total_sessions: 8,
                                start_date: s.effectiveFrom || new Date().toISOString().split("T")[0],
                              });
                            }}
                          >
                            Generate Sesi
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(s)}>
                            Edit
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => setScheduleToDelete(s)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── TAB 2: AGENDA SESI & RESCHEDULE ── */
        <div>
          {/* BARIS FILTER GURU, KELAS & STATUS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              background: "#fff",
              padding: 14,
              borderRadius: 10,
              border: "1px solid var(--color-border-light)",
              marginBottom: 16,
            }}
          >
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Filter Guru</label>
              <select
                className="form-input"
                style={{ marginTop: 4, height: 38, fontSize: 13 }}
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              >
                <option value="">Semua Guru</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Filter Kelas</label>
              <select
                className="form-input"
                style={{ marginTop: 4, height: 38, fontSize: 13 }}
                value={classroomFilter}
                onChange={(e) => setClassroomFilter(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="btn btn-outline"
                style={{ height: 38, width: "100%", fontSize: 12.5 }}
                onClick={() => {
                  setTeacherFilter("");
                  setClassroomFilter("");
                  setSessionFilter("Semua");
                  fetchAgendaSessions();
                }}
              >
                Reset Filter & Segarkan
              </button>
            </div>
          </div>

          {/* Filter Status Pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {(["Semua", "Hari Ini", "Mendatang", "Di-reschedule", "Selesai"] as const).map((f) => {
              const count =
                f === "Semua"
                  ? sessions.length
                  : f === "Di-reschedule"
                  ? sessions.filter((s) => s.isRescheduled).length
                  : sessions.filter((s) => s.status === f).length;

              return (
                <button
                  key={f}
                  onClick={() => setSessionFilter(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "1.5px solid",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: sessionFilter === f ? "var(--color-primary)" : "#fff",
                    color: sessionFilter === f ? "#fff" : "var(--color-text-secondary)",
                    borderColor: sessionFilter === f ? "var(--color-primary)" : "var(--color-border)",
                  }}
                >
                  {f} ({count})
                </button>
              );
            })}
          </div>

          {loadingSessions ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)" }}>
              Memuat agenda sesi dan jadwal mendatang...
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 780, borderCollapse: "collapse", textAlign: "left" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                    <tr>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tanggal & Hari</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Jam</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kelas & Pertemuan</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Guru</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Aksi Penjadwalan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)", fontSize: 13 }}>
                          Tidak ada sesi yang cocok dengan filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((s, idx) => {
                        const isSelesai = s.status === "Selesai";
                        const isHariIni = s.status === "Hari Ini";
                        const isResched = s.isRescheduled || s.status === "Di-reschedule";

                        return (
                          <tr key={s.id + idx} style={{ borderBottom: idx < filteredSessions.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 13.5 }}>{s.tanggal}</div>
                              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{s.hari}</div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                              {s.jam}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 13.5 }}>{s.kelas}</div>
                              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                Pertemuan #{s.pertemuan}
                                {s.isProjected ? (
                                  <span style={{ fontSize: 10, background: "#f1f5f9", color: "#64748b", padding: "1px 6px", borderRadius: 4, marginLeft: 6 }}>Proyeksi</span>
                                ) : (
                                  <span style={{ fontSize: 10, background: "#ecfdf5", color: "#059669", padding: "1px 6px", borderRadius: 4, marginLeft: 6 }}>Resmi DB</span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 600 }}>
                              {s.guru}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {isResched ? (
                                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#fef3c7", color: "#b45309" }}>
                                  Di-reschedule
                                </span>
                              ) : isSelesai ? (
                                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#d1fae5", color: "#059669" }}>
                                  Selesai
                                </span>
                              ) : isHariIni ? (
                                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#dbeafe", color: "#1d4ed8" }}>
                                  Hari Ini
                                </span>
                              ) : (
                                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#e0f2fe", color: "#0284c7" }}>
                                  Mendatang
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{
                                    fontSize: 11.5,
                                    padding: "4px 10px",
                                    color: "#b45309",
                                    borderColor: "#fde68a",
                                    background: "#fffbeb",
                                    fontWeight: 700,
                                  }}
                                  title="Geser tanggal atau jam sesi ini ke waktu lain (tidak hangus)"
                                  onClick={() => handleOpenReschedule(s)}
                                >
                                  Geser / Reschedule
                                </button>
                                {!s.isProjected && (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontSize: 11, color: "var(--color-danger)", padding: "4px 8px" }}
                                    title="Hapus sesi jika dibatalkan/hangus"
                                    onClick={() => setSessionToDelete(s)}
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: GENERATE PERIODE MULTI-HARI (FITUR UTAMA BARU)
      ────────────────────────────────────────────────────────────── */}
      <Modal
        open={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        title="Generate Sesi Periode (Multi-Hari)"
        maxWidth={620}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af" }}>
            Fitur ini otomatis membuat sesi pertemuan di dalam rentang tanggal yang Anda pilih (misal: <strong>5 s/d 30 Oktober</strong>) khusus untuk hari yang Anda centang (misal: <strong>Senin, Rabu, Jumat</strong>).
          </div>

          {/* Pilih Kelas & Guru */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Kelas *</label>
              <SearchableSelect
                className="form-input"
                value={periodForm.classroom_id}
                onChange={(e) => {
                  const cid = e.target.value;
                  const cls = classrooms.find((c) => c.id === cid);
                  const defaultTeacherId = cls?.teachers?.[0]?.teacherId || teachers[0]?.id || "";
                  setPeriodForm({ ...periodForm, classroom_id: cid, teacher_id: defaultTeacherId });
                }}
              >
                <option value="">-- Pilih Kelas --</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SearchableSelect>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Guru Pengajar *</label>
              <SearchableSelect
                className="form-input"
                value={periodForm.teacher_id}
                onChange={(e) => setPeriodForm({ ...periodForm, teacher_id: e.target.value })}
              >
                <option value="">-- Pilih Guru --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </SearchableSelect>
            </div>
          </div>

          {/* Rentang Periode Tanggal */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Mulai Periode *</label>
              <input
                type="date"
                className="form-input"
                value={periodForm.start_date}
                onChange={(e) => setPeriodForm({ ...periodForm, start_date: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Selesai Periode *</label>
              <input
                type="date"
                className="form-input"
                value={periodForm.end_date}
                onChange={(e) => setPeriodForm({ ...periodForm, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Pola Hari (Preset & Checkbox) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Pola Hari Belajar *</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handlePresetDays("srj")}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  Sen-Rab-Jum (3x)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays("sk")}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  Sel-Kam (2x)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays("sen_jum")}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  Senin - Jumat (5x)
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 6 }}>
              {DAY_LIST.map((d) => {
                const active = periodForm.selected_days.includes(d.index);
                return (
                  <button
                    key={d.index}
                    type="button"
                    onClick={() => handleDayToggle(d.index)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1.5px solid",
                      background: active ? "var(--color-primary)" : "#fff",
                      color: active ? "#fff" : "var(--color-text-secondary)",
                      borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                      textAlign: "center",
                    }}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jam Belajar & Preset Durasi */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Jam Belajar *</label>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)", marginRight: 4 }}>Durasi Cepat:</span>
                <button
                  type="button"
                  onClick={() => handlePresetDuration(30)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  30 mnt
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDuration(45)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  45 mnt (AHE)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDuration(60)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
                >
                  60 mnt (English/Math)
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                type="time"
                className="form-input"
                value={periodForm.start_time}
                onChange={(e) => setPeriodForm({ ...periodForm, start_time: e.target.value })}
              />
              <input
                type="time"
                className="form-input"
                value={periodForm.end_time}
                onChange={(e) => setPeriodForm({ ...periodForm, end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Opsi Tambahan */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={periodForm.skip_holidays}
                onChange={(e) => setPeriodForm({ ...periodForm, skip_holidays: e.target.checked })}
              />
              <span>Lewati (Skip) Hari Libur Nasional secara otomatis</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={periodForm.create_master_schedules}
                onChange={(e) => setPeriodForm({ ...periodForm, create_master_schedules: e.target.checked })}
              />
              <span>Daftarkan juga ke Master Jadwal Rutin mingguan (Tab 1)</span>
            </label>
          </div>

          {/* Pratinjau Kalkulasi Sesi */}
          <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534" }}>
            Total Sesi Terhitung: <strong style={{ fontSize: 16 }}>{calculatedPeriodDates.length} Sesi Pertemuan</strong>
            <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
              Pada rentang {periodForm.start_date || "?"} s/d {periodForm.end_date || "?"}
              {calculatedPeriodDates.length > 0 && ` (dimulai ${calculatedPeriodDates[0]} sampai ${calculatedPeriodDates[calculatedPeriodDates.length - 1]})`}.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowPeriodModal(false)} disabled={generatingPeriod}>
              Batal
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleGeneratePeriodSubmit}
              disabled={generatingPeriod || calculatedPeriodDates.length === 0}
            >
              {generatingPeriod ? "Membuat Sesi..." : `Generate ${calculatedPeriodDates.length} Sesi Sekarang`}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RESCHEDULE / GESER JADWAL SESI (TIDAK HANGUS)
      ────────────────────────────────────────────────────────────── */}
      {sessionToReschedule && (
        <Modal
          open
          onClose={() => setSessionToReschedule(null)}
          title="Geser / Reschedule Jadwal Sesi"
          maxWidth={480}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#92400e" }}>
              <div>Kelas: <strong>{sessionToReschedule.kelas}</strong></div>
              <div>Guru: <strong>{sessionToReschedule.guru}</strong></div>
              <div>Pertemuan: <strong>Pertemuan #{sessionToReschedule.pertemuan}</strong></div>
              <div style={{ fontSize: 11.5, marginTop: 4, color: "#b45309" }}>
                Jadwal Awal: <strong>{sessionToReschedule.hari}, {sessionToReschedule.tanggal}</strong> ({sessionToReschedule.jam})
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Baru Reschedule *</label>
              <input
                type="date"
                className="form-input"
                value={rescheduleData.new_date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, new_date: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jam Mulai Baru *</label>
                <input
                  type="time"
                  className="form-input"
                  value={rescheduleData.new_start_time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, new_start_time: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jam Selesai Baru *</label>
                <input
                  type="time"
                  className="form-input"
                  value={rescheduleData.new_end_time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, new_end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Guru Pengajar (Bisa Ganti Guru Inval / Pengganti)</label>
              <select
                className="form-input"
                value={rescheduleData.new_teacher_id}
                onChange={(e) => setRescheduleData({ ...rescheduleData, new_teacher_id: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
              * Sistem akan memeriksa secara otomatis apakah guru atau ruangan bentrok di tanggal dan jam baru tersebut. Nomor pertemuan (#{sessionToReschedule.pertemuan}) tidak akan berubah.
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setSessionToReschedule(null)}
                disabled={savingReschedule}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: "#d97706", borderColor: "#b45309" }}
                onClick={handleSaveReschedule}
                disabled={savingReschedule}
              >
                {savingReschedule ? "Menyimpan..." : "Konfirmasi Geser Jadwal"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: HAPUS SESI AKTUAL
      ────────────────────────────────────────────────────────────── */}
      {sessionToDelete && (
        <Modal
          open
          onClose={() => setSessionToDelete(null)}
          title="Hapus / Batalkan Sesi"
          maxWidth={440}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Yakin ingin menghapus sesi <strong>{sessionToDelete.kelas}</strong> (Pertemuan #{sessionToDelete.pertemuan}) pada hari <strong>{sessionToDelete.hari}, {sessionToDelete.tanggal}</strong>?
            </p>
            <div style={{ fontSize: 12, color: "var(--color-danger)" }}>
              * Gunakan opsi ini jika pertemuan memang dibatalkan atau hangus. Jika pertemuan digeser ke hari lain, gunakan tombol <strong>"Geser / Reschedule"</strong>.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSessionToDelete(null)} disabled={deletingSession}>
                Batal
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmDeleteSession} disabled={deletingSession}>
                {deletingSession ? "Menghapus..." : "Hapus Sesi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FORM TAMBAH/EDIT JADWAL RUTIN SATUAN (EXISTING)
      ────────────────────────────────────────────────────────────── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingSchedule ? "Edit Jadwal Rutin" : "Tambah Jadwal Rutin"} maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Kelas *</label>
            <SearchableSelect className="form-input" value={formData.classroom_id} onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}>
              <option value="">-- Pilih Kelas --</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SearchableSelect>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Guru *</label>
            <SearchableSelect className="form-input" value={formData.teacher_id} onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}>
              <option value="">-- Pilih Guru --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </SearchableSelect>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jam Mulai *</label>
              <input type="time" className="form-input" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jam Selesai *</label>
              <input type="time" className="form-input" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Efektif Mulai *</label>
              <input
                type="date"
                className="form-input"
                value={formData.effective_from}
                onChange={(e) => handleEffectiveFromChange(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sampai Dengan (Opsional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.effective_until}
                onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
              />
            </div>
          </div>

          {/* Info Hari Rutin Otomatis */}
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#166534" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              Hari Rutin: <strong style={{ fontSize: 14 }}>{DAYS[formData.day_of_week] || formData.day_of_week}</strong>
              <span style={{ fontSize: 11.5, opacity: 0.85, display: "block", marginTop: 2 }}>
                Otomatis dihitung dari Tanggal Efektif Mulai ({formData.effective_from || "belum dipilih"})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>
              Batal
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: KONFIRMASI HAPUS JADWAL RUTIN (EXISTING)
      ────────────────────────────────────────────────────────────── */}
      {scheduleToDelete && (
        <Modal open onClose={() => setScheduleToDelete(null)} title="Hapus Jadwal Rutin" maxWidth={440}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Yakin ingin menghapus jadwal untuk kelas <strong>{scheduleToDelete.classroom?.name}</strong> pada hari{" "}
              <strong>{DAYS[scheduleToDelete.dayOfWeek as keyof typeof DAYS] || scheduleToDelete.dayOfWeek}</strong> ({scheduleToDelete.startTime?.substring(0, 5)} -{" "}
              {scheduleToDelete.endTime?.substring(0, 5)})?
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setScheduleToDelete(null)} disabled={deleting}>
                Batal
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? "Menghapus..." : "Hapus Jadwal"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: GENERATE SESI PER HITUNGAN (EXISTING)
      ────────────────────────────────────────────────────────────── */}
      {scheduleToGenerate && (
        <Modal open onClose={() => setScheduleToGenerate(null)} title="Generate Sesi Pertemuan Resmi" maxWidth={460}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#0369a1" }}>
              <div>Kelas: <strong>{scheduleToGenerate.classroom?.name}</strong></div>
              <div>Hari: <strong>{DAYS[scheduleToGenerate.dayOfWeek as keyof typeof DAYS] || scheduleToGenerate.dayOfWeek}</strong> ({scheduleToGenerate.startTime?.substring(0, 5)} - {scheduleToGenerate.endTime?.substring(0, 5)})</div>
              <div style={{ fontSize: 11.5, marginTop: 4, color: "#0284c7" }}>
                Sistem akan membuat sesi pertemuan resmi ke database otomatis setiap minggu dan melewati (skip) hari libur nasional.
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jumlah Pertemuan *</label>
              <select
                className="form-input"
                value={generateForm.total_sessions}
                onChange={(e) => setGenerateForm({ ...generateForm, total_sessions: Number(e.target.value) })}
              >
                <option value={8}>8 Pertemuan</option>
                <option value={12}>12 Pertemuan</option>
                <option value={4}>4 Pertemuan (Trial / Tambahan)</option>
                <option value={16}>16 Pertemuan</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Mulai Pertemuan *</label>
              <input
                type="date"
                className="form-input"
                value={generateForm.start_date}
                onChange={(e) => setGenerateForm({ ...generateForm, start_date: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setScheduleToGenerate(null)} disabled={generating}>
                Batal
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerateSubmit} disabled={generating}>
                {generating ? "Membuat Sesi..." : `Generate ${generateForm.total_sessions} Sesi`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
