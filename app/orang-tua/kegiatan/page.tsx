"use client";
import { useState } from "react";

const agendaKegiatan = [
  {
    id: "KEG-001",
    judul: "Pentas Seni & Wisuda Mini BSD After School Club",
    tanggal: "Sabtu, 27 September 2026",
    jam: "08:00 – 12:00",
    lokasi: "Aula BSD After School Club",
    deskripsi: "Acara tahunan BSD After School Club sebagai penutup semester. Siswa akan menampilkan hasil belajar mereka melalui pertunjukan seni, pembacaan puisi, dan penyerahan sertifikat kelulusan bagi yang telah menyelesaikan program.",
    kategori: "Wisuda",
    warna: "#7c3aed",
    bgWarna: "#ede9fe",
    emoji: "",
    peserta: "Seluruh siswa, orang tua, dan guru",
    wajib: true,
  },
  {
    id: "KEG-002",
    judul: "Penilaian Akhir Program (Assessment)",
    tanggal: "Senin – Jumat, 22–26 September 2026",
    jam: "Sesuai jadwal kelas masing-masing",
    lokasi: "Ruang kelas masing-masing",
    deskripsi: "Pelaksanaan penilaian akhir oleh guru untuk mengukur pencapaian siswa selama program berlangsung. Hasil penilaian akan menjadi dasar laporan akhir dan penentuan kelulusan.",
    kategori: "Akademik",
    warna: "#1d4ed8",
    bgWarna: "#dbeafe",
    emoji: "",
    peserta: "Semua siswa",
    wajib: true,
  },
  {
    id: "KEG-003",
    judul: "Hari Belajar Tematik — Profesi Impianku",
    tanggal: "Rabu, 10 September 2026",
    jam: "14:00 – 16:00",
    lokasi: "Ruang belajar BSD After School Club",
    deskripsi: "Kegiatan belajar interaktif bertema cita-cita dan profesi. Siswa diajak mengenal berbagai profesi melalui permainan peran, menggambar, dan bercerita. Orang tua dipersilahkan hadir untuk mendampingi.",
    kategori: "Kegiatan Khusus",
    warna: "#d97706",
    bgWarna: "#fef3c7",
    emoji: "",
    peserta: "Siswa & orang tua (opsional)",
    wajib: false,
  },
  {
    id: "KEG-004",
    judul: "Libur Hari Kemerdekaan — Tidak Ada Kelas",
    tanggal: "Senin, 17 Agustus 2026",
    jam: "Seharian",
    lokasi: "—",
    deskripsi: "Sehubungan dengan peringatan Hari Kemerdekaan Republik Indonesia ke-81, seluruh kegiatan belajar mengajar BSD After School Club ditiadakan. Kegiatan normal kembali pada hari berikutnya.",
    kategori: "Libur",
    warna: "#dc2626",
    bgWarna: "#fee2e2",
    emoji: "",
    peserta: "—",
    wajib: false,
  },
];

const galeriKegiatan = [
  { id: 1, judul: "Wisuda Mini Juli 2026", deskripsi: "Siswa-siswi penerima sertifikat kelulusan" },
  { id: 2, judul: "Belajar Suku Kata", deskripsi: "KLS-A belajar membaca bersama Ms. Sarah" },
  { id: 3, judul: "Hari Belajar Tematik", deskripsi: "Sesi bermain peran profesi impian" },
];

export default function OrangTuaKegiatanPage() {
  const [dipilih, setDipilih] = useState<typeof agendaKegiatan[0] | null>(null);
  const [tab, setTab] = useState<"agenda" | "galeri">("agenda");

  const kategoriWarna: Record<string, { bg: string; color: string }> = {
    "Wisuda":         { bg: "#ede9fe", color: "#7c3aed" },
    "Akademik":       { bg: "#dbeafe", color: "#1d4ed8" },
    "Kegiatan Khusus":{ bg: "#fef3c7", color: "#d97706" },
    "Libur":          { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .kartu-keg{transition:all .2s ease;cursor:pointer}
        .kartu-keg:hover{box-shadow:0 6px 20px rgba(0,0,0,.1)!important;transform:translateY(-2px)}
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kegiatan & Agenda BSD</h1>
          <p className="page-subtitle">Jadwal kegiatan sekolah, hari spesial, dan galeri momen belajar anak Anda.</p>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["agenda", "galeri"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 22px", borderRadius: "var(--radius-full)", border: "1.5px solid", fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all .15s",
              background: tab === t ? "var(--color-primary)" : "white",
              color: tab === t ? "white" : "var(--color-text-secondary)",
              borderColor: tab === t ? "var(--color-primary)" : "var(--color-border)",
            }}>
            {t === "agenda" ? "Agenda & Jadwal" : "Galeri Kegiatan"}
          </button>
        ))}
      </div>

      {/* Konten Agenda */}
      {tab === "agenda" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {agendaKegiatan.map(k => (
            <div key={k.id} className="kartu-keg card" style={{ padding: 24, borderLeft: `4px solid ${k.warna}` }} onClick={() => setDipilih(k)}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bgWarna, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {k.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{k.judul}</span>
                      {k.wajib && <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>WAJIB</span>}
                      <span style={{ ...kategoriWarna[k.kategori], fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{k.kategori}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                        {k.tanggal}
                      </span>
                      <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                        {k.jam}
                      </span>
                      <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                        {k.lokasi}
                      </span>
                    </div>
                  </div>
                </div>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Konten Galeri */}
      {tab === "galeri" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {galeriKegiatan.map(g => (
              <div key={g.id} className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: 160, background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", color: "white" }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Foto Kegiatan</div>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{g.judul}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{g.deskripsi}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "#f8fafc", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 4 }}>Galeri akan terus diperbarui</div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Foto kegiatan terbaru akan ditambahkan oleh admin setelah setiap acara berlangsung.</div>
          </div>
        </div>
      )}

      {/* Modal Detail Kegiatan */}
      {dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(.16,1,.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: dipilih.bgWarna, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{dipilih.emoji}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{dipilih.judul}</div>
                  <span style={{ ...kategoriWarna[dipilih.kategori], fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{dipilih.kategori}</span>
                </div>
              </div>
              <button onClick={() => setDipilih(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Tanggal", val: dipilih.tanggal },
                { label: "Waktu", val: dipilih.jam },
                { label: "Lokasi", val: dipilih.lokasi },
                { label: "Peserta", val: dipilih.peserta },
              ].map(item => (
                <div key={item.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{item.val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              {dipilih.deskripsi}
            </div>

            {dipilih.wajib && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 600, marginBottom: 16 }}>
                Kegiatan ini <strong>wajib dihadiri</strong> oleh siswa.
              </div>
            )}

            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setDipilih(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Tambahkan definisi warnaKategori di dalam komponen agar bisa diakses di modal
const kategoriWarna: Record<string, { bg: string; color: string }> = {
  "Wisuda":         { bg: "#ede9fe", color: "#7c3aed" },
  "Akademik":       { bg: "#dbeafe", color: "#1d4ed8" },
  "Kegiatan Khusus":{ bg: "#fef3c7", color: "#d97706" },
  "Libur":          { bg: "#fee2e2", color: "#dc2626" },
};
