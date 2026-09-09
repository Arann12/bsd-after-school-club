"use client";
import { useState } from "react";

const dataSiswa = [
  { id: "STD-001", nama: "Andi Setiawan", hadir: null as boolean | null },
  { id: "STD-003", nama: "Citra Kirana", hadir: null as boolean | null },
  { id: "STD-004", nama: "Dian Pratama", hadir: null as boolean | null },
  { id: "STD-006", nama: "Fitri Handayani", hadir: null as boolean | null },
  { id: "STD-008", nama: "Hana Pertiwi", hadir: null as boolean | null },
  { id: "STD-009", nama: "Ivan Kurnia", hadir: null as boolean | null },
];

type StatusKehadiran = "hadir" | "sakit" | "izin" | "alpha" | "libur";

export default function GuruKelasPage({ params }: { params: { id: string } }) {
  const [kehadiran, setKehadiran] = useState<Record<string, StatusKehadiran>>({});
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");
  const [sudahSimpan, setSudahSimpan] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const sudahDiabsen = Object.keys(kehadiran).length;
  const totalSiswa = dataSiswa.length;
  const persenAbsen = Math.round((sudahDiabsen / totalSiswa) * 100);

  const setStatusKehadiran = (idSiswa: string, status: StatusKehadiran) => {
    setKehadiran(prev => ({ ...prev, [idSiswa]: status }));
  };

  const simpanLogbook = () => {
    if (sudahDiabsen < totalSiswa || !materi.trim()) return;
    setSedangSimpan(true);
    setTimeout(() => { setSedangSimpan(false); setSudahSimpan(true); }, 1500);
  };

  const warnaStatus: Record<StatusKehadiran, { bg: string; color: string; label: string }> = {
    hadir:  { bg: "#d1fae5", color: "#059669", label: "Hadir" },
    sakit:  { bg: "#fce7f3", color: "#be185d", label: "Sakit" },
    izin:   { bg: "#fef3c7", color: "#b45309", label: "Izin" },
    alpha:  { bg: "#fee2e2", color: "#dc2626", label: "Alpha" },
    libur:  { bg: "#e0f2fe", color: "#0369a1", label: "Libur" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes munculMasuk { from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .tombol-absen { transition: all .15s ease; border: 2px solid transparent; }
        .tombol-absen:hover { transform: translateY(-1px); }
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">KLS-A — Calistung Level 1</h1>
          <p className="page-subtitle">Pertemuan ke-7 dari 12 · Senin, 2 September 2026 · 14:00–15:00 · Ruang 1</p>
        </div>
        <span style={{ background: "#d1fae5", color: "#059669", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 999 }}>
          Sesi Berjalan
        </span>
      </div>

      {/* Progress Absensi */}
      <div className="card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>Progress Absensi</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{sudahDiabsen}/{totalSiswa} siswa</span>
        </div>
        <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: "var(--color-primary)", width: `${persenAbsen}%`, transition: "width .3s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>{persenAbsen}% sudah diabsen</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Panel Absensi */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Daftar Kehadiran</h2></div>
          <div className="card-body" style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
            {dataSiswa.map((siswa, i) => {
              const st = kehadiran[siswa.id];
              return (
                <div key={siswa.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < dataSiswa.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  {/* Avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: st ? warnaStatus[st].bg : "var(--color-bg)", color: st ? warnaStatus[st].color : "var(--color-text-muted)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${st ? warnaStatus[st].color : "var(--color-border)"}`, transition: "all .2s ease" }}>
                    {siswa.nama[0]}
                  </div>

                  {/* Nama */}
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{siswa.nama}</span>

                  {/* Tombol 5 Status Absensi */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(["hadir", "sakit", "izin", "alpha", "libur"] as StatusKehadiran[]).map(s => (
                      <button key={s} className="tombol-absen"
                        onClick={() => setStatusKehadiran(siswa.id, s)}
                        style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                          background: st === s ? warnaStatus[s].bg : "transparent",
                          color: st === s ? warnaStatus[s].color : "var(--color-text-muted)",
                          borderColor: st === s ? warnaStatus[s].color : "var(--color-border)",
                          animation: st === s ? "bounce .2s ease" : "none",
                        }}>
                        {warnaStatus[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Ringkasan */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 16 }}>
            {(["hadir","sakit","izin","alpha","libur"] as StatusKehadiran[]).map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: warnaStatus[s].color }} />
                <span style={{ color: "var(--color-text-secondary)" }}>{warnaStatus[s].label}:</span>
                <span style={{ fontWeight: 700, color: warnaStatus[s].color }}>
                  {Object.values(kehadiran).filter(v => v === s).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Logbook */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><h2 className="card-title">Materi Hari Ini</h2></div>
            <div className="card-body">
              <textarea
                value={materi} onChange={e => setMateri(e.target.value)}
                placeholder="Tulis topik/materi yang diajarkan hari ini..."
                style={{ width: "100%", minHeight: 120, padding: "12px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s ease, box-shadow .2s ease" }}
                onFocus={e => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title">Catatan Tambahan</h2></div>
            <div className="card-body">
              <textarea
                value={catatan} onChange={e => setCatatan(e.target.value)}
                placeholder="Catatan perilaku, kendala, atau hal penting lainnya... (opsional)"
                style={{ width: "100%", minHeight: 90, padding: "12px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s ease, box-shadow .2s ease" }}
                onFocus={e => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Validasi & Tombol Simpan */}
          {(sudahDiabsen < totalSiswa || !materi.trim()) && (
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#92400e" }}>
              Lengkapi absensi semua siswa dan isi materi sebelum menyimpan logbook.
            </div>
          )}

          <button onClick={simpanLogbook}
            disabled={sudahDiabsen < totalSiswa || !materi.trim() || sudahSimpan || sedangSimpan}
            style={{ width: "100%", padding: "13px", borderRadius: "var(--radius-md)", border: "none", fontWeight: 700, fontSize: 14, cursor: sudahSimpan || sedangSimpan ? "not-allowed" : "pointer", transition: "all .2s ease",
              background: sudahSimpan ? "#d1fae5" : sudahDiabsen < totalSiswa || !materi.trim() ? "var(--color-border)" : "var(--color-primary)",
              color: sudahSimpan ? "#059669" : sudahDiabsen < totalSiswa || !materi.trim() ? "var(--color-text-muted)" : "white",
            }}>
            {sedangSimpan ? "Menyimpan..." : sudahSimpan ? "Logbook Berhasil Disimpan!" : "Simpan Absensi & Logbook"}
          </button>
        </div>
      </div>
    </div>
  );
}
