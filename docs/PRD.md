# PROJECT: Sistem Manajemen Akademik BSD After School Club

## Ringkasan
Web app manajemen akademik untuk after-school club dengan 4 jenis akun: Owner/Super Admin,
Admin, Guru, Orang Tua. TIDAK ADA akun login untuk Siswa — data siswa dikelola oleh Admin/Guru,
dan diakses oleh Orang Tua lewat akunnya sendiri.

## Role & Hak Akses
- **Owner/Super Admin**: akses penuh — dashboard, akademik, keuangan, pembayaran, HONOR (hanya
  role ini yang bisa lihat nominal honor & ubah tarif per jam per guru), laporan, pengumuman,
  pengaturan sistem.
- **Admin**: enrollment/pendaftaran, data siswa/orang tua/guru, program/kelas, jadwal, pembayaran,
  monitoring absensi/logbook, pengumuman, inventaris. TIDAK bisa lihat honor.
- **Guru**: jadwal & kelas yang ditugaskan, absensi siswa, logbook/materi, input nilai/assessment
  (jika fitur nilai diaktifkan). TIDAK bisa lihat honor (miliknya sendiri maupun guru lain), tidak
  bisa lihat data keuangan bimbel.
- **Orang Tua**: anak yang terhubung ke akunnya (bisa lebih dari satu), jadwal, tagihan, riwayat
  pembayaran, pengumuman, laporan akhir & sertifikat (setelah anak berstatus Graduated).

Hak akses diterapkan sampai level data (row-level), bukan cuma sembunyikan menu. Akun Admin,
Guru, dan Orang Tua dibuat oleh Admin/Owner (bukan self-register); user mengganti password
setelah login pertama.

## Data Master
- **Siswa**: nama, foto, tanggal lahir, sekolah, kelas sekolah, program (maks 2 program per
  siswa), level, tanggal mulai, status, catatan. Status: Trial → Active → On Leave / Inactive →
  Graduated. ID unik: STD-2026-0001.
- **Orang Tua**: satu akun bisa terhubung ke lebih dari satu siswa. ID: PAR-2026-0001.
- **Guru**: bisa mengajar beberapa kelas; satu kelas bisa punya lebih dari satu guru. ID:
  GUR-2026-0001.
- **Program & Level**: sepenuhnya dinamis — Admin bisa tambah/ubah program dan level tanpa
  mengubah kode aplikasi (mis. satu program bisa punya banyak level).
- **Kelas**: dibuat berdasarkan program, level, guru, hari, jam, ruangan. Kapasitas maksimal
  **7 siswa per kelas/batch**. Jika penuh, sistem MENCEGAH penambahan siswa (bukan cuma warning)
  dan mengarahkan ke batch/kelompok berikutnya. Kelas punya identitas sendiri yang tetap walau
  jadwal berubah.
- **Enrollment**: calon siswa didata → status "Pending" → Admin review data, program, dan
  kelas/batch → Approve (jadi siswa resmi, akun Orang Tua dibuat) atau Reject (data tetap
  tersimpan untuk histori).

## Jadwal
- Calendar view: filter per hari/minggu/bulan/guru/ruangan/kelas.
- Sistem WAJIB mendeteksi bentrok jadwal SEBELUM disimpan — minimal cek bentrok guru (guru tidak
  boleh mengajar 2 kelas di jam yang sama). Tampilkan konflik dengan jelas jika terdeteksi.
- Reschedule satu sesi TIDAK mengubah nomor pertemuan, hanya tanggal/jam aktualnya; histori
  tersimpan. Perubahan jadwal reguler (rutin) punya tanggal mulai efektif terpisah dari
  reschedule sesi tunggal.
- Hari libur tidak dihitung sebagai pertemuan / tidak menambah counter pertemuan.
- Jadwal menyimpan: tanggal, jam mulai, jam selesai, guru, kelas, program/level, ruangan — durasi
  ini jadi dasar perhitungan honor.

## Paket Belajar & Pembayaran
- Paket: **8 pertemuan** (2x/minggu) atau **12 pertemuan** (3x/minggu). Dasar tagihan adalah
  JUMLAH PERTEMUAN, bukan tanggal kalender — pergeseran jadwal tidak mengunci tagihan ke tanggal
  lama.
- Skema pembayaran HANYA 2 pilihan: bayar per pertemuan, atau langsung lunas per paket. TIDAK
  ADA skema cicilan/bertahap kompleks di versi ini.
- Metode: Virtual Account (VA), E-Wallet, QRIS, Cash.
- **Pembayaran digital**: idealnya via payment gateway, status otomatis jadi Paid setelah
  terkonfirmasi. Riwayat minimal simpan tanggal, nominal, metode, nomor transaksi, status.
- **Pembayaran cash — 2 jalur**:
  1. Orang Tua ajukan Cash dari akunnya → status "Menunggu Konfirmasi Admin" → Admin konfirmasi
     setelah terima uang offline → status jadi Paid/Lunas.
  2. Admin input langsung saat menerima uang tunai → langsung Paid/Lunas.
  Tombol Cash dari Orang Tua TIDAK BOLEH otomatis membuat status Lunas — harus lewat konfirmasi
  Admin untuk audit trail. Setiap transaksi cash dapat nomor otomatis (format CASH-2026-000001),
  simpan tanggal/jam, siswa & tagihan terkait, nominal, admin penerima, catatan opsional.
- **Bukti transfer manual** (opsional/fallback): Orang Tua bisa upload bukti transfer, status
  verifikasi Pending Verification / Approved / Rejected sampai dikonfirmasi Admin.
- **Status tagihan**: Unpaid (belum bayar, belum lewat jatuh tempo), Overdue (belum bayar dan
  sudah lewat jatuh tempo), Partially Paid (jika ada pembayaran sebagian), Paid/Lunas.
- TIDAK ADA integrasi WhatsApp otomatis untuk reminder pembayaran di versi ini. Reminder cukup
  ditampilkan sebagai daftar tagihan yang perlu ditindaklanjuti di dashboard Admin/Owner.

## Absensi & Logbook Guru
- Guru melakukan absensi siswa per sesi kelas dengan status: Present, Absent, Sick, Permission,
  Holiday.
- Guru mengisi logbook (materi/pokok bahasan yang diajarkan) dari halaman kelasnya — ini jadi
  sumber data jam mengajar untuk honor.
- Akses riwayat absensi difilter sesuai relasi: Guru hanya lihat siswa yang diajar, Orang Tua
  hanya lihat anaknya.
- TIDAK ADA modul progress belajar rutin per pertemuan (dihapus dari scope, supaya guru tidak
  perlu input rutin setiap kelas selesai).

## Honor Guru
- HANYA Owner/Super Admin yang bisa lihat nominal honor semua guru dan mengubah tarif per jam
  per guru (tarif bisa beda-beda antar guru).
- Guru dan Admin TIDAK bisa lihat nominal honor (guru maupun bukan miliknya sendiri).
- Perhitungan otomatis: durasi sesi mengajar (jam selesai − jam mulai) × tarif per jam = honor
  sesi. Direkap total harian, mingguan, bulanan.
- Owner bisa verifikasi/koreksi data logbook sebelum honor difinalkan. Bonus bisa jadi komponen
  terpisah yang hanya dikelola Owner.

## Nilai Akhir & Sertifikat
- Guru melakukan assessment (opsional membantu), Admin input nilai final ke sistem — guru TIDAK
  wajib input nilai setiap selesai mengajar.
- Sistem hitung nilai akhir sesuai formula yang dikonfigurasi, tentukan status Lulus/Tidak Lulus.
- Setelah data final diverifikasi Owner/Admin → sertifikat otomatis dibuat dari template sesuai
  program/level → siswa berstatus Graduated.
- Orang Tua bisa melihat laporan akhir dan sertifikat setelah siswa Graduated.

## Pengumuman
- Owner dan Admin bisa buat pengumuman: judul, tanggal, deskripsi (rich text), poster/gambar
  opsional, target (semua user / Guru / Orang Tua / kelas tertentu / program tertentu), status
  Draft/Published/Archived.
- Setelah Publish, muncul di dashboard/halaman pengumuman user yang jadi target, dengan indikator
  "Baru".

## Dashboard & Laporan
- SEMUA angka dashboard (jumlah siswa aktif, jumlah guru/staff, jumlah kelas aktif, attendance
  hari ini, unpaid fees, pendapatan bulanan, pengeluaran, teacher payroll) ditarik OTOMATIS dari
  data transaksi — TIDAK ADA input manual ulang untuk angka dashboard.
- Laporan mencakup: Laporan Siswa (aktif/baru/berhenti/per program/per level), Laporan Kehadiran
  (siswa/guru/per bulan/per kelas), Laporan Keuangan (pendapatan/pembayaran/tunggakan/
  pengeluaran/honor), Laporan Akhir per siswa (dasar sertifikat), Laporan Inventaris.
- Laporan pembayaran menampilkan status granular (Paid/Partially Paid/Unpaid/Overdue) beserta
  riwayat dan bukti pembayaran terverifikasi.
- Pertimbangkan export ke Excel/PDF (prioritas rendah).

## Modul Inventaris (Prioritas rendah, boleh dibangun belakangan)
- Data: nama barang, kategori, jumlah, harga, tanggal pembelian, kondisi (Good/Damaged/Lost/
  Under Repair), lokasi, penanggung jawab, foto, status.
- Bisa dikaitkan dengan ruang/kelas tertentu.

## Business Rules
- Satu Orang Tua bisa terhubung ke lebih dari satu Siswa.
- Satu Siswa maksimal ikut 2 Program.
- Satu Guru bisa mengajar beberapa Kelas; satu Kelas bisa punya lebih dari satu Guru.
- Maksimal 7 Siswa per Kelas/Batch — sistem mencegah (bukan cuma warning) jika sudah penuh.
- Guru tidak boleh punya jadwal bentrok pada waktu yang sama (dicek sebelum simpan jadwal).
- Reschedule tidak mengubah nomor pertemuan, hanya tanggal/jam aktual.
- Hari libur tidak dihitung sebagai pertemuan.
- Overdue baru muncul setelah jatuh tempo terlewati DAN tagihan belum lunas.
- Honor dihitung dari jam mengajar (bukan hanya kehadiran/hari kerja).
- Semua ID entitas utama unik dengan prefix (lihat bagian ID di bawah) dan TIDAK didaur ulang
  meski data nonaktif.
- Akun Admin/Guru/Orang Tua dibuat oleh Admin, bukan self-register.

## Prefix ID Entitas
- Owner: OWN-0001
- Admin: ADM-0001
- Guru: GUR-2026-0001
- Orang Tua: PAR-2026-0001
- Siswa: STD-2026-0001
- Program: PRG-0001
- Kelas: KLS-2026-0001
- Tagihan (Invoice): INV-2026-000001
- Pembayaran digital: PAY-2026-000001
- Cash: CASH-2026-000001
- Absensi: ATT-2026-000001
- Sertifikat: CERT-2026-000001

## Fitur yang SENGAJA TIDAK dibangun di versi ini
- Akun login untuk Siswa.
- Integrasi WhatsApp otomatis (reminder pembayaran/jadwal).
- Skema pembayaran cicilan/bertahap kompleks.
- Modul progress belajar rutin per pertemuan / raport rutin.

## Hal yang Masih Perlu Dikunci (jadikan Settings, jangan hardcode)
- Provider payment gateway final untuk VA/E-Wallet/QRIS & kemampuan webhook status otomatis.
- Kategori merchant QRIS dan MDR final dari PJP.
- Timing pembuatan tagihan per pertemuan: sebelum atau sesudah sesi.
- Aturan sesi hangus untuk kelas grup vs kelas privat.
- Formula honor: pembulatan durasi, overtime, komponen bonus.
- Formula nilai akhir, bobot komponen, nilai minimum lulus, siapa final verifier sertifikat.
- Template sertifikat per program/level jika desainnya berbeda-beda.
- Apakah cash nominal besar butuh approval Owner atau cukup verifikasi Admin.
- Frekuensi backup dan prosedur restore data.

## Prioritas Build
1. Auth + role-based routing & layout per role
2. Data Siswa/Orang Tua/Guru/Program/Level/Kelas (CRUD dasar) + Enrollment
3. Jadwal + calendar view + conflict detection + reschedule
4. Absensi siswa & logbook guru
5. Tagihan & Pembayaran (digital + cash, dengan flow konfirmasi)
6. Honor guru (khusus Owner)
7. Pengumuman
8. Nilai akhir & Sertifikat
9. Dashboard & Laporan
10. Inventaris (jika ada waktu)

## Panduan UI & Animasi
- Mobile-first untuk Guru dan Orang Tua (kemungkinan besar akses dari HP); Owner/Admin
  desktop-first tapi tetap responsif.
- Badge status (tagihan, absensi, enrollment) pakai warna konsisten merah/kuning/hijau dengan
  transisi warna halus, bukan ganti instan.
- Kalender jadwal: drag-and-drop untuk reschedule, dengan validasi bentrok real-time (highlight
  merah sebelum disimpan jika bentrok).
- Dashboard Owner: angka statistik pakai count-up animation saat pertama load.
- Loading state pakai skeleton screen sesuai bentuk konten asli, bukan spinner generik.
- Modal konfirmasi untuk aksi penting (konfirmasi cash, generate sertifikat, publish pengumuman,
  approve/reject enrollment) pakai scale-in + backdrop blur.

## Instruksi Build
Mulai dengan front-end + data dummy dulu mengikuti struktur role, data master, dan business rules
di atas, sesuai urutan Prioritas Build. Semua item di bagian "Hal yang Masih Perlu Dikunci"
dijadikan pengaturan (Settings) yang bisa diubah Owner, bukan nilai tetap di kode. Jangan bangun
fitur di bagian "SENGAJA TIDAK dibangun" kecuali diminta ulang secara eksplisit.
