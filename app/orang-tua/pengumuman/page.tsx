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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengumuman BSD After School Club</h1>
          <p className="page-subtitle">Informasi resmi, jadwal, dan pengumuman penting dari manajemen kursus untuk orang tua.</p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <SkeletonCardGrid count={3} />
      ) : (
        /* Daftar Pengumuman */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {daftar.map((p) => (
            <div
              key={p.id}
              className="card"
              onClick={() => setSelected(p)}
              style={{
                padding: 22,
                cursor: "pointer",
                borderLeft: p.penting ? "4px solid #dc2626" : "4px solid var(--color-border)",
                transition: "all .15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ ...(kategoriColor[p.kategori] || kategoriColor["UMUM"]), fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                      {p.kategori}
                    </span>
                    {p.isFlyer && (
                      <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                        Ada Flyer / Poster
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.tanggal}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 6px" }}>{p.judul}</h3>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.ringkasan}
                  </p>
                </div>
                {p.posterUrl && (
                  <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid var(--color-border-light)", background: "var(--color-bg)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.posterUrl} alt={p.judul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", whiteSpace: "nowrap" }}>Baca Selengkapnya →</span>
              </div>
            </div>
          ))}

          {daftar.length === 0 && (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum ada pengumuman untuk orang tua</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Pengumuman resmi dari manajemen kursus akan ditampilkan di sini setelah dipublikasikan.</div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETAIL PENGUMUMAN */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Detail Pengumuman" maxWidth={640}>
          {/* Modal Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ ...(kategoriColor[selected.kategori] || kategoriColor["UMUM"]), fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                {selected.kategori}
              </span>
              {selected.isFlyer && (
                <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                  Poster Resmi
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{selected.tanggal}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.3 }}>{selected.judul}</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Flyer / Poster Visual */}
            {selected.posterUrl && (
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.posterUrl} alt={selected.judul} style={{ width: "100%", maxHeight: 380, objectFit: "cover" }} />
              </div>
            )}

            {/* Detail Teks Pengumuman */}
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Informasi Lengkap</div>
              <pre style={{ fontSize: 13, color: "var(--color-text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit", margin: 0 }}>{selected.detail}</pre>
            </div>

            <button className="btn btn-accent" onClick={() => setSelected(null)}>Tutup Pengumuman</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
