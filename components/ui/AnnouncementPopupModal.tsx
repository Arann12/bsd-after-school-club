"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAnnouncements, resolveMediaUrl, type BackendAnnouncement } from "@/lib/api/operational";
import { getLocalUser } from "@/lib/api/auth";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 hari dalam milidetik

interface ReadRecord {
  readAt: number; // Timestamp saat user mencentang "sudah baca"
}

type ReadStorageMap = Record<string, ReadRecord>;

export default function AnnouncementPopupModal() {
  const [announcements, setAnnouncements] = useState<BackendAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Ambil user ID atau role untuk kunci localStorage yang unik per pengguna
  const getStorageKey = useCallback(() => {
    try {
      const user = getLocalUser();
      if (user?.id) return `bsd_announcements_read_${user.id}`;
      if (user?.role) return `bsd_announcements_read_${user.role}`;
    } catch {
      // fallback
    }
    return "bsd_announcements_read_default";
  }, []);

  const getReadRecords = useCallback((): ReadStorageMap => {
    try {
      if (typeof window === "undefined") return {};
      const raw = localStorage.getItem(getStorageKey());
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Gagal membaca riwayat pengumuman dari localStorage:", e);
    }
    return {};
  }, [getStorageKey]);

  const saveReadRecord = useCallback((announcementId: string) => {
    try {
      if (typeof window === "undefined") return;
      const records = getReadRecords();
      records[announcementId] = { readAt: Date.now() };
      localStorage.setItem(getStorageKey(), JSON.stringify(records));
    } catch (e) {
      console.warn("Gagal menyimpan riwayat pengumuman ke localStorage:", e);
    }
  }, [getReadRecords, getStorageKey]);

  const isDismissedInCurrentSession = useCallback((announcementId: string): boolean => {
    try {
      if (typeof window === "undefined") return false;
      return sessionStorage.getItem(`bsd_ann_dismissed_${announcementId}`) === "1";
    } catch {
      return false;
    }
  }, []);

  const markDismissedInCurrentSession = useCallback((announcementId: string) => {
    try {
      if (typeof window === "undefined") return;
      sessionStorage.setItem(`bsd_ann_dismissed_${announcementId}`, "1");
    } catch {
      // ignore
    }
  }, []);

  // Memuat pengumuman aktif dari backend
  const checkAnnouncements = useCallback(async () => {
    try {
      // Ambil pengumuman yang sudah dipublikasikan & masih aktif
      const res = await getAnnouncements({ status: "published", active_only: true, per_page: 15 });
      const rawList: BackendAnnouncement[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (rawList.length === 0) return;

      const records = getReadRecords();
      const now = Date.now();

      // Filter pengumuman yang harus ditampilkan:
      // 0. BELUM KEDALUWARSA (jika ada batas tanggal aktif expires_at)
      // 1. Belum pernah dicentang "sudah baca" (pengumuman baru)
      // 2. ATAU sudah pernah dicentang tetapi masa 3 hari sudah lewat (announcement lama muncul kembali)
      // 3. DAN belum di-close di sesi tab browser saat ini (jika hanya klik silang tanpa centang)
      const toShow = rawList.filter((ann) => {
        // Cek apakah pengumuman sudah lewat tanggal kedaluwarsa
        if (ann.expires_at) {
          const expTime = new Date(ann.expires_at).getTime();
          if (expTime < now) {
            return false; // Sudah kedaluwarsa -> jangan muncul
          }
        }

        // Cek sesi saat ini
        if (isDismissedInCurrentSession(ann.id)) {
          return false;
        }

        const record = records[ann.id];
        if (!record) {
          // Pengumuman baru yang belum pernah dibaca -> Tampilkan!
          return true;
        }

        // Pengumuman lama: cek apakah sudah lewat 3 hari
        const elapsed = now - record.readAt;
        if (elapsed >= THREE_DAYS_MS) {
          // Masa 3 hari sudah habis -> Muncul lagi!
          return true;
        }

        // Masih dalam masa 3 hari setelah dicentang baca -> Jangan muncul
        return false;
      });

      if (toShow.length > 0) {
        setAnnouncements(toShow);
        setCurrentIndex(0);
        setDontShowAgain(false);
        setIsOpen(true);
      }
    } catch (err) {
      console.warn("Gagal memeriksa pengumuman popup:", err);
    }
  }, [getReadRecords, isDismissedInCurrentSession]);

  useEffect(() => {
    // Jalankan setelah komponen mount
    const timer = setTimeout(() => {
      checkAnnouncements();
    }, 600);

    return () => clearTimeout(timer);
  }, [checkAnnouncements]);

  const currentAnn = announcements[currentIndex];

  const handleClose = () => {
    if (!currentAnn) {
      setIsOpen(false);
      return;
    }

    if (dontShowAgain) {
      // Jika dicentang "Saya sudah baca", simpan ke localStorage (berlaku 3 hari)
      saveReadRecord(currentAnn.id);
    } else {
      // Jika hanya tombol silang / batal tanpa centang, simpan di sessionStorage agar tidak berulang di setiap reload sesi ini
      markDismissedInCurrentSession(currentAnn.id);
    }

    // Jika masih ada pengumuman berikutnya dalam antrean
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setDontShowAgain(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleSudahBaca = () => {
    if (currentAnn) {
      saveReadRecord(currentAnn.id);
    }

    if (currentIndex < announcements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setDontShowAgain(false);
    } else {
      setIsOpen(false);
    }
  };

  if (!isOpen || !currentAnn) return null;

  const posterSrc = currentAnn.poster_url ? resolveMediaUrl(currentAnn.poster_url) : null;
  const isPenting =
    currentAnn.title?.toLowerCase().includes("penting") ||
    currentAnn.title?.toLowerCase().includes("urgent") ||
    currentAnn.description?.toLowerCase().includes("penting");

  const formattedDate = currentAnn.published_at || currentAnn.created_at
    ? new Date(currentAnn.published_at || currentAnn.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const formattedExpires = currentAnn.expires_at
    ? new Date(currentAnn.expires_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn .2s ease-out",
      }}
      onClick={(e) => {
        // Klik di luar kartu modal
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <style>{`
        .ann-popup-card {
          background: #ffffff;
          border-radius: 20px;
          max-width: 540px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .ann-popup-poster-wrap {
          width: 100%;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
          border-bottom: 1px solid var(--color-border-light);
          overflow: hidden;
        }

        .ann-popup-poster {
          width: 100%;
          max-height: 440px;
          object-fit: contain;
          display: block;
        }

        .ann-popup-content {
          padding: 24px;
        }

        .ann-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .ann-close-btn:hover {
          background: #ffffff;
          color: #0f172a;
          transform: scale(1.05);
        }

        .ann-footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border-light);
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .ann-popup-card {
            max-height: 88vh;
            border-radius: 16px;
          }
          .ann-popup-content {
            padding: 18px 16px;
          }
          .ann-popup-poster {
            max-height: 340px;
          }
          .ann-footer-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .ann-footer-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="ann-popup-card">
        {/* Tombol Silang (X) untuk Close */}
        <button
          className="ann-close-btn"
          onClick={handleClose}
          title="Tutup"
          aria-label="Tutup"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Gambar Poster / Flyer Pengumuman */}
        {posterSrc && (
          <div className="ann-popup-poster-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterSrc}
              alt={currentAnn.title}
              className="ann-popup-poster"
            />
          </div>
        )}

        <div className="ann-popup-content">
          {/* Header Badge & Tanggal */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  background: isPenting ? "#fee2e2" : "#e0f2fe",
                  color: isPenting ? "#dc2626" : "#0369a1",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {isPenting ? "Penting" : "Pengumuman"}
              </span>

              {announcements.length > 1 && (
                <span
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 999,
                  }}
                >
                  {currentIndex + 1} dari {announcements.length}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {formattedDate && (
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>
                  {formattedDate}
                </span>
              )}
              {formattedExpires && (
                <span style={{ fontSize: 11, color: "#92400e", background: "#fef3c7", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                  Berlaku s/d {formattedExpires}
                </span>
              )}
            </div>
          </div>

          {/* Judul Pengumuman */}
          <h2
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: "0 0 12px",
              lineHeight: 1.35,
              wordBreak: "break-word",
            }}
          >
            {currentAnn.title}
          </h2>

          {/* Isi / Deskripsi Pengumuman */}
          <div
            style={{
              background: "var(--color-bg)",
              borderRadius: 12,
              padding: "16px 18px",
              fontSize: 13.5,
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 260,
              overflowY: "auto",
              border: "1px solid var(--color-border-light)",
            }}
          >
            {currentAnn.description}
          </div>

          {/* Footer: Checkbox & Tombol Aksi */}
          <div className="ann-footer-actions">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 12.5,
                color: "var(--color-text-secondary)",
                userSelect: "none",
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{
                  width: 17,
                  height: 17,
                  accentColor: "var(--color-primary)",
                  cursor: "pointer",
                }}
              />
              <span>Jangan tampilkan lagi</span>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleClose}
                style={{ fontSize: 12.5 }}
              >
                Tutup
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSudahBaca}
                style={{ fontSize: 12.5 }}
              >
                {announcements.length > 1 && currentIndex < announcements.length - 1
                  ? "Selanjutnya"
                  : "Mengerti"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
