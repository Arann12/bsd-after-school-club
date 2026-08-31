"use client";
import { useState } from "react";

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const JAM  = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const sesiList = [
  { id: "SES-001", kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", day: 0, hour: 14, durasi: 1, room: "Ruang 1", pertemuan: 7, status: "Terjadwal", color: "#1a5c8a" },
  { id: "SES-002", kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", day: 1, hour: 15, durasi: 1, room: "Ruang 2", pertemuan: 4, status: "Terjadwal", color: "#7c3aed" },
  { id: "SES-003", kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", day: 2, hour: 16, durasi: 1, room: "Ruang 3", pertemuan: 9, status: "Berlangsung", color: "#059669" },
  { id: "SES-004", kelas: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", day: 3, hour: 13, durasi: 1, room: "Ruang 1", pertemuan: 3, status: "Terjadwal", color: "#d97706" },
  { id: "SES-005", kelas: "KLS-E", program: "Calistung L2", guru: "Mr. Budi", day: 4, hour: 14, durasi: 1, room: "Ruang 2", pertemuan: 11, status: "Terjadwal", color: "#0891b2" },
  { id: "SES-006", kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", day: 3, hour: 15, durasi: 1, room: "Ruang 2", pertemuan: 5, status: "Terjadwal", color: "#7c3aed" },
  { id: "SES-007", kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", day: 2, hour: 14, durasi: 1, room: "Ruang 1", pertemuan: 8, status: "Terjadwal", color: "#1a5c8a" },
  { id: "SES-008", kelas: "KLS-F", program: "English Adv", guru: "Mr. Andi", day: 5, hour: 9, durasi: 2, room: "Ruang 3", pertemuan: 1, status: "Terjadwal", color: "#dc2626" },
];

const daftarHarian = [
  { date: "Senin, 2 Sept 2026", items: [
    { time: "13:00â€“14:00", kelas: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", room: "Ruang 1", pertemuan: 3, status: "Terjadwal" },
    { time: "14:00â€“15:00", kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", room: "Ruang 1", pertemuan: 7, status: "Terjadwal" },
  ]},
  { date: "Selasa, 3 Sept 2026", items: [
    { time: "15:00â€“16:00", kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", room: "Ruang 2", pertemuan: 4, status: "Terjadwal" },
  ]},
  { date: "Rabu, 4 Sept 2026", items: [
    { time: "14:00â€“15:00", kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", room: "Ruang 1", pertemuan: 8, status: "Berlangsung" },
    { time: "16:00â€“17:00", kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", room: "Ruang 3", pertemuan: 9, status: "Terjadwal" },
  ]},
];

export default function AdminSchedulePage() {
  const [tampilan, setTampilan] = useState<"tabel" | "daftar">("tabel");
  const [sesiDipilih, setSelectedSes] = useState<typeof sesiList[0] | null>(null);
  const [showJadwalUlang, setShowReschedule] = useState(false);

  const statusCol: Record<string, string> = {
    Terjadwal: "#1a5c8a",
    Berlangsung: "#059669",
    Selesai: "#64748b",
    Dibatalkan: "#dc2626",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .ses-card:hover{opacity:.85;cursor:pointer}
        .ses-card{transition:opacity .15s}
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div><h1 className="page-title">Jadwal</h1><p className="page-subtitle">Kalender jadwal sesi kelas mingguan.</p></div>
        <div className="page-header-actions">
          {/* tampilan Toggle */}
          <div style={{ display:"flex", background:"var(--color-bg)", border:"1px solid var(--color-border)", borderRadius:"var(--radius-md)", overflow:"hidden" }}>
            {(["tabel","daftar"] as const).map(v => (
              <button key={v} onClick={()=>setTampilan(v)}
                style={{ padding:"7px 16px", border:"none", background: tampilan===v ? "var(--color-primary)" : "transparent", color: tampilan===v ? "#fff" : "var(--color-text-secondary)", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .15s" }}>
                {v === "tabel" ? "Tabel" : "Daftar"}
              </button>
            ))}
          </div>
          <button className="btn btn-accent" onClick={()=>alert("Tambah sesi")}>+ Tambah Sesi</button>
        </div>
      </div>

      {/* Stat Strip */}
      <div style={{ display:"tabel", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Sesi Minggu Ini", value:sesiList.length, color:"#1d4ed8", bg:"#dbeafe" },
          { label:"Berlangsung", value:sesiList.filter(s=>s.status==="Berlangsung").length, color:"#059669", bg:"#d1fae5" },
          { label:"Guru Bertugas", value:new Set(sesiList.map(s=>s.guru)).size, color:"#7c3aed", bg:"#ede9fe" },
          { label:"Ruang Terpakai", value:new Set(sesiList.map(s=>s.room)).size, color:"#d97706", bg:"#fef3c7" },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{gap:8}}>
            <span className="stat-card-label">{s.label}</span>
            <div className="stat-card-value" style={{fontSize:28,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* GRID tampilan â€” Weekly Timetable */}
      {tampilan === "tabel" && (
        <div className="card" style={{ overflow:"hidden" }}>
          <div className="card-header" style={{ paddingBottom:16 }}>
            <h2 className="card-title">Minggu Ini â€” 2â€“7 September 2026</h2>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-ghost btn-sm">â† Minggu Lalu</button>
              <button className="btn btn-ghost btn-sm">Minggu Ini</button>
              <button className="btn btn-ghost btn-sm">Minggu Depan â†’</button>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop:0, overflowX:"auto" }}>
            <div style={{ display:"tabel", gridTemplateColumns:`80px repeat(6,1fr)`, minWidth:700 }}>
              {/* Header Row */}
              <div style={{ padding:"8px 0", borderBottom:"1px solid var(--color-border)" }} />
              {HARI.map((d,i) => (
                <div key={d} style={{ padding:"8px 10px", borderBottom:"1px solid var(--color-border)", borderLeft:"1px solid var(--color-border-light)", textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--color-text-muted)", textTransform:"uppercase" }}>{d}</div>
                  <div style={{ fontSize:15, fontWeight:800, color: i===2 ? "var(--color-primary)" : "var(--color-text-primary)", marginTop:2 }}>{i+2}</div>
                </div>
              ))}

              {/* Time Rows */}
              {JAM.map(h => {
                const hr = parseInt(h);
                return (
                  <>
                    <div key={`h-${h}`} style={{ padding:"12px 10px", borderBottom:"1px solid var(--color-border-light)", fontSize:11.5, color:"var(--color-text-muted)", fontWeight:600, display:"flex", alignItems:"center" }}>{h}</div>
                    {HARI.map((_d,di) => {
                      const ses = sesiList.find(s => s.day===di && s.hour===hr);
                      return (
                        <div key={`${h}-${di}`} style={{ borderLeft:"1px solid var(--color-border-light)", borderBottom:"1px solid var(--color-border-light)", padding:4, minHeight:48, position:"relative" }}>
                          {ses && (
                            <div className="ses-card"
                              onClick={()=>{ setSelectedSes(ses); }}
                              style={{ background: ses.color, color:"#fff", borderRadius:8, padding:"6px 8px", fontSize:11, fontWeight:700, lineHeight:1.3, height:"100%", minHeight:40 }}>
                              <div>{ses.kelas}</div>
                              <div style={{ fontSize:10, opacity:.9 }}>{ses.guru}</div>
                              <div style={{ fontSize:10, opacity:.85 }}>{ses.room}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display:"flex", gap:16, padding:"14px 0 0", flexWrap:"wrap" }}>
              {[...new Set(sesiList.map(s=>s.program))].map((prog,i)=>{
                const col = sesiList.find(s=>s.program===prog)?.color||"#64748b";
                return (
                  <div key={prog} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--color-text-secondary)" }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:col }} />
                    {prog}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIST tampilan */}
      {tampilan === "daftar" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {daftarHarian.map(day => (
            <div key={day.date} className="card">
              <div className="card-header"><h2 className="card-title" style={{ fontSize:14 }}>{day.date}</h2></div>
              <div className="card-body" style={{ paddingTop:0 }}>
                {day.items.map((ses,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 0", borderBottom: i<day.items.length-1?"1px solid var(--color-border-light)":"none" }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"var(--color-text-muted)", minWidth:110 }}>{ses.time}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"var(--color-text-primary)" }}>{ses.kelas} â€” {ses.program}</div>
                      <div style={{ fontSize:12, color:"var(--color-text-muted)", marginTop:2 }}>{ses.guru} Â· {ses.room} Â· Pertemuan ke-{ses.pertemuan}</div>
                    </div>
                    <span style={{ background: ses.status==="Berlangsung"?"#d1fae5":"#dbeafe", color: ses.status==="Berlangsung"?"#059669":"#1d4ed8", fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>{ses.status}</span>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{ setSelectedSes(sesiList.find(s=>s.kelas===ses.kelas)||null); setShowReschedule(true); }}>Reschedule</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      {sesiDipilih && !showJadwalUlang && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.2s ease-out"}}>
          <div style={{background:"#fff",borderRadius:18,maxWidth:460,width:"100%",padding:28,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)",animation:"modalIn 0.25s cubic-bezier(0.16,1,0.3,1)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:800,color:"var(--color-text-primary)",margin:0}}>Detail Sesi</h2>
              <button onClick={()=>setSelectedSes(null)} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-muted)"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Session color banner */}
            <div style={{background:sesiDipilih.color,borderRadius:12,padding:"14px 18px",color:"#fff",marginBottom:18}}>
              <div style={{fontSize:18,fontWeight:800}}>{sesiDipilih.kelas}</div>
              <div style={{fontSize:13,opacity:.9}}>{sesiDipilih.program} Â· {sesiDipilih.guru}</div>
              <div style={{fontSize:12,opacity:.85,marginTop:4}}>{sesiDipilih.room} Â· Pertemuan ke-{sesiDipilih.pertemuan}</div>
            </div>
            <div style={{display:"tabel",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              {[
                {label:"Hari",value:HARI[sesiDipilih.day]},
                {label:"Jam",value:`${sesiDipilih.hour}:00`},
                {label:"Durasi",value:`${sesiDipilih.durasi} jam`},
                {label:"Status",value:sesiDipilih.status},
              ].map(f=>(
                <div key={f.label} style={{background:"var(--color-bg)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--color-border)"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{f.label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--color-text-primary)"}}>{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{display:"tabel",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button className="btn btn-ghost" onClick={()=>setSelectedSes(null)}>Tutup</button>
              <button className="btn btn-outline" onClick={()=>setShowReschedule(true)}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showJadwalUlang && sesiDipilih && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.2s ease-out"}}>
          <div style={{background:"#fff",borderRadius:18,maxWidth:440,width:"100%",padding:28,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)",animation:"modalIn 0.25s cubic-bezier(0.16,1,0.3,1)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:800,color:"var(--color-text-primary)",margin:0}}>Reschedule Sesi</h2>
              <button onClick={()=>{setShowReschedule(false);setSelectedSes(null);}} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-muted)"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{background:"var(--color-bg)",borderRadius:10,padding:"12px 16px",marginBottom:18,border:"1px solid var(--color-border)"}}>
              <div style={{fontSize:12,color:"var(--color-text-muted)",marginBottom:2}}>Sesi yang di-reschedule</div>
              <div style={{fontWeight:800,fontSize:14,color:"var(--color-text-primary)"}}>{sesiDipilih.kelas} â€” {sesiDipilih.program}</div>
              <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{HARI[sesiDipilih.day]}, {sesiDipilih.hour}:00 Â· Pertemuan ke-{sesiDipilih.pertemuan}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Tanggal Baru</label>
                <input className="form-input" type="date" />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Jam Mulai Baru</label>
                <select className="form-input" style={{cursor:"pointer"}}>
                  {JAM.map(h=><option key={h}>{h}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Ruang</label>
                <select className="form-input" style={{cursor:"pointer"}}>
                  {["Ruang 1","Ruang 2","Ruang 3"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Alasan Reschedule</label>
                <input className="form-input" placeholder="Contoh: Hari libur nasional" />
              </div>
              <div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",fontSize:12.5,color:"#92400e",lineHeight:1.4}}>
                âš ï¸ Nomor pertemuan ke-{sesiDipilih.pertemuan} akan tetap sama. Hanya tanggal dan jam yang berubah. Riwayat reschedule akan tercatat.
              </div>
              <div style={{display:"tabel",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button className="btn btn-ghost" onClick={()=>{setShowReschedule(false);setSelectedSes(null);}}>Batal</button>
                <button className="btn btn-primary" onClick={()=>{alert("Reschedule berhasil!");setShowReschedule(false);setSelectedSes(null);}}>Simpan Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
