"use client";
import { useState } from "react";
import Link from "next/link";

export interface StudentAssessment {
  idSiswa: string;
  namaSiswa: string;
  program: string;
  level: string;
  nilaiReading: number;
  nilaiWriting: number;
  nilaiLogic: number;
  gradeAkhir: string;
  statusSertifikat: "Sudah Digenerate" | "Belum Digenerate";
  nomorSertifikat?: string;
  tglTerbit?: string;
}

const initialAssessments: StudentAssessment[] = [
  { idSiswa: "STD-001", namaSiswa: "Andi Setiawan", program: "Calistung", level: "Level 1", nilaiReading: 92, nilaiWriting: 88, nilaiLogic: 90, gradeAkhir: "A (Dengan Pujian)", statusSertifikat: "Belum Digenerate" },
  { idSiswa: "STD-002", namaSiswa: "Budi Santoso", program: "English", level: "Level 2 (B1)", nilaiReading: 85, nilaiWriting: 86, nilaiLogic: 88, gradeAkhir: "A- (Sangat Baik)", statusSertifikat: "Sudah Digenerate", nomorSertifikat: "BSD/CERT/2026/002", tglTerbit: "20 Agt 2026" },
  { idSiswa: "STD-003", namaSiswa: "Citra Kirana", program: "Math", level: "Level 3 (Advance)", nilaiReading: 95, nilaiWriting: 94, nilaiLogic: 96, gradeAkhir: "A+ (Dengan Pujian)", statusSertifikat: "Belum Digenerate" },
  { idSiswa: "STD-004", namaSiswa: "Dian Pratama", program: "Phonics", level: "Starter", nilaiReading: 80, nilaiWriting: 78, nilaiLogic: 82, gradeAkhir: "B+ (Baik)", statusSertifikat: "Belum Digenerate" },
];

export default function OwnerPenilaianSertifikatPage() {
  const [assessments, setAssessments] = useState<StudentAssessment[]>(initialAssessments);
  const [selectedStudent, setSelectedStudent] = useState<StudentAssessment | null>(null);
  const [readingScore, setReadingScore] = useState(90);
  const [writingScore, setWritingScore] = useState(88);
  const [logicScore, setLogicScore] = useState(92);

  const handleGenerateCertificate = (siswa: StudentAssessment) => {
    const avgScore = Math.round((readingScore + writingScore + logicScore) / 3);
    const finalGrade = avgScore >= 90 ? "A (Dengan Pujian)" : avgScore >= 80 ? "B (Sangat Baik)" : "C (Baik)";
    const newCertNo = `BSD/CERT/2026/00${assessments.filter(a => a.statusSertifikat === "Sudah Digenerate").length + 1}`;

    setAssessments(prev =>
      prev.map(a =>
        a.idSiswa === siswa.idSiswa
          ? {
              ...a,
              nilaiReading: readingScore,
              nilaiWriting: writingScore,
              nilaiLogic: logicScore,
              gradeAkhir: finalGrade,
              statusSertifikat: "Sudah Digenerate",
              nomorSertifikat: newCertNo,
              tglTerbit: "Hari Ini (01 Sep 2026)",
            }
          : a
      )
    );

    setSelectedStudent(null);
    alert(`Sertifikat ${siswa.namaSiswa} berhasil digenerate dan sekarang dapat diunduh oleh Orang Tua!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Penilaian & Generasi Sertifikat</h1>
          <p className="page-subtitle">Input nilai akhir siswa per level dan generate sertifikat resmi untuk membuka akses di akun Orang Tua.</p>
        </div>
        <Link href="/owner/sertifikat" className="btn btn-outline">
          Modul Cetak Sertifikat &rarr;
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Siswa Terdaftar", value: assessments.length, color: "#1d4ed8" },
          { label: "Sertifikat Sudah Digenerate (Terbuka)", value: assessments.filter(a => a.statusSertifikat === "Sudah Digenerate").length, color: "#059669" },
          { label: "Belum Digenerate (Tergembok)", value: assessments.filter(a => a.statusSertifikat === "Belum Digenerate").length, color: "#b45309" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{s.label}</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabel Input Nilai & Status Sertifikat */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Siswa", "Nama Siswa", "Program & Level", "Nilai Rata-Rata", "Grade", "Status Akses Sertifikat", "Aksi Penilaian"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assessments.map((a, idx) => {
              const avg = Math.round((a.nilaiReading + a.nilaiWriting + a.nilaiLogic) / 3);
              return (
                <tr key={a.idSiswa} style={{ borderBottom: idx < assessments.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{a.idSiswa}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>{a.namaSiswa}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{a.program} ({a.level})</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#1d4ed8" }}>{avg} / 100</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{a.gradeAkhir}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: a.statusSertifikat === "Sudah Digenerate" ? "#d1fae5" : "#fee2e2", color: a.statusSertifikat === "Sudah Digenerate" ? "#059669" : "#dc2626", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                      {a.statusSertifikat === "Sudah Digenerate" ? "Terbuka di Orang Tua" : "Tergembok (Belum Generated)"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => {
                        setSelectedStudent(a);
                        setReadingScore(a.nilaiReading);
                        setWritingScore(a.nilaiWriting);
                        setLogicScore(a.nilaiLogic);
                      }}
                    >
                      {a.statusSertifikat === "Sudah Digenerate" ? "Edit Nilai / Re-Generate" : "+ Input Nilai & Generate"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT NILAI & GENERATE SERTIFIKAT */}
      {selectedStudent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Input Nilai — {selectedStudent.namaSiswa}</h3>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedStudent.program} · {selectedStudent.level}</div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nilai Membaca & Pemahaman (Reading)</label>
                <input className="form-input" type="number" min={0} max={100} value={readingScore} onChange={e => setReadingScore(Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nilai Menulis & Dikte (Writing)</label>
                <input className="form-input" type="number" min={0} max={100} value={writingScore} onChange={e => setWritingScore(Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nilai Logika & Hitung (Logic)</label>
                <input className="form-input" type="number" min={0} max={100} value={logicScore} onChange={e => setLogicScore(Number(e.target.value))} />
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 14px", borderRadius: 10, fontSize: 12, color: "#166534" }}>
                Setelah tombol <strong>Generate Sertifikat</strong> diklik, sertifikat resmi akan diterbitkan dan menu Sertifikat di akun Orang Tua akan otomatis <strong>TERBUKA</strong>.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedStudent(null)}>Batal</button>
                <button className="btn btn-accent" onClick={() => handleGenerateCertificate(selectedStudent)}>Generate Sertifikat & Unlock</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
