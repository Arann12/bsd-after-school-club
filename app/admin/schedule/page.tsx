"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import {
  getClassSchedules, createClassSchedule, updateClassSchedule, deleteClassSchedule,
  getClassrooms,
  type ClassSchedule, type Classroom
} from "@/lib/api/academic";
import { getTeachers, type Teacher } from "@/lib/api/teachers";

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
        start_time: sched.startTime.substring(0, 5), // Format HH:mm
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
      return alert("Semua field wajib diisi kecuali Effective Until.");
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
      } else {
        await createClassSchedule(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan jadwal: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      await deleteClassSchedule(id);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus jadwal.");
    }
  };

  const DAYS = {
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
    Sunday: "Minggu"
  };

  if (loading && schedules.length === 0) return <div style={{ padding: 24 }}>Memuat jadwal...</div>;
  if (error) return <div style={{ padding: 24, color: "var(--color-danger)" }}>{error}</div>;

  return (
    <div style={{ padding: "16px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Jadwal Rutin Mingguan</h1>
          <p className="page-subtitle">Kelola master jadwal kelas mingguan. Sesi absensi dan pertemuan otomatis dibuat saat siswa didaftarkan.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Jadwal</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
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
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada jadwal.</td></tr>
            ) : (
              schedules.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < schedules.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 14 }}>{DAYS[s.dayOfWeek as keyof typeof DAYS]}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--color-text-primary)" }}>{s.classroom?.name}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0369a1", background: "#e0f2fe", padding: "2px 8px", borderRadius: 4 }}>
                      {s.teacher?.name || "Tanpa Guru"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--color-text-muted)" }}>
                    Mulai: {s.effectiveFrom}
                    {s.effectiveUntil && <div>S/D: {s.effectiveUntil}</div>}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(s)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDelete(s.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM TAMBAH/EDIT */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingSchedule ? "Edit Jadwal" : "Tambah Jadwal Baru"} maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Kelas *</label>
            <select className="form-input" value={formData.classroom_id} onChange={e => setFormData({ ...formData, classroom_id: e.target.value })}>
              <option value="">-- Pilih Kelas --</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Guru *</label>
            <select className="form-input" value={formData.teacher_id} onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}>
              <option value="">-- Pilih Guru --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jam Mulai *</label>
              <input type="time" className="form-input" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jam Selesai *</label>
              <input type="time" className="form-input" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

          {/* Info Badge Hari Terhitung Otomatis */}
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#166534" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              Hari Rutin: <strong style={{ fontSize: 14 }}>{(DAYS as Record<string, string>)[formData.day_of_week] || formData.day_of_week}</strong>
              <span style={{ fontSize: 11.5, opacity: 0.85, display: "block", marginTop: 2 }}>
                Otomatis ditentukan berdasarkan Tanggal Efektif Mulai ({formData.effective_from || "belum dipilih"})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Jadwal"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
