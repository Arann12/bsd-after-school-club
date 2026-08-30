import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — BSD After School Club",
  description: "Ringkasan aktivitas operasional harian BSD After School Club",
};

/* ================================================================== */
/* Inline SVG Icons                                                    */
/* ================================================================== */
function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMoney({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconStaff({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function IconChart({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconAlert({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconUser2({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconTrendUp({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconTrendDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
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

function IconRefresh({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
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

function IconHonor({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

/* ================================================================== */
/* Bar Chart Component                                                 */
/* ================================================================== */
const chartData = [
  { label: "Jan", income: 52, target: 46 },
  { label: "Feb", income: 68, target: 60 },
  { label: "Mar", income: 80, target: 72 },
  { label: "Apr", income: 95, target: 85 },
  { label: "Mei", income: 62, target: 78 },
  { label: "Jun", income: 75, target: 70 },
];

function BarChart() {
  const max = 100;
  return (
    <div className="bar-chart-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <select className="select-control" id="chart-period-select">
          <option>Tahun Ini</option>
          <option>Tahun Lalu</option>
          <option>6 Bulan</option>
        </select>
      </div>
      <div style={{ display: "flex", height: 200, gap: 0 }}>
        {/* Y-axis labels */}
        <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)", width: 42, textAlign: "right", paddingRight: 8, paddingBottom: 24 }}>
          <span>0</span>
          <span>25M</span>
          <span>50M</span>
          <span>75M</span>
          <span>100M</span>
        </div>
        {/* Bars */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 10, borderLeft: "1px solid var(--color-border-light)", borderBottom: "1px solid var(--color-border-light)", padding: "0 4px" }}>
            {chartData.map((d) => (
              <div key={d.label} style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, height: "100%" }}>
                <div
                  style={{
                    flex: 1,
                    height: `${(d.income / max) * 100}%`,
                    background: "var(--color-primary)",
                    borderRadius: "4px 4px 0 0",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  title={`Pendapatan: Rp ${d.income}M`}
                />
                <div
                  style={{
                    flex: 1,
                    height: `${(d.target / max) * 100}%`,
                    background: "#b8cfe8",
                    borderRadius: "4px 4px 0 0",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  title={`Target: Rp ${d.target}M`}
                />
              </div>
            ))}
          </div>
          {/* X-axis labels */}
          <div style={{ display: "flex", gap: 10, padding: "6px 4px 0", paddingLeft: 4 }}>
            {chartData.map((d) => (
              <div key={d.label} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--color-text-muted)" }}>
                {d.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "var(--color-primary)" }} />
          Pendapatan
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#b8cfe8" }} />
          Pengeluaran (Target)
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Donut Chart Component                                               */
/* ================================================================== */
function DonutChart() {
  // SVG donut — verified: total = 88 + 12 = 100%
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const verified = 0.88;
  const waiting = 0.12;

  const verifiedDash = verified * circumference;
  const waitingDash = waiting * circumference;

  return (
    <div className="donut-wrap">
      <div className="donut-svg-wrap">
        <svg width={160} height={160} viewBox="0 0 160 160">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border-light)" strokeWidth={22} />
          {/* Waiting segment (drawn first, behind) */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={22}
            strokeDasharray={`${waitingDash} ${circumference - waitingDash}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* Verified segment */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={22}
            strokeDasharray={`${verifiedDash} ${circumference - verifiedDash}`}
            strokeDashoffset={`-${waitingDash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        <div className="donut-center-label">
          <span className="donut-center-sub">Total Hari Ini</span>
          <span className="donut-center-value">17.6M</span>
        </div>
      </div>

      <div className="donut-legend">
        <div className="donut-legend-item">
          <div className="donut-legend-left">
            <div className="donut-legend-dot" style={{ background: "var(--color-primary)" }} />
            Terverifikasi
          </div>
          <span className="donut-legend-value">Rp 15.500.000</span>
        </div>
        <div className="donut-legend-item">
          <div className="donut-legend-left">
            <div className="donut-legend-dot" style={{ background: "var(--color-accent)" }} />
            Menunggu Konfirmasi
          </div>
          <span className="donut-legend-value">Rp 2.100.000</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Main Dashboard Page                                                 */
/* ================================================================== */
export default function OwnerDashboardPage() {
  return (
    <>
      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan aktivitas operasional hari ini.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" id="btn-ekspor-laporan">
            <IconExport />
            Ekspor Laporan
          </button>
          <button className="btn btn-accent" id="btn-tambah-siswa">
            <IconPlus />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────── */}
      <div className="stat-grid">
        {/* Siswa Aktif */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Siswa Aktif</span>
            <div className="stat-card-icon" style={{ background: "#dbeafe" }}>
              <IconUsers size={18} />
            </div>
          </div>
          <div className="stat-card-value">124</div>
          <div className="stat-card-trend trend-up">
            <IconTrendUp />
            5% bulan ini
          </div>
        </div>

        {/* Pendapatan */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Pendapatan (Bln)</span>
            <div className="stat-card-icon" style={{ background: "#fef3c7" }}>
              <IconMoney size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 20 }}>85.000.000</div>
          <div className="stat-card-trend trend-up">
            <IconTrendUp />
            12% bulan ini
          </div>
        </div>

        {/* Guru & Staff */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Guru & Staff</span>
            <div className="stat-card-icon" style={{ background: "#d1fae5" }}>
              <IconStaff size={18} />
            </div>
          </div>
          <div className="stat-card-value">28</div>
          <div className="stat-card-trend trend-up">
            <IconTrendUp />
            2 orang baru
          </div>
        </div>

        {/* Kehadiran */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Kehadiran</span>
            <div className="stat-card-icon" style={{ background: "#fee2e2" }}>
              <IconChart size={18} />
            </div>
          </div>
          <div className="stat-card-value">92%</div>
          <div className="stat-card-trend trend-down">
            <IconTrendDown />
            1% dr kemarin
          </div>
        </div>
      </div>

      {/* ── ROW 2: CHART + ACTION ITEMS ────────────────────────────── */}
      <div className="grid-3-2">
        {/* Pendapatan vs Pengeluaran */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pendapatan vs Pengeluaran</h2>
          </div>
          <div className="card-body">
            <BarChart />
          </div>
        </div>

        {/* Perlu Ditindaklanjuti */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Perlu Ditindaklanjuti</h2>
            <button className="more-btn" id="btn-action-more" aria-label="Lebih banyak">
              <IconMore />
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {/* Tagihan Overdue */}
            <div className="action-item">
              <div className="action-icon" style={{ background: "var(--color-danger-bg)" }}>
                <IconAlert size={18} />
              </div>
              <div className="action-content">
                <div className="action-title">Tagihan Overdue</div>
                <div className="action-desc">Rp 12.000.000 (3 Siswa)</div>
                <span className="action-link" id="link-lihat-detail">Lihat Detail</span>
              </div>
            </div>

            {/* Verifikasi Siswa Baru */}
            <div className="action-item">
              <div className="action-icon" style={{ background: "var(--color-warning-bg)" }}>
                <IconUser2 size={18} />
              </div>
              <div className="action-content">
                <div className="action-title">Verifikasi Siswa Baru</div>
                <div className="action-desc">2 Pendaftaran menunggu persetujuan</div>
                <span className="action-link" id="link-verifikasi">Verifikasi Sekarang</span>
              </div>
            </div>

            {/* Logbook Kelas Kosong */}
            <div className="action-item">
              <div className="action-icon" style={{ background: "var(--color-info-bg)" }}>
                <IconBook size={18} />
              </div>
              <div className="action-content">
                <div className="action-title">Logbook Kelas Kosong</div>
                <div className="action-desc">Kelas Coding Lanjutan (Kemarin)</div>
                <span className="action-link" id="link-ingatkan-guru">Ingatkan Guru</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: HONOR + REKONSILIASI ────────────────────────────── */}
      <div className="grid-2">
        {/* Honor Guru Bulan Ini */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Honor Guru Bulan Ini</h2>
            <button className="link-text" id="btn-lihat-semua-honor" style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
              Lihat Semua
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {/* Total Estimasi */}
            <div className="honor-summary-box">
              <div className="honor-summary-icon">
                <IconHonor size={20} />
              </div>
              <div>
                <div className="honor-summary-label">Total Estimasi Honor</div>
                <div className="honor-summary-value">Rp 45.200.000</div>
              </div>
            </div>

            {/* Honor List */}
            <div className="honor-list">
              {[
                { initial: "S", name: "Ms. Sarah", hours: "42 Jam Mengajar", amount: "Rp 6.300.000", status: "Terverifikasi", color: "#1a5c8a" },
                { initial: "A", name: "Mr. Andi", hours: "38 Jam Mengajar", amount: "Rp 5.700.000", status: "Terverifikasi", color: "#10b981" },
                { initial: "N", name: "Ms. Nina", hours: "45 Jam Mengajar", amount: "Rp 6.750.000", status: "Menunggu", color: "#f59e0b" },
              ].map((guru) => (
                <div key={guru.name} className="honor-row">
                  <div className="honor-avatar" style={{ background: guru.color }}>
                    {guru.initial}
                  </div>
                  <div className="honor-info">
                    <div className="honor-name">{guru.name}</div>
                    <div className="honor-hours">{guru.hours}</div>
                  </div>
                  <div className="honor-right">
                    <span
                      className={`badge ${guru.status === "Terverifikasi" ? "badge-success" : "badge-warning"}`}
                    >
                      {guru.status}
                    </span>
                    <span className="honor-amount">{guru.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rekonsiliasi Cash */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Rekonsiliasi Cash</h2>
            <button className="more-btn" id="btn-rekonsiliasi-more" aria-label="Rekonsiliasi options">
              <IconMore />
            </button>
          </div>
          <div className="card-body">
            <DonutChart />
          </div>
        </div>
      </div>

      {/* ── ROW 4: DISTRIBUSI SISWA + JADWAL KELAS ─────────────────── */}
      <div className="grid-2">
        {/* Distribusi Siswa per Program */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Distribusi Siswa per Program</h2>
          </div>
          <div className="card-body">
            <div className="progress-list">
              {[
                { label: "Calistung", value: 45, total: 124, color: "var(--color-primary)" },
                { label: "Phonics", value: 32, total: 124, color: "#3b82f6" },
                { label: "English", value: 28, total: 124, color: "#06b6d4" },
                { label: "Mathematics", value: 19, total: 124, color: "var(--color-accent)" },
              ].map((prog) => (
                <div key={prog.label} className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-label">{prog.label}</span>
                    <span className="progress-item-value">{prog.value} Siswa</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(prog.value / prog.total) * 100}%`,
                        background: prog.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Jadwal & Kapasitas Kelas Hari Ini */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Jadwal & Kapasitas Kelas Hari Ini</h2>
            <button className="link-text" id="btn-lihat-jadwal" style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
              Lihat Jadwal Lengkap
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0, overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Kelas</th>
                  <th>Guru</th>
                  <th>Waktu</th>
                  <th>Kapasitas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { kelas: "Calistung Level 1", guru: "Ms. Sarah", waktu: "14:00 - 15:30", kapasitas: "5/7", status: "Normal" },
                  { kelas: "English B1", guru: "Mr. Andi", waktu: "15:00 - 16:30", kapasitas: "6/7", status: "Hampir Penuh" },
                  { kelas: "Math Advance", guru: "Ms. Nina", waktu: "16:00 - 17:30", kapasitas: "7/7", status: "Penuh" },
                  { kelas: "Phonics Starter", guru: "Ms. Sarah", waktu: "16:00 - 17:00", kapasitas: "3/7", status: "Normal" },
                ].map((row) => (
                  <tr key={row.kelas}>
                    <td style={{ fontWeight: 600 }}>{row.kelas}</td>
                    <td>{row.guru}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{row.waktu}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: row.kapasitas === "7/7" ? "var(--color-danger)" : row.kapasitas === "6/7" ? "var(--color-warning)" : "var(--color-success)",
                        }}
                      >
                        {row.kapasitas}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          row.status === "Penuh"
                            ? "badge-danger"
                            : row.status === "Hampir Penuh"
                            ? "badge-warning"
                            : "badge-neutral"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ROW 5: PENGUMUMAN + AKTIVITAS TERBARU ──────────────────── */}
      <div className="grid-2">
        {/* Pengumuman Terbaru */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pengumuman Terbaru</h2>
            <button className="btn btn-primary btn-sm" id="btn-buat-pengumuman">
              Buat
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div className="announcement-list">
              {[
                {
                  title: "Libur Nasional Idul Fitri",
                  desc: "Informasi penutupan sementara kelas selama libur Idul Fitri.",
                  meta: "Dipublikasikan: 2 Hari yang lalu",
                  status: "PUBLISHED",
                },
                {
                  title: "Promo Pendaftaran Siswa Baru Mei",
                  desc: "Draft promosi pendaftaran awal bulan depan.",
                  meta: "Diedit: Kemarin",
                  status: "DRAFT",
                },
                {
                  title: "Panduan Akses Portal Orang Tua",
                  desc: "Instruksi login ke portal siswa baru.",
                  meta: "Dipublikasikan: 1 Minggu yang lalu",
                  status: "PUBLISHED",
                },
              ].map((ann) => (
                <div key={ann.title} className="announcement-item">
                  <div className="announcement-header">
                    <span className="announcement-title">{ann.title}</span>
                    <span
                      className={`badge ${ann.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}`}
                      style={{ fontSize: 10 }}
                    >
                      {ann.status}
                    </span>
                  </div>
                  <div className="announcement-desc">{ann.desc}</div>
                  <div className="announcement-meta">{ann.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Aktivitas Terbaru</h2>
            <button className="more-btn" id="btn-refresh-aktivitas" aria-label="Refresh aktivitas">
              <IconRefresh size={16} />
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div className="activity-list">
              {[
                {
                  icon: "users",
                  color: "#dbeafe",
                  iconColor: "var(--color-info)",
                  title: "Siswa Baru",
                  desc: "Admin menambahkan siswa baru ke kelas Calistung.",
                  time: "10:42 AM",
                },
                {
                  icon: "money",
                  color: "#d1fae5",
                  iconColor: "var(--color-success)",
                  title: "Pembayaran SPP",
                  desc: "Orang tua Budi melakukan konfirmasi pembayaran.",
                  time: "09:15 AM",
                },
                {
                  icon: "book",
                  color: "#f3f4f6",
                  iconColor: "var(--color-text-muted)",
                  title: "Logbook Kelas",
                  desc: "Ms. Sarah mengisi logbook kelas Phonics Starter.",
                  time: "Kemarin, 17:30",
                },
              ].map((act) => (
                <div key={act.title + act.time} className="activity-item">
                  <div className="activity-icon" style={{ background: act.color, color: act.iconColor }}>
                    {act.icon === "users" && <IconUsers size={16} />}
                    {act.icon === "money" && <IconMoney size={16} />}
                    {act.icon === "book" && <IconBook size={16} />}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{act.title}</div>
                    <div className="activity-desc">{act.desc}</div>
                  </div>
                  <div className="activity-time">{act.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
