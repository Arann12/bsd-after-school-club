"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getAssessments, createAssessment } from "@/lib/api/assessments";
import { getStudents, Student } from "@/lib/api/students";
import { SkeletonCard } from "@/components/ui/Skeleton";

export interface ProgressItemDisplay {
  id: string;
  namaSiswa: string;
  kelas: string;
  program: string;
  level: string;
  tglUpdate: string;
  indikatorCapai: string[];
  catatanGuru: string;
  skorNilai: number;
}

export default function GuruProgressPage() {
  const [progressList, setProgressList] = useState<ProgressItemDisplay[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [indikatorText, setIndikatorText] = useState("");
  const [catatan, setCatatan] = useState("");
  const [skor, setSkor] = useState(88);
  const [submitting, setSubmitting] = useState(false);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assessRes, studentsRes] = await Promise.allSettled([
        getAssessments({ per_page: 100 }),
        getStudents({ per_page: 100 }),
      ]);

      const rawAssessments = assessRes.status === "fulfilled" && Array.isArray(assessRes.value?.data?.data || assessRes.value?.data) ? (assessRes.value.data.data || assessRes.value.data) : [];
      const studentList = studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value?.data) ? studentsRes.value.data : [];

      setStudents(studentList);
      if (studentList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentList[0].id);
      }

      const mapped: ProgressItemDisplay[] = rawAssessments.map((a: any) => {
        const student = a.student || a.enrollment?.student;
        const studentName = student?.name || student?.full_name || "Siswa";
        const classroom = a.enrollment?.classroom?.name || "Kelas Reguler";
        const program = a.enrollment?.classroom?.program_level?.program?.name || "Program Belajar";
        const level = a.programLevel?.name || a.enrollment?.programLevel?.name || "Level 1";

        const dateStr = a.assessment_date || a.created_at;
        const formattedDate = dateStr
          ? new Date(dateStr).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

        return {
          id: a.id?.substring(0, 8).toUpperCase() || "PRG-001",
          namaSiswa: studentName,
          kelas: classroom,
          program: program,
          level: level,
          tglUpdate: formattedDate,
          indikatorCapai: [a.assessment_name || "Penguasaan Materi Sesi"],
          catatanGuru: a.notes || `Penilaian performa pembelajaran siswa dengan skor ${a.score}.`,
          skorNilai: Number(a.score || 85),
        };
      });

      setProgressList(mapped);
    } catch (err) {
      console.warn("Gagal memuat data progress guru:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const primaryEnrollment = st.enrollments?.[0];
    setSubmitting(true);

    try {
      await createAssessment({
        student_id: st.id,
        enrollment_id: primaryEnrollment?.id || st.id,
        program_level_id: primaryEnrollment?.program_level_id || st.id,
        assessment_name: indikatorText || "Pencapaian Materi",
        score: skor,
        assessment_date: new Date().toISOString().split("T")[0],
        status: "final",
      });

      setShowInputModal(false);
      setIndikatorText("");
      setCatatan("");
      setNotifToast(`Progress belajar untuk ${st.name} berhasil disimpan!`);
      setTimeout(() => setNotifToast(null), 4000);
      await fetchData();
    } catch (err) {
      console.error("Gagal simpan progress:", err);
      alert("Gagal menyimpan progress belajar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress & Penilaian Belajar Siswa</h1>
          <p className="page-subtitle">Pencatatan perkembangan belajar siswa per program & level secara realtime.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowInputModal(true)}>
          + Input Progress Belajar Siswa
        </button>
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

      {/* Rincian Progress Siswa */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : progressList.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
          Belum ada catatan progress pembelajaran yang diinput. Klik <strong>+ Input Progress Belajar Siswa</strong> untuk mencatat capaian.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {progressList.map((p) => (
            <div key={p.id} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-muted)" }}>{p.id}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>{p.namaSiswa}</h3>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {p.kelas} · {p.program} ({p.level})
                  </div>
                </div>
                <div style={{ background: "#d1fae5", color: "#059669", fontSize: 16, fontWeight: 900, padding: "4px 12px", borderRadius: 999 }}>
                  {p.skorNilai}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Indikator Pembelajaran Tercapai
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.indikatorCapai.map((ind, idx) => (
                    <div key={idx} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, color: "#166534", fontWeight: 600 }}>
                      ✓ {ind}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--color-bg)", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>Catatan Guru: </span>
                {p.catatanGuru}
              </div>

              <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", textAlign: "right" }}>
                Diperbarui pada: {p.tglUpdate}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Input Progress */}
      {showInputModal && (
        <Modal open onClose={() => setShowInputModal(false)} title="Input Progress Belajar Siswa" maxWidth={500}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Pilih Siswa</label>
              <select
                className="select-control"
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.program?.name || "Reguler"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Indikator Pembelajaran / Topik Capaian</label>
              <input
                type="text"
                required
                className="input-control"
                value={indikatorText}
                onChange={(e) => setIndikatorText(e.target.value)}
                placeholder="Contoh: Mengenal Abjad Vokal & Membaca 2 Suku Kata"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Skor / Nilai Pemahaman (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input-control"
                value={skor}
                onChange={(e) => setSkor(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Catatan & Evaluasi Guru</label>
              <textarea
                rows={3}
                className="input-control"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan perkembangan belajar siswa..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowInputModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Progress"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
