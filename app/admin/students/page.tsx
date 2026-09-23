"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getStudents, createStudent, updateStudent, deleteStudent, Student } from "@/lib/api/students";
import { getParents, Parent, attachStudentToParent } from "@/lib/api/parents";
import { SkeletonTable } from "@/components/ui/Skeleton";

export default function AdminSiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    school_name: "",
    school_grade: "",
    address: "",
    status: "trial",
    parent_id: "", // For linking parent on creation
  });

  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, parentsRes] = await Promise.all([
        getStudents({ per_page: 50 }),
        getParents({ per_page: 100 })
      ]);
      setStudents(studentsRes.data);
      setParents(parentsRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data siswa/orang tua.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        full_name: student.name,
        birth_date: student.birthDate || "",
        school_name: student.schoolName || "",
        school_grade: student.schoolGrade || "",
        address: student.address || "",
        status: student.status,
        parent_id: "", // Reset parent ID for edit mode (unless we want to allow attaching from edit modal)
      });
    } else {
      setEditingStudent(null);
      setFormData({
        full_name: "",
        birth_date: "",
        school_name: "",
        school_grade: "",
        address: "",
        status: "trial",
        parent_id: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.full_name) {
      alert("Nama wajib diisi!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        full_name: formData.full_name,
        birth_date: formData.birth_date || null,
        school_name: formData.school_name || null,
        school_grade: formData.school_grade || null,
        address: formData.address || null,
        status: formData.status
      };

      if (editingStudent) {
        await updateStudent(editingStudent.id, payload);
        if (formData.parent_id) {
          try {
            await attachStudentToParent(formData.parent_id, editingStudent.id, "Orang Tua", true);
          } catch (e) {
            console.error("Parent already attached or error", e);
          }
        }
      } else {
        const newStudent = await createStudent(payload);
        
        // If parent selected, attach it immediately
        if (formData.parent_id) {
          await attachStudentToParent(formData.parent_id, newStudent.id, "Orang Tua", true);
        }
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan data siswa: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus / menonaktifkan siswa ini?")) return;
    try {
      await deleteStudent(id);
      fetchData();
    } catch (err: any) {
      alert("Gagal menonaktifkan: " + err.message);
    }
  };

  const handleDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  if (loading) return <SkeletonTable rows={5} cols={5} />;
  if (error) return <div className="p-6 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Siswa</h1>
          <p className="page-subtitle">Manajemen master data siswa BSD After School Club</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Siswa</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kode</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Nama Siswa</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Orang Tua</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Asal Sekolah</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada data siswa.</td></tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < students.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{s.studentCode}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{s.name}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {s.parents.length > 0 ? (
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{s.parents.map(p => p.name).join(", ")}</div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{s.schoolName || "-"}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{s.schoolGrade || "-"}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: s.status === "active" ? "#d1fae5" : s.status === "trial" ? "#fef3c7" : "#f1f5f9",
                        color: s.status === "active" ? "#059669" : s.status === "trial" ? "#d97706" : "#64748b",
                        fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6, textTransform: "capitalize"
                      }}>{s.status.replace("_", " ")}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDetail(s)}>Detail</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(s)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDelete(s.id)}>Nonaktifkan</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingStudent ? "Edit Siswa" : "Tambah Siswa Baru"} maxWidth={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Cth: Budi Santoso" />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal Lahir</label>
              <input type="date" className="form-input" value={formData.birth_date} onChange={e => setFormData({ ...formData, birth_date: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status Siswa</label>
              <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Asal Sekolah</label>
              <input className="form-input" value={formData.school_name} onChange={e => setFormData({ ...formData, school_name: e.target.value })} placeholder="Cth: SDN 01 Pagi" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tingkat Kelas (Sekolah)</label>
              <input className="form-input" value={formData.school_grade} onChange={e => setFormData({ ...formData, school_grade: e.target.value })} placeholder="Cth: 5 SD" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alamat Domisili</label>
            <textarea className="form-input" rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Masukkan alamat lengkap..." />
          </div>

          <div className="form-group" style={{ marginBottom: 0, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
            <label className="form-label">{editingStudent ? "Kaitkan dengan Orang Tua Lain (Opsional)" : "Pilih Orang Tua / Wali (Opsional)"}</label>
            <select className="form-input" value={formData.parent_id} onChange={e => setFormData({ ...formData, parent_id: e.target.value })}>
              <option value="">-- Pilih Orang Tua --</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6, marginBottom: 0 }}>Anda bisa menautkannya belakangan di halaman Orang Tua.</p>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Data Siswa"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL DETAIL */}
      {selectedStudent && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Siswa" maxWidth={500}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{selectedStudent.studentCode}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedStudent.name}</div>
              
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>🎂 {selectedStudent.birthDate || "-"}</span>
                <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>🏫 {selectedStudent.schoolName || "-"} ({selectedStudent.schoolGrade || "-"})</span>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Informasi Orang Tua</div>
              {selectedStudent.parents.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Belum ada orang tua yang dikaitkan.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedStudent.parents.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>{p.relationship} • {p.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Alamat Domisili</div>
              <p style={{ fontSize: 13.5, color: "#334155", margin: 0 }}>{selectedStudent.address || "-"}</p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDetailModal(false)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
