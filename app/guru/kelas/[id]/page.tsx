"use client";
import { useState, useEffect, useCallback, use } from "react";
import { getClassroomById, getClassSessions, submitAttendanceAndLogbook, type Classroom, type ClassSession, type SubmitAttendancePayload } from "@/lib/api/academic";
import { SkeletonTable } from "@/components/ui/Skeleton";

type StatusKehadiran = "present" | "absent" | "late" | "excused";

export default function GuruKelasPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = use(params as Promise<{ id: string }>);
  const classId = unwrappedParams.id;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [session, setSession] = useState<ClassSession | null>(null);
  
  const [kehadiran, setKehadiran] = useState<Record<string, StatusKehadiran>>({});
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [sudahSimpan, setSudahSimpan] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clsRes, sessionsRes] = await Promise.allSettled([
        getClassroomById(classId),
        getClassSessions({ per_page: 500 }) // Ambil sesi guru
      ]);

      if (clsRes.status === "fulfilled") {
        setClassroom(clsRes.value);
      } else {
        throw new Error("Gagal mengambil data kelas.");
      }

      if (sessionsRes.status === "fulfilled") {
        const allSessions = Array.isArray(sessionsRes.value) ? sessionsRes.value : [];

        // Use local date to avoid UTC timezone shift
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        
        console.log("[GuruKelas] classId:", classId, "today:", today, "total sessions:", allSessions.length);
        console.log("[GuruKelas] sessions for this class:", allSessions.filter((s: ClassSession) => s.classroomId === classId));

        // Cari sesi untuk kelas ini pada hari ini
        let todaySession = allSessions.find((s: ClassSession) => 
           s.classroomId === classId && s.sessionDate?.substring(0, 10) === today
        );
        
        // Jika tidak ada sesi hari ini, ambil sesi terdekat yang belum selesai
        if (!todaySession) {
           const upcoming = allSessions
             .filter((s: ClassSession) => s.classroomId === classId && s.status !== "completed")
             .sort((a: any, b: any) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
           if (upcoming.length > 0) {
              todaySession = upcoming[0];
           }
           // Juga cari sesi sebelumnya yang belum selesai (hari yang lebih lama)
           if (!todaySession) {
             const past = allSessions
               .filter((s: ClassSession) => s.classroomId === classId)
               .sort((a: any, b: any) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
             if (past.length > 0) todaySession = past[0];
           }
        }
        
        if (todaySession) {
          setSession(todaySession);
          // Inisialisasi absensi & logbook jika sudah ada
          if (todaySession.teacherLogbook) {
            setMateri(todaySession.teacherLogbook.material || "");
            setCatatan(todaySession.teacherLogbook.notes || "");
          }
          if (todaySession.studentAttendances && todaySession.studentAttendances.length > 0) {
            const attMap: Record<string, StatusKehadiran> = {};
            todaySession.studentAttendances.forEach((a: any) => {
              attMap[a.student_id] = a.attendance_status;
            });
            setKehadiran(attMap);
            if (todaySession.status === "completed") {
               setSudahSimpan(true);
            }
          }
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dataSiswa = classroom?.students || [];
  const sudahDiabsen = Object.keys(kehadiran).length;
  const totalSiswa = dataSiswa.length;
  const persenAbsen = totalSiswa > 0 ? Math.round((sudahDiabsen / totalSiswa) * 100) : 0;

  const setStatusKehadiran = (idSiswa: string, status: StatusKehadiran) => {
    if (sudahSimpan) return;
    setKehadiran(prev => ({ ...prev, [idSiswa]: status }));
  };

  const simpanLogbook = async () => {
    if (!session) {
       alert("Tidak ada sesi yang dapat disimpan absensinya.");
       return;
    }
    if (sudahDiabsen < totalSiswa || !materi.trim()) return;
    
    setSedangSimpan(true);
    try {
      // Build full datetime strings for check_in/check_out (backend requires full date)
      const sessionDate = session.sessionDate ? session.sessionDate.substring(0, 10) : new Date().toISOString().split("T")[0];
      const startTimeStr = session.startTime ? session.startTime.substring(0, 5) : "14:00";
      const endTimeStr = session.endTime ? session.endTime.substring(0, 5) : "15:00";
      const checkIn = `${sessionDate} ${startTimeStr}:00`;
      const checkOut = `${sessionDate} ${endTimeStr}:00`;

      // Calculate teaching minutes from start/end
      const [sh, sm] = startTimeStr.split(":").map(Number);
      const [eh, em] = endTimeStr.split(":").map(Number);
      const teachingMins = Math.max(1, (eh * 60 + em) - (sh * 60 + sm));

      const payload: SubmitAttendancePayload = {
        students: dataSiswa.map(s => ({
          student_id: s.id,
          attendance_status: kehadiran[s.id] || "absent",
          notes: catatan || undefined
        })),
        logbook: {
          check_in: checkIn,
          check_out: checkOut,
          teaching_minutes: teachingMins,
          material: materi,
          notes: catatan || undefined
        }
      };
      
      await submitAttendanceAndLogbook(session.id, payload);
      setSudahSimpan(true);
    } catch (e: any) {
      const backendMsg = e?.response?.data?.message
        || e?.response?.data?.errors
        || e?.message
        || "Gagal menyimpan absensi & logbook.";
      const detail = typeof backendMsg === "object" ? JSON.stringify(backendMsg) : backendMsg;
      alert("Gagal menyimpan: " + detail);
      console.error("Submit attendance error:", e?.response?.data || e);
    } finally {
      setSedangSimpan(false);
    }
  };

  const warnaStatus: Record<StatusKehadiran, { bg: string; color: string; label: string }> = {
    present:  { bg: "#d1fae5", color: "#059669", label: "Hadir" },
    absent:  { bg: "#fce7f3", color: "#be185d", label: "Alpha/Sakit" },
    excused:   { bg: "#fef3c7", color: "#b45309", label: "Izin" },
    late:  { bg: "#e0f2fe", color: "#0369a1", label: "Terlambat" },
  };

  if (loading) return <SkeletonTable rows={3} cols={2} />;

  if (errorMsg) {
     return <div style={{ color: "red", padding: 20 }}>Error: {errorMsg}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes munculMasuk { from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .tombol-absen { transition: all .15s ease; border: 2px solid transparent; }
        .tombol-absen:hover { transform: translateY(-1px); }
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{classroom?.name} — {classroom?.programLevel?.name || "Program"}</h1>
          <p className="page-subtitle">
            {session ? (
              `Pertemuan ke-${session.sessionNumber} · ${new Date(session.sessionDate || "").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${session.startTime?.substring(0,5)}–${session.endTime?.substring(0,5)}`
            ) : (
              "Belum ada sesi hari ini"
            )}
          </p>
        </div>
        <span style={{ background: session?.status === "completed" ? "#d1fae5" : "#e0f2fe", color: session?.status === "completed" ? "#059669" : "#0369a1", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 999 }}>
          {session?.status === "completed" ? "Selesai" : (session ? "Sesi Berjalan" : "Tidak Ada Sesi")}
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
            {dataSiswa.length === 0 ? (
               <div style={{ padding: 20, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>Belum ada siswa di kelas ini.</div>
            ) : (
              dataSiswa.map((siswa, i) => {
                const st = kehadiran[siswa.id];
                return (
                  <div key={siswa.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < dataSiswa.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: st ? warnaStatus[st].bg : "var(--color-bg)", color: st ? warnaStatus[st].color : "var(--color-text-muted)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${st ? warnaStatus[st].color : "var(--color-border)"}`, transition: "all .2s ease" }}>
                      {siswa.name[0]?.toUpperCase()}
                    </div>

                    {/* Nama */}
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{siswa.name}</span>

                    {/* Tombol Status Absensi */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {(["present", "excused", "late", "absent"] as StatusKehadiran[]).map(s => (
                        <button key={s} className="tombol-absen"
                          onClick={() => setStatusKehadiran(siswa.id, s)}
                          style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: sudahSimpan ? "not-allowed" : "pointer",
                            background: st === s ? warnaStatus[s].bg : "transparent",
                            color: st === s ? warnaStatus[s].color : "var(--color-text-muted)",
                            borderColor: st === s ? warnaStatus[s].color : "var(--color-border)",
                            animation: st === s ? "bounce .2s ease" : "none",
                            opacity: sudahSimpan && st !== s ? 0.5 : 1
                          }}>
                          {warnaStatus[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Ringkasan */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 16 }}>
            {(["present", "excused", "late", "absent"] as StatusKehadiran[]).map(s => (
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
                readOnly={sudahSimpan}
                style={{ width: "100%", minHeight: 120, padding: "12px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s ease, box-shadow .2s ease", backgroundColor: sudahSimpan ? "var(--color-bg)" : "white" }}
                onFocus={e => { if(!sudahSimpan) { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)"; } }}
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
                readOnly={sudahSimpan}
                style={{ width: "100%", minHeight: 90, padding: "12px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s ease, box-shadow .2s ease", backgroundColor: sudahSimpan ? "var(--color-bg)" : "white" }}
                onFocus={e => { if(!sudahSimpan) { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)"; } }}
                onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Validasi & Tombol Simpan */}
          {!session && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#b91c1c" }}>
              Tidak ada sesi berjalan yang tersedia untuk diabsen. 
            </div>
          )}
          {session && (sudahDiabsen < totalSiswa || !materi.trim()) && !sudahSimpan && (
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#92400e" }}>
              Lengkapi absensi semua siswa dan isi materi sebelum menyimpan logbook.
            </div>
          )}

          <button onClick={simpanLogbook}
            disabled={!session || sudahDiabsen < totalSiswa || !materi.trim() || sudahSimpan || sedangSimpan || totalSiswa === 0}
            style={{ width: "100%", padding: "13px", borderRadius: "var(--radius-md)", border: "none", fontWeight: 700, fontSize: 14, cursor: sudahSimpan || sedangSimpan || !session || totalSiswa === 0 ? "not-allowed" : "pointer", transition: "all .2s ease",
              background: sudahSimpan ? "#d1fae5" : sudahDiabsen < totalSiswa || !materi.trim() || !session || totalSiswa === 0 ? "var(--color-border)" : "var(--color-primary)",
              color: sudahSimpan ? "#059669" : sudahDiabsen < totalSiswa || !materi.trim() || !session || totalSiswa === 0 ? "var(--color-text-muted)" : "white",
            }}>
            {sedangSimpan ? "Menyimpan..." : sudahSimpan ? "Logbook Berhasil Disimpan!" : "Simpan Absensi & Logbook"}
          </button>
        </div>
      </div>
    </div>
  );
}
