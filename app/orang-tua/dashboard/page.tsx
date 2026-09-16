"use client";
import Link from "next/link";
import { students, todaySchedules, announcements, invoices, certificates } from "@/lib/data";
import { PAYMENT_STATUS_COLOR, formatRupiah } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { useLoadingState } from "@/lib/hooks";
import { SkeletonDashboard } from "@/components/ui/Skeleton";

const myChild = students.find(s => s.id === "STD-2026-0001"); // Budi's child
const myInvoice = invoices.find(i => i.idSiswa === "STD-2026-0001");
const todaySession = todaySchedules.find(s => s.className === "KLS-A");
const myCertificate = certificates.find(c => c.studentId === "STD-2026-0001");

export default function OrangTuaDashboardPage() {
  const loading = useLoadingState(500);
  if (loading) return <SkeletonDashboard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Selamat Datang, Bapak Budi" subtitle="Ringkasan aktivitas akademik dan pembayaran anak Anda di BSD After School Club." />

      {/* HERO CHILD SUMMARY */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>Anak Terhubung</span>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "8px 0 4px" }}>{myChild?.name}</h2>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Program: {myChild?.program} {myChild?.level} · Kelas {myChild?.kelas} ({myChild?.guru})</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/orang-tua/anak" className="btn btn-accent" style={{ textDecoration: "none" }}>Lihat Detail Progress</Link>
          <Link href="/orang-tua/pembayaran" className="btn" style={{ background: "var(--color-info)", color: "#fff", border: "none", fontWeight: 700, textDecoration: "none" }}>Status SPP</Link>
        </div>
      </div>

      {/* STAT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Status Siswa" value={myChild?.status || "Aktif"} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Status SPP" value={myChild?.tagihan || "Lunas"} color={myChild?.tagihan === "Lunas" ? "#059669" : "var(--color-danger)"} bg={myChild?.tagihan === "Lunas" ? "var(--color-success-bg)" : "var(--color-danger-bg)"} />
        <StatCard label="Pertemuan" value={myChild?.pertemuan || "6/12"} detail="Selesai / Total" color="#7c3aed" bg="#ede9fe" />
        <StatCard label="Sertifikat" value={myCertificate ? "1" : "0"} detail={myCertificate ? myCertificate.id : "Belum ada"} color="#d97706" bg="var(--color-accent-bg)" />
      </div>

      {/* ============ ANAK SAYA SECTION ============ */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>👶 Anak Saya</h3>
          <Link href="/orang-tua/anak" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Detail →</Link>
        </div>
        {myChild && (
          <div style={{ padding: "16px 20px", background: "var(--color-bg)", borderRadius: 12, border: "1px solid var(--color-border)", display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{myChild.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{myChild.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{myChild.id} · {myChild.program} {myChild.level}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <StatusBadge status={myChild.status} variant="student" />
                <StatusBadge status={myChild.tagihan} variant="payment" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)" }}>{myChild.pertemuan}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Pertemuan</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)" }}>{myChild.kelas}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Kelas</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)" }}>{myChild.guru}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Guru</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ JADWAL + PEMBAYARAN ============ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Jadwal Terdekat */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>📅 Jadwal Terdekat</h3>
            <Link href="/orang-tua/jadwal" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          {todaySession ? (
            <div style={{ background: "var(--color-success-bg)", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ background: "var(--color-success)", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>HARI INI</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#166534", marginTop: 6 }}>{todaySession.day}, {todaySession.timeStart} – {todaySession.timeEnd} WIB</div>
                <div style={{ fontSize: 13, color: "#15803d", marginTop: 2 }}>{todaySession.program} · {todaySession.room}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11.5, color: "#166534", fontWeight: 700 }}>Pengajar</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#166534" }}>{todaySession.teacher}</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>Tidak ada jadwal hari ini</div>
          )}
        </div>

        {/* Status Pembayaran */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>💳 Pembayaran</h3>
            <Link href="/orang-tua/pembayaran" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          {myInvoice ? (
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>{myInvoice.program}</span>
                <StatusBadge status={myInvoice.status} variant="payment" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)" }}>{formatRupiah(myInvoice.jumlah)}</div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 4 }}>{myInvoice.pertemuan} · {myInvoice.tanggal}</div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>Metode: {myInvoice.metode}</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>Tidak ada tagihan</div>
          )}
        </div>
      </div>

      {/* ============ PENGUMUMAN + SERTIFIKAT ============ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Pengumuman */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>🔔 Pengumuman</h3>
            <Link href="/orang-tua/pengumuman" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Semua Pengumuman →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {announcements.filter(a => a.status === "Published").slice(0, 3).map((a, i) => (
              <div key={i} style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 18px", borderLeft: "4px solid var(--color-accent)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 4px" }}>{a.title}</h4>
                <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{a.content.length > 120 ? a.content.slice(0, 120) + "..." : a.content}</p>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>{a.publishedAt} · {a.target}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sertifikat */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>🎓 Sertifikat</h3>
            <Link href="/orang-tua/sertifikat" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua →</Link>
          </div>
          {myCertificate ? (
            <div style={{ padding: "16px", background: "var(--color-accent-bg)", borderRadius: 12, border: "1.5px solid #fde68a" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Sertifikat Kelulusan</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{myCertificate.program} — {myCertificate.level}</div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 4 }}>Nilai Akhir: <span style={{ fontWeight: 800, color: "var(--color-primary)" }}>{myCertificate.finalScore}</span></div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{myCertificate.id} · {myCertificate.issueDate}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <StatusBadge status="Lulus" />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)", fontSize: 13 }}>Sertifikat akan tersedia setelah kelulusan</div>
          )}
          {/* Info link */}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--color-bg)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>Informasi</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>Sertifikat kelulusan diterbitkan setelah siswa menyelesaikan semua pertemuan dan diverifikasi oleh Admin/Owner.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
