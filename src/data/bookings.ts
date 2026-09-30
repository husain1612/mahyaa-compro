import type { Booking, BookingStatus, DocKey, Passenger, PaymentMethod, RoomType, Transaction } from '@/types'
import { seedPackages } from './packages'
import { seedPromotions } from './promotions'
import { calcPricing } from '@/utils/pricing'

/** Akun demo. Password apa pun diterima oleh authService mock. */
export const DEMO_USER_ID = 'u-demo'

const doc = (keys: DocKey[]): Partial<Record<DocKey, boolean>> => Object.fromEntries(keys.map((k) => [k, true]))

const pax = (id: string, name: string, birth: string, g: 'L' | 'P', docs: DocKey[]): Passenger => ({
  id, fullName: name, birthDate: birth, gender: g,
  phone: '081234567890', email: `${id}@contoh.test`,
  passportNumber: `X${Math.floor(1000000 + (id.length * 7919 + name.length * 104729) % 8999999)}`,
  passportExpiry: '2031-06-30', documents: doc(docs),
})

interface Seed {
  n: number
  owner: string
  code: string
  slug: string
  depIdx: number
  room: RoomType
  status: BookingStatus
  option: 'dp' | 'full'
  method?: PaymentMethod
  created: string
  bookerName: string
  passengers: Passenger[]
  promo?: string
}

const make = (s: Seed): Booking => {
  const pkg = seedPackages.find((p) => p.slug === s.slug)!
  const d = pkg.departures[s.depIdx]
  const promo = seedPromotions.find((p) => p.code === s.promo)
  const pricing = calcPricing(pkg, s.room, s.passengers.length, promo)
  const id = `bk-seed-${s.n}`
  const paid = s.status === 'dp_paid' || s.status === 'paid'
  const amount = s.option === 'full' ? pricing.total : pricing.dpAmount
  const txStatus: Transaction['status'] | null =
    paid ? 'success' : s.status === 'failed' ? 'failed' : s.status === 'expired' ? 'expired' : s.status === 'awaiting_payment' ? 'pending' : null
  const transactions: Transaction[] = txStatus
    ? [{ id: `tx-seed-${s.n}`, bookingId: id, method: s.method ?? 'va', option: s.option, amount, status: txStatus, createdAt: s.created, reference: `DEMO-${s.code}`, expiresAt: txStatus === 'pending' ? new Date(Date.now() + 24 * 3600_000).toISOString() : undefined, isDemo: true }]
    : []
  return {
    id, bookingCode: s.code, ownerId: s.owner, createdAt: s.created, status: s.status,
    packageId: pkg.id, packageSlug: pkg.slug, packageName: pkg.name,
    departureId: d.id, departureDate: d.date, airportCode: d.airportCode,
    room: s.room,
    booker: { fullName: s.bookerName, phone: '081234567890', email: `${s.owner}@contoh.test` },
    passengers: s.passengers, pricing, paymentOption: s.option, paymentMethod: s.method,
    transactions, termsAcceptedAt: s.status === 'draft' ? undefined : s.created, isDemo: true,
  }
}

const all: DocKey[] = ['passport', 'ktp', 'kk', 'photo', 'vaccine']

export const seedBookings: Booking[] = [
  make({ n: 1, owner: DEMO_USER_ID, code: 'MHY-260901-A1B2', slug: 'umrah-reguler-9-hari-cgk', depIdx: 0, room: 'quad', status: 'dp_paid', option: 'dp', method: 'va', created: '2026-09-01T09:15:00.000Z', bookerName: 'Siti Rahmawati',
    passengers: [pax('p1a', 'Siti Rahmawati', '1980-04-12', 'P', ['passport', 'ktp', 'kk']), pax('p1b', 'Budi Santoso', '1978-08-21', 'L', ['passport', 'ktp', 'kk', 'photo', 'marriage'])] }),
  make({ n: 2, owner: DEMO_USER_ID, code: 'MHY-260915-C3D4', slug: 'umrah-ramadhan-15-hari', depIdx: 1, room: 'double', status: 'awaiting_payment', option: 'dp', method: 'qris', created: '2026-09-15T14:20:00.000Z', bookerName: 'Siti Rahmawati', promo: 'EARLYBIRD',
    passengers: [pax('p2a', 'Siti Rahmawati', '1980-04-12', 'P', ['passport'])] }),
  make({ n: 3, owner: DEMO_USER_ID, code: 'MHY-260620-E5F6', slug: 'umrah-premium-9-hari', depIdx: 0, room: 'triple', status: 'paid', option: 'full', method: 'transfer', created: '2026-06-20T08:00:00.000Z', bookerName: 'Siti Rahmawati',
    passengers: [pax('p3a', 'Siti Rahmawati', '1980-04-12', 'P', all), pax('p3b', 'Rina Rahmawati', '2001-02-03', 'P', all), pax('p3c', 'Dimas Santoso', '2004-11-19', 'L', all)] }),
  make({ n: 4, owner: 'u-ahmad', code: 'MHY-260905-G7H8', slug: 'umrah-reguler-12-hari-sub', depIdx: 0, room: 'quad', status: 'paid', option: 'full', method: 'va', created: '2026-09-05T10:00:00.000Z', bookerName: 'Ahmad Fauzi', promo: 'MAHYAA10',
    passengers: [pax('p4a', 'Ahmad Fauzi', '1975-01-30', 'L', all), pax('p4b', 'Aisyah Fauzi', '1977-07-07', 'P', all), pax('p4c', 'Hasan Fauzi', '2000-03-15', 'L', all), pax('p4d', 'Fatimah Fauzi', '2003-09-09', 'P', all)] }),
  make({ n: 5, owner: 'u-hendra', code: 'MHY-260918-J9K0', slug: 'umrah-reguler-10-hari-kno', depIdx: 1, room: 'triple', status: 'failed', option: 'dp', method: 'va', created: '2026-09-18T16:45:00.000Z', bookerName: 'Hendra Wijaya',
    passengers: [pax('p5a', 'Hendra Wijaya', '1970-05-25', 'L', ['passport', 'ktp'])] }),
  make({ n: 6, owner: 'u-dewi', code: 'MHY-260922-L1M2', slug: 'haji-plus-1447-cgk', depIdx: 0, room: 'double', status: 'expired', option: 'dp', method: 'transfer', created: '2026-09-22T11:30:00.000Z', bookerName: 'Dewi Lestari',
    passengers: [pax('p6a', 'Dewi Lestari', '1965-12-01', 'P', ['passport']), pax('p6b', 'Rahmat Lestari', '1962-06-18', 'L', ['passport'])] }),
  make({ n: 7, owner: 'u-rizky', code: 'MHY-260927-N3P4', slug: 'umrah-akhir-tahun-9-hari', depIdx: 0, room: 'quad', status: 'awaiting_payment', option: 'dp', method: 'va', created: '2026-09-27T13:10:00.000Z', bookerName: 'Rizky Pratama', promo: 'KELUARGA',
    passengers: [pax('p7a', 'Rizky Pratama', '1985-10-10', 'L', ['passport', 'ktp']), pax('p7b', 'Nadia Pratama', '1987-04-04', 'P', ['passport']), pax('p7c', 'Alif Pratama', '2010-08-08', 'L', []), pax('p7d', 'Salsa Pratama', '2012-01-21', 'P', [])] }),
]
