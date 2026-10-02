"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCashTransactions,
  confirmCashTransaction,
  rejectCashTransaction,
  type BackendCashTransaction,
} from "@/lib/api/finance";
import Toast, { useToast } from "@/components/ui/Toast";
import { SkeletonTable } from "@/components/ui/Skeleton";

export interface CashVerificationItem {
  id: string;
  cashCode: string;
  invoiceId: string;
  namaOrtu: string;
  namaSiswa: string;
  program: string;
  jumlah: number;
  penerimaKasir: string;
  tglTerima: string;
  catatan: string;
  adminNotes?: string;
  receiptNumber?: string;
  proofImage?: string | null;
  rawStatus: string;
  status: "Menunggu Verifikasi" | "Disetujui / Terverifikasi" | "Ditolak";
}

export default function AdminVerifikasiCashPage() {
  const { toast, showToast } = useToast();
  const [cashList, setCashList] = useState<CashVerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCash, setSelectedCash] = useState<CashVerificationItem | null>(null);
  const [modalMode, setModalMode] = useState<"confirm" | "reject" | "detail">("confirm");
  const [adminNoteInput, setAdminNoteInput] = useState<string>("");
  const [receiptInput, setReceiptInput] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");

  const formatTanggal = (dateStr?: string | null) => {
    if (!dateStr) return "–";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    } catch {
      return dateStr;
    }
  };

  const mapStatus = (raw: string): CashVerificationItem["status"] => {
    switch (raw.toLowerCase()) {
      case "paid":
        return "Disetujui / Terverifikasi";
      case "rejected":
        return "Ditolak";
      case "menunggu_konfirmasi_admin":
      default:
        return "Menunggu Verifikasi";
    }
  };

  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await getCashTransactions({ per_page: 50 });
      const rawList: BackendCashTransaction[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const formatted: CashVerificationItem[] = rawList.map((item) => {
        const studentName = item.enrollment?.student?.full_name || "Siswa";
        const parentName = item.submitter?.name || "Orang Tua";
        const programName = item.enrollment?.program?.name || "Program";
        const invoiceCode = item.payment?.payment_code || item.payment_plan?.id ? `INV-${item.cash_code}` : item.cash_code;
        const verifierName = item.verifier?.name || (item.verified_by ? "Admin Kasir" : "–");

        return {
          id: item.id,
          cashCode: item.cash_code,
          invoiceId: invoiceCode,
          namaOrtu: parentName,
          namaSiswa: studentName,
          program: programName,
          jumlah: Number(item.amount) || 0,
          penerimaKasir: verifierName,
          tglTerima: formatTanggal(item.submitted_at),
          catatan: item.notes || "",
          adminNotes: item.admin_notes || "",
          receiptNumber: item.receipt_number || "",
          proofImage: item.proof_image,
          rawStatus: item.status,
          status: mapStatus(item.status),
        };
      });

      setCashList(formatted);
    } catch (err: any) {
      console.error("Gagal memuat transaksi cash:", err);
      if (!isSilent) showToast("Gagal memuat data transaksi cash dari server.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    }, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadData]);

  const handleOpenConfirm = (item: CashVerificationItem) => {
    setSelectedCash(item);
    setModalMode("confirm");
    setAdminNoteInput(item.adminNotes || "Uang tunai fisik telah diterima dan diverifikasi sesuai nominal.");
    setReceiptInput(item.receiptNumber || `KW-${Date.now().toString().slice(-6)}`);
  };

  const handleOpenReject = (item: CashVerificationItem) => {
    setSelectedCash(item);
    setModalMode("reject");
    setAdminNoteInput("Uang tunai fisik belum/tidak diserahkan ke kasir.");
  };

  const handleOpenDetail = (item: CashVerificationItem) => {
    setSelectedCash(item);
    setModalMode("detail");
  };

  const handleConfirmSubmit = async () => {
    if (!selectedCash) return;
    try {
      setSubmitting(true);
      await confirmCashTransaction(selectedCash.id, {
        admin_notes: adminNoteInput.trim(),
        receipt_number: receiptInput.trim() || undefined,
      });

      showToast(`Pembayaran cash ${selectedCash.cashCode} berhasil disetujui dan berstatus LUNAS!`);
      setSelectedCash(null);
      await loadData();
    } catch (err: any) {
      console.error("Gagal konfirmasi cash:", err);
      showToast(err?.response?.data?.message || "Gagal mengonfirmasi pembayaran cash.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedCash) return;
    try {
      setSubmitting(true);
      const note = adminNoteInput.trim() || "Pengajuan tunai ditolak oleh kasir.";
      await rejectCashTransaction(selectedCash.id, {
        rejection_reason: note,
        admin_notes: note,
      });

      showToast(`Pembayaran cash ${selectedCash.cashCode} berhasil ditolak.`);
      setSelectedCash(null);
      await loadData();
    } catch (err: any) {
      console.error("Gagal menolak cash:", err);
      showToast(err?.response?.data?.message || "Gagal menolak pembayaran cash.");
    } finally {
      setSubmitting(false);
    }
  };

  const terfilter = cashList.filter((c) => {
    const cocokStatus = filterStatus === "Semua" || c.status === filterStatus;
    const q = search.toLowerCase().trim();
    const cocokSearch =
      !q ||
      c.cashCode.toLowerCase().includes(q) ||
      c.invoiceId.toLowerCase().includes(q) ||
      c.namaOrtu.toLowerCase().includes(q) ||
      c.namaSiswa.toLowerCase().includes(q) ||
      c.program.toLowerCase().includes(q);

    return cocokStatus && cocokSearch;
  });

  const countPending = cashList.filter((c) => c.status === "Menunggu Verifikasi").length;
  const countApproved = cashList.filter((c) => c.status === "Disetujui / Terverifikasi").length;
  const totalNominal = cashList
    .filter((c) => c.status === "Disetujui / Terverifikasi")
    .reduce((a, c) => a + c.jumlah, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Toast toast={toast} />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Verifikasi Pembayaran Cash (Tunai)</h1>
          <p className="page-subtitle">Persetujuan & konfirmasi fisik atas uang tunai yang diterima oleh Kasir / Admin di kantor.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={loadData} disabled={loading} suppressHydrationWarning>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Banner Aturan ACC Pembayaran */}
      <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "14px 18px", color: "#0369a1", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          i
        </div>
        <div>
          <div style={{ fontWeight: 800, color: "#0c4a6e", fontSize: 13.5 }}>Ketentuan ACC & Verifikasi Pembayaran</div>
          <div style={{ fontSize: 12, color: "#0284c7", marginTop: 2 }}>
            Sistem ACC / Verifikasi Pembayaran <strong>hanya diperuntukkan bagi pembayaran Cash (Tunai)</strong>. Pembayaran selain Cash (Virtual Account BCA/Mandiri/BRI/BNI, QRIS, E-Wallet) <strong>secara otomatis terverifikasi LUNAS</strong> oleh sistem Payment Gateway tanpa memerlukan ACC manual.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {[
          { label: "Menunggu Verifikasi", value: countPending, color: "#b45309", bg: "#fef3c7" },
          { label: "Terverifikasi / Lunas", value: countApproved, color: "#059669", bg: "#d1fae5" },
          { label: "Total Nominal Cash Masuk", value: `Rp ${totalNominal.toLocaleString("id-ID")}`, color: "#1d4ed8", bg: "#dbeafe" },
        ].map((c) => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["Semua", "Menunggu Verifikasi", "Disetujui / Terverifikasi", "Ditolak"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`filter-chip${filterStatus === st ? " active" : ""}`}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 260 }}>
          <input
            className="search-input"
            style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Cari kode, nama siswa, orang tua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Loading State or Table */}
      {loading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Kode Cash", "No. Invoice", "Nama Wali / Siswa", "Program", "Nominal Cash", "Tanggal Dibuat", "Status", "Bukti & Rincian", "Aksi Verifikasi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terfilter.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700 }}>{c.cashCode}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{c.invoiceId}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{c.namaOrtu}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Siswa: {c.namaSiswa}</div>
                      {c.catatan && <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", marginTop: 2 }}>Catatan: &ldquo;{c.catatan}&rdquo;</div>}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{c.program}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 900, color: "#059669", whiteSpace: "nowrap" }}>
                      Rp {c.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>{c.tglTerima}</td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: c.status === "Disetujui / Terverifikasi" ? "#d1fae5" : c.status === "Ditolak" ? "#fee2e2" : "#fef3c7",
                        color: c.status === "Disetujui / Terverifikasi" ? "#059669" : c.status === "Ditolak" ? "#dc2626" : "#b45309",
                        fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenDetail(c)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 700,
                          border: "1px solid var(--color-border)",
                          background: c.proofImage ? "#eff6ff" : "white",
                          color: c.proofImage ? "#1d4ed8" : "var(--color-text-secondary)",
                        }}
                      >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {c.proofImage ? "Lihat Bukti Foto" : "Rincian Transaksi"}
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      {c.status === "Menunggu Verifikasi" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-accent btn-sm" onClick={() => handleOpenConfirm(c)}>
                            ACC Kasir
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleOpenReject(c)}>
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {terfilter.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Tidak ada transaksi cash</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Transaksi pembayaran tunai yang diajukan orang tua akan muncul di sini.</div>
            </div>
          )}
        </div>
      )}

      {/* Modal Verifikasi / ACC Cash */}
      {selectedCash && modalMode === "confirm" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn .25s ease-out", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>Konfirmasi Terima Uang Tunai / Cash</h3>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: "#166534", marginBottom: 2 }}>Kode: <strong>{selectedCash.cashCode}</strong> ({selectedCash.invoiceId})</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#14532d" }}>{selectedCash.namaOrtu} (Siswa: {selectedCash.namaSiswa})</div>
              <div style={{ fontSize: 12, color: "#15803d", marginTop: 2 }}>Program: {selectedCash.program}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#15803d", marginTop: 6 }}>Rp {selectedCash.jumlah.toLocaleString("id-ID")}</div>
            </div>

            {selectedCash.catatan && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: "#64748b" }}>Catatan Wali: </span>
                <span style={{ fontStyle: "italic", color: "#1e293b" }}>&ldquo;{selectedCash.catatan}&rdquo;</span>
              </div>
            )}

            {selectedCash.proofImage && (
              <div style={{ marginBottom: 14, border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Foto Struk / Kwitansi Fisik:</div>
                <a href={selectedCash.proofImage} target="_blank" rel="noopener noreferrer">
                  <img
                    src={selectedCash.proofImage}
                    alt="Bukti Pembayaran"
                    style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 6, background: "#0f172a" }}
                  />
                  <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700, marginTop: 4, textAlign: "center" }}>
                    ↗ Buka foto di tab baru
                  </div>
                </a>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nomor Kwitansi / Receipt (Opsional)</label>
                <input className="form-input" value={receiptInput} onChange={(e) => setReceiptInput(e.target.value)} placeholder="Contoh: KW-2026-001" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Catatan Kasir / Admin</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Catatan verifikasi penerimaan fisik uang tunai..."
                  style={{ fontSize: 13, minHeight: 70 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedCash(null)} disabled={submitting}>Batal</button>
                <button className="btn btn-accent" onClick={handleConfirmSubmit} disabled={submitting}>
                  {submitting ? "Memproses..." : "ACC & Tandai Lunas"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Cash */}
      {selectedCash && modalMode === "reject" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn .25s ease-out" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px", color: "var(--color-danger)" }}>Tolak Pembayaran Cash</h3>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menolak transaksi cash <strong>{selectedCash.cashCode}</strong> sebesar <strong>Rp {selectedCash.jumlah.toLocaleString("id-ID")}</strong>?
            </p>

            <div className="form-group" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Alasan Penolakan</label>
              <textarea
                className="form-input"
                rows={3}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Tuliskan alasan penolakan..."
                style={{ fontSize: 13, minHeight: 70 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedCash(null)} disabled={submitting}>Batal</button>
              <button className="btn btn-ghost" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={handleRejectSubmit} disabled={submitting}>
                {submitting ? "Memproses..." : "Tolak Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail & Rincian Bukti Transaksi */}
      {selectedCash && modalMode === "detail" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 580, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn .25s ease-out", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Rincian & Bukti Transaksi Cash</h3>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>Pemeriksaan fisik dan bukti pembayaran langsung di kasir</div>
              </div>
              <span style={{
                background: selectedCash.status === "Disetujui / Terverifikasi" ? "#d1fae5" : selectedCash.status === "Ditolak" ? "#fee2e2" : "#fef3c7",
                color: selectedCash.status === "Disetujui / Terverifikasi" ? "#059669" : selectedCash.status === "Ditolak" ? "#dc2626" : "#b45309",
                fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999
              }}>
                {selectedCash.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Kode Cash</span>
                <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{selectedCash.cashCode}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>No. Invoice Induk</span>
                <span style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--color-primary)" }}>{selectedCash.invoiceId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Nama Siswa</span>
                <span style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{selectedCash.namaSiswa}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Wali / Orang Tua</span>
                <span style={{ fontWeight: 700 }}>{selectedCash.namaOrtu}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Program Kursus</span>
                <span style={{ fontWeight: 600 }}>{selectedCash.program}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Nominal Pembayaran</span>
                <span style={{ fontWeight: 900, fontSize: 16, color: "#059669" }}>Rp {selectedCash.jumlah.toLocaleString("id-ID")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Waktu Pengajuan</span>
                <span>{selectedCash.tglTerima}</span>
              </div>
              {selectedCash.receiptNumber && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Nomor Kwitansi / Struk</span>
                  <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{selectedCash.receiptNumber}</span>
                </div>
              )}
              {selectedCash.penerimaKasir !== "–" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Diverifikasi Oleh</span>
                  <span style={{ fontWeight: 600 }}>{selectedCash.penerimaKasir}</span>
                </div>
              )}
              {selectedCash.catatan && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 2 }}>Catatan Pengajuan Wali:</div>
                  <div style={{ fontStyle: "italic", color: "#1e293b" }}>&ldquo;{selectedCash.catatan}&rdquo;</div>
                </div>
              )}
              {selectedCash.adminNotes && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 2 }}>Catatan Petugas Kasir:</div>
                  <div style={{ color: "#14532d" }}>&ldquo;{selectedCash.adminNotes}&rdquo;</div>
                </div>
              )}
            </div>

            {/* Lampiran Bukti Fisik Foto / Struk */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span>Foto Bukti Fisik / Kwitansi Pembayaran</span>
                {selectedCash.proofImage && (
                  <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                    Tersedia
                  </span>
                )}
              </div>

              {selectedCash.proofImage ? (
                <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#f8fafc", padding: 8 }}>
                  <a href={selectedCash.proofImage} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                    <img
                      src={selectedCash.proofImage}
                      alt="Bukti Fisik Pembayaran Tunai"
                      style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 8, background: "#0f172a" }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, textAlign: "center", color: "var(--color-primary)", fontWeight: 700 }}>
                      ↗ Klik untuk memperbesar / membuka foto di tab baru
                    </div>
                  </a>
                </div>
              ) : (
                <div style={{ padding: "18px 20px", borderRadius: 10, background: "#f8fafc", border: "1.5px dashed #cbd5e1", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                    Pembayaran Tunai Fisik di Meja Kasir
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, maxWidth: 360, margin: "4px auto 0" }}>
                    Tidak ada lampiran foto digital. Orang tua menyerahkan uang tunai fisik secara langsung ke staf kasir kantor cabang.
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons inside detail modal */}
            {selectedCash.status === "Menunggu Verifikasi" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 12, borderTop: "1px solid var(--color-border-light)" }}>
                <button
                  className="btn btn-ghost"
                  style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                  onClick={() => handleOpenReject(selectedCash)}
                >
                  Tolak Pembayaran
                </button>
                <button
                  className="btn btn-accent"
                  onClick={() => handleOpenConfirm(selectedCash)}
                >
                  Setujui & ACC Kasir
                </button>
              </div>
            ) : (
              <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setSelectedCash(null)}>
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
