"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getUsers, createUser, updateUser, deleteUser, UserItem } from "@/lib/api/users";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function OwnerKelolaAkunAdminPage() {
  const [listAdmin, setListAdmin] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cari, setCari] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<UserItem | null>(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string | number;
    name: string;
    email: string;
    phone: string;
    password: string;
    is_active: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ role: "admin", per_page: 100 });
      const raw = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setListAdmin(raw);
    } catch (err) {
      console.warn("Gagal memuat akun admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const terfilter = listAdmin.filter((a) => {
    const q = cari.toLowerCase();
    return (
      (a.name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.user_code || "").toLowerCase().includes(q)
    );
  });

  const handleTambah = async () => {
    if (!form.name || !form.email || !form.password) {
      setErrorMessage("Nama, email, dan password wajib diisi.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      await createUser({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: "admin",
        is_active: true,
      });
      setForm({ name: "", email: "", phone: "", password: "" });
      setShowTambahModal(false);
      await fetchAdmins();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Gagal membuat akun admin. Pastikan email belum terdaftar."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      await updateUser(editTarget.id, {
        name: editTarget.name,
        email: editTarget.email,
        phone: editTarget.phone || undefined,
        is_active: editTarget.is_active,
        password: editTarget.password ? editTarget.password : undefined,
      });
      setShowEditModal(false);
      setEditTarget(null);
      await fetchAdmins();
      if (selectedAdmin?.id === editTarget.id) {
        setSelectedAdmin(null);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Gagal memperbarui akun admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapus = async (id: string | number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus akun admin ini?")) return;
    try {
      await deleteUser(id);
      setSelectedAdmin(null);
      await fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus akun admin.");
    }
  };

  const openEdit = (a: UserItem) => {
    setEditTarget({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone || "",
      password: "",
      is_active: Boolean(a.is_active),
    });
    setErrorMessage("");
    setShowEditModal(true);
  };

  const totalAdmin = listAdmin.length;
  const activeAdmin = listAdmin.filter((a) => Boolean(a.is_active)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Akun Admin</h1>
          <p className="page-subtitle">
            Buat, lihat, dan kelola akun staf administrasi yang memiliki akses ke panel operasional.
          </p>
        </div>
        <button
          className="btn btn-accent"
          onClick={() => {
            setErrorMessage("");
            setShowTambahModal(true);
          }}
        >
          + Tambah Admin Baru
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">Total Akun Admin</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: "#1d4ed8" }}>
              {totalAdmin}
            </div>
          </div>
          <div className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">Admin Aktif</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: "#059669" }}>
              {activeAdmin}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              style={{ paddingLeft: 42, width: "100%", fontSize: 14 }}
              placeholder="Cari nama, email, atau kode admin..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <SkeletonTable rows={4} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["Kode", "Nama Admin", "Email / No. WA", "Status", "Terdaftar", "Aksi"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terfilter.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-text-muted)", fontSize: 14 }}>
                      Belum ada data admin terdaftar.
                    </td>
                  </tr>
                ) : (
                  terfilter.map((a, i) => {
                    const isActive = Boolean(a.is_active);
                    const formattedDate = a.created_at
                      ? new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";

                    return (
                      <tr
                        key={a.id}
                        className="row-hover"
                        style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }}
                        onClick={() => setSelectedAdmin(a)}
                      >
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>
                          {a.user_code || `ADM-${a.id}`}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: "#dbeafe",
                                color: "#1d4ed8",
                                fontWeight: 800,
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {(a.name || "A")[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>
                              {a.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                          <div>{a.email}</div>
                          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{a.phone || "-"}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              background: isActive ? "#d1fae5" : "#f1f5f9",
                              color: isActive ? "#059669" : "#64748b",
                              fontSize: 11.5,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 999,
                            }}
                          >
                            {isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                          {formattedDate}
                        </td>
                        <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedAdmin(a)}>
                              Detail
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selectedAdmin && (
        <Modal open onClose={() => setSelectedAdmin(null)} title="Detail Akun Admin" maxWidth={480}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "#1d4ed8",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {(selectedAdmin.name || "A")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)" }}>
                  {selectedAdmin.name}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {selectedAdmin.user_code || `ADM-${selectedAdmin.id}`} · Role: Staf Administrasi
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { label: "Status", value: selectedAdmin.is_active ? "Aktif" : "Nonaktif" },
                { label: "Email", value: selectedAdmin.email },
                { label: "No. Telepon / WA", value: selectedAdmin.phone || "-" },
                {
                  label: "Tanggal Terdaftar",
                  value: selectedAdmin.created_at
                    ? new Date(selectedAdmin.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-",
                },
              ].map((f) => (
                <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                    {f.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: f.label === "Status" && f.value === "Aktif" ? "#059669" : "var(--color-text-primary)",
                    }}
                  >
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedAdmin(null)}>
                Tutup
              </button>
              <button className="btn btn-outline" onClick={() => openEdit(selectedAdmin)}>
                Edit
              </button>
              <button
                className="btn"
                style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}
                onClick={() => handleHapus(selectedAdmin.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tambah */}
      <Modal open={showTambahModal} onClose={() => setShowTambahModal(false)} title="Tambah Admin Baru" maxWidth={480}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {errorMessage && (
            <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, fontSize: 13 }}>
              {errorMessage}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Lengkap</label>
            <input
              className="form-input"
              placeholder="Contoh: Rina Wulandari"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@bsdafterschool.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. WhatsApp</label>
              <input
                className="form-input"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password Sementara</label>
            <input
              className="form-input"
              type="password"
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowTambahModal(false)} disabled={submitting}>
              Batal
            </button>
            <button className="btn btn-accent" onClick={handleTambah} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Admin"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Edit */}
      {editTarget && (
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Akun Admin" maxWidth={480}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {errorMessage && (
              <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, fontSize: 13 }}>
                {errorMessage}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap</label>
              <input
                className="form-input"
                value={editTarget.name}
                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={editTarget.email}
                  onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">No. WhatsApp</label>
                <input
                  className="form-input"
                  value={editTarget.phone}
                  onChange={(e) => setEditTarget({ ...editTarget, phone: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password Baru (Opsional)</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Kosongkan jika tidak diubah"
                  value={editTarget.password}
                  onChange={(e) => setEditTarget({ ...editTarget, password: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status Akun</label>
                <select
                  className="form-input"
                  value={editTarget.is_active ? "1" : "0"}
                  onChange={(e) => setEditTarget({ ...editTarget, is_active: e.target.value === "1" })}
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)} disabled={submitting}>
                Batal
              </button>
              <button className="btn btn-accent" onClick={handleEdit} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
