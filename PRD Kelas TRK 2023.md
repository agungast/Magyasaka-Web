# **Product Requirement Document (PRD)**

# **Portal & Dashboard Kelas TRK 2023**

---

# **1\. Ringkasan Eksekutif & Informasi Dokumen**

| Parameter | Detail Informasi |
| :---- | :---- |
| **Nama Proyek** | Portal / Dashboard Kelas TRK 2023 |
| **Status Dokumen** | Perencanaan / Draft |
| **Target Pengguna** | Mahasiswa TRK 2023 & Pengurus Kelas |
| **Dibuat Oleh** | Person |
| **Tanggal Pembaruan** | Date |

---

# **2\. Tech Stack Rekomendasi**

| Komponen Architecture | Teknologi | Alasan Pemilihan / Deskripsi |
| :---- | :---- | :---- |
| **Frontend Framework** | Nuxt 3 (Vue 3\) | Performa tinggi dengan *Server-Side Rendering (SSR)* dan SEO-friendly. |
| **Styling & UI Components** | Tailwind CSS \+ Nuxt UI / DaisyUI | Mempercepat kustomisasi UI yang responsif dan konsisten. |
| **Backend & Database** | Supabase | Layanan *Backend-as-a-Service* menyediakan Database PostgreSQL, Auth, dan Storage. |
| **Deployment & Hosting** | Vercel \+ Supabase Cloud | Integrasi ci/cd yang mulus untuk hosting frontend, serverless function, dan cloud database. |
| **Search Engine** | PostgreSQL Full-Text Search / Fuse.js | Dukungan pencarian data cepat secara server-side maupun client-side. |

---

# **3\. Fitur Utama & Sub-Fitur Per Fase**

## **Fase 1: Beranda Angkatan**

* **Sambutan Kelas:** Pesan utama dan pengumuman resmi dari ketua maupun pengurus kelas.  
* **Sorotan Angkatan:** Informasi krusial yang dipin (*pinned*) pada halaman utama agar mudah diakses.  
* **Pintasan Menu:** Navigasi cepat menuju fitur-fitur yang paling sering digunakan.

## **Fase 2: Informasi Akademik & Anggota**

* **Jadwal Kuliah:**  
  * **Jadwal Mingguan:** Tampilan komprehensif seluruh mata kuliah dalam satu minggu.  
  * **Jadwal Hari Ini:** Fokus ringkas mata kuliah yang berlangsung pada hari berjalan.  
  * **Pengingat Ujian:** Notifikasi visual untuk agenda ujian mendatangkan.  
* **Info Tugas & Ujian:**  
  * **Daftar Tugas:** List penugasan kuliah beserta batas waktu (*deadline*).  
  * **Jadwal Ujian:** Rincian tanggal, waktu, dan ruangan ujian.  
  * **Penanda Selesai:** Checklist status pengerjaan tugas secara lokal/internal pada perangkat pengguna.  
* **Daftar Anggota:**  
  * **Kartu Profil Mahasiswa:** Informasi identitas ringkas tiap mahasiswa.  
  * **Pencarian Nama:** Filter instan untuk menemukan data mahasiswa.  
  * **Struktur Pengurus Kelas:** Bagan organisasi dan peran pengurus kelas.

## **Fase 3: Galeri & Portofolio**

* **Galeri Kegiatan:**  
  * **Album Kegiatan:** Pengelompokan dokumentasi berdasarkan acara atau momen tertentu.  
  * **Tampilan Foto:** Fitur modal preview / *lightbox* untuk melihat foto resolusi penuh.  
  * **Album Terbaru:** Dinding tampilan untuk kegiatan yang baru saja berlangsung.  
* **Karya Proyek Kelas:**  
  * **Daftar Proyek:** Katalog hasil karya atau proyek akademik mahasiswa TRK 2023\.  
  * **Detail Proyek:** Halaman penjelasan mendalam, sampel, atau tautan repositori proyek.  
  * **Sorotan Terbaik (*Best Highlighted Projects*):** Area khusus penampil karya unggulan angkatan.

## **Fase 4: Manajemen Konten & Autentikasi Pengurus**

* **Login Pengurus:**  
  * **Masuk Akun:** Otentikasi aman bagi pengurus menggunakan Supabase Auth.  
  * **Keluar Akun:** Fitur terminasi sesi (*logout*).  
* **Kelola Konten (CMS Pengurus):**  
  * **Ubah Jadwal & Tugas:** Fitur *Create, Read, Update, Delete (CRUD)* untuk konten akademik.  
  * **Kelola Data Anggota:** Pembaruan informasi profil dan kepengurusan.  
  * **Unggah Foto Galeri:** Penambahan media dokumentasi langsung ke Supabase Storage.  
* **Pencarian Global:**  
  * **Cari Cepat:** Bar pencarian terpusat untuk menelusuri tugas, jadwal, atau anggota.  
  * **Filter Hasil:** Pengelompokan hasil pencarian berdasarkan kategori.

---

# **4\. Kebutuhan Non-Fungsional (NFR)**

* **Performansi:** Implementasi *Server-Side Rendering (SSR)* dan strategi caching melalui Vercel Edge Network untuk menjamin kecepatan muat (*load time*) optimal baik di perangkat *mobile* maupun *desktop*.  
* **Keamanan:** Pembatasan hak akses edit dan manajemen konten khusus pengurus dengan menerapkan kebijakan *Row Level Security (RLS)* di tingkat database Supabase.  
* **Responsivitas:** Desain UI/UX yang *fully responsive* dan adaptif di berbagai ukuran layar menggunakan utilitas Tailwind CSS.

