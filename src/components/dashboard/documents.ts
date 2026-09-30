import type { Booking, DocKey, Passenger } from '@/types'

export const DOCS: { key: DocKey; label: string; required: boolean }[] = [
  { key: 'passport', label: 'Paspor (min. 8 bulan)', required: true },
  { key: 'ktp', label: 'KTP', required: true },
  { key: 'kk', label: 'Kartu Keluarga', required: true },
  { key: 'photo', label: 'Pas foto latar putih', required: true },
  { key: 'vaccine', label: 'Sertifikat vaksin meningitis', required: true },
  { key: 'marriage', label: 'Buku nikah (pasangan)', required: false },
]
const required = DOCS.filter((d) => d.required)

export const docProgress = (p: Passenger) => {
  const done = required.filter((d) => p.documents[d.key]).length
  return { done, total: required.length, pct: Math.round((done / required.length) * 100) }
}
export const bookingDocProgress = (b: Booking) => {
  const sum = b.passengers.map(docProgress)
  const done = sum.reduce((s, x) => s + x.done, 0)
  const total = sum.reduce((s, x) => s + x.total, 0)
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}
