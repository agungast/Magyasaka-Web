# Portal Magyasaka — Angkatan 2023

Portal akademik kelas: pengumuman, jadwal, tugas/ujian, pengurus, galeri, dan proyek.

## Prasyarat
- Node.js 20+
- Akun Supabase (project `vwfwnsrplkfolmgehxbb` atau ganti `.env`)

## Setup
```bash
npm install
```

Isi `.env` (salin dari `.env.example` jika ada; sudah berisi `SUPABASE_URL` dan `SUPABASE_KEY` default):
```
SUPABASE_URL=https://vwfwnsrplkfolmgehxbb.supabase.co
SUPABASE_KEY=eyJ...
```

## Migrasi
```bash
npx supabase db push --project-id vwfwnsrplkfolmgehxbb
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
