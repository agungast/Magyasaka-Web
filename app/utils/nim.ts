// Sensor NIM untuk tampilan publik: segmen terakhir disamarkan.
// Format berpemisah titik ("4.33.23.45") -> "4.33.23.**"; tanpa titik -> 2 karakter terakhir jadi "**".
export function maskedNim(nim: string | null | undefined): string {
  const value = nim || ''
  if (!value) return '-'
  if (value.includes('.')) {
    const parts = value.split('.')
    parts[parts.length - 1] = '**'
    return parts.join('.')
  }
  return value.length <= 2 ? '**' : value.slice(0, -2) + '**'
}
