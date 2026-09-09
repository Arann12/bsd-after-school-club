"use client";
import Link from "next/link";
import { students, teachers, classes, todaySchedules, invoices, cashVerifications, honorRecords, certificates, announcements, inventory, revenueSummary, dashboardCounts } from "@/lib/data";
import { PAYMENT_STATUS_COLOR, CASH_STATUS_COLOR, ANNOUNCEMENT_STATUS_COLOR, INVENTORY_CONDITION_COLOR, formatRupiah } from "@/lib/constants";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { useCountUp, useLoadingState } from "@/lib/hooks";
import { SkeletonStatGrid, SkeletonDashboard } from "@/components/ui/Skeleton";

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
  const loading = useLoadingState(600);

  if (loading) return <SkeletonDashboard />;

  const pendingCash = cashVerifications.filter(c => c.status === "Menunggu Konfirmasi");
  const overdueInvoices = invoices.filter(i => i.status === "Overdue");
  const activeTeachers = teachers.filter(t => t.status === "Aktif");
  const activeStudents = students.filter(s => s.status === "Aktif");

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
      {pendingCash.length > 0 && (
        <div style={{ background: "var(--color-warning-bg)", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>{pendingCash.length} Pembayaran Cash Menunggu Verifikasi</div>
              <div style={{ fontSize: 12.5, color: "#b45309", marginTop: 1 }}>{pendingCash.map(c => `${c.parentName} (${formatRupiah(c.amount)})`).join(" & ")}</div>
            </div>
          </div>
          <Link href="/owner/verifikasi-cash" className="btn btn-sm" style={{ background: "var(--color-accent-dark)", color: "#fff", border: "none" }}>Konfirmasi Sekarang →</Link>
        </div>
      )}

      {/* BANNER RINGKASAN EKSEKUTIF */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, boxShadow: "0 10px 25px -5px rgba(26,92,138,0.3)" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pendapatan Bulan Ini (September 2026)</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>{formatRupiah(revenueSummary.totalIncome)}</div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "var(--color-success-bg)", color: "var(--color-success)", fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>↑ +{revenueSummary.growthPercent}%</span>
            <span>dibanding bulan lalu ({formatRupiah(revenueSummary.lastMonthIncome)})</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 24 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Honor Terbayar</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{formatRupiah(revenueSummary.honorPaid)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Laba Bersih Operasional</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7" }}>{formatRupiah(revenueSummary.netProfit)}</div>
          </div>
        </div>
      </div>

      {/* STAT GRID — Animated */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <AnimatedStat label="Total Siswa Aktif" target={activeStudents.length} detail={`${dashboardCounts.totalPrograms} program berjalan`} color="#1d4ed8" bg="var(--color-info-bg)" />
        <AnimatedStat label="Total Guru & Staff" target={activeTeachers.length} detail="Semua aktif mengajar" color="#059669" bg="var(--color-success-bg)" />
        <AnimatedStat label="Kelas Berjalan Hari Ini" target={todaySchedules.filter(s => s.status === "Berlangsung" || s.status === "Selesai").length} detail="100% tepat waktu" color="#7c3aed" bg="#ede9fe" />
        <AnimatedStat label="Sertifikat Terbit" target={dashboardCounts.certificatesIssued} detail="Program Graduated" color="#d97706" bg="var(--color-accent-bg)" />
      </div>

      {/* ACADEMIC SHORTCUTS */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>📚 Akademik</h3>
          <Link href="/owner/pendaftaran" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <ShortcutGrid items={[
          { label: "Pendaftaran", sub: `${dashboardCounts.pendingEnrollments} Pending`, href: "/owner/pendaftaran", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Siswa", sub: `${activeStudents.length} Aktif`, href: "/owner/siswa", color: "#1d4ed8", bg: "var(--color-info-bg)" },
          { label: "Guru & Staff", sub: `${activeTeachers.length} Pengajar`, href: "/owner/guru", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Program", sub: `${dashboardCounts.totalPrograms} Program`, href: "/owner/program", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Kelas", sub: `${dashboardCounts.activeClasses} Kelas`, href: "/owner/kelas", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Jadwal", sub: `${todaySchedules.length} Hari Ini`, href: "/owner/jadwal", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Absensi & Logbook", sub: "Senin terkini", href: "/owner/absensi", color: "#0369a1", bg: "var(--color-info-bg)" },
          { label: "Penilaian", sub: `${dashboardCounts.certificatesIssued} Sertifikat`, href: "/owner/penilaian", color: "#d97706", bg: "var(--color-accent-bg)" },
        ]} />
      </div>

      {/* FINANCE SHORTCUTS + DETAIL */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>💰 Keuangan</h3>
          <Link href="/owner/pembayaran" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <ShortcutGrid items={[
          { label: "Tagihan", sub: `${dashboardCounts.overdueInvoices} Overdue`, href: "/owner/tagihan", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
          { label: "Pembayaran", sub: `${formatRupiah(revenueSummary.totalIncome)} Bulan Ini`, href: "/owner/pembayaran", color: "#059669", bg: "var(--color-success-bg)" },
          { label: "Verifikasi Cash", sub: `${dashboardCounts.pendingCashVerifications} Menunggu`, href: "/owner/verifikasi-cash", color: "#b45309", bg: "var(--color-warning-bg)" },
          { label: "Honor Guru", sub: `${formatRupiah(revenueSummary.honorPaid)} Terbayar`, href: "/owner/honor", color: "#7c3aed", bg: "#ede9fe" },
        ]} />
      </div>

      {/* GRAFIK + AKTIVITAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Pendapatan per Program</h3>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>September 2026</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {revenueSummary.byProgram.map((p, i) => {
              const colors = ["var(--color-primary)", "#059669", "#7c3aed", "#d97706"];
              const pct = Math.round((p.amount / revenueSummary.totalIncome) * 100);
              return (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: "var(--color-text-primary)" }}>{p.name}</span>
                    <span style={{ color: colors[i] }}>{formatRupiah(p.amount)}</span>
                  </div>
                  <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: colors[i], width: `${pct}%`, borderRadius: 999, transition: "width .4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Aktivitas Terbaru</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { teks: `Konfirmasi Cash ${formatRupiah(pendingCash[0]?.amount || 100000)} (${pendingCash[0]?.parentName || "Budi Setiawan"})`, waktu: "10 menit lalu", jenis: "pembayaran" },
              { teks: "Pendaftaran Siswa Baru: Naura Azzahra", waktu: "1 jam lalu", jenis: "siswa" },
              { teks: "Logbook KLS-A diisi oleh Ms. Sarah", waktu: "2 jam lalu", jenis: "logbook" },
              { teks: `Honor Ms. Sarah disetujui (${formatRupiah(1450000)})`, waktu: "Kemarin", jenis: "honor" },
              { teks: "Pengumuman dipublish: \"Jadwal Libur\"", waktu: "Kemarin", jenis: "pengumuman" },
              { teks: `Sertifikat ${certificates[0]?.id} diterbitkan`, waktu: "2 hari lalu", jenis: "sertifikat" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: i < 5 ? 12 : 0, borderBottom: i < 5 ? "1px solid var(--color-border-light)" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.jenis === "pembayaran" ? "var(--color-success)" : a.jenis === "siswa" ? "#1d4ed8" : a.jenis === "honor" ? "#7c3aed" : a.jenis === "pengumuman" ? "#b45309" : "#d97706", marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.4 }}>{a.teks}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{a.waktu}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JADWAL HARI INI + TAGIHAN OVERDUE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Mengajar Hari Ini</h3>
            <Link href="/owner/jadwal" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {todaySchedules.slice(0, 6).map((j, i) => {
              const statusColors: Record<string, { warna: string; bg: string }> = {
                Selesai: { warna: "var(--color-success)", bg: "var(--color-success-bg)" },
                Berlangsung: { warna: "#1d4ed8", bg: "var(--color-info-bg)" },
                Terjadwal: { warna: "#b45309", bg: "var(--color-warning-bg)" },
                Dibatalkan: { warna: "var(--color-danger)", bg: "var(--color-danger-bg)" },
              };
              const sc = statusColors[j.status] || statusColors.Terjadwal;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{j.className} — {j.program}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{j.timeStart}–{j.timeEnd} · {j.teacher}</div>
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-danger)", margin: 0 }}>Tagihan Overdue</h3>
            <Link href="/owner/tagihan" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Ke Halaman Tagihan →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {overdueInvoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--color-text-muted)", fontSize: 13 }}>✅ Tidak ada tagihan overdue</div>
            ) : overdueInvoices.map((inv, i) => (
              <div key={i} style={{ background: "#fff5f5", border: `1.5px solid ${PAYMENT_STATUS_COLOR.Overdue.bg === "#fce7f3" ? "#fecaca" : "#fecaca"}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{inv.siswa}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-danger)", marginTop: 1 }}>{inv.program} · {inv.pertemuan}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-danger)" }}>{formatRupiah(inv.jumlah)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OPERATIONAL */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>📦 Operasional</h3>
        </div>
        <ShortcutGrid items={[
          { label: "Inventaris", sub: `${dashboardCounts.totalInventory} Item`, href: "/owner/inventaris", color: "#0369a1", bg: "var(--color-info-bg)" },
          { label: "Pengumuman", sub: `${dashboardCounts.publishedAnnouncements} Published`, href: "/owner/pengumuman", color: "#b45309", bg: "var(--color-warning-bg)" },
        ]} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 14 }}>
          <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Inventaris Overview</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)" }}>{dashboardCounts.goodInventory}</div><div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Baik</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-warning)" }}>{dashboardCounts.underRepairInventory}</div><div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Perbaikan</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-danger)" }}>{dashboardCounts.damagedInventory}</div><div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Rusak</div></div>
            </div>
          </div>
          <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Pengumuman Terbaru</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {announcements.filter(a => a.status !== "Draft").slice(0, 3).map((a, i) => {
                const colors = ANNOUNCEMENT_STATUS_COLOR[a.status];
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.title}</span>
                    <StatusBadge status={a.status} variant="announcement" size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LAPORAN + KELOLA AKUN + PENGATURAN */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>📊 Laporan</h3>
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
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>🔐 Kelola Akun</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ label: "Akun Admin", sub: "2 Admin", href: "/owner/kelola-akun/admin", color: "#059669", bg: "var(--color-success-bg)" },
              { label: "Akun Guru", sub: `${teachers.length} Guru`, href: "/owner/kelola-akun/guru", color: "#7c3aed", bg: "#ede9fe" },
              { label: "Akun Orang Tua", sub: "10 Orang Tua", href: "/owner/kelola-akun/orang-tua", color: "#1d4ed8", bg: "var(--color-info-bg)" },
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
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>⚙️ Pengaturan</h3>
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
                {[{ k: "Versi", v: "1.0.0" }, { k: "Siswa", v: `${dashboardCounts.totalStudents} total` }, { k: "Guru", v: `${teachers.length} total` }, { k: "Kelas", v: `${dashboardCounts.activeClasses} aktif` }].map(row => (
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

      {/* PENILAIAN & SERTIFIKAT */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>🎓 Sertifikat Terbaru</h3>
          <Link href="/owner/penilaian" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {certificates.map((s, i) => (
            <div key={i} style={{ padding: "14px 16px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{s.studentName}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{s.program} — {s.level}</div>
                </div>
                <StatusBadge status="Lulus" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Nilai Akhir</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-primary)" }}>{s.finalScore}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.id}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.issueDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
