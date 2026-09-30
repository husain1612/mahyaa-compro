import type { Departure, Paged, PackageQuery, TourPackage } from '@/types'
import { ApiError } from '@/utils/errors'
import { monthKey } from '@/utils/format'
import { db, delay } from './storage'

export const minPrice = (p: TourPackage) => Math.min(...Object.values(p.prices))
export const nextDeparture = (p: TourPackage): Departure | undefined =>
  [...p.departures].sort((a, b) => a.date.localeCompare(b.date)).find((d) => d.seatsLeft > 0) ?? p.departures[0]
export const totalSeatsLeft = (p: TourPackage) => p.departures.reduce((s, d) => s + d.seatsLeft, 0)
export const availabilityOf = (p: TourPackage): 'available' | 'limited' | 'full' => {
  const left = totalSeatsLeft(p)
  return left === 0 ? 'full' : left <= 15 ? 'limited' : 'available'
}

const durationBucket = (d: number) => (d <= 9 ? 'short' : d <= 12 ? 'medium' : 'long')

/** Logika filter murni — diekspor agar bisa dipakai chatbot. */
export const filterPackages = (all: TourPackage[], q: PackageQuery): TourPackage[] => {
  let r = all.filter((p) => p.active)
  if (q.type) r = r.filter((p) => p.type === q.type)
  if (q.q) {
    const needle = q.q.toLowerCase()
    r = r.filter((p) => `${p.name} ${p.tagline} ${p.airline}`.toLowerCase().includes(needle))
  }
  if (q.airport) r = r.filter((p) => p.departures.some((d) => d.airportCode === q.airport))
  if (q.month) r = r.filter((p) => p.departures.some((d) => monthKey(d.date) === q.month))
  if (q.duration) r = r.filter((p) => durationBucket(p.durationDays) === q.duration)
  if (q.category) r = r.filter((p) => p.category === q.category)
  if (q.priceMax) r = r.filter((p) => minPrice(p) <= q.priceMax!)
  if (q.availability === 'available') r = r.filter((p) => totalSeatsLeft(p) > 0)
  if (q.availability === 'limited') r = r.filter((p) => availabilityOf(p) === 'limited')
  const by = q.sort ?? 'popular'
  return [...r].sort((a, b) => {
    if (by === 'price-asc') return minPrice(a) - minPrice(b)
    if (by === 'price-desc') return minPrice(b) - minPrice(a)
    if (by === 'departure') return (nextDeparture(a)?.date ?? '').localeCompare(nextDeparture(b)?.date ?? '')
    return b.popularity - a.popularity
  })
}

export const packageService = {
  async list(q: PackageQuery): Promise<Paged<TourPackage>> {
    const all = filterPackages(db.packages(), q)
    const pageSize = q.pageSize ?? 6
    const page = q.page ?? 1
    return delay({ items: all.slice(0, page * pageSize), total: all.length, page, pageSize }, 300)
  },

  async listAll(): Promise<TourPackage[]> {
    return delay(db.packages().filter((p) => p.active), 200)
  },

  async featured(): Promise<TourPackage[]> {
    return delay(db.packages().filter((p) => p.active && p.featured), 250)
  },

  async getBySlug(slug: string): Promise<TourPackage> {
    const p = db.packages().find((x) => x.slug === slug)
    if (!p) throw new ApiError({ code: 'PACKAGE_NOT_FOUND', message: 'Paket tidak ditemukan.' })
    return delay(p, 250)
  },
}
