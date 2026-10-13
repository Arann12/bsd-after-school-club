"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getAnnouncements, resolveMediaUrl, type BackendAnnouncement } from "@/lib/api/operational";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";

interface PengumumanView {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string;
  ringkasan: string;
  isFlyer: boolean;
  posterUrl?: string | null;
  detail: string;
  penting: boolean;
  expires_at?: string | null;
}

const kategoriColor: Record<string, { bg: string; color: string }> = {
  "PENTING":  { bg: "#fee2e2", color: "#dc2626" },
  "KEUANGAN": { bg: "#fef3c7", color: "#b45309" },
  "PROGRAM":  { bg: "#d1fae5", color: "#059669" },
  "UMUM":     { bg: "#e0f2fe", color: "#0369a1" },
};

export default function OrangTuaPengumumanPage() {
  const [daftar, setDaftar] = useState<PengumumanView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PengumumanView | null>(null);
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [search, setSearch] = useState("");

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements({ status: "published", per_page: 30 });
      const rawList: BackendAnnouncement[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const items: PengumumanView[] = rawList.map((item) => {
        const isImportant =
          item.title.toLowerCase().includes("penting") ||
          item.title.toLowerCase().includes("urgent") ||
          item.description.toLowerCase().includes("penting");

        const isFinance =
          item.title.toLowerCase().includes("spp") ||
          item.title.toLowerCase().includes("tagihan") ||
          item.title.toLowerCase().includes("bayar") ||
          item.title.toLowerCase().includes("keuangan");

        const isProgram =
          item.title.toLowerCase().includes("program") ||
          item.title.toLowerCase().includes("kelas baru") ||
          item.title.toLowerCase().includes("kurikulum");

        const category = isImportant ? "PENTING" : isFinance ? "KEUANGAN" : isProgram ? "PROGRAM" : "UMUM";

        return {
          id: item.id,
          judul: item.title,
          kategori: category,
          tanggal: formatTanggal(item.published_at || item.created_at),
          ringkasan: item.description,
          isFlyer: !!item.poster_url,
          posterUrl: resolveMediaUrl(item.poster_url),
          detail: item.description,
          penting: isImportant,
          expires_at: item.expires_at,
        };
      });

      setDaftar(items);
    } catch (err) {
      console.error("Gagal memuat pengumuman orang tua:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Otomatis buka modal detail pengumuman bila dibuka dari notifikasi (?id=...)
  useEffect(() => {
    if (typeof window !== "undefined" && daftar.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("id");
      if (queryId) {
        const found = daftar.find((d) => d.id === queryId);
        if (found) {
          setSelected(found);
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
    const matchKategori = filterKategori === "Semua" || p.kategori.toUpperCase() === filterKategori.toUpperCase();
    const matchSearch =
      !search.trim() ||
      p.judul.toLowerCase().includes(search.toLowerCase()) ||
      p.ringkasan.toLowerCase().includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .ortu-kartu-pengumuman:hover{box-shadow:0 4px 16px rgba(0,0,0,.09)!important;transform:translateY(-1px)}
        .ortu-kartu-pengumuman{transition:all .2s ease;cursor:pointer}

        .ortu-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ortu-filter-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .ortu-filter-chips::-webkit-scrollbar {
          display: none;
        }
        .ortu-filter-chips .filter-chip {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .ortu-search-wrap {
          position: relative;
          min-width: 260px;
        }

        .ortu-card-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .ortu-poster-thumb {
          width: 76px;
          height: 76px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--color-border-light);
          background: var(--color-bg);
        }

        .ortu-read-more {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-primary);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .ortu-kartu-pengumuman {
            padding: 16px 14px !important;
          }

          .ortu-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }

          .ortu-search-wrap {
            width: 100% !important;
            min-width: 100% !important;
          }

          .ortu-card-inner {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .ortu-poster-thumb {
            width: 100% !important;
            height: 160px !important;
            border-radius: 10px !important;
            order: 2 !important;
          }

          .ortu-card-content {
            order: 1 !important;
          }

          .ortu-card-footer {
            order: 3 !important;
            display: flex !important;
            justify-content: flex-end !important;
            padding-top: 4px !important;
          }

          .ortu-read-more {
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengumuman BSD After School Club</h1>
          <p className="page-subtitle">Informasi resmi, jadwal, dan pengumuman penting dari manajemen kursus untuk orang tua.</p>
        </div>
      </div>

      {/* Filter & Live Search */}
      <div className="ortu-filter-bar">
        <div className="ortu-filter-chips">
          {["Semua", "Penting", "Keuangan", "Program", "Umum"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterKategori(cat)}
              className={`filter-chip${filterKategori === cat ? " active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ortu-search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <input
            className="search-input"
            style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Cari pengumuman..."
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
        <SkeletonCardGrid count={3} />
      ) : (
        /* Daftar Pengumuman */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {terfilter.map((p) => (
            <div
              key={p.id}
              className="ortu-kartu-pengumuman card"
              onClick={() => setSelected(p)}
              style={{
                padding: "20px 22px",
                cursor: "pointer",
                borderLeft: p.penting ? "4px solid #dc2626" : "4px solid var(--color-border)",
                transition: "all .15s ease",
              }}
            >
              <div className="ortu-card-inner">
                <div className="ortu-card-content" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ ...(kategoriColor[p.kategori] || kategoriColor["UMUM"]), fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                      {p.kategori}
                    </span>
                    {p.isFlyer && (
                      <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                        Ada Flyer / Poster
                      </span>
                    )}
                    {p.expires_at && (
                      <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        Berlaku s/d {formatTanggal(p.expires_at)}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.tanggal}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 6px", wordBreak: "break-word" }}>{p.judul}</h3>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.ringkasan}
                  </p>
                </div>

                {p.posterUrl && (
                  <div className="ortu-poster-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.posterUrl} alt={p.judul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

                <div className="ortu-card-footer">
                  <span className="ortu-read-more">
                    Baca Selengkapnya →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {terfilter.length === 0 && (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum ada pengumuman</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                {search || filterKategori !== "Semua" ? "Tidak ada pengumuman yang sesuai dengan pencarian atau filter ini." : "Pengumuman resmi dari manajemen kursus akan ditampilkan di sini setelah dipublikasikan."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETAIL PENGUMUMAN */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Detail Pengumuman" maxWidth={640}>
          {/* Modal Header */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ ...(kategoriColor[selected.kategori] || kategoriColor["UMUM"]), fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                {selected.kategori}
              </span>
              {selected.isFlyer && (
                <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                  Poster Resmi
                </span>
              )}
              {selected.expires_at && (
                <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                  Berlaku s/d {formatTanggal(selected.expires_at)}
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{selected.tanggal}</span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 900, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.3, wordBreak: "break-word" }}>{selected.judul}</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Flyer / Poster Visual */}
            {selected.posterUrl && (
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)", background: "#0f172a", textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.posterUrl} alt={selected.judul} style={{ width: "100%", maxHeight: 460, objectFit: "contain", display: "block", margin: "0 auto" }} />
              </div>
            )}

            {/* Detail Teks Pengumuman */}
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Informasi Lengkap</div>
              <pre style={{ fontSize: 13.5, color: "var(--color-text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit", margin: 0, wordBreak: "break-word" }}>{selected.detail}</pre>
            </div>

            <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSelected(null)}>Tutup Pengumuman</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
