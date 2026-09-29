"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { SkeletonDashboard } from "@/components/ui/Skeleton";

import { getStudents } from "@/lib/api/students";
import { getTeachers } from "@/lib/api/teachers";
import { getClassrooms, getClassSchedules } from "@/lib/api/academic";

/* ---- Shortcut grid renderer ---- */
function ShortcutGrid({ items }: { items: { label: string; sub: string; href: string; color: string; bg: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`, gap: 10 }}>
      {items.map(m => (
        <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
          <div style={{ background: m.bg, borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${m.color}18`, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.label}</div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 3 }}>{m.sub}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeTeachers: 0,
    activeClasses: 0,
    todaySchedules: 0,
    parents: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [studentsRes, teachersRes, classesRes, schedulesRes] = await Promise.all([
          getStudents({ status: "active", per_page: 1 }),
          getTeachers({ per_page: 1 }),
          getClassrooms({ status: "active", per_page: 1 }),
          getClassSchedules()
        ]);

        const today = new Date().toLocaleDateString("en-US", { weekday: "long" }); // "Monday", "Tuesday", etc.
        const todaySchedulesCount = schedulesRes.filter(s => s.dayOfWeek === today).length;

        setStats({
          activeStudents: (studentsRes as any).total || 0,
          activeTeachers: (teachersRes as any).total || 0,
          activeClasses: (classesRes as any).total || 0,
          todaySchedules: todaySchedulesCount,
          parents: 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <SkeletonDashboard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard Akademik Admin"
        subtitle="Pusat kendali harian — pendaftaran, absensi, jadwal kelas, dan operasional akademik."
        actions={<>
          <Link href="/admin/students" className="btn btn-accent">+ Siswa Baru</Link>
        </>}
      />

      {/* STAT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Total Siswa Aktif" value={stats.activeStudents} detail={`${stats.activeClasses} kelas berjalan`} color="#1d4ed8" bg="var(--color-info-bg)" />
        <StatCard label="Jadwal Hari Ini" value={`${stats.todaySchedules} Sesi`} detail="Jadwal rutin" color="#7c3aed" bg="#ede9fe" />
        <StatCard label="Total Guru" value={stats.activeTeachers} detail="Guru & Staff" color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Total Kelas Aktif" value={stats.activeClasses} detail="Kelas reguler" color="#d97706" bg="var(--color-accent-bg)" />
      </div>

      {/* ============ ACADEMIC SECTION ============ */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Akses Cepat Master Data & Operasional</h3>
        </div>
        <ShortcutGrid items={[
          { label: "Siswa", sub: `${stats.activeStudents} Aktif`, href: "/admin/students", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Guru & Staff", sub: `${stats.activeTeachers} Total`, href: "/admin/guru", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Kelas", sub: `${stats.activeClasses} Aktif`, href: "/admin/classes", color: "#d97706", bg: "var(--color-accent-bg)" },
          { label: "Jadwal", sub: "Kelola Jadwal Mingguan", href: "/admin/schedule", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Absensi & Logbook", sub: "Isi Absensi Harian", href: "/admin/absensi", color: "#0369a1", bg: "var(--color-info-bg)" },
          { label: "Program", sub: "Kelola Program", href: "/admin/programs", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Orang Tua", sub: `Data Orang Tua`, href: "/admin/orang-tua", color: "#059669", bg: "var(--color-success-bg)" },
        ]} />
      </div>
    </div>
  );
}
