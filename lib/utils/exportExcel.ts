/**
 * Ekspor data tabular ke file spreadsheet (CSV / Excel) dengan UTF-8 BOM.
 * Berjalan native di browser tanpa ketergantungan library eksternal (zero-dependency).
 * Otomatis terbuka rapi dalam kolom di Microsoft Excel, Google Sheets, dan LibreOffice.
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  _sheetName: string = "Data Laporan"
) {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const keys = Object.keys(data[0] || {});

  // Escape karakter khusus dan kutip ganda untuk standar CSV Excel
  const formatCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = keys.map(formatCell).join(",");
  const dataRows = data.map((row) =>
    keys.map((k) => formatCell(row[k])).join(",")
  );

  // UTF-8 BOM (﻿) wajib disertakan agar Excel otomatis mendeteksi karakter UTF-8
  const csvContent = "﻿" + [headerRow, ...dataRows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Ganti ekstensi ke .csv agar Excel langsung membukanya tanpa warning format mismatch
  const targetFilename = filename.replace(/\.xlsx$/i, ".csv");

  link.setAttribute("href", url);
  link.setAttribute("download", targetFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
