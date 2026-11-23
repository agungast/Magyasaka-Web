export type DeadlineTone = 'neutral' | 'error' | 'warning' | 'success'

// Tanggal acuan tiap item: ujian (uts/uas) → hari pelaksanaan, lainnya → deadline.
// Dipakai juga oleh pengingat ujian dan "Tugas Mendatang" di Beranda.
export function effectiveDate(a: {
  tipe?: string | null
  deadline?: string | null
  tanggal_ujian?: string | null
}): string | null {
  if (['uts', 'uas'].includes(a.tipe || '')) return a.tanggal_ujian || a.deadline || null
  return a.deadline || a.tanggal_ujian || null
}

// Selisih hari kalender lokal: 0 = hari ini, -1 = kemarin, 1 = besok.
// Dibandingkan per awal hari, bukan durasi — 4 jam lagi tetap "hari ini".
export function daysUntil(dateStr: string | null | undefined, now: Date = new Date()): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  if (Number.isNaN(target.getTime())) return null
  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((startOfDay(target) - startOfDay(now)) / 86400000)
}

// Item arsip: punya tanggal acuan dan instant-nya sudah berlalu. Tanpa tanggal
// tidak dianggap lewat, supaya item tanpa tenggat tetap bisa dibaca.
export function isPastDue(a: {
  tipe?: string | null
  deadline?: string | null
  tanggal_ujian?: string | null
}, now: Date = new Date()): boolean {
  const d = effectiveDate(a)
  return !!d && new Date(d) <= now
}

// Jam ditampilkan dalam WIB secara eksplisit: Server SSR (UTC) dan browser
// harus menghasilkan string yang sama, dan semua input admin dalam WIB.
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Jakarta'
  })
}

// Label + warna badge tenggat. Satu sumber agar badge di Beranda dan halaman
// Tugas tidak pernah berbeda.
export function deadlineInfo(
  dateStr: string | null | undefined,
  now?: Date
): { label: string, color: DeadlineTone } {
  const days = daysUntil(dateStr, now)
  if (days === null) return { label: 'Tanpa tenggat', color: 'neutral' }
  if (days < 0) return { label: 'Terlewat', color: 'error' }
  if (days === 0) return { label: 'Hari ini', color: 'error' }
  if (days === 1) return { label: 'Besok', color: 'error' }
  return { label: `${days} hari lagi`, color: days <= 7 ? 'warning' : 'success' }
}
