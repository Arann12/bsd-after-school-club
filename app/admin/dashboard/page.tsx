"use client";
import Link from "next/link";
import { students, teachers, classes, todaySchedules, invoices, cashVerifications, enrollments, announcements, inventory, certificates, parents } from "@/lib/data";
import { formatRupiah } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { useCountUp, useLoadingState } from "@/lib/hooks";
import { SkeletonStatGrid, SkeletonDashboard } from "@/components/ui/Skeleton";

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

const activeStudents = students.filter(s => s.status === "Aktif");
const activeTeachers = teachers.filter(t => t.status === "Aktif");
const activeSessions = todaySchedules.filter(s => s.status === "Berlangsung" || s.status === "Selesai");
const pendingEnrollments = enrollments.filter(e => e.status === "Pending");
const overdueInvoices = invoices.filter(i => i.status === "Overdue");
const pendingCash = cashVerifications.filter(c => c.status === "Menunggu Konfirmasi");

export default function AdminDashboardPage() {
  const loading = useLoadingState(500);
  const countStudents = useCountUp(activeStudents.length);
  const countOverdue = useCountUp(overdueInvoices.length);
  const countPending = useCountUp(pendingEnrollments.length);
  const countPendingCash = useCountUp(pendingCash.length);

  if (loading) return <SkeletonDashboard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard Operasional Admin"
        subtitle="Pusat kendali harian — pendaftaran, tagihan, absensi, dan jadwal kelas BSD After School Club."
        actions={<>
          <Link href="/admin/pendaftaran" className="btn btn-accent">+ Pendaftaran Baru</Link>
          <Link href="/admin/verifikasi-cash" className="btn btn-outline">Verifikasi Cash</Link>
        </>}
      />

      {/* URGENT BANNER */}
      {pendingCash.length > 0 && (
        <div style={{ background: "var(--color-warning-bg)", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>{pendingCash.length} Pembayaran Cash Menunggu Verifikasi</div>
              <div style={{ fontSize: 12.5, color: "#b45309", marginTop: 1 }}>{pendingCash.map(c => `${c.parentName} (${formatRupiah(c.amount)})`).join(" & ")}</div>
            </div>
          </div>
          <Link href="/admin/verifikasi-cash" className="btn btn-sm" style={{ background: "var(--color-accent-dark)", color: "#fff", border: "none" }}>Konfirmasi Sekarang →</Link>
        </div>
      )}

      {/* STAT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Total Siswa Aktif" value={countStudents} detail={`${classes.filter(c => c.status === "Aktif").length} kelas berjalan`} color="#1d4ed8" bg="var(--color-info-bg)" />
        <StatCard label="Sesi Hari Ini" value={`${activeSessions.length} Sesi`} detail={`${todaySchedules.filter(s => s.status === "Selesai").length} selesai`} color="#7c3aed" bg="#ede9fe" />
        <StatCard label="Tagihan Overdue" value={countOverdue} detail="Perlu follow up" color="var(--color-danger)" bg="var(--color-danger-bg)" />
        <StatCard label="Pendaftaran Pending" value={countPending} detail="Menunggu review" color="#059669" bg="var(--color-success-bg)" />
      </div>

      {/* ============ ACADEMIC SECTION ============ */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>📚 Akademik</h3>
          <Link href="/admin/pendaftaran" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <ShortcutGrid items={[
          { label: "Pendaftaran", sub: `${pendingEnrollments.length} Pending`, href: "/admin/pendaftaran", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Siswa", sub: `${activeStudents.length} Aktif`, href: "/admin/students", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Orang Tua", sub: `${parents.length} Akun`, href: "/admin/orang-tua", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Guru & Staff", sub: `${activeTeachers.length} Aktif`, href: "/admin/guru", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Program", sub: "8 Program", href: "/admin/programs", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Level", sub: "24 Level", href: "/admin/level", color: "#0369a1", bg: "var(--color-info-bg)" },
          { label: "Kelas", sub: `${classes.filter(c => c.status === "Aktif").length} Aktif`, href: "/admin/classes", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Jadwal", sub: `${todaySchedules.length} Hari Ini`, href: "/admin/schedule", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Absensi & Logbook", sub: "Isi Absensi", href: "/admin/absensi", color: "#0369a1", bg: "var(--color-info-bg)" },
          { label: "Sertifikat", sub: `${certificates.length} Terbit`, href: "/admin/sertifikat", color: "#d97706", bg: "var(--color-accent-bg)" },
        ]} />
        {/* Academic mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 14 }}>
          {[
            { label: "Total Siswa", val: students.length, color: "#1d4ed8" },
            { label: "Total Guru", val: teachers.length, color: "#059669" },
            { label: "Total Kelas", val: classes.length, color: "#7c3aed" },
            { label: "Program Aktif", val: 8, color: "#0369a1" },
            { label: "Sertifikat", val: certificates.length, color: "#d97706" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "10px 0", background: "var(--color-bg)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ FINANCE SECTION ============ */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>💰 Keuangan</h3>
          <Link href="/admin/tagihan" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <ShortcutGrid items={[
          { label: "Tagihan", sub: `${overdueInvoices.length} Overdue`, href: "/admin/tagihan", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
          { label: "Pembayaran", sub: `${invoices.filter(i => i.status === "Lunas").length} Lunas`, href: "/admin/pembayaran", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Verifikasi Cash", sub: `${pendingCash.length} Menunggu`, href: "/admin/verifikasi-cash", color: "#b45309", bg: "var(--color-warning-bg)" },
        ]} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
          {[
            { label: "Total Lunas", val: formatRupiah(invoices.filter(i => i.status === "Lunas").reduce((s, i) => s + i.jumlah, 0)), color: "#059669", bg: "var(--color-success-bg)" },
            { label: "Total Overdue", val: formatRupiah(overdueInvoices.reduce((s, i) => s + i.jumlah, 0)), color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
            { label: "Cash Pending", val: formatRupiah(pendingCash.reduce((s, c) => s + c.amount, 0)), color: "#b45309", bg: "var(--color-warning-bg)" },
          ].map(s => (
            <div key={s.label} style={{ padding: "10px 12px", background: s.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ JADWAL HARI INI + TAGIHAN OVERDUE ============ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Mengajar Hari Ini</h3>
            <Link href="/admin/schedule" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {todaySchedules.slice(0, 6).map((j, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{j.className} — {j.program}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{j.timeStart}–{j.timeEnd} · {j.teacher}</div>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-danger)", margin: 0 }}>Tagihan Overdue</h3>
            <Link href="/admin/tagihan" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Ke Tagihan →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {overdueInvoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>✅ Tidak ada overdue</div>
            ) : overdueInvoices.map((inv, i) => (
              <div key={i} style={{ background: "var(--color-danger-bg)", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{inv.siswa}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 1 }}>{inv.program}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-danger)" }}>{formatRupiah(inv.jumlah)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ OPERATIONAL + KELOLA AKUN ============ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* OPERATIONAL */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>📦 Operasional</h3>
          <ShortcutGrid items={[
            { label: "Inventaris", sub: `${inventory.length} Item`, href: "/admin/inventaris", color: "#0369a1", bg: "var(--color-info-bg)" },
            { label: "Pengumuman", sub: `${announcements.filter(a => a.status === "Published").length} Published`, href: "/admin/pengumuman", color: "#b45309", bg: "var(--color-warning-bg)" },
          ]} />
          <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--color-border)", marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Inventaris Overview</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)" }}>{inventory.filter(i => i.condition === "Good").length}</div><div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Baik</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-warning)" }}>{inventory.filter(i => i.condition === "Under Repair").length}</div><div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Perbaikan</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-danger)" }}>{inventory.filter(i => i.condition === "Damaged").length}</div><div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Rusak</div></div>
            </div>
          </div>
          {/* Pengumuman terbaru */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Pengumuman Terbaru</div>
            {announcements.filter(a => a.status === "Published").slice(0, 2).map((a, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i === 0 ? "1px solid var(--color-border-light)" : "none" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.title}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 1 }}>{a.publishedAt} · {a.target}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KELOLA AKUN */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>🔐 Kelola Akun</h3>
          <ShortcutGrid items={[
            { label: "Akun Guru", sub: `${teachers.length} Guru`, href: "/admin/kelola-akun/guru", color: "#7c3aed", bg: "#ede9fe" },
            { label: "Akun Orang Tua", sub: `${parents.length} Orang Tua`, href: "/admin/kelola-akun/orang-tua", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          ]} />
          {/* Daftar guru aktif */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Guru Aktif</div>
            {activeTeachers.slice(0, 4).map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--color-border-light)" : "none" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{g.specialization}</div>
                </div>
                <StatusBadge status={g.status} />
              </div>
            ))}
          </div>
          {/* Daftar orang tua */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Orang Tua Terbaru</div>
            {parents.slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--color-border-light)" : "none" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{p.email}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", background: "var(--color-primary-bg)", padding: "2px 8px", borderRadius: 999 }}>{p.children.length} Anak</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
