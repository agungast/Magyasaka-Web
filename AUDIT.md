# Audit Kode & Rencana Sprint Fixing — Portal Magyasaka

> Audit: 11 November 2026 (ponytail-audit, mode laporan — tidak mengubah kode saat audit)
> Beban yang diasumsikan: portal kelas ±40 mahasiswa + beberapa pengurus, trafik kecil, Supabase free tier.

**What this repo does:** Portal web kelas Magyasaka (Nuxt 4 + Supabase): halaman publik (pengumuman, jadwal, tugas, anggota, galeri, proyek), login pengurus, dan panel admin CRUD untuk semua data. Data disimpan di Supabase (Postgres + Storage), unggah media dikompres di browser.

---

## Temuan

### Must fix

#### 1. Satu toggle dashboard adalah satu-satunya keamanan tulis data
`supabase/migration.sql:177-212`, `app/middleware/auth.ts`
- **Apa ini:** Semua policy tulis (insert/update/delete) di semua tabel hanya cek `auth.role() = 'authenticated'` — siapa pun yang login bisa hapus/ubah seluruh data. Middleware `/admin` juga hanya cek "sudah login", bukan peran.
- **Masalah:** Anon key & URL project Supabase terlihat publik di source halaman. Kalau **Allow new users to sign up** di dashboard Supabase menyala (itu *default*-nya), siapa pun bisa daftar akun sendiri lewat API Supabase dan langsung jadi admin penuh. Repo tidak bisa membuktikan toggle itu mati — README & STATUS_FITUR menyuruh mematikannya, tapi satu salah klik dashboard = semua data terbuka.
- **Fix:** Ganti policy tulis jadi allowlist email pengurus (sudah disarankan komentar SQL-nya sendiri): `WITH CHECK (auth.jwt()->>'email' IN ('ketua@magyasaka.id', ...))`. Satu file SQL, dashboard berhenti jadi titik gagal tunggal.
- **Kalau dilewati:** kesalahan satu setting dashboard = orang luar bisa menghapus seluruh data kelas.

#### 2. CI merah — lint dan typecheck dua-duanya gagal
`app/components/ConfirmModal.vue:2`, `app/types/database.ts:85-100`, `app/pages/anggota/pengurus.vue`
- **Apa ini:** GitHub Actions menjalankan `npm run lint` dan `npm run typecheck`. Hasil audit: lint gagal (1 error: `props` tak terpakai di ConfirmModal), typecheck gagal (6 error di `pengurus.vue`).
- **Masalah:** Akar typecheck: tipe `members` di `database.ts` tidak punya `foto_url` padahal ada di migration dan dipakai halaman; mock officer di `useData.ts` tidak punya `mata_kuliah` sehingga tipe `useOfficers()` jadi gabungan aneh. Konsekuensi: setiap push gagal, gerbang mutu tidak melindungi apa pun, orang terbiasa mengabaikan merah.
- **Fix:** Hapus `const props =` tak terpakai; tambah `foto_url?: string | null` ke Row `members` di `database.ts`; tambah `mata_kuliah: null` di mock officer. ±3 baris, 7 error hilang, CI hijau.
- **Kalau dilewati:** regresi baru tidak tertangkap CI karena CI sudah selalu merah.

#### 3. `UButtonGroup` tidak ada di @nuxt/ui 4 — dua halaman publik tampil rusak
`app/pages/anggota/index.vue:64-81`, `app/pages/jadwal/index.vue:108-125`
- **Apa ini:** Tombol "NIM/Nama" dan "Mingguan/Hari Ini" dibungkus `<UButtonGroup>`.
- **Masalah:** `@nuxt/ui@4.12` tidak punya komponen ButtonGroup (dicek langsung di `node_modules`). Vue merendernya sebagai elemen asing `<ubuttongroup>` — tombol tetap muncul tapi tidak menyatu seperti grup, console ber-warning tiap kunjungan.
- **Fix:** Ganti dua-duanya dengan `<div class="flex">` biasa.
- **Kalau dilewati:** UI publik tidak sesuai rancangan + warning permanen di console.

#### 4. Halaman admin Semester menelan error database
`app/pages/admin/semester/index.vue:56-58`
- **Apa ini:** Simpan semester: `await client.from('semesters').update(...)` / `insert(...)` **tanpa** mengambil `{ error }`.
- **Masalah:** Supabase JS tidak melempar exception untuk error Postgres — dikembalikan lewat `error`. Tabel punya `UNIQUE (nomor, tipe, tahun_ajaran)`. Kasus: buat "Sem 1 Ganjil 2023/2024" dua kali → pelanggaran UNIQUE → modal tertutup seolah berhasil, data tidak tersimpan, tanpa pesan. Semua halaman admin lain sudah benar; hanya ini yang lupa.
- **Fix:** Samakan pola: `const { error } = await ...; if (error) throw error` (blok catch sudah ada).
- **Kalau dilewati:** pengurus mengira data tersimpan, kebingungan saat data tidak muncul.

#### 5. Menghapus album galeri meninggalkan semua file fotonya di Storage
`app/pages/admin/galeri/index.vue:70-75`
- **Apa ini:** Hapus album menjalankan `client.from('albums').delete()` — baris `photos` ikut ter-CASCADE.
- **Masalah:** File di bucket Storage **tidak ikut terhapus**. Hapus album 100 foto = 100 objek yatim di bucket selamanya; free tier Storage akan penuh. Halaman proyek sudah benar (memanggil `removeFromStorage`); hanya album yang bocor.
- **Fix:** Sebelum delete, loop `a.photos` (sudah termuat — query albums sudah `select('*, photos(*)')`) dan panggil `removeFromStorage(p.url)` yang sudah diimpor. ±4 baris.
- **Kalau dilewati:** Storage tumbuh tanpa batas, quota free tier terkuras.

### Should fix

#### 6. Email dan nomor telepon seluruh anggota terbaca siapa pun
`supabase/migration.sql:158`, `app/composables/useData.ts:154-167`
- **Apa ini:** Policy `Public read access` di `members` mengembalikan **semua kolom** ke siapa pun dengan anon key, termasuk `email` dan `no_telepon`.
- **Masalah:** UI berhati-hati (NIM disensor), tapi request REST apa pun dengan anon key bisa mem-dump email + no telepon semua teman sekelas. `no_telepon` bahkan tak pernah dipakai UI publik, tapi tetap dikirim.
- **Fix:** Minimal: di `useMembers()` ganti `.select('*')` jadi daftar kolom publik (tanpa `no_telepon`; `email` tergantung keputusan produk karena tombol "Kontak Email" memakainya). Lebih benar: view publik tanpa PII untuk halaman publik, tabel penuh hanya untuk admin.
- **Kalau dilewati:** data pribadi ±40 mahasiswa bisa diambil massal oleh siapa pun.

#### 7. Data palsu bisa tayang di produksi kalau env hilang
`app/composables/useData.ts:78-86`
- **Apa ini:** Kalau `SUPABASE_URL` kosong/placeholder, semua halaman memakai mock data ("Ahmad Rizki Pratama", dsb.).
- **Masalah:** Cek hanya "URL tidak placeholder". Lupa set env saat deploy ke Vercel → pengumuman & anggota **palsu** tampil ke seluruh kelas tanpa satu pesan error.
- **Fix:** Satu baris — hanya pakai mock saat `import.meta.dev`; di produksi lempar error agar halaman menampilkan state error, bukan data fiktif.
- **Kalau dilewati:** miskonfigurasi deploy tak terdeteksi, data fiktif dianggap nyata.

#### 8. Dua helper identik untuk menghapus file Storage
`app/composables/useAvatarUpload.ts:38-47`, `app/composables/useGalleryUpload.ts:211-221`
- **Apa ini:** `useAvatarUpload().remove` dan `useGalleryUpload().removeFromStorage` — logika sama persis.
- **Masalah:** Harus diubah bersamaan; satu pasti tertinggal saat bucket/logika berubah.
- **Fix:** Hapus salinan di useAvatarUpload, ekspor & pakai `removeFromStorage` dari modul galeri.
- **Kalau dilewati:** perbaikan cleanup nanti hanya menambal satu salinan.

#### 9. Nol tes untuk logika yang berisiko
- **Apa ini:** Repo tidak punya satu pun tes / test runner.
- **Masalah:** Logika berisiko tanpa pengaman: `maskedNim` (sensor NIM — fitur privasi), `isHeicFile`/`videoExt` (salah deteksi = file ditolak/salah format), `defaultTahun` (rumus tahun ajaran). Ketiganya fungsi murni, mudah diuji.
- **Fix:** Tambah vitest (devDependency) + satu file tes untuk `maskedNim` dan deteksi file (±20 baris).
- **Kalau dilewati:** regresi sensor NIM / unggah file tidak ketahuan sampai dilihat pengguna.

#### 10. Kode dan aset mati
`app/components/AppLogo.vue`, `app/assets/images/`
- **Apa ini:** `AppLogo.vue` (SVG logo 40 baris) tidak dipakai satu halaman pun (grep seluruh tree, termasuk fixture/config). Tiga gambar juga tanpa referensi: `Logo Magyasaka.png`, `Logo Magyasaka putih.png`, `Profile Picture Instagram.png`.
- **Fix:** Hapus semuanya.
- **Kalau dilewati:** hanya bengkak repo, tidak berbahaya.

### Nice to have

#### 11. `supabase/.temp/` ter-commit
Isi alat CLI (`cli-latest`, `linked-project.json`) = cache lokal, bukan sumber kebenaran. Tambahkan ke `.gitignore`, hapus dari repo.

#### 12. Mock semester menulis `GASAL`, database menyimpan `Ganjil`
`useData.ts:36` — hanya tampilan mock. Samakan satu string.

#### 13. Inti ffmpeg diunduh dari unpkg.com saat runtime
`useGalleryUpload.ts:111` — dependensi CDN eksternal tiap kompres video pertama. Fallback ke unggah mentah sudah ada dan ditandai, jadi ini bukan bug; menyimpan wasm di `/public` membuatnya lebih andal saat CDN diblokir.

#### 14. 132 warning `no-explicit-any`
Akarnya sama dengan temuan 2 (tipe database drift) — memperbaiki `database.ts` menghapus sebagian besar. Sisanya jadi error lambat laun.

---

## Verdict

Sehat untuk ukuran proyek kelas, tapi perbaiki dulu **#1** (keamanan tulis data) dan **#2** (CI hijau) — dua-duanya kecil dan murah.

**Lean:** -±50 baris, -3 aset gambar, 0 dependensi bisa dihapus (temuan 8, 10, 11).

**Not checked:** `app/assets/css/main.css` & detail visual (sudah diaudit impeccable terpisah), `error.vue`, detail alur `admin/anggota` & `admin.vue`, dokumen PRD/TASKS, `.github/skills/impeccable/**` (tooling, bukan kode aplikasi), dan setting dashboard Supabase sesungguhnya (policy bucket Storage, toggle signup) — tidak bisa diverifikasi dari repo.

---

# Sprint Fixing

> Eksekusi berurutan — sprint berikutnya mulai setelah sebelumnya selesai & terverifikasi.
> Centang kotak saat selesai. Setiap sprint punya langkah verifikasi di bawahnya.

## Sprint 1 — Keamanan & Gerbang Mutu (temuan 1, 2) — ±30 menit

Tujuan: dinding keamanan tidak lagi bergantung pada toggle dashboard, dan CI kembali hijau sehingga sprint berikutnya terlindungi.

- [x] **1a. Policy tulis berbasis allowlist** — buat `supabase/fix_write_policies.sql`:
  - `DROP POLICY` semua `"Auth insert/update/delete"` lama (9 tabel),
  - buat ulang dengan `WITH CHECK (auth.jwt()->>'email' IN (...))` / `USING (...)`,
  - isi daftar email pengurus aktual (tanya ketua kelas; taruh email di file, bukan di kode app),
  - jalankan di SQL Editor dashboard, lalu commit file SQL ke repo.
  - **Status 11 Nov:** file SQL sudah dibuat (via fungsi `public.is_pengurus()`, daftar email di satu tempat) — **6 email pengurus sudah terisi** (`admin1`/`ketua`/`sekretaris1`/`sekretaris2`/`bendahara1`/`bendahara2` @magyasaka.co.id). Tersisa: buat 6 akun di dashboard + jalankan SQL.
- [x] **1b. Perbaiki typecheck**:
  - `app/types/database.ts`: tambah `foto_url?: string | null` ke Row `members`,
  - `app/composables/useData.ts`: tambah `mata_kuliah: null` ke tiap baris `mockOfficers`,
  - cek `app/pages/anggota/pengurus.vue` tidak lagi error.
- [x] **1c. Perbaiki lint error**: hapus `const props =` yang tak terpakai di `app/components/ConfirmModal.vue:2` (cek dulu apakah template memakai `props.` — jika iya, cukup rename jadi `_props` atau pakai langsung).

**Verifikasi Sprint 1:**
```
npm run lint        # exit 0
npm run typecheck   # exit 0
```
Plus manual: buka dashboard Supabase → Authentication → cek toggle signup mati; coba signup via API dengan email luar → harus ditolak policy.

## Sprint 2 — Bug Fungsional (temuan 3, 4, 5) — ±30 menit

Tujuan: tiga bug yang terlihat/dirasakan pengguna & pengurus.

- [x] **2a. Ganti `UButtonGroup`** di `app/pages/anggota/index.vue` dan `app/pages/jadwal/index.vue` dengan `<div class="flex">` (pertahankan `gap` bila perlu). Hapus tag pembuka/penutupnya saja, tombol di dalamnya tidak disentuh.
- [x] **2b. Cek error di admin semester**: `app/pages/admin/semester/index.vue:56-58` → `const { error } = await client.from('semesters').insert(payload); if (error) throw error` (sama untuk update).
- [x] **2c. Bersihkan storage saat hapus album**: di `app/pages/admin/galeri/index.vue` dalam `confirmDeleteAlbum`, sebelum delete: `for (const p of a.photos || []) await removeFromStorage(p.url)`.

**Verifikasi Sprint 2:**
```
npm run dev
```
- `/anggota` & `/jadwal`: tombol grup tampil menyatu, **tidak ada** warning `UButtonGroup` di console dev.
- `/admin/semester`: coba simpan semester duplikat → muncul pesan error, bukan tertutup diam.
- `/admin/galeri`: hapus album berisi foto → objek hilang di dashboard Storage (cek bucket `gallery`).

## Sprint 3 — Privasi & Ketahanan (temuan 6, 7, 8, 9) — ±1 jam

Tujuan: PII berhenti bocor, mock tidak bisa tayang di produksi, duplikasi hilang, logika berisiko mulai teruji.

- [ ] **3a. Batasi kolom publik**: `useMembers()` di `useData.ts` → `.select('id, nim, nama, email, jurusan, angkatan, status, foto_url')` (putuskan `email` bersama pengurus: tombol "Kontak Email" memakainya; `no_telepon` pasti keluar).
- [ ] **3b. Mock hanya di dev**: di `useData.ts`, `isSupabaseConfigured()` kembalikan `false` hanya jika `import.meta.dev`; di produksi tanpa env → `throw` agar `useAsyncData` menampilkan state error.
- [ ] **3c. Satukan helper remove**: hapus fungsi `remove` di `useAvatarUpload.ts`, ekspor `removeFromStorage` dari `useGalleryUpload.ts` (atau pindah ke sana), perbarui pemanggilnya di `admin/anggota`.
- [ ] **3d. Tes pertama**: `npm i -D vitest` + satu file `app/composables/__tests__/upload.spec.ts` untuk `isHeicFile`/`isVideoFile`/`videoExt`/`isVideoUrl` dan `maskedNim` (pindahkan `maskedNim` dari MemberCard ke utils jika perlu agar bisa diimpor). Tambah script `"test": "vitest run"`.

**Verifikasi Sprint 3:**
```
npm run test
```
- DevTools Network tab di `/anggota`: payload members tidak berisi `no_telepon`.
- Hapus `.env` sementara → `npm run build && npm run preview` → halaman menampilkan error state, bukan "Ahmad Rizki Pratama". Kembalikan `.env` setelahnya.

## Sprint 4 — Bersih-bersih / Lean (temuan 10-14) — ±20 menit

Tujuan: kurangi baris yang harus dibaca orang berikutnya.

- [ ] **4a. Hapus** `app/components/AppLogo.vue` dan 3 aset tak terpakai (`Logo Magyasaka.png`, `Logo Magyasaka putih.png`, `Profile Picture Instagram.png`) — grep ulang sebelum hapus untuk memastikan masih nol referensi.
- [ ] **4b.** Tambah `supabase/.temp/` ke `.gitignore`, `git rm --cached` isinya.
- [ ] **4c.** Samakan mock semester: `'GASAL'` → `'Ganjil'` di `useData.ts:36`.
- [ ] **4d. (opsional)** salin `ffmpeg-core.js` + `ffmpeg-core.wasm` ke `public/ffmpeg/` dan arahkan `loadFFmpeg` ke sana (temuan 13) — hanya kalau CDN unpkg pernah bermasalah di jaringan kampus.
- [ ] **4e. (opsional)** bereskan sisa warning `no-explicit-any` yang tersisa setelah 1b — jangan dikejar semuanya sekali jalan.

**Verifikasi Sprint 4:**
```
npm run lint && npm run typecheck && npm run test && npm run build
```
Semua hijau. Buka halaman utama + admin sekali untuk smoke test visual.

---

## Urutan prioritas satu baris

**1 → 2 → 5 → 4 → 3 → 6 → 7 → 8 → 9 → 10-14** (keamanan dulu, lalu gerbang CI, lalu bug yang merusak data/UX, lalu privasi, terakhir kebersihan).
