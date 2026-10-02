"use client";

import { useState, useEffect, useCallback } from "react";
import { getCertificates } from "@/lib/api/assessments";
import { getMyParentProfile } from "@/lib/api/parents";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface ParentCertificateState {
  id: string;
  nomorSertifikat: string;
  studentName: string;
  program: string;
  level: string;
  isGenerated: boolean;
  tglLulus?: string;
  predikat?: string;
}

export default function OrangTuaSertifikatPage() {
  const [certs, setCerts] = useState<ParentCertificateState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<ParentCertificateState | null>(null);

  const fetchParentCerts = useCallback(async () => {
    setLoading(true);
    try {
      const [parentProfile, certsRes] = await Promise.allSettled([
        getMyParentProfile(),
        getCertificates({ per_page: 100 }),
      ]);

      const myStudents = parentProfile.status === "fulfilled" ? parentProfile.value?.students || [] : [];
      const studentIds = new Set(myStudents.map((s: any) => s.id));
      const rawCerts = certsRes.status === "fulfilled" && Array.isArray(certsRes.value?.data) ? certsRes.value.data : [];

      const filteredCerts = rawCerts.filter((c: any) => studentIds.size === 0 || studentIds.has(c.student_id));

      const mapped: ParentCertificateState[] = filteredCerts.map((c: any) => {
        const student = c.student || c.enrollment?.student;
        const studentName = student?.name || student?.full_name || "Siswa";
        const program = c.enrollment?.programLevel?.program?.name || c.enrollment?.classroom?.program_level?.program?.name || "Program Reguler";
        const level = c.enrollment?.programLevel?.name || c.enrollment?.classroom?.program_level?.name || "Level 1";

        const score = Number(c.final_report?.final_score || c.finalReport?.final_score || 85);
        let predikat = "Baik";
        if (score >= 90) predikat = "Dengan Pujian (Cumlaude)";
        else if (score >= 80) predikat = "Sangat Baik";
        else if (score >= 70) predikat = "Baik";
        else predikat = "Cukup";

        const dateStr = c.issued_date || c.created_at;
        const formattedDate = dateStr
          ? new Date(dateStr).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

        return {
          id: c.id,
          nomorSertifikat: c.certificate_code || `BSD/CERT/${c.id?.substring(0, 6).toUpperCase()}`,
          studentName,
          program,
          level,
          isGenerated: true,
          tglLulus: formattedDate,
          predikat,
        };
      });

      // If no issued certs yet but students exist, show placeholder status for enrollment
      if (mapped.length === 0 && myStudents.length > 0) {
        myStudents.forEach((st: any) => {
          mapped.push({
            id: `PENDING-${st.id}`,
            nomorSertifikat: "PROSES BELAJAR",
            studentName: st.name || st.full_name || "Siswa",
            program: "Program Belajar",
            level: "Level Berjalan",
            isGenerated: false,
          });
        });
      }

      setCerts(mapped);
    } catch (err) {
      console.warn("Gagal memuat sertifikat anak:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParentCerts();
  }, [fetchParentCerts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sertifikat Kelulusan Anak</h1>
          <p className="page-subtitle">Daftar sertifikat resmi kelulusan program yang diperoleh oleh anak Anda.</p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 24 }}>
          <SkeletonTable rows={3} />
        </div>
      ) : certs.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
          Belum ada sertifikat yang diterbitkan untuk anak Anda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {certs.map((c) => (
            <div key={c.id} className="card" style={{ padding: 24, opacity: c.isGenerated ? 1 : 0.85 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: c.isGenerated ? "#d1fae5" : "#f1f5f9",
                      color: c.isGenerated ? "#059669" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {c.isGenerated ? (
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>
                        {c.isGenerated ? c.nomorSertifikat : "SERTIFIKAT BELUM TERBIT"}
                      </span>
                      {!c.isGenerated && (
                        <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                          Belum Terbit
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>
                      {c.program} ({c.level}) — {c.studentName}
                    </h3>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                      {c.isGenerated
                        ? `Tanggal Terbit: ${c.tglLulus} · Predikat: ${c.predikat}`
                        : "Sertifikat akan otomatis terbit setelah anak Anda menyelesaikan seluruh sesi dan evaluasi akhir."}
                    </div>
                  </div>
                </div>

                {c.isGenerated && (
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedCert(c)}>
                    Lihat Sertifikat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal View Sertifikat */}
      {selectedCert && (
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
            if (e.target === e.currentTarget) setSelectedCert(null);
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, maxWidth: 640, width: "100%", padding: 32, position: "relative" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-primary)", textAlign: "center", margin: "0 0 16px" }}>
              Sertifikat Kelulusan
            </h2>
            <div style={{ textAlign: "center", lineHeight: 1.8, fontSize: 14 }}>
              Diberikan kepada:
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", margin: "8px 0" }}>
                {selectedCert.studentName}
              </div>
              Telah menyelesaikan program <strong>{selectedCert.program} ({selectedCert.level})</strong> dengan predikat <strong>{selectedCert.predikat}</strong>.
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 12, color: "var(--color-text-muted)" }}>
              <span>No. Registrasi: {selectedCert.nomorSertifikat}</span>
              <span>Tanggal: {selectedCert.tglLulus}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedCert(null)}>
                Tutup
              </button>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>Cetak</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
