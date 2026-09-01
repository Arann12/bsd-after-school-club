"use client";
import { useState } from "react";

export interface ItemInventaris {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  kondisi: string;
  lokasi: string;
  hargaSatuan: number;
  tglPengadaan: string;
  noSerial: string;
  keterangan: string;
  pjBarang: string;
}

const daftarInventaris: ItemInventaris[] = [
  { id: "INV-001", nama: "Modul Belajar Calistung L1", kategori: "Buku / Modul", jumlah: 45, kondisi: "Baik", lokasi: "Lemari A1", hargaSatuan: 25000, tglPengadaan: "15 Jan 2026", noSerial: "MOD-CAL-001", keterangan: "Modul cetak kertas HVS 80gr full color untuk siswa kelas Calistung Level 1.", pjBarang: "Admin Front Office" },
  { id: "INV-002", nama: "Flashcard Angka & Abjad", kategori: "Alat Peraga", jumlah: 20, kondisi: "Baik", lokasi: "Rak B2", hargaSatuan: 45000, tglPengadaan: "10 Feb 2026", noSerial: "FCD-NUM-002", keterangan: "Kartu ilustrasi edukatif terlaminasi anti air.", pjBarang: "Ms. Sarah" },
  { id: "INV-003", nama: "Spidol Whiteboard (Hitam & Biru)", kategori: "ATK", jumlah: 50, kondisi: "Baik", lokasi: "Laci Admin", hargaSatuan: 8500, tglPengadaan: "01 Agt 2026", noSerial: "ATK-SPD-003", keterangan: "Stok spidol isi ulang papan tulis kelas.", pjBarang: "Admin Front Office" },
  { id: "INV-004", nama: "Papan Tulis Portable Mini", kategori: "Fasilitas Kelas", jumlah: 12, kondisi: "Perlu Perbaikan", lokasi: "Ruang 2", hargaSatuan: 150000, tglPengadaan: "20 Des 2025", noSerial: "FAS-BRD-004", keterangan: "Papan magnetik portable 60x40 cm, 2 unit engsel perlu pengetatan.", pjBarang: "Mr. Andi" },
];

export default function AdminInventarisPage() {
  const [items, setItems] = useState<ItemInventaris[]>(daftarInventaris);
  const [cari, setCari] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemInventaris | null>(null);

  const terfilter = items.filter(i => i.nama.toLowerCase().includes(cari.toLowerCase()) || i.kategori.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventaris & Barang</h1>
          <p className="page-subtitle">Pencatatan, detail barang, dan pengelolaan perlengkapan modul & fasilitas kelas.</p>
        </div>
        <button className="btn btn-accent" onClick={() => alert("Form tambah barang inventaris baru...")}>+ Tambah Barang</button>
      </div>

      {/* Bar Pencarian */}
      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <input className="search-input" style={{ width: "100%" }} placeholder="Cari nama barang, kategori, atau lokasi..." value={cari} onChange={e => setCari(e.target.value)} />
      </div></div>

      {/* Tabel Inventaris */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Barang", "Nama Barang", "Kategori", "Jumlah", "Kondisi", "Lokasi Storage", "Aksi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {terfilter.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none", cursor: "pointer" }} onClick={() => setSelectedItem(item)}>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{item.nama}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{item.kategori}</td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{item.jumlah} unit</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: item.kondisi === "Baik" ? "#d1fae5" : "#fef3c7", color: item.kondisi === "Baik" ? "#059669" : "#b45309", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{item.kondisi}</span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>{item.lokasi}</td>
                <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedItem(item)}>Detail Barang</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL BARANG INVENTARIS (Requirement #5) */}
      {selectedItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 540, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <span style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                  {selectedItem.id}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: "4px 0 0" }}>{selectedItem.nama}</h2>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Box Rincian Nilai */}
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, border: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Jumlah Stok</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)", marginTop: 2 }}>{selectedItem.jumlah} Unit</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Harga Satuan</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 2 }}>Rp {selectedItem.hargaSatuan.toLocaleString("id")}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Aset</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2563eb", marginTop: 2 }}>Rp {(selectedItem.jumlah * selectedItem.hargaSatuan).toLocaleString("id")}</div>
                </div>
              </div>

              {/* Grid Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Nomor Serial / SKU</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{selectedItem.noSerial}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Lokasi Penyimpanan</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedItem.lokasi}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Tanggal Pengadaan</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedItem.tglPengadaan}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Penanggung Jawab</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedItem.pjBarang}</div>
                </div>
              </div>

              {/* Catatan Keterangan Deskripsi */}
              <div style={{ background: "var(--color-bg)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Spesifikasi & Keterangan Kondisi</div>
                <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{selectedItem.keterangan}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedItem(null)}>Tutup</button>
                <button className="btn btn-accent" onClick={() => alert("Form edit barang inventaris...")}>Edit Barang</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
