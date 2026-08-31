"use client";
import { useState } from "react";

const daftarInventaris = [
  { id: "INV-001", nama: "Modul Belajar Calistung L1", kategori: "Buku / Modul", jumlah: 45, kondisi: "Baik", lokasi: "Lemari A1" },
  { id: "INV-002", nama: "Flashcard Angka & Abjad", kategori: "Alat Peraga", jumlah: 20, kondisi: "Baik", lokasi: "Rak B2" },
  { id: "INV-003", nama: "Spidol Whiteboard (Hitam & Biru)", kategori: "ATK", jumlah: 50, kondisi: "Baik", lokasi: "Laci Admin" },
  { id: "INV-004", nama: "Papan Tulis Portable Mini", kategori: "Fasilitas Kelas", jumlah: 12, kondisi: "Perlu Perbaikan", lokasi: "Ruang 2" },
];

export default function AdminInventarisPage() {
  const [items, setItems] = useState(daftarInventaris);
  const [cari, setCari] = useState("");

  const terfilter = items.filter(i => i.nama.toLowerCase().includes(cari.toLowerCase()) || i.kategori.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventaris & Barang</h1>
          <p className="page-subtitle">Pencatatan dan pengelolaan perlengkapan modul & fasilitas kelas.</p>
        </div>
        <button className="btn btn-accent" onClick={() => alert("Form tambah barang inventaris...")}>+ Tambah Barang</button>
      </div>

      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <input className="search-input" style={{ width: "100%" }} placeholder="Cari nama barang, kategori, atau lokasi..." value={cari} onChange={e => setCari(e.target.value)} />
      </div></div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Barang", "Nama Barang", "Kategori", "Jumlah", "Kondisi", "Lokasi Storage"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {terfilter.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{item.nama}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{item.kategori}</td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{item.jumlah} unit</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: item.kondisi === "Baik" ? "#d1fae5" : "#fef3c7", color: item.kondisi === "Baik" ? "#059669" : "#b45309", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{item.kondisi}</span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>{item.lokasi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
