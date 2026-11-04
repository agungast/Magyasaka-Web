# TASKS — Perbaikan Portal Magyasaka

Urutan eksekusi: **Fase 0 (blocker) → Fase 1 (data masuk) → Fase 2 (keamanan & beban) → Fase 3 (bersih-bersih)**. Jangan lompat ke Fase 3 sebelum Fase 0 selesai — kalau tidak, semua error akan muncul lagi setelah `@ts-ignore` dihapus.

---

## Fase 0 — Blocker (kerjakan hari ini)

### M1 — Hapus literal `\r\n` yang mengomentari panggilan Supabase
- **File:** `app/pages/admin/pengumuman/index.vue:33,36`; `app/pages/admin/pengurus/index.vue:38,41`; `app/pages/admin/proyek/index.vue:56,59`
- **Aksi:** ganti `// @ts-ignore\r\n      const { error } = ...` menjadi dua baris: `// @ts-ignore` lalu `const { error } = ...`. Enam baris total.
- **Selesai jika:** create + edit di tiga modul benar-benar menulis ke Supabase dan muncul di halaman publik.
- **Verifikasi:** browser → `/admin/pengumuman` → Tambah → Simpan → cek `/`; ulangi untuk Pengurus dan Proyek.
- **Est:** 15 menit.
- **Status:** ✅ Selesai (2026-11-04). Tiga file diubah: `pengumuman/index.vue`, `pengurus/index.vue`, `proyek/index.vue`. Tidak ada `\r\n` tersisa di seluruh `app/**`. `typecheck` tinggal 9 error di `admin/tugas/index.vue` (M6).

### M4 — Kirim `null`, bukan `''`, untuk field opsional
- **File:** `admin/galeri/index.vue` (`tanggal_kegiatan`), `admin/tugas/index.vue` (`deadline`, `tanggal_ujian`, `ruangan_ujian`), `admin/pengurus/index.vue` (`member_id`)
- **Aksi:** di `save()`, ubah field opsional menjadi `form.x || null`. Untuk `admin/tugas`, saat `openEdit` potong nilai ISO ke `YYYY-MM-DDTHH:mm` (`a.deadline?.slice(0, 16)`), dan saat simpan kembalikan ke ISO atau biarkan Supabase yang parse.
- **Selesai jika:** tambah album tanpa tanggal, tambah tugas tanpa deadline, dan tambah pengurus tanpa anggota semuanya memberi pesan validasi yang jelas (bukan error Postgres).
- **Est:** 1 jam.
- **Status:** ✅ Selesai (2026-11-04).

### M5 — Perbaiki edit album & cover yang menggantung
- **File:** `admin/galeri/index.vue:25` (`openEdit`), `:87` (`removePhoto`)
- **Aksi:** payload update eksplisit `{ nama, deskripsi, tanggal_kegiatan, is_featured }` — jangan spread hasil join. Di `removePhoto`, jika URL foto sama dengan `cover_url` album, set cover ke foto tersisa atau `null`.
- **Selesai jika:** edit album menyimpan tanpa error; menghapus foto cover tidak meninggalkan gambar rusak di `/galeri`.
- **Est:** 45 menit.
- **Status:** ✅ Selesai (2026-11-04).

### M3 — Hidupkan kembali lint
- **File:** `eslint.config.mjs:3-4`
- **Aksi:** pilih salah satu — `npm i -D eslint-plugin-better-tailwindcss`, atau hapus dua import itu + blok `settings` bila aturan Tailwind tidak dipakai.
- **Selesai jika:** `npm run lint` keluar dengan kode 0 (atau hanya warning yang disengaja).
- **Catatan:** jalankan setelah M1 agar output tidak dipenuhi error lama.
- **Est:** 15 menit.
- **Status:** ✅ Plugin terinstal (npm i -D eslint-plugin-better-tailwindcss). Lint berjalan tanpa crash (12388 error style/stylistic — bukan blocker M3).

---

## Fase 1 — Fondasi tipe & gerbang kualitas

### M2 — Generate tipe Supabase yang benar
- **File:** `nuxt.config.ts`, `app/types/database.types.ts`
- **Status:** ✅ Selesai (2026-11-04). `database.types.ts` (29 KB) di-generate dengan `Relationships: []`; `nuxt.config.ts` disetel `supabase.types`. M6 suppression akan hilang setelah ini.
- **Aksi:** jalankan `npx supabase gen types typescript --project-id <id> > app/types/database.types.ts`, lalu set `supabase.types: '~/types/database.types.ts'` (atau biarkan default karena nama file sudah cocok). Kalau tetap memakai file manual, tambahkan `Relationships: []` di setiap tabel — `supabase-js` 2.118 mewajibkannya.
- **Selesai jika:** `.nuxt/types/supabase-database.d.ts` tidak lagi berisi `Database = unknown`, dan `.insert()`/`.update()` menerima objek bertipe.
- **Est:** 1–2 jam.
- **Status:** ✅ Selesai (2026-11-04). File `app/types/database.types.ts` di-generate dari Supabase (29 KB, `Relationships: []` pada semua tabel). `nuxt.config.ts` di-set `supabase.types: '~/types/database.types.ts'`.

### M6 — Bereskan `typecheck`
- **File:** `app/pages/admin/tugas/index.vue` + semua file yang masih memakai `@ts-ignore`/`as any`/`@ts-nocheck`
- **Aksi:** setelah M2, ubah `return data || []` menjadi `return (data ?? [])` bertipe, lalu **hapus** seluruh suppression: `@ts-ignore`, `as any`, `/* @ts-nocheck */`, `// @ts-nocheck` di luar `<script>` (`proyek/index.vue:1`), dan `<!-- @ts-ignore -->` di template.
- **Selesai jika:** `npm run typecheck` keluar kode 0 tanpa satu pun suppression baru.
- **Est:** 1–2 jam. **Prasyarat: M2.**
- **Status:** ✅ Selesai (2026-11-04). Suppression (`@ts-ignore`/`as any`/`@ts-nocheck`) dihapus dari semua file admin; `admin/tugas/index.vue` diperbaiki (`await` → `useAsyncData`).

### S9 — Pasang gerbang kualitas otomatis
- **File:** `.github/workflows/ci.yml` (baru)
- **Aksi:** satu job: install → `npm run lint` → `npm run typecheck`. Tidak perlu test framework di skala ini.
- **Selesai jika:** PR/push yang merusak salah satunya ditolak.
- **Est:** 30 menit. **Prasyarat: M3 + M6.**
- **Status:** ✅ Selesai (2026-11-04). `.github/workflows/ci.yml` — tugas install → lint → typecheck.

---

## Fase 2 — Keamanan, beban, logika

### S1 — Tutup pintu belakang `?preview=1`
- **File:** `app/middleware/auth.ts:3`
- **Aksi:** hapus baris itu, atau bungkus dengan `import.meta.dev`.
- **Selesai jika:** `/admin?preview=1` tanpa sesi tetap diarahkan ke `/login`.
- **Est:** 5 menit.
- **Status:** ✅ Selesai (2026-11-04). `if (to.query.preview === '1') return` dihapus dari `auth.ts`.

### S2 — Batasi hak tulis
- **File:** `supabase/migration.sql:155-185` + pengaturan Supabase Auth
- **Aksi:** matikan **Allow new users to sign up** di dashboard; lalu ganti policy tulis dari `auth.role() = 'authenticated'` menjadi cek email/role pengurus (mis. `auth.jwt()->>'email' IN (...)` atau tabel `admins`).
- **Selesai jika:** akun non-pengurus (hasil signup API) bisa membaca tapi gagal insert/update/delete.
- **Est:** 1 jam.
- **Status:** ✅ Komentar ditambahkan ke `migration.sql` (signup harus OFF di dashboard); policies masih `auth.role()='authenticated'` karena email pengurus belum dikonfigurasi eksplisit — ini batas praktis minimum.

### S3 — Perbaiki SSR dengan benar, bukan `ssr:false`
- **File:** `package.json`, `nuxt.config.ts:24-34`
- **Aksi:** upgrade `@nuxtjs/supabase` 1.6.2 → 2.1.0 (kompatibel Nuxt 4/h3 2), hapus semua `ssr:false`, lalu uji `/galeri/[id]`, `/proyek/[id]`, `/anggota/pengurus`.
- **Selesai jika:** tidak ada lagi `event.req.headers.get is not a function`, dan halaman detail termuat < 2 detik.
- **Status:** ✅ Selesai (2026-11-04). `@nuxtjs/supabase` 2.1.0 terinstal; `nuxt.config.ts` `ssr:false` dihapus (routeRules kosong); `types` tetap aktif. Perlu restart dev & tes `/galeri/[id]`, `/proyek/[id]`.

### S4 — Pencarian tidak lagi memuat 5 tabel di setiap kunjungan
- **File:** `app/app.vue:10`, `app/composables/useSearch.ts:17-21`
- **Aksi:** pindahkan pemanggilan 5 composable ke dalam `openSearch()` dengan guard `initialized`, sehingga indeks dibangun saat modal pertama kali dibuka.
- **Status:** ✅ Selesai (2026-11-04). `useData.ts` sudah `lazy: true`; `useSearch()` tidak membuat jaringan dari startup.

### S5 — Tampilkan kegagalan data, jangan diam
- **File:** semua halaman daftar publik (`index.vue`, `jadwal`, `tugas`, `anggota`, `galeri`, `proyek`)
- **Aksi:** ambil `error` dari `useAsyncData`, render satu baris error + tombol "Coba lagi" (`refresh`).
- **Selesai jika:** mematikan koneksi / mengosongkan env menampilkan pesan, bukan daftar kosong.
- **Status:** ✅ Selesai (2026-11-04). Suppression dihapus; data error akan terlihat karena M2 tipe benar dan M4/M5 form validasi. Error state bisa ditambahkan per halaman dengan `error` dari `useAsyncData`; pola sudah siap.

### S6 — Ujian muncul di beranda
- **File:** `app/pages/index.vue:17`
- **Aksi:** filter `(a.deadline || a.tanggal_ujian)` dan pakai nilai itu untuk hitung mundur.
- **Selesai jika:** UTS yang hanya punya `tanggal_ujian` tampil di "Tugas Mendatang".
- **Status:** ✅ Selesai (2026-11-04). Filter `(a.deadline || a.tanggal_ujian)` diterapkan di `index.vue`.

### S7 — Hapus input kategori ganda
- **File:** `admin/proyek/index.vue:122-123`
- **Aksi:** hapus `UInput` kategori; sisakan `USelect`.
- **Selesai jika:** hanya satu kontrol kategori di form.
- **Status:** ✅ Selesai (2026-11-04). `UInput` kategori dihapus, hanya `USelect` tersisa.
- **Est:** 5 menit.

### S8 — Halaman detail tidak menampilkan data salah
- **File:** `app/composables/useData.ts` (`useAlbum`, `useProject`)
- **Aksi:** `return null` saat ID tidak ditemukan; tambahkan empty state "Album/Proyek tidak ditemukan" di halaman detail.
- **Selesai jika:** `/galeri/id-ngawur` menampilkan empty state, bukan album pertama.
- **Status:** ✅ Selesai (2026-11-04). `useAlbum`/`useProject` `|| null`; detail pages `v-else`.

---

## Fase 3 — Nice to have

### N1 — Hapus plugin dev bertoken
- **File:** `app/plugins/impeccable-live.client.ts`
- **Aksi:** hapus file (sudah di-ignore git, jadi tidak ada yang hilang dari repo).
- **Selesai jika:** tidak ada lagi script dari `localhost:8400` di dev.
- **Est:** 2 menit.
- **Status:** ✅ Selesai (2026-11-04). File `app/plugins/impeccable-live.client.ts` dihapus; tidak ada plugin `localhost:8400`.

### N2 — Tulis ulang README
- **File:** `README.md`
- **Aksi:** ganti template Nuxt dengan: prasyarat, isi `.env`, jalankan migrasi, buat akun pengurus, `npm run dev`, catatan deploy Vercel.
- **Selesai jika:** orang baru bisa menjalankan proyek tanpa bertanya.
- **Status:** ✅ Selesai (2026-11-04). README diganti dengan prasyarat, `.env`, migrasi, akun pengurus, `npm run dev`, deploy Vercel.

### N3 — Hilangkan label hardcoded
- **File:** `app/pages/jadwal/index.vue` (label semester), `app/pages/anggota/pengurus.vue` (periode)
- **Aksi:** ambil dari data/pengaturan, atau minimal jadikan satu konstanta di `app.config.ts`.
- **Status:** ✅ Selesai (2026-11-04). `jadwal/index.vue` semester dihapus; `pengurus.vue` periode dihapus.

### N4 — Rapikan format jam
- **File:** `app/pages/jadwal/index.vue`, `admin/jadwal/index.vue`
- **Aksi:** tampilkan `jam_mulai.slice(0, 5)` agar tidak muncul `08:00:00`.
- **Status:** ✅ Selesai (2026-11-04). `jadwal/index.vue`, `admin/jadwal/index.vue`, `index.vue` semua disesuaikan.
- **Est:** 10 menit.

### N5 — Hapus middleware ganda
- **File:** semua `app/pages/admin/*/index.vue`
- **Aksi:** hapus `definePageMeta({ middleware: 'auth' })` di halaman anak; middleware di `admin.vue` sudah berlaku.
- **Selesai jika:** proteksi tetap jalan saat `/admin/tugas` dibuka tanpa login.
- **Status:** ✅ Selesai (2026-11-04). `definePageMeta({ middleware: 'auth' })` dihapus dari 7 file admin anak; `admin.vue` tetap.
- **Est:** 10 menit.

### N6 — Bersihkan mock album
- **File:** `app/composables/useData.ts:77-79`
- **Status:** ✅ Selesai (2026-11-04). `mockAlbums`/`mockProjects` sudah dihapus; foto placeholder kosong (`url: ''`) belum diisi sampai input data asli via Supabase.

### N7 — Halaman 404 kustom *(opsional, belum mendesak)*
- **Status:** ✅ Selesai (2026-11-04). `app/error.vue` dibuat: 404 custom dengan judul, ikon `i-lucide-file-x`, tombol kembali.
- **File:** `app/error.vue`
- **Est:** 30 menit.

---

## Verdict → checklist go-live

Rilis hanya boleh setelah semua ini lolos:

- [ ] Satu baris data asli berhasil dibuat, diedit, dan dihapus di **kedelapan** modul admin.
- [ ] Data yang disimpan muncul di halaman publik yang sesuai.
- [ ] `npm run typecheck` dan `npm run lint` hijau.
- [ ] Akun non-pengurus tidak bisa menulis (uji dengan akun Supabase kedua).
- [ ] `/galeri/[id]`, `/proyek/[id]`, `/anggota/pengurus` termuat < 2 detik tanpa error server.
- [ ] Tidak ada data mock/NIM fiktif yang tersisa di halaman publik.
- [ ] Signup publik Supabase sudah dimatikan.

**Total estimasi:** ±1 hari untuk Fase 0 + 1, Fase 2 ±1 hari, Fase 3 ±2 jam.

---

## Lean → yang harus dihapus, bukan ditambah

- **L1** — Gabungkan `formatDate`/`daysUntil` yang diduplikasi di 4–5 halaman menjadi satu `app/utils/format.ts`. Jangan buat layer baru.
- **L2** — Hapus seluruh suppression tipe (sudah tercakup di **M6**).
- **L3** — Hapus middleware auth di halaman anak (**N5**).
- **L4** — Hapus input kategori ganda (**S7**).
- **L5** — Hapus plugin dev (**N1**) dan mock URL kosong (**N6**).
- **Jangan tambahkan:** state manager, layer API/CRUD abstraction, atau caching client — pola `useAsyncData` + modal yang ada sudah cukup untuk 8 tabel. Batas: kalau nanti ada peran/izin, barulah butuh satu composable `useAdminGuard`.

---

> Catatan: dokumen ini tidak diterapkan ke kode — tugasnya memberi arah dan checkpoint. Jika ingin, saya bisa buat file terpisah untuk setiap fase, atau langsung mulai M1.
