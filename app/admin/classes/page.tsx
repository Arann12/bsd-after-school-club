"use client";
import { useState } from "react";

const classes = [
  { id: "KLS-2026-001", name: "KLS-A", program: "Calistung Level 1", guru: "Ms. Sarah", day: "Senin & Rabu", time: "14:00–15:00", capacity: 8, enrolled: 6, room: "Ruang 1", status: "Aktif" },
  { id: "KLS-2026-002", name: "KLS-B", program: "English B1", guru: "Mr. Andi", day: "Selasa & Kamis", time: "15:00–16:00", capacity: 8, enrolled: 8, room: "Ruang 2", status: "Penuh" },
  { id: "KLS-2026-003", name: "KLS-C", program: "Math Advance", guru: "Ms. Nina", day: "Rabu & Jumat", time: "16:00–17:00", capacity: 6, enrolled: 4, room: "Ruang 3", status: "Aktif" },
  { id: "KLS-2026-004", name: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", day: "Senin & Kamis", time: "13:00–14:00", capacity: 8, enrolled: 5, room: "Ruang 1", status: "Aktif" },
  { id: "KLS-2026-005", name: "KLS-E", program: "Calistung Level 2", guru: "Mr. Budi", day: "Selasa & Jumat", time: "14:00–15:00", capacity: 8, enrolled: 7, room: "Ruang 2", status: "Aktif" },
  { id: "KLS-2026-006", name: "KLS-F", program: "English Advanced", guru: "Mr. Andi", day: "Sabtu", time: "09:00–11:00", capacity: 6, enrolled: 0, room: "Ruang 3", status: "Baru" },
];

const statusColor: Record<string, { bg: string; color: string }> = {
  Aktif:  { bg: "#d1fae5", color: "#059669" },
  Penuh:  { bg: "#fee2e2", color: "#dc2626" },
  Baru:   { bg: "#dbeafe", color: "#1d4ed8" },
  Nonaktif:{ bg: "#f1f5f9", color: "#64748b" },
};

export default function AdminClassesPage() {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<typeof classes[0] | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const filtered = classes.filter(c => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q) || c.program.toLowerCase().includes(q) || c.guru.toLowerCase().includes(q)) &&
      (filterStatus === "Semua" || c.status === filterStatus);
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} .row-h:hover{background:#f8fafc!important;cursor:pointer}`}</style>

      <div className="page-header">
        <div><h1 className="page-title">Kelas</h1><p className="page-subtitle">Kelola semua kelas dan kelompok belajar.</p></div>
        <div className="page-header-actions">
          <button className="btn btn-accent" onClick={()=>{setSelected(null);setShowModal(true);}}>+ Tambah Kelas</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Total Kelas", value:classes.length, color:"#1d4ed8", bg:"#dbeafe" },
          { label:"Kelas Aktif", value:classes.filter(c=>c.status==="Aktif").length, color:"#059669", bg:"#d1fae5" },
          { label:"Kelas Penuh", value:classes.filter(c=>c.status==="Penuh").length, color:"#dc2626", bg:"#fee2e2" },
          { label:"Total Siswa Terdaftar", value:classes.reduce((a,c)=>a+c.enrolled,0), color:"#7c3aed", bg:"#ede9fe" },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{gap:8}}>
            <span className="stat-card-label">{s.label}</span>
            <div className="stat-card-value" style={{fontSize:28,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card"><div className="card-body" style={{padding:"12px 20px"}}>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" style={{paddingLeft:38,width:"100%"}} placeholder="Cari kelas, program, guru..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="select-control" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"9px 12px",fontSize:13.5}}>
            {["Semua","Aktif","Penuh","Baru","Nonaktif"].map(s=><option key={s}>{s}</option>)}
          </select>
          <span style={{fontSize:12.5,color:"var(--color-text-muted)",marginLeft:"auto"}}>{filtered.length} kelas</span>
        </div>
      </div></div>

      {/* Table */}
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--color-border)",background:"var(--color-bg)"}}>
                {["ID Kelas","Nama Kelas","Program","Guru","Jadwal","Waktu","Kapasitas","Ruang","Status","Aksi"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",fontSize:11,fontWeight:700,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c,i)=>(
                <tr key={c.id} className="row-h" style={{borderBottom:i<filtered.length-1?"1px solid var(--color-border-light)":"none",background:"#fff",transition:"background .15s"}} onClick={()=>{setSelected(c);setShowModal(true);}}>
                  <td style={{padding:"14px 16px",fontFamily:"monospace",fontSize:12,color:"var(--color-text-muted)",fontWeight:600}}>{c.id}</td>
                  <td style={{padding:"14px 16px",fontWeight:800,fontSize:14,color:"var(--color-text-primary)"}}>{c.name}</td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"var(--color-text-secondary)"}}>{c.program}</td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"var(--color-text-secondary)"}}>{c.guru}</td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"var(--color-text-secondary)"}}>{c.day}</td>
                  <td style={{padding:"14px 16px",fontSize:13,fontWeight:600,color:"var(--color-text-primary)"}}>{c.time}</td>
                  <td style={{padding:"14px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{flex:1,height:6,background:"var(--color-border)",borderRadius:999,minWidth:40,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:999,background:c.enrolled/c.capacity>=1?"#dc2626":"var(--color-primary)",width:`${(c.enrolled/c.capacity)*100}%`}} />
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>{c.enrolled}/{c.capacity}</span>
                    </div>
                  </td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"var(--color-text-secondary)"}}>{c.room}</td>
                  <td style={{padding:"14px 16px"}}>
                    <span style={{...statusColor[c.status],fontSize:11.5,fontWeight:700,padding:"3px 10px",borderRadius:"var(--radius-sm)"}}>{c.status}</span>
                  </td>
                  <td style={{padding:"14px 16px"}} onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setSelected(c);setShowModal(true);}}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.2s ease-out"}}>
          <div style={{background:"#fff",borderRadius:18,maxWidth:500,width:"100%",padding:28,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)",animation:"modalIn 0.25s cubic-bezier(0.16,1,0.3,1)",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:800,color:"var(--color-text-primary)",margin:0}}>{selected?`Detail Kelas — ${selected.name}`:"Tambah Kelas Baru"}</h2>
              <button onClick={()=>setShowModal(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-muted)"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {selected ? (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[
                    {label:"ID Kelas",value:selected.id},
                    {label:"Nama Kelas",value:selected.name},
                    {label:"Program",value:selected.program},
                    {label:"Guru",value:selected.guru},
                    {label:"Hari",value:selected.day},
                    {label:"Waktu",value:selected.time},
                    {label:"Ruang",value:selected.room},
                    {label:"Kapasitas",value:`${selected.enrolled}/${selected.capacity} siswa`},
                  ].map(f=>(
                    <div key={f.label} style={{background:"var(--color-bg)",borderRadius:10,padding:"12px 14px",border:"1px solid var(--color-border)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{f.label}</div>
                      <div style={{fontSize:14,fontWeight:700,color:"var(--color-text-primary)"}}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
                  <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Tutup</button>
                  <button className="btn btn-primary" onClick={()=>alert("Edit kelas")}>Edit Kelas</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {label:"Nama Kelas",ph:"Contoh: KLS-G"},
                  {label:"Program",ph:"Pilih Program"},
                  {label:"Guru Pengajar",ph:"Pilih Guru"},
                  {label:"Hari Pertemuan",ph:"Senin & Rabu"},
                  {label:"Waktu",ph:"14:00–15:00"},
                  {label:"Ruang",ph:"Ruang 1"},
                  {label:"Kapasitas Siswa",ph:"8"},
                ].map(f=>(
                  <div key={f.label} className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" placeholder={f.ph} />
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
                  <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Batal</button>
                  <button className="btn btn-accent" onClick={()=>{alert("Kelas ditambahkan!");setShowModal(false);}}>Simpan Kelas</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
