import { describe, expect, it } from 'vitest'
import { daysUntil, deadlineInfo, effectiveDate, formatDateTime, isPastDue } from '../date'

// 19 Nov 2026, 19:00 waktu lokal — sengaja "sore" supaya tenggat hari ini
// tidak bisa lolos hanya karena selisihnya kurang dari sehari.
const now = new Date(2026, 10, 19, 19, 0)

describe('daysUntil', () => {
  it('menghitung per hari kalender, bukan durasi', () => {
    expect(daysUntil('2026-11-19T23:00:00', now)).toBe(0)
    expect(daysUntil('2026-11-20T08:00:00', now)).toBe(1)
    expect(daysUntil('2026-11-18T23:59:00', now)).toBe(-1)
    expect(daysUntil('2026-11-21T00:00:00', now)).toBe(2)
  })

  it('kosong atau tidak valid', () => {
    expect(daysUntil('', now)).toBeNull()
    expect(daysUntil(null, now)).toBeNull()
    expect(daysUntil('bukan tanggal', now)).toBeNull()
  })
})

describe('deadlineInfo', () => {
  it('label dan warna', () => {
    expect(deadlineInfo('2026-11-19T23:00:00', now)).toEqual({ label: 'Hari ini', color: 'error' })
    expect(deadlineInfo('2026-11-20T08:00:00', now)).toEqual({ label: 'Besok', color: 'error' })
    expect(deadlineInfo('2026-11-17T08:00:00', now)).toEqual({ label: 'Terlewat', color: 'error' })
    expect(deadlineInfo('2026-11-24T08:00:00', now)).toEqual({ label: '5 hari lagi', color: 'warning' })
    expect(deadlineInfo('2026-12-01T08:00:00', now)).toEqual({ label: '12 hari lagi', color: 'success' })
    expect(deadlineInfo(null, now)).toEqual({ label: 'Tanpa tenggat', color: 'neutral' })
  })
})

describe('effectiveDate', () => {
  it('ujian memakai tanggal pelaksanaan, tugas memakai deadline', () => {
    expect(effectiveDate({ tipe: 'uas', tanggal_ujian: '2026-11-20', deadline: '2026-11-19' }))
      .toBe('2026-11-20')
    expect(effectiveDate({ tipe: 'tugas', deadline: '2026-11-19', tanggal_ujian: null }))
      .toBe('2026-11-19')
  })

  it('jatuh ke kolom lain bila kolom utamanya kosong', () => {
    expect(effectiveDate({ tipe: 'uts', tanggal_ujian: null, deadline: '2026-11-19' }))
      .toBe('2026-11-19')
    expect(effectiveDate({ tipe: 'tugas' })).toBeNull()
  })
})

describe('isPastDue', () => {
  it('memakai tanggal efektif dan hanya mengarsipkan yang sudah berlalu', () => {
    expect(isPastDue({ tipe: 'tugas', deadline: '2026-11-18T08:00:00' }, now)).toBe(true)
    expect(isPastDue({ tipe: 'tugas', deadline: '2026-11-20T08:00:00' }, now)).toBe(false)
    expect(isPastDue({ tipe: 'uas', tanggal_ujian: '2026-11-18T08:00:00', deadline: '2026-11-25T08:00:00' }, now)).toBe(true)
    expect(isPastDue({ tipe: 'tugas' }, now)).toBe(false)
  })
})

describe('formatDateTime', () => {
  it('menampilkan jam WIB dan sama untuk SSR maupun browser', () => {
    expect(formatDateTime('2026-11-20T07:00:00Z')).toBe('20 Nov 2026, 14.00')
    expect(formatDateTime('2026-11-20T17:00:00Z')).toBe('21 Nov 2026, 00.00')
    expect(formatDateTime(null)).toBe('-')
  })
})
