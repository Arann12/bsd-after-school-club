"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/constants";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { getLocalUser, type AuthUser } from "@/lib/api/auth";
import { getTeachers } from "@/lib/api/teachers";
import { getClassrooms } from "@/lib/api/academic";
import { getClassSessions } from "@/lib/api/academic";
import { getAnnouncements } from "@/lib/api/operational";

interface DashboardData {
  teacherId: string | null;
  sessionsToday: number;
  totalClassrooms: number;
  announcements: { title: string; createdAt: string; target: string }[];
}

export default function GuruDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [data, setData] = useState<DashboardData>({
    teacherId: null,
    sessionsToday: 0,
    totalClassrooms: 0,
    announcements: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (currentUser: AuthUser) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [sessionsRes, classroomsRes, announcementsRes, teachersRes] = await Promise.allSettled([
        getClassSessions({ date: today }),
        getClassrooms({ per_page: 100 }),
        getAnnouncements({ per_page: 5 }),
        getTeachers({ per_page: 100 }),
      ]);

      // Cari teacher record yang sesuai dengan user yang login
      let teacherId: string | null = null;
      if (teachersRes.status === "fulfilled") {
        const myTeacher = teachersRes.value.data.find(
          (t) => t.name === currentUser.name || t.email === currentUser.email
        );
        teacherId = myTeacher?.id ?? null;
      }

      // Filter sessions hari ini yang milik guru ini
      const allSessions = sessionsRes.status === "fulfilled" ? sessionsRes.value : [];
      const mySessions = teacherId
        ? allSessions.filter((s: any) => s.teacherId === teacherId || s.teacher_id === teacherId)
        : allSessions;

      // Filter kelas yang diajarkan guru ini
      const allClassrooms = classroomsRes.status === "fulfilled" ? classroomsRes.value.data : [];
      const myClassrooms = teacherId
        ? allClassrooms.filter((c) =>
            c.teachers?.some((t: any) => t.teacherId === teacherId || t.id === teacherId)
          )
        : [];

      const announcementsRaw = announcementsRes.status === "fulfilled" ? announcementsRes.value : null;
      // getAnnouncements returns raw axios data: { success, data: { data: [...] } } or { data: [...] }
      const announcementsArray: any[] = Array.isArray(announcementsRaw?.data?.data)
        ? announcementsRaw.data.data
        : Array.isArray(announcementsRaw?.data)
        ? announcementsRaw.data
        : Array.isArray(announcementsRaw)
        ? announcementsRaw
        : [];

      const announcements = announcementsArray.slice(0, 3).map((a: any) => ({
              title: a.title || a.judul || "Pengumuman",
              createdAt: a.published_at || a.created_at || "",
              target: a.targets?.[0]?.target_role || a.target_role || "Semua",
            }));

      setData({
        teacherId,
        sessionsToday: mySessions.length,
        totalClassrooms: myClassrooms.length,
        announcements,
      });
    } catch (e) {
      console.error("Gagal memuat dashboard guru:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const localUser = getLocalUser();
    setUser(localUser);
    if (localUser) {
      fetchData(localUser);
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  if (loading) return <SkeletonDashboard />;

  const displayName = user?.name || "Guru";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title={`Selamat Datang, ${displayName}`}
        subtitle="Ringkasan aktivitas mengajar Anda hari ini — kelas, logbook, dan progress siswa."
        actions={<Link href="/guru/jadwal" className="btn btn-accent">Lihat Jadwal Lengkap →</Link>}
      />

      {/* STAT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard
          label="Sesi Hari Ini"
          value={data.sessionsToday}
          detail={data.sessionsToday > 0 ? "Sesi terjadwal" : "Tidak ada sesi"}
          color="#059669"
          bg="var(--color-success-bg)"
        />
        <StatCard
          label="Kelas Saya"
          value={data.totalClassrooms}
          detail="Kelas aktif"
          color="#7c3aed"
          bg="#ede9fe"
        />
        <StatCard
          label="Pengumuman"
          value={data.announcements.length}
          detail="Pengumuman terbaru"
          color="#b45309"
          bg="var(--color-warning-bg)"
        />
      </div>

      {/* Shortcut Menu */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>
          📖 Menu Utama
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { label: "Jadwal Mengajar", sub: `${data.sessionsToday} Sesi Hari Ini`, href: "/guru/jadwal", color: "#1d4ed8", bg: "var(--color-info-bg)" },
            { label: "Kelas & Absensi",  sub: "Isi Absensi",  href: "/guru/kelas",    color: "#7c3aed", bg: "#ede9fe" },
            { label: "Logbook",          sub: "Isi Materi",   href: "/guru/logbook",  color: "#059669", bg: "var(--color-success-bg)" },
            { label: "Pengumuman",       sub: "Info Terbaru", href: "/guru/pengumuman", color: "#b45309", bg: "var(--color-warning-bg)" },
            { label: "Honor Saya",       sub: "Cek Rekap",   href: "/guru/honor",    color: "#0369a1", bg: "var(--color-info-bg)" },
          ].map((m) => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
              <div
                style={{ background: m.bg, borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${m.color}18`, cursor: "pointer", transition: "transform .15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.label}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 3 }}>{m.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Jadwal & Pengumuman */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Info Akun */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>
            👤 Informasi Akun
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Nama", value: user?.name || "-" },
              { label: "Email", value: user?.email || "-" },
              { label: "Kode", value: user?.user_code || "-" },
              { label: "Role", value: "Guru" },
            ].map((row) => (
              <div
                key={row.label}
                style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--color-bg)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pengumuman */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>🔔 Pengumuman</h3>
            <Link href="/guru/pengumuman" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Semua →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.announcements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>
                Belum ada pengumuman
              </div>
            ) : data.announcements.map((a, i) => (
              <div
                key={i}
                style={{ padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-accent)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{a.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""} · {a.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
