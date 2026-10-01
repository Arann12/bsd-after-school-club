"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getAnnouncements, BackendAnnouncement } from "@/lib/api/operational";
import { getHolidays } from "@/lib/api/academic";
import { SkeletonCard } from "@/components/ui/Skeleton";

export interface AgendaKegiatanItem {
  id: string;
  judul: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  deskripsi: string;
  kategori: string;
  warna: string;
  bgWarna: string;
  peserta: string;
  wajib: boolean;
}

const kategoriWarna: Record<string, { bg: string; color: string }> = {
  Wisuda: { bg: "#ede9fe", color: "#7c3aed" },
  Akademik: { bg: "#dbeafe", color: "#1d4ed8" },
  "Kegiatan Khusus": { bg: "#fef3c7", color: "#d97706" },
  Libur: { bg: "#fee2e2", color: "#dc2626" },
  Pengumuman: { bg: "#e0f2fe", color: "#0284c7" },
};

export default function OrangTuaKegiatanPage() {
  const [agendas, setAgendas] = useState<AgendaKegiatanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dipilih, setDipilih] = useState<AgendaKegiatanItem | null>(null);
  const [tab, setTab] = useState<"agenda" | "galeri">("agenda");

  const fetchKegiatan = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, holRes] = await Promise.allSettled([
        getAnnouncements({ per_page: 50 }),
        getHolidays({ per_page: 50 }),
      ]);

      const items: AgendaKegiatanItem[] = [];

      // Parse Announcements
      if (annRes.status === "fulfilled") {
        const rawAnn = Array.isArray(annRes.value?.data?.data)
          ? annRes.value.data.data
          : Array.isArray(annRes.value?.data)
          ? annRes.value.data
          : [];

        rawAnn.forEach((a: BackendAnnouncement) => {
          const dateStr = a.published_at || a.created_at;
          const formattedDate = dateStr
            ? new Date(dateStr).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Waktu Pengumuman";

          items.push({
            id: a.id,
            judul: a.title,
            tanggal: formattedDate,
            jam: "Sesuai Jadwal",
            lokasi: "BSD After School Club",
            deskripsi: a.description,
            kategori: "Pengumuman",
            warna: "#0284c7",
            bgWarna: "#e0f2fe",
            peserta: "Seluruh Orang Tua & Siswa",
            wajib: false,
          });
        });
      }

      // Parse Holidays
      if (holRes.status === "fulfilled") {
        const rawHol = Array.isArray(holRes.value?.data?.data)
          ? holRes.value.data.data
          : Array.isArray(holRes.value?.data)
          ? holRes.value.data
          : [];

        rawHol.forEach((h: any) => {
          const dateStr = h.holiday_date || h.date;
          const formattedDate = dateStr
            ? new Date(dateStr).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Hari Libur";

          items.push({
            id: h.id,
            judul: `Libur: ${h.name || h.description || "Hari Libur Nasional"}`,
            tanggal: formattedDate,
            jam: "Seharian",
            lokasi: "—",
            deskripsi: h.description || "Kegiatan belajar mengajar ditiadakan sehubungan dengan hari libur nasional.",
            kategori: "Libur",
            warna: "#dc2626",
            bgWarna: "#fee2e2",
            peserta: "—",
            wajib: false,
          });
        });
      }

      setAgendas(items);
    } catch (err) {
      console.warn("Gagal memuat kegiatan & pengumuman:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kegiatan & Agenda BSD</h1>
          <p className="page-subtitle">Jadwal kegiatan sekolah, hari libur, pengumuman, dan agenda belajar siswa.</p>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["agenda", "galeri"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 22px",
              borderRadius: "var(--radius-full)",
              border: "1.5px solid",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all .15s",
              background: tab === t ? "var(--color-primary)" : "white",
              color: tab === t ? "white" : "var(--color-text-secondary)",
              borderColor: tab === t ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {t === "agenda" ? "Agenda & Pengumuman" : "Galeri Kegiatan"}
          </button>
        ))}
      </div>

      {/* Konten Agenda */}
      {tab === "agenda" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : agendas.length === 0 ? (
            <div className="card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
              Belum ada agenda kegiatan atau pengumuman saat ini.
            </div>
          ) : (
            agendas.map((k) => (
              <div
                key={k.id}
                className="card"
                style={{ padding: 22, borderLeft: `4px solid ${k.warna}`, cursor: "pointer" }}
                onClick={() => setDipilih(k)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: k.bgWarna,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 900,
                        color: k.warna,
                        flexShrink: 0,
                      }}
                    >
                      {k.kategori === "Libur" ? "🌴" : "📢"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{k.judul}</span>
                        {k.wajib && (
                          <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                            WAJIB
                          </span>
                        )}
                        <span
                          style={{
                            ...(kategoriWarna[k.kategori] || { bg: "#f1f5f9", color: "#475569" }),
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          {k.kategori}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{k.tanggal}</span>
                        <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{k.jam}</span>
                        <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{k.lokasi}</span>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDipilih(k)}>
                    Detail &rarr;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Konten Galeri */}
      {tab === "galeri" && (
        <div>
          <div style={{ background: "#f8fafc", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 6 }}>
              Galeri Kegiatan Pembelajaran
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", maxWidth: 440, margin: "0 auto" }}>
              Foto dokumentasi kegiatan belajar dan pentas seni akan diunggah oleh pihak sekolah secara berkala.
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Kegiatan */}
      {dipilih && (
        <Modal open onClose={() => setDipilih(null)} title="Detail Informasi" maxWidth={520}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: dipilih.bgWarna,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {dipilih.kategori === "Libur" ? "🌴" : "📢"}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                {dipilih.judul}
              </div>
              <span
                style={{
                  ...(kategoriWarna[dipilih.kategori] || { bg: "#f1f5f9", color: "#475569" }),
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {dipilih.kategori}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Tanggal", val: dipilih.tanggal },
              { label: "Waktu", val: dipilih.jam },
              { label: "Lokasi", val: dipilih.lokasi },
              { label: "Sasaran", val: dipilih.peserta },
            ].map((item) => (
              <div key={item.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
            {dipilih.deskripsi}
          </div>

          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setDipilih(null)}>
            Tutup
          </button>
        </Modal>
      )}
    </div>
  );
}
