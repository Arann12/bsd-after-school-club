"use client";
import { useState } from "react";

const daftarOrangTua = [
  { id: "PAR-001", nama: "Budi Setiawan", hp: "081234567890", email: "budi@email.com", anak: ["Andi Setiawan"], totalSiswa: 1, statusTagihan: "Lunas", terdaftar: "12 Jan 2026" },
  { id: "PAR-002", nama: "Joko Santoso", hp: "081987654321", email: "joko@email.com", anak: ["Budi Santoso", "Eko Wijaya"], totalSiswa: 2, statusTagihan: "Lunas", terdaftar: "15 Feb 2026" },
  { id: "PAR-003", nama: "Dewi Kirana", hp: "085678901234", email: "dewi@email.com", anak: ["Citra Kirana"], totalSiswa: 1, statusTagihan: "Lunas", terdaftar: "01 Mar 2026" },
  { id: "PAR-004", nama: "Sari Pratama", hp: "082112233445", email: "sari@email.com", anak: ["Dian Pratama"], totalSiswa: 1, statusTagihan: "Belum Bayar", terdaftar: "10 Apr 2026" },
];

export default function AdminOrangTuaPage() {
  const [cari, setCari] = useState("");
  const terfilter = daftarOrangTua.filter(o =>
    o.nama.toLowerCase().includes(cari.toLowerCase()) ||
    o.hp.includes(cari) ||
    o.anak.some(a => a.toLowerCase().includes(cari.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Data Orang Tua</h1>
          <p className="page-subtitle">Daftar akun orang tua/wali dan anak yang terhubung.</p>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <input className="search-input" style={{ width: "100%" }} placeholder="Cari nama orang tua, no. WA, atau nama anak..." value={cari} onChange={e => setCari(e.target.value)} />
      </div></div>

      {/* Tabel Data Orang Tua */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Wali", "Nama Orang Tua", "No. WhatsApp / Email", "Anak Terhubung", "Status Tagihan", "Tanggal Daftar", "Aksi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {terfilter.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{o.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{o.nama}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                  <div>{o.hp}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{o.email}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {o.anak.map(a => (
                      <span key={a} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{a}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: o.statusTagihan === "Lunas" ? "#d1fae5" : "#fee2e2", color: o.statusTagihan === "Lunas" ? "#059669" : "#dc2626", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                    {o.statusTagihan}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>{o.terdaftar}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => alert(`Hubungi WA ${o.hp}`)}>📱 WA Wali</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
