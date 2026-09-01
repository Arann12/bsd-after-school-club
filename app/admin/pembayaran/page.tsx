"use client";
import { useState } from "react";

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  namaOrtu: string;
  namaSiswa: string;
  jumlah: number;
  metode: "VA BCA" | "QRIS" | "Transfer Mandiri" | "Cash / Tunai";
  tglBayar: string;
  status: "Berhasil" | "Menunggu Verifikasi Cash" | "Gagal";
  buktiUrl?: string;
}

const initialPayments: PaymentRecord[] = [
  { id: "PAY-2026-001", invoiceId: "INV-2026-09-001", namaOrtu: "Budi Setiawan", namaSiswa: "Andi Setiawan", jumlah: 600000, metode: "VA BCA", tglBayar: "02 Sep 2026, 10:15 WIB", status: "Berhasil" },
  { id: "PAY-2026-002", invoiceId: "INV-2026-09-002", namaOrtu: "Joko Santoso", namaSiswa: "Budi Santoso", jumlah: 1200000, metode: "QRIS", tglBayar: "03 Sep 2026, 14:20 WIB", status: "Berhasil" },
  { id: "PAY-2026-003", invoiceId: "INV-2026-09-003", namaOrtu: "Dewi Kirana", namaSiswa: "Citra Kirana", jumlah: 720000, metode: "Transfer Mandiri", tglBayar: "04 Sep 2026, 09:05 WIB", status: "Berhasil" },
  { id: "PAY-2026-004", invoiceId: "INV-2026-09-004", namaOrtu: "Sari Pratama", namaSiswa: "Dian Pratama", jumlah: 500000, metode: "Cash / Tunai", tglBayar: "04 Sep 2026, 16:00 WIB", status: "Menunggu Verifikasi Cash" },
];

export default function FinancePembayaranPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [filterMetode, setFilterMetode] = useState("Semua");

  const filtered = payments.filter(p => {
    const matchSearch = p.namaOrtu.toLowerCase().includes(search.toLowerCase()) ||
      p.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(search.toLowerCase());
    const matchMetode = filterMetode === "Semua" || p.metode === filterMetode;
    return matchSearch && matchMetode;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Pembayaran</h1>
          <p className="page-subtitle">Daftar transaksi masuk, metode pembayaran (VA, QRIS, Transfer, Cash), dan kwitansi pembayaran.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Pembayaran Masuk", value: `Rp ${payments.filter(p => p.status === "Berhasil").reduce((a, p) => a + p.jumlah, 0).toLocaleString("id-ID")}`, color: "#059669", bg: "#d1fae5" },
          { label: "Transaksi Berhasil", value: payments.filter(p => p.status === "Berhasil").length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Pending Cash", value: payments.filter(p => p.status === "Menunggu Verifikasi Cash").length, color: "#b45309", bg: "#fef3c7" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="search-input" style={{ paddingLeft: 38, width: "100%" }} placeholder="Cari ID transaksi, nama ortu, siswa, invoice..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select-control" value={filterMetode} onChange={e => setFilterMetode(e.target.value)} style={{ padding: "8px 14px", fontSize: 13 }}>
              <option value="Semua">Semua Metode Pembayaran</option>
              <option value="VA BCA">VA BCA</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer Mandiri">Transfer Mandiri</option>
              <option value="Cash / Tunai">Cash / Tunai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["ID Transaksi", "No. Invoice", "Orang Tua & Siswa", "Jumlah Pembayaran", "Metode", "Waktu Transaksi", "Status", "Kwitansi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
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
                    <span style={{
                      background: p.status === "Berhasil" ? "#d1fae5" : "#fef3c7",
                      color: p.status === "Berhasil" ? "#059669" : "#b45309",
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
                    }}>
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
      </div>
    </div>
  );
}
