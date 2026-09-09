"use client";
import Link from "next/link";
import { students, todaySchedules, honorRecords, classes, announcements } from "@/lib/data";
import { formatRupiah } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { useCountUp, useLoadingState } from "@/lib/hooks";
import { SkeletonDashboard } from "@/components/ui/Skeleton";

const myName = "Ms. Sarah";
const mySchedules = todaySchedules.filter(s => s.teacher === myName);
const myHonor = honorRecords.find(h => h.teacherName === myName);
const myStudents = students.filter(s => s.guru === myName);
const myClasses = classes.filter(c => c.teacher === myName);

export default function GuruDashboardPage() {
  const loading = useLoadingState(500);
  const countSesi = useCountUp(mySchedules.length);
  const countJam = useCountUp(myHonor?.totalHours || 0);
  const countKelas = useCountUp(myClasses.length);
  const countSiswa = useCountUp(myStudents.length);

  if (loading) return <SkeletonDashboard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title={`Selamat Datang, ${myName}`}
        subtitle="Ringkasan aktivitas mengajar Anda hari ini — kelas, logbook, dan progress siswa."
        actions={<Link href="/guru/jadwal" className="btn btn-accent">Lihat Jadwal Lengkap →</Link>}
      />

      {/* STAT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Sesi Hari Ini" value={countSesi} detail={mySchedules.map(s => s.className).join(", ") || "Tidak ada"} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Jam Bulan Ini" value={countJam} detail={`${myHonor?.sessionsCompleted || 0} sesi`} color="#1d4ed8" bg="var(--color-info-bg)" />
        <StatCard label="Kelas Saya" value={countKelas} detail="Kelas aktif" color="#7c3aed" bg="#ede9fe" />
        <StatCard label="Siswa Diajar" value={countSiswa} detail="Di semua kelas" color="#0369a1" bg="var(--color-info-bg)" />
      </div>

      {/* ============ KELAS SAYA SECTION ============ */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>📖 Kelas Saya</h3>
        </div>
        {/* Shortcut Menu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Jadwal Mengajar", sub: `${mySchedules.length} Hari Ini`, href: "/guru/jadwal", color: "#1d4ed8", bg: "var(--color-info-bg)" },
            { label: "Kelas & Absensi", sub: "Isi Absensi", href: "/guru/kelas", color: "#7c3aed", bg: "#ede9fe" },
            { label: "Kalender & Logbook", sub: "Isi Materi", href: "/guru/logbook", color: "#059669", bg: "var(--color-success-bg)" },
            { label: "Pengumuman", sub: "Info Terbaru", href: "/guru/pengumuman", color: "#b45309", bg: "var(--color-warning-bg)" },
          ].map(m => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
              <div style={{ background: m.bg, borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${m.color}18`, cursor: "pointer", transition: "transform .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.label}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 3 }}>{m.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Kelas yang diampu */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Kelas Yang Diampu</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {myClasses.map((c, i) => (
            <Link key={i} href="/guru/kelas" style={{ textDecoration: "none" }}>
              <div style={{ padding: "14px 16px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)", transition: "transform .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{c.program} — {c.level}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{c.day} · {c.timeStart}–{c.timeEnd}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{c.enrolled}/{c.capacity} Siswa</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ============ JADWAL HARI INI + PENGUMUMAN ============ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Jadwal Hari Ini */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Jadwal Mengajar Hari Ini</h3>
            <Link href="/guru/jadwal" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mySchedules.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>Tidak ada jadwal hari ini</div>
            ) : mySchedules.map((j, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{j.className} — {j.program}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{j.timeStart}–{j.timeEnd} · {j.room}</div>
                </div>
                <StatusBadge status={j.status} />
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
            {announcements.filter(a => a.status === "Published").slice(0, 3).map((a, i) => (
              <div key={i} style={{ padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-accent)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{a.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{a.publishedAt} · {a.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ REKAP MENGAJAR SECTION ============ */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>⏱️ Rekap Mengajar Saya</h3>
          <Link href="/guru/honor" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Detail →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div style={{ padding: "16px", background: "var(--color-success-bg)", borderRadius: 10, border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>Sesi Selesai Bulan Ini</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#059669", marginTop: 4 }}>{myHonor?.sessionsCompleted || 0}</div>
            <div style={{ fontSize: 11.5, color: "#15803d", marginTop: 2 }}>Dari total jam mengajar</div>
          </div>
          <div style={{ padding: "16px", background: "var(--color-info-bg)", borderRadius: 10, border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>Total Jam Mengajar</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0369a1", marginTop: 4 }}>{myHonor?.totalHours || 0} Jam</div>
            <div style={{ fontSize: 11.5, color: "#0369a1", marginTop: 2 }}>Tarif: {formatRupiah(myHonor?.hourlyRate || 0)}/jam</div>
          </div>
          <div style={{ padding: "16px", background: "#ede9fe", borderRadius: 10, border: "1px solid #c4b5fd" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>Logbook Tersimpan</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#7c3aed", marginTop: 4 }}>100%</div>
            <div style={{ fontSize: 11.5, color: "#7c3aed", marginTop: 2 }}>Semua sesi sudah diisi</div>
          </div>
        </div>
      </div>

      {/* ============ SISWA PERLU DIPERHATIKAN ============ */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-danger)", margin: "0 0 14px" }}>⚠️ Siswa Perlu Diperhatikan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {[
            { nama: "Dian Pratama", program: "Phonics Starter", catatan: "3x absensi berurutan tidak hadir", statusBayar: "Belum Bayar" },
            { nama: "Gilang Ramadan", program: "Math Advance", catatan: "Progress belajar masih rendah", statusBayar: "Partially Paid" },
            { nama: "Hana Pertiwi", program: "Phonics Starter", catatan: "SPP overdue 5 hari", statusBayar: "Overdue" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--color-danger-bg)", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{s.nama}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 1 }}>{s.program}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{s.catatan}</div>
                </div>
                <StatusBadge status={s.statusBayar} variant="payment" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
