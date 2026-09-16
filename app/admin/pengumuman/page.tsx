"use client";
import { useState } from "react";

type Peran = "owner" | "admin" | "guru" | "orang-tua";
type StatusPengumuman = "Aktif" | "Draft" | "Selesai";

interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  target: string[];
  status: StatusPengumuman;
  dibuat: string;
  penting: boolean;
  sudahDibaca?: boolean;
}

const daftarPengumuman: Pengumuman[] = [
  { id: "ANN-001", judul: "Libur Idul Adha — Tidak Ada Kelas", isi: "Diberitahukan kepada seluruh siswa dan orang tua bahwa pada tanggal 16–17 Juni 2026 tidak ada kegiatan belajar mengajar sehubungan dengan Hari Raya Idul Adha 1447 H. Kegiatan belajar mengajar kembali normal pada Senin, 20 Juni 2026.", tanggal: "14 Juni 2026", target: ["Guru", "Orang Tua"], status: "Aktif", dibuat: "Admin", penting: true, sudahDibaca: false },
  { id: "ANN-002", judul: "Penilaian Akhir Program Bulan September", isi: "Penilaian akhir akan dilaksanakan pada minggu ke-4 September 2026. Guru diharapkan menyerahkan nilai komponen assessment paling lambat 25 September 2026.", tanggal: "1 Sept 2026", target: ["Guru"], status: "Aktif", dibuat: "Admin", penting: false, sudahDibaca: true },
  { id: "ANN-003", judul: "Pembayaran SPP September Jatuh Tempo 10 September", isi: "Kami mengingatkan para orang tua bahwa batas waktu pembayaran SPP bulan September adalah tanggal 10 September 2026. Pembayaran dapat dilakukan melalui Virtual Account, QRIS, E-Wallet, atau tunai di kantor.", tanggal: "2 Sept 2026", target: ["Orang Tua"], status: "Aktif", dibuat: "Admin", penting: true, sudahDibaca: false },
  { id: "ANN-004", judul: "Perubahan Jadwal Ms. Sarah — 4 Sept 2026", isi: "Jadwal kelas Ms. Sarah pada Rabu 4 September 2026 dipindahkan dari pukul 14:00 ke 15:00. Perubahan ini hanya berlaku untuk pertemuan tersebut.", tanggal: "3 Sept 2026", target: ["Orang Tua", "Guru"], status: "Aktif", dibuat: "Admin", penting: false, sudahDibaca: true },
  { id: "ANN-005", judul: "Draft: Program Baru Coding Junior (Rencana)", isi: "Sedang dalam perencanaan untuk membuka program Coding Junior mulai Oktober 2026. Detail program masih dalam finalisasi.", tanggal: "–", target: ["Guru", "Orang Tua"], status: "Draft", dibuat: "Admin", penting: false },
];

const warnaTarget: Record<string, { bg: string; color: string }> = {
  "Guru":               { bg: "#ede9fe", color: "#6d28d9" },
  "Orang Tua":          { bg: "#e0f2fe", color: "#0369a1" },
  "Semua":              { bg: "#f1f5f9", color: "#475569" },
  "Kelas Tertentu":     { bg: "#fef3c7", color: "#b45309" },
  "Program Tertentu":   { bg: "#d1fae5", color: "#059669" },
};

interface Props { peran?: Peran; }

export default function PengumumanPage({ peran = "admin" }: Props) {
  const bisaKelola = peran === "admin" || peran === "owner";
  const [daftar, setDaftar] = useState(daftarPengumuman);
  const [dipilih, setDipilih] = useState<Pengumuman | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [target, setTarget] = useState<string[]>(["Guru", "Orang Tua"]);
  const [penting, setPenting] = useState(false);

  const terfilter = daftar.filter(p =>
    filterStatus === "Semua" || p.status === filterStatus
  );

  const tandaiDibaca = (id: string) => {
    setDaftar(prev => prev.map(p => p.id === id ? { ...p, sudahDibaca: true } : p));
  };

  const buatPengumuman = (langsung: boolean) => {
    if (!judul.trim() || !isi.trim()) return;
    const baru: Pengumuman = {
      id: `ANN-00${daftar.length + 1}`,
      judul, isi, penting,
      tanggal: langsung ? new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "–",
      target, status: langsung ? "Aktif" : "Draft",
      dibuat: peran === "owner" ? "Owner" : "Admin",
    };
    setDaftar(prev => [baru, ...prev]);
    setShowForm(false);
    setJudul(""); setIsi(""); setPenting(false);
  };

  const hapusPengumuman = (id: string) => {
    setDaftar(prev => prev.filter(p => p.id !== id));
    setDipilih(null);
  };

  const belumDibaca = daftar.filter(p => !p.sudahDibaca && p.status === "Aktif").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .kartu-pengumuman:hover{box-shadow:0 4px 16px rgba(0,0,0,.09)!important;transform:translateY(-1px)}
        .kartu-pengumuman{transition:all .2s ease;cursor:pointer}
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengumuman</h1>
          <p className="page-subtitle">
            {bisaKelola ? "Kelola dan publikasikan pengumuman kepada guru dan orang tua." : "Informasi terbaru dari sekolah."}
          </p>
        </div>
        {bisaKelola && (
          <div className="page-header-actions">
            <button className="btn btn-accent" onClick={() => setShowForm(true)}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Buat Pengumuman
            </button>
          </div>
        )}
      </div>

      {/* Banner Belum Dibaca */}
      {!bisaKelola && belumDibaca > 0 && (
        <div style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, animation: "slideIn .3s ease" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{belumDibaca} pengumuman baru belum dibaca</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", marginTop: 2 }}>Klik pengumuman di bawah untuk membacanya.</div>
          </div>
        </div>
      )}

      {/* Statistik (hanya admin/owner) */}
      {bisaKelola && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Pengumuman", value: daftar.length, warna: "#1d4ed8", bg: "#dbeafe" },
            { label: "Aktif / Dipublikasi", value: daftar.filter(p=>p.status==="Aktif").length, warna: "#059669", bg: "#d1fae5" },
            { label: "Draft", value: daftar.filter(p=>p.status==="Draft").length, warna: "#b45309", bg: "#fef3c7" },
          ].map(k => (
            <div key={k.label} className="stat-card" style={{ gap: 8 }}>
              <span className="stat-card-label">{k.label}</span>
              <div className="stat-card-value" style={{ fontSize: 28, color: k.warna }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tab (hanya admin/owner) */}
      {bisaKelola && (
        <div style={{ display: "flex", gap: 8 }}>
          {["Semua", "Aktif", "Draft", "Selesai"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`filter-chip${filterStatus === f ? " active" : ""}`}
            >{f}</button>
          ))}
        </div>
      )}

      {/* Daftar Pengumuman */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {terfilter.map(p => (
          <div key={p.id} className="kartu-pengumuman card"
            style={{ padding: "20px 24px", borderLeft: p.penting ? "4px solid var(--color-accent)" : "4px solid transparent", opacity: p.status === "Draft" ? .75 : 1 }}
            onClick={() => { setDipilih(p); tandaiDibaca(p.id); }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                {/* Baris Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  {p.penting && <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>Penting</span>}
                  {!p.sudahDibaca && p.status === "Aktif" && !bisaKelola && (
                    <span style={{ background: "var(--color-primary)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>• Baru</span>
                  )}
                  {p.status === "Draft" && <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>DRAFT</span>}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 6px" }}>{p.judul}</h3>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.isi}</p>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.tanggal}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>•</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Oleh: {p.dibuat}</span>
                  {p.target.map(t => (
                    <span key={t} style={{ ...warnaTarget[t] || warnaTarget["Semua"], fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{t}</span>
                  ))}
                </div>
              </div>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        ))}

        {terfilter.length === 0 && (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum ada pengumuman</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>Pengumuman yang dipublikasikan akan muncul di sini.</div>
            {bisaKelola && <button className="btn btn-accent" onClick={() => setShowForm(true)}>+ Buat Pengumuman</button>}
          </div>
        )}
      </div>

      {/* Modal Detail Pengumuman */}
      {dipilih && !showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                {dipilih.penting && <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, marginBottom: 8, display: "inline-block" }}>PENTING</span>}
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.3 }}>{dipilih.judul}</h2>
              </div>
              <button onClick={() => setDipilih(null)} className="modal-close">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{dipilih.tanggal} · {dipilih.dibuat}</span>
              {dipilih.target.map(t => <span key={t} style={{ ...warnaTarget[t] || warnaTarget["Semua"], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{t}</span>)}
              <span style={{ background: dipilih.status==="Aktif"?"#d1fae5":dipilih.status==="Draft"?"#fef3c7":"#f1f5f9", color: dipilih.status==="Aktif"?"#059669":dipilih.status==="Draft"?"#b45309":"#64748b", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{dipilih.status}</span>
            </div>

            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "18px 20px", lineHeight: 1.7, fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 20, whiteSpace: "pre-wrap" }}>{dipilih.isi}</div>

            <div style={{ display: "grid", gridTemplateColumns: bisaKelola ? "1fr 1fr 1fr" : "1fr", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>{bisaKelola ? "Tutup" : "Kembali"}</button>
              {bisaKelola && (
                <>
                  <button className="btn btn-outline" onClick={() => setDipilih(null)}>Edit</button>
                  <button className="btn btn-ghost" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={() => hapusPengumuman(dipilih.id)}>Hapus</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Buat Pengumuman */}
      {showForm && bisaKelola && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 540, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Buat Pengumuman Baru</h2>
              <button onClick={() => setShowForm(false)} className="modal-close">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Judul Pengumuman</label>
                <input className="form-input" placeholder="Contoh: Libur Nasional — Tidak Ada Kelas" value={judul} onChange={e => setJudul(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Isi Pengumuman</label>
                <textarea className="form-input" placeholder="Tulis isi pengumuman secara lengkap dan jelas..." value={isi} onChange={e => setIsi(e.target.value)}
                  style={{ minHeight: 130, resize: "vertical", fontFamily: "inherit" }} />
              </div>

              {/* Pilih Target (Requirement #13) */}
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Target Penerima Pengumuman</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Semua", "Guru", "Orang Tua", "Kelas Tertentu", "Program Tertentu"].map(t => (
                    <button key={t} type="button" onClick={() => {
                      if (t === "Semua") { setTarget(["Semua"]); return; }
                      setTarget(prev => {
                        const tanpaSemua = prev.filter(x => x !== "Semua");
                        return tanpaSemua.includes(t) ? tanpaSemua.filter(x => x !== t) : [...tanpaSemua, t];
                      });
                    }}
                      style={{ padding: "7px 14px", borderRadius: "var(--radius-full)", border: "2px solid", fontSize: 12.5, fontWeight: 700, cursor: "pointer", transition: "all .15s",
                        background: target.includes(t) ? (warnaTarget[t]?.bg || "#f1f5f9") : "white",
                        color: target.includes(t) ? (warnaTarget[t]?.color || "#475569") : "var(--color-text-muted)",
                        borderColor: target.includes(t) ? (warnaTarget[t]?.color || "#94a3b8") : "var(--color-border)",
                      }}>{t}</button>
                  ))}
                </div>

                {/* Dropdown Pilihan Kelas Tertentu (Requirement #13) */}
                {target.includes("Kelas Tertentu") && (
                  <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Pilih Kelas Tujuan (Dropdown)</label>
                    <select className="form-input" style={{ fontSize: 13.5 }}>
                      <option value="">-- Pilih Kelas Spesifik --</option>
                      <option value="KLS-A">KLS-A — Calistung Basic (Ms. Sarah)</option>
                      <option value="KLS-B">KLS-B — English Intermediate (Mr. Andi)</option>
                      <option value="KLS-C">KLS-C — Math Advance (Ms. Nina)</option>
                      <option value="KLS-D">KLS-D — Phonics Starter (Ms. Sarah)</option>
                      <option value="KLS-E">KLS-E — Calistung Level 2 (Mr. Budi)</option>
                    </select>
                  </div>
                )}

                {/* Dropdown Pilihan Program Tertentu (Requirement #13) */}
                {target.includes("Program Tertentu") && (
                  <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Pilih Program Tujuan (Dropdown)</label>
                    <select className="form-input" style={{ fontSize: 13.5 }}>
                      <option value="">-- Pilih Program Spesifik --</option>
                      <option value="Calistung">Calistung (Membaca, Menulis, Berhitung)</option>
                      <option value="English">English Communicative</option>
                      <option value="Math">Math Advance & Nalar</option>
                      <option value="Phonics">Phonics Sound & Reading</option>
                      <option value="Bimbingan Belajar">Bimbingan Belajar SD</option>
                      <option value="Coding Junior">Coding & Robotics Junior</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Toggle Penting */}
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div onClick={() => setPenting(!penting)}
                  style={{ width: 44, height: 24, borderRadius: 999, background: penting ? "var(--color-accent)" : "var(--color-border)", position: "relative", transition: "background .2s ease", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: penting ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,.2)", transition: "left .2s ease" }} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>Tandai sebagai Pengumuman Penting</span>
              </label>

              {(!judul.trim() || !isi.trim() || target.length === 0) && (
                <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#92400e" }}>
                  Isi judul, isi pengumuman, dan pilih minimal satu target penerima.
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
                <button className="btn btn-outline" disabled={!judul.trim() || !isi.trim() || target.length === 0}
                  onClick={() => buatPengumuman(false)} style={{ opacity: !judul.trim() || !isi.trim() || target.length === 0 ? .5 : 1 }}>
                  Simpan Draft
                </button>
                <button className="btn btn-accent" disabled={!judul.trim() || !isi.trim() || target.length === 0}
                  onClick={() => buatPengumuman(true)} style={{ opacity: !judul.trim() || !isi.trim() || target.length === 0 ? .5 : 1 }}>
                  Publikasikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
