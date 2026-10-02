"use client";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useCountUp } from "@/lib/hooks";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getStudents, createStudent, updateStudent, deleteStudent, Student } from "@/lib/api/students";
import { getParents, Parent, attachStudentToParent } from "@/lib/api/parents";

export default function OwnerSiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");

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
    parent_id: "",
  });

  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const studentsRes = await getStudents({ per_page: 100 });
      setStudents(studentsRes.data);

      try {
        const parentsRes = await getParents({ per_page: 100 });
        setParents(parentsRes.data);
      } catch (parentErr) {
        console.warn("Gagal memuat opsi orang tua:", parentErr);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Modals Handlers
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
        parent_id: "", 
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
    if (!formData.full_name) return alert("Nama wajib diisi!");
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
          try { await attachStudentToParent(formData.parent_id, editingStudent.id, "Orang Tua", true); } 
          catch (e) { console.error("Parent already attached or error", e); }
        }
      } else {
        const newStudent = await createStudent(payload);
        if (formData.parent_id) {
          await attachStudentToParent(formData.parent_id, newStudent.id, "Orang Tua", true);
        }
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus siswa ini?")) return;
    try {
      const res = await deleteStudent(id);
      if (res?.message) {
        alert(res.message);
      }
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus siswa: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // Stats calculation
  const active = students.filter(s => s.status === "active").length;
  // Note: Tagihan is not currently in the Student API, using 0 for now to keep the UI intact
  const lunas = 0; 
  const belumBayar = 0;

  const countTotal = useCountUp(students.length);
  const countActive = useCountUp(active);
  const countLunas = useCountUp(lunas);
  const countBelumBayar = useCountUp(belumBayar);

  // Filter for DataTable
  const filtered = students.filter(s => {
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    // Program doesn't exist on API Student yet, so bypass program filter for now
    const matchProgram = filterProgram === "Semua" || true; 
    return matchStatus && matchProgram;
  });

  const columns: Column<Student>[] = [
    { key: "studentCode", label: "ID", searchable: true, render: r => <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--color-text-muted)" }}>{r.studentCode}</span> },
    { key: "name", label: "Nama Siswa", searchable: true, flex: 2, render: r => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary-bg)", color: "var(--color-primary)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.name[0]?.toUpperCase()}</div>
        <div>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)", display: "block" }}>{r.name}</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>- Sesi</span>
        </div>
      </div>
    )},
    { key: "parent", label: "Orang Tua", render: r => (
      r.parents && r.parents.length > 0 ? (
        <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{r.parents.map(p => p.name).join(", ")}</span>
      ) : <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>-</span>
    )},
    { key: "program", label: "Sekolah", render: r => (
      <div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{r.schoolName || "-"}</div>
        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{r.schoolGrade || "-"}</div>
      </div>
    )},
    { key: "status", label: "Status", render: r => (
      <span style={{
        background: r.status === "active" ? "#d1fae5" : r.status === "trial" ? "#fef3c7" : "#f1f5f9",
        color: r.status === "active" ? "#059669" : r.status === "trial" ? "#d97706" : "#64748b",
        fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6, textTransform: "capitalize"
      }}>{r.status.replace("_", " ")}</span>
    )},
    { key: "aksi", label: "Aksi", render: r => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => handleDetail(r)}>Detail</button>
        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(r)}>Edit</button>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDelete(r.id)}>Hapus</button>
      </div>
    )}
  ];

  if (loading) return <SkeletonTable rows={8} cols={7} />;

  if (error) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--color-danger)" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>Gagal Memuat Data Siswa</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{error}</div>
        <button className="btn btn-primary" onClick={fetchData}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Data Siswa"
        subtitle="Ringkasan data siswa aktif di semua program."
        actions={
          <button className="btn btn-accent" onClick={() => handleOpenModal()}>+ Pendaftaran Baru</button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Total Siswa" value={countTotal} color="#1d4ed8" bg="var(--color-info-bg)" />
        <StatCard label="Siswa Aktif" value={countActive} detail={students.length > 0 ? `${Math.round(active/students.length*100)}% dari total` : "0% dari total"} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Lunas SPP" value={countLunas} detail="Menunggu integrasi API" color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Belum Bayar" value={countBelumBayar} detail="Menunggu integrasi API" color="var(--color-danger)" bg="var(--color-danger-bg)" />
      </div>

      <DataTable<Student>
        columns={columns}
        data={filtered}
        rowKey={r => r.id}
        searchPlaceholder="Cari nama siswa, ortu, atau ID..."
        filters={[
          { label: "Status", values: ["Semua", "trial", "active", "on_leave", "inactive", "graduated"] }
        ]}
        filterValues={{ Status: filterStatus }}
        onFilterChange={(key, val) => {
          if (key === "Status") setFilterStatus(val);
        }}
      />

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
              
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Lahir: {selectedStudent.birthDate || "-"}
                </span>
                <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {selectedStudent.schoolName || "-"} ({selectedStudent.schoolGrade || "-"})
                </span>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Informasi Orang Tua</div>
              {selectedStudent.parents && selectedStudent.parents.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Belum ada orang tua yang dikaitkan.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedStudent.parents?.map(p => (
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
