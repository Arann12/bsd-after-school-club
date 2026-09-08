"use client";
import { useState } from "react";

export interface Admin {
  id: string;
  nama: string;
  email: string;
  hp: string;
  username: string;
  status: "Aktif" | "Nonaktif";
  tglDibuat: string;
}

const daftarAdmin: Admin[] = [
  {
    id: "ADM-001",
    nama: "Rina Wulandari",
    email: "rina@bsdafterschool.com",
    hp: "081234000111",
    username: "rina_admin",
    status: "Aktif",
    tglDibuat: "15 Jan 2026",
  },
  {
    id: "ADM-002",
    nama: "Dedi Kurniawan",
    email: "dedi@bsdafterschool.com",
    hp: "081356000222",
    username: "dedi_admin",
    status: "Aktif",
    tglDibuat: "01 Mar 2026",
  },
];

export default function OwnerKelolaAkunAdminPage() {
  const [listAdmin, setListAdmin] = useState<Admin[]>(daftarAdmin);
  const [cari, setCari] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [form, setForm] = useState({ nama: "", email: "", hp: "", username: "", password: "" });

  const terfilter = listAdmin.filter(a =>
    a.nama.toLowerCase().includes(cari.toLowerCase()) ||
    a.email.toLowerCase().includes(cari.toLowerCase()) ||
    a.username.toLowerCase().includes(cari.toLowerCase())
  );

  const handleTambah = () => {
    if (!form.nama || !form.email || !form.username) return;
    const baru: Admin = {
      id: `ADM-${String(listAdmin.length + 1).padStart(3, "0")}`,
      nama: form.nama,
      email: form.email,
      hp: form.hp,
      username: form.username,
      status: "Aktif",
      tglDibuat: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setListAdmin([...listAdmin, baru]);
    setForm({ nama: "", email: "", hp: "", username: "", password: "" });
    setShowTambahModal(false);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    setListAdmin(listAdmin.map(a => a.id === editTarget.id ? editTarget : a));
    setShowEditModal(false);
    setEditTarget(null);
    if (selectedAdmin?.id === editTarget.id) setSelectedAdmin(editTarget);
  };

  const handleHapus = (id: string) => {
    setListAdmin(listAdmin.filter(a => a.id !== id));
    setSelectedAdmin(null);
  };

  const openEdit = (a: Admin) => {
    setEditTarget({ ...a });
    setShowEditModal(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Akun Admin</h1>
          <p className="page-subtitle">Buat, lihat, dan kelola akun admin yang memiliki akses ke panel operasional.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowTambahModal(true)}>
          + Tambah Admin Baru
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        <div className="stat-card" style={{ gap: 8 }}>
          <span className="stat-card-label">Total Akun Admin</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#1d4ed8" }}>{listAdmin.length}</div>
        </div>
        <div className="stat-card" style={{ gap: 8 }}>
          <span className="stat-card-label">Admin Aktif</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#059669" }}>{listAdmin.filter(a => a.status === "Aktif").length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="search-input" style={{ paddingLeft: 42, width: "100%", fontSize: 14 }}
              placeholder="Cari nama, email, atau username admin..." value={cari} onChange={e => setCari(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID", "Nama Admin", "Username", "Email / No. WA", "Status", "Dibuat", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {terfilter.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-text-muted)", fontSize: 14 }}>Admin tidak ditemukan.</td></tr>
              ) : terfilter.map((a, i) => (
                <tr key={a.id} className="row-hover" style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }} onClick={() => setSelectedAdmin(a)}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{a.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {a.nama[0]}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{a.nama}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 600 }}>{a.username}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                    <div>{a.email}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{a.hp}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: a.status === "Aktif" ? "#d1fae5" : "#f1f5f9", color: a.status === "Aktif" ? "#059669" : "#64748b", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{a.tglDibuat}</td>
                  <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedAdmin(a)}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Akun Admin</h2>
              <button onClick={() => setSelectedAdmin(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#1d4ed8", color: "#fff", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selectedAdmin.nama[0]}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)" }}>{selectedAdmin.nama}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedAdmin.id} · Sejak {selectedAdmin.tglDibuat}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Username", value: selectedAdmin.username },
                  { label: "Status", value: selectedAdmin.status },
                  { label: "Email", value: selectedAdmin.email },
                  { label: "No. WhatsApp", value: selectedAdmin.hp },
                ].map(f => (
                  <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: f.label === "Status" && f.value === "Aktif" ? "#059669" : "var(--color-text-primary)" }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedAdmin(null)}>Tutup</button>
                <button className="btn btn-outline" onClick={() => openEdit(selectedAdmin)}>Edit</button>
                <button className="btn" style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }} onClick={() => handleHapus(selectedAdmin.id)}>Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah */}
      {showTambahModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Tambah Admin Baru</h2>
              <button onClick={() => setShowTambahModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" placeholder="Contoh: Rina Wulandari" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="admin@bsdafterschool.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">No. WhatsApp</label>
                  <input className="form-input" placeholder="08xxxxxxxxxx" value={form.hp} onChange={e => setForm({ ...form, hp: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Username</label>
                  <input className="form-input" placeholder="username_login" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Masukan password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowTambahModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={handleTambah}>Simpan Admin</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEditModal && editTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Edit Akun Admin</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" value={editTarget.nama} onChange={e => setEditTarget({ ...editTarget, nama: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={editTarget.email} onChange={e => setEditTarget({ ...editTarget, email: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">No. WhatsApp</label>
                  <input className="form-input" value={editTarget.hp} onChange={e => setEditTarget({ ...editTarget, hp: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Username</label>
                  <input className="form-input" value={editTarget.username} onChange={e => setEditTarget({ ...editTarget, username: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={editTarget.status} onChange={e => setEditTarget({ ...editTarget, status: e.target.value as "Aktif" | "Nonaktif" })}>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={handleEdit}>Simpan Perubahan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
