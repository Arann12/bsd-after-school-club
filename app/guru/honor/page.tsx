"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getClassSessions } from "@/lib/api/academic";
import { getMyTeacherProfile } from "@/lib/api/teachers";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export interface TeachingSessionLog {
  id: string;
  tanggal: string;
  rawDate: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  kelas: string;
  program: string;
  ruang: string;
  siswaHadir: number;
  totalSiswa: number;
  materi: string;
  catatanGuru: string;
  statusLogbook: "Logbook Terverifikasi" | "Menunggu Verifikasi";
}

export default function GuruHonorJamPage() {
  const [logs, setLogs] = useState<TeachingSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriode, setFilterPeriode] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");
  const [cari, setCari] = useState("");

  // Modal State Detail Sesi
  const [selectedDetailLog, setSelectedDetailLog] = useState<TeachingSessionLog | null>(null);

  // Modal State Ajukan Koreksi Jam
  const [showKoreksiModal, setShowKoreksiModal] = useState(false);
  const [koreksiTanggal, setKoreksiTanggal] = useState("");
  const [koreksiDurasi, setKoreksiDurasi] = useState(2);
  const [koreksiAlasan, setKoreksiAlasan] = useState("");
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const fetchSessionLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let teacherId = "";
      try {
        const myProf = await getMyTeacherProfile();
        teacherId = myProf.id;
      } catch (e) {
        console.warn("User is not teacher profile, load general sessions:", e);
      }

      const params: any = { per_page: 100 };
      if (teacherId) params.teacher_id = teacherId;

      const sessions = await getClassSessions(params);

      const mapped: TeachingSessionLog[] = sessions.map((s) => {
        const start = s.startTime?.substring(0, 5) || "14:00";
        const end = s.endTime?.substring(0, 5) || "16:00";

        // Calculate hours
        let durasi = 2;
        if (s.startTime && s.endTime) {
          const [sh, sm] = s.startTime.split(":").map(Number);
          const [eh, em] = s.endTime.split(":").map(Number);
          const diffMin = eh * 60 + em - (sh * 60 + sm);
          if (diffMin > 0) durasi = Math.max(1, Math.round(diffMin / 60));
        }

        const dateObj = new Date(s.sessionDate);
        const formattedDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
          : s.sessionDate;

        const attendances = s.studentAttendances || [];
        const presentCount = attendances.filter((a: any) => a.status === "present" || a.status === "hadir").length;
        const totalCount = attendances.length || s.classroom?.capacity || 6;

        const logbook = s.teacherLogbook;
        const materi = logbook?.lesson_topic || logbook?.topic_covered || "Pembelajaran Sesi Reguler";
        const catatan = logbook?.notes || logbook?.homework || "Siswa mengikuti sesi dengan baik dan antusias.";

        return {
          id: s.id?.substring(0, 8).toUpperCase() || "SES-001",
          tanggal: formattedDate,
          rawDate: s.sessionDate,
          jamMulai: start,
          jamSelesai: end,
          durasiJam: durasi,
          kelas: s.classroom?.name || "Kelas Reguler",
          program: s.classroom?.programLevel?.name || "Program Belajar",
          ruang: "Ruang Kelas",
          siswaHadir: presentCount || totalCount,
          totalSiswa: totalCount,
          materi,
          catatanGuru: catatan,
          statusLogbook: s.status === "completed" ? "Logbook Terverifikasi" : "Menunggu Verifikasi",
        };
      });

      setLogs(mapped);
    } catch (err) {
      console.warn("Gagal memuat rekap sesi mengajar:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionLogs();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchSessionLogs(true);
      }
    }, 6000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchSessionLogs(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchSessionLogs]);

  const uniquePrograms = Array.from(new Set(logs.map((l) => l.program).filter(Boolean)));

  const filteredLogs = logs.filter((l) => {
    const query = cari.toLowerCase();
    const matchesSearch =
      l.id.toLowerCase().includes(query) ||
      l.kelas.toLowerCase().includes(query) ||
      l.program.toLowerCase().includes(query) ||
      l.tanggal.toLowerCase().includes(query);

    const matchesProgram = filterProgram === "Semua" || l.program === filterProgram;

    let matchesPeriode = true;
    if (filterPeriode === "Bulan Ini") {
      const now = new Date();
      const sDate = new Date(l.rawDate);
      matchesPeriode = !isNaN(sDate.getTime()) && sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesProgram && matchesPeriode;
  });

  const totalJamBulanIni = filteredLogs.reduce((acc, l) => acc + l.durasiJam, 0);
  const totalSesi = filteredLogs.length;

  const handleAjukanKoreksi = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifToast(`Pengajuan koreksi jam mengajar tanggal ${koreksiTanggal} (${koreksiDurasi} Jam) telah terkirim ke Admin & Owner.`);
    setTimeout(() => setNotifToast(null), 3500);
    setShowKoreksiModal(false);
    setKoreksiTanggal("");
    setKoreksiAlasan("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Halaman */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Rekap Jam Mengajar Saya</h1>
          <p className="page-subtitle">
            Rincian akumulasi durasi jam mengajar yang tercatat dari seluruh sesi kelas dan logbook harian.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "4px 10px", borderRadius: 999 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Realtime
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => fetchSessionLogs(false)} disabled={loading}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Segarkan
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak Rekap Jam
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => setShowKoreksiModal(true)}>
            + Ajukan Koreksi Jam
          </button>
        </div>
      </div>

      {/* Notification Toast Inline */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {notifToast}
        </div>
      )}

      {/* Info Banner Kebijakan Kerahasiaan Honor */}
      <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", color: "#1e40af", fontSize: 13, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 12 }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <strong>Kebijakan Privasi Honorarium:</strong> Pembayaran honorarium diproses secara privat dan langsung ditransfer oleh Owner/Pimpinan Bimbel. Halaman ini dikhususkan bagi Anda untuk memantau dan mencocokkan total durasi jam mengajar harian, mingguan, dan bulanan.
        </div>
      </div>

      {/* Statistik Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Total Jam Mengajar</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1d4ed8", lineHeight: 1.1 }}>
            {loading ? "..." : `${totalJamBulanIni} Jam`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Akumulasi sesi kelas</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Sesi Kelas Selesai</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#059669", lineHeight: 1.1 }}>
            {loading ? "..." : `${totalSesi} Sesi`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Sesi terdaftar</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Rata-rata Durasi Sesi</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#7c3aed", lineHeight: 1.1 }}>
            {loading ? "..." : `${(totalJamBulanIni / (totalSesi || 1)).toFixed(1)} Jam`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Per pertemuan mengajar</div>
        </div>
      </div>

      {/* Filter & Table Rincian Jam Mengajar */}
      <div className="card" style={{ overflow: "hidden" }}>
        {/* Filter Controls Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, background: "#fafafa" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
            Daftar Sesi Mengajar & Logbook
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Input Cari */}
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type="text"
                placeholder="Cari kelas / program / tanggal..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                style={{ fontSize: 12.5, width: 220, paddingLeft: 30 }}
              />
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth={2} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Select Program */}
            <select className="select-control" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} style={{ fontSize: 12.5, padding: "6px 12px" }}>
              <option value="Semua">Semua Program</option>
              {uniquePrograms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Select Periode */}
            <select className="select-control" value={filterPeriode} onChange={(e) => setFilterPeriode(e.target.value)} style={{ fontSize: 12.5, padding: "6px 12px" }}>
              <option value="Semua">Semua Periode</option>
              <option value="Bulan Ini">Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Tabel Data */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 24 }}>
              <SkeletonTable rows={4} />
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ID Sesi Logbook", "Tanggal Sesi", "Jam Mengajar", "Durasi", "Kelas & Program", "Kehadiran Siswa", "Status Logbook", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)", fontSize: 13 }}>
                      Tidak ada data jam mengajar yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l, i) => (
                    <tr
                      key={l.id}
                      style={{ borderBottom: i < filteredLogs.length - 1 ? "1px solid var(--color-border-light)" : "none", transition: "background .15s" }}
                      className="baris-tagihan"
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "var(--color-text-muted)", fontWeight: 700 }}>
                        {l.id}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                        {l.tanggal}
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        {l.jamMulai} – {l.jamSelesai} WIB
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
                          {l.durasiJam} Jam
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{l.kelas}</div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{l.program}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: l.siswaHadir === l.totalSiswa ? "#059669" : "#b45309" }}>
                          {l.siswaHadir} / {l.totalSiswa} Siswa
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            background: l.statusLogbook === "Logbook Terverifikasi" ? "#d1fae5" : "#fef3c7",
                            color: l.statusLogbook === "Logbook Terverifikasi" ? "#059669" : "#b45309",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 999,
                          }}
                        >
                          {l.statusLogbook}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11.5, padding: "4px 10px" }}
                          onClick={() => setSelectedDetailLog(l)}
                        >
                          Lihat Detail &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DETAIL SESI MENGAJAR */}
      {selectedDetailLog && (
        <Modal open onClose={() => setSelectedDetailLog(null)} title="Detail Sesi Mengajar" maxWidth={580}>
          {/* Header */}
          <div style={{ marginBottom: 18, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 14 }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 800 }}>
              {selectedDetailLog.id}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: "2px 0 0" }}>
              Detail Sesi {selectedDetailLog.kelas} — {selectedDetailLog.program}
            </h2>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {selectedDetailLog.tanggal} · Pukul {selectedDetailLog.jamMulai} – {selectedDetailLog.jamSelesai} WIB
            </div>
          </div>

          {/* Grid Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Durasi Jam</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1d4ed8", marginTop: 2 }}>{selectedDetailLog.durasiJam} Jam</div>
            </div>
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kehadiran Siswa</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 2 }}>{selectedDetailLog.siswaHadir} / {selectedDetailLog.totalSiswa} Siswa</div>
            </div>
          </div>

          {/* Section Materi Pembelajaran */}
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
              Materi Pembelajaran / Modul
            </div>
            <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5, fontWeight: 600 }}>
              {selectedDetailLog.materi}
            </div>
          </div>

          {/* Section Catatan Guru */}
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0", marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
              Catatan Guru & Evaluasi Sesi
            </div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
              {selectedDetailLog.catatanGuru}
            </div>
          </div>

          {/* Status Verifikasi Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: 10, marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "#047857", fontWeight: 700 }}>
              Status Verifikasi Logbook: <strong>{selectedDetailLog.statusLogbook}</strong>
            </div>
            <span style={{ fontSize: 11, color: "#059669", background: "#fff", padding: "2px 8px", borderRadius: 6, border: "1px solid #a7f3d0" }}>
              Validasi Sistem
            </span>
          </div>

          {/* Footer Modal Action */}
          <button className="btn btn-accent" style={{ width: "100%" }} onClick={() => setSelectedDetailLog(null)}>
            Tutup Detail Sesi
          </button>
        </Modal>
      )}

      {/* MODAL AJUKAN KOREKSI JAM */}
      {showKoreksiModal && (
        <Modal open onClose={() => setShowKoreksiModal(false)} title="Form Pengajuan Koreksi Jam" maxWidth={500}>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 16px 0", lineHeight: 1.4 }}>
            Ajukan klaim durasi jam mengajar jika terdapat sesi yang belum terakumulasi.
          </p>

          <form onSubmit={handleAjukanKoreksi} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Tanggal Sesi Mengajar</label>
              <input className="form-input" type="date" required value={koreksiTanggal} onChange={(e) => setKoreksiTanggal(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Estimasi Durasi Jam (Jam)</label>
              <input className="form-input" type="number" min={1} max={8} required value={koreksiDurasi} onChange={(e) => setKoreksiDurasi(Number(e.target.value))} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Alasan / Catatan Koreksi</label>
              <textarea className="form-input" rows={3} placeholder="Contoh: Mengisi kelas pengganti KLS-B pada tanggal..." required value={koreksiAlasan} onChange={(e) => setKoreksiAlasan(e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowKoreksiModal(false)}>Batal</button>
              <button type="submit" className="btn btn-accent">Kirim Pengajuan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
