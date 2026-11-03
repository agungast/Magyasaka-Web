# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Mahasiswa TRK 2023 kelas TI-4A** — pengguna utama. Mereka membuka portal untuk hal yang sama berulang: cek jadwal hari ini, cek tugas/ujian yang jatuh tempo, baca pengumuman, cari teman sekelas, dan sesekali melihat galeri kegiatan serta karya proyek kelas. Mayoritas pengguna bersifat **anonim** — membaca portal tidak butuh akun, dan tidak ada alur pendaftaran untuk mahasiswa. Jumlah roster sebenarnya belum dikonfirmasi; data seed di repo hanya berisi 10 anggota contoh.

**Pengurus kelas** — penulis tunggal konten portal, dengan jabatan resmi: Ketua Kelas, Wakil Ketua, Sekretaris, Bendahara, Koordinator Akademik (periode default `2023/2024`). Tugas mereka: mempublikasikan pengumuman, mengisi jadwal dan tugas, memperbarui roster anggota serta kepengurusan, menambahkan foto galeri, dan mendaftarkan proyek kelas. Mereka masuk lewat `/login` (Supabase email + password) lalu bekerja di `/admin`.

**Admin** — sebutan untuk orang yang memegang akun Supabase dan memberikan akses ke pengurus lain. Istilah ini muncul di copy login ("Hubungi admin jika butuh akses") dan berbeda dari "pengurus": pemberi akses belum tentu memakai portal untuk menulis konten.

## Product Purpose

Portal ini adalah satu-satunya rumah informasi kelas TRK 2023 TI-4A. Secara resmi, "Portal & Dashboard resmi Kelas Teknik Rekayasa Komputer Angkatan 2023" — dan keaslian itu bukan sekadar klaim footer: seluruh isi portal ditulis oleh pengurus kelas itu sendiri, tentang angkatan ini saja.

Portal menyatukan dua hal yang biasanya terpisah: informasi akademik (jadwal, tugas, ujian, pengumuman) dan kenangan kelas (album kegiatan, karya proyek, direktori teman sekelas). Biasanya informasi akademik datang dari sistem kampus, dan informasi kelas datang dari grup chat yang tenggelam. Portal ini menyediakan keduanya di satu tempat, dengan isi yang sepenuhnya dikendalikan kelas.

Keberhasilan berarti: mahasiswa membuka portal dan langsung menemukan apa yang dia cari tanpa perlu bertanya ke siapa pun; pengurus bisa menerbitkan konten tanpa menyentuh kode; dan isi portal tetap benar karena satu orang memegang sumber kebenarannya.

## Positioning

Portal kelas yang ditulis dan dimiliki pengurus, dengan CMS lengkap untuk menulis konten — bukan hanya dashboard yang hanya-baca.

Mekanisme pembeda yang tidak bisa disalin apa adanya oleh produk lain: satu panel admin yang benar-benar dapat dikelola pengurus (CRUD penuh atas 8 tabel: pengumuman, jadwal, tugas, anggota, kepengurusan, album, foto, proyek) plus cakupan kelas yang sempit dan pasti (TI-4A angkatan 2023, satu prodi, satu angkatan). Karena cakupannya sempit, portal bisa benar-benar jadi pusat kenangan kelas: galeri, proyek, dan roster anggota berada di sebelah informasi akademik, di bawah satu domain dan satu akun.

## Operating Context

- **Pemakaian harian:** mahasiswa mengecek jadwal dan tenggat dengan cepat, sering di antara kelas, lewat perangkat kecil. Pola yang berulang: "hari ini ada apa", "tugas saya mana", "ada pengumuman baru".
- **Deadline sebagai fitur utama, bukan pelengkap:** tugas/ujian tampil dengan hitung mundur ("Hari ini!", "Besok", "3 hari lagi", "Terlewat") dan filter tipe (tugas/uts/uas/kuis/praktikum). Badge "Selesai ✓" menandai tugas yang sudah dikerjakan.
- **Pencarian global lintas kategori:** satu modal (Ctrl+K / ⌘+K) mencari pengumuman, jadwal, tugas, anggota, dan proyek sekaligus, minimal 2 karakter, 10 hasil teratas, dikelompokkan per kategori.
- **Ritual penerbitan pengurus:** buka `/admin` → pilih menu → isi formulir modal → simpan → `refresh()`. Penghapusan memakai dialog konfirmasi browser. Tidak ada draft, tidak ada riwayat revisi, tidak ada jejak audit.
- **Alur unggah foto tidak langsung:** panel galeri hanya meminta **URL foto**, dengan instruksi untuk mengunggah file lebih dulu secara manual ke Supabase Storage bucket `gallery`, lalu menempelkan URL-nya. Ini alur kerja nyata yang sudah berjalan, bukan placeholder yang belum jadi.
- **Pencarian anggota:** instan di klien dengan Fuse.js (threshold 0.4), urutan default NIM, bisa diurutkan NIM atau nama.
- **Lingkungan:** Supabase Cloud (Postgres + Auth + Storage), akses data langsung dari klien lewat `@nuxtjs/supabase` — tanpa API route server-side. Deploy ke Vercel disebut di PRD, belum dikonfigurasi di repo.
- **Aset gambar:** semua cover album, foto, dan thumbnail proyek saat ini adalah placeholder gradien dengan ikon cadangan; avatar anggota adalah inisial + warna hash.

## Capabilities and Constraints

**Fungsi yang sudah ada dan harus dipertahankan**

- Publik (tanpa login): beranda angkatan dengan sorotan yang di-pin, pintasan menu, jadwal hari ini, tugas mendatang, pengumuman terbaru; jadwal mingguan + tab per hari + total SKS; daftar tugas/ujian dengan filter tipe dan hitung mundur deadline; penandaan tugas selesai; direktori anggota dengan pencarian dan pengurutan; struktur kepengurusan; galeri album + detail album + lightbox dengan navigasi panah; daftar proyek + detail proyek (teknologi, tim, tautan repo/demo); pencarian global; toggle mode terang/gelap.
- Pengurus (login): dashboard panel + CRUD penuh atas pengumuman, jadwal, tugas, anggota, kepengurusan, album, foto, dan proyek; logout.

**Batasan teknis yang mengikat**

- **Akses tulis harus khusus pengurus** (keputusan konfirmasi). Saat ini RLS mengizinkan `INSERT/UPDATE/DELETE` ke **siapapun** dengan `auth.role() = 'authenticated'`, jadi akun mana pun yang login menjadi admin penuh. Membatasi ini ke pengurus (tabel role, atau `class_officers` sebagai sumber kebenaran, plus RLS per role) adalah kapabilitas yang wajib ada, bukan opsional — copy "Hanya pengurus kelas yang memiliki akun bisa login" hari ini belum didukung secara teknis.
- **Cakupan kelas TI-4A belum ada di skema data.** `members` punya `jurusan` dan `angkatan` tapi tidak punya kolom `kelas`. Realitas produk adalah satu kelas, jadi tidak perlu abstraksi multi-angkatan; tetapi penandaan kelas di data perlu diputuskan.
- **Tidak ada alur unggah file.** Entri galeri lewat URL; bucket `gallery`, `avatars`, `projects` baru dideklarasikan di komentar SQL, belum dibuat.
- **Penyelesaian tugas bersifat per-perangkat.** Key `localStorage` `trk2023_completed_tasks`. Kolom `is_completed` di tabel `assignments` ada tapi tidak terpakai, jadi status selesai tidak pernah terlihat oleh teman sekelas lain.
- **Tidak ada pendaftaran, reset password, verifikasi email, maupun penanganan kedaluwarsa sesi.**
- **Stack:** Nuxt 4 + Vue 3, `@nuxt/ui` v4 sebagai sistem komponen (tidak ada direktori `app/ui/`; komponen lokal tinggal di `app/components/`), Tailwind CSS 4 dengan konfigurasi CSS-first (tanpa `tailwind.config.js`), TypeScript, `@nuxtjs/supabase`, `fuse.js`, `@vueuse/nuxt`, ikon Iconify (Lucide + Simple Icons). Font: Plus Jakarta Sans + Inter (Google Fonts).
- **Tidak ada test runner dan tidak ada test.** Perintah verifikasi yang ada justru rusak: `typecheck` gagal karena `app/composables/useData.ts` mengimpor `~/types/database` yang tidak ada, dan `lint` gagal karena `eslint-plugin-better-tailwindcss` tidak terpasang di `package.json`.
- **Lockfile dan CI tidak sinkron:** repo memakai `package-lock.json` (npm) sementara CI `ubuntu-latest` + Node 24 menjalankan pnpm, dan README juga menyebut pnpm. Manajer paket yang benar belum ditetapkan.
- **Tidak ada server API.** `server/` kosong; semua query berjalan dari klien.
- **Aplikasi jatuh ke data mock bila Supabase belum dikonfigurasi** (`isSupabaseConfigured()` di `app/composables/useData.ts` memeriksa apakah `.env` masih berisi placeholder `your-project`). Data mock itu adalah data contoh, bukan isi portal yang sebenarnya.

**Istilah domain (nilai literal di database, tidak boleh diterjemahkan bebas)**

`hari` Senin–Sabtu · `jabatan` Ketua Kelas/Wakil Ketua/Sekretaris/Bendahara/Koordinator Akademik · `kategori` pengumuman umum/akademik/kegiatan/penting · `tipe` tugas tugas/uts/uas/kuis/praktikum · `status` anggota aktif/tidak aktif/cuti.

**Keputusan produk yang masih terbuka**

- Apakah hak tulis dibatasi per jabatan (hanya Ketua yang boleh menerbitkan pengumuman penting), atau semua pengurus setara.
- Apakah mahasiswa perlu akun (saat ini seluruh pembacaan bersifat anonim).
- Apakah foto galeri perlu alur persetujuan sebelum tampil publik.
- Manajer paket kanonik: npm atau pnpm.
- Target deploy aktual (PRD menyebut Vercel + Supabase Cloud; belum ada konfigurasi deploy di repo).

## Brand Commitments

- **Nama:** "Portal TRK 2023"; `<title>` aplikasi "Portal TRK 2023 — Magyasaka". "Magyasaka" adalah nama angkatan, dipakai sebagai penanda identitas kelas — bukan identitas kampus, dan tidak ada logo institusi yang dipakai.
- **Klaim resmi yang harus tetap benar:** "Portal & Dashboard resmi Kelas Teknik Rekayasa Komputer Angkatan 2023." Footer juga menyebut "Built with Nuxt & 💜".
- **Suara:** bahasa Indonesia santai, orang kedua "kamu", hangat dan menyemangati. Bahasa sehari-hari, bukan formal administratif. Emoji dipakai hemat dan hanya di momen lega — "Tidak ada kuliah hari ini! 🎉", "Semua tugas sudah selesai! 🥳", "Gunakan waktu luang untuk belajar atau istirahat 😊". Bahasa produk dan istilah teknis (label form, pesan error) tetap lugas dan singkat.
- **Nuansa:** ramah antar teman sebaya, bukan sistem enterprise. Kelas yang pegang kendali atas portalnya sendiri.
- **Identitas visual (v2 — crest-centered):**
  - **Warna:** ink (#05080c) / paper (#fbfcfe) sebagai dasar; **azure-400 #5b9ae8** sebagai satu-satunya warna aksi (CTA, link aktif, highlight). Semantic colors dijaga: error #b42318, warning #a16207, success #15803d, info #1d4ed8 (500 shades stepped down agar lulus AA di 11px). Tidak ada indigo/violet/pink/emerald/cyan sebagai warna dekoratif; `schedule.warna` (per-mata kuliah) dipertahankan sebagai data di badge.
  - **Tipografi:** `--font-display` **Outfit** (400–800) untuk heading/logo; `--font-sans` **Plus Jakarta Sans** (400–700) untuk body/UI; `--font-mono` **Geist Mono** (400–500) untuk kode/tabular-nums. Self-hosted via `@nuxt/fonts` (Google Fonts `<link>` dihapus).
  - **Crest:** Lambang kelas (hitam di mode terang, putih di mode gelap) ditempatkan di header, hero, login, admin, footer, favicon, apple-touch-icon. Ditetapkan via CSS mask (`currentColor` tint) — satu aset melayani kedua mode.
  - **Tekstur:** halftone dot (radial 8px grid) di `.hero-plate`, `.plate`, card hover — cetak, bukan kaca.
  - **Nol blur/kaca:** `backdrop-filter: none` di header; tidak ada `.glass`, `.glass-light`, gradient text, atau colored `border-l` >1px.
  - **Gerak:** satu momen yang diantisipasi — `.hero-enter` (900ms ease-out) + `halftone-drift` (24s loop, `prefers-reduced-motion` guard). Tanpa `animate-float`, `animate-pulse-glow`, bounce.
  - **Browser surfaces:** `::selection` azure, caret azure, scrollbar ink, page/layout transitions.
- **Aset:** `public/favicon-64.png`, `public/apple-touch-icon.png`, `public/favicon.ico` (PNG-in-ICO), `app/assets/images/magyasaka-crest-ink.png`, `app/assets/images/magyasaka-crest-light.png`. `AppLogo.vue` (wordmark SVG inline, dua huruf `var(--ui-primary)`) **belum pernah dirender di halaman mana pun** — keputusan keep-vs-retire masih terbuka.

## Evidence on Hand

**Yang benar-benar ada**

- Database Supabase yang sudah dimigrasikan penuh: `members`, `class_officers`, `announcements`, `schedules`, `assignments`, `albums`, `photos`, `projects` (`supabase/migration.sql`), dengan RLS, CHECK constraint untuk istilah domain, dan data seed.
- Konten seed identik dengan mock: 3 pengumuman, 8 jadwal, 4 tugas, 10 anggota (NIM 2023001–2023010), 5 pengurus, 3 album, 3 proyek — di `supabase/migration.sql` dan `app/composables/useData.ts`.
- `PRD Kelas TRK 2023.md` (85 baris, bahasa Indonesia, status draft) — 4 fase yang dipetakan 1:1 ke kode (`// Fase 1: Beranda Angkatan` … `// Fase 4: Login Pengurus`), termasuk NFR: SSR + Vercel Edge, RLS untuk pembatasan pengelola, responsif penuh.
- Konfigurasi Supabase ada di `.env.example`; kredensial proyek nyata tidak ada di repo.
- Font: Plus Jakarta Sans + Inter (Google Fonts, dimuat di `nuxt.config.ts`).

**Yang tidak ada — dan tidak boleh dikarang**

- Tidak ada foto kelas, foto kegiatan, avatar anggota asli, cover album asli, atau thumbnail proyek nyata. Semuanya placeholder gradien + ikon.
- Tidak ada tautan repo atau demo proyek yang nyata, tidak ada statistik, tidak ada testimonial, tidak ada harga, lisensi, atau klaim angka.
- Member seed 10 orang adalah data contoh, bukan roster TI-4A sebenarnya. Nama dalam data seed (Ahmad Rizki, Budi Setiawan, Eko Prasetyo, dan seterusnya) tidak boleh disajikan sebagai anggota asli.
- `README.md` adalah boilerplate Nuxt UI Starter yang belum diubah dan **tidak menjelaskan produk ini**; `LICENSE` (MIT, "Nuxt UI Templates") juga warisan starter. Keduanya tidak boleh dipakai sebagai sumber kebenaran.
- Jumlah anggota TI-4A sebenarnya, roster lengkap, dan status keanggotaan aktual belum dikonfirmasi.

## Product Principles

1. **Kelas yang memiliki portalnya.** Semua isi berasal dari pengurus dan tentang angkatan ini. Platformnya netral; kelas yang menulis.
2. **Satu kelas, satu kebenaran.** Cakupannya TI-4A angkatan 2023, satu prodi, satu angkatan. Jangan abstraksi multi-kelas yang tidak pernah dibutuhkan.
3. **Akurat atau tidak ada.** Jangan pernah mengarang nama anggota, foto, prestasi, pengumuman, atau tautan proyek. Kalau belum ada, tempatnya kosong dan itu jujur.
4. **Anggap perangkat genggam.** Tugas rutinnya adalah cek jadwal, cek tenggat, baca pengumuman — dalam waktu singkat, sering di antara kelas.
5. **Pengurus bisa bekerja tanpa developer.** CMS harus tetap bisa dipakai untuk menerbitkan sendiri; tidak ada langkah yang butuh bantuan teknis.
6. **Satu sumber, banyak tampilan.** Jadwal, tugas, anggota, proyek, dan pengumuman saling merujuk; data baru cukup dimasukkan satu kali.

## Accessibility & Inclusion

- Bahasa antarmuka sepenuhnya Indonesia; `htmlAttrs.lang` = `id`; seluruh format tanggal/waktu memakai `id-ID`.
- Mode terang/gelap adalah fitur wajib yang tidak boleh dihapus — dipakai siswa di ruang kelas dengan pencahayaan yang berbeda-beda.
- Pintasan keyboard yang sudah ada dan tidak boleh rusak: Ctrl+K / ⌘+K membuka pencarian global, `Escape` menutup modal pencarian dan lightbox, `←`/`→` menavigasi foto di lightbox.
- Target audiens adalah mahasiswa yang lebih nyaman berbahasa Inggris teknis — istilah seperti "Source Code" dan "Live Demo" tetap dipakai apa adanya, tapi penjelasannya tetap dalam bahasa Indonesia yang mudah.
- Tidak ada standar aksesibilitas yang disepakati secara eksplisit oleh pengguna; perlakukan a11y sebagai default yang harus dijaga, bukan temuan yang diabaikan.
