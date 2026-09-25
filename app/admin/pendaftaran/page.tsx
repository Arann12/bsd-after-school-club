"use client";

import { useState, useEffect, useCallback } from "react";
import Toast, { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getEnrollments, createEnrollment, getStudents } from "@/lib/api/students";
import { getClasses } from "@/lib/api/academic";

interface EnrollmentItem {
  id: string;
  code: string;
  studentName: string;
  studentCode: string;
  programName: string;
  className: string;
  startDate: string;
  totalSessions: number;
  sessionsPerWeek: number;
  paymentScheme: "package" | "per_session" | "monthly" | string;
  status: "active" | "completed" | "inactive" | string;
  plansCount: number;
  raw: any;
}

const warnaStatus: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: "#d1fae5", color: "#059669", label: "Aktif" },
  completed: { bg: "#eff6ff", color: "#1d4ed8", label: "Selesai" },
  inactive:  { bg: "#fee2e2", color: "#dc2626", label: "Nonaktif" },
};

const formatSkema: Record<string, string> = {
  package:     "Paket Lunas",
  per_session: "Per Sesi / Mingguan",
  monthly:     "Bulanan",
};

export default function PendaftaranPage() {
  const { toast, showToast } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [dipilih, setDipilih] = useState<EnrollmentItem | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // Form options data
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalSessions, setTotalSessions] = useState<number>(8);
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(2);
  const [paymentScheme, setPaymentScheme] = useState<"package" | "per_session" | "monthly">("package");
  const [totalAmount, setTotalAmount] = useState<number>(600000);

  const formatTanggal = (dateStr?: string | null) => {
    if (!dateStr) return "–";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await getEnrollments({ per_page: 100 });
      const rawList = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const formatted: EnrollmentItem[] = rawList.map((en: any) => {
        const studentName = en.student?.full_name || "Siswa";
        const studentCode = en.student?.student_code || "–";
        const programName = en.program?.name || en.classroom?.program_level?.program?.name || "Program";
        const className = en.classroom?.name || "Kelas";
        const plans = Array.isArray(en.payment_plans) ? en.payment_plans : [];

        return {
          id: en.id,
          code: en.enrollment_code || `ENR-${en.id.slice(0, 6).toUpperCase()}`,
          studentName,
          studentCode,
          programName,
          className,
          startDate: formatTanggal(en.start_date),
          totalSessions: en.total_sessions || 8,
          sessionsPerWeek: en.sessions_per_week || 2,
          paymentScheme: en.payment_scheme || "package",
          status: en.status || "active",
          plansCount: plans.length,
          raw: en,
        };
      });

      setEnrollments(formatted);
    } catch (err) {
      console.error("Gagal memuat enrollment:", err);
      showToast("Gagal memuat daftar pendaftaran dari server.", "danger");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadMasterData = async () => {
    try {
      const [resStudents, resClasses]: [any, any] = await Promise.all([
        getStudents({ per_page: 100 }),
        getClasses({ per_page: 50 }),
      ]);

      const stList = Array.isArray(resStudents?.data?.data)
        ? resStudents.data.data
        : Array.isArray(resStudents?.data)
        ? resStudents.data
        : [];

      const clsList = Array.isArray(resClasses?.data?.data)
        ? resClasses.data.data
        : Array.isArray(resClasses?.data)
        ? resClasses.data
        : [];

      setStudentsList(stList);
      setClassesList(clsList);

      if (stList.length > 0) setSelectedStudentId(stList[0].id);
      if (clsList.length > 0) setSelectedClassroomId(clsList[0].id);
    } catch (err) {
      console.error("Gagal memuat data master siswa & kelas:", err);
    }
  };

  useEffect(() => {
    loadData();
    loadMasterData();
  }, [loadData]);

  // Update total nominal otomatis saat paket sesi berubah
  const handleSessionsChange = (num: number) => {
    setTotalSessions(num);
    setTotalAmount(num * 75000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedClassroomId) {
      showToast("Silakan pilih siswa dan kelas.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createEnrollment({
        student_id: selectedStudentId,
        classroom_id: selectedClassroomId,
        start_date: startDate,
        total_sessions: totalSessions,
        sessions_per_week: sessionsPerWeek,
        payment_scheme: paymentScheme,
        total_amount: totalAmount,
      });

      showToast(
        res?.message || "Pendaftaran siswa berhasil! Skema tagihan otomatis diterbitkan.",
        "success"
      );
      setShowFormModal(false);
      await loadData();
    } catch (err: any) {
      console.error("Gagal submit pendaftaran:", err);
      const msg = err?.response?.data?.message || "Gagal mendaftarkan siswa ke kelas.";
      showToast(msg, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const terfilter = enrollments.filter((en) => {
    const q = cari.toLowerCase().trim();
    const cocokCari =
      !q ||
      en.studentName.toLowerCase().includes(q) ||
      en.code.toLowerCase().includes(q) ||
      en.programName.toLowerCase().includes(q) ||
      en.className.toLowerCase().includes(q);
    const cocokStatus =
      filterStatus === "Semua" ||
      en.status.toLowerCase() === filterStatus.toLowerCase();
    return cocokCari && cocokStatus;
  });

  const countActive = enrollments.filter((e) => e.status === "active").length;
  const countCompleted = enrollments.filter((e) => e.status === "completed").length;
  const countInactive = enrollments.filter((e) => e.status === "inactive").length;

  const kelasDipilih = classesList.find((c) => c.id === selectedClassroomId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Toast toast={toast} />

      {/* Header Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pendaftaran & Penempatan Kelas</h1>
          <p className="page-subtitle">
            Daftarkan siswa ke kelas dan program. Sistem otomatis membuat jadwal pertemuan dan rencana tagihan.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={loadData} disabled={loading} suppressHydrationWarning>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
          <button className="btn btn-accent" onClick={() => setShowFormModal(true)}>
            + Daftarkan Siswa Baru
          </button>
        </div>
      </div>

      {/* Statistik Ringkas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Pendaftaran", val: enrollments.length, warna: "#1d4ed8" },
          { label: "Kelas Aktif", val: countActive, warna: "#059669" },
          { label: "Selesai Paket", val: countCompleted, warna: "#0284c7" },
          { label: "Nonaktif", val: countInactive, warna: "#dc2626" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{s.label}</span>
            <div className="stat-card-value" style={{ fontSize: 26, color: s.warna }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter & Pencarian */}
      <div className="card">
        <div className="card-body" style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth={2}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                style={{ paddingLeft: 38, width: "100%" }}
                placeholder="Cari kode enrollment, nama siswa, program, atau kelas..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
            </div>
            <select
              className="select-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "9px 12px", fontSize: 13.5 }}
            >
              <option value="Semua">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto" }}>
              {terfilter.length} data ditemukan
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Data Enrollment */}
      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["Kode Enrollment", "Nama Siswa", "Program & Kelas", "Mulai Belajar", "Paket Pertemuan", "Skema Bayar", "Status", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terfilter.map((en, i) => {
                  const badge = warnaStatus[en.status] || { bg: "#f1f5f9", color: "#475569", label: en.status };
                  return (
                    <tr
                      key={en.id}
                      style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff" }}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>
                        {en.code}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{en.studentName}</div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>NIS: {en.studentCode}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{en.programName}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{en.className}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                        {en.startDate}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>
                        <strong>{en.totalSessions} Sesi</strong> ({en.sessionsPerWeek}x/minggu)
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                        {formatSkema[en.paymentScheme] || en.paymentScheme}
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: badge.bg,
                          color: badge.color,
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDipilih(en)}>
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {terfilter.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Belum ada data pendaftaran
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Klik tombol "+ Daftarkan Siswa Baru" untuk mendaftarkan siswa ke kelas.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Form Daftarkan Siswa Baru */}
      <Modal open={showFormModal} onClose={() => setShowFormModal(false)} title="Pendaftaran Siswa ke Kelas" maxWidth={620}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pilih Siswa */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Pilih Siswa</label>
            <select
              className="select-control"
              style={{ width: "100%" }}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
            >
              {studentsList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.student_code || "NIS: -"})
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Kelas */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Pilih Kelas & Program</label>
            <select
              className="select-control"
              style={{ width: "100%" }}
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              required
            >
              {classesList.map((cls) => {
                const progName = cls.program_level?.program?.name || cls.program || "Program";
                const levelName = cls.program_level?.name || cls.level || "";
                return (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} — {progName} {levelName ? `(${levelName})` : ""} [Kapasitas: {cls.capacity || 20}]
                  </option>
                );
              })}
            </select>
            {kelasDipilih && (
              <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 4 }}>
                Program: <strong>{kelasDipilih.program_level?.program?.name || kelasDipilih.program || "Program"}</strong>
              </div>
            )}
          </div>

          {/* Paket Pertemuan & Tanggal Mulai */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Paket Pertemuan</label>
              <select
                className="select-control"
                style={{ width: "100%" }}
                value={totalSessions}
                onChange={(e) => handleSessionsChange(Number(e.target.value))}
              >
                <option value={8}>8 Pertemuan (45 menit/sesi)</option>
                <option value={12}>12 Pertemuan (30 menit/sesi)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Mulai Belajar</label>
              <input
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Frekuensi & Skema Pembayaran */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Frekuensi Perminggu</label>
              <select
                className="select-control"
                style={{ width: "100%" }}
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
              >
                <option value={1}>1x Seminggu</option>
                <option value={2}>2x Seminggu (Rekomendasi)</option>
                <option value={3}>3x Seminggu</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Skema Pembayaran</label>
              <select
                className="select-control"
                style={{ width: "100%" }}
                value={paymentScheme}
                onChange={(e) => setPaymentScheme(e.target.value as any)}
              >
                <option value="package">Paket Lunas di Muka (1 Tagihan Total)</option>
                <option value="per_session">Per Sesi / Mingguan (Tagihan Berkala)</option>
                <option value="monthly">Bulanan (Cicilan per 4 Minggu)</option>
              </select>
            </div>
          </div>

          {/* Total Nominal Tagihan */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Total Biaya Paket (Rp)</label>
            <input
              className="form-input"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              placeholder="600000"
              required
            />
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 4 }}>
              Estimasi: Rp {(totalAmount / totalSessions).toLocaleString("id-ID")} / sesi
            </div>
          </div>

          {/* Banner Informasi Tagihan Otomatis */}
          <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#0369a1" }}>
            <strong>💡 Otomasi Tagihan:</strong> Setelah pendaftaran disimpan, sistem backend akan langsung menerbitkan <strong>Rencana Tagihan (Payment Plans)</strong> sesuai skema yang dipilih. Orang tua dapat langsung membayar via menu Pembayaran.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowFormModal(false)} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Mendaftarkan..." : "Daftarkan & Terbitkan Tagihan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Enrollment */}
      <Modal open={!!dipilih} onClose={() => setDipilih(null)} title="Detail Pendaftaran Siswa" maxWidth={500}>
        {dipilih && (
          <div>
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontFamily: "monospace", fontSize: 13, color: "var(--color-primary)", fontWeight: 700 }}>
              {dipilih.code}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Nama Siswa", value: dipilih.studentName },
                { label: "NIS Siswa", value: dipilih.studentCode },
                { label: "Program", value: dipilih.programName },
                { label: "Kelas", value: dipilih.className },
                { label: "Mulai Belajar", value: dipilih.startDate },
                { label: "Total Pertemuan", value: `${dipilih.totalSessions} Sesi (${dipilih.sessionsPerWeek}x/mgg)` },
                { label: "Skema Pembayaran", value: formatSkema[dipilih.paymentScheme] || dipilih.paymentScheme },
                { label: "Status Pendaftaran", value: warnaStatus[dipilih.status]?.label || dipilih.status },
              ].map((f) => (
                <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border-light)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setDipilih(null)}>
              Tutup
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
