# Dokumentasi Endpoint API (Frontend Person 1)

Dokumen ini berisi daftar endpoint spesifik yang dikhususkan untuk cakupan tugas **Frontend Person 1**.

Semua endpoint di bawah ini menggunakan base URL: `http://localhost:8000/api/v1` (sesuaikan dengan domain lokal/server Anda) dan membutuhkan header `Authorization: Bearer <token_anda>`.

---

## 1. Halaman Siswa, Orang Tua, Guru

### A. Siswa (Students)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/students` | Mendapatkan daftar seluruh siswa |
| `POST` | `/students` | Menambah data siswa baru |
| `GET` | `/students/{id}` | Melihat detail data siswa tertentu |
| `PUT` | `/students/{id}` | Mengubah (update) data siswa |
| `DELETE` | `/students/{id}` | Menghapus data siswa |

### B. Orang Tua (Parents)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/parents` | Mendapatkan daftar orang tua |
| `POST` | `/parents` | Menambah data orang tua baru |
| `GET` | `/parents/{id}` | Melihat detail orang tua |
| `PUT` | `/parents/{id}` | Mengubah data orang tua |
| `DELETE` | `/parents/{id}` | Menghapus data orang tua |
| `POST` | `/parents/{parent}/students/{student}` | Mengaitkan seorang siswa (anak) ke orang tua |
| `DELETE` | `/parents/{parent}/students/{student}` | Melepas kaitan siswa dari orang tua |

### C. Guru (Teachers)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/teachers` | Mendapatkan daftar guru |
| `POST` | `/teachers` | Menambah data guru baru |
| `GET` | `/teachers/{id}` | Melihat detail guru |
| `PUT` | `/teachers/{id}` | Mengubah data guru |
| `DELETE` | `/teachers/{id}` | Menghapus data guru |

---

## 2. Halaman Program, Level, Kelas

### A. Program Studi & Level
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/programs` | Mendapatkan daftar program studi |
| `POST` | `/programs` | Menambah program studi |
| `PUT` | `/programs/{id}` | Mengubah program studi |
| `DELETE` | `/programs/{id}` | Menghapus program studi |
| `POST` | `/programs/{program}/levels` | Menambahkan tingkatan (level) ke dalam program |
| `PUT` | `/programs/{program}/levels/{level}` | Mengubah detail level |
| `DELETE` | `/programs/{program}/levels/{level}` | Menghapus level dari program |

### B. Ruang Kelas (Classrooms)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/classrooms` | Mendapatkan daftar kelas |
| `POST` | `/classrooms` | Membuat kelas baru |
| `PUT` | `/classrooms/{id}` | Mengubah detail kelas |
| `DELETE` | `/classrooms/{id}` | Menghapus kelas |
| `POST` | `/classrooms/{classroom}/teachers` | Menugaskan (assign) guru ke sebuah kelas |
| `DELETE` | `/classrooms/{classroom}/teachers/{teacher}` | Menghapus guru dari kelas tersebut |

---

## 3. Halaman Jadwal

### A. Jadwal Reguler (Class Schedules)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/class-schedules` | Mendapatkan daftar jadwal utama kelas |
| `POST` | `/class-schedules` | Membuat jadwal baru |
| `PUT` | `/class-schedules/{id}` | Mengubah jadwal utama |
| `DELETE` | `/class-schedules/{id}` | Menghapus jadwal |
| `POST` | `/class-schedules/{class_schedule}/generate-sessions` | Melakukan *generate* sesi pertemuan dari jadwal utama |

### B. Sesi Pertemuan (Class Sessions)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/class-sessions` | Mendapatkan daftar sesi/pertemuan kelas |
| `GET` | `/class-sessions/{id}` | Melihat detail suatu pertemuan |
| `PUT` | `/class-sessions/{id}` | Mengubah informasi pertemuan (jika perlu) |
| `POST` | `/class-sessions/{id}/reschedule` | Menjadwalkan ulang (reschedule) pertemuan tertentu |

---

## 4. Halaman Absensi & Logbook Guru

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/class-sessions/{class_session}/submit-attendance` | **Endpoint Utama:** Submit data absensi seluruh siswa beserta logbook/jurnal guru untuk satu pertemuan. |
| `GET` | `/student-attendances` | Melihat data historis absensi seluruh siswa |
| `GET` | `/teacher-logbooks` | Melihat data historis jurnal/logbook yang ditulis guru |

---

## 5. Halaman Honor Guru (khusus Owner)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/teacher-payrolls/generate` | Melakukan kalkulasi dan generate slip gaji/honor guru berdasarkan absensi mengajar. |
| `GET` | `/teacher-payrolls` | Melihat daftar slip gaji/honor guru. |
| `GET` | `/teacher-payrolls/{id}` | Melihat detail suatu slip gaji. |
| `PUT` | `/teacher-payrolls/{id}` | Mengubah status/info slip gaji. |
| `DELETE` | `/teacher-payrolls/{id}` | Menghapus data gaji. |

---

## 6. Dashboard Akademik

*(Saat ini tidak ada 1 endpoint khusus untuk keseluruhan dashboard akademik. Anda dapat menampilkan metrik dengan memanggil endpoint Index secara bersamaan).*
Contoh:
- Memanggil `GET /students` untuk menghitung total siswa.
- Memanggil `GET /teachers` untuk menghitung total guru.
- Memanggil `GET /class-sessions` untuk melihat kelas apa saja yang berstatus *ongoing* hari ini.

---
---

## 🚀 Instruksi Integrasi ke Front-End (Menggunakan Axios)

Agar integrasi rapi dan tidak perlu berulang kali menulis konfigurasi Token & URL, Anda sangat disarankan untuk membuat **Instance Axios** khusus.

### 1. Buat File Konfigurasi Axios
Buat sebuah file di project Frontend Anda, misalnya di `src/utils/axios.js` (atau sesuaikan dengan struktur folder React/Vue Anda).

```javascript
import axios from 'axios';

// 1. Konfigurasi URL utama ke Backend Laravel
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. Interceptor Request: Sisipkan Token secara otomatis
api.interceptors.request.use(
    (config) => {
        // Ambil token yang disimpan saat login (di localStorage)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor Response: Tangani Error Token Expired (401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Jika token tidak valid / sudah expired
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect otomatis ke halaman login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
```

### 2. Cara Penggunaan di Komponen Halaman

Setelah file di atas dibuat, Anda tinggal meng-import instance `api` tersebut dan menggunakannya. 

**Contoh: Halaman Menampilkan List Siswa (Halaman Siswa)**
```javascript
import React, { useEffect, useState } from 'react';
import api from '../utils/axios'; // Import instance axios yang kita buat

const StudentList = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Memanggil endpoint GET /students (Token dikirim otomatis)
                const response = await api.get('/students');
                setStudents(response.data);
            } catch (error) {
                console.error('Gagal mengambil data siswa:', error);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div>
            <h2>Daftar Siswa</h2>
            <ul>
                {students.map(student => (
                    <li key={student.id}>{student.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default StudentList;
```

**Contoh: Submit Form Tambah Program (Method POST)**
```javascript
import api from '../utils/axios';

const handleAddProgram = async (programData) => {
    try {
        const response = await api.post('/programs', programData);
        alert('Program berhasil ditambahkan!');
        console.log(response.data);
    } catch (error) {
        // Handle error validasi dari backend
        if (error.response && error.response.status === 422) {
            console.error('Error validasi:', error.response.data.errors);
        } else {
            console.error('Gagal menambah program:', error);
        }
    }
};
```
