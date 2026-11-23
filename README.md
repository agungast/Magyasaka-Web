# Portal Magyasaka — Angkatan 2023

Portal akademik kelas: pengumuman, jadwal, tugas/ujian, pengurus, galeri, dan proyek.

## Prasyarat
- Node.js 22.22+ (CI memakai 24)
- Akun Supabase (isi `.env` dari `.env.example`)

## Setup
```bash
npm install
```

Isi `.env` (salin dari `.env.example`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## Migrasi
```bash
npx supabase db push
```
Lalu matikan **Allow new users to sign up** di dashboard Supabase (`Authentication → Providers`).

## Akun Pengurus
Buat satu akun `authenticated` via dashboard Supabase (`Authentication → Add User`) — ini adalah pengurus kelas yang bisa menulis data.

## Dev
```bash
npm run dev
```
Buka `http://localhost:3000`.

Masuk sebagai pengurus: `/login` (Supabase Auth) → akses `/admin/*` untuk membuat/edit data.

## Deploy
- **Vercel:** import repo → set Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`) → deploy.
- **SSR:** sudah aktif (`routeRules` kosong); tidak perlu `ssr:false`.

## Struktur Modul Admin
`/admin/pengumuman`, `/admin/jadwal`, `/admin/tugas`, `/admin/anggota`, `/admin/galeri`, `/admin/proyek`.
