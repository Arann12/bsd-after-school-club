"use client";
import { useState } from "react";

const daftarGuru = [
  { id: "GUR-2026-001", nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", hp: "081299887766", email: "sarah@bsdclub.com", jamBulanIni: 18, status: "Aktif" },
  { id: "GUR-2026-002", nama: "Mr. Andi", spesialisasi: "English B1 & B2", hp: "081388776655", email: "andi@bsdclub.com", jamBulanIni: 14, status: "Aktif" },
  { id: "GUR-2026-003", nama: "Ms. Nina", spesialisasi: "Math Advance", hp: "081477665544", email: "nina@bsdclub.com", jamBulanIni: 12, status: "Aktif" },
  { id: "GUR-2026-004", nama: "Mr. Budi", spesialisasi: "Coding & Robotics", hp: "081566554433", email: "budi@bsdclub.com", jamBulanIni: 8, status: "Aktif" },
];

export default function AdminGuruPage() {
  const [cari, setCari] = useState("");
  const terfilter = daftarGuru.filter(g => g.nama.toLowerCase().includes(cari.toLowerCase()) || g.spesialisasi.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Guru & Staff Pengajar</h1>
          <p className="page-subtitle">Daftar tenaga pengajar, spesialisasi program, dan jam mengajar.</p>
        </div>
        <button className="btn btn-accent" onClick={() => alert("Form tambah guru baru...")}>+ Tambah Guru Baru</button>
      </div>

      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <input className="search-input" style={{ width: "100%" }} placeholder="Cari nama guru atau spesialisasi..." value={cari} onChange={e => setCari(e.target.value)} />
      </div></div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Guru", "Nama Pengajar", "Spesialisasi Program", "Kontak / Email", "Jam Mengajar Bulan Ini", "Status", "Aksi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {terfilter.map((g, i) => (
              <tr key={g.id} style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{g.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{g.nama}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{g.spesialisasi}</td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                  <div>{g.hp}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{g.email}</div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{g.jamBulanIni} Jam</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{g.status}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => alert(`Hubungi WA ${g.hp}`)}>📱 Hubungi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
