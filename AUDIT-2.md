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
- [x] Bonus (memblokir gerbang): `wrap-break-words` bukan kelas Tailwind → `break-words` di `admin/jadwal` & `admin/tugas` (5 error lint).

**Definisi selesai (manual):** buat tugas deadline hari ini 14:00 → tabel admin menampilkan 14:00 (bukan 21:00), badge "Hari ini", dan tanggal tidak bergeser saat diedit ulang.
**Risiko:** data lama di DB masih tersimpan sebagai UTC-salah. Setelah fix, deadline lama tetap tampil +7 jam. Cek 3–5 baris `assignments` dan koreksi manual bila perlu.

---

## Sprint 2 — Integritas data (temuan 2, 3, 16, 8)

**Tujuan:** tidak ada lagi file/relasi yang menghilang karena urutan operasi yang salah.

**File:** `app/pages/admin/galeri/index.vue`, `app/pages/admin/anggota/index.vue`, `app/pages/admin/jadwal/index.vue`, `app/pages/admin/semester/index.vue`, `app/composables/useGalleryUpload.ts` (bila perlu).

- [ ] Galeri: `confirmDeletePhoto` mencari album dari `albums.value` (bukan `activeAlbum`), lalu hitung `cover_url` baru dari sisa foto album itu — termasuk saat dihapus dari kartu album.
- [ ] Anggota: `removePhoto()` tidak lagi menghapus storage; file lama dihapus hanya setelah `save()` berhasil, dan hanya jika URL-nya berubah.
- [ ] Anggota & Jadwal: payload `save()` berisi field eksplisit (tanpa `id`, `created_at`, `updated_at`).
- [ ] Semester: `executeDelete` menolak hapus bila masih ada `schedules` dengan `semester_id` itu; teks konfirmasi disesuaikan ("hapus/ubah jadwalnya dulu").
- [ ] (Opsional, 1 baris) Hapus cabang `editing` yang tidak pernah aktif **atau** tambahkan tombol Edit — pilih salah satu.

**Definisi selesai (manual):** (a) hapus foto cover dari kartu album → cover pindah ke foto lain, bukan gambar rusak; (b) klik hapus foto anggota lalu Batal → avatar masih tampil; (c) hapus semester yang punya jadwal → ditolak dengan pesan jelas.
**Risiko:** rendah. Satu-satunya perubahan perilaku: hapus semester sekarang bisa gagal (disengaja).

---

## Sprint 3 — Keamanan (temuan 6, 7)

**Tujuan:** data pribadi & panel admin tidak bergantung pada satu toggle dashboard.

**File:** `supabase/fix_public_members_columns.sql` (baru), `app/middleware/auth.ts`, `app/utils/pengurus.ts` (baru), `app/pages/admin.vue`.

- [ ] SQL: cabut akses kolom `no_telepon` untuk `anon` (`REVOKE SELECT ON public.members FROM anon;` lalu `GRANT SELECT (id, nim, nama, foto_url, jurusan, angkatan, status, email) ... TO anon;`). Putuskan: email tetap publik (dipakai tombol "Kontak Email") atau ikut dicabut + hapus tombolnya.
- [ ] `app/utils/pengurus.ts`: satu map `email → nama` (pindahkan dari `admin.vue`).
- [ ] `middleware/auth.ts`: setelah sesi ada, tolak + `signOut()` bila email tidak ada di map; `admin.vue` memakai map yang sama.
- [ ] Jalankan SQL di dashboard, catat di komentar file kapan dijalankan.

**Definisi selesai (manual):** (a) login akun uji non-pengurus → langsung ditolak keluar dari `/admin`; (b) `curl` dengan anon key ke `members?select=no_telepon` → gagal; (c) halaman `/anggota` & `/anggota/pengurus` tetap normal.
**Risiko:** kalau SQL dijalankan sebelum migrasi kolom dipastikan, halaman publik bisa error 401 pada `select`. Jalankan SQL dulu, baru deploy frontend — atau tambahkan kolom secara eksplisit di `useMembers` sebelum deploy.

---

## Sprint 4 — Error & performa (temuan 9, 10, 11, 12, 13)

**Tujuan:** kegagalan terlihat sebagai kegagalan, dan halaman tidak menarik data yang tidak dipakai.

**File:** `app/composables/useData.ts`, `app/composables/useSearch.ts`, `app/app.vue`, `app/pages/galeri/index.vue`, `app/pages/index.vue`, `app/pages/jadwal/index.vue`, `app/pages/admin/jadwal/index.vue`, `app/pages/admin/index.vue`.

- [ ] `useAlbums`: ganti `select('*, photos(*)')` → `select('*, photos(id, url)')` minimal; idealnya `cover_url` + jumlah foto saja. Detail album tetap `photos(*)`.
- [ ] `coverOf()`: return `null` bila album hanya berisi video (jangan kirim URL `.mp4` ke `<img>`).
- [ ] `useData`: teruskan `error`/`status`; halaman daftar (`anggota`, `galeri`, `proyek`) menampilkan blok "Gagal memuat data" + tombol coba lagi, bukan state kosong.
- [ ] `useSearch`: pindahkan 5 pemanggilan data ke dalam `openSearch()` (muat sekali, cache setelahnya).
- [ ] Satu helper `useActiveSemester()` di `useData.ts`; pakai di `pages/index.vue`, `pages/jadwal/index.vue`, `admin/jadwal/index.vue`, `admin/index.vue`; hapus 4 salinan sort.

**Definisi selesai (manual):** (a) matikan network → halaman anggota menampilkan pesan error, bukan "Tidak ditemukan"; (b) buka `/galeri` → Network tab tidak memuat foto semua album; (c) buka `/` → 4 request tabrakan hilang dari tab Network.
**Risiko:** sedang — menyentuh 4 halaman. Kerjakan per file, commit sekali, dan cek ulang pilihan semester aktif di beranda & jadwal setelah refactor.

---

## Sprint 5 — Rumah tangga (temuan 14, 15, 17, 18, 19)

**File:** `.github/workflows/ci.yml`, `README.md`, `app/error.vue`, `app/pages/admin/jadwal/index.vue`, `app/pages/admin/proyek/index.vue`.

- [ ] CI: tambah `- run: npm test` setelah typecheck.
- [ ] README: "Node.js 20+" → "Node.js 22.22+" (samakan dengan CI 24).
- [ ] `error.vue`: tampilkan pesan sesuai `error.statusCode` (404 vs lainnya) dan sediakan tombol "Coba lagi".
- [ ] Jadwal: validasi `jam_selesai > jam_mulai` sebelum simpan.
- [ ] Proyek/anggota/galeri: hapus objek storage lama setelah simpan berhasil (thumbnail diganti, screenshot dihapus dari form).
- [ ] Hapus kode mati: kategori `'galeri'` di `useSearch`; cabang edit semester (bila tidak dipakai).
- [ ] (Opsional) Samakan feedback: ganti `alert()` di admin jadwal/semester/proyek/galeri ke `useToast()` seperti halaman anggota.

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
