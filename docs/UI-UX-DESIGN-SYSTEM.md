# UI/UX Design System
## BSD After School Club — Panduan Konsistensi Visual

> **Versi:** 1.0 | **Terakhir diperbarui:** 31 Agustus 2026  
> Dokumen ini adalah **sumber kebenaran tunggal** untuk semua keputusan visual. Setiap halaman baru WAJIB mengacu ke sini sebelum menulis satu baris CSS pun.

---

## 1. Warna (Color Tokens)

Semua warna menggunakan CSS variables dari `globals.css`. **Jangan pernah hardcode hex langsung** — selalu pakai token.

### Brand & Primary

| Token | Nilai Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#1a5c8a` | Tombol utama, sidebar aktif, link |
| `--color-primary-dark` | `#134570` | Hover state tombol primary |
| `--color-primary-light` | `#2a7ab8` | Aksen sekunder |
| `--color-primary-bg` | `#e8f1f8` | Background ringan bertema primary |
| `--primary-blue` | `#3AABE3` | Auth page, focus ring, badge |

### Accent / Orange

| Token | Nilai Hex | Penggunaan |
|---|---|---|
| `--color-accent` | `#f59e0b` | CTA sekunder, tombol bayar, badge warning |
| `--color-accent-dark` | `#d97706` | Hover state accent |
| `--color-accent-light` | `#fbbf24` | Highlight ringan |
| `--color-accent-bg` | `#fef3c7` | Background badge warning |

### Neutrals

| Token | Nilai Hex | Penggunaan |
|---|---|---|
| `--color-bg` | `#f4f6f9` | Background halaman utama |
| `--color-surface` | `#ffffff` | Background card, modal, sidebar |
| `--color-border` | `#e2e8f0` | Border card, divider |
| `--color-border-light` | `#f1f5f9` | Divider antar list item |

### Teks

| Token | Nilai Hex | Penggunaan |
|---|---|---|
| `--color-text-primary` | `#1a202c` | Judul, body text utama |
| `--color-text-secondary` | `#4a5568` | Subtext, label |
| `--color-text-muted` | `#718096` | Placeholder, hint, timestamp |
| `--color-text-inverse` | `#ffffff` | Teks di atas background gelap |

### Status (Konsisten di SEMUA modul)

| Token | Hex | Badge BG | Penggunaan |
|---|---|---|---|
| `--color-success` | `#10b981` | `--color-success-bg` `#d1fae5` | Lunas, Selesai, Hadir |
| `--color-warning` | `#f59e0b` | `--color-warning-bg` `#fef3c7` | Menunggu Konfirmasi, Pending |
| `--color-danger` | `#ef4444` | `--color-danger-bg` `#fee2e2` | Belum Bayar, Alpha, Error |
| `--color-info` | `#3b82f6` | `--color-info-bg` `#dbeafe` | Informasi, In Progress |

> [!IMPORTANT]
> Warna status **harus konsisten di semua modul**. Tagihan "Belum Bayar" di halaman apapun selalu merah (`--color-danger`). Jangan gunakan warna berbeda untuk makna yang sama.

### Role Colors (Badge Portal)

| Role | Background | Teks |
|---|---|---|
| Owner | `#dbeafe` | `#1e40af` |
| Admin | `#ccfbf1` | `#0f766e` |
| Guru | `#f3e8ff` | `#6d28d9` |
| Orang Tua | `#e0f2fe` | `#0369a1` |

---

## 2. Tipografi

### Font Family
```css
font-family: var(--font-sans);
/* = var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif) */
```
**Inter** adalah satu-satunya font yang digunakan. Tidak ada font lain.

### Skala Ukuran Font

| Nama | Ukuran | Font Weight | Penggunaan |
|---|---|---|---|
| Page Title | `24px` | `700–800` | `<h1>` judul halaman |
| Card Title | `15–16px` | `700–800` | Judul section/card |
| Body Default | `13.5px` | `400–500` | Konten utama, teks paragraf |
| Label / Caption | `12–12.5px` | `500–600` | Label form, subtext card |
| Badge / Tag | `11–11.5px` | `700` | Status badge, chip |
| Micro | `10–11px` | `600–700` | Section label uppercase, timestamp |

### Aturan Tipografi

```
Page Title:   font-size: 24px;  font-weight: 800;  color: var(--color-text-primary);  letter-spacing: -0.02em;
Card Title:   font-size: 15px;  font-weight: 700;  color: var(--color-text-primary);
Body:         font-size: 13.5px; font-weight: 400; color: var(--color-text-secondary);
Label (form): font-size: 12.5px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;
Badge:        font-size: 11px;  font-weight: 700;  padding: 3–5px 10–12px;
```

---

## 3. Spacing

Gunakan token spacing — jangan nilai pixel acak.

| Token | Nilai | Setara |
|---|---|---|
| `--space-1` | `4px` | gap antar icon & teks kecil |
| `--space-2` | `8px` | gap antar elemen dalam grup |
| `--space-3` | `12px` | gap sidebar item, padding kecil |
| `--space-4` | `16px` | padding card, gap grid |
| `--space-5` | `20px` | padding card standar |
| `--space-6` | `24px` | padding page-content, gap section |
| `--space-8` | `32px` | gap besar antar section |
| `--space-10` | `40px` | padding ekstra besar |

### Padding Standar per Komponen

| Komponen | Padding |
|---|---|
| Page content area | `var(--space-6)` = 24px semua sisi |
| Card / panel | `var(--space-5)` = 20px (atau `20px 24px`) |
| Tombol (default) | `9px 18px` |
| Tombol (sm) | `6px 12px` |
| Input field | `12px 16px` |
| Modal | `24px` semua sisi |
| Table cell | `14–16px 20px` |

---

## 4. Border Radius

| Token | Nilai | Penggunaan |
|---|---|---|
| `--radius-sm` | `6px` | Badge kecil, chip, tag |
| `--radius-md` | `10px` | Input, tombol, icon container |
| `--radius-lg` | `14px` | Card, panel, dropdown |
| `--radius-xl` | `18px` | Modal, auth card besar |
| `--radius-full` | `9999px` | Avatar, pill badge, search bar |

---

## 5. Shadow

| Token | Nilai | Penggunaan |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Card default |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Dropdown, hover state |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.10)` | Modal, floating panel |

---

## 6. Layout & Grid

### App Shell
```
Sidebar: 220px fixed (--sidebar-width)
Header:  64px fixed  (--header-height)
Content: flex: 1, overflow-y: auto, padding: 24px
```

### Grid Standar

| Class | Kolom | Penggunaan |
|---|---|---|
| `.stat-grid` | `repeat(4, 1fr)` | Kartu statistik Owner/Admin |
| `.grid-2` | `1fr 1fr` | Dua panel setara |
| `.grid-3-2` | `3fr 2fr` | Konten utama + sidebar kanan |
| `.grid-2-3` | `2fr 3fr` | Sidebar kiri + konten utama |

> Untuk halaman Orang Tua & Guru gunakan `repeat(auto-fit, minmax(280px, 1fr))` agar responsive di mobile.

### Responsive Breakpoints

| Breakpoint | Lebar | Target |
|---|---|---|
| Mobile | `< 640px` | Orang Tua, Guru (primary) |
| Tablet | `640px – 1024px` | Semua role |
| Desktop | `> 1024px` | Owner, Admin (primary) |

---

## 7. Komponen Standar

### 7.1 Card
```css
/* Gunakan class .card atau inline style berikut: */
background: var(--color-surface);        /* #ffffff */
border-radius: var(--radius-lg);         /* 14px */
border: 1px solid var(--color-border);   /* #e2e8f0 */
box-shadow: var(--shadow-sm);
padding: var(--space-5);                 /* 20px */
```

### 7.2 Tombol

```css
/* Primary — aksi utama halaman */
.btn-primary → background: #1a5c8a; color: white; hover: #134570

/* Accent/Orange — pembayaran, CTA menonjol */
.btn-accent → background: #f59e0b; color: white; hover: #d97706
             box-shadow: 0 4px 12px rgba(245,158,11,0.25)

/* Outline — aksi sekunder */
.btn-outline → background: white; color: #1a5c8a; border: 1.5px solid #1a5c8a

/* Ghost — aksi tersier / cancel */
.btn-ghost → background: transparent; border: 1px solid #e2e8f0

/* Ukuran default: padding 9px 18px, font-size 13.5px, font-weight 600 */
/* Ukuran sm:      padding 6px 12px, font-size 12.5px */
```

### 7.3 Badge / Status

```css
/* Pola umum semua badge: */
font-size: 11px; font-weight: 700; border-radius: var(--radius-sm);
padding: 3px 10px; (kecil)  atau  padding: 5px 12px; (normal)

/* Status Lunas / Selesai */
background: #d1fae5; color: #10b981;

/* Status Menunggu Konfirmasi */
background: #fef3c7; color: #b45309;

/* Status Belum Bayar */
background: #fee2e2; color: #dc2626;

/* Status Aktif */
background: #e0f2fe; color: #0369a1;
```

### 7.4 Form Input

```css
width: 100%; padding: 12px 16px;
font-size: 13.5px; color: #374151;
border: 1.5px solid var(--color-border);  /* #e2e8f0 */
border-radius: var(--radius-md);           /* 10px */
background: white; outline: none;
transition: border-color 0.25s ease, box-shadow 0.25s ease;

/* Focus state */
border-color: var(--color-primary);       /* #1a5c8a */
box-shadow: 0 0 0 3px rgba(26,92,138,0.1);
```

### 7.5 Tabel

```css
/* Header row */
padding: 14px 20px; font-size: 11px; font-weight: 700;
color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;
border-bottom: 1px solid var(--color-border);

/* Data row */
padding: 16px 20px; font-size: 13.5px;
border-bottom: 1px solid var(--color-border-light);  /* antar baris */

/* ID/kode */
font-family: monospace; font-size: 13px; color: #475569;
```

### 7.6 Modal

```css
/* Backdrop */
position: fixed; inset: 0;
background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
z-index: 100; animation: fadeIn 0.2s ease-out;

/* Panel modal */
background: white; border-radius: var(--radius-xl);  /* 18px */
max-width: 520px; width: 100%; padding: 24px;
box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
```

### 7.7 Sidebar Navigation

```css
/* Item default */
padding: 9px 16px; margin: 1px 8px;
border-radius: var(--radius-md);
font-size: 13.5px; font-weight: 500; color: #4a5568;
transition: all 0.15s ease;

/* Hover */
background: #f0f7ff; color: var(--color-primary);

/* Active */
background: #1a5c8a; color: white;
```

### 7.8 Avatar / Inisial

```css
/* Ukuran standar */
width: 36px; height: 36px; border-radius: 50%;

/* Avatar inisial */
background: gradient atau warna brand;
color: white; font-weight: 700; font-size: 13–14px;
display: flex; align-items: center; justify-content: center;
```

---

## 8. Animasi & Transisi

### Keyframes Standar (sudah ada di globals.css)

```css
/* Masuk modal dari bawah */
@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(18px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* Fade backdrop modal */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Loader spinner */
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animasi kartu masuk dari bawah (auth) */
@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Animasi sukses (centang, dll) */
@keyframes pulseCheck {
  0%   { transform: scale(0.8); opacity: 0; }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
}
```

### Durasi & Easing Standar

| Konteks | Durasi | Easing |
|---|---|---|
| Hover / micro-interaction | `150ms` | `ease` |
| Transisi halaman | `200–250ms` | `ease-out` |
| Modal masuk | `250ms` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Animasi kartu auth | `600ms` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Progress bar fill | `300ms` | `ease` |

### Aturan Animasi

| Elemen | Perilaku |
|---|---|
| Tombol `:hover` | `background` berubah + optional `box-shadow` (150ms) |
| Tombol `:active` | `transform: scale(0.98)` |
| Input `:focus` | border + ring shadow (250ms) |
| Sidebar item | `background` + `color` (150ms) |
| Modal buka | fade backdrop + slideUp panel |
| Status badge | Jangan ganti warna secara instan — pakai `transition: all 0.3s ease` |
| Loading state | Skeleton screen, bukan plain spinner |
| Count-up angka | Hanya di dashboard Owner saat pertama load |
| Empty state | Ilustrasi + teks CTA, bukan halaman kosong |

---

## 9. Ikon

- Library: **Lucide React** (sudah dipakai di seluruh project)
- Ukuran default: `17×17px` di sidebar, `18×18px` di action icon, `20×20px` di header
- `stroke-width: 2` untuk ikon regular, `stroke-width: 2.5–3` untuk ikon bold (centang status, dll)
- Warna selalu inherit dari parent atau pakai token warna

---

## 10. Sidebar & Header — Nilai Tetap

```
Sidebar width : 220px   (--sidebar-width)
Header height : 64px    (--header-height)
Sidebar bg    : #ffffff (--sidebar-bg)
Header bg     : #ffffff (--header-bg)
Active item   : #1a5c8a (--sidebar-active-bg) + white text
Hover item    : #f0f7ff (--sidebar-hover-bg)
Logo icon bg  : #1a5c8a (--color-primary)
```

---

## 11. Tone & Persona Visual

| Aspek | Panduan |
|---|---|
| **Target user** | Orang tua non-teknis + guru + admin sekolah |
| **Tone** | Bersih, hangat, profesional — bukan dingin/korporat |
| **Kepadatan** | Sedang — tidak terlalu padat, tidak terlalu kosong |
| **Warna dominan** | Biru primary `#1a5c8a` + aksen oranye `#f59e0b` |
| **Mobile priority** | Role Orang Tua & Guru: mobile-first |
| **Desktop priority** | Role Owner & Admin: desktop-first tapi tetap responsif |

---

## 12. Hal yang DILARANG

> [!CAUTION]
> Pelanggaran berikut akan menciptakan inkonsistensi visual antar halaman:

- [X] Hardcode warna hex tanpa token (`color: #1a5c8a` → `color: var(--color-primary)`)
- [X] Menggunakan font selain **Inter**
- [X] Membuat ukuran radius baru di luar token yang ada
- [X] Spinner polos sebagai loading state (gunakan skeleton)
- [X] Status badge dengan warna berbeda dari standar di atas
- [X] Mengubah `--sidebar-width` atau `--header-height` per halaman
- [X] Z-index acak — modal harus `z-index: 100`, sidebar `z-index: 40`, header `z-index: 30`
- [X] Animasi dengan durasi > 400ms untuk interaksi rutin (terasa lambat)
- [X] Halaman kosong tanpa empty state (selalu sertakan ilustrasi + CTA)

---

## 13. Checklist Sebelum Merge Halaman Baru

- [ ] Warna semua menggunakan CSS token dari `globals.css`
- [ ] Font Inter, ukuran sesuai skala tipografi di atas
- [ ] Padding & gap menggunakan `--space-*` token
- [ ] Border radius menggunakan `--radius-*` token
- [ ] Shadow menggunakan `--shadow-*` token
- [ ] Status badge warna konsisten (merah/kuning/hijau)
- [ ] Loading state menggunakan skeleton, bukan spinner
- [ ] Modal memiliki backdrop blur + `modalSlideUp` animation
- [ ] Tombol primary / accent / outline / ghost sesuai konteks
- [ ] Responsif dicek di lebar ≤ 640px (khusus role Orang Tua & Guru)
- [ ] Empty state ada ilustrasi + CTA
- [ ] Tidak ada font hardcode, hex hardcode, atau radius acak

---

*Dokumen ini wajib diperbarui jika ada token atau komponen baru yang ditambahkan ke `globals.css`.*
