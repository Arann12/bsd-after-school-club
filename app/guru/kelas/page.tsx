"use client";
import { useState } from "react";
import Link from "next/link";

const datakelas = [
  {
    id: "SES-001",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    level: "Level 1",
    jadwal: "Senin & Rabu, 14:00 – 15:00",
    ruang: "Ruang 1",
    siswa: 6,
    pertemuan: 7,
    totalPertemuan: 12,
    siswaList: ["Andi Setiawan", "Citra Kirana", "Dian Pratama", "Fitri Handayani", "Hana Pertiwi", "Ivan Kurnia"],
    statusHariIni: "Siap Mulai",
    warna: "#059669",
    bgWarna: "#d1fae5",
  },
  {
    id: "SES-002",
    kelas: "KLS-D",
    program: "Phonics Starter",
    level: "Starter",
    jadwal: "Senin & Kamis, 16:00 – 17:00",
    ruang: "Ruang 3",
    siswa: 5,
    pertemuan: 3,
    totalPertemuan: 8,
    siswaList: ["Bagas Ramadhan", "Elsa Putri", "Galih Wibowo", "Indah Sari", "Joko Santoso"],
    statusHariIni: "Mendatang",
    warna: "#d97706",
    bgWarna: "#fef3c7",
  },
];

export default function GuruKelasListPage() {
  const [dipilih, setDipilih] = useState<typeof datakelas[0] | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .kartu-kelas{transition:all .2s ease;cursor:pointer}
        .kartu-kelas:hover{box-shadow:0 6px 24px rgba(0,0,0,.1)!important;transform:translateY(-2px)}
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelas Saya</h1>
          <p className="page-subtitle">Daftar kelas yang Anda ampu. Klik kelas untuk melihat detail siswa dan mulai sesi.</p>
        </div>
      </div>

      {/* Stats Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Total Kelas Aktif</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#1d4ed8" }}>{datakelas.length} Kelas</div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Semester ini</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Total Siswa Diajar</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#059669" }}>
            {datakelas.reduce((a, k) => a + k.siswa, 0)} Siswa
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Semua kelas gabungan</div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Kelas Hari Ini</span>
          <div className="stat-card-value" style={{ fontSize: 28, color: "#7c3aed" }}>
            {datakelas.filter(k => k.statusHariIni === "Siap Mulai" || k.statusHariIni === "Berlangsung").length} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Senin, 2 Sept 2026</div>
        </div>
      </div>

      {/* Grid Kartu Kelas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 18 }}>
        {datakelas.map(k => {
          const persen = Math.round((k.pertemuan / k.totalPertemuan) * 100);
          return (
            <div key={k.id} className="kartu-kelas card" style={{ padding: 24 }} onClick={() => setDipilih(k)}>
              {/* Header Kartu */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 19, fontWeight: 900, color: "var(--color-text-primary)" }}>{k.kelas}</span>
                    <span style={{ background: k.bgWarna, color: k.warna, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>{k.statusHariIni}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 2 }}>{k.program}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{k.jadwal} · {k.ruang}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bgWarna, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={k.warna} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>

              {/* Progress Pertemuan */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Progress Pertemuan</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-primary)" }}>{k.pertemuan}/{k.totalPertemuan} Sesi ({persen}%)</span>
                </div>
                <div style={{ height: 7, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: `linear-gradient(90deg, ${k.warna}, ${k.warna}cc)`, width: `${persen}%`, borderRadius: 999, transition: "width .4s ease" }} />
                </div>
              </div>

              {/* Info Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--color-border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 600 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {k.siswa} Siswa
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Level: {k.level}</div>
                <Link href={`/guru/kelas/${k.id}`} onClick={e => e.stopPropagation()} className="btn btn-accent" style={{ padding: "7px 16px", fontSize: 12.5, textDecoration: "none" }}>
                  ▶ Mulai Sesi
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Kelas */}
      {dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(.16,1,.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            
            {/* Header Modal */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--color-text-primary)", marginBottom: 2 }}>{dipilih.kelas}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)" }}>{dipilih.program}</div>
              </div>
              <button onClick={() => setDipilih(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Info Detail */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Jadwal", val: dipilih.jadwal },
                { label: "Ruangan", val: dipilih.ruang },
                { label: "Pertemuan", val: `${dipilih.pertemuan} dari ${dipilih.totalPertemuan}` },
                { label: "Status Hari Ini", val: dipilih.statusHariIni },
              ].map(item => (
                <div key={item.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Daftar Siswa */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Daftar Siswa ({dipilih.siswa})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dipilih.siswaList.map((nama, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border-light)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {nama[0]}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{nama}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
              <Link href={`/guru/kelas/${dipilih.id}`} className="btn btn-accent" style={{ textDecoration: "none", textAlign: "center" }}>
                ▶ Mulai Sesi Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
