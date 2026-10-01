"use client";

import { useState, useEffect, useCallback } from "react";
import { getPayments } from "@/lib/api/finance";
import { SkeletonTable } from "@/components/ui/Skeleton";

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  namaOrtu: string;
  namaSiswa: string;
  jumlah: number;
  metode: string;
  tglBayar: string;
  status: "Berhasil" | "Menunggu Verifikasi Cash" | "Gagal" | string;
  buktiUrl?: string;
}

export default function FinancePembayaranPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMetode, setFilterMetode] = useState("Semua");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPayments({ per_page: 100 });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];

      const mapped: PaymentRecord[] = rawList.map((p: any) => {
        const student = p.student || p.enrollment?.student || p.payment_plan?.enrollment?.student;
        const parent = student?.parent || p.parent;
        const studentName = student?.name || student?.full_name || "Siswa";
        const parentName = parent?.name || parent?.full_name || "Orang Tua";

        let metodeDisplay = p.payment_method || p.provider || "Digital";
        if (p.payment_channel) {
          metodeDisplay = `${p.payment_method?.toUpperCase()} (${p.payment_channel?.toUpperCase()})`;
        } else if (metodeDisplay.toLowerCase() === "cash") {
          metodeDisplay = "Cash / Tunai";
        } else if (metodeDisplay.toLowerCase() === "va") {
          metodeDisplay = "Virtual Account";
        } else if (metodeDisplay.toLowerCase() === "qris") {
          metodeDisplay = "QRIS";
        }

        let statusDisplay = "Berhasil";
        const rawStatus = (p.status || "").toLowerCase();
        if (rawStatus === "paid" || rawStatus === "settlement" || rawStatus === "success" || rawStatus === "berhasil") {
          statusDisplay = "Berhasil";
        } else if (rawStatus.includes("menunggu") || rawStatus === "pending") {
          statusDisplay = "Menunggu Verifikasi Cash";
        } else {
          statusDisplay = p.status || "Pending";
        }

        const dateStr = p.paid_at || p.created_at;
        const formattedDate = dateStr
          ? new Date(dateStr).toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB"
          : "-";

        return {
          id: p.payment_code || p.reference_number || p.id?.substring(0, 8).toUpperCase() || "PAY-001",
          invoiceId: p.payment_plan?.plan_code || p.invoice_number || `INV-${p.id?.substring(0, 6).toUpperCase()}`,
          namaOrtu: parentName,
          namaSiswa: studentName,
          jumlah: Number(p.amount || p.total_amount || 0),
          metode: metodeDisplay,
          tglBayar: formattedDate,
          status: statusDisplay,
        };
      });

      setPayments(mapped);
    } catch (err) {
      console.warn("Gagal memuat daftar pembayaran:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.namaOrtu.toLowerCase().includes(search.toLowerCase()) ||
      p.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(search.toLowerCase());
    const matchMetode =
      filterMetode === "Semua" || p.metode.toLowerCase().includes(filterMetode.toLowerCase());
    return matchSearch && matchMetode;
  });

  const totalBerhasil = payments.filter((p) => p.status === "Berhasil").reduce((a, p) => a + p.jumlah, 0);
  const countBerhasil = payments.filter((p) => p.status === "Berhasil").length;
  const countPending = payments.filter((p) => p.status === "Menunggu Verifikasi Cash").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Pembayaran</h1>
          <p className="page-subtitle">Daftar transaksi masuk, metode pembayaran (VA, QRIS, Transfer, Cash), dan kwitansi pembayaran.</p>
        </div>
      </div>

      {/* Info Banner Aturan ACC */}
      <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 18px", color: "#166534", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          <strong>Aturan ACC Sistem:</strong> Pembayaran selain Cash (VA BCA, QRIS, Transfer, E-Wallet) <strong>terverifikasi OTOMATIS LUNAS</strong> secara langsung. ACC manual hanya dilakukan untuk pembayaran <strong>Cash / Tunai</strong> pada menu Verifikasi Cash.
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Pembayaran Masuk", value: `Rp ${totalBerhasil.toLocaleString("id-ID")}`, color: "#059669" },
          { label: "Transaksi Berhasil", value: countBerhasil, color: "#1d4ed8" },
          { label: "Pending Cash", value: countPending, color: "#b45309" },
        ].map((c) => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: c.color }}>
              {loading ? "..." : c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                style={{ paddingLeft: 38, width: "100%" }}
                placeholder="Cari ID transaksi, nama ortu, siswa, invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select-control"
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              <option value="Semua">Semua Metode Pembayaran</option>
              <option value="Virtual">Virtual Account (VA)</option>
              <option value="QRIS">QRIS</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Cash">Cash / Tunai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonTable rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
            Belum ada transaksi pembayaran yang tercatat dalam sistem.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ID Transaksi", "No. Tagihan / Ref", "Orang Tua & Siswa", "Jumlah Pembayaran", "Metode", "Waktu Transaksi", "Status", "Kwitansi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id + i} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-text-muted)" }}>{p.id}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-primary)", fontWeight: 700 }}>{p.invoiceId}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{p.namaOrtu}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Siswa: {p.namaSiswa}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 900, color: "#059669" }}>
                      Rp {p.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>{p.metode}</span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{p.tglBayar}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: p.status === "Berhasil" ? "#d1fae5" : "#fef3c7",
                          color: p.status === "Berhasil" ? "#059669" : "#b45309",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
                        Kwitansi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
