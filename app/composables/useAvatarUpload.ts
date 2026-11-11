// Unggah foto profil anggota: kompres gambar ke WebP (~512px) lalu simpan di
// bucket `gallery` under folder `members`. Memakai kompresi gambar yang sama
// dengan galeri (mendukung HEIC + orientasi EXIF) supaya hasilnya konsisten
// dan ringan. URL publiknya disimpan di kolom members.foto_url.
import { ref } from 'vue'
import { compressImage } from '~/composables/useGalleryUpload'

const BUCKET = 'gallery'
const FOLDER = 'members'

export function useAvatarUpload() {
  const client = useSupabaseClient()
  const uploading = ref(false)
  const error = ref<string | null>(null)

  async function upload(file: File): Promise<string | null> {
    uploading.value = true
    error.value = null
    try {
      const blob = await compressImage(file, 512, 0.85)
      const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
      const { error: upErr } = await client.storage.from(BUCKET).upload(path, blob, {
        contentType: 'image/webp',
        upsert: false
      })
      if (upErr) throw upErr
      const { data } = client.storage.from(BUCKET).getPublicUrl(path)
      return data.publicUrl
    } catch (e: any) {
      error.value = e?.message || 'Gagal mengunggah foto'
      return null
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading, error }
}
