export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          judul: string
          konten: string
          kategori: string
          is_pinned: boolean
          penulis: string
          created_at: string
          updated_at?: string | null
        }
        Insert: Partial<Database['public']['Tables']['announcements']['Row']> & { judul: string; konten: string }
        Update: Partial<Database['public']['Tables']['announcements']['Row']>
      }
      schedules: {
        Row: {
          id: string
          mata_kuliah: string
          dosen: string
          hari: string
          jam_mulai: string
          jam_selesai: string
          ruangan: string
          kode_mk: string
          sks: number
          warna: string
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: Partial<Database['public']['Tables']['schedules']['Row']> & { mata_kuliah: string }
        Update: Partial<Database['public']['Tables']['schedules']['Row']>
      }
      assignments: {
        Row: {
          id: string
          judul: string
          deskripsi: string | null
          mata_kuliah: string
          tipe: string
          deadline?: string | null
          tanggal_ujian?: string | null
          ruangan_ujian?: string | null
          is_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: Partial<Database['public']['Tables']['assignments']['Row']> & { judul: string; mata_kuliah: string; tipe: string }
        Update: Partial<Database['public']['Tables']['assignments']['Row']>
      }
      members: {
        Row: {
          id: string
          nim: string
          nama: string
          email: string | null
          no_telepon?: string | null
          jurusan: string
          angkatan: number
          status: string
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: Partial<Database['public']['Tables']['members']['Row']> & { nim: string; nama: string }
        Update: Partial<Database['public']['Tables']['members']['Row']>
      }
      class_officers: {
        Row: {
          id: string
          member_id: string
          jabatan: string
          periode: string
          urutan: number
          created_at?: string | null
          updated_at?: string | null
          member?: Database['public']['Tables']['members']['Row']
        }
        Insert: Partial<Database['public']['Tables']['class_officers']['Row']> & { member_id: string; jabatan: string; periode: string; urutan: number }
        Update: Partial<Database['public']['Tables']['class_officers']['Row']>
      }
      albums: {
        Row: {
          id: string
          nama: string
          deskripsi: string | null
          tanggal_kegiatan: string
          is_featured?: boolean | null
          cover_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          photos?: Database['public']['Tables']['photos']['Row'][]
        }
        Insert: Partial<Database['public']['Tables']['albums']['Row']> & { nama: string; tanggal_kegiatan: string }
        Update: Partial<Database['public']['Tables']['albums']['Row']>
      }
      photos: {
        Row: {
          id: string
          album_id: string
          url: string
          caption?: string | null
          created_at?: string | null
        }
        Insert: Partial<Database['public']['Tables']['photos']['Row']> & { album_id: string; url: string }
        Update: Partial<Database['public']['Tables']['photos']['Row']>
      }
      projects: {
        Row: {
          id: string
          nama: string
          deskripsi: string
          detail: string
          thumbnail_url?: string | null
          repo_url?: string | null
          demo_url?: string | null
          teknologi: string[]
          anggota: string[]
          is_highlighted: boolean
          kategori: string
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: Partial<Database['public']['Tables']['projects']['Row']> & { nama: string; deskripsi: string; detail: string }
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
