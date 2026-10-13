"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, Teacher } from "@/lib/api/teachers";
import { SkeletonTable } from "@/components/ui/Skeleton";
import SearchableSelect from "@/components/ui/SearchableSelect";

export default function AdminGuruPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeachers({ per_page: 50 });
      setTeachers(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data guru.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || "",
        password: "", // Password dikosongkan saat edit, diisi hanya jika mau ganti password
        bank_name: teacher.bankName || "",
        bank_account_name: teacher.bankAccountName || "",
        bank_account_number: teacher.bankAccountNumber || "",
        is_active: teacher.isActive,
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        bank_name: "",
        bank_account_name: "",
        bank_account_number: "",
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
    if (!editingTeacher && !formData.password) {
      alert("Password wajib diisi untuk pengguna baru!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password || undefined,
        bank_name: formData.bank_name || null,
        bank_account_name: formData.bank_account_name || null,
        bank_account_number: formData.bank_account_number || null,
        is_active: formData.is_active,
      };

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, payload);
      } else {
        await createTeacher(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan data guru: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (teacher: Teacher, activate: boolean) => {
    const actionLabel = activate ? "mengaktifkan kembali" : "menonaktifkan";
    if (!confirm(`Yakin ingin ${actionLabel} akun guru "${teacher.name}"?`)) return;
    try {
      if (activate) {
        await updateTeacher(teacher.id, { is_active: true });
      } else {
        await deleteTeacher(teacher.id);
      }
      fetchData();
    } catch (err: any) {
      alert(`Gagal ${actionLabel}: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
      handleToggleActive(teacher, false);
    }
  };

  const handleDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  if (loading) return <SkeletonTable rows={5} cols={5} />;
  if (error) return <div className="p-6 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Guru / Staff</h1>
          <p className="page-subtitle">Manajemen master data akun guru BSD After School Club</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Guru</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Kode</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Nama</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Kontak</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Informasi Bank</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada data guru.</td></tr>
              ) : (
                teachers.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < teachers.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{t.teacherCode}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{t.name}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{t.email}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{t.phone}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {t.bankName ? (
                        <>
                          <div style={{ fontSize: 12.5, color: "#334155", fontWeight: 700 }}>{t.bankName}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{t.bankAccountNumber}</div>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Belum diatur</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: t.isActive ? "#d1fae5" : "#f1f5f9",
                        color: t.isActive ? "#059669" : "#64748b",
                        fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6
                      }}>{t.isActive ? "Aktif" : "Nonaktif"}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDetail(t)}>Detail</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(t)}>Edit</button>
                        {t.isActive ? (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleToggleActive(t, false)}>
                            Nonaktifkan
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ color: "#059669", fontWeight: 700 }} onClick={() => handleToggleActive(t, true)}>
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
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingTeacher ? "Edit Guru" : "Tambah Akun Guru Baru"} maxWidth={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Siti Aminah" />
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
              <label className="form-label">Nama Bank</label>
              <input className="form-input" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} placeholder="Cth: BCA / BNI / Mandiri" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nomor Rekening</label>
              <input className="form-input" value={formData.bank_account_number} onChange={e => setFormData({ ...formData, bank_account_number: e.target.value })} placeholder="Masukkan no rekening" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Pemilik Rekening</label>
            <input className="form-input" value={formData.bank_account_name} onChange={e => setFormData({ ...formData, bank_account_name: e.target.value })} placeholder="Sesuai buku tabungan" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password {editingTeacher && "(Kosongkan jika tidak diubah)"}</label>
            <input type="password" className="form-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Minimal 8 karakter" />
          </div>

          {editingTeacher && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status Keaktifan Akun</label>
              <SearchableSelect
                className="form-input"
                value={formData.is_active ? "1" : "0"}
                onChange={e => setFormData({ ...formData, is_active: e.target.value === "1" })}
              >
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </SearchableSelect>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Data"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL DETAIL */}
      {selectedTeacher && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Guru" maxWidth={450}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{selectedTeacher.teacherCode}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedTeacher.name}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{selectedTeacher.email} • {selectedTeacher.phone}</div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Informasi Bank (Honor)</div>
              {selectedTeacher.bankName ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{selectedTeacher.bankName}</div>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>No. Rek: <span style={{ fontWeight: 600 }}>{selectedTeacher.bankAccountNumber}</span></div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>A/N: {selectedTeacher.bankAccountName}</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Informasi rekening bank belum dilengkapi.</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDetailModal(false)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
