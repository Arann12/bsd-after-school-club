"use client";
import { useState } from "react";

export default function SettingsPage() {
  // Section 1: Payment Gateway
  const [gateway, setGateway] = useState("Midtrans");
  // Section 2: Tagihan & Sesi
  const [timingTagihan, setTimingTagihan] = useState("Sebelum Sesi");
  const [sesiHangus, setSesiHangus] = useState("Berlaku untuk Kelas Grup");
  // Section 3: Honor Guru
  const [pembulatanHonor, setPembulatanHonor] = useState("Pembulatan ke bawah per 30 menit");
  const [kasusOvertime, setKasusOvertime] = useState("Tidak dihitung");
  const [kompBonus, setKompBonus] = useState("Input manual Owner per periode");
  // Section 4: Nilai Akhir & Sertifikat
  const [bobotTugas, setBobotTugas] = useState("40");
  const [bobotUjian, setBobotUjian] = useState("60");
  const [nilaiMinLulus, setNilaiMinLulus] = useState("70");
  const [verifierSertifikat, setVerifierSertifikat] = useState("Owner/Admin");
  const [templateSertifikat, setTemplateSertifikat] = useState("Satu template global");
  // Section 5: Cash & Approval
  const [batasCashOwner, setBatasCashOwner] = useState("500000");
  // Section 6: QRIS & MDR
  const [kategoriMerchant, setKategoriMerchant] = useState("Reguler (MDR 0.7%)");
  // Section 7: Backup
  const [frekBackup, setFrekBackup] = useState("Harian otomatis (00:00 WIB)");

  const [tersimpan, setTersimpan] = useState(false);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Sistem</h1>
          <p className="page-subtitle">Konfigurasi semua parameter bisnis yang dapat diubah Owner. Tidak ada nilai yang di-hardcode.</p>
        </div>
      </div>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-lg)", padding: "12px 18px", fontSize: 13, color: "#1e40af" }}>
        <strong>Akses Eksklusif Owner.</strong> Semua perubahan di halaman ini berdampak langsung pada perhitungan honor, tagihan, dan sertifikasi siswa.
      </div>

      <form onSubmit={handleSimpan} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* 1. Payment Gateway */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>1. Provider Payment Gateway</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Gateway Aktif</label>
            <select className="form-input" value={gateway} onChange={e => setGateway(e.target.value)}>
              <option>Midtrans (VA, QRIS, GoPay, ShopeePay)</option>
              <option>Xendit (Multi VA & E-Wallet)</option>
              <option>Tripay (Virtual Account & Convenience Store)</option>
              <option>Manual — Tidak ada payment gateway (cash only)</option>
            </select>
          </div>
        </div>

        {/* 2. Aturan Tagihan & Pertemuan */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>2. Aturan Tagihan & Pertemuan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Waktu Pemicu Tagihan</label>
              <select className="form-input" value={timingTagihan} onChange={e => setTimingTagihan(e.target.value)}>
                <option>Sebelum Sesi (Pre-paid)</option>
                <option>Setelah Sesi Selesai (Post-paid)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Aturan Sesi Hangus / Absen</label>
              <select className="form-input" value={sesiHangus} onChange={e => setSesiHangus(e.target.value)}>
                <option>Berlaku untuk Kelas Grup (No Reschedule)</option>
                <option>Bisa Reschedule Maksimal 1 Kali</option>
                <option>Bisa Reschedule Maksimal 2 Kali</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Honor Guru */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>3. Formula Honor Guru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pembulatan Durasi</label>
              <select className="form-input" value={pembulatanHonor} onChange={e => setPembulatanHonor(e.target.value)}>
                <option>Pembulatan ke bawah per 30 menit</option>
                <option>Pembulatan ke atas per 30 menit</option>
                <option>Perhitungan menit penuh (tanpa pembulatan)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Overtime (melebihi durasi sesi)</label>
              <select className="form-input" value={kasusOvertime} onChange={e => setKasusOvertime(e.target.value)}>
                <option>Tidak dihitung</option>
                <option>Dihitung dengan tarif normal</option>
                <option>Dihitung dengan tarif 1.5×</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Komponen Bonus</label>
              <select className="form-input" value={kompBonus} onChange={e => setKompBonus(e.target.value)}>
                <option>Input manual Owner per periode</option>
                <option>Tidak ada komponen bonus</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Nilai Akhir & Sertifikat */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>4. Formula Nilai Akhir & Sertifikat</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bobot Tugas (%)</label>
              <input className="form-input" type="number" min={0} max={100} value={bobotTugas} onChange={e => setBobotTugas(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bobot Ujian (%)</label>
              <input className="form-input" type="number" min={0} max={100} value={bobotUjian} onChange={e => setBobotUjian(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nilai Minimum Lulus</label>
              <input className="form-input" type="number" min={0} max={100} value={nilaiMinLulus} onChange={e => setNilaiMinLulus(e.target.value)} />
            </div>
          </div>
          {parseInt(bobotTugas) + parseInt(bobotUjian) !== 100 && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: 12.5, color: "#991b1b", marginBottom: 16 }}>
              Total bobot harus 100%. Saat ini: {parseInt(bobotTugas||"0") + parseInt(bobotUjian||"0")}%
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Verifier Sertifikat</label>
              <select className="form-input" value={verifierSertifikat} onChange={e => setVerifierSertifikat(e.target.value)}>
                <option>Owner/Admin</option>
                <option>Hanya Owner</option>
                <option>Admin (tanpa perlu Owner)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Template Sertifikat</label>
              <select className="form-input" value={templateSertifikat} onChange={e => setTemplateSertifikat(e.target.value)}>
                <option>Satu template global</option>
                <option>Template berbeda per program</option>
                <option>Template berbeda per program dan level</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Cash & Approval */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>5. Kebijakan Cash & Approval</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Batas Nominal Cash — Perlu Approval Owner (Rp)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input className="form-input" type="number" min={0} value={batasCashOwner} onChange={e => setBatasCashOwner(e.target.value)}
                style={{ maxWidth: 240 }} />
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Cash di bawah Rp {parseInt(batasCashOwner||"0").toLocaleString("id")} cukup dikonfirmasi Admin
              </span>
            </div>
          </div>
        </div>

        {/* 6. QRIS & MDR */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>6. Kategori Merchant QRIS & MDR</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Kategori Merchant QRIS</label>
            <select className="form-input" value={kategoriMerchant} onChange={e => setKategoriMerchant(e.target.value)}>
              <option>Reguler (MDR 0.7%)</option>
              <option>Pendidikan / Nirlaba (MDR 0%)</option>
              <option>UMK (MDR 0.3%)</option>
            </select>
          </div>
        </div>

        {/* 7. Backup */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>7. Backup Data</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Frekuensi Backup Otomatis</label>
            <select className="form-input" value={frekBackup} onChange={e => setFrekBackup(e.target.value)}>
              <option>Harian otomatis (00:00 WIB)</option>
              <option>Mingguan (setiap Minggu 00:00 WIB)</option>
              <option>Manual saja</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-accent" style={{ padding: 14, fontSize: 15 }}>
          {tersimpan ? "Pengaturan Berhasil Disimpan!" : "Simpan Semua Konfigurasi"}
        </button>
      </form>
    </div>
  );
}
