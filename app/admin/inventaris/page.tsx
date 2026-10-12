"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/api/operational";
import { SkeletonTable } from "@/components/ui/Skeleton";

export interface ItemInventaris {
  id: string;
  inventory_code: string;
  nama: string;
  kategori: string;
  jumlah: number;
  kondisi: string;
  lokasi: string;
  hargaSatuan: number;
  tglPengadaan: string;
  status: string;
}

export default function AdminInventarisPage() {
  const [items, setItems] = useState<ItemInventaris[]>([]);
  const [loading, setLoading] = useState(true);
  const [cari, setCari] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemInventaris | null>(null);

  // Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemInventaris | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Buku / Modul",
    quantity: 1,
    purchase_price: 0,
    purchase_date: new Date().toISOString().split("T")[0],
    condition: "Baik",
    location: "Ruang Kelas 1",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventory({ per_page: 100 });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];

      const mapped: ItemInventaris[] = rawList.map((item: any) => ({
        id: item.id,
        inventory_code: item.inventory_code || `INV-${item.id?.substring(0, 4).toUpperCase()}`,
        nama: item.name || item.nama || "Barang",
        kategori: item.category || item.kategori || "Umum",
        jumlah: Number(item.quantity || item.jumlah || 0),
        kondisi: item.condition || item.kondisi || "Baik",
        lokasi: item.location || item.lokasi || "Gudang",
        hargaSatuan: Number(item.purchase_price || item.harga_satuan || 0),
        tglPengadaan: item.purchase_date || item.tgl_pengadaan || "-",
        status: item.status || "available",
      }));

      setItems(mapped);
    } catch (err) {
      console.warn("Gagal memuat daftar inventaris:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Buku / Modul",
      quantity: 1,
      purchase_price: 25000,
      purchase_date: new Date().toISOString().split("T")[0],
      condition: "Baik",
      location: "Ruang Kelas 1",
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: ItemInventaris) => {
    setEditingItem(item);
    setFormData({
      name: item.nama,
      category: item.kategori,
      quantity: item.jumlah,
      purchase_price: item.hargaSatuan,
      purchase_date: item.tglPengadaan !== "-" ? item.tglPengadaan : new Date().toISOString().split("T")[0],
      condition: item.kondisi,
      location: item.lokasi,
    });
    setSelectedItem(null);
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, {
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          purchase_price: formData.purchase_price,
          purchase_date: formData.purchase_date,
          condition: formData.condition,
          location: formData.location,
        } as any);
      } else {
        await createInventoryItem({
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          purchase_price: formData.purchase_price,
          purchase_date: formData.purchase_date,
          condition: formData.condition,
          location: formData.location,
        } as any);
      }
      setShowFormModal(false);
      await fetchItems();
    } catch (err) {
      console.error("Gagal simpan inventaris:", err);
      alert("Gagal menyimpan barang inventaris.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus barang inventaris ini?")) return;
    try {
      await deleteInventoryItem(id);
      setSelectedItem(null);
      await fetchItems();
    } catch (err) {
      console.error("Gagal menghapus inventaris:", err);
      alert("Gagal menghapus barang inventaris.");
    }
  };

  const terfilter = items.filter(
    (i) =>
      i.nama.toLowerCase().includes(cari.toLowerCase()) ||
      i.kategori.toLowerCase().includes(cari.toLowerCase()) ||
      i.inventory_code.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventaris & Barang</h1>
          <p className="page-subtitle">Pencatatan, detail barang, dan pengelolaan perlengkapan modul & fasilitas kelas.</p>
        </div>
        <button className="btn btn-accent" onClick={handleOpenAdd}>
          + Tambah Barang
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="card">
        <div className="card-body" style={{ padding: "12px 20px" }}>
          <input
            className="search-input"
            style={{ width: "100%" }}
            placeholder="Cari nama barang, kategori, nomor inventaris, atau lokasi..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Inventaris */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonTable rows={5} />
          </div>
        ) : terfilter.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
            Belum ada barang inventaris yang tercatat. Silakan klik <strong>+ Tambah Barang</strong>.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["Kode Barang", "Nama Barang", "Kategori", "Jumlah", "Kondisi", "Lokasi Storage", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terfilter.map((item, i) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none", cursor: "pointer" }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {item.inventory_code}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>
                      {item.nama}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      {item.kategori}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>
                      {item.jumlah} unit
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: item.kondisi === "Baik" ? "#d1fae5" : "#fef3c7",
                          color: item.kondisi === "Baik" ? "#059669" : "#b45309",
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {item.kondisi}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>
                      {item.lokasi}
                    </td>
                    <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedItem(item)}>
                          Detail
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(item)}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL BARANG INVENTARIS */}
      {selectedItem && (
        <Modal open onClose={() => setSelectedItem(null)} title="Detail Barang Inventaris" maxWidth={540}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <span style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                {selectedItem.inventory_code}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: "6px 0 0" }}>
                {selectedItem.nama}
              </h2>
            </div>

            {/* Box Rincian Nilai */}
            <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, border: "1px solid var(--color-border)" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Jumlah Stok</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)", marginTop: 2 }}>{selectedItem.jumlah} Unit</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Harga Satuan</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 2 }}>Rp {Math.round(selectedItem.hargaSatuan).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Nilai Aset</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#2563eb", marginTop: 2 }}>Rp {Math.round(selectedItem.jumlah * selectedItem.hargaSatuan).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            {/* Grid Metadata */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Kategori Barang</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedItem.kategori}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Lokasi Penyimpanan</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedItem.lokasi}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Kondisi</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: selectedItem.kondisi === "Baik" ? "#059669" : "#b45309" }}>{selectedItem.kondisi}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Tanggal Pengadaan</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedItem.tglPengadaan}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>
                Hapus Barang
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItem(null)}>
                  Tutup
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => handleOpenEdit(selectedItem)}>
                  Edit Barang
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL FORM TAMBAH / EDIT INVENTARIS */}
      {showFormModal && (
        <Modal open onClose={() => setShowFormModal(false)} title={editingItem ? "Edit Barang Inventaris" : "Tambah Barang Inventaris"} maxWidth={500}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Nama Barang</label>
              <input
                type="text"
                required
                className="input-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Modul Calistung Level 1"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Kategori</label>
                <select
                  className="select-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
                >
                  <option value="Buku / Modul">Buku / Modul</option>
                  <option value="Alat Peraga">Alat Peraga</option>
                  <option value="ATK">ATK</option>
                  <option value="Fasilitas Kelas">Fasilitas Kelas</option>
                  <option value="Elektronik">Elektronik</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Jumlah Unit</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="input-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Harga Satuan (Rp)</label>
                <input
                  type="number"
                  min={0}
                  className="input-control"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Kondisi</label>
                <select
                  className="select-control"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
                >
                  <option value="Baik">Baik</option>
                  <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Lokasi Penyimpanan</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Rak B2"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Tanggal Pengadaan</label>
                <input
                  type="date"
                  className="input-control"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowFormModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Barang"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
