import { describe, expect, it } from 'vitest'
import { isPengurusEmail, namaPengurus } from '../pengurus'

describe('isPengurusEmail', () => {
  it('menerima keenam email pengurus, huruf besar dan spasi dibuang', () => {
    expect(Object.keys(namaPengurus)).toHaveLength(6)
    for (const email of Object.keys(namaPengurus)) {
      expect(isPengurusEmail(email)).toBe(true)
      expect(isPengurusEmail(` ${email.toUpperCase()} `)).toBe(true)
    }
  })

  it('menolak akun asing dan nilai kosong', () => {
    expect(isPengurusEmail('mahasiswa@magyasaka.co.id')).toBe(false)
    expect(isPengurusEmail('admin1@magyasaka.co.id.id')).toBe(false)
    expect(isPengurusEmail('')).toBe(false)
    expect(isPengurusEmail(null)).toBe(false)
    expect(isPengurusEmail(undefined)).toBe(false)
  })
})
