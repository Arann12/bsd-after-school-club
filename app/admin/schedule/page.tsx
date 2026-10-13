"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  getClassSchedules, createClassSchedule, updateClassSchedule, deleteClassSchedule,
  generateClassSessions, getClassSessions,
  getClassrooms,
  type ClassSchedule, type Classroom, type ClassSession
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

function getDayOfWeekFromDate(dateStr: string): string {
  if (!dateStr) return "Monday";
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return "Monday";
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return DAY_NAMES_EN[date.getDay()] || "Monday";
}

export default function SchedulePage() {
  const { toast, showToast } = useToast();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [formData, setFormData] = useState({
    classroom_id: "",
    teacher_id: "",
    day_of_week: "Monday",
    start_time: "15:00",
    end_time: "16:30",
    effective_from: new Date().toISOString().split("T")[0],
    effective_until: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete Confirm State
  const [scheduleToDelete, setScheduleToDelete] = useState<ClassSchedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tab & Agenda Sesi State
  const [activeTab, setActiveTab] = useState<"jadwal_rutin" | "agenda_sesi">("jadwal_rutin");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<"Semua" | "Hari Ini" | "Mendatang" | "Selesai">("Semua");

  // Generate Sessions State
  const [scheduleToGenerate, setScheduleToGenerate] = useState<ClassSchedule | null>(null);
  const [generateForm, setGenerateForm] = useState({ total_sessions: 8, start_date: "" });
  const [generating, setGenerating] = useState(false);

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
          sessionCountsByClass[cid] = (sessionCountsByClass[cid] || 0) + 1;
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingDates = new Set<string>();
      const mappedList = rawSessions.map((s) => {
        const dateKey = s.sessionDate?.split("T")[0] ?? "";
        const cid = s.classroomId || s.classroom?.id || "";
        existingDates.add(`${cid}_${dateKey}`);

        let status: "Hari Ini" | "Mendatang" | "Selesai" = "Mendatang";
        if (s.status === "completed") {
          status = "Selesai";
        } else {
          const d = new Date(dateKey); d.setHours(0, 0, 0, 0);
          if (d.getTime() === today.getTime()) status = "Hari Ini";
          else if (d > today) status = "Mendatang";
          else status = "Selesai";
        }

        return {
          id: s.id,
          dateKey,
          tanggal: new Date(dateKey).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          hari: new Date(dateKey).toLocaleDateString("id-ID", { weekday: "long" }),
          jam: `${s.startTime?.substring(0, 5) || "--"} - ${s.endTime?.substring(0, 5) || "--"}`,
          kelas: s.classroom?.name || "Kelas",
          guru: s.teacher?.name || (s.teacher as any)?.user?.name || "Guru",
          pertemuan: s.sessionNumber || 0,
          status,
          isProjected: false,
        };
      });

      // Proyeksi jadwal rutin mingguan untuk 60 hari ke depan
      const projectedList: any[] = [];
      const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
        minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6,
      };

      rawSchedules.forEach((sc) => {
        const targetDay = dayMap[(sc.dayOfWeek || "").toLowerCase()];
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
              dateKey,
              tanggal: checkD.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
              hari: checkD.toLocaleDateString("id-ID", { weekday: "long" }),
              jam: `${sc.startTime?.substring(0, 5) || "--"} - ${sc.endTime?.substring(0, 5) || "--"}`,
              kelas: sc.classroom?.name || "Kelas",
              guru: teacherName,
              pertemuan: baseCount + Math.floor(offset / 7) + 1,
              status,
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const schedRes = await getClassSchedules();
      setSchedules(schedRes);

      try {
        const [clsRes, tchrRes] = await Promise.allSettled([
          getClassrooms({ per_page: 100 }),
          getTeachers({ per_page: 100 })
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
        classroom_id: "",
        teacher_id: "",
        day_of_week: getDayOfWeekFromDate(todayStr),
        start_time: "15:00",
        end_time: "16:30",
        effective_from: todayStr,
        effective_until: "",
      });
    }
    setShowModal(true);
  };

  const handleEffectiveFromChange = (dateVal: string) => {
    const calculatedDay = getDayOfWeekFromDate(dateVal);
    setFormData(prev => ({
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
        effective_until: formData.effective_until || null
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

  if (loading && schedules.length === 0) return <div style={{ padding: 24 }}>Memuat jadwal...</div>;
  if (error) return <div style={{ padding: 24, color: "var(--color-danger)" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <Toast toast={toast} />

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Jadwal Kelas & Sesi</h1>
          <p className="page-subtitle">Master jadwal rutin mingguan dan pemantauan seluruh agenda sesi kelas (hari ini, mendatang, dan selesai).</p>
        </div>
        <div className="page-header-actions">
          {activeTab === "jadwal_rutin" ? (
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Jadwal</button>
          ) : (
            <button className="btn btn-outline" onClick={() => fetchAgendaSessions()}>Segarkan Agenda</button>
          )}
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
          Agenda Sesi & Mendatang {sessions.length > 0 ? `(${sessions.length})` : ""}
        </button>
      </div>

      {activeTab === "jadwal_rutin" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Hari & Jam</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Kelas</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Guru Utama</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Masa Berlaku</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada jadwal rutin.</td></tr>
                ) : (
                  schedules.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < schedules.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 14 }}>{DAYS[s.dayOfWeek as keyof typeof DAYS] || s.dayOfWeek}</div>
                        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--color-text-primary)" }}>{s.classroom?.name}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {(() => {
                          const teacherName = s.teacher?.name || (s.teacher as any)?.user?.name || teachers.find(t => t.id === s.teacherId)?.name;
                          return (
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: teacherName ? "#0369a1" : "#64748b",
                                background: teacherName ? "#e0f2fe" : "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: 4,
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
                          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(s)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => setScheduleToDelete(s)}>Hapus</button>
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
        /* AGENDA SESI & MENDATANG */
        <div>
          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {(["Semua", "Hari Ini", "Mendatang", "Selesai"] as const).map((f) => {
              const count = f === "Semua" ? sessions.length : sessions.filter(s => s.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setSessionFilter(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 999, border: "1.5px solid",
                    fontSize: 12.5, fontWeight: 700, cursor: "pointer",
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
                <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                    <tr>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tanggal & Hari</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Jam</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kelas & Pertemuan</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Guru</th>
                      <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const displayedSessions = sessionFilter === "Semua" ? sessions : sessions.filter(s => s.status === sessionFilter);
                      if (displayedSessions.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: 28, color: "var(--color-text-muted)", fontSize: 13 }}>
                              Tidak ada sesi dengan status "{sessionFilter}".
                            </td>
                          </tr>
                        );
                      }
                      return displayedSessions.map((s, idx) => {
                        const isSelesai = s.status === "Selesai";
                        const isHariIni = s.status === "Hari Ini";
                        return (
                          <tr key={s.id + idx} style={{ borderBottom: idx < displayedSessions.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 13.5 }}>{s.tanggal}</div>
                              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{s.hari}</div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                              {s.jam}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 13.5 }}>{s.kelas}</div>
                              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Pertemuan #{s.pertemuan}</div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                              {s.guru}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span
                                style={{
                                  fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
                                  background: isSelesai ? "#d1fae5" : isHariIni ? "#dbeafe" : "#e0f2fe",
                                  color: isSelesai ? "#059669" : isHariIni ? "#1d4ed8" : "#0284c7",
                                }}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL FORM TAMBAH/EDIT JADWAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingSchedule ? "Edit Jadwal" : "Tambah Jadwal Baru"} maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Kelas *</label>
            <SearchableSelect className="form-input" value={formData.classroom_id} onChange={e => setFormData({ ...formData, classroom_id: e.target.value })}>
              <option value="">-- Pilih Kelas --</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SearchableSelect>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Guru *</label>
            <SearchableSelect className="form-input" value={formData.teacher_id} onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}>
              <option value="">-- Pilih Guru --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </SearchableSelect>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jam Mulai *</label>
              <input type="time" className="form-input" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jam Selesai *</label>
              <input type="time" className="form-input" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Efektif Mulai *</label>
              <input
                type="date"
                className="form-input"
                value={formData.effective_from}
                onChange={e => handleEffectiveFromChange(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sampai Dengan (Opsional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.effective_until}
                onChange={e => setFormData({ ...formData, effective_until: e.target.value })}
              />
            </div>
          </div>

          {/* Info Hari Rutin Otomatis */}
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#166534" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              Hari Rutin: <strong style={{ fontSize: 14 }}>{DAYS[formData.day_of_week] || formData.day_of_week}</strong>
              <span style={{ fontSize: 11.5, opacity: 0.85, display: "block", marginTop: 2 }}>
                Otomatis dihitung dari Tanggal Efektif Mulai ({formData.effective_from || "belum dipilih"})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Jadwal"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS JADWAL */}
      {scheduleToDelete && (
        <Modal
          open
          onClose={() => setScheduleToDelete(null)}
          title="Hapus Jadwal Rutin"
          maxWidth={440}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Yakin ingin menghapus jadwal untuk kelas <strong>{scheduleToDelete.classroom?.name}</strong> pada hari <strong>{DAYS[scheduleToDelete.dayOfWeek as keyof typeof DAYS] || scheduleToDelete.dayOfWeek}</strong> ({scheduleToDelete.startTime?.substring(0, 5)} - {scheduleToDelete.endTime?.substring(0, 5)})?
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

      {/* MODAL GENERATE SESI PERTEMUAN */}
      {scheduleToGenerate && (
        <Modal
          open
          onClose={() => setScheduleToGenerate(null)}
          title="Generate Sesi Pertemuan Resmi"
          maxWidth={460}
        >
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
                onChange={e => setGenerateForm({ ...generateForm, total_sessions: Number(e.target.value) })}
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
                onChange={e => setGenerateForm({ ...generateForm, start_date: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setScheduleToGenerate(null)}
                disabled={generating}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleGenerateSubmit}
                disabled={generating}
              >
                {generating ? "Membuat Sesi..." : `Generate ${generateForm.total_sessions} Sesi`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
