import { describe, expect, it } from 'vitest'
import { isHeicFile, isVideoFile, isVideoUrl, videoExt } from '../useGalleryUpload'
import { maskedNim } from '../../utils/nim'

function file(name: string, type = ''): File {
  return new File([''], name, { type })
}

describe('deteksi media', () => {
  it('isHeicFile: lewat MIME atau ekstensi (case-insensitive)', () => {
    expect(isHeicFile(file('IMG_0001.HEIC'))).toBe(true)
    expect(isHeicFile(file('foto.heif'))).toBe(true)
    expect(isHeicFile(file('x', 'image/heic'))).toBe(true)
    expect(isHeicFile(file('foto.jpg', 'image/jpeg'))).toBe(false)
  })

  it('isVideoFile: ekstensi walau MIME kosong', () => {
    expect(isVideoFile(file('clip.MP4'))).toBe(true)
    expect(isVideoFile(file('x', 'video/webm'))).toBe(true)
    expect(isVideoFile(file('foto.png', 'image/png'))).toBe(false)
  })

  it('isVideoUrl: ekstensi di path, bukan query string', () => {
    expect(isVideoUrl('https://x/storage/a.mp4')).toBe(true)
    expect(isVideoUrl('https://x/storage/a.MOV?token=1')).toBe(true)
    expect(isVideoUrl('https://x/storage/a.mp4#t=1')).toBe(true)
    expect(isVideoUrl('https://x/storage/a.webp')).toBe(false)
    expect(isVideoUrl('https://x/storage/a.mp4.jpg')).toBe(false)
  })

  it('videoExt: ekstensi dikenal, fallback MIME, fallback mp4', () => {
    expect(videoExt(file('clip.MOV'))).toBe('mov')
    expect(videoExt(file('clip', 'video/webm'))).toBe('webm')
    expect(videoExt(file('clip.mkv'))).toBe('mp4')
  })
})

describe('maskedNim', () => {
  it('menyamarkan segmen terakhir NIM bertitik', () => {
    expect(maskedNim('4.33.23.45')).toBe('4.33.23.**')
  })

  it('menyamarkan 2 karakter terakhir NIM tanpa titik', () => {
    expect(maskedNim('2023001')).toBe('20230**')
  })

  it('nim sangat pendek atau kosong', () => {
    expect(maskedNim('12')).toBe('**')
    expect(maskedNim('')).toBe('-')
    expect(maskedNim(null)).toBe('-')
  })
})
