import type { Booking, BookingStatus, Promotion, TourPackage } from '@/types'
import { ApiError } from '@/utils/errors'
import { db, delay } from './storage'

export interface AdminStats {
  bookings: number
  passengers: number
  totalTransactions: number
  awaiting: number
  success: number
  failed: number
}

export interface MonthlyPoint { month: string; transaksi: number; booking: number }

/** Data historis dummy agar grafik tidak kosong; ditambah data booking lokal bulan berjalan. */
const HISTORY: MonthlyPoint[] = [
  { month: '2026-04', transaksi: 210_000_000, booking: 9 },
  { month: '2026-05', transaksi: 340_000_000, booking: 14 },
  { month: '2026-06', transaksi: 425_000_000, booking: 18 },
  { month: '2026-07', transaksi: 380_000_000, booking: 15 },
  { month: '2026-08', transaksi: 510_000_000, booking: 21 },
]

const successSum = (b: Booking) => b.transactions.filter((t) => t.status === 'success').reduce((s, t) => s + t.amount, 0)

export const adminService = {
  async stats(): Promise<AdminStats> {
    const b = db.bookings()
    return delay({
      bookings: b.length,
      passengers: b.reduce((s, x) => s + x.passengers.length, 0),
      totalTransactions: b.reduce((s, x) => s + successSum(x), 0),
      awaiting: b.filter((x) => x.status === 'awaiting_payment').length,
      success: b.filter((x) => x.status === 'dp_paid' || x.status === 'paid').length,
      failed: b.filter((x) => x.status === 'failed' || x.status === 'expired').length,
    }, 300)
  },

  async monthly(): Promise<MonthlyPoint[]> {
    const live = new Map<string, MonthlyPoint>()
    for (const b of db.bookings()) {
      const key = b.createdAt.slice(0, 7)
      const cur = live.get(key) ?? { month: key, transaksi: 0, booking: 0 }
      cur.transaksi += successSum(b)
      cur.booking += 1
      live.set(key, cur)
    }
    const merged = new Map(HISTORY.map((h) => [h.month, h]))
    live.forEach((v, k) => { const h = merged.get(k); merged.set(k, h ? { month: k, transaksi: h.transaksi + v.transaksi, booking: h.booking + v.booking } : v) })
    return delay([...merged.values()].sort((a, b) => a.month.localeCompare(b.month)), 300)
  },

  async bookings(): Promise<Booking[]> {
    return delay([...db.bookings()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 300)
  },

  async setBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const all = db.bookings()
    const b = all.find((x) => x.id === id)
    if (!b) throw new ApiError({ code: 'BOOKING_NOT_FOUND', message: 'Booking tidak ditemukan.' })
    const updated = { ...b, status }
    db.saveBookings(all.map((x) => (x.id === id ? updated : x)))
    return delay(updated, 250)
  },

  async packages(): Promise<TourPackage[]> {
    return delay(db.packages(), 250)
  },

  async savePackage(pkg: TourPackage): Promise<TourPackage> {
    const all = db.packages()
    db.savePackages(all.some((p) => p.id === pkg.id) ? all.map((p) => (p.id === pkg.id ? pkg : p)) : [pkg, ...all])
    return delay(pkg, 250)
  },

  async deletePackage(id: string): Promise<void> {
    db.savePackages(db.packages().filter((p) => p.id !== id))
    await delay(null, 200)
  },

  async promotions(): Promise<Promotion[]> {
    return delay(db.promotions(), 250)
  },

  async savePromotion(promo: Promotion): Promise<Promotion> {
    const all = db.promotions()
    if (all.some((p) => p.code === promo.code && p.id !== promo.id)) throw new ApiError({ code: 'PROMO_EXISTS', message: 'Kode promo sudah digunakan.', fieldErrors: { code: 'Kode sudah ada' } })
    db.savePromotions(all.some((p) => p.id === promo.id) ? all.map((p) => (p.id === promo.id ? promo : p)) : [promo, ...all])
    return delay(promo, 250)
  },

  async deletePromotion(id: string): Promise<void> {
    db.savePromotions(db.promotions().filter((p) => p.id !== id))
    await delay(null, 200)
  },

  async resetDemoData(): Promise<void> {
    db.resetAll()
    await delay(null, 300)
  },
}
