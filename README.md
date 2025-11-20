# CMMS for Manufacturing (Computerized Maintenance Management System)

Proyek ini adalah sistem manajemen pemeliharaan berbasis web tingkat lanjut yang dirancang khusus untuk lingkungan manufaktur. Sistem ini tidak hanya melacak aset, tetapi juga menerapkan alur kerja (workflow) pemeliharaan yang ketat mulai dari pengajuan, pengerjaan, hingga verifikasi akhir dengan bukti digital.

**Status Proyek:** **Feature Complete** (Siap Produksi dengan Logika Bisnis Penuh).

## 🚀 Fitur Utama & Pembaruan Terbaru

| Modul | Fungsionalitas & Logika Bisnis |
| :--- | :--- |
| **Authentication & RBAC** | Kontrol akses ketat untuk **Admin**, **Manager**, dan **Technician**. Teknisi memiliki akses terbatas (hanya eksekusi tugas). |
| **Work Order (Lifecycle)** | Alur kerja bertingkat: **Open** → **In Progress** → **Pending Verification** → **Completed**. Mendukung status **Pending Approval** untuk WO yang dibuat Manajer. |
| **Sistem Verifikasi** | **Validasi Ganda:** Teknisi wajib mengunggah **Foto Bukti Selesai** untuk mengajukan penyelesaian. Admin/Manajer wajib memverifikasi foto sebelum menutup WO. |
| **Gudang (Inventaris)** | Stok terkoneksi langsung dengan WO. Stok komponen hanya akan **berkurang otomatis** setelah WO diverifikasi statusnya menjadi *Completed*. |
| **Manajemen Aset** | Pelacakan status mesin secara *real-time* (**Running** atau **Down**). Mendukung upload foto aset dan *Bill of Materials* (BOM). |
| **Smart Dashboard** | **Pusat Komando** dengan notifikasi interaktif. Menampilkan peringatan jadwal H-7, stok menipis, dan daftar WO yang membutuhkan verifikasi segera. |
| **Notifikasi & Alert** | Ikon lonceng interaktif yang memberitahu Admin tentang tugas mendesak dan persetujuan yang tertunda. |
| **Laporan & Lokalisasi** | Format waktu otomatis menggunakan **Waktu Indonesia Barat (WIB)**. Ekspor laporan kinerja aset ke PDF dan CSV. |

---

## 🔄 Alur Kerja Work Order (Workflow)

Sistem ini menerapkan *Standard Operating Procedure* (SOP) pemeliharaan industri:

1.  **Pembuatan WO (Inisiasi):**
    * **Admin:** WO langsung berstatus `OPEN`.
    * **Manager:** WO berstatus `PENDING APPROVAL` (Butuh persetujuan Admin).
    * **Technician:** *Tidak diizinkan membuat WO.*
    * *Syarat:* Wajib menyertakan **Foto Awal (Masalah)** saat pembuatan.

2.  **Pengerjaan (Eksekusi):**
    * Teknisi menerima tugas dan menekan tombol **"Mulai"** (Status: `IN PROGRESS`).
    * Nama teknisi otomatis tercatat dalam sistem.

3.  **Penyelesaian (Pelaporan):**
    * Setelah selesai, Teknisi **WAJIB** mengunggah **Foto Bukti Perbaikan**.
    * Status berubah menjadi `PENDING VERIFICATION`.

4.  **Verifikasi & Penutupan:**
    * Admin/Manager menerima notifikasi.
    * Admin meninjau perbandingan *Foto Awal* vs *Foto Bukti*.
    * Jika disetujui, Admin menekan **"Verifikasi Selesai"**.
    * Status menjadi `COMPLETED` dan stok komponen di gudang otomatis berkurang.

![Diagram Alur Kerja](https://via.placeholder.com/800x400?text=Alur+Kerja+Work+Order+CMMS)

---

## 🏗️ Arsitektur Proyek

Aplikasi dibangun dengan arsitektur terpisah (*decoupled*) untuk skalabilitas:

| Bagian | Teknologi Utama |
| :--- | :--- |
| **Frontend** | **React, Vite, Tailwind CSS, Lucide React**<br>Menggunakan `Context API` untuk manajemen sesi dan `Axios` untuk komunikasi API. |
| **Backend** | **Python, Flask, MongoEngine**<br>Database NoSQL (MongoDB) untuk fleksibilitas skema data aset yang kompleks. |
| **Security** | **Flask-Bcrypt** (Hashing password), Validasi Input di sisi Server. |
| **Reporting** | **ReportLab** (Generate PDF otomatis), CSV Writer. |

---

## ⚙️ Petunjuk Instalasi (Setup)

Ikuti langkah ini untuk menjalankan sistem secara lokal.

### Prasyarat
* Python 3.8+
* Node.js & npm
* MongoDB (Pastikan service MongoDB berjalan di port default 27017)

### 1. Setup Backend (Flask API)

```bash
# 1. Masuk ke folder backend
cd cmms-backend

# 2. Buat virtual environment
python -m venv venv

# 3. Aktifkan virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Instal dependencies
pip install -r requirements.txt
# Pastikan library khusus terinstal:
pip install Flask-Bcrypt reportlab mongoengine flask-cors

# 5. Jalankan Server
python run.py
# Server berjalan di: [http://127.0.0.1:5000](http://127.0.0.1:5000)

### 2. Setup Frontend (React App)

# 1. Buka terminal BARU dan masuk ke folder frontend
cd cmms-frontend

# 2. Instal paket node modules
npm install

# 3. Jalankan mode pengembangan
npm run dev
# Aplikasi berjalan di: http://localhost:5173