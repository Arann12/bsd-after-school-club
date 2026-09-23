"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { 
  getClassSchedules, createClassSchedule, updateClassSchedule, deleteClassSchedule, generateClassSessions,
  getClassrooms,
  type ClassSchedule, type Classroom
} from "@/lib/api/academic";
import { getTeachers, type Teacher } from "@/lib/api/teachers";

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

  // Generate Sessions State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<ClassSchedule | null>(null);
  const [generateForm, setGenerateForm] = useState({
    start_date: new Date().toISOString().split("T")[0],
    total_sessions: 12
  });
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, clsRes, tchrRes] = await Promise.all([
        getClassSchedules(),
        getClassrooms({ per_page: 100 }),
        getTeachers({ per_page: 100 })
      ]);
      setSchedules(schedRes);
      setClassrooms(clsRes.data);
      setTeachers(tchrRes.data);
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
      setEditingSchedule(sched);
      setFormData({
        classroom_id: sched.classroomId,
        teacher_id: sched.teacherId,
        day_of_week: sched.dayOfWeek,
        start_time: sched.startTime.substring(0, 5), // Format HH:mm
        end_time: sched.endTime.substring(0, 5),
        effective_from: sched.effectiveFrom,
        effective_until: sched.effectiveUntil || "",
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        classroom_id: "",
        teacher_id: "",
        day_of_week: "Monday",
        start_time: "15:00",
        end_time: "16:30",
        effective_from: new Date().toISOString().split("T")[0],
        effective_until: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.classroom_id || !formData.teacher_id || !formData.start_time || !formData.end_time || !formData.effective_from) {
      return alert("Semua field wajib diisi kecuali Effective Until.");
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
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

  const handleOpenGenerate = (sched: ClassSchedule) => {
    setActiveSchedule(sched);
    setGenerateResult(null);
    setGenerateForm({
      start_date: new Date().toISOString().split("T")[0],
      total_sessions: 12
    });
    setShowGenerateModal(true);
  };

  const handleGenerate = async () => {
    if (!activeSchedule) return;
    if (generateForm.total_sessions < 1 || generateForm.total_sessions > 50) {
      return alert("Jumlah sesi harus antara 1 sampai 50.");
    }
    
    setGenerating(true);
    setGenerateResult(null);
    try {
      const res = await generateClassSessions(activeSchedule.id, generateForm);
      setGenerateResult(res);
    } catch (err: any) {
      console.error(err);
      alert("Gagal generate sesi: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Rutin Mingguan</h1>
          <p style={{ color: "var(--color-text-secondary)", margin: "4px 0 0 0", fontSize: 14 }}>Kelola master jadwal dan otomatisasi generate kalender sesi kelas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Jadwal</button>
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
                      <button className="btn btn-primary btn-sm" onClick={() => handleOpenGenerate(s)}>Generate Sesi</button>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hari *</label>
              <select className="form-input" value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })}>
                {Object.entries(DAYS).map(([eng, idn]) => <option key={eng} value={eng}>{idn}</option>)}
              </select>
            </div>
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
              <label className="form-label">Efektif Mulai *</label>
              <input type="date" className="form-input" value={formData.effective_from} onChange={e => setFormData({ ...formData, effective_from: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sampai Dengan (Opsional)</label>
              <input type="date" className="form-input" value={formData.effective_until} onChange={e => setFormData({ ...formData, effective_until: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Jadwal"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL GENERATE SESI */}
      <Modal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Sesi Absensi" maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "var(--color-text-secondary)" }}>
            Sistem akan secara otomatis membuatkan sesi absensi nyata di kalender berdasarkan templat jadwal ini. Hari libur (Holidays) atau jadwal yang bentrok akan dilompati (di-skip).
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tgl. Mulai Sesi Pertama</label>
              <input type="date" className="form-input" value={generateForm.start_date} onChange={e => setGenerateForm({ ...generateForm, start_date: e.target.value })} disabled={generating} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jumlah Sesi (Max 50)</label>
              <input type="number" className="form-input" value={generateForm.total_sessions} onChange={e => setGenerateForm({ ...generateForm, total_sessions: parseInt(e.target.value) || 0 })} min={1} max={50} disabled={generating} />
            </div>
          </div>

          {generateResult && (
            <div style={{ padding: 16, background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8 }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: 14 }}>Generate Selesai!</h4>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "#166534" }}>
                <li><strong>{generateResult.sessions_count}</strong> Sesi berhasil dibuat.</li>
                {generateResult.skipped_holidays?.length > 0 && (
                  <li><strong>{generateResult.skipped_holidays.length}</strong> sesi dilewati karena bentrok dengan Hari Libur.</li>
                )}
                {generateResult.skipped_conflicts?.length > 0 && (
                  <li><strong>{generateResult.skipped_conflicts.length}</strong> sesi dilewati karena bentrok jadwal guru/ruangan.</li>
                )}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowGenerateModal(false)} disabled={generating}>{generateResult ? "Tutup" : "Batal"}</button>
            {!generateResult && (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate} disabled={generating}>{generating ? "Memproses..." : "Generate Sekarang"}</button>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
}
