"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getParents, createParent, updateParent, deleteParent, Parent, attachStudentToParent, detachStudentFromParent } from "@/lib/api/parents";
import { getStudents, Student } from "@/lib/api/students";
import { SkeletonTable } from "@/components/ui/Skeleton";

export default function AdminOrangTuaPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    relationship: "Orang Tua",
    address: "",
    student_id: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  // Detail / Attach Student State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachForm, setAttachForm] = useState({ student_id: "", relationship: "Orang Tua", is_primary: true });
  const [attaching, setAttaching] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parentsRes = await getParents({ per_page: 50 });
      setParents(parentsRes.data);

      try {
        const studentsRes = await getStudents({ per_page: 100 });
        setAllStudents(studentsRes.data);
      } catch (studentErr) {
        console.warn("Gagal memuat opsi siswa:", studentErr);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data orang tua.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (parent?: Parent) => {
    if (parent) {
      setEditingParent(parent);
      setFormData({
        name: parent.name,
        email: parent.email,
        phone: parent.phone || "",
        password: "", // Password dikosongkan saat edit, hanya diisi jika ingin diubah
        relationship: parent.relationship || "Orang Tua",
        address: parent.address || "",
        student_id: "",
        is_active: parent.isActive,
      });
    } else {
      setEditingParent(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        relationship: "Orang Tua",
        address: "",
        student_id: "",
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert("Nama dan Email wajib diisi!");
      return;
    }
    if (!editingParent && !formData.password) {
      alert("Password wajib diisi untuk pengguna baru!");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password || undefined,
        relationship: formData.relationship || null,
        address: formData.address || null,
        is_active: formData.is_active,
      };

      let parentId = editingParent?.id;
      if (editingParent) {
        await updateParent(editingParent.id, payload);
      } else {
        const newParent = await createParent(payload);
        parentId = newParent.id;
      }

      if (formData.student_id && parentId) {
        try {
          await attachStudentToParent(parentId, formData.student_id, formData.relationship || "Orang Tua", true);
        } catch(e) {
          console.error("Gagal mengaitkan siswa", e);
        }
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan data orang tua: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (parent: Parent, activate: boolean) => {
    const actionLabel = activate ? "mengaktifkan kembali" : "menonaktifkan";
    if (!confirm(`Yakin ingin ${actionLabel} akun orang tua "${parent.name}"?`)) return;
    try {
      if (activate) {
        await updateParent(parent.id, { is_active: true });
      } else {
        await deleteParent(parent.id);
      }
      fetchData();
    } catch (err: any) {
      alert(`Gagal ${actionLabel}: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: string) => {
    const parent = parents.find(p => p.id === id);
    if (parent) {
      handleToggleActive(parent, false);
    }
  };

  const handleDetail = (parent: Parent) => {
    setSelectedParent(parent);
    setShowDetailModal(true);
  };

  const handleAttachStudent = async () => {
    if (!selectedParent || !attachForm.student_id) return;
    setAttaching(true);
    try {
      await attachStudentToParent(selectedParent.id, attachForm.student_id, attachForm.relationship, attachForm.is_primary);
      setShowAttachModal(false);
      // Refresh data to show newly attached student
      await fetchData();
      
      // Update selected parent view locally if possible, or close detail and let user reopen
      // For simplicity, we just close the detail modal so it re-fetches when opened again
      setShowDetailModal(false); 
      alert("Siswa berhasil dikaitkan!");
    } catch (err: any) {
      alert("Gagal mengaitkan siswa: " + (err.response?.data?.message || err.message));
    } finally {
      setAttaching(false);
    }
  };

  const handleDetachStudent = async (studentId: string) => {
    if (!selectedParent) return;
    if (!confirm("Yakin ingin melepas kaitan siswa ini dari orang tua?")) return;
    try {
      await detachStudentFromParent(selectedParent.id, studentId);
      setShowDetailModal(false);
      fetchData();
      alert("Kaitan siswa berhasil dilepas.");
    } catch (err: any) {
      alert("Gagal melepas siswa: " + err.message);
    }
  };

  if (loading) return <SkeletonTable rows={5} cols={5} />;
  if (error) return <div className="p-6 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Orang Tua / Wali</h1>
          <p className="page-subtitle">Manajemen master data akun orang tua BSD After School Club</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Orang Tua</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kode</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Nama</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kontak</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Anak Terkait</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status Akun</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {parents.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada data orang tua.</td></tr>
              ) : (
                parents.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < parents.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{p.parentCode}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{p.name}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{p.email}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{p.phone}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {p.students.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {p.students.map(s => (
                            <span key={s.id} style={{ fontSize: 12, fontWeight: 600, color: "#0369a1", background: "#e0f2fe", padding: "2px 8px", borderRadius: 4, width: "max-content" }}>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: p.isActive ? "#d1fae5" : "#f1f5f9",
                        color: p.isActive ? "#059669" : "#64748b",
                        fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6
                      }}>{p.isActive ? "Aktif" : "Nonaktif"}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDetail(p)}>Detail</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(p)}>Edit</button>
                        {p.isActive ? (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleToggleActive(p, false)}>
                            Nonaktifkan
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ color: "#059669", fontWeight: 700 }} onClick={() => handleToggleActive(p, true)}>
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH/EDIT */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingParent ? "Edit Orang Tua" : "Tambah Akun Orang Tua Baru"} maxWidth={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Budi Santoso" />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email * (Digunakan untuk Login)</label>
              <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nomor WhatsApp</label>
              <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Cth: 08123456789" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hubungan dengan Siswa</label>
              <input className="form-input" value={formData.relationship} onChange={e => setFormData({ ...formData, relationship: e.target.value })} placeholder="Cth: Ayah / Ibu" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password {editingParent && "(Kosongkan jika tidak diubah)"}</label>
              <input type="password" className="form-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Minimal 8 karakter" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alamat Domisili</label>
            <textarea className="form-input" rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Masukkan alamat lengkap..." />
          </div>

          {editingParent && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status Keaktifan Akun</label>
              <select
                className="form-input"
                value={formData.is_active ? "1" : "0"}
                onChange={e => setFormData({ ...formData, is_active: e.target.value === "1" })}
              >
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
            <label className="form-label">{editingParent ? "Kaitkan dengan Anak Tambahan (Opsional)" : "Pilih Anak / Siswa (Opsional)"}</label>
            <select className="form-input" value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })}>
              <option value="">-- Pilih Siswa --</option>
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>
              ))}
            </select>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6, marginBottom: 0 }}>Anda bisa menautkannya belakangan lewat menu Detail Orang Tua.</p>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Data"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL DETAIL */}
      {selectedParent && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Orang Tua" maxWidth={600}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{selectedParent.parentCode}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedParent.name}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{selectedParent.email} • {selectedParent.phone}</div>
            </div>

            <div style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>Daftar Anak (Siswa)</div>
                <button className="btn btn-sm btn-outline" onClick={() => setShowAttachModal(true)}>+ Kaitkan Siswa</button>
              </div>
              
              {selectedParent.students.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>Belum ada siswa yang dikaitkan dengan akun ini.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedParent.students.map(s => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>Status Hubungan: <span style={{ fontWeight: 600 }}>{s.relation}</span> {s.isPrimary && <span style={{ color: "#059669", marginLeft: 4 }}>(Utama)</span>}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDetachStudent(s.id)}>Lepas Kaitan</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDetailModal(false)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL ATTACH STUDENT */}
      {showAttachModal && (
        <Modal open={showAttachModal} onClose={() => setShowAttachModal(false)} title="Kaitkan Siswa ke Orang Tua" maxWidth={400}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Siswa</label>
              <select className="form-input" value={attachForm.student_id} onChange={e => setAttachForm({ ...attachForm, student_id: e.target.value })}>
                <option value="">-- Pilih Siswa --</option>
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hubungan</label>
              <input className="form-input" value={attachForm.relationship} onChange={e => setAttachForm({ ...attachForm, relationship: e.target.value })} placeholder="Cth: Ayah / Ibu / Wali" />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <input type="checkbox" id="is_primary" checked={attachForm.is_primary} onChange={e => setAttachForm({ ...attachForm, is_primary: e.target.checked })} />
              <label htmlFor="is_primary" style={{ fontSize: 13, cursor: "pointer", fontWeight: 600, color: "var(--color-text-secondary)" }}>Tandai sebagai Kontak Utama</label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAttachModal(false)} disabled={attaching}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAttachStudent} disabled={attaching}>{attaching ? "Menyimpan..." : "Kaitkan"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
