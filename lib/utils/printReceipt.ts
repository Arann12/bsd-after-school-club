/**
 * Utility Cetak Kwitansi / Bukti Pembayaran Resmi BSD After School Club
 * Menghasilkan dokumen invoice / kwitansi berstandar institusi pendidikan
 * yang siap dicetak maupun disimpan sebagai PDF oleh Orang Tua, Admin, dan Owner.
 */

export interface ReceiptData {
  invoiceCode: string;
  receiptNumber?: string;
  tanggal: string;
  studentName: string;
  studentCode?: string;
  programName: string;
  levelName?: string;
  keterangan: string;
  metode: string;
  jalur?: string;
  jumlah: number | string;
  status: "Lunas" | "paid" | "Selesai" | string;
  cashierName?: string;
  notes?: string;
}

export function printReceipt(data: ReceiptData) {
  if (typeof window === "undefined") return;

  const receiptWindow = window.open("", "_blank", "width=750,height=880");
  if (!receiptWindow) {
    window.print();
    return;
  }

  const isPaid =
    data.status === "Lunas" ||
    data.status === "paid" ||
    data.status === "Selesai" ||
    data.status === "TERVERIFIKASI LUNAS";

  const cleanNumber = (val: number | string): number => {
    if (typeof val === "number") return Math.round(val);
    const cleaned = String(val)
      .replace(/Rp\s*/gi, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    return Math.round(parseFloat(cleaned) || 0);
  };

  const formattedAmount = `Rp ${cleanNumber(data.jumlah).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

  const receiptNo = data.receiptNumber || `KW-${data.invoiceCode.replace(/[^A-Za-z0-9]/g, "").slice(-8).toUpperCase()}`;

  const receiptHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kwitansi Pembayaran Resmi - ${data.invoiceCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }

    .receipt-container {
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      position: relative;
    }

    /* KOP LEMBAGA */
    .kop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0e7490;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 21px;
      font-weight: 800;
      color: #0e7490;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-top: 3px;
    }

    .brand-address {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: ${isPaid ? "#dcfce7" : "#fef3c7"};
      color: ${isPaid ? "#15803d" : "#b45309"};
      border: 1px solid ${isPaid ? "#bbf7d0" : "#fde68a"};
      font-size: 11.5px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* JUDUL KWITANSI */
    .doc-title-section {
      text-align: center;
      margin-bottom: 24px;
    }

    .doc-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .doc-number {
      font-size: 12px;
      color: #64748b;
      font-family: monospace;
      margin-top: 4px;
    }

    /* TABEL DATA */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    .data-table tr {
      border-bottom: 1px dashed #e2e8f0;
    }

    .data-table td {
      padding: 10px 0;
      font-size: 13px;
      vertical-align: top;
    }

    .data-table .label {
      color: #64748b;
      font-weight: 500;
      width: 40%;
    }

    .data-table .value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }

    /* TOTAL PANEL */
    .total-panel {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 26px;
    }

    .total-label {
      font-size: 13.5px;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .total-amount {
      font-size: 22px;
      font-weight: 800;
      color: #15803d;
    }

    /* STEMPEL & TANDA TANGAN */
    .verification-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      margin-top: 20px;
    }

    .stamp-box {
      border: 2px dashed ${isPaid ? "#16a34a" : "#d97706"};
      background: ${isPaid ? "#f0fdf4" : "#fffbeb"};
      color: ${isPaid ? "#15803d" : "#b45309"};
      font-weight: 800;
      font-size: 12px;
      padding: 8px 16px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: inline-block;
    }

    .stamp-sub {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 6px;
    }

    .signature-box {
      text-align: right;
    }

    .sig-role {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .sig-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 44px;
      border-bottom: 1px solid #cbd5e1;
      display: inline-block;
      padding-bottom: 2px;
    }

    /* FOOTER */
    .footer-note {
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      margin-top: 26px;
      line-height: 1.5;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }

    /* ACTION BAR UNTUK TAMPILAN SCREEN */
    .print-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .print-btn {
      background: #0e7490;
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .close-btn {
      background: #ffffff;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-actions {
        display: none !important;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 16px 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Cetak / Simpan PDF
    </button>
    <button class="close-btn" onclick="window.close()">Tutup Jendela</button>
  </div>

  <div class="receipt-container">
    <!-- KOP -->
    <div class="kop-header">
      <div>
        <div class="brand-title">BSD AFTER SCHOOL CLUB</div>
        <div class="brand-subtitle">Pusat Belajar & Bimbingan Akademik Siswa</div>
        <div class="brand-address">
          Ruko Golden Madrid 2, BSD City, Tangerang Selatan<br />
          Email: info@bsdafterschool.id · Telp: (021) 538-2345
        </div>
      </div>
      <div class="status-badge">
        ${isPaid ? "✓ LUNAS (PAID)" : data.status}
      </div>
    </div>

    <!-- JUDUL -->
    <div class="doc-title-section">
      <div class="doc-title">BUKTI PEMBAYARAN RESMI / KWITANSI</div>
      <div class="doc-number">No. Kwitansi: ${receiptNo}</div>
    </div>

    <!-- RINCIAN -->
    <table class="data-table">
      <tr>
        <td class="label">No. Invoice / Transaksi</td>
        <td class="value" style="font-family: monospace;">${data.invoiceCode}</td>
      </tr>
      <tr>
        <td class="label">Waktu Pembayaran</td>
        <td class="value">${data.tanggal}</td>
      </tr>
      <tr>
        <td class="label">Nama Lengkap Siswa</td>
        <td class="value">${data.studentName} ${data.studentCode ? `(${data.studentCode})` : ""}</td>
      </tr>
      <tr>
        <td class="label">Program / Mata Pelajaran</td>
        <td class="value">${data.programName} ${data.levelName ? `— ${data.levelName}` : ""}</td>
      </tr>
      <tr>
        <td class="label">Rincian Pertemuan / Sesi</td>
        <td class="value">${data.keterangan}</td>
      </tr>
      <tr>
        <td class="label">Metode Pembayaran</td>
        <td class="value">${data.metode} ${data.jalur && data.jalur !== "–" ? `(${data.jalur})` : ""}</td>
      </tr>
      ${
        data.notes
          ? `<tr>
        <td class="label">Catatan Transaksi</td>
        <td class="value" style="font-weight: 500; color: #475569;">${data.notes}</td>
      </tr>`
          : ""
      }
    </table>

    <!-- TOTAL -->
    <div class="total-panel">
      <div class="total-label">Total Pembayaran Lunas</div>
      <div class="total-amount">${formattedAmount}</div>
    </div>

    <!-- STEMPEL & TANDA TANGAN -->
    <div class="verification-row">
      <div>
        <div class="stamp-box">${isPaid ? "TERVERIFIKASI LUNAS" : data.status}</div>
        <div class="stamp-sub">Sistem Payment Resmi BSD After School Club</div>
      </div>
      <div class="signature-box">
        <div class="sig-role">Bagian Administrasi & Keuangan</div>
        <div class="sig-name">${data.cashierName || "Kasir Front Desk Cabang"}</div>
      </div>
    </div>

    <!-- FOOTER RESMI -->
    <div class="footer-note">
      Dokumen ini merupakan bukti pembayaran sah yang diterbitkan secara elektronik oleh sistem manajemen keuangan BSD After School Club.<br />
      Simpan kwitansi ini sebagai bukti pelunasan biaya belajar siswa. Terima kasih atas kepercayaan Anda.
    </div>
  </div>

  <script>
    window.onload = function() {
      // Otomatis buka dialog print saat dokumen siap
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  receiptWindow.document.write(receiptHtml);
  receiptWindow.document.close();
}
