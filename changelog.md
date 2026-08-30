# BSD AFTER SCHOOL CLUB
# PROJECT CHANGELOG & DECISION LOG

Dokumen ini digunakan untuk mencatat seluruh perubahan requirement,
keputusan client, revisi business rule, perubahan UI/UX, dan keputusan
teknis selama pengembangan aplikasi BSD After School Club.

---

## Cara Menggunakan Dokumen

Setiap ada perubahan requirement atau keputusan baru:

1. Tambahkan entry baru di bagian paling atas.
2. Jangan menghapus histori perubahan sebelumnya.
3. Jelaskan:
   - tanggal
   - area/modul
   - perubahan
   - alasan
   - dampak
   - status
4. Jika perubahan sudah menggantikan requirement lama,
   tuliskan requirement lama dan requirement baru.

---

# CHANGE HISTORY

## [2026-08-28] — Initial Final Requirement

### Area
System / General

### Perubahan
Menetapkan Owner Dashboard sebagai visual dan UX reference utama
untuk seluruh aplikasi.

### Keputusan
Semua halaman dan role harus mengikuti:

- layout
- typography
- spacing
- component style
- color system
- responsive behavior
- interaction pattern

dari Owner Dashboard.

### Impact
Owner Dashboard menjadi halaman pertama yang dikembangkan
dan menjadi referensi visual untuk Admin, Guru, dan Orang Tua.

### Status
FINAL

---

## [2026-08-28] — User Roles

### Area
Authentication / User Management

### Requirement Lama
Terdapat kemungkinan akun Siswa.

### Requirement Baru
Hanya terdapat 4 jenis akun:

1. Owner / Super Admin
2. Admin
3. Guru
4. Orang Tua

Tidak terdapat akun login khusus Siswa.

### Impact
Siswa hanya menjadi entity/data record dalam sistem.

### Status
FINAL

---

## [2026-08-28] — Payment System

### Area
Payment

### Requirement Baru

Metode pembayaran:

- Virtual Account
- E-Wallet
- QRIS
- Cash

Skema pembayaran:

- Bayar per Pertemuan
- Bayar Lunas

### Paket Pertemuan

8 Pertemuan:
- 2 kali per minggu

12 Pertemuan:
- 3 kali per minggu

### Business Rule

Hari libur tidak dihitung sebagai pertemuan.

Reschedule tidak mengubah nomor pertemuan.

### Status
FINAL

---

## [2026-08-28] — Cash Payment

### Area
Payment / Cash

### Requirement

Pembayaran Cash dapat dilakukan melalui dua jalur:

A. Parent submits Cash Payment

Orang tua dapat memilih Cash dari akun mereka,
kemudian mengirim informasi pembayaran.

Status:
Menunggu Verifikasi Admin.

B. Admin Records Cash Payment

Admin dapat langsung mencatat pembayaran Cash
ketika orang tua membayar secara offline.

### Business Rule

Cash payment dari Parent tidak langsung menjadi Lunas.

Admin harus melakukan verifikasi.

### Status
FINAL

---

## [2026-08-28] — Teacher Honor

### Area
Teacher / Payroll

### Requirement

Honor guru dihitung berdasarkan:

Durasi mengajar × Tarif per jam

### Permission

Hanya Owner / Super Admin yang dapat:

- melihat honor guru
- mengatur tarif honor
- melihat bonus
- melihat payroll

Admin dan Guru tidak dapat melihat nominal honor.

### Status
FINAL

---

## [2026-08-28] — Teacher Logbook

### Area
Teacher / Attendance

### Requirement

Guru menggunakan fitur Logbook untuk mencatat:

- sesi mengajar
- tanggal
- jam mulai
- jam selesai / durasi
- materi
- keterangan jika diperlukan

Data sesi menjadi dasar perhitungan jam mengajar.

### Status
FINAL

---

## [2026-08-28] — Student Progress

### Area
Academic

### Perubahan

Catatan progress per siswa/pertemuan DIHAPUS.

### Alasan

Client tidak ingin menambah beban input rutin guru.

### Impact

Jangan membuat fitur:

- progress note per meeting
- catatan perkembangan rutin
- teacher progress journal

Kebutuhan akademik akhir menggunakan data assessment/nilai.

### Status
FINAL

---

## [2026-08-28] — Assessment & Certificate

### Area
Assessment / Report / Certificate

### Requirement

Alur:

Assessment
→ Final Score
→ Final Report
→ Graduated
→ Certificate

### Initial Implementation Recommendation

Guru melakukan assessment.

Admin memasukkan/merapikan nilai final ke sistem.

Sistem menghitung nilai akhir.

Setelah data diverifikasi:

Sistem generate laporan akhir dan sertifikat.

### Catatan

Komponen nilai, bobot, minimum kelulusan, dan final verification
harus ditentukan sebelum development final.

### Status
FINAL CONCEPT
DETAIL PENDING

---

## [2026-08-28] — Announcement

### Area
Communication

### Permission

Owner dan Admin dapat membuat pengumuman.

### Fields

- Judul
- Tanggal
- Deskripsi
- Poster/Gambar
- Target
- Status

### Status

- Draft
- Published
- Archived

### Status
FINAL

---

## [2026-08-28] — WhatsApp Integration

### Area
Communication / Payment Reminder

### Perubahan

Automatic WhatsApp payment reminder DIHAPUS.

### Impact

Jangan membuat:

- WhatsApp payment automation
- automatic WhatsApp billing reminder
- WhatsApp payment notification

Reminder pembayaran hanya tampil di dalam aplikasi.

### Status
FINAL

---

# CHANGE TEMPLATE

Gunakan template berikut untuk perubahan berikutnya:

## [YYYY-MM-DD] — Nama Perubahan

### Area
Nama modul / fitur

### Requirement Lama

Jelaskan requirement sebelumnya.

### Requirement Baru

Jelaskan requirement terbaru.

### Alasan

Kenapa requirement berubah.

### Impact

Apa yang harus berubah di:

- UI/UX
- Frontend
- Backend
- Database
- Business logic

### Status

- DRAFT
- DISCUSSION
- APPROVED
- FINAL
- DEPRECATED

---

# IMPORTANT FINAL RULES

Beberapa keputusan berikut dianggap sebagai business rules utama:

- Hanya 4 role: Owner, Admin, Guru, Orang Tua.
- Tidak ada akun login Siswa.
- Owner Dashboard adalah visual reference utama.
- Pembayaran: VA, E-Wallet, QRIS, Cash.
- Pembayaran hanya per Pertemuan atau Lunas.
- Paket 8 = 2x/minggu.
- Paket 12 = 3x/minggu.
- Hari libur tidak dihitung sebagai pertemuan.
- Reschedule tidak mengubah nomor pertemuan.
- Cash dapat dicatat Parent atau Admin.
- Cash yang diajukan Parent harus diverifikasi Admin.
- Honor guru hanya dapat dilihat Owner/Super Admin.
- Tarif honor dapat diubah Owner/Super Admin.
- Honor berdasarkan jam mengajar.
- Guru menggunakan logbook.
- Progress note per pertemuan dihapus.
- Laporan akhir menjadi dasar sertifikat.
- Orang Tua melihat laporan akhir setelah Graduated.
- Tidak ada automatic WhatsApp payment reminder.