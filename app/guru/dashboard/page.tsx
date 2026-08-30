"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ================================================================== */
/* Inline SVG Icons (Zero Dependency)                                 */
/* ================================================================== */
function IconCalendar({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconUsers({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconClock({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconAlertTriangle({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconArrowUpRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function IconMoreHorizontal({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function IconBookEdit({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  );
}

function IconUserCheck({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

function IconMegaphone({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ================================================================== */
/* Teacher Dashboard Page Component                                   */
/* ================================================================== */
export default function GuruDashboardPage() {
  // Modal State for Logbook Entry
  const [selectedClassForLogbook, setSelectedClassForLogbook] = useState<string | null>(null);
  const [logbookNotes, setLogbookNotes] = useState("");
  const [logbookTopic, setLogbookTopic] = useState("");
  const [logbookSubmitted, setLogbookSubmitted] = useState<Record<string, boolean>>({});
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const handleOpenLogbook = (className: string) => {
    setSelectedClassForLogbook(className);
    setLogbookTopic(className.includes("Phonics") ? "Phonics Sound Blending & Digraphs (sh, ch, th)" : "Pengenalan Angka & Berhitung 1-20");
    setLogbookNotes("");
  };

  const handleSaveLogbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassForLogbook) {
      setLogbookSubmitted((prev) => ({ ...prev, [selectedClassForLogbook]: true }));
      setSelectedClassForLogbook(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", paddingBottom: "var(--space-8)" }}>
      {/* ============================================================
          TOP STATS (4 Cards)
          ============================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {/* Card 1: Kelas Hari Ini */}
        <div
          className="stat-card"
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconCalendar size={22} color="#0284c7" />
            </div>
            <Link
              href="/guru/jadwal"
              style={{
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
              title="Lihat Jadwal"
            >
              <IconArrowUpRight size={18} />
            </Link>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            Kelas Hari Ini
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
              3
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
              Sesi
            </span>
          </div>
        </div>

        {/* Card 2: Total Siswa Diampu */}
        <div
          className="stat-card"
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconUsers size={22} color="#0284c7" />
            </div>
            <Link
              href="/guru/siswa"
              style={{
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
              title="Lihat Siswa"
            >
              <IconArrowUpRight size={18} />
            </Link>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            Total Siswa Diampu
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
              42
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
              Anak
            </span>
          </div>
        </div>

        {/* Card 3: Jam Mengajar Minggu Ini */}
        <div
          className="stat-card"
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconClock size={22} color="#0284c7" />
            </div>
            <Link
              href="/guru/jadwal"
              style={{
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
              title="Lihat Jadwal"
            >
              <IconArrowUpRight size={18} />
            </Link>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            Jam Mengajar Minggu Ini
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
              14
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
              Jam
            </span>
          </div>
        </div>

        {/* Card 4: Logbook Belum Diisi */}
        <div
          className="stat-card"
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconAlertTriangle size={22} color="#ef4444" />
            </div>
            <Link
              href="/guru/logbook"
              style={{
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
              title="Lihat Logbook"
            >
              <IconArrowUpRight size={18} />
            </Link>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>
            Logbook Belum Diisi
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>
              {logbookSubmitted["Phonics Level 2 - Kelas A"] ? "0" : "1"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MIDDLE SECTION (Jadwal Mengajar + Perlu Ditindaklanjuti)
          ============================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.15fr",
          gap: "var(--space-5)",
        }}
        className="middle-grid"
      >
        {/* Left Column: Jadwal Mengajar Hari Ini */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-border-light)",
            }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              Jadwal Mengajar Hari Ini
            </h2>
            <Link
              href="/guru/jadwal"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-primary-light)",
                textDecoration: "none",
              }}
            >
              Lihat Semua
            </Link>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 600, borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "12px 20px" }}>Jam</th>
                  <th style={{ padding: "12px 16px" }}>Nama Kelas & Program</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Ruangan</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Hadir</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "12px 20px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Phonics Level 2 - Kelas A */}
                <tr style={{ borderBottom: "1px solid var(--color-border-light)", transition: "background 0.15s" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                    14:00 - 15:30
                  </td>
                  <td style={{ padding: "16px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 4,
                          height: 24,
                          borderRadius: 2,
                          background: "#1a5c8a",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                        Phonics Level 2 - Kelas A
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 14px", textAlign: "center", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                    101
                  </td>
                  <td style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    6/7
                  </td>
                  <td style={{ padding: "16px 16px", textAlign: "center" }}>
                    {logbookSubmitted["Phonics Level 2 - Kelas A"] ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#d1fae5",
                          color: "#059669",
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />
                        Logbook Terisi
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#fee2e2",
                          color: "#dc2626",
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />
                        Logbook Kosong
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => handleOpenLogbook("Phonics Level 2 - Kelas A")}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12.5,
                        fontWeight: 600,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-primary-light)",
                        background: "#ffffff",
                        color: "var(--color-primary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "var(--shadow-sm)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--color-primary)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.color = "var(--color-primary)";
                      }}
                    >
                      {logbookSubmitted["Phonics Level 2 - Kelas A"] ? "Edit Logbook" : "Isi Logbook"}
                    </button>
                  </td>
                </tr>

                {/* Row 2: Calistung Dasar - Kelas B */}
                <tr style={{ transition: "background 0.15s" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                    16:00 - 17:30
                  </td>
                  <td style={{ padding: "16px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 4,
                          height: 24,
                          borderRadius: 2,
                          background: "#f59e0b",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                        Calistung Dasar - Kelas B
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 14px", textAlign: "center", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                    102
                  </td>
                  <td style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    8/8
                  </td>
                  <td style={{ padding: "16px 16px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#f1f5f9",
                        color: "#64748b",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b" }} />
                      Menunggu Waktu
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => handleOpenLogbook("Calistung Dasar - Kelas B")}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12.5,
                        fontWeight: 600,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                        background: "#f8fafc",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      Isi Logbook
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Perlu Ditindaklanjuti */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              Perlu Ditindaklanjuti
            </h2>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: 4,
                borderRadius: "var(--radius-sm)",
              }}
              title="Opsi Lainnya"
            >
              <IconMoreHorizontal size={20} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Item 1: Logbook Phonics A */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "#fdf8f8",
                border: "1px solid #fee2e2",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconBookEdit size={18} color="#ef4444" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                  Logbook Phonics A Kemarin belum diisi
                </div>
                <button
                  onClick={() => handleOpenLogbook("Phonics Level 2 - Kelas A (Kemarin)")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#ef4444",
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginTop: 2,
                    display: "inline-block",
                  }}
                >
                  Segera selesaikan
                </button>
              </div>
            </div>

            {/* Item 2: Assessment */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "#fffbeb",
                border: "1px solid #fef3c7",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconUserCheck size={18} color="#d97706" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                  2 Siswa Perlu Assessment
                </div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Kelas Calistung Dasar
                </div>
              </div>
            </div>

            {/* Item 3: Pengumuman */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "#f0f9ff",
                border: "1px solid #e0f2fe",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconMegaphone size={18} color="#0284c7" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                  1 Pengumuman Baru
                </div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Dari Kepala Akademik
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BOTTOM SECTION (Progress Kehadiran Kelas Saya)
          ============================================================ */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          padding: "22px 26px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
            Progress Kehadiran Kelas Saya
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12, fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a5c8a" }} />
              <span style={{ color: "var(--color-text-secondary)" }}>&gt; 90%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ color: "var(--color-text-secondary)" }}>&lt; 90%</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Progress 1: Phonics Level 2 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "var(--color-text-primary)" }}>Phonics Level 2 - Kelas A</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>95%</span>
            </div>
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: "95%",
                  height: "100%",
                  background: "#1a5c8a",
                  borderRadius: 999,
                  transition: "width 0.8s ease-in-out",
                }}
              />
            </div>
          </div>

          {/* Progress 2: Calistung Dasar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "var(--color-text-primary)" }}>Calistung Dasar - Kelas B</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>88%</span>
            </div>
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: "88%",
                  height: "100%",
                  background: "#f59e0b",
                  borderRadius: 999,
                  transition: "width 0.8s ease-in-out",
                }}
              />
            </div>
          </div>

          {/* Progress 3: Mathematics */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "var(--color-text-primary)" }}>Mathematics - Kelas C</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>91%</span>
            </div>
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: "91%",
                  height: "100%",
                  background: "#1a5c8a",
                  borderRadius: 999,
                  transition: "width 0.8s ease-in-out",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MODAL: ISI LOGBOOK MENGAJAR
          ============================================================ */}
      {selectedClassForLogbook && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
          onClick={() => setSelectedClassForLogbook(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "var(--radius-xl)",
              width: "100%",
              maxWidth: 520,
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border)",
              overflow: "hidden",
              animation: "modalFadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid var(--color-border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
                  Pengisian Logbook Mengajar
                </h3>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "3px 0 0" }}>
                  {selectedClassForLogbook}
                </p>
              </div>
              <button
                onClick={() => setSelectedClassForLogbook(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <IconClose size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLogbook} style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Materi & Topik Pembelajaran
                </label>
                <input
                  type="text"
                  required
                  value={logbookTopic}
                  onChange={(e) => setLogbookTopic(e.target.value)}
                  placeholder="Contoh: Phonics Digraphs (sh, ch, th)"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  Catatan Evaluasi / Catatan Siswa
                </label>
                <textarea
                  rows={4}
                  required
                  value={logbookNotes}
                  onChange={(e) => setLogbookNotes(e.target.value)}
                  placeholder="Tuliskan perkembangan siswa, respon materi, atau tugas rumah..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13.5,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setSelectedClassForLogbook(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "#ffffff",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 20px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <IconCheck size={16} />
                  Simpan Logbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
