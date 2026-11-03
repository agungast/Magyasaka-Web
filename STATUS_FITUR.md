# Status Fitur & Rencana Pengisian Data — Portal Magyasaka

> Audit: 3 November 2026
> Basis: kode di `app/`, `supabase/migration.sql`, `.env`, dan `nuxt.config.ts`.
> Dokumen ini menjelaskan fitur yang sudah jadi, yang belum, data real yang harus diisi, serta sprint untuk mengisinya.

---

## 0. Ringkasan Singkat

- **Semua halaman dan alur CRUD sudah dibuat.** Tampilan publik, panel admin, login, pencarian, galeri, dan proyek sudah ada.
- **Data yang tampil sekarang masih 100% mock** (data contoh di `app/composables/useData.ts`), bukan data kelas asli.
- **Login belum bisa dipakai** karena project Supabase belum tersambung. Bukan karena username/password-nya hilang — memang belum ada akun yang dibuat.
- **Pekerjaan utama berikutnya bukan coding fitur baru**, tapi: menyambungkan Supabase, membuat akun pengurus, lalu mengisi data asli dan memperbaiki beberapa bug input.

---

## 1. Kenapa Belum Bisa Login (dan Cara Memperbaikinya)

### Penyebab

1. **Status 3 Nov 2026:** `.env` sudah diisi project `vwfwnsrplkfolmgehxbb`, jadi koneksi sudah benar — tetapi **tabel belum ada**. Hasil cek REST: `members`, `announcements`, `schedules`, dll. semuanya `PGRST205: Could not find the table ... in the schema cache`, artinya `migration.sql` belum dijalankan.
   Karena Supabase dianggap terkonfigurasi, halaman publik berhenti memakai mock dan sekarang menampilkan daftar kosong sampai migrasi dijalankan.
2. `supabase/migration.sql` **tidak membuat akun login**. File itu hanya membuat tabel, policy, dan data contoh. Tidak ada seed user di Supabase Auth.
3. Login memakai **email + password Supabase Auth**, bukan "username". Tidak ada username terpisah di aplikasi ini.

### Langkah membuat akun pengurus

1. ~~Buat project baru~~ — **sudah**: project `vwfwnsrplkfolmgehxbb`.
2. Buka **SQL Editor** di project itu, tempel isi `supabase/migration.sql` **baris 1–193** (schema + RLS + catatan storage), lalu **Run**. Seed data (baris 196 ke bawah) jangan dijalankan supaya tidak ada data fiktif.
3. ~~Ambil kredensial dan isi `.env`~~ — **sudah**: `.env` berisi URL project + publishable key. Cukup restart `npm run dev` setelah migrasi dijalankan.
4. Buat akun di **Authentication → Users → Add user**:
   - Email: email pengurus (contoh `ketua@magyasaka.id`)
   - Password: password kuat
   - Centang **Auto Confirm User**
5. Buka `/login`, masukkan **email dan password tadi**.
6. Ulangi langkah 4 untuk pengurus lain yang butuh akses.
7. Di **Authentication → Providers → Email**, nonaktifkan **Allow new users to sign up** karena aplikasi tidak punya halaman registrasi publik.

### Catatan keamanan

Semua user yang berhasil login bisa CRUD **semua** tabel (tidak ada peran admin/editor). Jangan bagikan akun ke seluruh kelas; buat akun hanya untuk pengurus yang memegang konten.

---

## 2. Fitur yang Sudah Tersedia

Legenda:
- ✅ = UI + logika selesai, tinggal data real
- 🟡 = sudah ada tapi belum lengkap / ada bug
- ❌ = belum dibuat

| Fitur | Route | Status | Catatan |
|---|---|---|---|
| Beranda: hero, sorotan, pintasan | `/` | ✅ | Menampilkan pengumuman pinned, jadwal hari ini, tugas mendatang, pengumuman terbaru. |
| Jadwal kuliah mingguan & harian | `/jadwal` | ✅ | Ada mode Mingguan/Hari Ini, total SKS, warna per mata kuliah. Label semester masih hardcoded. |
| Tugas & ujian + filter tipe | `/tugas` | 🟡 | Filter, badge deadline, dan checklist selesai (lokal per browser) jalan. Pengingat ujian belum membaca `tanggal_ujian`. |
| Daftar anggota + cari + urut | `/anggota` | ✅ | Cari nama/NIM/email, urut NIM/nama, status aktif. Foto profil belum ditampilkan. |
| Struktur pengurus | `/anggota/pengurus` | ✅ | Bagan Ketua + pengurus lain berdasarkan `urutan`. |
| Galeri album + lightbox | `/galeri`, `/galeri/[id]` | ✅ | Album pilihan, semua album, lightbox dengan navigasi keyboard. |
| Katalog & detail proyek | `/proyek`, `/proyek/[id]` | ✅ | Sorotan terbaik, tech stack, tim, link repo/demo. |
| Pencarian global (Ctrl+K) | semua halaman | 🟡 | Mencari pengumuman, jadwal, tugas, anggota, proyek via Fuse.js. Galeri belum ikut; filter kategori belum ada. |
| Login & logout pengurus | `/login`, `/admin` | ✅ | Email/password Supabase Auth + proteksi route admin. Butuh konfigurasi Supabase. |
| Panel admin | `/admin` | ✅ | Menu ke 8 modul. Halaman dashboard masih sekadar sapaan, belum ada statistik. |
| CRUD Pengumuman | `/admin/pengumuman` | ✅ | Create, edit, hapus, pin. |
| CRUD Jadwal | `/admin/jadwal` | ✅ | Create, edit, hapus, pilih hari/jam/SKS/warna. |
| CRUD Tugas & Ujian | `/admin/tugas` | 🟡 | Form tanggal `datetime-local` bermasalah saat edit (nilai ISO dari DB tidak cocok). |
| CRUD Anggota | `/admin/anggota` | 🟡 | NIM, nama, email, telepon, status. Belum bisa isi `foto_url`, jurusan, angkatan dari form. |
| CRUD Pengurus | `/admin/pengurus` | 🟡 | Pilih anggota + jabatan + periode + urutan. |
| CRUD Galeri | `/admin/galeri` | 🟡 | Album bisa dibuat; foto hanya lewat URL, belum upload file. Edit album berpotensi error (lihat §5). |
| CRUD Proyek | `/admin/proyek` | 🟡 | Lengkap, tapi ada dua input `kategori` yang saling menimpa. |
| Dark/light mode, responsive, SEO per halaman | — | ✅ | Sudah berjalan. |
| Halaman 404 kustom | — | ❌ | Masih memakai error page bawaan Nuxt. |
| Statistik dashboard admin | `/admin` | ❌ | Belum ada jumlah anggota/tugas/album, deadline terdekat, dll. |

---

## 3. Fitur yang Belum Tersedia

| Fitur | Dampak | Prioritas |
|---|---|---|
| Registrasi / lupa password | Pengurus baru harus dibuat manual dari dashboard Supabase | P2 |
| Peran & izin (admin vs editor vs anggota) | Semua akun login bisa hapus semua data | P1 (keamanan) |
| Upload file ke Supabase Storage | Foto galeri, cover album, thumbnail proyek, foto anggota hanya bisa via URL manual | P1 |
| CRUD cover album & foto anggota dari UI | `cover_url` dan `foto_url` ada di DB tapi tidak ada input-nya | P1 |
| Sinkronisasi status tugas per akun | Checklist selesai hanya tersimpan di `localStorage` browser masing-masing | P2 |
| Notifikasi email/push untuk tugas & ujian | Pengguna harus membuka situs sendiri | P2 |
| Ekspor kalender (ICS) | Tidak bisa menambahkan jadwal ke Google Calendar | P2 |
| Filter/kelompok hasil pencarian | PRD minta filter per kategori; saat ini hasil masih satu daftar | P1 |
| Pencarian galeri | Album tidak muncul di hasil pencarian | P1 |
| Presensi, kas/keuangan, polling | Tidak termasuk PRD saat ini | P3 |
| Pagination / infinite scroll | Semua data dirender sekaligus; akan berat jika data besar | P2 |
| Audit log / riwayat perubahan | Tidak ada jejak siapa mengubah apa | P3 |
| Preview sebelum publish (draft) | Perubahan langsung tampil | P3 |

---

## 4. Data Real yang Perlu Diinput

Data contoh saat ini: **3 pengumuman, 8 jadwal, 4 tugas, 10 anggota, 5 pengurus, 3 album, 3 proyek**. Semua nama, NIM, email, dosen, dan proyek di dalamnya fiktif dan harus diganti.

### 4.1 Anggota — tabel `members` (P0)

Field wajib:
- `nim` — NIM asli, unik
- `nama` — nama lengkap

Field yang sebaiknya diisi:
- `email` — email kampus
- `no_telepon` — opsional, untuk koordinasi
- `status` — `aktif` / `tidak aktif` / `cuti`
- `foto_url` — opsional, URL publik dari bucket `avatars`
- `jurusan`, `angkatan` — default sudah `Teknik Rekayasa Komputer` / `2023`

Yang perlu disiapkan: daftar seluruh mahasiswa kelas **Teknologi Rekayasa Komputer A angkatan 2023** (termasuk yang cuti/non-aktif, beri status yang benar).

### 4.2 Pengurus — tabel `class_officers` (P0)

- `member_id` — harus memilih anggota yang sudah ada
- `jabatan` — Ketua Kelas, Wakil Ketua, Sekretaris, Bendahara, Koordinator Akademik, dst.
- `periode` — contoh `2024/2025` (jangan biarkan `2023/2024` kalau sudah ganti periode)
- `urutan` — **Ketua harus `1`**, karena halaman publik menganggap data pertama sebagai Ketua

Yang perlu disiapkan: susunan pengurus periode berjalan + periode sebelumnya (jika ingin ditampilkan).

### 4.3 Jadwal — tabel `schedules` (P0)

- `mata_kuliah`, `kode_mk`, `sks`
- `dosen`
- `hari` — Senin–Sabtu
- `jam_mulai`, `jam_selesai`
- `ruangan`
- `warna` — hex untuk pembeda di UI

Yang perlu disiapkan: jadwal **semester yang sedang berjalan**. Saat ini label di halaman jadwal masih *“Semester Ganjil 2024/2025”* dan harus diperbarui di kode.

### 4.4 Tugas & Ujian — tabel `assignments` (P0)

- `judul`, `mata_kuliah`, `deskripsi`
- `tipe` — `tugas` / `kuis` / `praktikum` / `uts` / `uas`
- Untuk tugas: `deadline`
- Untuk ujian: `tanggal_ujian`, `ruangan_ujian`
- `is_completed` — biarkan `false` (status selesai masih per pengguna di browser)

Yang perlu disiapkan: daftar tugas/kuis/praktikum yang masih berjalan + jadwal UTS/UAS lengkap dengan ruangan.

Catatan: pengingat ujian di `/tugas` saat ini membaca `deadline`, bukan `tanggal_ujian`. Isi `deadline` juga untuk ujian, atau perbaiki kodenya (lihat §5).

### 4.5 Pengumuman — tabel `announcements` (P0)

- `judul`, `konten`
- `kategori` — `umum` / `akademik` / `kegiatan` / `penting`
- `is_pinned` — maksimal 2–3 agar beranda tidak penuh
- `penulis` — nama pengurus/jabatan

Yang perlu disiapkan: pengumuman yang benar-benar berlaku sekarang. Hapus pengumuman sambutan/template lama.

### 4.6 Galeri — tabel `albums` + `photos` (P1)

Album:
- `nama`, `deskripsi`, `tanggal_kegiatan`
- `cover_url` — URL publik dari bucket `gallery`
- `is_featured` — untuk bagian “Album Pilihan”

Foto:
- `album_id`, `url`, `caption`, `urutan`

Yang perlu disiapkan:
- Foto asli per kegiatan (kompres dulu agar tidak berat)
- Nama & tanggal kegiatan yang benar
- Buat bucket publik **`gallery`** di Supabase Storage, upload foto, lalu salin public URL

### 4.7 Proyek — tabel `projects` (P1)

- `nama`, `deskripsi`, `detail`
- `teknologi` — array, contoh `["Nuxt", "Supabase"]`
- `anggota` — array nama anggota
- `kategori` — `akademik` / `Web` / `Mobile App` / `IoT` / `AI` / `Security`
- `is_highlighted` — maksimal 2–3 proyek
- `thumbnail_url` — bucket `projects`
- `repo_url`, `demo_url`

Yang perlu disiapkan: proyek unggulan + link repo/demo yang bisa dibuka publik, serta nama anggota yang konsisten dengan tabel `members`.

### 4.8 Akun pengurus — Supabase Auth (P0)

- Email + password untuk tiap pengurus
- Tidak ada username terpisah
- Simpan kredensial di tempat aman (password manager), jangan di repo

---

## 5. Bug / Utang Teknis yang Menghambat Input Data

Perbaiki ini **sebelum** memasukkan banyak data, supaya tidak input ulang.

| # | Masalah | Lokasi | Dampak |
|---|---|---|---|
| 1 | Form mengirim string kosong `''` ke kolom `DATE`/`TIMESTAMPTZ`/`UUID` | `admin/galeri`, `admin/tugas`, `admin/pengurus` | Insert/update gagal: `invalid input syntax for type date/timestamp/uuid`. Perlu ubah `''` → `null` sebelum simpan. |
| 2 | Edit album menyebarkan objek hasil join (`photos`) ke payload update | `admin/galeri/index.vue` baris 25 | Update album error karena kolom `photos` tidak ada di tabel `albums`. |
| 3 | Edit tugas: nilai `datetime-local` tidak cocok dengan format ISO dari DB | `admin/tugas/index.vue` | Tanggal bisa tampil kosong saat edit, lalu tersimpan kosong. Perlu format ke `YYYY-MM-DDTHH:mm`. |
| 4 | Pengingat ujian memakai `deadline`, bukan `tanggal_ujian` | `tugas/index.vue` baris 42 | Ujian yang hanya punya `tanggal_ujian` tidak muncul di pengingat. |
| 5 | Label semester hardcoded | `jadwal/index.vue` baris 49 | Menampilkan semester yang salah. |
| 6 | Periode pengurus hardcoded | `anggota/pengurus.vue` baris 43, default form admin | Harus diubah manual atau diambil dari data. |
| 7 | Album tidak punya input `cover_url`; foto hanya URL | `admin/galeri/index.vue` | Cover dan foto tidak bisa diunggah dari aplikasi. |
| 8 | Dua input `kategori` di form proyek | `admin/proyek/index.vue` baris 121–123 | Nilai bisa saling menimpa; hapus salah satu. |
| 9 | Form anggota tidak punya input `foto_url`, `jurusan`, `angkatan` | `admin/anggota/index.vue` | Data tersebut tidak bisa diubah dari UI. |
| 10 | Halaman admin tidak punya fallback mock | semua `admin/*` | Sebelum Supabase dikonfigurasi, halaman admin error/kosong. Ini normal, tapi menjelaskan kenapa panel terlihat rusak. |
| 11 | Pencarian belum memasukkan galeri & belum ada filter kategori | `composables/useSearch.ts` | Tidak sesuai PRD “Filter Hasil”. |
| 12 | Semua akun login bisa menulis semua tabel | `migration.sql` RLS | Risiko keamanan jika akun bocor. |

---

## 6. Rencana Sprint

Estimasi bersifat relatif (setengah hari per task kecil), bukan komitmen waktu.

### Sprint 0 — Infrastruktur & Login (P0, blocker)

- [ ] Buat project Supabase
- [ ] Jalankan schema `migration.sql` (tanpa seed data)
- [ ] Isi `.env` dengan URL + anon key, restart dev
- [ ] Buat bucket publik `gallery`, `avatars`, `projects`
- [ ] Buat akun pengurus di Authentication → Users (auto-confirm)
- [ ] Pastikan `/login` berhasil dan `/admin` bisa dibuka
- [ ] Nonaktifkan pendaftaran publik
- [ ] Perbaiki bug #1 dan #2 agar CRUD tidak gagal saat input

**Selesai jika:** satu akun pengurus bisa login, belum ada error di panel admin, dan tabel kosong siap diisi.

### Sprint 1 — Data Inti Akademik (P0)

- [ ] Input seluruh anggota asli (`members`)
- [ ] Input susunan pengurus (`class_officers`), Ketua `urutan = 1`
- [ ] Input jadwal semester berjalan (`schedules`)
- [ ] Perbaiki label semester (#5) dan periode pengurus (#6)
- [ ] Tambah input `foto_url`/`jurusan`/`angkatan` di form anggota (#9) — opsional jika belum perlu foto
- [ ] Cek `/anggota`, `/anggota/pengurus`, `/jadwal` menampilkan data asli

**Selesai jika:** tiga halaman itu tidak lagi menampilkan data mock dan tidak ada NIM/nama fiktif.

### Sprint 2 — Tugas, Ujian, Pengumuman, Beranda (P0)

- [ ] Input tugas/kuis/praktikum berjalan
- [ ] Input UTS/UAS + ruangan
- [ ] Perbaiki form tanggal (#3) dan pengingat ujian (#4)
- [ ] Input pengumuman aktif, pin maksimal 2–3
- [ ] Hapus pengumuman template lama
- [ ] Cek beranda: sorotan, jadwal hari ini, tugas mendatang, pengumuman terbaru

**Selesai jika:** beranda dan `/tugas` menampilkan konten nyata; ujian muncul di pengingat.

### Sprint 3 — Galeri & Proyek (P1)

- [ ] Upload foto kegiatan ke bucket `gallery`
- [ ] Input album + cover + caption + urutan
- [ ] Perbaiki edit album (#2 sisa) dan tambahkan input `cover_url` (#7)
- [ ] Upload thumbnail proyek ke bucket `projects`
- [ ] Input proyek, teknologi, anggota, repo/demo, highlight
- [ ] Rapikan form proyek (#8)
- [ ] Cek `/galeri`, `/galeri/[id]`, `/proyek`, `/proyek/[id]`

**Selesai jika:** semua gambar tampil dari Storage publik, lightbox jalan, dan tidak ada album/proyek contoh.

### Sprint 4 — Pencarian, Dashboard, QA (P1)

- [ ] Tambahkan galeri ke pencarian
- [ ] Tambahkan filter/kelompok kategori hasil pencarian (#11)
- [ ] Isi dashboard admin dengan statistik ringkas (jumlah anggota, tugas aktif, album, proyek)
- [ ] Audit responsive di HP, tablet, desktop
- [ ] Cek dark/light mode di semua halaman
- [ ] Update `README.md` (masih template Nuxt) dan dokumentasi setup
- [ ] Uji semua CRUD create/edit/delete setelah data asli masuk

### Sprint 5 — Peningkatan Lanjutan (P2/P3)

- [ ] Peran & izin pengurus (admin/editor)
- [ ] Sinkronisasi status tugas per akun
- [ ] Notifikasi email/push
- [ ] Ekspor ICS
- [ ] Pagination untuk daftar besar
- [ ] Halaman 404 kustom
- [ ] Draft/publish & audit log

---

## 7. Urutan Input yang Benar

Ikuti urutan ini agar relasi tidak error:

1. **Akun pengurus** (Supabase Auth)
2. **`members`** — induk untuk pengurus dan anggota proyek
3. **`class_officers`** — butuh `member_id`
4. **`schedules`** — independen
5. **`assignments`** — independen
6. **`announcements`** — independen
7. **`albums` → `photos`** — foto butuh `album_id`
8. **`projects`** — independen, tapi nama `anggota` sebaiknya cocok dengan `members`

---

## 8. Checklist Go-Live

- [ ] `.env` berisi kredensial project asli, bukan placeholder
- [ ] Login pengurus berhasil
- [ ] Tidak ada data mock yang tersisa di halaman publik
- [ ] Tidak ada NIM/nama/dosen/proyek fiktif
- [ ] Semua gambar memakai URL publik dari Storage
- [ ] Jadwal memakai semester berjalan, bukan 2024/2025
- [ ] Pengurus periode berjalan, Ketua di urutan 1
- [ ] Ujian punya tanggal + ruangan dan muncul di pengingat
- [ ] CRUD create/edit/delete diuji untuk setiap modul
- [ ] Tampilan dicek di HP dan dark mode
- [ ] Pendaftaran publik Supabase dimatikan
