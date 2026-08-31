"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrangTuaPembayaranPage() {
  const router = useRouter();

  // Child Dropdown Switcher state
  const [selectedChild, setSelectedChild] = useState({
    name: "Merta",
    program: "Phonics Level 2",
    avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100&auto=format&fit=crop&q=80",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Payment Mode: 'pertemuan' (Rp 100k) or 'paket' (Rp 300k)
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"pertemuan" | "paket">("pertemuan");
  
  // Modal Workflow State: null (closed), 'select_method', 'pay_details', 'waiting_confirmation'
  const [modalStep, setModalStep] = useState<null | "select_method" | "pay_details" | "waiting_confirmation">(null);
  
  // Selected Payment Method: 'va' | 'ewallet' | 'qris' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState<"va" | "ewallet" | "qris" | "cash">("va");
  
  // Specific Sub-options
  const [selectedBank, setSelectedBank] = useState<"BCA" | "BNI" | "Mandiri" | "BRI">("BCA");
  const [selectedEwallet, setSelectedEwallet] = useState<"GoPay" | "OVO" | "Dana" | "ShopeePay">("GoPay");
  const [phoneNumber, setPhoneNumber] = useState("081234567890");
  
  // Copy to clipboard notification state
  const [copied, setCopied] = useState<string | null>(null);
  
  // Accordion state for Cara Pembayaran
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Dynamic values depending on mode
  const billAmount = selectedPaymentMode === "pertemuan" ? 100000 : 300000;
  const billBreakdown = selectedPaymentMode === "pertemuan" 
    ? [
        { label: "Pertemuan 7", amount: "Rp 50.000" },
        { label: "Pertemuan 8", amount: "Rp 50.000" },
      ]
    : [
        { label: "Sisa Pertemuan (7-12)", amount: "6 x Rp 50.000" },
      ];

  const handleOpenPayment = (mode: "pertemuan" | "paket") => {
    setSelectedPaymentMode(mode);
    setModalStep("select_method");
    setCopied(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCheckStatus = () => {
    const invoiceId = "INV-2024-0803";
    const statusQuery = paymentMethod === "cash" ? "pending" : "success";
    router.push(`/orang-tua/pembayaran/status?id=${invoiceId}&method=${paymentMethod}&mode=${selectedPaymentMode}&status=${statusQuery}`);
  };

  return (
    <div className="space-y-6 text-[#191c1e] bg-[#f7f9fc] min-h-screen p-2 sm:p-4">
      {/* ── HEADER & CHILD SELECTOR ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005474] tracking-tight">Pembayaran</h1>
          <p className="text-xs sm:text-sm text-[#70787e]">Kelola tagihan, sisa pertemuan, dan riwayat transaksi anak</p>
        </div>

        {/* Child Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between gap-3 bg-white border-2 border-[#1f6d91] rounded-xl px-4 py-2.5 shadow-sm hover:shadow transition-all text-left min-w-[240px]"
          >
            <div>
              <p className="text-[11px] font-semibold text-[#70787e] uppercase tracking-wider">Anak yang Dipilih:</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-[#1f6d91] text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedChild.name[0]}
                </div>
                <span className="text-sm font-bold text-[#1f6d91]">{selectedChild.name}</span>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#1f6d91] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full bg-white border border-[#c0c7ce]/40 rounded-xl shadow-lg z-50 p-2 space-y-1">
              <button
                onClick={() => {
                  setSelectedChild({
                    name: "Merta",
                    program: "Phonics Level 2",
                    avatar: "",
                  });
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-bold transition-colors ${
                  selectedChild.name === "Merta" ? "bg-[#1f6d91]/10 text-[#1f6d91]" : "hover:bg-slate-100 text-[#191c1e]"
                }`}
              >
                <span>Merta (Phonics Level 2)</span>
                {selectedChild.name === "Merta" && (
                  <svg className="w-4 h-4 text-[#1f6d91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedChild({
                    name: "Siti",
                    program: "Calistung Level 1",
                    avatar: "",
                  });
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-bold transition-colors ${
                  selectedChild.name === "Siti" ? "bg-[#1f6d91]/10 text-[#1f6d91]" : "hover:bg-slate-100 text-[#191c1e]"
                }`}
              >
                <span>Siti (Calistung Level 1)</span>
                {selectedChild.name === "Siti" && (
                  <svg className="w-4 h-4 text-[#1f6d91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── BENTO SUMMARY CARDS ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Tagihan Tertunda */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#c0c7ce]/30 flex flex-col justify-between">
          <p className="text-xs font-bold text-[#70787e] uppercase tracking-wider">Total Tagihan Tertunda</p>
          <div className="my-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ba1a1a]">Rp 150.000</h3>
            <p className="text-xs text-[#70787e] mt-1 font-medium">1 Tagihan belum dibayar</p>
          </div>
          <div className="w-full bg-[#ffdad6] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#ba1a1a] h-full w-2/3 rounded-full" />
          </div>
        </div>

        {/* Card 2: Progress Pertemuan */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#c0c7ce]/30 flex flex-col justify-between">
          <p className="text-xs font-bold text-[#70787e] uppercase tracking-wider">Progress Pertemuan</p>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#191c1e]">6</span>
              <span className="text-base font-semibold text-[#70787e]">/ 12 Pertemuan</span>
            </div>
            <p className="text-xs text-[#70787e] mt-1 font-medium">50% Selesai dari Total Paket</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#1f6d91] h-full w-1/2 rounded-full transition-all duration-500" />
          </div>
        </div>

        {/* Card 3: Status Pembayaran Terakhir */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#c0c7ce]/30 flex flex-col justify-between">
          <p className="text-xs font-bold text-[#70787e] uppercase tracking-wider">Status Pembayaran Terakhir</p>
          <div className="my-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-[#191c1e]">Berhasil</h4>
              <p className="text-xs text-[#70787e]">25 Agustus 2024</p>
            </div>
          </div>
          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit">
            Terverifikasi Otomatis
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN CONTENT ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Detail Program & Visual Timeline */}
        <div className="space-y-6">
          {/* Detail Program Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c0c7ce]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#191c1e]">Detail Program Active</h3>
              <span className="bg-[#1f6d91]/10 text-[#1f6d91] px-3 py-1 rounded-full text-xs font-bold border border-[#1f6d91]/20">
                Aktif
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#70787e]">Program Yang Diikuti</p>
                <p className="text-lg font-extrabold text-[#005474]">{selectedChild.program}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-[#70787e]">Harga per Pertemuan</p>
                  <p className="text-sm font-bold text-[#191c1e]">Rp 50.000</p>
                </div>
                <div>
                  <p className="text-xs text-[#70787e]">Total Pertemuan Paket</p>
                  <p className="text-sm font-bold text-[#191c1e]">12 Pertemuan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Stepper Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c0c7ce]/30">
            <h3 className="text-base font-bold text-[#191c1e] mb-6">Progress Pertemuan (Paket Aktif)</h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
              {/* Item 1: Pertemuan 1-5 */}
              <div className="relative pl-4">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold border-4 border-white shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 1 - 5</h4>
                  <p className="text-xs text-[#70787e]">Selesai • Lunas</p>
                </div>
              </div>

              {/* Item 2: Pertemuan 6 (Hari ini) */}
              <div className="relative pl-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 -ml-2">
                <div className="absolute -left-[27px] top-4 w-5 h-5 rounded-full bg-[#f2ab3b] border-4 border-white flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 6</h4>
                    <p className="text-xs text-[#70787e]">Hari ini • Phonics Review</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    LUNAS
                  </span>
                </div>
              </div>

              {/* Item 3: Pertemuan 7 */}
              <div className="relative pl-4">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center text-xs font-bold border-4 border-white shadow-sm">
                  !
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 7</h4>
                    <p className="text-xs text-[#70787e]">2 September 2024</p>
                  </div>
                  <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-extrabold px-2 py-0.5 rounded">
                    BELUM DIBAYAR
                  </span>
                </div>
              </div>

              {/* Item 4: Pertemuan 8 */}
              <div className="relative pl-4">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center text-xs font-bold border-4 border-white shadow-sm">
                  !
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 8</h4>
                    <p className="text-xs text-[#70787e]">4 September 2024</p>
                  </div>
                  <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-extrabold px-2 py-0.5 rounded">
                    BELUM DIBAYAR
                  </span>
                </div>
              </div>

              {/* Item 5: Pertemuan 9 - 12 */}
              <div className="relative pl-4 opacity-50">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-200 border-4 border-white" />
                <div>
                  <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 9 - 12</h4>
                  <p className="text-xs text-[#70787e]">Jadwal Mendatang</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Actions */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[#191c1e]">Tindakan Pembayaran</h3>

          {/* Option A: Bayar per Pertemuan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-[#feb645] border-x border-b border-[#c0c7ce]/30 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-extrabold text-[#191c1e]">Bayar per Pertemuan</h4>
                <p className="text-xs text-[#70787e]">Bayar untuk pertemuan yang sudah berjalan atau akan datang.</p>
              </div>
              <span className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold px-2.5 py-1 rounded-md border border-[#ba1a1a]/20">
                2 Belum Dibayar
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-[#191c1e]">
                <span>Pertemuan 7</span>
                <span>Rp 50.000</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#191c1e] pb-2 border-b border-slate-200">
                <span>Pertemuan 8</span>
                <span>Rp 50.000</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-xs text-[#70787e]">Total Dibayar</span>
                <span className="text-lg font-extrabold text-[#ba1a1a]">Rp 100.000</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenPayment("pertemuan")}
              className="w-full bg-[#f2ab3b] hover:bg-[#e09b2b] text-white font-bold text-sm py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
                <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
              </svg>
              Bayar Pertemuan (Rp 100k)
            </button>
          </div>

          {/* Option B: Lunasi Sisa Paket */}
          <div className="bg-gradient-to-br from-[#005474] to-[#1f6d91] rounded-2xl p-6 text-white shadow-md relative overflow-hidden space-y-4">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h4 className="text-base font-extrabold flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#feb645]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Lunasi Sisa Paket
                </h4>
                <p className="text-xs text-white/80 mt-1">Bayar semua sisa pertemuan di paket ini sekaligus.</p>
              </div>
            </div>

            <div className="relative z-10 bg-white/10 p-4 rounded-xl space-y-2 backdrop-blur-sm border border-white/15">
              <div className="flex justify-between text-xs font-medium text-white/90">
                <span>Sisa Pertemuan (7 - 12)</span>
                <span>6 x Rp 50.000</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-white/20">
                <span className="text-xs text-white/80">Total Pelunasan</span>
                <span className="text-xl font-black text-white">Rp 300.000</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenPayment("paket")}
              className="relative z-10 w-full bg-white hover:bg-slate-100 text-[#005474] font-bold text-sm py-3 px-4 rounded-xl shadow transition-all text-center active:scale-98"
            >
              Lunasi Paket Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* ── RIWAYAT PEMBAYARAN (FULL WIDTH TABLE) ─────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c0c7ce]/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-[#191c1e]">Riwayat Pembayaran</h3>
          <button
            onClick={() => alert("Mengunduh laporan pembayaran PDF...")}
            className="text-[#1f6d91] hover:underline text-xs font-bold flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh Laporan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[#70787e] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-lg">ID Transaksi</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
                <th className="py-3 px-4 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Row 1: Cash Pending */}
              <tr className="bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">#INV-08-002</td>
                <td className="py-3.5 px-4">25 Ags 2024</td>
                <td className="py-3.5 px-4">Pertemuan 6</td>
                <td className="py-3.5 px-4 text-slate-600">Cash (Di Cabang)</td>
                <td className="py-3.5 px-4 text-right font-extrabold text-[#191c1e]">Rp 50.000</td>
                <td className="py-3.5 px-4">
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Menunggu Verifikasi Admin
                  </span>
                </td>
              </tr>

              {/* Row 2: VA Success */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">#INV-08-001</td>
                <td className="py-3.5 px-4">15 Ags 2024</td>
                <td className="py-3.5 px-4">Pertemuan 1 - 5 (Paket)</td>
                <td className="py-3.5 px-4 text-slate-600">Virtual Account BCA</td>
                <td className="py-3.5 px-4 text-right font-extrabold text-[#191c1e]">Rp 250.000</td>
                <td className="py-3.5 px-4">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                    ✓ Selesai
                  </span>
                </td>
              </tr>

              {/* Row 3: QRIS Success */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">#INV-07-015</td>
                <td className="py-3.5 px-4">01 Jul 2024</td>
                <td className="py-3.5 px-4">Biaya Pendaftaran & Seragam</td>
                <td className="py-3.5 px-4 text-slate-600">QRIS</td>
                <td className="py-3.5 px-4 text-right font-extrabold text-[#191c1e]">Rp 150.000</td>
                <td className="py-3.5 px-4">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                    ✓ Selesai
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── POLICY FOOTER CARD ─────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-[#c0c7ce]/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-[#1f6d91] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#191c1e] mb-1">Kebijakan Pembayaran & Kehadiran</h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-[#70787e] leading-relaxed">
            <li>Pembayaran tagihan maksimal dilakukan <strong>sebelum pertemuan dimulai</strong>.</li>
            <li>Pertemuan yang jatuh pada hari libur nasional (tanggal merah) <strong>tidak dikenakan biaya</strong> dan jadwal akan digeser ke pertemuan berikutnya.</li>
            <li>Jika anak izin (dengan pemberitahuan maksimal H-1), pertemuan dapat di-reschedule tanpa biaya tambahan (maksimal 2x per bulan).</li>
            <li>Pembayaran secara cash (tunai) di cabang wajib memberikan bukti struk kepada Admin untuk diverifikasi pada sistem.</li>
          </ul>
        </div>
      </div>

      {/* ── MODAL PEMBAYARAN WORKFLOW ─────────────────────────── */}
      {modalStep !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fadeIn border border-slate-200">
            {/* STEP 1: PILIH METODE PEMBAYARAN */}
            {modalStep === "select_method" && (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#191c1e]">Pilih Metode Pembayaran</h3>
                    <p className="text-xs text-[#70787e]">
                      Total: <span className="font-bold text-[#1f6d91]">Rp {billAmount.toLocaleString("id-ID")}</span>
                    </p>
                  </div>
                  <button onClick={() => setModalStep(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                    &times;
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Virtual Account */}
                  <label
                    onClick={() => setPaymentMethod("va")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "va" ? "border-[#1f6d91] bg-sky-50/60" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#1f6d91] flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
                          <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#191c1e]">Virtual Account</h4>
                        <p className="text-xs text-[#70787e]">BCA, BNI, Mandiri, BRI</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "va" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </label>

                  {/* E-Wallet */}
                  <label
                    onClick={() => setPaymentMethod("ewallet")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "ewallet" ? "border-[#1f6d91] bg-sky-50/60" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
                          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#191c1e]">E-Wallet</h4>
                        <p className="text-xs text-[#70787e]">GoPay, OVO, Dana, ShopeePay</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "ewallet" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </label>

                  {/* QRIS */}
                  <label
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "qris" ? "border-[#1f6d91] bg-sky-50/60" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                          <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                          <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                          <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#191c1e]">QRIS Instant</h4>
                        <p className="text-xs text-[#70787e]">Scan via semua aplikasi m-Banking & dompet digital</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "qris" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </label>

                  {/* Cash */}
                  <label
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "cash" ? "border-[#1f6d91] bg-sky-50/60" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#191c1e]">Cash di Cabang</h4>
                        <p className="text-xs text-[#70787e]">Bayar tunai ke Admin BSD After School Club</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "cash" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalStep(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    Batal
                  </button>
                  <button onClick={() => setModalStep("pay_details")} className="flex-1 py-2.5 rounded-xl bg-[#1f6d91] hover:bg-[#005474] text-xs font-bold text-white shadow">
                    Lanjutkan Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DETAIL PEMBAYARAN SESUAI METODE */}
            {modalStep === "pay_details" && (
              <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-[#191c1e]">
                    {paymentMethod === "va" && "Pembayaran Virtual Account"}
                    {paymentMethod === "ewallet" && "Pembayaran E-Wallet"}
                    {paymentMethod === "qris" && "Pembayaran QRIS Instant"}
                    {paymentMethod === "cash" && "Pembayaran Cash di Cabang"}
                  </h3>
                  <button onClick={() => setModalStep(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                    &times;
                  </button>
                </div>

                {/* Ringkasan Box */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                  <p className="text-[11px] font-bold text-[#70787e] uppercase tracking-wider">Ringkasan Tagihan</p>
                  {billBreakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-xs text-[#191c1e]">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-[#191c1e]">Total Tagihan</span>
                    <span className="text-base font-extrabold text-[#1f6d91]">Rp {billAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* VA VIEW */}
                {paymentMethod === "va" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-[#70787e] mb-2">PILIH BANK</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["BCA", "BNI", "Mandiri", "BRI"] as const).map((b) => (
                          <button
                            key={b}
                            onClick={() => setSelectedBank(b)}
                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                              selectedBank === b ? "border-[#1f6d91] bg-sky-50 text-[#1f6d91]" : "border-slate-200 text-slate-700"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-center space-y-2">
                      <p className="text-xs font-bold text-[#70787e]">NOMOR VIRTUAL ACCOUNT {selectedBank}</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xl font-black text-[#1f6d91] tracking-wider">1234 5678 9012 3456</span>
                        <button
                          onClick={() => handleCopy("1234567890123456", "va")}
                          className="bg-white border border-sky-200 px-2.5 py-1 rounded text-xs font-bold text-[#1f6d91]"
                        >
                          {copied === "va" ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* E-WALLET VIEW */}
                {paymentMethod === "ewallet" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-[#70787e] mb-2">PILIH E-WALLET</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["GoPay", "OVO", "Dana", "ShopeePay"] as const).map((ew) => (
                          <button
                            key={ew}
                            onClick={() => setSelectedEwallet(ew)}
                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                              selectedEwallet === ew ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-700"
                            }`}
                          >
                            {ew}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-amber-900">No. Handphone {selectedEwallet}:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-medium"
                        />
                        <button
                          onClick={() => alert(`Notifikasi dikirim ke ${selectedEwallet}!`)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                        >
                          Buka {selectedEwallet}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* QRIS VIEW */}
                {paymentMethod === "qris" && (
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-center space-y-3 flex flex-col items-center">
                    <p className="text-xs font-extrabold text-[#005474]">BSD AFTER SCHOOL CLUB (NMID: ID1029384756)</p>
                    <div className="w-40 h-40 bg-white border-2 border-slate-300 p-3 rounded-xl flex items-center justify-center shadow-xs">
                      <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="2" y="2" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="4" y="4" width="4" height="4" fill="#ffffff" />
                        <rect x="14" y="2" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="16" y="4" width="4" height="4" fill="#ffffff" />
                        <rect x="2" y="14" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="4" y="16" width="4" height="4" fill="#ffffff" />
                        <rect x="14" y="14" width="3" height="3" fill="#1e293b" />
                        <rect x="19" y="14" width="3" height="3" fill="#1e293b" />
                        <rect x="14" y="19" width="3" height="3" fill="#1e293b" />
                        <rect x="19" y="19" width="3" height="3" fill="#1e293b" />
                      </svg>
                    </div>
                    <button
                      onClick={() => handleCopy("ID1029384756", "qris")}
                      className="bg-white border border-slate-300 px-3 py-1 rounded text-xs font-bold text-[#1f6d91]"
                    >
                      {copied === "qris" ? "NMID Tersalin!" : "Salin NMID"}
                    </button>
                  </div>
                )}

                {/* CASH VIEW */}
                {paymentMethod === "cash" && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-purple-900">Kode Booking Pembayaran Tunai:</p>
                    <div className="flex items-center justify-between bg-white border border-purple-300 p-3 rounded-lg">
                      <span className="text-base font-black text-purple-800">CASH-88921-08</span>
                      <button
                        onClick={() => handleCopy("CASH-88921-08", "cash")}
                        className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded"
                      >
                        {copied === "cash" ? "Tersalin!" : "Salin Kode"}
                      </button>
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Tunjukkan kode ini ke Admin cabang BSD After School Club saat melakukan pembayaran tunai.
                    </p>
                  </div>
                )}

                {/* Accordion Petunjuk Pembayaran */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className="w-full bg-slate-50 p-3 text-left text-xs font-bold text-slate-700 flex items-center justify-between"
                  >
                    <span>Petunjuk Cara Pembayaran</span>
                    <svg className={`w-4 h-4 transition-transform ${accordionOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {accordionOpen && (
                    <div className="p-3 text-xs text-slate-600 bg-white border-t border-slate-200 space-y-1.5">
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Buka aplikasi sesuai metode yang Anda pilih.</li>
                        <li>Masukkan nominal tepat sebesar <strong>Rp {billAmount.toLocaleString("id-ID")}</strong>.</li>
                        <li>Selesaikan transaksi dan simpan bukti konfirmasi.</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalStep("select_method")} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    Kembali
                  </button>
                  <button onClick={() => setModalStep("waiting_confirmation")} className="flex-1 py-2.5 rounded-xl bg-[#1f6d91] hover:bg-[#005474] text-xs font-bold text-white shadow">
                    Saya Sudah Bayar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MENUNGGU KONFIRMASI */}
            {modalStep === "waiting_confirmation" && (
              <div className="p-8 text-center space-y-5">
                <div className="w-12 h-12 border-4 border-sky-200 border-t-[#1f6d91] rounded-full animate-spin mx-auto" />
                <div>
                  <h3 className="text-base font-extrabold text-[#191c1e]">Menunggu Konfirmasi Pembayaran</h3>
                  <p className="text-xs text-[#70787e] mt-1">Sistem sedang memverifikasi transaksi pembayaran Anda...</p>
                </div>

                <button
                  onClick={handleCheckStatus}
                  className="w-full py-3 rounded-xl bg-[#1f6d91] hover:bg-[#005474] text-xs font-bold text-white shadow transition-all"
                >
                  Cek Status Pembayaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
