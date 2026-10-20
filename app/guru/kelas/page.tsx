"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getClassrooms, getClassSchedules, getClassSessions, type Classroom, type ClassSchedule, type ClassSession } from "@/lib/api/academic";

interface KelasTampil {
  id: string; // classroomId
  kelas: string;
  program: string;
  level: string;
  jadwal: string;
  ruang: string;
  siswa: number;
  pertemuan: number;
  totalPertemuan: number;
  siswaList: string[];
  statusHariIni: string;
  warna: string;
  bgWarna: string;
}

const HARI_MAP: Record<string, string> = {
  "monday": "Senin", "tuesday": "Selasa", "wednesday": "Rabu",
  "thursday": "Kamis", "friday": "Jumat", "saturday": "Sabtu", "sunday": "Minggu",
  "Senin": "Senin", "Selasa": "Selasa", "Rabu": "Rabu", "Kamis": "Kamis", "Jumat": "Jumat"
};

export default function GuruKelasListPage() {
  const [datakelas, setDatakelas] = useState<KelasTampil[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [dipilih, setDipilih] = useState<KelasTampil | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Backend automatically filters classrooms, schedules, sessions by the logged-in teacher
      const [classroomsRes, schedulesRes, sessionsRes] = await Promise.allSettled([
        getClassrooms({ per_page: 100 }),
        getClassSchedules(),
        getClassSessions({ per_page: 500 })
      ]);

      if (classroomsRes.status === "rejected") {
        console.error("Gagal memuat kelas:", classroomsRes.reason);
        setErrorMsg("Gagal memuat daftar kelas. Pastikan Anda sudah login sebagai guru.");
        return;
      }

      // Ambil data classrooms
      const clsData = classroomsRes.value;
      const classrooms: Classroom[] = Array.isArray(clsData?.data)
        ? clsData.data
        : Array.isArray(clsData)
        ? (clsData as unknown as Classroom[])
        : [];

      // Ambil data schedules
      const schedules: ClassSchedule[] = schedulesRes.status === "fulfilled"
        ? (Array.isArray(schedulesRes.value) ? schedulesRes.value : [])
        : [];

      // Ambil data sessions
      const sessions: ClassSession[] = sessionsRes.status === "fulfilled"
        ? (Array.isArray(sessionsRes.value) ? sessionsRes.value : [])
        : [];


      // Gunakan tanggal lokal
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const mapped = classrooms.map(c => {
        // Cari jadwal untuk kelas ini
        const scs = schedules.filter((s: ClassSchedule) => s.classroomId === c.id);
        const jadwalStr = scs.length > 0
          ? scs.map((s: ClassSchedule) => `${HARI_MAP[s.dayOfWeek] || s.dayOfWeek}, ${s.startTime?.substring(0,5)} - ${s.endTime?.substring(0,5)}`).join(" & ")
          : "Jadwal belum diatur";

        // Cari sesi untuk kelas ini
        const clsSessions = sessions.filter((s: ClassSession) => s.classroomId === c.id);
        const completedSessions = clsSessions.filter((s: ClassSession) => s.status === "completed").length;
        const totalSessions = clsSessions.length;

        // Status hari ini
        const hasSessionToday = clsSessions.some((s: ClassSession) => {
          const sd = s.sessionDate ? s.sessionDate.substring(0, 10) : "";
          return sd === today;
        });
        const statusHariIni = hasSessionToday ? "Siap Mulai" : "Mendatang";
        const warna = hasSessionToday ? "#059669" : "#d97706";
        const bgWarna = hasSessionToday ? "#d1fae5" : "#fef3c7";

        // Jumlah siswa
        const siswaCount = c.activeStudentsCount > 0 ? c.activeStudentsCount : (c.students?.length || 0);

        return {
          id: c.id,
          kelas: c.name,
          program: c.programLevel?.name || "Program Reguler",
          level: c.programLevel?.name || "-",
          jadwal: jadwalStr,
          ruang: "Ruang Kelas",
          siswa: siswaCount,
          pertemuan: completedSessions,
          totalPertemuan: totalSessions,
          siswaList: c.students?.map((st: any) => st.name) || [],
          statusHariIni,
          warna,
          bgWarna,
        };
      });

      setDatakelas(mapped);
    } catch (e: any) {
      console.error("Gagal memuat kelas:", e);
      setErrorMsg(e?.message || "Terjadi kesalahan saat memuat data kelas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <SkeletonTable rows={4} cols={3} />;

  if (errorMsg) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>Gagal Memuat Data</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{errorMsg}</div>
        <button className="btn btn-primary" onClick={fetchData}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
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
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Grid Kartu Kelas */}
      {datakelas.length === 0 ? (
         <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
           <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum ada kelas</div>
           <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Anda belum ditugaskan untuk mengajar di kelas manapun.</div>
         </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {datakelas.map(k => {
            const persen = k.totalPertemuan > 0 ? Math.round((k.pertemuan / k.totalPertemuan) * 100) : 0;
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
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-primary)" }}>
                      {k.totalPertemuan > 0 ? `${k.pertemuan}/${k.totalPertemuan} Sesi (${persen}%)` : `${k.pertemuan} Sesi Selesai`}
                    </span>
                  </div>
                  <div style={{ height: 7, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg, ${k.warna}, ${k.warna}cc)`, width: `${persen}%`, borderRadius: 999, transition: "width .4s ease" }} />
                  </div>
                </div>

                {/* Info Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "12px 0", borderTop: "1px solid var(--color-border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 600 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {k.siswa} Siswa
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Level: {k.level}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Link
                      href={`/guru/kelas/${k.id}?tab=penilaian`}
                      onClick={e => e.stopPropagation()}
                      className="btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: 12, textDecoration: "none" }}
                    >
                      Input Nilai
                    </Link>
                    <Link
                      href={`/guru/kelas/${k.id}`}
                      onClick={e => e.stopPropagation()}
                      className="btn btn-accent"
                      style={{ padding: "6px 14px", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                    >
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Mulai Sesi
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Kelas */}
      {dipilih && (
      <Modal open onClose={() => setDipilih(null)} title={`${dipilih.kelas} — ${dipilih.program}`} maxWidth={520}>
            {/* Info Detail */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Jadwal", val: dipilih?.jadwal },
                { label: "Ruangan", val: dipilih?.ruang },
                { label: "Pertemuan", val: dipilih?.totalPertemuan ? `${dipilih?.pertemuan} dari ${dipilih?.totalPertemuan} Sesi` : `${dipilih?.pertemuan} Sesi` },
                { label: "Status Hari Ini", val: dipilih?.statusHariIni },
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
                Daftar Siswa ({dipilih?.siswa})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dipilih?.siswaList.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", padding: 12 }}>Belum ada siswa terdaftar.</div>
                ) : (
                  dipilih?.siswaList.map((nama, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border-light)" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {nama.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{nama}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
              <Link
                href={`/guru/kelas/${dipilih?.id}?tab=penilaian`}
                className="btn btn-outline"
                style={{ textDecoration: "none", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12.5 }}
              >
                Input Nilai Kelas
              </Link>
              <Link
                href={`/guru/kelas/${dipilih?.id}`}
                className="btn btn-accent"
                style={{ textDecoration: "none", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5 }}
              >
                <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Mulai Sesi
              </Link>
            </div>
      </Modal>
      )}
    </div>
  );
}

