"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [gateway, setGateway] = useState("Midtrans");
  const [timingTagihan, setTimingTagihan] = useState("Sebelum Sesi");
  const [sesiHangus, setSesiHangus] = useState("Berlaku untuk Kelas Grup");
  const [tersimpan, setTersimpan] = useState(false);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Sistem & Operasional</h1>
          <p className="page-subtitle">Konfigurasi parameter bisnis dan integrasi payment gateway (Section 8 PRD).</p>
        </div>
      </div>

      <form onSubmit={handleSimpan} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>1. Provider Payment Gateway</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Gateway Aktif</label>
            <select className="form-input" value={gateway} onChange={e => setGateway(e.target.value)}>
              <option>Midtrans (VA, QRIS, GoPay, ShopeePay)</option>
              <option>Xendit (Multi VA & E-Wallet)</option>
              <option>Tripay (Virtual Account & Convenience Store)</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>2. Aturan Tagihan & Kebijakan Pertemuan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Waktu Pemicu Tagihan SPP</label>
              <select className="form-input" value={timingTagihan} onChange={e => setTimingTagihan(e.target.value)}>
                <option>Sebelum Sesi (Pre-paid)</option>
                <option>Setelah Sesi Selesai (Post-paid)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Aturan Sesi Hangus / Absen</label>
              <select className="form-input" value={sesiHangus} onChange={e => setSesiHangus(e.target.value)}>
                <option>Berlaku untuk Kelas Grup (No Reschedule)</option>
                <option>Bisa Reschedule Maskimal 2 Kali</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-accent" style={{ padding: 14, fontSize: 15 }}>
          {tersimpan ? "✅ Pengaturan Berhasil Disimpan!" : "💾 Simpan Konfigurasi Sistem"}
        </button>
      </form>
    </div>
  );
}
