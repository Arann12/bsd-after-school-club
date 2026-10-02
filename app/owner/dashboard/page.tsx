"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/constants";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { useCountUp } from "@/lib/hooks";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";

// API imports
import { getStudents } from "@/lib/api/students";
import { getTeachers } from "@/lib/api/teachers";
import { getPrograms, getClassrooms, getClassSessions } from "@/lib/api/academic";
import { getPaymentPlans, getCashTransactions, getFinanceDashboard } from "@/lib/api/finance";
import { getAnnouncements, getInventory } from "@/lib/api/operational";

// ---- Types ----
interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalPrograms: number;
  totalClasses: number;
  activeClasses: number;
  pendingEnrollments: number;
  overdueCount: number;
  pendingCashCount: number;
  totalRevenue: number;
  honorPaid: number;
  netProfit: number;
  totalInventory: number;
  goodInventory: number;
  underRepairInventory: number;
  damagedInventory: number;
  publishedAnnouncements: number;
  sessionsToday: number;
  recentAnnouncements: { id: string; title: string; status: string }[];
  pendingCashItems: { parentName: string; amount: number }[];
  overdueInvoices: { studentName: string; amount: number; program: string }[];
}

const EMPTY: DashboardData = {
  totalStudents: 0, activeStudents: 0, totalTeachers: 0, activeTeachers: 0,
  totalPrograms: 0, totalClasses: 0, activeClasses: 0, pendingEnrollments: 0,
  overdueCount: 0, pendingCashCount: 0, totalRevenue: 0, honorPaid: 0, netProfit: 0,
  totalInventory: 0, goodInventory: 0, underRepairInventory: 0, damagedInventory: 0,
  publishedAnnouncements: 0, sessionsToday: 0,
  recentAnnouncements: [], pendingCashItems: [], overdueInvoices: [],
};

/* ---- Stat Card with count-up animation ---- */
function AnimatedStat({ label, target, detail, color, bg }: { label: string; target: number; detail: string; color: string; bg: string }) {
  const value = useCountUp(target);
  return <StatCard label={label} value={value} detail={detail} color={color} bg={bg} />;
}

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

export default function OwnerDashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const [
        studentsRes,
        teachersRes,
        programsRes,
        classroomsRes,
        sessionsRes,
        plansRes,
        cashRes,
        announcementsRes,
        inventoryRes,
        financeRes,
      ] = await Promise.allSettled([
        getStudents({ per_page: 100 }),
        getTeachers({ per_page: 100 }),
        getPrograms({ per_page: 100 }),
        getClassrooms({ per_page: 100 }),
        getClassSessions({ per_page: 100 }),
        getPaymentPlans({ per_page: 100 }),
        getCashTransactions({ status: "menunggu_konfirmasi_admin" }),
        getAnnouncements({ per_page: 10 }),
        getInventory({ per_page: 200 }),
        getFinanceDashboard(),
      ]);

      const students = studentsRes.status === "fulfilled" ? (studentsRes.value.data ?? []) : [];
      const teachers = teachersRes.status === "fulfilled" ? (teachersRes.value.data ?? []) : [];
      const programs = programsRes.status === "fulfilled" ? (programsRes.value.data ?? []) : [];
      const classrooms = classroomsRes.status === "fulfilled" ? (classroomsRes.value.data ?? []) : [];
      const sessions = sessionsRes.status === "fulfilled" ? (Array.isArray(sessionsRes.value) ? sessionsRes.value : []) : [];
      const rawPlans: any[] = plansRes.status === "fulfilled" ? (Array.isArray(plansRes.value?.data?.data) ? plansRes.value.data.data : Array.isArray(plansRes.value?.data) ? plansRes.value.data : Array.isArray(plansRes.value) ? plansRes.value : []) : [];
      const rawCash: any[] = cashRes.status === "fulfilled" ? (Array.isArray(cashRes.value?.data?.data) ? cashRes.value.data.data : Array.isArray(cashRes.value?.data) ? cashRes.value.data : Array.isArray(cashRes.value) ? cashRes.value : []) : [];
      const announcements: any[] = announcementsRes.status === "fulfilled" ? (Array.isArray(announcementsRes.value.data?.data) ? announcementsRes.value.data.data : Array.isArray(announcementsRes.value.data) ? announcementsRes.value.data : []) : [];
      const inventoryItems: any[] = inventoryRes.status === "fulfilled" ? (Array.isArray(inventoryRes.value.data?.data) ? inventoryRes.value.data.data : Array.isArray(inventoryRes.value.data) ? inventoryRes.value.data : []) : [];
      const finance = financeRes.status === "fulfilled" ? financeRes.value : null;

      const overdueInvoices = rawPlans.filter((p: any) =>
        !p.is_paid && (p.status === "overdue" || (p.due_date && new Date(p.due_date) < new Date()))
      );
      const pendingCash = rawCash.filter((c: any) =>
        (c.status || "").toLowerCase() === "menunggu_konfirmasi_admin"
      );

      const financeSummary = finance?.summary || finance?.data?.summary || finance || {};
      const totalRevenue = Number(financeSummary.total_income || financeSummary.total_monthly_income || 0);
      const honorPaid = Number(financeSummary.total_payroll || financeSummary.total_payroll_expense || 0);
      const netProfit = totalRevenue - honorPaid;

      setData({
        totalStudents: students.length,
        activeStudents: students.filter((s: any) => s.status === "active" || s.status === "Aktif").length,
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter((t: any) => t.status === "active" || t.status === "Aktif").length,
        totalPrograms: programs.length,
        totalClasses: classrooms.length,
        activeClasses: classrooms.filter((c: any) => c.status === "active" || c.status === "Aktif").length,
        pendingEnrollments: 0,
        overdueCount: overdueInvoices.length,
        pendingCashCount: pendingCash.length,
        totalRevenue: totalRevenue || rawPlans.filter((p: any) => p.is_paid).reduce((acc: number, cur: any) => acc + Number(cur.amount || 0), 0),
        honorPaid: honorPaid,
        netProfit: netProfit,
        totalInventory: inventoryItems.length,
        goodInventory: inventoryItems.filter((i: any) => i.condition === "Good" || i.condition === "good").length,
        underRepairInventory: inventoryItems.filter((i: any) => i.condition === "Under Repair" || i.condition === "under_repair").length,
        damagedInventory: inventoryItems.filter((i: any) => i.condition === "Damaged" || i.condition === "damaged").length,
        publishedAnnouncements: announcements.filter((a: any) => a.status === "Published" || a.status === "published").length,
        sessionsToday: sessions.length,
        recentAnnouncements: announcements
          .filter((a: any) => a.status === "Published" || a.status === "published")
          .slice(0, 3)
          .map((a: any) => ({ id: a.id, title: a.title, status: a.status })),
        pendingCashItems: pendingCash.slice(0, 3).map((c: any) => ({
          parentName: c.submitter?.name || c.enrollment?.student?.full_name || c.parentName || "Orang Tua",
          amount: Number(c.amount) || 0,
        })),
        overdueInvoices: overdueInvoices.slice(0, 4).map((inv: any) => ({
          studentName: inv.enrollment?.student?.full_name || inv.siswa || "Siswa",
          amount: inv.jumlah || inv.amount || inv.total_amount || 0,
          program: inv.program || "—",
        })),
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <SkeletonDashboard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard Eksekutif Owner"
        subtitle="Ringkasan performa finansial, akademik, dan aktivitas operasional club."
        actions={
          <>
            <Link href="/owner/honor" className="btn btn-accent">Kelola Honor Guru</Link>
            <Link href="/owner/laporan" className="btn btn-outline">Laporan Lengkap</Link>
          </>
        }
      />

      {/* URGENT BANNER — Cash Verifikasi */}
      {data.pendingCashCount > 0 && (
        <div style={{ background: "var(--color-warning-bg)", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>{data.pendingCashCount} Pembayaran Cash Menunggu Verifikasi</div>
              <div style={{ fontSize: 12.5, color: "#b45309", marginTop: 1 }}>
                {data.pendingCashItems.map(c => `${c.parentName} (${formatRupiah(c.amount)})`).join(" & ")}
              </div>
            </div>
          </div>
          <Link href="/owner/verifikasi-cash" className="btn btn-sm" style={{ background: "var(--color-accent-dark)", color: "#fff", border: "none" }}>Konfirmasi Sekarang →</Link>
        </div>
      )}

      {/* BANNER RINGKASAN FINANSIAL */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, boxShadow: "0 10px 25px -5px rgba(26,92,138,0.3)" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pendapatan</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            {data.totalRevenue > 0 ? formatRupiah(data.totalRevenue) : <span style={{ fontSize: 18, opacity: 0.7 }}>Menunggu data keuangan...</span>}
          </div>
        </div>
        {data.totalRevenue > 0 && (
          <div style={{ display: "flex", gap: 24, borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 24 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Honor Terbayar</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{formatRupiah(data.honorPaid)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Laba Bersih Operasional</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7" }}>{formatRupiah(data.netProfit)}</div>
            </div>
          </div>
        )}
      </div>

      {/* STAT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <AnimatedStat label="Siswa Aktif" target={data.activeStudents} detail={`dari ${data.totalStudents} siswa terdaftar`} color="#1d4ed8" bg="var(--color-info-bg)" />
        <AnimatedStat label="Guru Aktif" target={data.activeTeachers} detail={`dari ${data.totalTeachers} guru terdaftar`} color="#059669" bg="var(--color-success-bg)" />
        <AnimatedStat label="Sesi Hari Ini" target={data.sessionsToday} detail="kelas berjalan" color="#7c3aed" bg="#ede9fe" />
        <AnimatedStat label="Kelas Aktif" target={data.activeClasses} detail={`dari ${data.totalClasses} kelas`} color="#d97706" bg="var(--color-accent-bg)" />
      </div>

      {/* ACADEMIC SHORTCUTS */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Akademik</h3>
          <Link href="/owner/pendaftaran" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <ShortcutGrid items={[
          { label: "Pendaftaran", sub: "Kelola pendaftaran", href: "/owner/pendaftaran", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Siswa", sub: `${data.activeStudents} Aktif`, href: "/owner/siswa", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Guru & Staff", sub: `${data.activeTeachers} Pengajar`, href: "/owner/guru", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Program", sub: `${data.totalPrograms} Program`, href: "/owner/program", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Kelas", sub: `${data.activeClasses} Kelas`, href: "/owner/kelas", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Jadwal", sub: `${data.sessionsToday} Hari Ini`, href: "/owner/jadwal", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Absensi & Logbook", sub: "Rekap kehadiran", href: "/owner/absensi", color: "#0369a1", bg: "var(--color-info-bg)" },
          { label: "Penilaian", sub: "Nilai & Sertifikat", href: "/owner/penilaian", color: "#d97706", bg: "var(--color-accent-bg)" },
        ]} />
      </div>

      {/* FINANCE SHORTCUTS */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Keuangan</h3>
          <Link href="/owner/pembayaran" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <ShortcutGrid items={[
          { label: "Tagihan", sub: `${data.overdueCount} Overdue`, href: "/owner/tagihan", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
          { label: "Pembayaran", sub: data.totalRevenue > 0 ? formatRupiah(data.totalRevenue) : "Lihat detail", href: "/owner/pembayaran", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Verifikasi Cash", sub: `${data.pendingCashCount} Menunggu`, href: "/owner/verifikasi-cash", color: "#b45309", bg: "var(--color-warning-bg)" },
          { label: "Honor Guru", sub: "Kelola honorarium", href: "/owner/honor", color: "#7c3aed", bg: "#ede9fe" },
        ]} />
      </div>

      {/* TAGIHAN OVERDUE + INVENTARIS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* TAGIHAN OVERDUE */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-danger)", margin: 0 }}>Tagihan Overdue</h3>
            <Link href="/owner/tagihan" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Ke Halaman Tagihan →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.overdueInvoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--color-text-muted)", fontSize: 13 }}>Tidak ada tagihan overdue</div>
            ) : data.overdueInvoices.map((inv, i) => (
              <div key={i} style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{inv.studentName}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-danger)", marginTop: 1 }}>{inv.program}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-danger)" }}>{formatRupiah(inv.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INVENTARIS OVERVIEW */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Inventaris</h3>
            <Link href="/owner/inventaris" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Kelola →</Link>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <div><div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-success)" }}>{data.goodInventory}</div><div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Kondisi Baik</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-warning)" }}>{data.underRepairInventory}</div><div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Perbaikan</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-danger)" }}>{data.damagedInventory}</div><div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Rusak</div></div>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Total {data.totalInventory} item tercatat</div>
        </div>
      </div>

      {/* PENGUMUMAN TERBARU */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Pengumuman Terbaru</h3>
          <Link href="/owner/pengumuman" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Kelola Pengumuman →</Link>
        </div>
        {data.recentAnnouncements.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic", padding: "12px 0" }}>Belum ada pengumuman yang dipublikasi.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.recentAnnouncements.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--color-bg)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.title}</span>
                <StatusBadge status={a.status} variant="announcement" size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LAPORAN + KELOLA AKUN + PENGATURAN */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Laporan</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ label: "Laporan Keuangan", sub: "Bulanan & Detail", href: "/owner/laporan/keuangan", color: "#1d4ed8", bg: "var(--color-info-bg)" },
              { label: "Laporan Kehadiran", sub: "Siswa & Guru", href: "/owner/laporan/kehadiran", color: "#059669", bg: "var(--color-success-bg)" },
              { label: "Laporan Inventaris", sub: "Status Barang", href: "/owner/laporan/inventaris", color: "#0369a1", bg: "var(--color-info-bg)" },
            ].map(m => (
              <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: m.bg, borderRadius: 8, border: `1.5px solid ${m.color}18` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{m.sub}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Kelola Akun</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/owner/kelola-akun/admin" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--color-success-bg)", borderRadius: 8, border: "1.5px solid #05996918" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>Akun Admin</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Manajemen akun admin</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Pengaturan</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/owner/tarif" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#ede9fe", borderRadius: 8, border: "1.5px solid #7c3aed18" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>Pengaturan Honor</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Tarif per jam per guru</div>
                </div>
              </div>
            </Link>
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)", marginTop: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Info Sistem</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { k: "Versi", v: "1.0.0" },
                  { k: "Siswa", v: `${data.totalStudents} total` },
                  { k: "Guru", v: `${data.totalTeachers} total` },
                  { k: "Kelas", v: `${data.activeClasses} aktif` },
                ].map(row => (
                  <div key={row.k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                    <span style={{ color: "var(--color-text-muted)" }}>{row.k}</span>
                    <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
