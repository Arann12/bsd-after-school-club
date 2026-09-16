"use client";
import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";

export interface StudentAssessment {
  idSiswa: string;
  namaSiswa: string;
  program: string;
  level: string;
  nilaiReading: number;
  nilaiWriting: number;
  nilaiLogic: number;
  predikat: string;
  statusSertifikat: "Sudah Digenerate" | "Belum Digenerate";
  nomorSertifikat?: string;
  tglTerbit?: string;
}

const initialAssessments: StudentAssessment[] = [
  { idSiswa: "STD-001", namaSiswa: "Andi Setiawan", program: "Calistung", level: "Level 1", nilaiReading: 0, nilaiWriting: 0, nilaiLogic: 0, predikat: "", statusSertifikat: "Belum Digenerate" },
  { idSiswa: "STD-002", namaSiswa: "Budi Santoso", program: "English", level: "Level 2 (B1)", nilaiReading: 85, nilaiWriting: 86, nilaiLogic: 88, predikat: "Sangat Baik", statusSertifikat: "Sudah Digenerate", nomorSertifikat: "BSD/CERT/2026/002", tglTerbit: "20 Agt 2026" },
  { idSiswa: "STD-003", namaSiswa: "Citra Kirana", program: "Math", level: "Level 3 (Advance)", nilaiReading: 0, nilaiWriting: 0, nilaiLogic: 0, predikat: "", statusSertifikat: "Belum Digenerate" },
  { idSiswa: "STD-004", namaSiswa: "Dian Pratama", program: "Phonics", level: "Starter", nilaiReading: 80, nilaiWriting: 78, nilaiLogic: 82, predikat: "Baik", statusSertifikat: "Belum Digenerate" },
];

export default function OwnerPenilaianSertifikatPage() {
  const [assessments, setAssessments] = useState<StudentAssessment[]>(initialAssessments);
  const [selectedStudent, setSelectedStudent] = useState<StudentAssessment | null>(null);
  const [readingScore, setReadingScore] = useState(90);
  const [writingScore, setWritingScore] = useState(88);
  const [logicScore, setLogicScore] = useState(92);
  const [predikat, setPredikat] = useState("Dengan Pujian (Cumlaude)");
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const handleGenerateCertificate = (siswa: StudentAssessment) => {
    const avgScore = Math.round((readingScore + writingScore + logicScore) / 3);
    const finalPredikat = avgScore >= 90 ? "Dengan Pujian (Cumlaude)" : avgScore >= 80 ? "Sangat Baik" : avgScore >= 70 ? "Baik" : "Cukup";
    const certNo = `BSD/CERT/2026/00${assessments.filter(a => a.statusSertifikat === "Sudah Digenerate").length + 1}`;

    setAssessments(prev =>
      prev.map(a =>
        a.idSiswa === siswa.idSiswa
          ? {
              ...a,
              nilaiReading: readingScore,
              nilaiWriting: writingScore,
              nilaiLogic: logicScore,
              predikat,
              statusSertifikat: "Sudah Digenerate" as const,
              nomorSertifikat: certNo,
              tglTerbit: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
            }
          : a
      )
    );

    setSelectedStudent(null);
    setNotifToast(`Sertifikat ${siswa.namaSiswa} berhasil digenerate!`);
    setTimeout(() => setNotifToast(null), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Penilaian & Generate Sertifikat</h1>
          <p className="page-subtitle">Input nilai siswa dan generate sertifikat kelulusan.</p>
        </div>
        <Link href="/owner/sertifikat" className="btn btn-outline">
          Lihat Sertifikat &rarr;
        </Link>
      </div>

      {/* Notification Toast */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {notifToast}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Siswa", value: assessments.length, color: "#1d4ed8" },
          { label: "Sudah Digenerate", value: assessments.filter(a => a.statusSertifikat === "Sudah Digenerate").length, color: "#059669" },
          { label: "Belum Digenerate", value: assessments.filter(a => a.statusSertifikat === "Belum Digenerate").length, color: "#b45309" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{s.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Siswa", "Nama Siswa", "Program & Level", "Nilai Rata-Rata", "Predikat", "Status Sertifikat", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, idx) => {
                const avg = a.nilaiReading + a.nilaiWriting + a.nilaiLogic > 0
                  ? Math.round((a.nilaiReading + a.nilaiWriting + a.nilaiLogic) / 3)
                  : null;
                return (
                  <tr key={a.idSiswa} style={{ borderBottom: idx < assessments.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{a.idSiswa}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>{a.namaSiswa}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.program}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{a.level}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: avg !== null ? "#1d4ed8" : "#94a3b8" }}>
                      {avg !== null ? `${avg} / 100` : "-"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {a.predikat || "-"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: a.statusSertifikat === "Sudah Digenerate" ? "#d1fae5" : "#fee2e2",
                        color: a.statusSertifikat === "Sudah Digenerate" ? "#059669" : "#dc2626",
                        fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999
                      }}>
                        {a.statusSertifikat === "Sudah Digenerate" ? "✓ Digenerate" : "Tergembok"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                          setSelectedStudent(a);
                          setReadingScore(a.nilaiReading || 90);
                          setWritingScore(a.nilaiWriting || 88);
                          setLogicScore(a.nilaiLogic || 92);
                          setPredikat(a.predikat || "Dengan Pujian (Cumlaude)");
                        }}
                      >
                        {a.statusSertifikat === "Sudah Digenerate" ? "Edit / Re-Generate" : "+ Input Nilai & Generate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT NILAI & GENERATE SERTIFIKAT */}
      <Modal open={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={`Input Nilai — ${selectedStudent?.namaSiswa}`} maxWidth={480}>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: -8, marginBottom: 16 }}>{selectedStudent?.program} · {selectedStudent?.level}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>Reading</label>
              <input className="form-input" type="number" min={0} max={100} value={readingScore} onChange={e => setReadingScore(Number(e.target.value))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>Writing</label>
              <input className="form-input" type="number" min={0} max={100} value={writingScore} onChange={e => setWritingScore(Number(e.target.value))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>Logic</label>
              <input className="form-input" type="number" min={0} max={100} value={logicScore} onChange={e => setLogicScore(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Predikat</label>
            <select className="form-input" value={predikat} onChange={e => setPredikat(e.target.value)}>
              <option>Dengan Pujian (Cumlaude)</option>
              <option>Sangat Baik</option>
              <option>Baik</option>
              <option>Cukup</option>
            </select>
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12, color: "#1e40af" }}>
            Setelah Generate, sertifikat akan terbuka di menu <strong>Sertifikat</strong> dan bisa diunduh oleh Orang Tua.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setSelectedStudent(null)}>Batal</button>
            <button className="btn btn-accent" onClick={() => handleGenerateCertificate(selectedStudent!)}>Generate Sertifikat</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
