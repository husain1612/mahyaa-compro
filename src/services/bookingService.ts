import type { Booking, Passenger, Promotion, DocKey, PaymentMethod } from '@/types'
import { ApiError } from '@/utils/errors'
import { calcPricing, promoReason } from '@/utils/pricing'
import type { BookingFormValues } from '@/utils/schemas'
import { db, delay } from './storage'

const rand = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
const uid = (p: string) => `${p}-${Date.now().toString(36)}${rand(3).toLowerCase()}`

export const genBookingCode = () => {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `MHY-${ymd}-${rand(4)}`
}

const mustFind = (id: string): Booking => {
  const b = db.bookings().find((x) => x.id === id)
  if (!b) throw new ApiError({ code: 'BOOKING_NOT_FOUND', message: 'Booking tidak ditemukan.' })
  return b
}
const persist = (b: Booking) => {
  db.saveBookings(db.bookings().map((x) => (x.id === b.id ? b : x)))
  return b
}

export const bookingService = {
  async create(slug: string, values: BookingFormValues, ownerId: string): Promise<Booking> {
    const pkg = db.packages().find((p) => p.slug === slug)
    if (!pkg) throw new ApiError({ code: 'PACKAGE_NOT_FOUND', message: 'Paket tidak ditemukan.' })
    const dep = pkg.departures.find((d) => d.id === values.departureId)
    if (!dep) throw new ApiError({ code: 'DEPARTURE_NOT_FOUND', message: 'Tanggal keberangkatan tidak tersedia.', fieldErrors: { departureId: 'Pilih tanggal yang tersedia' } })
    if (dep.seatsLeft < values.passengers.length) {
      throw new ApiError({ code: 'SEATS_UNAVAILABLE', message: `Sisa kursi hanya ${dep.seatsLeft}, kurang dari jumlah jemaah.` })
    }
    const passengers: Passenger[] = values.passengers.map((p) => ({ ...p, id: uid('pax'), documents: {} }))
    const booking: Booking = {
      id: uid('bk'), bookingCode: genBookingCode(), ownerId, createdAt: new Date().toISOString(), status: 'draft',
      packageId: pkg.id, packageSlug: pkg.slug, packageName: pkg.name,
      departureId: dep.id, departureDate: dep.date, airportCode: dep.airportCode,
      room: values.room, booker: values.booker, passengers,
      pricing: calcPricing(pkg, values.room, passengers.length),
      paymentOption: 'dp', transactions: [], isDemo: true,
    }
    db.saveBookings([booking, ...db.bookings()])
    return delay(booking, 500)
  },

  async get(id: string): Promise<Booking> {
    return delay(mustFind(id), 250)
  },

  async listMine(userId: string, email?: string): Promise<Booking[]> {
    const list = db.bookings().filter((b) => b.ownerId === userId || (email && b.booker.email.toLowerCase() === email.toLowerCase()))
    return delay(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 300)
  },

  async listActivePromos(): Promise<Promotion[]> {
    return delay(db.promotions().filter((p) => p.active), 250)
  },

  async validatePromo(code: string, bookingId: string): Promise<Promotion> {
    const b = mustFind(bookingId)
    const promo = db.promotions().find((p) => p.code === code.trim().toUpperCase())
    const reason = promoReason(promo, b.passengers.length)
    if (reason || !promo) throw new ApiError({ code: 'PROMO_INVALID', message: reason ?? 'Promo tidak valid' })
    return delay(promo, 400)
  },

  /** Kunci pilihan checkout & ubah status menjadi menunggu pembayaran. */
  async confirmCheckout(id: string, input: { option: 'dp' | 'full'; method: PaymentMethod; promoCode?: string; acceptTerms: boolean }): Promise<Booking> {
    if (!input.acceptTerms) throw new ApiError({ code: 'TERMS_REQUIRED', message: 'Anda harus menyetujui syarat dan ketentuan.' })
    const b = mustFind(id)
    const pkg = db.packages().find((p) => p.id === b.packageId)!
    const promo = input.promoCode ? db.promotions().find((p) => p.code === input.promoCode) : undefined
    const pricing = calcPricing(pkg, b.room, b.passengers.length, promo)
    const amount = input.option === 'full' ? pricing.total : pricing.dpAmount
    const now = Date.now()
    const updated: Booking = {
      ...b, pricing, paymentOption: input.option, paymentMethod: input.method,
      status: 'awaiting_payment', termsAcceptedAt: new Date(now).toISOString(),
      transactions: [
        ...b.transactions.filter((t) => t.status !== 'pending'),
        { id: uid('tx'), bookingId: b.id, method: input.method, option: input.option, amount, status: 'pending', createdAt: new Date(now).toISOString(), reference: `DEMO-${b.bookingCode}`, expiresAt: new Date(now + 30 * 60_000).toISOString(), isDemo: true },
      ],
    }
    persist(updated)
    return delay(updated, 500)
  },

  async setDocument(id: string, passengerId: string, doc: DocKey, done: boolean): Promise<Booking> {
    const b = mustFind(id)
    const updated = { ...b, passengers: b.passengers.map((p) => (p.id === passengerId ? { ...p, documents: { ...p.documents, [doc]: done } } : p)) }
    persist(updated)
    return delay(updated, 250)
  },

  async cancel(id: string): Promise<Booking> {
    const b = mustFind(id)
    if (b.status === 'paid' || b.status === 'dp_paid') throw new ApiError({ code: 'CANNOT_CANCEL', message: 'Booking yang sudah dibayar harus dibatalkan melalui admin.' })
    const updated: Booking = { ...b, status: 'cancelled', transactions: b.transactions.map((t) => (t.status === 'pending' ? { ...t, status: 'expired' } : t)) }
    persist(updated)
    return delay(updated, 300)
  },
}
