import * as XLSX from "xlsx";

/**
 * Ekspor array of objects ke file Excel (.xlsx) dengan auto-width kolom.
 *
 * @param data Array object data yang ingin diekspor (key object akan menjadi header kolom)
 * @param filename Nama file saat diunduh (misal: "laporan_inventaris.xlsx")
 * @param sheetName Nama tab sheet di Excel (default: "Data Laporan")
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  sheetName: string = "Data Laporan"
) {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor ke Excel.");
    return;
  }

  // Buat worksheet dari json
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Otomatis hitung lebar kolom agar teks tidak terpotong
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map((key) => {
    let maxLen = key.length;
    data.forEach((row) => {
      const val = row[key];
      const strVal = val !== null && val !== undefined ? String(val) : "";
      // Hitung baris baru jika ada multiline
      const longestLine = strVal.split("\n").reduce((m, l) => Math.max(m, l.length), 0);
      if (longestLine > maxLen) {
        maxLen = longestLine;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 4, 12), 60) };
  });

  worksheet["!cols"] = colWidths;

  // Buat workbook dan tempelkan sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31)); // Max sheet name length 31 chars

  // Tulis dan download file
  const validFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, validFilename);
}
