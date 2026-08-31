# 📋 Product Requirements Document (PRD)
## BSD After School Club — Web App Manajemen Akademik

> **Versi:** 1.0  
> **Terakhir diperbarui:** 31 Agustus 2026  
> **Status:** Draft Aktif

---

## 1. Ringkasan Produk

Web app manajemen akademik untuk after-school club, dengan **4 role akun**: Owner, Admin, Guru, Orang Tua.  
Siswa **tidak punya akun login** — datanya dikelola oleh Admin/Guru.

### Modul Inti

| Modul | Deskripsi |
|---|---|
| Manajemen Siswa, Program & Kelas | CRUD data siswa, paket, dan pengelompokan kelas |
| Jadwal & Absensi / Logbook Guru | Kalender sesi, reschedule, checklist kehadiran, catatan materi |
| Pembayaran (digital + cash) & Tagihan | VA, E-Wallet, QRIS, cash via Admin/Orang Tua |
| Honor Guru | Kalkulasi otomatis berdasar sesi (Owner only) |
| Laporan & Sertifikat | Laporan akademik, generate sertifikat, PDF download |
| Pengumuman | Broadcast per role, draft & publish |

---

## 2. Role & Hak Akses

| Role | Landing setelah login | Menu Utama |
|---|---|---|
| **Owner / Super Admin** | Dashboard eksekutif | Dashboard, Akademik, Siswa, Guru, Pembayaran, Honor, Laporan, Pengumuman, Pengaturan |
| **Admin** | Dashboard operasional | Dashboard, Pendaftaran, Siswa & Orang Tua, Program/Kelas, Jadwal, Pembayaran, Absensi/Logbook (monitor), Pengumuman |
| **Guru** | Kelas hari ini | Jadwal Saya, Kelas & Absensi, Logbook, Assessment (jika diaktifkan), Pengumuman |
| **Orang Tua** | Ringkasan anak | Anak Saya, Jadwal, Tagihan & Pembayaran, Laporan Akhir (jika Graduated), Pengumuman |

> [!IMPORTANT]
> **Prinsip keamanan honor:** Data honor guru **tidak pernah muncul** di UI Admin/Guru — bukan sekadar disembunyikan via permission, tapi memang tidak ada elemen, route, atau network request yang bocor ke role selain Owner.

---

## 3. Peta Halaman (Sitemap)

```
/login
/dashboard                     (konten berbeda per role)

── Owner & Admin ──────────────────────────────────────────
/students                      daftar siswa
/students/:id                  detail siswa (profil, paket, tagihan, riwayat, progress)
/parents                       daftar orang tua
/programs                      daftar program
/classes                       daftar kelas/group
/classes/:id                   detail kelas (jadwal, roster, logbook history)
/schedule                      kalender jadwal (dengan reschedule)
/billing                       daftar tagihan semua siswa
/billing/:id                   detail tagihan + konfirmasi cash
/payments/cash/new             form input cash oleh Admin
/reports                       laporan Owner (akademik + keuangan)
/reports/certificates          generate & kelola sertifikat
/announcements                 kelola pengumuman
/settings                      pengaturan sistem, tarif honor (Owner only)

── Owner Only ─────────────────────────────────────────────
/payroll                       honor guru per periode
/payroll/:teacherId            detail honor + riwayat sesi

── Guru ───────────────────────────────────────────────────
/my-schedule                   jadwal mengajar
/my-classes/:id                absen + isi logbook + materi
/my-classes/:id/assessment     input nilai (jika fitur aktif)

── Orang Tua ──────────────────────────────────────────────
/my-children                   daftar anak terhubung
/my-children/:id               jadwal, progress ringkas
/my-children/:id/billing       tagihan & riwayat pembayaran
/my-children/:id/report        laporan akhir & sertifikat (setelah Graduated)
/announcements                 (read-only)
```

---

## 4. Alur Utama (User Flows)

### 4.1 Pembayaran Digital — Orang Tua

```
Orang Tua login
  → buka Tagihan
    → pilih tagihan berstatus "Belum Bayar"
      → pilih metode: VA / E-Wallet / QRIS
        → redirect/modal payment gateway
          → [sukses]         status otomatis "Paid" + masuk riwayat
          → [gagal/pending]  status tetap "Belum Bayar", tampilkan retry
```

**Animasi yang disarankan:**
- Status tagihan: badge **color-morph** merah → kuning "Menunggu" → hijau "Lunas" (scale + fade, bukan reload halaman).
- Saat menunggu gateway: **skeleton/pulsing loader**, bukan spinner generik.

---

### 4.2 Pembayaran Cash — Jalur Orang Tua

```
Orang Tua pilih metode "Cash" pada tagihan
  → status: "Menunggu Konfirmasi Admin"  ← BUKAN langsung Lunas
  → Admin menerima notifikasi / lihat antrian cash di dashboard
    → Admin buka detail → konfirmasi jumlah diterima
      → status → "Paid/Lunas"
      → nomor transaksi CASH-#### tergenerate otomatis
```

---

### 4.3 Pembayaran Cash — Jalur Admin Langsung

```
Admin buka profil siswa → tab Tagihan
  → pilih tagihan → pilih Cash → input nominal → konfirmasi
    → transaksi tercatat instan, status Paid
```

> [!NOTE]
> Kedua jalur cash harus terlihat jelas berbeda di riwayat transaksi:  
> badge **"via Orang Tua"** vs **"via Admin"** — untuk keperluan audit trail.

---

### 4.4 Absensi & Logbook Guru

```
Guru login → Jadwal Saya (kartu kelas hari ini, sorted by jam)
  → tap kelas → halaman Kelas
    → checklist kehadiran siswa (toggle hadir / izin / alpha)
    → isi materi / pokok bahasan (rich text singkat)
    → simpan → tercatat sebagai teaching session (dasar honor)
```

**Animasi:**
- Toggle absensi: **bounce micro-interaction**, warna berubah instan tapi ada bounce kecil.
- Progress bar `X/Y siswa sudah diabsen` naik **smooth** saat setiap toggle.

---

### 4.5 Reschedule / Jadwal

```
Admin buka Jadwal (calendar view)
  → drag sesi ke tanggal lain  ATAU  klik sesi → "Reschedule"
    → pilih tanggal/jam baru → simpan
      → nomor pertemuan TETAP SAMA, hanya tanggal berubah
      → riwayat reschedule tercatat di detail sesi
```

**Animasi:**
- Drag-and-drop: smooth drag preview + drop-zone highlight.
- Setelah drop: kartu sesi "settle" dengan easing (bukan snap kasar).

---

### 4.6 Generate Sertifikat

```
Admin input nilai / komponen assessment siswa
  → sistem hitung nilai akhir otomatis (formula 🔒 TBD)
  → status Lulus / Tidak Lulus ditentukan sistem
  → Owner/Admin verifikasi final
    → tombol "Generate Sertifikat" aktif
      → sertifikat dibuat dari template sesuai program
        → siswa status → "Graduated"
          → Orang Tua otomatis bisa lihat laporan akhir + sertifikat
```

**Animasi:**
- Saat generate sukses: preview sertifikat **reveal animation** (fade + slight scale-up), opsi download PDF langsung dari situ.

---

### 4.7 Pengumuman

```
Owner/Admin → Pengumuman → "Tambah Pengumuman"
  → isi judul, tanggal, deskripsi, upload poster (opsional), pilih target
  → simpan sebagai Draft  ATAU  langsung Publish
    → [Publish] muncul di dashboard user target dengan indikator "Baru"
```

**Animasi:**
- Kartu pengumuman baru: **slide-in + subtle glow** badge "Baru" yang fade out setelah dibaca.

---

## 5. Panduan Komponen & Animasi

| Elemen | Perilaku |
|---|---|
| Status tagihan / badge | Color transition halus, tidak instan berubah warna |
| Navigasi antar halaman | Page transition fade/slide ringan (150–250ms), hindari flash putih |
| Dashboard cards (Owner) | Angka statistik pakai **count-up animation** saat pertama load |
| Loading state | **Skeleton screen** sesuai bentuk konten asli (bukan spinner polos) |
| Konfirmasi aksi penting | Modal dengan **scale-in + backdrop blur** |
| Kalender jadwal | Hover pada sesi: tooltip ringkas (siswa, jam, guru) dengan fade-in cepat |
| Toggle absensi | Micro-interaction per tap, warna berubah instan + bounce kecil |
| Empty state | Ilustrasi ringan + CTA, bukan halaman kosong polos |

### Tone Visual & Responsivitas

- **Tone:** Bersih, ramah (target user termasuk orang tua non-teknis).
- **Warna status:** Merah / Kuning / Hijau konsisten di semua modul.
- **Tipografi:** Mudah dibaca di mobile (banyak orang tua akses via HP).
- **Responsivitas:**
  - **Mobile-first** → role Orang Tua & Guru (kemungkinan besar akses via HP).
  - **Desktop-first tapi tetap responsif** → Owner & Admin.

---

## 6. Struktur Data & Prefix ID

| Entitas | Prefix | Contoh |
|---|---|---|
| Owner | `OWN` | `OWN-0001` |
| Admin | `ADM` | `ADM-0001` |
| Guru | `GUR` | `GUR-2026-0001` |
| Orang Tua | `PAR` | `PAR-2026-0001` |
| Siswa | `STD` | `STD-2026-0001` |
| Program | `PRG` | `PRG-0001` |
| Kelas | `KLS` | `KLS-2026-0001` |
| Tagihan | `INV` | `INV-2026-000001` |
| Pembayaran digital | `PAY` | `PAY-2026-000001` |
| Cash | `CASH` | `CASH-2026-000001` |
| Absensi | `ATT` | `ATT-2026-000001` |
| Sertifikat | `CERT` | `CERT-2026-000001` |

---

## 7. Fitur yang SENGAJA Tidak Dibuat

> [!CAUTION]
> Jangan tambahkan fitur-fitur berikut ke UI, meskipun secara teknis memungkinkan:

- Login / akun untuk siswa
- Form input "catatan progress" per pertemuan oleh guru
- Reminder WhatsApp otomatis
- Form pendaftaran mandiri panjang untuk Orang Tua (enrollment tetap lewat Admin)
- Tampilan nominal honor di role selain Owner

---

## 8. Hal yang Masih 🔒 TBD

> [!WARNING]
> Jangan hardcode nilai-nilai berikut sebagai final. Buat sebagai **settings/config** yang dapat diubah Owner dari `/settings` — sehingga tidak perlu re-build UI saat keputusan final keluar.

| Item | Keterangan |
|---|---|
| Provider payment gateway | VA / E-Wallet / QRIS final & kemampuan webhook |
| Kategori merchant & MDR QRIS | Bergantung provider final |
| Timing trigger tagihan | Sebelum vs sesudah sesi |
| Aturan sesi hangus | Kelas grup vs privat |
| Formula honor | Pembulatan durasi, overtime, bonus |
| Formula nilai akhir | Bobot komponen sertifikat |
| Approval cash nominal besar | Apakah perlu approval Owner |
| Frekuensi backup/restore | TBD oleh tim teknis |

---

## 9. Prioritas Build (Urutan Pengerjaan)

| # | Modul | Keterangan |
|---|---|---|
| 1 | Auth + role-based routing & layout per role | Fondasi semua fitur |
| 2 | Dashboard shell | Kosong dulu, fokus layout + navigasi |
| 3 | Modul Siswa / Program / Kelas | CRUD dasar |
| 4 | Modul Jadwal + kalender + reschedule | Fitur drag-and-drop |
| 5 | Modul Absensi / Logbook Guru | Toggle + progress bar |
| 6 | Modul Tagihan & Pembayaran | Digital + cash, flow konfirmasi |
| 7 | Modul Honor | Owner only |
| 8 | Modul Pengumuman | Broadcast per role |
| 9 | Modul Laporan & Sertifikat | Generate + PDF download |
| 10 | Polish animasi & micro-interactions | Semua modul |

---

*Dokumen ini adalah living document — akan diperbarui seiring keputusan produk yang semakin matang.*
