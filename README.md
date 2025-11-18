# CMMS for Manufacturing (Computerized Maintenance Management System)

Proyek ini adalah sistem manajemen pemeliharaan berbasis web yang dirancang untuk lingkungan manufaktur. Sistem ini melacak aset, mengelola Work Order, menjadwalkan pemeliharaan, dan menyediakan laporan kinerja.

**Status Proyek:** **Feature Complete** (Semua modul inti sudah selesai).

## 🚀 Fitur Utama yang Sudah Diimplementasikan

| Modul | Fungsionalitas | Keterangan |
| :--- | :--- | :--- |
| **Authentication & RBAC** | Login, Register, Logout | Kontrol Akses Berbasis Peran (**Admin**, **Manager**, **Technician**). Pengguna pertama otomatis menjadi Admin. |
| **Gudang (Inventaris)** | CRUD, Stok Dinamis | **Master List** komponen (Spare Parts). Stok otomatis **berkurang** saat Work Order diselesaikan. |
| **Aset (Mesin)** | Create, Read, Update | Manajemen *Bill of Materials* (BOM) Aset. Form "Tambah Aset" terintegrasi dengan **Template Aset** (Gudang). |
| **Work Order (WO)** | CRUD (Create, Read, Update, Delete) | Pembuatan WO, Update Status, dan **Edit Detail** (menggunakan modal). WO otomatis mengonsumsi stok Gudang. |
| **Penjadwalan** | Create, Read, Delete | Pemeliharaan Preventif berkala. Dropdown komponen dinamis. |
| **Laporan & Analitik** | Dinamis & Ekspor | **Dashboard Analitik** menampilkan *live* status WO dan Aset. Mendukung **Ekspor CSV dan PDF** dari Backend. |
| **Kepatuhan** | Create, Read, Update | Pelacakan status kalibrasi/regulasi aset. |
| **Pengguna** | Create, Read, Update (Role), Delete | Admin dapat mengelola semua pengguna dan peran mereka. |

---

## 🏗️ Arsitektur Proyek dan Struktur Kode

Aplikasi ini dibagi menjadi dua layanan independen:

| Bagian | Teknologi Utama | Rincian Struktur Kode |
| :--- | :--- | :--- |
| **Frontend (cmms-frontend)** | **React, Vite, Tailwind CSS, Axios, React Router v6** | Kode dibagi menjadi `src/pages` (halaman utama), `src/components` (komponen UI & Layout), dan `src/context` (manajemen sesi global). |
| **Backend (cmms-backend)** | **Python, Flask, MongoEngine, Flask-Bcrypt, ReportLab** | Setiap fitur (Aset, WO, Inventaris, Template, Kepatuhan) memiliki *Blueprint* dan file `routes.py` terpisah. |

## ⚙️ Petunjuk Instalasi Lokal (Setup)

Untuk menjalankan aplikasi ini, Anda harus menjalankan server **MongoDB**, **Backend (Flask)**, dan **Frontend (React)** secara bersamaan.

### 1. Setup Backend (Flask + MongoDB)

1.  **Navigasi ke Folder Backend:**
    ```bash
    cd cmms-backend
    ```

2.  **Instalasi & Aktivasi Virtual Environment:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    # source venv/bin/activate  # macOS/Linux
    
    pip install -r requirements.txt 
    pip install Flask-Bcrypt reportlab # Pastikan library Bcrypt dan ReportLab terinstal
    ```

3.  **Jalankan Server Backend:**
    ```bash
    python run.py
    # Server akan berjalan di: [http://127.0.0.1:5000](http://127.0.0.1:5000)
    ```
    > **PENTING:** Biarkan terminal ini terbuka.

### 2. Setup Frontend (React + Vite)

1.  **Buka Terminal Baru** (biarkan terminal backend tetap berjalan).
2.  **Navigasi ke Folder Frontend:**
    ```bash
    cd ../cmms-frontend
    ```

3.  **Instal Dependensi:**
    ```bash
    npm install
    ```

4.  **Jalankan Server Frontend:**
    ```bash
    npm run dev
    # Server akan berjalan di: http://localhost:5173
    ```

---

## 🔒 Akses Awal & Registrasi

1.  Buka browser Anda ke **`http://localhost:5173`**. Anda akan diarahkan ke halaman **Login**.
2.  **Registrasi Admin Pertama:** Karena database pengguna Anda kosong, klik link **"Daftar Akun Baru"**. Pengguna pertama yang mendaftar akan otomatis diberi peran **`ADMIN`**.
3.  **Login:** Gunakan kredensial Admin Anda. Anda sekarang dapat mengakses semua modul dan mulai mengisi data Gudang dan Aset.
