"use client";

import { useState, useEffect, useCallback } from "react";
import Toast, { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import {
  getPaymentPlans,
  submitCashTransaction,
  confirmCashTransaction,
} from "@/lib/api/finance";

export interface TagihanItem {
  id: string;
  rawPlanId: string;
  invoiceCode: string;
  siswa: string;
  idSiswa: string;
  program: string;
  pertemuan: string;
  jumlah: number;
  metode: string;
  tanggalJatuhTempo: string;
  tanggalBayar: string;
  status: "Lunas" | "Menunggu Konfirmasi" | "Belum Bayar" | "Overdue";
  jalur: string;
  cashTxId?: string;
  enrollmentId: string;
}

const warnaStatus: Record<string, { bg: string; color: string }> = {
  "Lunas":                { bg: "#d1fae5", color: "#059669" },
  "Menunggu Konfirmasi":  { bg: "#fef3c7", color: "#b45309" },
  "Belum Bayar":          { bg: "#fee2e2", color: "#dc2626" },
  "Overdue":              { bg: "#fce7f3", color: "#be185d" },
};

export default function AdminTagihanPage() {
  const { toast, showToast } = useToast();
  const [daftarTagihan, setDaftarTagihan] = useState<TagihanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [dipilih, setDipilih] = useState<TagihanItem | null>(null);

  // Modal State: Input Cash Manual
  const [showInputCashModal, setShowInputCashModal] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [cashAmount, setCashAmount] = useState<number>(100000);
  const [cashNote, setCashNote] = useState("");

  const daftarStatus = ["Semua", "Lunas", "Menunggu Konfirmasi", "Belum Bayar", "Overdue"];

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
      const res = await getPaymentPlans({ per_page: 100 });
      const rawPlans = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formatted: TagihanItem[] = rawPlans.map((plan: any) => {
        const studentName = plan.enrollment?.student?.full_name || "Siswa";
        const studentCode = plan.enrollment?.student?.student_code || "–";
        const programName = plan.enrollment?.program?.name || "Program";
        const latestPayment = Array.isArray(plan.payments) && plan.payments.length > 0 ? plan.payments[0] : null;

        const isPaid = Boolean(plan.is_paid || plan.status === "paid" || latestPayment?.payment_status === "paid");
        const hasPendingCash = Array.isArray(plan.cash_transactions || plan.cashTransactions)
          ? (plan.cash_transactions || plan.cashTransactions).some(
              (c: any) => (c.status || "").toLowerCase() === "menunggu_konfirmasi_admin"
            )
          : false;

        let statusTagihan: TagihanItem["status"] = "Belum Bayar";

        if (isPaid) {
          statusTagihan = "Lunas";
        } else if (plan.status === "menunggu_konfirmasi_admin" || hasPendingCash) {
          statusTagihan = "Menunggu Konfirmasi";
        } else if (plan.due_date && new Date(plan.due_date) < today) {
          statusTagihan = "Overdue";
        }

        const invoiceCode = latestPayment?.payment_code || `INV-${plan.id.slice(0, 8).toUpperCase()}`;
        const metodeBayar = latestPayment?.payment_method
          ? latestPayment.payment_method.toUpperCase()
          : (isPaid ? "CASH" : "–");
        const jalur = latestPayment?.payment_channel ? latestPayment.payment_channel.toUpperCase() : "–";

        return {
          id: plan.id,
          rawPlanId: plan.id,
          invoiceCode,
          siswa: studentName,
          idSiswa: studentCode,
          program: programName,
          pertemuan: `Sesi #${plan.session_number}`,
          jumlah: Number(plan.amount) || 0,
          metode: metodeBayar,
          tanggalJatuhTempo: formatTanggal(plan.due_date),
          tanggalBayar: latestPayment?.paid_at ? formatTanggal(latestPayment.paid_at) : (isPaid ? "–" : "–"),
          status: statusTagihan,
          jalur,
          enrollmentId: plan.enrollment_id || plan.enrollment?.id || "",
        };
      });

      setDaftarTagihan(formatted);
    } catch (err: any) {
      console.error("Gagal memuat payment plans:", err);
      showToast("Gagal memuat data tagihan dari server.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive enrollment options from daftarTagihan (already loaded, no extra API call)
  const enrollmentOptions = (() => {
    const seen = new Set<string>();
    return daftarTagihan
      .filter(t => t.status !== "Lunas" && t.enrollmentId)
      .filter(t => {
        if (seen.has(t.enrollmentId)) return false;
        seen.add(t.enrollmentId);
        return true;
      })
      .map(t => ({ id: t.enrollmentId, label: `${t.siswa} — ${t.program}` }));
  })();

  const terfilter = daftarTagihan.filter((t) => {
    const q = cari.toLowerCase().trim();
    const cocokCari =
      !q ||
      t.siswa.toLowerCase().includes(q) ||
      t.invoiceCode.toLowerCase().includes(q) ||
      t.program.toLowerCase().includes(q);
    const cocokStatus = filterStatus === "Semua" || t.status === filterStatus;
    return cocokCari && cocokStatus;
  });

  const countLunas = daftarTagihan.filter((t) => t.status === "Lunas").length;
  const countPending = daftarTagihan.filter((t) => t.status === "Menunggu Konfirmasi").length;
  const countBelumBayar = daftarTagihan.filter((t) => t.status === "Belum Bayar").length;
  const countOverdue = daftarTagihan.filter((t) => t.status === "Overdue").length;

  const handleSaveCashManual = async () => {
    if (!selectedEnrollmentId) {
      showToast("Pilih siswa/pendaftaran terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      const targetPlan = daftarTagihan.find((t) => t.enrollmentId === selectedEnrollmentId && t.status !== "Lunas");

      if (targetPlan) {
        const res = await submitCashTransaction({
          payment_plan_id: targetPlan.rawPlanId,
          notes: cashNote.trim() || "Pembayaran tunai langsung di kantor",
        });

        if (res?.data?.id) {
          await confirmCashTransaction(res.data.id, {
            admin_notes: "Diterima dan dikonfirmasi langsung oleh kasir kantor.",
            receipt_number: `KW-${Date.now().toString().slice(-6)}`,
          });
        }
      }

      showToast(`Pembayaran Cash Manual Rp ${cashAmount.toLocaleString("id-ID")} berhasil dicatat!`);
      setShowInputCashModal(false);
      setSelectedEnrollmentId("");
      setCashNote("");
      await loadData();
    } catch (err: any) {
      console.error("Gagal input cash manual:", err);
      showToast(err?.response?.data?.message || "Gagal memproses pembayaran cash.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Toast toast={toast} />

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tagihan & Pembayaran Siswa</h1>
          <p className="page-subtitle">Monitoring data tagihan paket per sesi dan status pembayaran siswa.</p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={loadData} disabled={loading} suppressHydrationWarning>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
          <button className="btn btn-accent" onClick={() => setShowInputCashModal(true)}>
            + Input Cash Manual
          </button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Tagihan", value: daftarTagihan.length, warna: "#1d4ed8" },
          { label: "Lunas", value: countLunas, warna: "#059669" },
          { label: "Menunggu Konfirmasi", value: countPending, warna: "#b45309" },
          { label: "Belum Bayar", value: countBelumBayar, warna: "#dc2626" },
          { label: "Overdue", value: countOverdue, warna: "#be185d" },
        ].map((k) => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 26, color: k.warna }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Bar Filter & Pencarian */}
      <div className="card">
        <div className="card-body" style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                style={{ paddingLeft: 38, width: "100%" }}
                placeholder="Cari nama siswa, nomor invoice, atau program..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
            </div>
            <select
              className="select-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "9px 12px", fontSize: 13.5 }}
            >
              {daftarStatus.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto" }}>
              {terfilter.length} tagihan ditemukan
            </span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton / Tabel Data */}
      {loading ? (
        <SkeletonTable rows={6} cols={8} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["No. Invoice", "Siswa", "Program", "Sesi Pertemuan", "Nominal Tagihan", "Metode", "Jatuh Tempo", "Status", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terfilter.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff" }}
                  >
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>
                      {t.invoiceCode}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{t.siswa}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>NIS: {t.idSiswa}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{t.program}</td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)", fontWeight: 600 }}>{t.pertemuan}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                      Rp {t.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{t.metode}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{t.tanggalJatuhTempo}</td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        ...warnaStatus[t.status],
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDipilih(t)}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {terfilter.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Belum ada data tagihan
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Tagihan otomatis dibuat saat siswa didaftarkan ke paket program di menu Pendaftaran.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Tagihan */}
      <Modal open={!!dipilih} onClose={() => setDipilih(null)} title="Detail Tagihan Siswa" maxWidth={500}>
        {dipilih && (
          <div>
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontFamily: "monospace", fontSize: 13, color: "var(--color-primary)", fontWeight: 700 }}>
              {dipilih.invoiceCode}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Nama Siswa", value: dipilih.siswa },
                { label: "Program", value: dipilih.program },
                { label: "Tagihan Pertemuan", value: dipilih.pertemuan },
                { label: "Nominal", value: `Rp ${dipilih.jumlah.toLocaleString("id-ID")}` },
                { label: "Metode Bayar", value: dipilih.metode },
                { label: "Jalur Transaksi", value: dipilih.jalur },
                { label: "Jatuh Tempo", value: dipilih.tanggalJatuhTempo },
                { label: "Status", value: dipilih.status },
              ].map((f) => (
                <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border-light)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setDipilih(null)}>Tutup</button>
          </div>
        )}
      </Modal>

      {/* Modal Input Cash Manual */}
      <Modal open={showInputCashModal} onClose={() => setShowInputCashModal(false)} title="Input Pembayaran Cash Manual" maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Pilih Pendaftaran Siswa (Belum Lunas)</label>
            {enrollmentOptions.length > 0 ? (
              <select
                className="select-control"
                style={{ width: "100%" }}
                value={selectedEnrollmentId}
                onChange={(e) => setSelectedEnrollmentId(e.target.value)}
              >
                <option value="">-- Pilih Siswa --</option>
                {enrollmentOptions.map((en) => (
                  <option key={en.id} value={en.id}>
                    {en.label}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", padding: "10px 0" }}>
                Tidak ada tagihan belum lunas saat ini.
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Jumlah Uang Diterima (Rp)</label>
            <input
              className="form-input"
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value))}
              placeholder="100000"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Catatan Kasir (Opsional)</label>
            <input
              className="form-input"
              value={cashNote}
              onChange={(e) => setCashNote(e.target.value)}
              placeholder="Contoh: Diterima tunai oleh Kasir Kantor"
            />
          </div>

          <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#0369a1" }}>
            Pembayaran tunai ini akan langsung dicatat sebagai transaksi <strong>Lunas</strong> dan diverifikasi ke database.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setShowInputCashModal(false)} disabled={submitting}>Batal</button>
            <button className="btn btn-accent" onClick={handleSaveCashManual} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan & Lunaskan"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
