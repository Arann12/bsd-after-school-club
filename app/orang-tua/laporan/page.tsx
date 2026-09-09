"use client";
import { useState } from "react";
import Link from "next/link";

// Status siswa diambil dari data — gunakan useState untuk simulasi demo
// Di produksi: status ini datang dari API/database berdasarkan session user

const dataLaporan = {
  nama: "Andi Setiawan",
  id: "STD-2026-0001",
  program: "Calistung Level 1",
  kelas: "KLS-A",
  guru: "Ms. Sarah",
  periode: "Juli – September 2026",
  totalSesi: 12,
  hadir: 11,
  izin: 1,
  alpha: 0,
  nilai: {
    sikap: 90,
    kehadiran: 92,
    assessment: 85,
    praktik: 88,
    akhir: 88,
  },
  predikat: "Sangat Baik",
  luluskan: true,
  catatan: "Andi menunjukkan perkembangan yang sangat baik dalam membaca suku kata dan menulis angka. Perlu terus berlatih kelancaran membaca kalimat panjang.",
};

export default function OrangTuaLaporanPage() {
  // Toggle untuk simulasi: di produksi ini datang dari data siswa via API
  const [simulasiGraduated, setSimulasiGraduated] = useState(false);
  const [showSertifikat, setShowSertifikat] = useState(false);
  const isGraduated = simulasiGraduated;

  const nilaiWarna = (n: number) => n >= 85 ? "#059669" : n >= 70 ? "#d97706" : "#dc2626";

  if (!isGraduated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Laporan Akhir & Sertifikat</h1>
            <p className="page-subtitle">Laporan nilai akhir dan sertifikat kelulusan anak Anda.</p>
          </div>
        </div>

        {/* State Locked */}
        <div className="card" style={{ padding: "60px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-text-primary)", marginBottom: 10 }}>
            Laporan Belum Tersedia
          </div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 24px" }}>
            Laporan akhir dan sertifikat kelulusan akan dibuka setelah anak Anda menyelesaikan seluruh program dan dinyatakan <strong>Graduated</strong> oleh sistem.
          </div>

          {/* Progress Program */}
          <div style={{ background: "var(--color-bg)", borderRadius: 14, padding: "20px 24px", maxWidth: 380, margin: "0 auto 24px", textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 10 }}>Progress Program Andi Setiawan</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Pertemuan selesai</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-primary)" }}>7 / 12 Sesi</span>
            </div>
            <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--color-primary)", width: "58%", borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>58% — 5 sesi lagi untuk selesai</div>
          </div>

          <Link href="/orang-tua/absensi" className="btn btn-outline" style={{ textDecoration: "none" }}>
            Lihat Rekap Absensi
          </Link>
          {/* DEMO ONLY: toggle simulasi — di produksi status datang dari backend */}
          <div style={{ marginTop: 16, padding: "10px 16px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>Demo: Simulasi siswa Graduated</span>
            <button className="btn btn-outline btn-sm" style={{ fontSize: 11.5 }} onClick={() => setSimulasiGraduated(true)}>
              Buka Laporan (Graduated)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan saat sudah Graduated
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.6}}
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Akhir & Sertifikat</h1>
          <p className="page-subtitle">Laporan nilai akhir dan sertifikat kelulusan {dataLaporan.nama}.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowSertifikat(true)}>
          Lihat Sertifikat
        </button>
      </div>

      {/* Banner Lulus */}
      <div style={{ background: "linear-gradient(135deg, #059669, #10b981)", borderRadius: "var(--radius-lg)", padding: "20px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>Selamat! {dataLaporan.nama} telah menyelesaikan program!</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{dataLaporan.program} · {dataLaporan.periode}</div>
        </div>
      </div>

      {/* Info Umum */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Tingkat Kehadiran", val: `${Math.round((dataLaporan.hadir/dataLaporan.totalSesi)*100)}%`, warna: "#059669" },
          { label: "Total Sesi Hadir",  val: `${dataLaporan.hadir}/${dataLaporan.totalSesi}`, warna: "#1d4ed8" },
          { label: "Nilai Akhir",       val: `${dataLaporan.nilai.akhir}`, warna: nilaiWarna(dataLaporan.nilai.akhir) },
          { label: "Predikat",          val: dataLaporan.predikat, warna: "#7c3aed" },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: k.warna }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Rincian Nilai */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 18px" }}>Rincian Komponen Nilai</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { komponen: "Sikap & Ketertiban",    nilai: dataLaporan.nilai.sikap,     bobot: "20%" },
            { komponen: "Kehadiran",              nilai: dataLaporan.nilai.kehadiran, bobot: "20%" },
            { komponen: "Assessment / Ujian",     nilai: dataLaporan.nilai.assessment, bobot: "40%" },
            { komponen: "Praktik / Demo",         nilai: dataLaporan.nilai.praktik,   bobot: "20%" },
          ].map(n => (
            <div key={n.komponen}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{n.komponen}</span>
                  <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginLeft: 8 }}>Bobot {n.bobot}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: nilaiWarna(n.nilai) }}>{n.nilai}</span>
              </div>
              <div style={{ height: 7, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", background: nilaiWarna(n.nilai), width: `${n.nilai}%`, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Nilai Akhir Box */}
        <div style={{ marginTop: 20, padding: "16px 20px", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1.5px solid #86efac", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>Nilai Akhir Keseluruhan</div>
            <div style={{ fontSize: 12, color: "#166534", marginTop: 2 }}>Rata-rata tertimbang semua komponen</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#15803d" }}>{dataLaporan.nilai.akhir}</div>
        </div>
      </div>

      {/* Catatan Guru */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Catatan dari Guru</h2>
        <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.75, fontStyle: "italic", borderLeft: "4px solid var(--color-primary)" }}>
          "{dataLaporan.catatan}"
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--color-text-muted)" }}>— {dataLaporan.guru}, Guru Pengampu {dataLaporan.program}</div>
      </div>

      {/* Modal Preview Sertifikat */}
      {showSertifikat && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease" }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 600, width: "100%", padding: 0, boxShadow: "0 25px 60px rgba(0,0,0,.3)", animation: "modalIn .3s cubic-bezier(.16,1,.3,1)", overflow: "hidden" }}>
            {/* Sertifikat Visual */}
            <div style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #1d4ed8 50%, #7c3aed 100%)", padding: "40px 48px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 24 }}>BSD AFTER SCHOOL CLUB</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 8 }}>Dengan bangga mempersembahkan sertifikat kepada</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 8 }}>{dataLaporan.nama}</div>
              <div style={{ width: 80, height: 3, background: "rgba(255,255,255,.4)", margin: "0 auto 20px", borderRadius: 999 }} />
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 6 }}>Telah berhasil menyelesaikan program</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24", marginBottom: 4 }}>{dataLaporan.program}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", marginBottom: 20 }}>{dataLaporan.periode}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", borderRadius: 999, padding: "8px 20px" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Predikat: {dataLaporan.predikat}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 24 }}>BSD After School Club · 2026</div>
            </div>

            <div style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowSertifikat(false)}>Tutup</button>
              <button className="btn btn-accent" onClick={(e) => { (e.currentTarget as HTMLButtonElement).innerText = "File PDF Terunduh!"; setTimeout(() => setShowSertifikat(false), 1500); }}>
                Unduh Sertifikat PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
