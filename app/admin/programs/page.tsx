"use client";
import { useState } from "react";

const programs = [
  { id: "PRG-001", name: "Calistung", desc: "Membaca, menulis, dan berhitung untuk anak usia dini.", levels: ["Level 1", "Level 2", "Level 3"], sessions: 12, price: 50000, status: "Aktif", students: 34 },
  { id: "PRG-002", name: "English", desc: "Kursus bahasa Inggris dengan pendekatan komunikatif.", levels: ["Starter", "B1", "B2", "Advanced"], sessions: 12, price: 75000, status: "Aktif", students: 28 },
  { id: "PRG-003", name: "Math", desc: "Matematika dasar hingga lanjutan dengan metode visual.", levels: ["Dasar", "Intermediate", "Advance"], sessions: 12, price: 60000, status: "Aktif", students: 22 },
  { id: "PRG-004", name: "Phonics", desc: "Pembelajaran fonik untuk kemampuan membaca awal.", levels: ["Starter", "Level 2"], sessions: 8, price: 50000, status: "Aktif", students: 18 },
  { id: "PRG-005", name: "Coding Junior", desc: "Pengenalan logika pemrograman untuk anak.", levels: ["Scratch", "Python Dasar"], sessions: 10, price: 90000, status: "Nonaktif", students: 0 },
];

export default function AdminProgramsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<typeof programs[0] | null>(null);
  const [search, setSearch] = useState("");

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} .prog-card{transition:all .2s ease;cursor:pointer} .prog-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.10)!important;transform:translateY(-2px)}`}</style>

      <div className="page-header">
        <div><h1 className="page-title">Program</h1><p className="page-subtitle">Kelola semua program kursus yang tersedia.</p></div>
        <button className="btn btn-accent" onClick={() => { setSelected(null); setShowModal(true); }}>+ Tambah Program</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Total Program", value: programs.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Program Aktif", value: programs.filter(p=>p.status==="Aktif").length, color: "#059669", bg: "#d1fae5" },
          { label: "Total Siswa", value: programs.reduce((a,p)=>a+p.students,0), color: "#7c3aed", bg: "#ede9fe" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <div style={{ position: "relative", maxWidth: 360 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" style={{ paddingLeft:38, width:"100%" }} placeholder="Cari program..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {filtered.map(p => (
          <div key={p.id} className="card prog-card" onClick={() => { setSelected(p); setShowModal(true); }} style={{ padding: "22px 24px", display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:11, fontFamily:"monospace", color:"var(--color-text-muted)", marginBottom:4 }}>{p.id}</div>
                <div style={{ fontSize:17, fontWeight:800, color:"var(--color-text-primary)" }}>{p.name}</div>
              </div>
              <span style={{ background: p.status==="Aktif"?"#d1fae5":"#f1f5f9", color: p.status==="Aktif"?"#059669":"#64748b", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>{p.status}</span>
            </div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.5, margin:0 }}>{p.desc}</p>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Level tersedia</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {p.levels.map(l => <span key={l} style={{ background:"var(--color-primary-bg)", color:"var(--color-primary)", fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>{l}</span>)}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, borderTop:"1px solid var(--color-border-light)", paddingTop:14 }}>
              {[{ label:"Pertemuan", value:`${p.sessions}x` },{ label:"Harga/sesi", value:`Rp ${p.price.toLocaleString("id")}` },{ label:"Siswa", value:p.students }].map(s=>(
                <div key={s.label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"var(--color-text-primary)" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"var(--color-text-muted)", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(4px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"fadeIn 0.2s ease-out" }}>
          <div style={{ background:"#fff", borderRadius:18, maxWidth:480, width:"100%", padding:28, boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)", animation:"modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:"var(--color-text-primary)", margin:0 }}>{selected ? `Edit — ${selected.name}` : "Tambah Program Baru"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Nama Program", val: selected?.name||"", ph:"Contoh: Calistung" },
                { label:"Deskripsi", val: selected?.desc||"", ph:"Deskripsi singkat program" },
                { label:"Harga per Pertemuan (Rp)", val: selected?.price.toString()||"", ph:"50000" },
                { label:"Jumlah Pertemuan Paket", val: selected?.sessions.toString()||"", ph:"12" },
              ].map(f => (
                <div key={f.label} className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" placeholder={f.ph} defaultValue={f.val} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Status</label>
                <select className="form-input" defaultValue={selected?.status||"Aktif"} style={{ cursor:"pointer" }}>
                  <option>Aktif</option><option>Nonaktif</option>
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
                <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={()=>{alert("Disimpan!");setShowModal(false);}}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
