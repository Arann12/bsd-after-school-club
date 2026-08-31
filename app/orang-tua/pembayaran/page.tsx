"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrangTuaPembayaranPage() {
  const router = useRouter();

  // Child Dropdown Switcher state
  const [selectedChild, setSelectedChild] = useState({
    name: "Merta",
    program: "Phonics Level 2",
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
    <div className="space-y-6 text-[#191c1e] bg-[#f8fafc] min-h-screen p-3 sm:p-6 font-sans">
      {/* ── HEADER & CHILD SELECTOR ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f6d91] tracking-tight">Pembayaran</h1>
        </div>

        {/* Child Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between gap-4 bg-white border-2 border-[#1f6d91] rounded-xl px-4 py-2 shadow-xs hover:shadow transition-all text-left min-w-[260px]"
          >
            <div>
              <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider">Anak yang Dipilih:</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-[#1f6d91] text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedChild.name[0]}
                </div>
                <span className="text-sm font-extrabold text-[#1f6d91]">{selectedChild.name}</span>
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
            <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-1">
              <button
                onClick={() => {
                  setSelectedChild({ name: "Merta", program: "Phonics Level 2" });
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-bold transition-colors ${
                  selectedChild.name === "Merta" ? "bg-[#1f6d91]/10 text-[#1f6d91]" : "hover:bg-slate-50 text-[#191c1e]"
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
                  setSelectedChild({ name: "Siti", program: "Calistung Level 1" });
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-bold transition-colors ${
                  selectedChild.name === "Siti" ? "bg-[#1f6d91]/10 text-[#1f6d91]" : "hover:bg-slate-50 text-[#191c1e]"
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
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-[10px] font-extrabold text-[#70787e] uppercase tracking-wider">TOTAL TAGIHAN TERTUNDA</p>
          <div className="my-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ba1a1a]">Rp 150.000</h3>
            <p className="text-xs text-[#70787e] mt-1 font-medium">1 Tagihan belum dibayar</p>
          </div>
        </div>

        {/* Card 2: Progress Pertemuan */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-[10px] font-extrabold text-[#70787e] uppercase tracking-wider">PROGRESS PERTEMUAN</p>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#191c1e]">6</span>
              <span className="text-base font-semibold text-[#70787e]">/12</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#1f6d91] h-full w-1/2 rounded-full" />
          </div>
        </div>

        {/* Card 3: Status Pembayaran Terakhir */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-[10px] font-extrabold text-[#70787e] uppercase tracking-wider">STATUS PEMBAYARAN TERAKHIR</p>
          <div className="my-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#191c1e]">Berhasil</h4>
              <p className="text-xs text-[#70787e]">25 Ags 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN CONTENT ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Detail Program & Visual Timeline */}
        <div className="space-y-6">
          {/* Detail Program Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#191c1e]">Detail Program</h3>
              <span className="bg-sky-100 text-[#1f6d91] px-3 py-1 rounded-full text-xs font-bold">
                Aktif
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#70787e]">Program</p>
                <p className="text-base font-extrabold text-[#191c1e]">{selectedChild.program}</p>
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
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
            <h3 className="text-base font-bold text-[#191c1e] mb-6">Progress Pertemuan (Paket Aktif)</h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
              {/* Item 1: Pertemuan 1-5 */}
              <div className="relative pl-4">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold border-4 border-white shadow-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 1 - 5</h4>
                  <p className="text-xs text-[#70787e]">Selesai • Lunas</p>
                </div>
              </div>

              {/* Item 2: Pertemuan 6 (Hari ini) */}
              <div className="relative pl-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 -ml-2">
                <div className="absolute -left-[27px] top-4 w-5 h-5 rounded-full bg-[#f2ab3b] border-4 border-white flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
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
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold border-4 border-white shadow-xs">
                  ⏰
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 7</h4>
                    <p className="text-xs text-[#70787e]">2 Sept 2024</p>
                  </div>
                  <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-extrabold px-2 py-0.5 rounded">
                    BELUM DIBAYAR
                  </span>
                </div>
              </div>

              {/* Item 4: Pertemuan 8 */}
              <div className="relative pl-4">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold border-4 border-white shadow-xs">
                  ⏰
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#191c1e]">Pertemuan 8</h4>
                    <p className="text-xs text-[#70787e]">4 Sept 2024</p>
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
                  <p className="text-xs text-[#70787e]">Jadwal mendatang</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Actions */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[#191c1e]">Tindakan Pembayaran</h3>

          {/* Option A: Bayar per Pertemuan */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border-t-4 border-[#f2ab3b] border-x border-b border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-extrabold text-[#191c1e]">Bayar per Pertemuan</h4>
                <p className="text-xs text-[#70787e]">Bayar untuk pertemuan yang sudah berjalan atau akan datang.</p>
              </div>
              <span className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold px-2.5 py-1 rounded-md">
                2 Belum Dibayar
              </span>
            </div>

            <div className="bg-slate-100/70 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#191c1e]">
                <span>Pertemuan 7</span>
                <span>Rp 50.000</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#191c1e] pb-2 border-b border-slate-200">
                <span>Pertemuan 8</span>
                <span>Rp 50.000</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs text-[#70787e]">Total Dibayar</span>
                <span className="text-xl font-extrabold text-[#ba1a1a]">Rp 100.000</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenPayment("pertemuan")}
              className="w-full bg-[#f2ab3b] hover:bg-[#e09b2b] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-5 h-5 text-[#f2ab3b]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Lunasi Sisa Paket
                </h4>
                <p className="text-xs text-white/80 mt-1">Bayar semua sisa pertemuan di paket ini sekaligus.</p>
              </div>
            </div>

            <div className="relative z-10 bg-black/20 p-4 rounded-xl space-y-2 backdrop-blur-xs border border-white/10">
              <div className="flex justify-between text-xs font-medium text-white/90">
                <span>Sisa Pertemuan (7-12)</span>
                <span>6 x Rp 50.000</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-white/20">
                <span className="text-xs text-white/80">Total Pelunasan</span>
                <span className="text-2xl font-black text-white">Rp 300.000</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenPayment("paket")}
              className="relative z-10 w-full bg-white hover:bg-slate-100 text-[#005474] font-bold text-sm py-3 px-4 rounded-xl shadow-xs transition-all text-center active:scale-98"
            >
              Lunasi Paket Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* ── RIWAYAT PEMBAYARAN (FULL WIDTH TABLE) ─────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-[#191c1e]">Riwayat Pembayaran</h3>
          <button
            onClick={() => alert("Mengunduh laporan pembayaran PDF...")}
            className="text-[#1f6d91] hover:underline text-xs font-bold flex items-center gap-1.5"
          >
            Unduh Laporan
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[#70787e] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">ID TRANSAKSI</th>
                <th className="py-3 px-4">TANGGAL</th>
                <th className="py-3 px-4">KETERANGAN</th>
                <th className="py-3 px-4">METODE</th>
                <th className="py-3 px-4 text-right">JUMLAH</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Row 1: Cash Pending */}
              <tr className="bg-amber-50/40 hover:bg-amber-50 transition-colors">
                <td className="py-4 px-4 font-mono font-semibold text-slate-500">#INV-08-002</td>
                <td className="py-4 px-4">25 Ags 2024</td>
                <td className="py-4 px-4 font-semibold">Pertemuan 6</td>
                <td className="py-4 px-4 text-slate-600">Cash (Di Cabang)</td>
                <td className="py-4 px-4 text-right font-extrabold text-[#191c1e]">Rp 50.000</td>
                <td className="py-4 px-4">
                  <span className="bg-[#fef3c7] text-[#92400e] text-[11px] font-bold px-3 py-1 rounded-md inline-flex items-center gap-1.5 border border-amber-200">
                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Menunggu Verifikasi Admin
                  </span>
                </td>
              </tr>

              {/* Row 2: VA Success */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-mono font-semibold text-slate-500">#INV-08-001</td>
                <td className="py-4 px-4">15 Ags 2024</td>
                <td className="py-4 px-4 font-semibold">Pertemuan 1 - 5 (Paket)</td>
                <td className="py-4 px-4 text-slate-600">Virtual Account BCA</td>
                <td className="py-4 px-4 text-right font-extrabold text-[#191c1e]">Rp 250.000</td>
                <td className="py-4 px-4">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                    ✓ Selesai
                  </span>
                </td>
              </tr>

              {/* Row 3: QRIS Success */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-mono font-semibold text-slate-500">#INV-07-015</td>
                <td className="py-4 px-4">01 Jul 2024</td>
                <td className="py-4 px-4 font-semibold">Biaya Pendaftaran & Seragam</td>
                <td className="py-4 px-4 text-slate-600">QRIS</td>
                <td className="py-4 px-4 text-right font-extrabold text-[#191c1e]">Rp 150.000</td>
                <td className="py-4 px-4">
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
      <div className="bg-white rounded-2xl p-6 border border-slate-100 flex items-start gap-4 shadow-xs">
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

      {/* ── MODAL PEMBAYARAN WORKFLOW (EXACT MATCH TO 4 SCREENSHOTS) ─────────────────────────── */}
      {modalStep !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn border border-slate-200">
            {/* STEP 1: PILIH METODE PEMBAYARAN (SCREENSHOT 3) */}
            {modalStep === "select_method" && (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-[#191c1e]">Pilih Metode Pembayaran</h3>
                  <button onClick={() => setModalStep(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                    &times;
                  </button>
                </div>

                <p className="text-xs text-[#70787e]">Pilih metode pembayaran untuk melunasi tagihan pertemuan yang dipilih.</p>

                {/* Ringkasan Tagihan Box */}
                <div className="bg-slate-100 p-4 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider">RINGKASAN TAGIHAN</p>
                  {billBreakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-xs text-[#191c1e] font-medium">
                      <span>{item.label}</span>
                      <span>{item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-[#191c1e]">Total Pembayaran</span>
                    <span className="text-lg font-extrabold text-[#1f6d91]">Rp {billAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Option list */}
                <div className="space-y-3">
                  {/* Virtual Account */}
                  <div
                    onClick={() => setPaymentMethod("va")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "va" ? "border-2 border-[#1f6d91] bg-sky-50/40" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#1f6d91] flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#191c1e]">Virtual Account</h4>
                        <p className="text-[11px] text-[#70787e]">Bayar melalui nomor Virtual Account</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "va" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </div>

                  {/* E-Wallet */}
                  <div
                    onClick={() => setPaymentMethod("ewallet")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "ewallet" ? "border-2 border-[#1f6d91] bg-sky-50/40" : "border-slate-200 hover:bg-slate-50"
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
                        <h4 className="text-xs font-bold text-[#191c1e]">E-Wallet</h4>
                        <p className="text-[11px] text-[#70787e]">Bayar menggunakan dompet digital</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "ewallet" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </div>

                  {/* QRIS */}
                  <div
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "qris" ? "border-2 border-[#1f6d91] bg-sky-50/40" : "border-slate-200 hover:bg-slate-50"
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
                        <h4 className="text-xs font-bold text-[#191c1e]">QRIS</h4>
                        <p className="text-[11px] text-[#70787e]">Scan QRIS menggunakan aplikasi pembayaran</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "qris" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </div>

                  {/* Cash */}
                  <div
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "cash" ? "border-2 border-[#1f6d91] bg-sky-50/40" : "border-slate-200 hover:bg-slate-50"
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
                        <h4 className="text-xs font-bold text-[#191c1e]">Cash</h4>
                        <p className="text-[11px] text-[#70787e]">Bayar tunai melalui Admin</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "cash" ? "border-[#1f6d91] bg-[#1f6d91]" : "border-slate-300"}`} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalStep(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    Batal
                  </button>
                  <button onClick={() => setModalStep("pay_details")} className="flex-1 py-2.5 rounded-xl bg-[#f2ab3b] hover:bg-[#e09b2b] text-xs font-bold text-white shadow-xs">
                    Lanjutkan Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DETAIL PEMBAYARAN VIRTUAL ACCOUNT / E-WALLET / QRIS / CASH (SCREENSHOT 4) */}
            {modalStep === "pay_details" && (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-[#191c1e]">
                    {paymentMethod === "va" && "Pembayaran Virtual Account"}
                    {paymentMethod === "ewallet" && "Pembayaran E-Wallet"}
                    {paymentMethod === "qris" && "Pembayaran QRIS"}
                    {paymentMethod === "cash" && "Pembayaran Cash"}
                  </h3>
                  <button onClick={() => setModalStep(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                    &times;
                  </button>
                </div>

                <p className="text-xs text-[#70787e]">Silakan selesaikan pembayaran sebelum batas waktu pembayaran.</p>

                {/* Ringkasan Pembayaran Box */}
                <div className="bg-slate-100 p-4 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider">RINGKASAN PEMBAYARAN</p>
                  {billBreakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-xs text-[#191c1e] font-medium">
                      <span>{item.label}</span>
                      <span>{item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-[#191c1e]">Total Pembayaran</span>
                    <span className="text-lg font-extrabold text-[#1f6d91]">Rp {billAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* VA VIEW */}
                {paymentMethod === "va" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider mb-2">PILIH BANK</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["BCA", "BNI", "Mandiri", "BRI"] as const).map((b) => (
                          <button
                            key={b}
                            onClick={() => setSelectedBank(b)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                              selectedBank === b ? "border-2 border-[#1f6d91] bg-white text-[#1f6d91]" : "border-slate-200 text-slate-700 bg-white"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-100 p-4 rounded-xl text-center space-y-2">
                      <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider">NOMOR VIRTUAL ACCOUNT</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl font-black text-[#1f6d91] tracking-wider">1234 5678 9012 3456</span>
                        <button onClick={() => handleCopy("1234567890123456", "va")} className="text-slate-500 hover:text-[#1f6d91]">
                          📋
                        </button>
                      </div>
                      <p className="text-xs text-[#70787e] font-medium">Total: Rp {billAmount.toLocaleString("id-ID")}</p>
                      <p className="text-xs text-red-600 font-bold">Bayar sebelum 27 Agustus 2024, 23:59</p>
                    </div>
                  </div>
                )}

                {/* E-WALLET VIEW */}
                {paymentMethod === "ewallet" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider mb-2">PILIH E-WALLET</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["GoPay", "OVO", "Dana", "ShopeePay"] as const).map((ew) => (
                          <button
                            key={ew}
                            onClick={() => setSelectedEwallet(ew)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                              selectedEwallet === ew ? "border-2 border-[#1f6d91] bg-white text-[#1f6d91]" : "border-slate-200 text-slate-700 bg-white"
                            }`}
                          >
                            {ew}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-100 p-4 rounded-xl space-y-2 text-center">
                      <p className="text-xs font-bold text-slate-800">Nomor Handphone Terdaftar:</p>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                )}

                {/* QRIS VIEW */}
                {paymentMethod === "qris" && (
                  <div className="bg-slate-100 p-4 rounded-xl text-center space-y-3 flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-800">BSD AFTER SCHOOL CLUB (NMID: ID1029384756)</p>
                    <div className="w-36 h-36 bg-white border border-slate-300 p-2 rounded-xl flex items-center justify-center">
                      <svg width={100} height={100} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="2" y="2" width="8" height="8" fill="#1e293b" />
                        <rect x="4" y="4" width="4" height="4" fill="#ffffff" />
                        <rect x="14" y="2" width="8" height="8" fill="#1e293b" />
                        <rect x="16" y="4" width="4" height="4" fill="#ffffff" />
                        <rect x="2" y="14" width="8" height="8" fill="#1e293b" />
                        <rect x="4" y="16" width="4" height="4" fill="#ffffff" />
                        <rect x="14" y="14" width="3" height="3" fill="#1e293b" />
                        <rect x="19" y="14" width="3" height="3" fill="#1e293b" />
                        <rect x="14" y="19" width="3" height="3" fill="#1e293b" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* CASH VIEW */}
                {paymentMethod === "cash" && (
                  <div className="bg-slate-100 p-4 rounded-xl space-y-2 text-center">
                    <p className="text-xs font-bold text-slate-800">Kode Booking Cash:</p>
                    <p className="text-xl font-black text-[#1f6d91]">CASH-88921-08</p>
                    <p className="text-xs text-slate-500">Tunjukkan kode ini ke Admin cabang untuk verifikasi tunai.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalStep("select_method")} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    Kembali
                  </button>
                  <button onClick={() => setModalStep("waiting_confirmation")} className="flex-1 py-2.5 rounded-xl bg-[#f2ab3b] hover:bg-[#e09b2b] text-xs font-bold text-white shadow-xs">
                    Saya Sudah Melakukan Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MENUNGGU KONFIRMASI (SCREENSHOT 2) */}
            {modalStep === "waiting_confirmation" && (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-[#191c1e]">Menunggu Konfirmasi Pembayaran</h3>
                  <button onClick={() => setModalStep(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                    &times;
                  </button>
                </div>

                {/* Animated Donut Spinner */}
                <div className="py-4 text-center">
                  <div className="w-14 h-14 border-4 border-slate-200 border-t-[#1f6d91] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-xs text-[#70787e]">Sistem sedang menunggu konfirmasi dari penyedia pembayaran.</p>
                </div>

                {/* Ringkasan Tagihan Box */}
                <div className="bg-slate-100 p-4 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-[#70787e] uppercase tracking-wider">RINGKASAN TAGIHAN</p>
                  {billBreakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-xs text-[#191c1e] font-medium">
                      <span>{item.label}</span>
                      <span>{item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-[#191c1e]">Total Pembayaran</span>
                    <span className="text-lg font-extrabold text-[#1f6d91]">Rp {billAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckStatus}
                  className="w-full py-3 rounded-xl bg-[#f2ab3b] hover:bg-[#e09b2b] text-xs font-bold text-white shadow-xs transition-all text-center"
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
