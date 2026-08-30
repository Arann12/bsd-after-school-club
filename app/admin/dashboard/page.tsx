import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin — BSD After School Club",
  description: "Ringkasan aktivitas dan tugas operasional Admin BSD After School Club",
};

/* ================================================================== */
/* Inline SVG Icons                                                    */
/* ================================================================== */
function IconDoor({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M10 10h.01" />
    </svg>
  );
}

function IconUsers({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconUserPlus({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );
}

function IconAlert({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconClipboard({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  );
}

function IconCheckCircle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconBook({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconBox({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function IconTool({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconSearch({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconMoney({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconExport({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconPlus({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconMore({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function IconChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ================================================================== */
/* Progress Pertemuan Component                                        */
/* ================================================================== */
const kelasData = [
  { name: "Calistung Level 1", guru: "Ms. Sarah", time: "14:00", done: 6, total: 12, color: "var(--color-primary)" },
  { name: "English B1", guru: "Mr. Andi", time: "15:00", done: 10, total: 12, color: "#3b82f6" },
  { name: "Math Advance", guru: "Ms. Nina", time: "16:00", done: 3, total: 12, color: "#10b981" },
  { name: "Phonics Starter", guru: "Ms. Sarah", time: "16:00", done: 1, total: 12, color: "#f59e0b" },
];

function ProgressPertemuan() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {kelasData.map((k) => {
        const pct = (k.done / k.total) * 100;
        return (
          <div key={k.name}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-text-primary)" }}>
                  {k.name}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  — {k.guru} ({k.time})
                </span>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: k.color }}>
                Pertemuan {k.done}/{k.total}
              </span>
            </div>
            <div className="progress-bar-bg" style={{ height: 8 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${pct}%`, background: k.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* Kehadiran Donut Chart                                               */
/* ================================================================== */
function KehadiranDonut() {
  // Total: 86 | Hadir 79, Absen 3, Sakit 2, Izin 2
  const total = 86;
  const segments = [
    { label: "Hadir", value: 79, color: "var(--color-primary)" },
    { label: "Absen", value: 3, color: "#ef4444" },
    { label: "Sakit", value: 2, color: "#f59e0b" },
    { label: "Izin", value: 2, color: "#8b5cf6" },
  ];

  const r = 56;
  const cx = 75;
  const cy = 75;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const frac = seg.value / total;
    const dash = frac * circumference;
    const offset = cumulative * circumference;
    cumulative += frac;
    return { ...seg, dash, offset };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* Donut */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={150} height={150} viewBox="0 0 150 150">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border-light)" strokeWidth={20} />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={20}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>Total Siswa</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.2 }}>{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-secondary)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
              {seg.label}
            </div>
            <span style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: 13.5 }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Main Admin Dashboard Page                                           */
/* ================================================================== */
export default function AdminDashboardPage() {
  return (
    <>
      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Admin</h1>
          <p className="page-subtitle">Ringkasan aktivitas dan tugas operasional.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" id="btn-admin-ekspor">
            <IconExport />
            Ekspor Laporan
          </button>
          <button className="btn btn-accent" id="btn-admin-tambah-siswa">
            <IconPlus />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* ── 6-COLUMN STAT CARDS ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
        {/* Total Kelas */}
        <div className="stat-card" style={{ gap: 10 }}>
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>Total Kelas</span>
            <div className="stat-card-icon" style={{ background: "#dbeafe", width: 32, height: 32 }}>
              <IconDoor size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 28 }}>12</div>
        </div>

        {/* Siswa Aktif */}
        <div className="stat-card" style={{ gap: 10 }}>
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>Siswa Aktif</span>
            <div className="stat-card-icon" style={{ background: "#d1fae5", width: 32, height: 32 }}>
              <IconUsers size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 28 }}>124</div>
        </div>

        {/* Pendaftaran */}
        <div className="stat-card" style={{ gap: 10 }}>
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>Pendaftaran</span>
            <div className="stat-card-icon" style={{ background: "#fef3c7", width: 32, height: 32 }}>
              <IconUserPlus size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 28 }}>5</div>
        </div>

        {/* Siswa Absen */}
        <div className="stat-card" style={{ gap: 10 }}>
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>Siswa Absen</span>
            <div className="stat-card-icon" style={{ background: "#fee2e2", width: 32, height: 32 }}>
              <IconAlert size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 28, color: "var(--color-danger)" }}>3</div>
        </div>

        {/* Logbook */}
        <div className="stat-card" style={{ gap: 10 }}>
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>Logbook</span>
            <div className="stat-card-icon" style={{ background: "#ede9fe", width: 32, height: 32 }}>
              <IconClipboard size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 28 }}>9/12</div>
        </div>

        {/* Verifikasi */}
        <div className="stat-card" style={{ gap: 10 }}>
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>Verifikasi</span>
            <div className="stat-card-icon" style={{ background: "#dcfce7", width: 32, height: 32 }}>
              <IconCheckCircle size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 28, color: "var(--color-warning)" }}>8</div>
        </div>
      </div>

      {/* ── ROW 2: PROGRESS PERTEMUAN + KEHADIRAN ──────────────────── */}
      <div className="grid-3-2">
        {/* Progress Pertemuan Hari Ini */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Progress Pertemuan Hari Ini</h2>
            <button className="more-btn" id="btn-progress-more" aria-label="More options">
              <IconMore />
            </button>
          </div>
          <div className="card-body">
            <ProgressPertemuan />
          </div>
        </div>

        {/* Kehadiran Siswa */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kehadiran Siswa</h2>
          </div>
          <div className="card-body">
            <KehadiranDonut />
          </div>
        </div>
      </div>

      {/* ── ROW 3: TUGAS + STATUS PEMBAYARAN ───────────────────────── */}
      <div className="grid-2">
        {/* Tugas yang Perlu Ditindaklanjuti */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tugas yang Perlu Ditindaklanjuti</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {/* Logbook Kelas Kosong */}
            <div className="action-item">
              <div className="action-icon" style={{ background: "var(--color-info-bg)", color: "var(--color-info)" }}>
                <IconBook size={18} />
              </div>
              <div className="action-content">
                <div className="action-title">Logbook Kelas Kosong</div>
                <div className="action-desc">Coding Lanjutan (Kemarin)</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                id="btn-ingatkan-logbook"
                style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
              >
                Ingatkan
                <IconChevronRight size={13} />
              </button>
            </div>

            {/* Verifikasi Pembayaran */}
            <div className="action-item">
              <div className="action-icon" style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}>
                <IconMoney size={18} />
              </div>
              <div className="action-content">
                <div className="action-title">Verifikasi Pembayaran</div>
                <div className="action-desc">8 Bukti transfer baru</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                id="btn-cek-pembayaran"
                style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
              >
                Cek
                <IconChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Pembayaran Menunggu Verifikasi */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Status Pembayaran (Menunggu Verifikasi)</h2>
            <button
              className="link-text"
              id="btn-lihat-semua-pembayaran"
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-primary)", whiteSpace: "nowrap" }}
            >
              Lihat Semua
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0, overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Program</th>
                  <th>Jumlah</th>
                  <th>Metode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { siswa: "Andi Setiawan", program: "Calistung Lv 1", jumlah: "Rp 500.000", metode: "Transfer BCA" },
                  { siswa: "Budi Santoso", program: "English B1", jumlah: "Rp 750.000", metode: "Transfer Mandiri" },
                  { siswa: "Citra Kirana", program: "Math Advance", jumlah: "Rp 600.000", metode: "Cash" },
                ].map((row) => (
                  <tr key={row.siswa}>
                    <td style={{ fontWeight: 600 }}>{row.siswa}</td>
                    <td>{row.program}</td>
                    <td style={{ fontWeight: 700 }}>{row.jumlah}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{row.metode}</td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: 11 }}>
                        Menunggu Verifikasi
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ROW 4: STATUS LOGBOOK + RINGKASAN INVENTARIS ───────────── */}
      <div className="grid-2">
        {/* Status Logbook Guru Hari Ini */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Status Logbook Guru (Hari Ini)</h2>
          </div>
          <div className="card-body">
            {/* Summary Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                padding: "14px 12px",
                textAlign: "center",
                border: "1px solid var(--color-border)",
              }}>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginBottom: 4 }}>Total Sesi</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)" }}>12</div>
              </div>
              <div style={{
                background: "#dbeafe",
                borderRadius: "var(--radius-md)",
                padding: "14px 12px",
                textAlign: "center",
                border: "1px solid #bfdbfe",
              }}>
                <div style={{ fontSize: 11.5, color: "#1d4ed8", marginBottom: 4, fontWeight: 600 }}>Selesai Diisi</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>9</div>
              </div>
              <div style={{
                background: "#fee2e2",
                borderRadius: "var(--radius-md)",
                padding: "14px 12px",
                textAlign: "center",
                border: "1px solid #fecaca",
              }}>
                <div style={{ fontSize: 11.5, color: "#b91c1c", marginBottom: 4, fontWeight: 600 }}>Belum Diisi</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#b91c1c" }}>3</div>
              </div>
            </div>

            {/* Perlu Diingatkan */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 10 }}>
                Perlu Diingatkan:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { guru: "Ms. Sarah", kelas: "Calistung Level 1", time: "14:00" },
                  { guru: "Mr. Andi", kelas: "English B1", time: "15:00" },
                ].map((item) => (
                  <div
                    key={item.guru}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-border-light)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-text-primary)" }}>
                        {item.guru}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        {item.kelas} ({item.time})
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      id={`btn-ingatkan-${item.guru.replace(" ", "-").toLowerCase()}`}
                    >
                      Ingatkan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Inventaris */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ringkasan Inventaris</h2>
            <button
              className="link-text"
              id="btn-detail-inventaris"
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}
            >
              Detail
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Kondisi Baik */}
              <div style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                padding: "18px 16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42,
                  borderRadius: "var(--radius-md)",
                  background: "#d1fae5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-success)",
                  flexShrink: 0,
                }}>
                  <IconCheckCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>Kondisi Baik</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)" }}>452</div>
                </div>
              </div>

              {/* Rusak */}
              <div style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                padding: "18px 16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42,
                  borderRadius: "var(--radius-md)",
                  background: "#fee2e2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-danger)",
                  flexShrink: 0,
                }}>
                  <IconAlert size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>Rusak</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-danger)" }}>12</div>
                </div>
              </div>

              {/* Perbaikan */}
              <div style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                padding: "18px 16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42,
                  borderRadius: "var(--radius-md)",
                  background: "#fef3c7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-warning)",
                  flexShrink: 0,
                }}>
                  <IconTool size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>Perbaikan</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-warning)" }}>5</div>
                </div>
              </div>

              {/* Hilang */}
              <div style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                padding: "18px 16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42,
                  borderRadius: "var(--radius-md)",
                  background: "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                }}>
                  <IconSearch size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>Hilang</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-secondary)" }}>2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
