-- Mata kuliah untuk pengurus dengan jabatan PJ (Penanggung Jawab Mata Kuliah).
-- Jalankan di Supabase Dashboard → SQL Editor.

ALTER TABLE public.class_officers
  ADD COLUMN IF NOT EXISTS mata_kuliah text;
