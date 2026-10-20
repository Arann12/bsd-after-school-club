"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { getStudents, Student } from "@/lib/api/students";
import {
  getAssessments,
  createAssessment,
  getCertificates,
  createCertificate,
  generateFinalReport,
  getFinalReports,
  AssessmentItem,
} from "@/lib/api/assessments";
import { SkeletonTable } from "@/components/ui/Skeleton";

export interface StudentGradingRow {
  studentId: string;
  studentName: string;
  enrollmentId: string;
  programLevelId: string;
  programName: string;
  levelName: string;
  classroomName: string;
  assessments: AssessmentItem[];
  averageScore: number | null;
  statusLulus: "Lulus" | "Perlu Bimbingan" | "Belum Dinilai";
  certificate?: {
    id: string;
    code: string;
    issuedDate: string;
  } | null;
}

export default function OwnerPenilaianPage() {
  const pathname = usePathname();
  const certLink = pathname?.startsWith("/admin") ? "/admin/sertifikat" : "/owner/sertifikat";

  const [dataRows, setDataRows] = useState<StudentGradingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCert, setFilterCert] = useState<"all" | "certified" | "uncertified">("all");

  // Modal Detail & Input
  const [selectedRow, setSelectedRow] = useState<StudentGradingRow | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "input" | "certificate">("detail");

  // Form Input Tambahan Nilai oleh Owner/Admin
  const [newAssessName, setNewAssessName] = useState("Ujian Akhir Level");
  const [newAssessScore, setNewAssessScore] = useState<number | "">(85);
  const [newAssessWeight, setNewAssessWeight] = useState(1.0);
  const [submittingAssess, setSubmittingAssess] = useState(false);

  // Penerbitan Sertifikat
  const [generatingCert, setGeneratingCert] = useState(false);
  const [notifToast, setNotifToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setNotifToast({ message, type });
    setTimeout(() => setNotifToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, certsRes, assessRes, reportsRes] = await Promise.allSettled([
        getStudents({ per_page: 250 }),
        getCertificates({ per_page: 250 }),
        getAssessments({ per_page: 500 }),
        getFinalReports({ per_page: 250 }),
      ]);

      const students: Student[] =
        studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value?.data)
          ? studentsRes.value.data
          : [];

      const certs =
        certsRes.status === "fulfilled" && Array.isArray(certsRes.value?.data)
          ? certsRes.value.data
          : Array.isArray((certsRes as any).value?.data?.data)
          ? (certsRes as any).value.data.data
          : [];
      const certByStudent = new Map<string, any>();
      certs.forEach((c: any) => certByStudent.set(c.student_id, c));

      const rawAssessments =
        assessRes.status === "fulfilled" && Array.isArray(assessRes.value?.data?.data || assessRes.value?.data)
          ? assessRes.value.data.data || assessRes.value.data
          : [];
      const assessByStudent = new Map<string, AssessmentItem[]>();
      rawAssessments.forEach((a: any) => {
        const arr = assessByStudent.get(a.student_id) || [];
        arr.push(a);
        assessByStudent.set(a.student_id, arr);
      });

      const mapped: StudentGradingRow[] = students.map((s) => {
        const primaryEnrollment = s.enrollments?.[0];
        const studentAssessments = assessByStudent.get(s.id) || [];
        const cert = certByStudent.get(s.id);

        let avg: number | null = null;
        if (studentAssessments.length > 0) {
          let totalWeighted = 0;
          let totalWeight = 0;
          studentAssessments.forEach((item) => {
            const w = Number(item.weight) || 1.0;
            totalWeighted += Number(item.score) * w;
            totalWeight += w;
          });
          avg = totalWeight > 0 ? Math.round((totalWeighted / totalWeight) * 10) / 10 : null;
        }

        let statusLulus: "Lulus" | "Perlu Bimbingan" | "Belum Dinilai" = "Belum Dinilai";
        if (avg !== null) {
          statusLulus = avg >= 70 ? "Lulus" : "Perlu Bimbingan";
        }

        return {
          studentId: s.id,
          studentName: s.name,
          enrollmentId: primaryEnrollment?.id || s.id,
          programLevelId: primaryEnrollment?.program_level_id || (primaryEnrollment?.classroom as any)?.program_level_id || s.id,
          programName:
            primaryEnrollment?.classroom?.program_level?.program?.name ||
            s.program?.name ||
            "Program Belajar",
          levelName:
            primaryEnrollment?.classroom?.program_level?.name ||
            primaryEnrollment?.programLevel?.name ||
            "Reguler",
          classroomName: primaryEnrollment?.classroom?.name || "Belum ada kelas",
          assessments: studentAssessments,
          averageScore: avg,
          statusLulus,
          certificate: cert
            ? {
                id: cert.id,
                code: cert.certificate_code || `CERT-${cert.id?.substring(0, 6).toUpperCase()}`,
                issuedDate: cert.issued_date || cert.created_at || "-",
              }
            : null,
        };
      });

      setDataRows(mapped);
    } catch (err: any) {
      console.warn("Gagal memuat data penilaian:", err);
      showToast("Gagal memuat data penilaian.", "danger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Data
  const filteredRows = useMemo(() => {
    return dataRows.filter((r) => {
      const matchSearch =
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.programName.toLowerCase().includes(search.toLowerCase()) ||
        r.classroomName.toLowerCase().includes(search.toLowerCase()) ||
        (r.certificate?.code || "").toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterCert === "certified") return r.certificate !== null;
      if (filterCert === "uncertified") return r.certificate === null;
      return true;
    });
  }, [dataRows, search, filterCert]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    const total = dataRows.length;
    const sudahSertifikat = dataRows.filter((r) => r.certificate !== null).length;
    const lulus = dataRows.filter((r) => r.statusLulus === "Lulus").length;
    const butuhBimbingan = dataRows.filter((r) => r.statusLulus === "Perlu Bimbingan").length;
    return { total, sudahSertifikat, lulus, butuhBimbingan };
  }, [dataRows]);

  // Action: Terbitkan Sertifikat
  const handleGenerateCertificate = async (row: StudentGradingRow) => {
    setGeneratingCert(true);
    try {
      // 1. Generate final report jika belum
      let reportId: string | undefined = undefined;
      try {
        const repRes = await generateFinalReport({
          enrollment_id: row.enrollmentId,
          passing_grade: 70,
          notes: `Dinyatakan ${row.statusLulus} dengan nilai rata-rata ${row.averageScore ?? 80}.`,
        });
        reportId = repRes?.data?.id;
      } catch (e) {
        // Abaikan jika final report sudah ada atau otomatis dibuat
      }

      // 2. Terbitkan sertifikat
      await createCertificate({
        student_id: row.studentId,
        enrollment_id: row.enrollmentId,
        final_report_id: reportId,
        issued_date: new Date().toISOString().split("T")[0],
      });

      showToast(`Sertifikat kelulusan untuk ${row.studentName} berhasil diterbitkan.`);
      await fetchData();
      if (selectedRow?.studentId === row.studentId) {
        setSelectedRow(null);
      }
    } catch (err: any) {
      console.error("Gagal generate sertifikat:", err);
      showToast(err?.response?.data?.message || "Gagal menerbitkan sertifikat.", "danger");
    } finally {
      setGeneratingCert(false);
    }
  };

  // Action: Tambah Penilaian Manual
  const handleAddManualAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow) return;
    if (newAssessScore === "" || Number(newAssessScore) < 0 || Number(newAssessScore) > 100) {
      showToast("Nilai harus berada di antara 0 dan 100.", "danger");
      return;
    }

    setSubmittingAssess(true);
    try {
      await createAssessment({
        student_id: selectedRow.studentId,
        enrollment_id: selectedRow.enrollmentId,
        program_level_id: selectedRow.programLevelId,
        assessment_name: newAssessName.trim(),
        score: Number(newAssessScore),
        weight: Number(newAssessWeight) || 1.0,
        assessment_date: new Date().toISOString().split("T")[0],
        status: "final",
      });

      showToast(`Nilai "${newAssessName}" berhasil dicatat untuk ${selectedRow.studentName}.`);
      setNewAssessScore(85);
      await fetchData();

      // Update current selected row
      const updatedRow = dataRows.find((r) => r.studentId === selectedRow.studentId);
      if (updatedRow) setSelectedRow(updatedRow);
      setModalMode("detail");
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || "Gagal menyimpan nilai.", "danger");
    } finally {
      setSubmittingAssess(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Toast Notification */}
      {notifToast && (
        <div
          style={{
            background: notifToast.type === "success" ? "#d1fae5" : "#fee2e2",
            border: `1.5px solid ${notifToast.type === "success" ? "#6ee7b7" : "#fca5a5"}`,
            borderRadius: 10,
            padding: "10px 16px",
            color: notifToast.type === "success" ? "#047857" : "#b91c1c",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {notifToast.type === "success" ? "✓" : "⚠️"} {notifToast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Penilaian &amp; Kelulusan Siswa</h1>
          <p className="page-subtitle">
            Verifikasi capaian belajar siswa dari guru kelas dan terbitkan dokumen kelulusan resmi BSD After School Club.
          </p>
        </div>
        <div className="page-header-actions">
          <Link href={certLink} className="btn btn-outline" style={{ fontSize: 13, fontWeight: 700 }}>
            Daftar Sertifikat &amp; Piagam Terbit &rarr;
          </Link>
        </div>
      </div>

      {/* Ketentuan Penilaian Sesuai Standar Bimbel */}
      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: 10,
          padding: "12px 16px",
          fontSize: 12.5,
          color: "#0369a1",
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 800, color: "#0369a1", marginBottom: 3 }}>
          Standar Penilaian &amp; Kelulusan:
        </div>
        <div style={{ color: "#334155" }}>
          1. <strong>Bahasa Inggris</strong>: Terdiri dari 4 komponen penilaian (<strong>Vocabulary</strong>, <strong>Test 1</strong>, <strong>Test 2</strong>, dan <strong>Test Grammar</strong>). Rata-rata 4 nilai tersebut otomatis dihitung untuk kelulusan dan penerbitan <strong>Sertifikat Kelulusan</strong> (standar kelulusan nilai &ge; 70).
        </div>
        <div style={{ color: "#334155", marginTop: 2 }}>
          2. <strong>AHE, ASE, &amp; Phonics</strong>: Penilaian berbasis ketuntasan materi membaca. Diberikan <strong>Piagam Kelulusan</strong> resmi (tanpa nilai angka).
        </div>
        <div style={{ color: "#334155", marginTop: 2 }}>
          3. <strong>Matematika</strong>: Menggunakan modul latihan soal mandiri tanpa penerbitan sertifikat kelulusan.
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "Total Murid Terdaftar", val: stats.total, color: "#1d4ed8" },
          { label: "Siswa Lulus (Nilai ≥ 70)", val: stats.lulus, color: "#059669" },
          { label: "Perlu Bimbingan (< 70)", val: stats.butuhBimbingan, color: "#b45309" },
          { label: "Sertifikat Diterbitkan", val: stats.sudahSertifikat, color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ gap: 6, padding: "14px 18px" }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>
              {s.label}
            </span>
            <div className="stat-card-value" style={{ fontSize: 24, color: s.color }}>
              {loading ? "..." : s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari nama siswa, kelas, no sertifikat..."
            style={{ maxWidth: 360, width: "100%", fontSize: 13 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(
            [
              { id: "all", label: "Semua Siswa" },
              { id: "certified", label: "Bersertifikat" },
              { id: "uncertified", label: "Belum Ada Sertifikat" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCert(tab.id)}
              className={`btn btn-sm ${filterCert === tab.id ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Penilaian */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filteredRows.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13.5 }}>
            Tidak ada data siswa yang cocok dengan filter atau pencarian.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                  <th style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>
                    SISWA &amp; KELAS
                  </th>
                  <th style={{ padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>
                    PROGRAM &amp; LEVEL
                  </th>
                  <th
                    style={{
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    ASESMEN TERCATAT
                  </th>
                  <th
                    style={{
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    RATA-RATA NILAI
                  </th>
                  <th
                    style={{
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    STATUS KELULUSAN
                  </th>
                  <th
                    style={{
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    SERTIFIKAT
                  </th>
                  <th
                    style={{
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => {
                  const isMath =
                    row.programName.toLowerCase().includes("matematika") ||
                    row.programName.toLowerCase().includes("math");
                  const isPiagam =
                    row.programName.toUpperCase().includes("AHE") ||
                    row.programName.toUpperCase().includes("ASE") ||
                    row.programName.toUpperCase().includes("PHONICS");

                  const scoreColor =
                    row.averageScore === null
                      ? "#64748b"
                      : row.averageScore >= 80
                      ? "#059669"
                      : row.averageScore >= 70
                      ? "#0284c7"
                      : "#dc2626";

                  return (
                    <tr
                      key={row.studentId}
                      style={{
                        borderBottom:
                          idx < filteredRows.length - 1 ? "1px solid var(--color-border-light)" : "none",
                      }}
                    >
                      {/* Nama & Kelas */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>
                          {row.studentName}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                          Kelas: {row.classroomName}
                        </div>
                      </td>

                      {/* Program & Level */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                          {row.programName}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{row.levelName}</div>
                      </td>

                      {/* Jumlah Asesmen */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {isPiagam ? (
                          <span style={{ fontSize: 11.5, color: "#64748b", fontStyle: "italic" }}>
                            Tanpa Nilai Angka
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 6,
                              background: row.assessments.length > 0 ? "#f1f5f9" : "#fff1f2",
                              color: row.assessments.length > 0 ? "#334155" : "#e11d48",
                            }}
                          >
                            {row.assessments.length} asesmen
                          </span>
                        )}
                      </td>

                      {/* Rata-Rata Nilai */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {isPiagam ? (
                          <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>
                            Format Piagam
                          </span>
                        ) : row.averageScore !== null ? (
                          <span style={{ fontSize: 15, fontWeight: 900, color: scoreColor }}>
                            {row.averageScore}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                            Belum ada
                          </span>
                        )}
                      </td>

                      {/* Status Kelulusan */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 9px",
                            borderRadius: 999,
                            background:
                              isPiagam || row.statusLulus === "Lulus"
                                ? "#dcfce7"
                                : row.statusLulus === "Perlu Bimbingan"
                                ? "#fee2e2"
                                : "#f1f5f9",
                            color:
                              isPiagam || row.statusLulus === "Lulus"
                                ? "#166534"
                                : row.statusLulus === "Perlu Bimbingan"
                                ? "#991b1b"
                                : "#64748b",
                          }}
                        >
                          {isPiagam ? "Lulus (Piagam)" : row.statusLulus}
                        </span>
                      </td>

                      {/* Status Sertifikat / Piagam */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {isMath ? (
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#64748b",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            Tanpa Sertifikat
                          </span>
                        ) : row.certificate ? (
                          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                            <span
                              style={{
                                background: "#d1fae5",
                                color: "#065f46",
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 4,
                              }}
                            >
                              {isPiagam ? "PIAGAM TERBIT" : "DITERBITKAN"}
                            </span>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontFamily: "monospace",
                                color: "#0284c7",
                                marginTop: 2,
                              }}
                            >
                              {row.certificate.code}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#92400e",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {isPiagam ? "Belum Terbit (Piagam)" : "Belum Terbit"}
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 11.5, padding: "3px 8px" }}
                            onClick={() => {
                              setSelectedRow(row);
                              setModalMode("detail");
                            }}
                          >
                            Rincian
                          </button>

                          {!isMath && (
                            row.certificate ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: 11.5, padding: "3px 8px" }}
                                onClick={() => {
                                  setSelectedRow(row);
                                  setModalMode("certificate");
                                }}
                              >
                                {isPiagam ? "Cetak Piagam" : "Cetak"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: 11.5, padding: "3px 8px" }}
                                disabled={generatingCert}
                                onClick={() => handleGenerateCertificate(row)}
                              >
                                {isPiagam ? "Terbitkan Piagam" : "Terbitkan"}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: RINCIAN NILAI & INPUT NILAI TAMBAHAN */}
      {selectedRow && (modalMode === "detail" || modalMode === "input") && (
        <Modal
          open
          onClose={() => setSelectedRow(null)}
          title={`Evaluasi Belajar: ${selectedRow.studentName}`}
          maxWidth={580}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Header info */}
            <div
              style={{
                padding: "10px 14px",
                background: "#f8fafc",
                borderRadius: 8,
                fontSize: 12.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {selectedRow.programName} ({selectedRow.levelName})
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 11.5 }}>
                  Kelas: {selectedRow.classroomName}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Rata-rata:</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#059669" }}>
                  {selectedRow.averageScore ?? "-"}
                </div>
              </div>
            </div>

            {modalMode === "detail" ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  Daftar Penilaian yang Tercatat ({selectedRow.assessments.length}):
                </div>

                {selectedRow.assessments.length === 0 ? (
                  <div
                    style={{
                      padding: 24,
                      textAlign: "center",
                      background: "#f8fafc",
                      borderRadius: 8,
                      fontSize: 12.5,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Belum ada nilai yang diinput oleh guru kelas.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                    {selectedRow.assessments.map((a, idx) => (
                      <div
                        key={a.id || idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "#ffffff",
                          border: "1px solid var(--color-border-light)",
                          borderRadius: 6,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--color-text-primary)" }}>
                            {a.assessment_name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                            {a.assessment_date} · Bobot: {a.weight || 1.0}x
                          </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: Number(a.score) >= 70 ? "#059669" : "#dc2626" }}>
                          {a.score}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setModalMode("input")}
                  >
                    + Input Nilai Tambahan
                  </button>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedRow(null)}>
                      Tutup
                    </button>
                    {!selectedRow.certificate && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={generatingCert}
                        onClick={() => handleGenerateCertificate(selectedRow)}
                      >
                        {generatingCert ? "Memproses..." : "Terbitkan Sertifikat"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Sub-form Input Nilai Tambahan */
              <form onSubmit={handleAddManualAssessment} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 12 }}>
                    Nama / Jenis Penilaian *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newAssessName}
                    onChange={(e) => setNewAssessName(e.target.value)}
                    placeholder="Misal: Vocabulary, Test 1, Test 2, Test Grammar"
                  />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700 }}>Pilih Cepat:</span>
                    {["Vocabulary", "Test 1", "Test 2", "Test Grammar", "Ujian Akhir Level"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          background: newAssessName === preset ? "#dbeafe" : "#f1f5f9",
                          color: newAssessName === preset ? "#1d4ed8" : "inherit",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                        onClick={() => setNewAssessName(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>
                      Nilai (0 - 100) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      className="form-input"
                      value={newAssessScore}
                      onChange={(e) =>
                        setNewAssessScore(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>
                      Bobot Nilai
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="form-input"
                      value={newAssessWeight}
                      onChange={(e) => setNewAssessWeight(Number(e.target.value) || 1.0)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setModalMode("detail")}
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingAssess}
                  >
                    {submittingAssess ? "Menyimpan..." : "Simpan Nilai"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: PRATINJAU & CETAK SERTIFIKAT */}
      {selectedRow && modalMode === "certificate" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRow(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              maxWidth: 720,
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Certificate Header Decoration */}
            <div
              style={{
                padding: "40px 48px",
                position: "relative",
                minHeight: 440,
                background: "#fafafa",
                border: "8px solid #f1f5f9",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 13, letterSpacing: 2, fontWeight: 800, color: "#1e3a8a", textTransform: "uppercase" }}>
                  BSD AFTER SCHOOL CLUB
                </div>
                <h1
                  style={{
                    fontSize: 32,
                    fontFamily: "Georgia, serif",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "6px 0 0",
                  }}
                >
                  {selectedRow.programName.toUpperCase().includes("AHE") ||
                  selectedRow.programName.toUpperCase().includes("ASE") ||
                  selectedRow.programName.toUpperCase().includes("PHONICS")
                    ? "PIAGAM KELULUSAN"
                    : "SERTIFIKAT KELULUSAN"}
                </h1>
                <div style={{ height: 2, width: 80, background: "#ea580c", margin: "12px auto 0" }} />
              </div>

              <div style={{ textAlign: "center", lineHeight: 1.8, fontSize: 14 }}>
                <p style={{ margin: "0 0 4px", color: "#64748b" }}>Diberikan secara resmi kepada:</p>
                <div
                  style={{
                    fontSize: 26,
                    fontFamily: "Georgia, serif",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "4px 0 16px",
                  }}
                >
                  {selectedRow.studentName}
                </div>
                <p style={{ maxWidth: 520, margin: "0 auto", color: "#334155" }}>
                  Telah berhasil menyelesaikan rangkaian program pembelajaran{" "}
                  <strong>
                    {selectedRow.programName} ({selectedRow.levelName})
                  </strong>{" "}
                  di BSD After School Club{" "}
                  {selectedRow.programName.toUpperCase().includes("AHE") ||
                  selectedRow.programName.toUpperCase().includes("ASE") ||
                  selectedRow.programName.toUpperCase().includes("PHONICS") ? (
                    "dan dinyatakan telah menyelesaikan materi dengan baik."
                  ) : (
                    <>
                      dengan capaian nilai akhir <strong>{selectedRow.averageScore ?? 85}</strong> dan dinyatakan{" "}
                      <strong>LULUS</strong> memenuhi standar evaluasi bimbel.
                    </>
                  )}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: 36,
                  paddingTop: 16,
                  borderTop: "1px dashed #cbd5e1",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Nomor Registrasi:</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#1e3a8a" }}>
                    {selectedRow.certificate?.code || "BSD/CERT/OFFICIAL"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                    Diterbitkan: {selectedRow.certificate?.issuedDate || new Date().toISOString().split("T")[0]}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ height: 40 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, borderTop: "1px solid #94a3b8", paddingTop: 4, minWidth: 150 }}>
                    Academic Director
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>BSD After School Club</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "12px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "#64748b" }}>Dokumen resmi BSD After School Club</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedRow(null)}>
                  Tutup
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <span>Cetak Sertifikat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
