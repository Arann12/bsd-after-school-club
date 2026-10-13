"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { 
  getClassrooms, createClassroom, updateClassroom, deleteClassroom,
  assignTeacherToClassroom, removeTeacherFromClassroom,
  getPrograms, type Classroom, type Program, type ClassTeacher
} from "@/lib/api/academic";
import { getTeachers, type Teacher } from "@/lib/api/teachers";
import SearchableSelect from "@/components/ui/SearchableSelect";

export default function ClassesPage() {
  // Data State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Classroom Modal Form
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  
  // For hierarchical selection
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [formData, setFormData] = useState({
    program_level_id: "",
    name: "",
    capacity: 20,
    status: "active"
  });
  const [saving, setSaving] = useState(false);

  // Assign Teacher Modal Form
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    teacher_id: "",
    effective_from: new Date().toISOString().split("T")[0],
    role: "primary" as "primary" | "assistant"
  });
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clsRes = await getClassrooms({ per_page: 50 });
      setClassrooms(clsRes.data);

      try {
        const [progRes, tchrRes] = await Promise.allSettled([
          getPrograms({ per_page: 100 }),
          getTeachers({ per_page: 100 })
        ]);
        if (progRes.status === "fulfilled") setPrograms(progRes.value.data);
        if (tchrRes.status === "fulfilled") setTeachers(tchrRes.value.data);
      } catch (subErr) {
        console.warn("Gagal memuat opsi program/guru:", subErr);
      }

      // Refresh activeClassroom if modal is open
      if (activeClassroom) {
        const updated = clsRes.data.find(c => c.id === activeClassroom.id);
        if (updated) setActiveClassroom(updated);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  }, [activeClassroom]);

  useEffect(() => {
    fetchData();
  }, []); // Only fetch on mount

  // ==========================================
  // CLASSROOM HANDLERS
  // ==========================================
  const handleOpenModal = (classroom?: Classroom) => {
    if (classroom) {
      setEditingClass(classroom);
      setSelectedProgramId(classroom.programLevel?.programId || "");
      setFormData({
        program_level_id: classroom.programLevelId,
        name: classroom.name,
        capacity: classroom.capacity,
        status: classroom.status,
      });
    } else {
      setEditingClass(null);
      setSelectedProgramId("");
      setFormData({
        program_level_id: "",
        name: "",
        capacity: 20,
        status: "active"
      });
    }
    setShowModal(true);
  };

  const handleSaveClassroom = async () => {
    if (!formData.name || !formData.program_level_id) {
      return alert("Nama dan Level wajib diisi!");
    }
    setSaving(true);
    try {
      if (editingClass) {
        await updateClassroom(editingClass.id, formData);
      } else {
        await createClassroom(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan data kelas: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!confirm("Yakin ingin menonaktifkan kelas ini?")) return;
    try {
      await deleteClassroom(id);
      fetchData();
    } catch (err: any) {
      alert("Gagal menonaktifkan kelas.");
    }
  };

  // ==========================================
  // ASSIGN TEACHER HANDLERS
  // ==========================================
  const handleOpenTeacherModal = (classroom: Classroom) => {
    setActiveClassroom(classroom);
    setTeacherForm({
      teacher_id: "",
      effective_from: new Date().toISOString().split("T")[0],
      role: "primary"
    });
    setShowTeacherModal(true);
  };

  const handleAssignTeacher = async () => {
    if (!activeClassroom || !teacherForm.teacher_id) return alert("Pilih guru terlebih dahulu!");
    setAssigning(true);
    try {
      await assignTeacherToClassroom(activeClassroom.id, teacherForm);
      setTeacherForm({ ...teacherForm, teacher_id: "" });
      fetchData(); // Will refresh list and activeClassroom
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengassign guru: " + (err.response?.data?.message || err.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!activeClassroom) return;
    if (!confirm("Yakin ingin melepas guru ini dari kelas?")) return;
    try {
      await removeTeacherFromClassroom(activeClassroom.id, teacherId);
      fetchData();
    } catch (err: any) {
      alert("Gagal melepas guru.");
    }
  };

  // derived data for dropdowns
  const availableLevels = programs.find(p => p.id === selectedProgramId)?.levels || [];

  if (loading && classrooms.length === 0) return <div style={{ padding: 24 }}>Memuat data kelas...</div>;
  if (error) return <div style={{ padding: 24, color: "var(--color-danger)" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Manajemen Kelas</h1>
          <p className="page-subtitle">Kelola kelas belajar, penugasan guru, dan pantau kapasitas.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Buat Kelas Baru</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Kode / Nama Kelas</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Program & Level</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Guru Aktif</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Kapasitas</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada data kelas.</td></tr>
              ) : (
                classrooms.map((cls, i) => {
                  const activeTeachers = cls.teachers.filter(t => !t.effectiveUntil);
                  return (
                    <tr key={cls.id} style={{ borderBottom: i < classrooms.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{cls.classCode}</div>
                        <div style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 14 }}>{cls.name}</div>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: cls.status === 'active' ? "#d1fae5" : "#f1f5f9", color: cls.status === 'active' ? "#059669" : "#64748b" }}>
                          {cls.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{cls.programLevel?.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{programs.find(p => p.id === cls.programLevel?.programId)?.name || "-"}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {activeTeachers.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {activeTeachers.map(t => (
                              <span key={t.id} style={{ fontSize: 12, fontWeight: 600, color: t.role === 'primary' ? "#0369a1" : "#4f46e5", background: t.role === 'primary' ? "#e0f2fe" : "#e0e7ff", padding: "2px 8px", borderRadius: 4, width: "max-content" }}>
                                {t.name} ({t.role})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--color-danger)" }}>Belum Ada</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: cls.activeStudentsCount >= cls.capacity ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                          {cls.activeStudentsCount} / {cls.capacity} Siswa
                        </div>
                        <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: cls.activeStudentsCount >= cls.capacity ? "var(--color-danger)" : "#3b82f6", width: `${Math.min((cls.activeStudentsCount / cls.capacity) * 100, 100)}%` }}></div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <Link href={`/admin/pendaftaran`} className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>+ Siswa</Link>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenTeacherModal(cls)}>Assign Guru</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(cls)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDeleteClassroom(cls.id)}>Hapus</button>
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

      {/* MODAL KELAS */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingClass ? "Edit Kelas" : "Buat Kelas Baru"} maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Kelas *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Kelas A - Calistung" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Program *</label>
              <SearchableSelect className="form-input" value={selectedProgramId} onChange={e => { setSelectedProgramId(e.target.value); setFormData({ ...formData, program_level_id: "" }); }}>
                <option value="">-- Pilih Program --</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </SearchableSelect>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Level *</label>
              <SearchableSelect className="form-input" value={formData.program_level_id} onChange={e => setFormData({ ...formData, program_level_id: e.target.value })} disabled={!selectedProgramId}>
                <option value="">-- Pilih Level --</option>
                {availableLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </SearchableSelect>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kapasitas Maksimal</label>
              <input type="number" className="form-input" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} min={1} max={100} />
            </div>
            {editingClass && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <SearchableSelect className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </SearchableSelect>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveClassroom} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Data"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL ASSIGN GURU */}
      <Modal open={showTeacherModal} onClose={() => setShowTeacherModal(false)} title={`Assign Guru: ${activeClassroom?.name}`} maxWidth={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Daftar Guru Aktif */}
          <div>
            <h4 style={{ margin: "0 0 10px 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Guru yang Ditugaskan Saat Ini</h4>
            <div style={{ border: "1px solid var(--color-border-light)", borderRadius: 8, overflow: "hidden" }}>
              {(!activeClassroom?.teachers || activeClassroom.teachers.filter(t => !t.effectiveUntil).length === 0) ? (
                <div style={{ padding: 16, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>Belum ada guru aktif di kelas ini.</div>
              ) : (
                activeClassroom.teachers.filter(t => !t.effectiveUntil).map((t, i, arr) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Role: {t.role} • Sejak: {t.effectiveFrom}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleRemoveTeacher(t.teacherId)}>Lepaskan</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Assign Baru */}
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px dashed var(--color-border)" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--color-text-primary)" }}>Tugaskan Guru Baru</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Pilih Guru</label>
                <SearchableSelect className="form-input" value={teacherForm.teacher_id} onChange={e => setTeacherForm({ ...teacherForm, teacher_id: e.target.value })}>
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.teacherCode})</option>
                  ))}
                </SearchableSelect>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 12 }}>Role</label>
                  <SearchableSelect className="form-input" value={teacherForm.role} onChange={e => setTeacherForm({ ...teacherForm, role: e.target.value as "primary" | "assistant" })}>
                    <option value="primary">Primary (Guru Utama)</option>
                    <option value="assistant">Assistant (Asisten Guru)</option>
                  </SearchableSelect>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 12 }}>Efektif Mulai</label>
                  <input type="date" className="form-input" value={teacherForm.effective_from} onChange={e => setTeacherForm({ ...teacherForm, effective_from: e.target.value })} />
                </div>
              </div>
              <div style={{ marginTop: 6 }}>
                <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={handleAssignTeacher} disabled={assigning}>
                  {assigning ? "Menugaskan..." : "Tugaskan Guru Ini"}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </Modal>

    </div>
  );
}
