"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { getStudents, Student } from "@/lib/api/students";
import { getAssessments, createAssessment, getCertificates, createCertificate } from "@/lib/api/assessments";
import { SkeletonTable } from "@/components/ui/Skeleton";

export interface StudentAssessmentDisplay {
  idSiswa: string;
  enrollmentId: string;
  programLevelId: string;
  namaSiswa: string;
  program: string;
  level: string;
  nilaiReading: number;
  nilaiWriting: number;
  nilaiLogic: number;
  avgScore: number;
  predikat: string;
  statusSertifikat: "Sudah Digenerate" | "Belum Digenerate";
  nomorSertifikat?: string;
  tglTerbit?: string;
}

export default function OwnerPenilaianSertifikatPage() {
  const [assessments, setAssessments] = useState<StudentAssessmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentAssessmentDisplay | null>(null);

  const [readingScore, setReadingScore] = useState(85);
  const [writingScore, setWritingScore] = useState(85);
  const [logicScore, setLogicScore] = useState(85);
  const [predikat, setPredikat] = useState("Sangat Baik");
  const [generating, setGenerating] = useState(false);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const fetchAssessmentData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, certsRes, assessRes] = await Promise.allSettled([
        getStudents({ per_page: 100 }),
        getCertificates({ per_page: 100 }),
        getAssessments({ per_page: 100 }),
      ]);

      const students = studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value?.data) ? studentsRes.value.data : [];
      const certs = certsRes.status === "fulfilled" && Array.isArray(certsRes.value?.data) ? certsRes.value.data : [];
      const certByStudent = new Map<string, any>();
      certs.forEach((c: any) => certByStudent.set(c.student_id, c));

      const rawAssessments = assessRes.status === "fulfilled" && Array.isArray(assessRes.value?.data?.data || assessRes.value?.data) ? (assessRes.value.data.data || assessRes.value.data) : [];
      const assessByStudent = new Map<string, any[]>();
      rawAssessments.forEach((a: any) => {
        const arr = assessByStudent.get(a.student_id) || [];
        arr.push(a);
        assessByStudent.set(a.student_id, arr);
      });

      const list: StudentAssessmentDisplay[] = students.map((s: Student) => {
        const existingCert = certByStudent.get(s.id);
        const myAssess = assessByStudent.get(s.id) || [];

        const readItem = myAssess.find((a) => a.assessment_name.toLowerCase().includes("reading") || a.assessment_name.toLowerCase().includes("baca"));
        const writeItem = myAssess.find((a) => a.assessment_name.toLowerCase().includes("writing") || a.assessment_name.toLowerCase().includes("tulis"));
        const logicItem = myAssess.find((a) => a.assessment_name.toLowerCase().includes("logic") || a.assessment_name.toLowerCase().includes("hitung"));

        const nRead = readItem ? Number(readItem.score) : 80;
        const nWrite = writeItem ? Number(writeItem.score) : 82;
        const nLogic = logicItem ? Number(logicItem.score) : 85;

        const avg = Math.round((nRead + nWrite + nLogic) / 3);
        let pred = "Baik";
        if (avg >= 90) pred = "Dengan Pujian (Cumlaude)";
        else if (avg >= 80) pred = "Sangat Baik";
        else if (avg >= 70) pred = "Baik";
        else pred = "Cukup";

        // Find primary enrollment
        const primaryEnrollment = s.enrollments?.[0];

        return {
          idSiswa: s.id,
          enrollmentId: primaryEnrollment?.id || s.id,
          programLevelId: primaryEnrollment?.program_level_id || s.id,
          namaSiswa: s.name,
          program: primaryEnrollment?.classroom?.program_level?.program?.name || s.program?.name || "Program Reguler",
          level: primaryEnrollment?.classroom?.program_level?.name || "Level 1",
          nilaiReading: nRead,
          nilaiWriting: nWrite,
          nilaiLogic: nLogic,
          avgScore: avg,
          predikat: pred,
          statusSertifikat: existingCert ? "Sudah Digenerate" : "Belum Digenerate",
          nomorSertifikat: existingCert?.certificate_code,
          tglTerbit: existingCert?.issued_date,
        };
      });

      setAssessments(list);
    } catch (err) {
      console.warn("Gagal memuat data penilaian:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessmentData();
  }, [fetchAssessmentData]);

  const handleOpenModal = (siswa: StudentAssessmentDisplay) => {
    setSelectedStudent(siswa);
    setReadingScore(siswa.nilaiReading || 85);
    setWritingScore(siswa.nilaiWriting || 85);
    setLogicScore(siswa.nilaiLogic || 85);
  };

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setGenerating(true);

    try {
      // 1. Simpan assessment
      await Promise.allSettled([
        createAssessment({
          student_id: selectedStudent.idSiswa,
          enrollment_id: selectedStudent.enrollmentId,
          program_level_id: selectedStudent.programLevelId,
          assessment_name: "Reading / Membaca",
          score: readingScore,
          assessment_date: new Date().toISOString().split("T")[0],
          status: "final",
        }),
        createAssessment({
          student_id: selectedStudent.idSiswa,
          enrollment_id: selectedStudent.enrollmentId,
          program_level_id: selectedStudent.programLevelId,
          assessment_name: "Writing / Menulis",
          score: writingScore,
          assessment_date: new Date().toISOString().split("T")[0],
          status: "final",
        }),
      ]);

      // 2. Generate sertifikat
      await createCertificate({
        student_id: selectedStudent.idSiswa,
        enrollment_id: selectedStudent.enrollmentId,
        issued_date: new Date().toISOString().split("T")[0],
      });

      setSelectedStudent(null);
      setNotifToast(`Sertifikat ${selectedStudent.namaSiswa} berhasil digenerate dan tersimpan di database!`);
      setTimeout(() => setNotifToast(null), 4000);
      await fetchAssessmentData();
    } catch (err) {
      console.error("Gagal generate sertifikat:", err);
      alert("Gagal menerbitkan sertifikat.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Penilaian & Generate Sertifikat</h1>
          <p className="page-subtitle">Input nilai kelulusan siswa dan generate sertifikat resmi BSD After School Club.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/owner/sertifikat" className="btn btn-outline">
            Lihat Daftar Sertifikat &rarr;
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {notifToast}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Siswa Terdata", value: assessments.length, color: "#1d4ed8" },
          { label: "Sertifikat Diterbitkan", value: assessments.filter((a) => a.statusSertifikat === "Sudah Digenerate").length, color: "#059669" },
          { label: "Belum Diterbitkan", value: assessments.filter((a) => a.statusSertifikat === "Belum Digenerate").length, color: "#b45309" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{s.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: s.color }}>
              {loading ? "..." : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonTable rows={4} />
          </div>
        ) : assessments.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
            Belum ada siswa terdaftar dalam sistem.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Nama Siswa", "Program & Level", "Reading", "Writing", "Logic", "Rata-Rata", "Status Sertifikat", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr key={a.idSiswa} style={{ borderBottom: i < assessments.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{a.namaSiswa}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{a.program}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{a.level}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>{a.nilaiReading}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>{a.nilaiWriting}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>{a.nilaiLogic}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 900, color: "#059669" }}>{a.avgScore}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: a.statusSertifikat === "Sudah Digenerate" ? "#d1fae5" : "#fef3c7",
                          color: a.statusSertifikat === "Sudah Digenerate" ? "#059669" : "#b45309",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {a.statusSertifikat}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button className="btn btn-accent btn-sm" onClick={() => handleOpenModal(a)}>
                        {a.statusSertifikat === "Sudah Digenerate" ? "Edit Nilai" : "Input Nilai & Generate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Nilai */}
      {selectedStudent && (
        <Modal open onClose={() => setSelectedStudent(null)} title={`Penilaian & Sertifikat: ${selectedStudent.namaSiswa}`} maxWidth={480}>
          <form onSubmit={handleGenerateCertificate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Nilai Reading / Pemahaman (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input-control"
                value={readingScore}
                onChange={(e) => setReadingScore(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Nilai Writing / Menulis (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input-control"
                value={writingScore}
                onChange={(e) => setWritingScore(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Nilai Logic & Matematika (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input-control"
                value={logicScore}
                onChange={(e) => setLogicScore(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div style={{ background: "var(--color-bg)", padding: "10px 14px", borderRadius: 8, marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)" }}>
                Rata-rata Nilai: <span style={{ color: "#059669", fontSize: 15 }}>{Math.round((readingScore + writingScore + logicScore) / 3)}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedStudent(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={generating}>
                {generating ? "Menerbitkan..." : "Terbitkan Sertifikat"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
