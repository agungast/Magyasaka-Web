# Phase 1 — Sprint Plan Perbaikan Magyasaka Web

Dokumen ini memecah 8 perbaikan Phase 1 menjadi sprint yang bisa dikerjakan dan dirilis terpisah.

## Ringkasan

| Sprint | Fokus | Estimasi | Prioritas |
|--------|-------|----------|-----------|
| 1 | Saran pencarian + penanda login pengurus | 1–2 hari | P1 |
| 2 | Anggota: NIM penuh + perbaikan sort | 1 hari | P1 |
| 3 | Tugas & Ujian: search, filter status, pagination, ruangan | 2–3 hari | P0 |
| 4 | Galeri: search, date range, pagination, download album | 3–4 hari | P1 |
| 5 | Proyek: tanggal selesai, search, filter, pagination | 3–4 hari | P1 |
| 6 | QA, regression, dan rilis | 1–2 hari | P0 |

**Prinsip kerja Phase 1**

- Filter, search, dan pagination dikerjakan di client karena jumlah data sekelas kecil. Tidak ada perubahan query server selain kolom baru `projects.tanggal_selesai`.
- Tidak menambah dependensi baru kecuali disetujui untuk fitur ZIP galeri (lihat Sprint 4).
- Pertahankan pola Nuxt UI yang sudah dipakai (`UInput`, `USelect`, `UButton`, `UCard`, `UPagination`).
- Setiap sprint harus lolos `npm run typecheck` dan `npm run lint` sebelum dianggap selesai.

---

## Sprint 1 — Saran Pencarian & Penanda Login

> **Status:** ✅ Implementasi selesai. `npm run typecheck`, `npm run lint`, dan `npm run build` lolos. Verifikasi visual login/logout di browser masih perlu dilakukan saat QA.

**Tujuan:** user tidak bingung saat membuka pencarian, dan pengurus yang sudah login melihat statusnya di header.

### Task

- [x] **Saran pencarian di modal global** (`app/app.vue`)
  - Saat `searchQuery` kosong, tampilkan blok "Saran pencarian" berisi 4–6 chip yang bisa diklik, misalnya:
    - `Tugas`, `UTS`, `Jadwal`, `Anggota`, `Proyek`, `Galeri`
  - Klik chip → isi `searchQuery` dengan kata kunci contoh, misalnya "Jaringan Komputer", "UTS", "Proyek IoT".
  - Saat query 1 karakter, tetap tampilkan pesan "Ketik minimal 2 karakter" **plus** saran.
  - Perjelas placeholder: `Cari tugas, jadwal, anggota, atau proyek...`
  - Tambahkan teks bantuan kecil: `Tekan Ctrl + K kapan saja untuk membuka pencarian`.
- [x] **Menu akun pengurus** (`app/app.vue`)
  - Ambil `useSupabaseUser()`.
  - Jika user login:
    - Tampilkan `UDropdownMenu` dengan trigger `i-lucide-shield-check` + label `Pengurus` (desktop) / `Akun Pengurus` (mobile).
    - Item menu: `Panel Admin` → `/admin` dan `Keluar` → `supabase.auth.signOut()` lalu kembali ke `/`.
    - Tidak memakai dot hijau; status login ditandai oleh menu akun itu sendiri.
  - Jika belum login: perilaku sekarang tetap (`Login Pengurus` → `/login`).
  - Jangan menampilkan email/nama lengkap di header publik.

### File yang disentuh

- `app/app.vue`
- `app/composables/useSearch.ts` (opsional, jika saran ingin memakai data existing)

### Acceptance criteria

- [ ] Modal pencarian kosong menampilkan saran yang bisa diklik dan langsung menjalankan pencarian.
- [ ] Setelah login, header menampilkan menu akun `Pengurus` dengan akses ke `/admin` dan opsi `Keluar`.
- [ ] Setelah logout, header kembali ke kondisi `Login Pengurus`.
- [ ] Tidak ada flicker status login saat SSR/hydration.

---

## Sprint 2 — Anggota Kelas

> **Status:** ✅ Implementasi selesai. `npm run typecheck`, `npm run lint`, dan `npm test` lolos. Uji visual urutan di browser dengan data nyata (±30 anggota) masih perlu dilakukan saat QA.

**Tujuan:** NIM tampil penuh dan kontrol urutan benar-benar terasa efeknya.

### Task

- [x] **Tampilkan NIM penuh** (`app/components/MemberCard.vue`)
  - Hapus `maskedNim`, state `nimRevealed`, tombol reveal, dan icon mata.
  - Tampilkan NIM sebagai teks biasa dengan `font-mono`.
  - Hapus `app/utils/nim.ts` karena sudah tidak dipakai (cek ulang dengan grep sebelum hapus).
- [x] **Perbaiki kontrol sort NIM/Nama** (`app/pages/anggota/index.vue`)
  - Saat ini `sortBy` sudah terpasang, tetapi urutan NIM dan Nama sering hampir sama sehingga terlihat "tidak berefek".
  - Tambahkan arah urutan: `sortDirection` (`asc` / `desc`).
  - Satu tombol urutan menggantikan dua tombol: trigger menampilkan state aktif (`NIM (A–Z)`), menu berisi 4 opsi dengan centang pada opsi aktif.
  - Pastikan sort tetap berjalan setelah search.
- [ ] **Verifikasi dengan data nyata**
  - Uji minimal 30 anggota.
  - Pastikan urutan berubah di grid, bukan hanya label tombol.

### File yang disentuh

- `app/components/MemberCard.vue`
- `app/pages/anggota/index.vue`
- `app/composables/__tests__/upload.spec.ts` (hapus tes `maskedNim`)
- `app/utils/nim.ts` (hapus)

### Acceptance criteria

- [x] NIM tampil lengkap tanpa sensor.
- [x] Tombol/select urutan mengubah urutan kartu secara nyata.
- [x] Search + sort bisa dipakai bersamaan.
- [x] Tidak ada referensi `maskedNim` yang tersisa.

---

## Sprint 3 — Tugas & Ujian

**Tujuan:** daftar tugas bisa dicari, difilter berdasarkan status deadline, dipaginasi, dan menampilkan ruangan ujian.

### Task

- [ ] **Hapus tombol "Tampilkan Riwayat"**
  - Hapus state `showHistory` dan tombolnya.
  - Fungsinya diganti filter status deadline.
- [ ] **Filter status deadline** (`USelect`)
  - Opsi:
    - `Akan datang` (default)
    - `Terlewat`
    - `Tanpa tenggat`
    - `Semua`
  - Sertakan jumlah item di label, misalnya `Terlewat (12)`.
  - Status dihitung dengan `isPastDue()` / `effectiveDate()` yang sudah ada di `app/utils/date.ts`.
- [ ] **Search bar**
  - Cari di `judul`, `mata_kuliah`, `deskripsi`, dan `ruangan_ujian`.
  - Debounce tidak perlu; data kecil.
- [ ] **Pagination**
  - Gunakan `UPagination` dari Nuxt UI.
  - `itemsPerPage = 10`.
  - Reset ke halaman 1 setiap search/filter berubah.
  - Tampilkan jumlah hasil di header, misalnya `18 item`.
- [ ] **Tampilkan ruangan/lokasi ujian**
  - Di kartu pengingat ujian: tambahkan baris `ruangan_ujian` dengan icon `i-lucide-map-pin`.
  - Di daftar tugas/ujian: tampilkan `ruangan_ujian` jika ada.
  - Jangan tampilkan baris kosong jika `ruangan_ujian` null.
- [ ] **Rapikan filter tipe**
  - Tombol tipe yang sekarang memenuhi baris bisa diubah menjadi `USelect` "Semua tipe / Tugas / UTS / UAS / TUBES / Praktikum" agar satu baris dengan search dan filter status.
- [ ] **Empty state**
  - Bedakan "tidak ada hasil untuk pencarian/filter" dan "belum ada data".
  - Sediakan tombol `Reset filter`.

### File yang disentuh

- `app/pages/tugas/index.vue`
- `app/utils/date.ts` (hanya jika perlu helper baru; usahakan tidak)

### Acceptance criteria

- [ ] Tidak ada lagi tombol riwayat.
- [ ] Filter `Terlewat` menampilkan item yang sudah lewat; `Akan datang` menyembunyikannya.
- [ ] Search dan filter bisa dikombinasikan.
- [ ] Pagination bekerja dan kembali ke halaman 1 saat filter berubah.
- [ ] Ruangan ujian tampil di pengingat ujian dan daftar.
- [ ] Tidak ada item yang tampil ganda.

---

## Sprint 4 — Galeri

**Tujuan:** album mudah dicari, difilter berdasarkan tanggal, dipaginasi, dan fotonya bisa diunduh.

### Task

- [ ] **Search bar**
  - Cari di `nama` dan `deskripsi` album.
- [ ] **Filter date range**
  - Dua input tanggal: `Dari` dan `Sampai`.
  - Berdasarkan `albums.tanggal_kegiatan`.
  - Rentang inklusif; jika salah satu kosong, filter hanya memakai batas yang diisi.
  - Sediakan tombol `Reset`.
- [ ] **Pagination**
  - `itemsPerPage = 9`.
  - Reset ke halaman 1 saat search/date berubah.
  - Perilaku:
    - Tanpa filter: tampilkan `Album Pilihan` seperti sekarang, lalu `Album Lainnya` dipaginasi.
    - Dengan filter/search aktif: sembunyikan section `Album Pilihan`, tampilkan semua hasil dalam satu grid terpaginasi agar tidak ada duplikasi.
- [ ] **Download foto per album** (`app/pages/galeri/[id].vue`)
  - Tambahkan tombol `Unduh` pada lightbox untuk foto aktif.
  - Tambahkan tombol `Unduh semua foto` di header album.
  - Implementasi tanpa dependensi baru:
    - `fetch(url)` → `blob` → `URL.createObjectURL` → anchor `download`.
    - Lewati video (atau beri nama file sesuai ekstensi).
    - Unduh berurutan dengan jeda kecil agar browser tidak memblokir.
  - Catatan: `download` attribute tidak bekerja untuk URL cross-origin, jadi wajib lewat `fetch` + blob.
  - Opsional (butuh persetujuan): tambah `jszip` agar semua foto menjadi satu file ZIP. Jika tidak disetujui, gunakan unduhan berurutan.
  - Pastikan bucket Supabase mengizinkan GET publik/CORS.
- [ ] **Empty state**
  - "Tidak ada album yang cocok" + tombol reset filter.

### File yang disentuh

- `app/pages/galeri/index.vue`
- `app/pages/galeri/[id].vue`
- `app/composables/useGalleryUpload.ts` (jika butuh helper unduh)
- `package.json` (hanya jika ZIP disetujui)

### Acceptance criteria

- [ ] Search album bekerja.
- [ ] Date range memfilter album dengan benar, termasuk batas tanggal.
- [ ] Pagination bekerja dan tidak menduplikasi album unggulan.
- [ ] Foto bisa diunduh satu per satu.
- [ ] `Unduh semua foto` mengunduh semua foto album (bukan video) atau menghasilkan ZIP jika opsi ZIP dipilih.
- [ ] Tidak ada error CORS saat unduh.

---

## Sprint 5 — Proyek Kelas

**Tujuan:** proyek punya tanggal selesai, bisa dicari, difilter kategori dan tanggal, serta dipaginasi.

### Task

- [ ] **Migrasi database**
  - Buat `supabase/migration_project_tanggal_selesai.sql`:
    ```sql
    ALTER TABLE public.projects
      ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;
    ```
  - Jalankan di Supabase sebelum deploy frontend.
  - Data lama boleh `NULL`; jangan diisi otomatis dari `created_at` karena itu bukan tanggal selesai.
- [ ] **Update tipe database** (`app/types/database.ts`)
  - Tambahkan `tanggal_selesai?: string | null` pada `projects.Row`, `Insert`, dan `Update`.
- [ ] **Admin proyek** (`app/pages/admin/proyek/index.vue`)
  - Tambahkan field `Tanggal Selesai` (`UInput type="date"`).
  - Isi otomatis saat edit.
  - Kirim `tanggal_selesai: form.tanggal_selesai || null` pada payload.
  - Tambahkan kolom tanggal selesai di tabel admin (opsional, disarankan).
- [ ] **Tampilkan tanggal selesai**
  - Di kartu proyek: `Selesai: 12 Des 2025` dengan icon kalender.
  - Di halaman detail `app/pages/proyek/[id].vue`: tampilkan tanggal selesai di area metadata.
  - Jika null: sembunyikan, jangan tampilkan "Invalid Date".
- [ ] **Search bar**
  - Cari di `nama`, `deskripsi`, `teknologi`, dan `anggota`.
- [ ] **Filter kategori**
  - `USelect` dengan opsi dinamis dari data + `Semua kategori`.
  - Urutkan opsi secara alfabetis.
- [ ] **Filter date range**
  - Berdasarkan `tanggal_selesai`.
  - Proyek tanpa tanggal selesai tidak muncul saat filter tanggal aktif.
- [ ] **Pagination**
  - `itemsPerPage = 9`.
  - Reset ke halaman 1 saat filter/search berubah.
  - Saat filter aktif: sembunyikan section `Sorotan Terbaik` dan tampilkan semua hasil dalam satu grid terpaginasi.
- [ ] **Empty state**
  - "Tidak ada proyek yang cocok" + tombol reset filter.

### File yang disentuh

- `supabase/migration_project_tanggal_selesai.sql` (baru)
- `app/types/database.ts`
- `app/pages/admin/proyek/index.vue`
- `app/pages/proyek/index.vue`
- `app/pages/proyek/[id].vue`

### Acceptance criteria

- [ ] Kolom `tanggal_selesai` ada di database dan tipe TypeScript.
- [ ] Admin bisa mengisi dan mengedit tanggal selesai.
- [ ] Tanggal selesai tampil di kartu dan detail proyek.
- [ ] Search, filter kategori, dan date range bisa dikombinasikan.
- [ ] Pagination bekerja dan tidak menduplikasi proyek unggulan.
- [ ] Proyek lama tanpa tanggal selesai tidak error.

---

## Sprint 6 — QA & Rilis

**Tujuan:** memastikan semua perubahan Phase 1 aman dan konsisten.

### Task

- [ ] Jalankan `npm run typecheck`.
- [ ] Jalankan `npm run lint`.
- [ ] Jalankan `npm test`.
- [ ] Uji manual per halaman:
  - [ ] Search modal: saran, query < 2 karakter, hasil, klik hasil.
  - [ ] Header: login, logout, refresh, buka menu mobile.
  - [ ] Anggota: NIM penuh, sort naik/turun, search + sort.
  - [ ] Tugas: status `Akan datang`/`Terlewat`/`Tanpa tenggat`/`Semua`, search, pagination, ruangan ujian.
  - [ ] Galeri: search, date range, pagination, download satu foto, download semua.
  - [ ] Proyek: tanggal selesai, search, kategori, date range, pagination.
- [ ] Uji responsive di 360px, 768px, dan 1280px.
- [ ] Uji dark mode dan light mode.
- [ ] Uji empty state dan reset filter di semua halaman.
- [ ] Perbarui `STATUS_FITUR.md` jika status fitur berubah.
- [ ] Deploy ke staging, lalu production setelah verifikasi.

### Acceptance criteria

- [ ] Tidak ada error typecheck/lint/test.
- [ ] Tidak ada regresi pada halaman yang tidak diubah.
- [ ] Semua checklist Phase 1 di atas terpenuhi.

---

## Keputusan & Asumsi

1. **Pagination client-side.** Jumlah data kelas kecil; tidak perlu query `range()` ke Supabase.
2. **Search tetap memakai Fuse.js** untuk pencarian global. Search per halaman memakai filter string sederhana.
3. **Date range** memakai `tanggal_kegiatan` untuk galeri dan `tanggal_selesai` untuk proyek.
4. **NIM ditampilkan penuh** sesuai permintaan. Ini mengurangi privasi data anggota; pastikan sudah disetujui pengurus.
5. **Download galeri** diimplementasikan tanpa dependensi baru terlebih dahulu. ZIP hanya jika disetujui.
6. **Tidak ada perubahan auth** selain indikator visual di header.
7. **Filter aktif menyembunyikan section unggulan** di Galeri dan Proyek untuk mencegah duplikasi dan pagination yang membingungkan.

## Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| NIM publik | Privasi anggota | Konfirmasi pengurus; mudah dikembalikan jika perlu |
| Proyek lama tanpa `tanggal_selesai` | Filter tanggal kosong | Tampilkan "Belum diisi"; admin melengkapi data |
| Browser memblokir multi-download | Unduh album gagal sebagian | Jeda antar unduhan; opsi ZIP jika disetujui |
| Status login flicker saat SSR | Header berkedip | Uji hydration; gunakan state `useSupabaseUser()` |
| Filter + section unggulan | Duplikasi data | Sembunyikan section unggulan saat filter aktif |

## Di Luar Scope Phase 1

- Pagination/server-side search untuk dataset besar.
- Upload/download video galeri.
- Perubahan RLS atau peran admin.
- Sinkronisasi status tugas per akun.
- Notifikasi email/push.
