"use client";
import { useState } from "react";

export interface CashVerificationItem {
  id: string;
  invoiceId: string;
  namaOrtu: string;
  namaSiswa: string;
  jumlah: number;
  penerimaKasir: string;
  tglTerima: string;
  catatan: string;
  status: "Menunggu Verifikasi" | "Disetujui / Terverifikasi" | "Ditolak";
}

const initialCashList: CashVerificationItem[] = [
  { id: "CSH-001", invoiceId: "INV-2026-09-004", namaOrtu: "Sari Pratama", namaSiswa: "Dian Pratama", jumlah: 500000, penerimaKasir: "Admin Kasir", tglTerima: "04 Sep 2026, 16:00 WIB", catatan: "Pembayaran tunai SPP Phonics bulan September.", status: "Menunggu Verifikasi" },
  { id: "CSH-002", invoiceId: "INV-2026-08-012", namaOrtu: "Siska Pertiwi", namaSiswa: "Hana Pertiwi", jumlah: 500000, penerimaKasir: "Admin Kasir", tglTerima: "28 Agt 2026, 11:30 WIB", catatan: "Pembayaran cash pendaftaran awal.", status: "Disetujui / Terverifikasi" },
];

export default function AdminVerifikasiCashPage() {
  const [cashList, setCashList] = useState<CashVerificationItem[]>(initialCashList);
  const [selectedCash, setSelectedCash] = useState<CashVerificationItem | null>(null);

  const [showNotification, setShowNotification] = useState(false);

  const handleApprove = (id: string) => {
    setCashList(prev => prev.map(c => c.id === id ? { ...c, status: "Disetujui / Terverifikasi" } : c));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    setSelectedCash(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Verifikasi Pembayaran Cash (Tunai)</h1>
          <p className="page-subtitle">Persetujuan & konfirmasi fisik atas uang tunai yang diterima oleh Kasir / Admin.</p>
        </div>
      </div>

      {/* Notification Toast Inline */}
      {showNotification && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Pembayaran tunai / cash berhasil diverifikasi dan disetujui!
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Menunggu Verifikasi", value: cashList.filter(c => c.status === "Menunggu Verifikasi").length, color: "#b45309", bg: "#fef3c7" },
          { label: "Terverifikasi Bulan Ini", value: cashList.filter(c => c.status === "Disetujui / Terverifikasi").length, color: "#059669", bg: "#d1fae5" },
          { label: "Total Nominal Cash", value: `Rp ${cashList.reduce((a, c) => a + c.jumlah, 0).toLocaleString("id-ID")}`, color: "#1d4ed8", bg: "#dbeafe" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 24, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["ID Receipt", "No. Invoice", "Nama Wali / Siswa", "Nominal Cash", "Penerima Kasir", "Tanggal Terima", "Status", "Verifikasi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cashList.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < cashList.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700 }}>{c.id}</td>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{c.invoiceId}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{c.namaOrtu}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Siswa: {c.namaSiswa}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 900, color: "#059669" }}>
                    Rp {c.jumlah.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>{c.penerimaKasir}</td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{c.tglTerima}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: c.status === "Disetujui / Terverifikasi" ? "#d1fae5" : "#fef3c7",
                      color: c.status === "Disetujui / Terverifikasi" ? "#059669" : "#b45309",
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {c.status === "Menunggu Verifikasi" ? (
                      <button className="btn btn-accent btn-sm" onClick={() => setSelectedCash(c)}>
                        ✓ Verifikasi Uang Cash
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>✓ Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Verifikasi Cash */}
      {selectedCash && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>Konfirmasi Terima Uang Tunai / Cash</h3>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              Pastikan uang tunai sebesar <strong>Rp {selectedCash.jumlah.toLocaleString("id-ID")}</strong> dari <strong>{selectedCash.namaOrtu}</strong> untuk Invoice <strong>{selectedCash.invoiceId}</strong> telah berada di fisik kasir kantor.
            </p>
            <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: 8, fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 10 }}>
              Catatan Kasir: "{selectedCash.catatan}"
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedCash(null)}>Batal</button>
              <button className="btn btn-accent" onClick={() => handleApprove(selectedCash.id)}>✓ Setujui & Verifikasi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
