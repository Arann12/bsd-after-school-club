"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  resolveMediaUrl,
  type BackendAnnouncement,
} from "@/lib/api/operational";
import Toast, { useToast } from "@/components/ui/Toast";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";

type Peran = "owner" | "admin" | "guru" | "orang-tua";
type StatusPengumuman = "Aktif" | "Draft" | "Selesai";

interface PengumumanView {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  target: string[];
  status: StatusPengumuman;
  dibuat: string;
  penting: boolean;
  sudahDibaca?: boolean;
  poster_url?: string | null;
  rawStatus: string;
  expires_at?: string | null;
  isExpired?: boolean;
}

const warnaTarget: Record<string, { bg: string; color: string }> = {
  "Guru":             { bg: "#ede9fe", color: "#6d28d9" },
  "Orang Tua":        { bg: "#e0f2fe", color: "#0369a1" },
  "Siswa":            { bg: "#fef3c7", color: "#b45309" },
  "Semua":            { bg: "#f1f5f9", color: "#475569" },
  "Kelas Tertentu":   { bg: "#fef3c7", color: "#b45309" },
  "Program Tertentu": { bg: "#d1fae5", color: "#059669" },
};

interface Props {
  peran?: Peran;
}

export default function PengumumanPage({ peran = "admin" }: Props) {
  const bisaKelola = peran === "admin" || peran === "owner";
  const { toast, showToast } = useToast();

  const [daftar, setDaftar] = useState<PengumumanView[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dipilih, setDipilih] = useState<PengumumanView | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");

  // Form states
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [target, setTarget] = useState<string[]>(["Guru", "Orang Tua"]);
  const [penting, setPenting] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState("");

  const formatTanggal = (dateStr?: string | null) => {
    if (!dateStr) return "–";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const mapTargetRoleToLabel = (role: string): string => {
    switch (role.toLowerCase()) {
      case "teacher": return "Guru";
      case "parent":  return "Orang Tua";
      case "student": return "Siswa";
      case "admin":   return "Admin";
      case "owner":   return "Owner";
      case "all":     return "Semua";
      default:        return role;
    }
  };

  const mapLabelToTargetRole = (label: string): string => {
    switch (label) {
      case "Guru":      return "teacher";
      case "Orang Tua": return "parent";
      case "Siswa":     return "student";
      case "Admin":     return "admin";
      case "Owner":     return "owner";
      case "Semua":     return "all";
      default:          return "all";
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { per_page: 50 };
      if (search.trim()) params.search = search.trim();

      const response = await getAnnouncements(params);
      const rawList: BackendAnnouncement[] = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const now = Date.now();
      const formatted: PengumumanView[] = rawList.map((item) => {
        let targetsLabel: string[] = [];
        if (item.targets && item.targets.length > 0) {
          targetsLabel = Array.from(new Set(item.targets.map((t) => mapTargetRoleToLabel(t.target_role))));
        } else {
          targetsLabel = ["Semua"];
        }

        const isPublished = item.status === "published";
        const isDraft = item.status === "draft";
        const isExpired = item.expires_at ? new Date(item.expires_at).getTime() < now : false;

        return {
          id: item.id,
          judul: item.title,
          isi: item.description,
          tanggal: formatTanggal(item.published_at || item.created_at),
          target: targetsLabel,
          status: isExpired ? "Selesai" : isPublished ? "Aktif" : isDraft ? "Draft" : "Selesai",
          dibuat: item.author?.name || (item.author?.role === "owner" ? "Owner" : "Admin"),
          penting: item.title.toLowerCase().includes("penting") || item.description.toLowerCase().includes("penting"),
          poster_url: resolveMediaUrl(item.poster_url),
          rawStatus: item.status,
          expires_at: item.expires_at,
          isExpired,
        };
      });

      setDaftar(formatted);
    } catch (err: any) {
      console.error("Gagal memuat pengumuman dari API:", err);
      showToast("Gagal memuat daftar pengumuman dari server.");
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Otomatis buka detail pengumuman bila dibuka dari link notifikasi (?id=...)
  useEffect(() => {
    if (typeof window !== "undefined" && daftar.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("id");
      if (queryId) {
        const found = daftar.find((d) => d.id === queryId);
        if (found) {
          setDipilih(found);
          tandaiDibaca(found.id);
          try {
            window.history.replaceState({}, "", window.location.pathname);
          } catch {
            // ignore
          }
        }
      }
    }
  }, [daftar]);

  const terfilter = daftar.filter((p) => {
    if (filterStatus === "Semua") return true;
    return p.status === filterStatus;
  });

  const tandaiDibaca = (id: string) => {
    setDaftar((prev) => prev.map((p) => (p.id === id ? { ...p, sudahDibaca: true } : p)));
  };

  const handleBuatPengumuman = async (langsung: boolean) => {
    if (!judul.trim() || !isi.trim() || target.length === 0) return;

    try {
      setSubmitting(true);
      const targetRoles = target.map(mapLabelToTargetRole);

      await createAnnouncement({
        title: judul.trim(),
        description: isi.trim(),
        status: langsung ? "published" : "draft",
        target_roles: targetRoles,
        poster: posterFile,
        expires_at: expiresAt ? expiresAt : null,
      });

      showToast(langsung ? "Pengumuman berhasil dipublikasikan!" : "Draft pengumuman berhasil disimpan.");
      setShowForm(false);
      setJudul("");
      setIsi("");
      setPenting(false);
      setPosterFile(null);
      setExpiresAt("");
      setTarget(["Guru", "Orang Tua"]);
      await loadData();
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      showToast(err?.response?.data?.message || "Gagal membuat pengumuman.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapusPengumuman = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;

    try {
      await deleteAnnouncement(id);
      showToast("Pengumuman berhasil dihapus.");
      setDaftar((prev) => prev.filter((p) => p.id !== id));
      setDipilih(null);
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      showToast(err?.response?.data?.message || "Gagal menghapus pengumuman.");
    }
  };

  const belumDibaca = daftar.filter((p) => !p.sudahDibaca && p.status === "Aktif").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .kartu-pengumuman:hover{box-shadow:0 4px 16px rgba(0,0,0,.09)!important;transform:translateY(-1px)}
        .kartu-pengumuman{transition:all .2s ease;cursor:pointer}

        .pengumuman-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .pengumuman-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pengumuman-filter-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pengumuman-filter-chips::-webkit-scrollbar {
          display: none;
        }
        .pengumuman-filter-chips .filter-chip {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .pengumuman-search-wrap {
          position: relative;
          min-width: 260px;
        }

        .pengumuman-card-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .pengumuman-poster-thumb {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--color-border-light);
          background: var(--color-bg);
        }

        .pengumuman-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeIn .2s ease-out;
        }

        .pengumuman-modal-card {
          background: #fff;
          border-radius: 18px;
          max-width: 560px;
          width: 100%;
          padding: 26px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
          animation: modalIn .25s cubic-bezier(0.16,1,0.3,1);
          max-height: 90vh;
          overflow-y: auto;
        }

        .pengumuman-modal-actions {
          display: grid;
          gap: 10px;
        }

        .pengumuman-form-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 4px;
        }

        /* ─── Mobile Responsiveness (≤ 640px) ─── */
        @media (max-width: 640px) {
          .page-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .page-header-actions {
            width: 100% !important;
          }
          .page-header-actions .btn {
            width: 100% !important;
            justify-content: center !important;
          }

          .pengumuman-stat-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .pengumuman-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }

          .pengumuman-search-wrap {
            width: 100% !important;
            min-width: 100% !important;
          }

          .kartu-pengumuman {
            padding: 16px 14px !important;
          }

          .pengumuman-card-inner {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .pengumuman-poster-thumb {
            width: 100% !important;
            height: 160px !important;
            border-radius: 10px !important;
            order: 2 !important;
          }

          .pengumuman-card-chevron {
            display: none !important;
          }

          .pengumuman-modal-overlay {
            padding: 8px !important;
            align-items: flex-end !important;
          }

          .pengumuman-modal-card {
            padding: 20px 16px !important;
            border-radius: 18px 18px 12px 12px !important;
            max-height: 88vh !important;
          }

          .pengumuman-modal-actions {
            display: flex !important;
            flex-direction: column-reverse !important;
            gap: 8px !important;
          }
          .pengumuman-modal-actions .btn {
            width: 100% !important;
            justify-content: center !important;
          }

          .pengumuman-form-actions {
            display: flex !important;
            flex-direction: column-reverse !important;
            gap: 8px !important;
          }
          .pengumuman-form-actions .btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
          }
        }
      `}</style>

      <Toast toast={toast} />

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengumuman</h1>
          <p className="page-subtitle">
            {bisaKelola ? "Kelola dan publikasikan pengumuman kepada guru dan orang tua secara terpusat." : "Informasi dan pengumuman resmi dari sekolah."}
          </p>
        </div>
        {bisaKelola && (
          <div className="page-header-actions">
            <button className="btn btn-accent" onClick={() => setShowForm(true)}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Buat Pengumuman
            </button>
          </div>
        )}
      </div>

      {/* Banner Belum Dibaca (Guru / Orang Tua) */}
      {!bisaKelola && belumDibaca > 0 && (
        <div style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, animation: "slideIn .3s ease" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{belumDibaca} pengumuman baru belum dibaca</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", marginTop: 2 }}>Klik pengumuman di bawah untuk membaca rinciannya.</div>
          </div>
        </div>
      )}

      {/* Statistik (Hanya Admin / Owner) */}
      {bisaKelola && (
        <div className="pengumuman-stat-grid">
          {[
            { label: "Total Pengumuman", value: daftar.length, warna: "#1d4ed8", bg: "#dbeafe" },
            { label: "Aktif / Dipublikasi", value: daftar.filter((p) => p.status === "Aktif").length, warna: "#059669", bg: "#d1fae5" },
            { label: "Draft", value: daftar.filter((p) => p.status === "Draft").length, warna: "#b45309", bg: "#fef3c7" },
          ].map((k) => (
            <div key={k.label} className="stat-card" style={{ gap: 8 }}>
              <span className="stat-card-label">{k.label}</span>
              <div className="stat-card-value" style={{ fontSize: 28, color: k.warna }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tab & Live Search */}
      <div className="pengumuman-filter-bar">
        {bisaKelola && (
          <div className="pengumuman-filter-chips">
            {["Semua", "Aktif", "Draft", "Selesai"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`filter-chip${filterStatus === f ? " active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div className="pengumuman-search-wrap" style={{ flex: bisaKelola ? undefined : 1 }}>
          <input
            className="search-input"
            style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Cari judul atau isi pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <SkeletonCardGrid count={4} />
      ) : (
        /* Daftar Pengumuman */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {terfilter.map((p) => (
            <div
              key={p.id}
              className="kartu-pengumuman card"
              style={{
                padding: "20px 24px",
                borderLeft: p.penting ? "4px solid var(--color-accent)" : "4px solid transparent",
                opacity: p.status === "Draft" ? 0.75 : 1,
              }}
              onClick={() => {
                setDipilih(p);
                tandaiDibaca(p.id);
              }}
            >
              <div className="pengumuman-card-inner">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    {p.penting && (
                      <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                        Penting
                      </span>
                    )}
                    {!p.sudahDibaca && p.status === "Aktif" && !bisaKelola && (
                      <span style={{ background: "var(--color-primary)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        • Baru
                      </span>
                    )}
                    {p.status === "Draft" && (
                      <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        DRAFT
                      </span>
                    )}
                    {p.isExpired && (
                      <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        Kedaluwarsa
                      </span>
                    )}
                    {p.status === "Aktif" && p.expires_at && !p.isExpired && (
                      <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        Berlaku s/d {formatTanggal(p.expires_at)}
                      </span>
                    )}
                    {p.poster_url && (
                      <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        Ada Poster
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 6px", wordBreak: "break-word" }}>{p.judul}</h3>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.isi}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.tanggal}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>•</span>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Oleh: {p.dibuat}</span>
                    {p.target.map((t) => (
                      <span key={t} style={{ ...(warnaTarget[t] || warnaTarget["Semua"]), fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {p.poster_url && (
                  <div className="pengumuman-poster-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.poster_url} alt={p.judul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <svg className="pengumuman-card-chevron" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}

          {terfilter.length === 0 && (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum ada pengumuman</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>Pengumuman yang dipublikasikan dari backend akan muncul di sini.</div>
              {bisaKelola && <button className="btn btn-accent" onClick={() => setShowForm(true)}>+ Buat Pengumuman</button>}
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Pengumuman */}
      {dipilih && !showForm && (
        <div className="pengumuman-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDipilih(null); }}>
          <div className="pengumuman-modal-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {dipilih.penting && <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, marginBottom: 8, display: "inline-block" }}>PENTING</span>}
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.3, wordBreak: "break-word" }}>{dipilih.judul}</h2>
              </div>
              <button onClick={() => setDipilih(null)} className="modal-close" style={{ flexShrink: 0 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{dipilih.tanggal} · {dipilih.dibuat}</span>
              {dipilih.target.map((t) => (
                <span key={t} style={{ ...(warnaTarget[t] || warnaTarget["Semua"]), fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{t}</span>
              ))}
              <span style={{ background: dipilih.status === "Aktif" ? "#d1fae5" : dipilih.status === "Draft" ? "#fef3c7" : "#f1f5f9", color: dipilih.status === "Aktif" ? "#059669" : dipilih.status === "Draft" ? "#b45309" : "#64748b", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                {dipilih.status}
              </span>
              {dipilih.expires_at && (
                <span style={{ background: dipilih.isExpired ? "#f1f5f9" : "#fef3c7", color: dipilih.isExpired ? "#64748b" : "#92400e", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                  {dipilih.isExpired ? "Kedaluwarsa: " : "Berlaku s/d "} {formatTanggal(dipilih.expires_at)}
                </span>
              )}
            </div>

            {dipilih.poster_url && (
              <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)", background: "#0f172a", textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dipilih.poster_url} alt={dipilih.judul} style={{ width: "100%", maxHeight: 460, objectFit: "contain", display: "block", margin: "0 auto" }} />
              </div>
            )}

            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", lineHeight: 1.7, fontSize: 13.5, color: "var(--color-text-secondary)", marginBottom: 20, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {dipilih.isi}
            </div>

            <div className="pengumuman-modal-actions" style={{ gridTemplateColumns: bisaKelola ? "1fr 1fr" : "1fr" }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>
                {bisaKelola ? "Tutup" : "Kembali"}
              </button>
              {bisaKelola && (
                <button className="btn btn-ghost" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={() => handleHapusPengumuman(dipilih.id)}>
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Buat Pengumuman */}
      {showForm && bisaKelola && (
        <div className="pengumuman-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="pengumuman-modal-card" style={{ maxWidth: 540 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Buat Pengumuman Baru</h2>
              <button onClick={() => setShowForm(false)} className="modal-close">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Judul Pengumuman</label>
                <input className="form-input" placeholder="Contoh: Libur Nasional — Tidak Ada Kelas" value={judul} onChange={(e) => setJudul(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Isi Pengumuman</label>
                <textarea
                  className="form-input"
                  placeholder="Tulis detail pengumuman di sini..."
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  style={{ minHeight: 130, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Upload Poster Opsional */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Poster / Gambar (Opsional)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="form-input"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Batas Tanggal Tayang */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Masa Berlaku (Opsional)</span>
                  <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", fontWeight: 400 }}>Batas pop-up login</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 4, display: "block" }}>
                  Setelah tanggal ini, pengumuman tidak akan muncul lagi di pop-up login.
                </span>
              </div>

              {/* Target Penerima */}
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Target Penerima Pengumuman</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Semua", "Guru", "Orang Tua", "Siswa"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (t === "Semua") {
                          setTarget(["Semua"]);
                          return;
                        }
                        setTarget((prev) => {
                          const tanpaSemua = prev.filter((x) => x !== "Semua");
                          return tanpaSemua.includes(t) ? tanpaSemua.filter((x) => x !== t) : [...tanpaSemua, t];
                        });
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "var(--radius-full)",
                        border: "2px solid",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all .15s",
                        background: target.includes(t) ? (warnaTarget[t]?.bg || "#f1f5f9") : "white",
                        color: target.includes(t) ? (warnaTarget[t]?.color || "#475569") : "var(--color-text-muted)",
                        borderColor: target.includes(t) ? (warnaTarget[t]?.color || "#94a3b8") : "var(--color-border)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {(!judul.trim() || !isi.trim() || target.length === 0) && (
                <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#92400e" }}>
                  Judul, isi, dan target penerima wajib diisi.
                </div>
              )}

              <div className="pengumuman-form-actions">
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
                <button
                  className="btn btn-outline"
                  disabled={!judul.trim() || !isi.trim() || target.length === 0 || submitting}
                  onClick={() => handleBuatPengumuman(false)}
                  style={{ opacity: !judul.trim() || !isi.trim() || target.length === 0 || submitting ? 0.5 : 1 }}
                >
                  {submitting ? "Menyimpan..." : "Simpan Draft"}
                </button>
                <button
                  className="btn btn-accent"
                  disabled={!judul.trim() || !isi.trim() || target.length === 0 || submitting}
                  onClick={() => handleBuatPengumuman(true)}
                  style={{ opacity: !judul.trim() || !isi.trim() || target.length === 0 || submitting ? 0.5 : 1 }}
                >
                  {submitting ? "Memproses..." : "Publikasikan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
