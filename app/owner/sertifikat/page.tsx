"use client";

import { useState, useEffect, useCallback } from "react";
import { getCertificates } from "@/lib/api/assessments";
import { SkeletonTable } from "@/components/ui/Skeleton";

export interface CertificateItemDisplay {
  id: string;
  nomorSertifikat: string;
  namaSiswa: string;
  program: string;
  level: string;
  tglLulus: string;
  nilaiAkhir: string;
  predikat: string;
  status: "Diterbitkan" | "Proses Cetak";
}

const predikatDesc: Record<string, string> = {
  "Dengan Pujian (Cumlaude)": "dengan predikat Sangat Memuaskan (Cum Laude). Siswa telah menunjukkan prestasi luar biasa, dedikasi tinggi, serta penguasaan materi yang sangat baik melampaui standar yang ditetapkan.",
  "Sangat Baik": "dengan predikat Sangat Baik. Siswa telah menunjukkan partisipasi aktif, dedikasi, serta kemajuan signifikan dalam penguasaan kosakata dasar, pelafalan, dan komunikasi sederhana.",
  "Baik": "dengan predikat Baik. Siswa telah menunjukkan perkembangan yang baik dalam mengikuti seluruh rangkaian program pelatihan dengan hasil yang memuaskan.",
  "Cukup": "dengan predikat Cukup. Siswa telah menyelesaikan program pelatihan dan diharapkan terus berlatih untuk meningkatkan kemampuan.",
};

export default function SertifikatPage() {
  const [certList, setCertList] = useState<CertificateItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<CertificateItemDisplay | null>(null);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCertificates({ per_page: 100 });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];

      const mapped: CertificateItemDisplay[] = rawList.map((c: any) => {
        const student = c.student || c.enrollment?.student;
        const studentName = student?.name || student?.full_name || "Siswa";
        const programName = c.enrollment?.programLevel?.program?.name || c.enrollment?.classroom?.program_level?.program?.name || "Program Reguler";
        const levelName = c.enrollment?.programLevel?.name || c.enrollment?.classroom?.program_level?.name || "Level 1";

        const finalScore = Number(c.final_report?.final_score || c.finalReport?.final_score || 85);
        let predikat = "Baik";
        if (finalScore >= 90) predikat = "Dengan Pujian (Cumlaude)";
        else if (finalScore >= 80) predikat = "Sangat Baik";
        else if (finalScore >= 70) predikat = "Baik";
        else predikat = "Cukup";

        const issuedDate = c.issued_date || c.created_at;
        const formattedDate = issuedDate
          ? new Date(issuedDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

        return {
          id: c.id,
          nomorSertifikat: c.certificate_code || `BSD/CERT/${c.id?.substring(0, 6).toUpperCase()}`,
          namaSiswa: studentName,
          program: programName,
          level: levelName,
          tglLulus: formattedDate,
          nilaiAkhir: finalScore.toFixed(1),
          predikat,
          status: "Diterbitkan",
        };
      });

      setCertList(mapped);
    } catch (err) {
      console.warn("Gagal memuat daftar sertifikat:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  const filtered = certList.filter(
    (c) =>
      c.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      c.nomorSertifikat.toLowerCase().includes(search.toLowerCase()) ||
      c.program.toLowerCase().includes(search.toLowerCase())
  );

  const getProgramFullName = (program: string, level: string) => {
    const names: Record<string, string> = {
      Calistung: "Calistung untuk Anak (Calistung for Kids)",
      English: "Bahasa Inggris untuk Anak (English for Kids)",
      Math: "Matematika dan Logika untuk Anak (Math for Kids)",
      Phonics: "Fonik dan Membaca untuk Anak (Phonics & Reading for Kids)",
    };
    return `${names[program] || program} ${level}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sertifikat Kelulusan Siswa</h1>
          <p className="page-subtitle">Modul penerbitan sertifikat kelulusan program dan pencetakan dokumen resmi BSD After School Club.</p>
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Sertifikat Diterbitkan", value: certList.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Predikat Cumlaude", value: certList.filter((c) => c.predikat.includes("Cumlaude")).length, color: "#059669", bg: "#d1fae5" },
          { label: "Predikat Sangat Baik", value: certList.filter((c) => c.predikat === "Sangat Baik").length, color: "#b45309", bg: "#fef3c7" },
        ].map((c) => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>
              {loading ? "..." : c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              style={{ paddingLeft: 38, width: "100%" }}
              placeholder="Cari nama siswa, no sertifikat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonTable rows={4} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
            Belum ada sertifikat kelulusan yang diterbitkan.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["No. Sertifikat", "Nama Siswa", "Program & Level", "Tanggal Lulus", "Nilai & Predikat", "Status", "Cetak & Pratinjau"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-primary)", fontSize: 12 }}>
                      {c.nomorSertifikat}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>
                      {c.namaSiswa}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{c.program}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{c.level}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{c.tglLulus}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "#059669" }}>Nilai: {c.nilaiAkhir}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{c.predikat}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: "#d1fae5",
                          color: "#059669",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelectedCert(c)}>
                        Lihat / Cetak Sertifikat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PRATINJAU SERTIFIKAT */}
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
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCert(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              maxWidth: 740,
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Certificate Content */}
            <div style={{ padding: "48px 56px", position: "relative", minHeight: 460 }}>
              {/* Corner Decorations */}
              <div style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100, background: "linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 50%, transparent 50%)", borderTopLeftRadius: 12 }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: "linear-gradient(-135deg, #ea580c 0%, #ea580c 50%, transparent 50%)", borderTopRightRadius: 12 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: 90, height: 90, background: "linear-gradient(45deg, #ea580c 0%, #ea580c 50%, transparent 50%)", borderBottomLeftRadius: 12 }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 100, height: 100, background: "linear-gradient(-45deg, #1e3a8a 0%, #1e3a8a 50%, transparent 50%)", borderBottomRightRadius: 12 }} />

              {/* Main Content */}
              <div style={{ textAlign: "left", position: "relative", zIndex: 1 }}>
                <h1 style={{ fontSize: 38, fontFamily: "Georgia, serif", fontWeight: 700, color: "#1e3a8a", letterSpacing: "0.08em", marginBottom: 20 }}>
                  SERTIFIKAT KELULUSAN
                </h1>

                <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 4 }}>Diberikan Kepada :</p>
                <h2 style={{ fontSize: 28, fontFamily: "Georgia, serif", fontWeight: 700, color: "#0f172a", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #1e293b" }}>
                  {selectedCert.namaSiswa}
                </h2>

                <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, maxWidth: 540 }}>
                  Telah berhasil menyelesaikan program pembelajaran <strong>{getProgramFullName(selectedCert.program, selectedCert.level)}</strong> di BSD After School Club {predikatDesc[selectedCert.predikat] || `dengan nilai akhir ${selectedCert.nilaiAkhir}.`}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32, paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>Nomor Registrasi:</div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#1e3a8a" }}>{selectedCert.nomorSertifikat}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Diterbitkan pada: {selectedCert.tglLulus}</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>BSD After School Club</div>
                    <div style={{ height: 40 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, borderTop: "1px solid #94a3b8", paddingTop: 4, minWidth: 160 }}>
                      Academic Director
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: "14px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Dokumen resmi terverifikasi sistem BSD After School Club</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedCert(null)}>
                  Tutup
                </button>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  🖨 Cetak Sertifikat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
