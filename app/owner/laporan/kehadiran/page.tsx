"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getStudents, Student } from "@/lib/api/students";
import { getClassrooms, Classroom, getClassSessions } from "@/lib/api/academic";
import { getTeachers, Teacher } from "@/lib/api/teachers";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function LaporanKehadiranPage() {
  const [loading, setLoading] = useState(true);
  const [searchSiswa, setSearchSiswa] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sessionsCount, setSessionsCount] = useState(0);

  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, classroomsRes, teachersRes, sessionsRes] = await Promise.allSettled([
        getStudents({ per_page: 100 }),
        getClassrooms({ per_page: 100 }),
        getTeachers({ per_page: 100 }),
        getClassSessions({ per_page: 100 }),
      ]);

      if (studentsRes.status === "fulfilled") {
        const raw = Array.isArray(studentsRes.value?.data) ? studentsRes.value.data : [];
        setStudents(raw);
      }

      if (classroomsRes.status === "fulfilled") {
        const raw = Array.isArray(classroomsRes.value?.data) ? classroomsRes.value.data : [];
        setClassrooms(raw);
      }

      if (teachersRes.status === "fulfilled") {
        const raw = Array.isArray(teachersRes.value?.data) ? teachersRes.value.data : [];
        setTeachers(raw);
      }

      if (sessionsRes.status === "fulfilled") {
        const raw = Array.isArray(sessionsRes.value) ? sessionsRes.value : [];
        setSessionsCount(raw.length);
      }
    } catch (err) {
      console.warn("Gagal memuat rekap kehadiran:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      s.studentCode?.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      s.nis?.toLowerCase().includes(searchSiswa.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Link href="/owner/laporan" style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
              Laporan
            </Link>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>/</span>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>Kehadiran</span>
          </div>
          <h1 className="page-title">Laporan Kehadiran & Partisipasi</h1>
          <p className="page-subtitle">Rekap kehadiran siswa, kelas aktif, dan performa jam mengajar guru.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Utama */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Siswa Terdata", val: `${students.length} Siswa`, color: "#1d4ed8", sub: "Aktif dalam database" },
          { label: "Total Sesi Selesai", val: `${sessionsCount} Sesi`, color: "#059669", sub: "Pertemuan berjalan" },
          { label: "Kelas Aktif", val: `${classrooms.length} Kelas`, color: "#7c3aed", sub: "Rombel pembelajaran" },
          { label: "Guru Pengajar", val: `${teachers.length} Guru`, color: "#0284c7", sub: "Pengajar aktif" },
        ].map((k) => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: k.color }}>
              {loading ? "..." : k.val}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Rekap Kehadiran per Kelas */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "16px 20px" }}>
          <h2 className="card-title">Daftar Rombel & Kelas Aktif</h2>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonTable rows={3} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["Kode Kelas", "Nama Kelas", "Program & Level", "Kapasitas", "Status"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classrooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>
                      Belum ada kelas terdaftar.
                    </td>
                  </tr>
                ) : (
                  classrooms.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < classrooms.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-primary)" }}>{c.classCode}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{c.name}</td>
                      <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{c.programLevel?.name || "Program Reguler"}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>{c.capacity} Siswa</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                          {c.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rekap Kehadiran per Siswa */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 className="card-title">Rekap Partisipasi & Siswa Terdaftar</h2>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Cari nama / NIS siswa..."
              value={searchSiswa}
              onChange={(e) => setSearchSiswa(e.target.value)}
              style={{
                padding: "7px 14px 7px 32px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                fontSize: 12.5,
                width: 220,
                background: "var(--color-bg)",
                outline: "none",
              }}
            />
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth={2}
              strokeLinecap="round"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 20 }}>
              <SkeletonTable rows={4} />
            </div>
          ) : (
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["NIS / Kode", "Nama Siswa", "Program", "Status Belajar"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)" }}>
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < filteredStudents.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700 }}>
                        {s.studentCode || s.nis || s.id?.substring(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: "13px 16px", fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>
                        {s.name}
                      </td>
                      <td style={{ padding: "13px 16px", color: "var(--color-text-secondary)" }}>
                        {s.program?.name || s.enrollments?.[0]?.classroom?.name || "Program Reguler"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                          {s.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
