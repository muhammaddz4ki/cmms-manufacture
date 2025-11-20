# 🏭 CMMS for Manufacturing (Computerized Maintenance Management System)

![Project Status](https://img.shields.io/badge/Status-Feature%20Complete-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Sistem manajemen pemeliharaan berbasis web tingkat lanjut** yang dirancang khusus untuk lingkungan manufaktur. Aplikasi ini tidak hanya melacak aset, tetapi juga menerapkan alur kerja (workflow) pemeliharaan yang ketat mulai dari pengajuan, pengerjaan, hingga verifikasi akhir dengan bukti digital.

---

## 🚀 Fitur Utama & Kapabilitas

Sistem ini dibangun dengan logika bisnis yang komprehensif untuk menangani kebutuhan industri nyata.

| Modul | Fungsionalitas & Logika Bisnis |
| :--- | :--- |
| **🔐 Auth & RBAC** | Kontrol akses berbasis peran (**Admin**, **Manager**, **Technician**). Teknisi memiliki akses terbatas hanya untuk eksekusi tugas. |
| **📋 Work Order (WO)** | Siklus hidup penuh: `Open` → `In Progress` → `Pending Verification` → `Completed`. Mendukung `Pending Approval` untuk WO dari Manager. |
| **✅ Sistem Verifikasi** | **Validasi Ganda:** Teknisi wajib upload **Foto Bukti Selesai**. Admin/Manager wajib memverifikasi foto sebelum menutup WO. |
| **📦 Gudang Pintar** | Stok komponen terkoneksi dengan WO. Stok hanya **berkurang otomatis** setelah status WO diverifikasi menjadi *Completed*. |
| **🏭 Manajemen Aset** | Pelacakan status mesin *real-time* (**Running** / **Down**). Mendukung upload foto aset dan *Bill of Materials* (BOM). |
| **📊 Smart Dashboard** | **Pusat Komando** dengan notifikasi interaktif. Menampilkan peringatan H-7 jadwal maintenance, stok menipis, dan WO tertunda. |
| **🔔 Notifikasi** | Ikon lonceng interaktif untuk memberitahu Admin/Manager tentang tugas mendesak dan persetujuan yang menunggu. |
| **📄 Laporan** | Format waktu otomatis **WIB**. Ekspor laporan kinerja aset dan riwayat perbaikan ke **PDF** dan **CSV**. |

---

## 🔄 Alur Kerja (Standard Operating Procedure)

Sistem ini menerapkan SOP pemeliharaan standar industri untuk menjamin akuntabilitas.

### 1. Inisiasi (Pembuatan WO)
* **Admin:** WO langsung berstatus `OPEN`.
* **Manager:** WO berstatus `PENDING APPROVAL` (Menunggu persetujuan Admin).
* **Technician:** *Read-only* (Tidak diizinkan membuat WO).
* *Requirement:* Wajib menyertakan **Foto Awal (Masalah)** saat pembuatan.

### 2. Eksekusi (Pengerjaan)
* Teknisi menerima tugas di dashboard mereka.
* Teknisi menekan tombol **"Mulai"** → Status berubah menjadi `IN PROGRESS`.
* Sistem mencatat waktu mulai dan nama teknisi secara otomatis.

### 3. Pelaporan (Penyelesaian)
* Setelah perbaikan selesai, Teknisi **WAJIB** mengunggah **Foto Bukti Perbaikan**.
* Status berubah menjadi `PENDING VERIFICATION`.

### 4. Validasi & Penutupan
* Admin/Manager menerima notifikasi verifikasi.
* Admin membandingkan **Foto Awal** vs **Foto Bukti**.
* Jika valid, Admin menekan **"Verifikasi Selesai"**.
* Status menjadi `COMPLETED` dan stok sparepart di gudang **otomatis berkurang**.

![Diagram Alur Kerja](https://via.placeholder.com/800x400?text=Workflow+Visualization+CMMS)

---

## 🏗️ Arsitektur Teknologi

Aplikasi dibangun dengan arsitektur terpisah (*decoupled*) untuk performa dan skalabilitas maksimal.

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | UI modern dengan `Context API` untuk manajemen state dan `Axios` untuk komunikasi HTTP. Menggunakan ikon dari `Lucide React`. |
| **Backend** | Python, Flask | REST API yang cepat. Menggunakan `Flask-Bcrypt` untuk keamanan hashing password. |
| **Database** | MongoDB, MongoEngine | Database NoSQL untuk menangani struktur data aset yang dinamis dan kompleks. |
| **Reporting** | ReportLab, CSV | Engine untuk generate laporan PDF otomatis di sisi server. |

---

## ⚙️ Panduan Instalasi (Local Setup)

Ikuti langkah-langkah berikut untuk menjalankan sistem di komputer lokal Anda.

### Prasyarat
* [Python 3.8+](https://www.python.org/)
* [Node.js & npm](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/) (Pastikan service berjalan di port default `27017`)

### 1. Setup Backend (Flask API)

```bash
# 1. Masuk ke direktori backend
cd cmms-backend

# 2. Buat Virtual Environment
# Windows:
python -m venv venv
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Instal Dependencies
pip install -r requirements.txt
# Atau instal manual jika requirements.txt belum tersedia:
pip install Flask Flask-Bcrypt reportlab mongoengine flask-cors

# 4. Jalankan Server
python run.py