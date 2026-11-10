-- Screenshot galeri + link website untuk proyek.
-- Jalankan di Supabase Dashboard → SQL Editor.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS website_url text;
