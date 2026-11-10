// Unggah langsung dari browser: kompres gambar ke WebP (orientasi EXIF tetap
// lurus, HEIC didukung) dan video ke MP4 via ffmpeg.wasm, lalu unggah ke
// Supabase Storage. Dipakai bersama oleh galeri dan proyek. Kompresi gambar
// memakai createImageBitmap + canvas; HEIC dikonversi dulu via heic2any.

const BUCKET = 'gallery'

// HEIC/HEIF tidak bisa didecode browser (selain Safari), jadi dideteksi lewat
// MIME atau ekstensi karena sebagian OS melaporkan type kosong.
export function isHeicFile(file: File): boolean {
  return /^image\/(heic|heif)$/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || isHeicFile(file)
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg)$/i.test(file.name)
}

export function isMediaFile(file: File): boolean {
  return isImageFile(file) || isVideoFile(file)
}

// Deteksi tipe media dari URL (path storage menyimpan ekstensi file).
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url)
}

function videoExt(file: File): string {
  const m = /\.(\w+)$/.exec(file.name)
  const ext = m?.[1]?.toLowerCase()
  if (ext && /^(mp4|webm|mov|m4v|ogg)$/.test(ext)) return ext
  if (file.type === 'video/webm') return 'webm'
  if (file.type === 'video/quicktime') return 'mov'
  return 'mp4'
}

// Kompres File gambar menjadi Blob WebP. Sisi terpanjang diskalakan ke maxDim
// dan dikodekan ulang dengan `quality`. Orientasi EXIF dihormati lewat
// createImageBitmap({ imageOrientation: 'from-image' }) supaya foto ponsel
// tidak miring; mundur ke decode <img> bila API itu tidak tersedia.
export async function compressImage(file: File, maxDim = 1920, quality = 0.8): Promise<Blob> {
  // HEIC/HEIF tidak bisa didecode langsung browser non-Safari. Konversi ke
  // JPEG dulu lewat libheif (WASM), diimpor dinamis agar tidak membebani muat awal.
  const source: Blob = isHeicFile(file)
    ? await (async () => {
        const { default: heic2any } = await import('heic2any')
        const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
        return Array.isArray(out) ? out[0]! : out
      })()
    : file

  const draw = async (source: CanvasImageSource, sw: number, sh: number): Promise<Blob> => {
    let width = sw
    let height = sh
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D tidak tersedia di browser ini')
    ctx.drawImage(source, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Gagal mengompres ke WebP'))),
        'image/webp',
        quality
      )
    })
  }

  try {
    const bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
    try {
      return await draw(bitmap, bitmap.width, bitmap.height)
    } finally {
      bitmap.close?.()
    }
  } catch {
    // Mundur: decode <img> (orientasi tidak dikoreksi pada browser lama)
    const objectUrl = URL.createObjectURL(source)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = () => reject(new Error('Gagal memuat gambar'))
        i.src = objectUrl
      })
      return await draw(img, img.naturalWidth, img.naturalHeight)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }
}

// Kompres video ke MP4 (H.264/AAC) dengan ffmpeg.wasm. Core single-thread
// diunduh on-demand dari CDN (tanpa perlu COOP/COEP). Sisi terpanjang dibatasi
// maxDim supaya file ringan tanpa upscale / distorsi.
let ffmpegPromise: Promise<any> | null = null
async function loadFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm')
      })
      return ffmpeg
    })()
    // Jangan simpan kegagalan permanen: izinkan percobaan ulang di upload berikutnya.
    ffmpegPromise.catch(() => { ffmpegPromise = null })
  }
  return ffmpegPromise
}

export async function compressVideo(file: File, maxDim = 1280, crf = 28): Promise<Blob> {
  const ffmpeg = await loadFFmpeg()
  const { fetchFile } = await import('@ffmpeg/util')
  const input = `in-${Date.now()}.${videoExt(file)}`
  const output = `out-${Date.now()}.mp4`
  try {
    await ffmpeg.writeFile(input, await fetchFile(file))
    const scale = `scale=w='min(${maxDim},iw)':h='min(${maxDim},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`
    await ffmpeg.exec([
      '-i', input,
      '-vf', scale,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      output
    ])
    const data = (await ffmpeg.readFile(output)) as Uint8Array
    return new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
  } finally {
    await ffmpeg.deleteFile(input).catch(() => {})
    await ffmpeg.deleteFile(output).catch(() => {})
  }
}

export interface UploadItem {
  file: File
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
  url?: string
}

export function useGalleryUpload() {
  const client = useSupabaseClient()

  // Unggah satu file media: kompres gambar ke WebP / video ke MP4, lalu simpan
  // di bucket `gallery` under <folder>/<unik>.<ext>. `folder` mis. albumId atau
  // `projects/<id>`.
  async function uploadOne(item: UploadItem, folder: string): Promise<string> {
    try {
      let blob: Blob = item.file
      let ext = 'bin'
      let contentType: string | undefined

      if (isImageFile(item.file)) {
        item.status = 'compressing'
        blob = await compressImage(item.file)
        ext = 'webp'
        contentType = 'image/webp'
      } else if (isVideoFile(item.file)) {
        item.status = 'compressing'
        try {
          blob = await compressVideo(item.file)
          ext = 'mp4'
          contentType = 'video/mp4'
        } catch {
          // ffmpeg gagal (mis. CDN diblokir) → unggah apa adanya agar tidak buntu.
          blob = item.file
          ext = videoExt(item.file)
          contentType = item.file.type || undefined
        }
      } else {
        throw new Error('File bukan foto atau video')
      }

      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      item.status = 'uploading'
      const { error } = await client.storage.from(BUCKET).upload(path, blob, {
        contentType,
        upsert: false
      })
      if (error) throw error

      const { data } = client.storage.from(BUCKET).getPublicUrl(path)
      item.url = data.publicUrl
      item.status = 'done'
      item.progress = 100
      return item.url
    } catch (e: any) {
      item.status = 'error'
      item.error = e?.message || 'Gagal mengunggah'
      throw e
    }
  }

  // Hapus object storage dari URL publiknya (best-effort, abaikan jika gagal).
  async function removeFromStorage(publicUrl: string): Promise<void> {
    try {
      const marker = `/${BUCKET}/`
      const idx = publicUrl.indexOf(marker)
      if (idx === -1) return
      const path = publicUrl.slice(idx + marker.length)
      await client.storage.from(BUCKET).remove([path])
    } catch {
      /* ignore */
    }
  }

  return { uploadOne, removeFromStorage, bucket: BUCKET }
}
