# Audit Ronde 2 — Rencana Sprint Fixing

> Audit: 19 November 2026 (ponytail-audit — laporan saja, tidak mengubah kode saat audit)
> Beban yang diasumsikan: satu kelas (±40 mahasiswa) + beberapa pengurus, trafik kecil, Supabase free tier.
> Nomor temuan mengikuti laporan audit ronde 2 (1–19). Ronde 1 (11 Nov) sudah tuntas dan tercatat di `AUDIT.md`.

**Aturan main tiap sprint**
- Satu sprint = satu commit yang bisa di-deploy sendiri (tidak menunggu sprint lain).
- Gerbang wajib sebelum commit: `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` (0 error).
- Setiap sprint punya "definisi selesai" manual — bukan hanya CI hijau.
- Jangan gabungkan sprint 3 (SQL) dengan sprint lain: perubahan RLS butuh verifikasi manual dengan akun kedua.

---

## Sprint 1 — Waktu & tenggat (temuan 1, 4, 5)

**Tujuan:** semua tanggal/jam yang dilihat pengurus dan mahasiswa sama dengan yang diketik.

**File:** `app/components/DateTimeField.vue`, `app/pages/tugas/index.vue`, `app/pages/index.vue`, `app/utils/date.ts` (baru), `app/composables/__tests__/upload.spec.ts` (tambah blok) atau `date.spec.ts` (baru).

- [x] `DateTimeField`: `buildValue()` mengirim ISO UTC dari waktu lokal (`new Date(y, m-1, d, h, min).toISOString()`), `syncFromModel()` mengubah balik ISO → tanggal+jam lokal.
- [x] Buat `app/utils/date.ts`: `daysUntil(dateStr)` berbasis selisih awal hari lokal (bukan `Math.ceil` durasi), `deadlineInfo()` untuk label+warna, dan `effectiveDate()` (dimiliki bersama halaman Tugas & Beranda).
- [x] Pakai helper itu di `pages/tugas/index.vue` (hapus 2 salinan lokal) dan `pages/index.vue`.
- [x] Beranda "Tugas Mendatang": filter `is_completed`, urutkan pakai `effectiveDate(a)`, dan badge memakai tanggal efektif (bukan `task.deadline` saja).
- [x] Test: `app/utils/__tests__/date.spec.ts` — 19 Nov 19:00 + tenggat hari ini 23:00 → "Hari ini"; kemarin → "Terlewat"; besok → "Besok"; +5 hari → "5 hari lagi".
- [x] Bonus (keputusan 23 Nov): `wrap-break-words` **didiasiarkan** di `admin/jadwal` & `admin/tugas` karena valid di editor; `eslint.config.mjs` menambahkannya ke `ignore` plugin Tailwind. Kelas `break-words` di halaman lain tidak diubah.

**Definisi selesai (manual):** buat tugas deadline hari ini 14:00 → tabel admin menampilkan 14:00 (bukan 21:00), badge "Hari ini", dan tanggal tidak bergeser saat diedit ulang.
**Risiko:** data lama di DB masih tersimpan sebagai UTC-salah. Setelah fix, deadline lama tetap tampil +7 jam. Cek 3–5 baris `assignments` dan koreksi manual bila perlu.

---

## Sprint 2 — Integritas data (temuan 2, 3, 16, 8)

**Tujuan:** tidak ada lagi file/relasi yang menghilang karena urutan operasi yang salah.

**File:** `app/pages/admin/galeri/index.vue`, `app/pages/admin/anggota/index.vue`, `app/pages/admin/jadwal/index.vue`, `app/pages/admin/semester/index.vue`, `app/composables/useGalleryUpload.ts` (bila perlu).

- [x] Galeri: `confirmDeletePhoto` mencari album dari `albums.value` berdasarkan `p.album_id` (bukan `activeAlbum`), lalu hitung `cover_url` baru dari sisa foto gambar — termasuk saat dihapus dari kartu album.
- [x] Anggota: `removePhoto()` hanya mengosongkan form; file lama dihapus di `save()` setelah update berhasil dan URL berubah. `oldFotoUrl` diisi di `openEdit`, dikosongkan di `openCreate`.
- [x] Anggota & Jadwal: payload `save()` berisi field eksplisit (tanpa `id`, `created_at`, `updated_at`).
- [x] Semester: `executeDelete` mengecek `count` schedules lebih dulu; teks konfirmasi tidak lagi menjanjikan jadwal "tetap tersimpan".
- [x] Bonus (keputusan 23 Nov): `wrap-break-words` tidak dikembalikan ke `break-words` — sudah diabaikan plugin ESLint di Sprint 1.
- [ ] Opsional — cabang edit semester mati: sengaja tidak dikerjakan di sini, sudah masuk Sprint 5 (temuan 19).

**Definisi selesai (manual):** (a) hapus foto cover dari kartu album → cover pindah ke foto lain, bukan gambar rusak; (b) klik hapus foto anggota lalu Batal → avatar masih tampil; (c) hapus semester yang punya jadwal → ditolak dengan pesan jelas.
**Risiko:** rendah. Satu-satunya perubahan perilaku: hapus semester sekarang bisa gagal (disengaja).

---

## Sprint 3 — Keamanan (temuan 6, 7)

**Tujuan:** data pribadi & panel admin tidak bergantung pada satu toggle dashboard.

**File:** `supabase/fix_public_members_columns.sql` (baru), `app/middleware/auth.ts`, `app/utils/pengurus.ts` (baru), `app/pages/admin.vue`.

- [x] SQL: file `supabase/fix_public_members_columns.sql` — `REVOKE SELECT ON public.members FROM anon` + `GRANT SELECT (id, nim, nama, email, jurusan, angkatan, status, foto_url)`. Keputusan: **email tetap publik** (dipakai tombol "Kontak Email" di `MemberCard`); hanya `no_telepon` dicabut.
- [x] `app/utils/pengurus.ts`: satu map `email → nama` (dipindahkan dari `admin.vue`) + `isPengurusEmail()`, dengan test.
- [x] `middleware/auth.ts`: tolak + `signOut()` bila email di luar allowlist. Bug lama juga ditutup: dulu pemulihan sesi client melakukan `return` lebih awal sehingga never sampai ke pengecekan. `admin.vue` memakai map yang sama.
- [x] **SUDAH DILAKUKAN USER (23 Nov):** SQL dijalankan di Supabase Dashboard → SQL Editor. Verifikasi akhir (anon tidak bisa select `no_telepon`, login non-pengurus ditolak) masih perlu dicek manual di dashboard.

**Definisi selesai (manual):** (a) login akun uji non-pengurus → langsung ditolak keluar dari `/admin`; (b) `curl` dengan anon key ke `members?select=no_telepon` → gagal; (c) halaman `/anggota` & `/anggota/pengurus` tetap normal.
**Risiko:** kalau SQL dijalankan sebelum migrasi kolom dipastikan, halaman publik bisa error 401 pada `select`. Jalankan SQL dulu, baru deploy frontend — atau tambahkan kolom secara eksplisit di `useMembers` sebelum deploy.

---

## Sprint 4 — Error & performa (temuan 9, 10, 11, 12, 13)

**Tujuan:** kegagalan terlihat sebagai kegagalan, dan halaman tidak menarik data yang tidak dipakai.

**File:** `app/composables/useData.ts`, `app/composables/useSearch.ts`, `app/app.vue`, `app/pages/galeri/index.vue`, `app/pages/index.vue`, `app/pages/jadwal/index.vue`, `app/pages/admin/jadwal/index.vue`, `app/pages/admin/index.vue`.

- [x] `useAlbums`: `select('*, photos(id, url)')` — cukup untuk cover & jumlah foto; detail album (`useAlbum`) tetap `photos(*)`.
- [x] `coverOf()`: return `null` bila album hanya berisi video (tidak ada fallback ke `photos[0].url`).
- [x] Komponen `DataError.vue` dipakai di `anggota`, `galeri`, `proyek`: pesan "Gagal memuat data" + tombol "Coba lagi" (`refresh()`), bukan state kosong. `error`/`status` sudah diteruskan `useAsyncData`.
- [x] `useSearch`: 5 composables dipanggil dengan `immediate: false` (bukan dipanggil ulang di handler — `useAsyncData` harus dipanggil saat setup), lalu `refresh()` sekali dari `openSearch()` bila status belum `success`.
- [x] Satu helper `useActiveSemester()` di `useData.ts` (mengembalikan `activeSemester`, `sortedSemesters`, `semesters`, `semestersStatus`); dipakai di `pages/index.vue`, `pages/jadwal/index.vue`, `admin/jadwal/index.vue`, `admin/index.vue`; 4 salinan sort dihapus.

**Definisi selesai (manual):** (a) matikan network → halaman anggota menampilkan pesan error, bukan "Tidak ditemukan"; (b) buka `/galeri` → Network tab tidak memuat foto semua album; (c) buka `/` → 4 request tabrakan hilang dari tab Network.
**Risiko:** sedang — menyentuh 4 halaman. Kerjakan per file, commit sekali, dan cek ulang pilihan semester aktif di beranda & jadwal setelah refactor.

---

## Sprint 5 — Rumah tangga (temuan 14, 15, 17, 18, 19)

**File:** `.github/workflows/ci.yml`, `README.md`, `app/error.vue`, `app/pages/admin/jadwal/index.vue`, `app/pages/admin/proyek/index.vue`.

- [x] CI: `- run: npm test` setelah typecheck.
- [x] README: "Node.js 20+" → "Node.js 22.22+ (CI memakai 24)".
- [x] `error.vue`: pesan 404 vs umum memakai `error.statusCode`, tombol "Coba lagi" lewat `reloadNuxtApp()` (404 tetap punya "Lihat Galeri").
- [x] Jadwal: `save()` ditolak bila `jam_selesai <= jam_mulai` (memakai `durationText` yang sudah ada).
- [x] Proyek: `oldMediaUrls` dihapus dari storage hanya setelah update berhasil — mencakup thumbnail/demo yang diganti dan screenshot yang dihapus dari form. Anggota & galeri sudah memenuhi dari Sprint 2 (foto lama dihapus setelah simpan; file dihapus saat row foto dihapus).
- [x] Hapus kode mati: kategori `'galeri'` di `useSearch` + `categoryIcons` `app.vue`; cabang edit semester (tabel memang tidak punya tombol edit) beserta state `editing`.
- [ ] **(Opsional, sengaja dilewati)** Ganti `alert()` di admin jadwal/semester/proyek/galeri ke `useToast()` — tidak mengubah perilaku, hanya kosmetik feedback.

**Definisi selesai (manual):** push ke GitHub → run CI menjalankan 4 step dan hijau; buka URL acak → halaman 404 yang benar; simpan jadwal 10:00–08:00 → ditolak.
**Risiko:** rendah.

---

## Diputuskan tidak dikerjakan — Batasan akses pengurus

Keputusan (19 Nov 2026): semua pengurus tetap punya akses penuh ke seluruh menu admin, termasuk hapus. Tidak ada RBAC per-jabatan, tidak ada `is_ketua()`, tidak ada penyembunyian tombol.

Konsekuensinya: Sprint 2 menjadi satu-satunya jaring pengaman terhadap data yang hilang karena salah klik. Jangan dilewati.

---

## Ringkasan urutan

| Sprint | Temuan | Dampak | Est. |
|---|---|---|---|
| 1 | 1, 4, 5 | Jam & badge tenggat benar | 1–1,5 jam |
| 2 | 2, 3, 16, 8 | Tidak ada data hilang/rusak | 1,5 jam |
| 3 | 6, 7 | PII tertutup, panel admin hanya untuk pengurus | 1 jam + 10 menit dashboard |
| 4 | 9, 10, 11, 12, 13 | Error terlihat, halaman lebih ringan | 1,5 jam |
| 5 | 14, 15, 17, 18, 19 | CI menjaga tes, UX konsisten | 1 jam |

**Tidak dikerjakan di sprint mana pun (keputusan):** batasan akses/menu per jabatan pengurus (akses penuh untuk semua pengurus, cukup allowlist email di Sprint 3), view publik terpisah untuk `members` (cukup cabut kolom), dan uji perangkat fisik — semuanya tidak sepadan untuk 6 akun pengurus.

---

## Prosedur sinkronisasi email pengurus

Daftar email pengurus disimpan di **dua tempat yang harus selalu sinkron**:

1. `app/utils/pengurus.ts` — konstanta `namaPengurus` (digunakan middleware `auth.ts` dan halaman admin).
2. `supabase/fix_write_policies.sql` — fungsi `public.is_pengurus()` (digunakan RLS di database).

Setiap kali menambah atau menghapus pengurus:

1. Tambah/hapus baris email di `namaPengurus` di `app/utils/pengurus.ts`.
2. Tambah/hapus baris email di dalam fungsi `public.is_pengurus()` di `supabase/fix_write_policies.sql`.
3. Jalankan `fix_write_policies.sql` di Supabase Dashboard → SQL Editor.
4. Verifikasi: login akun non-pengurus → `/admin` harus ditolak; halaman publik tetap tampil.

Jangan mengubah salah satu tempat saja — akan menyebabkan ketidaksesuaian akses antara frontend dan database.
