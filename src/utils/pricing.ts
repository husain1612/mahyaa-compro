import type { Pricing, Promotion, TourPackage, RoomType } from '@/types'

export const ROOM_LABEL: Record<RoomType, string> = { quad: 'Quad (4 orang)', triple: 'Triple (3 orang)', double: 'Double (2 orang)' }
export const ROOM_SHORT: Record<RoomType, string> = { quad: 'Quad', triple: 'Triple', double: 'Double' }

export const promoDiscount = (promo: Promotion | undefined, subtotal: number, passengers: number): number => {
  if (!promo || !promo.active) return 0
  if (promo.minPassengers && passengers < promo.minPassengers) return 0
  if (promo.validUntil < new Date().toISOString().slice(0, 10)) return 0
  let d = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value
  if (promo.maxDiscount) d = Math.min(d, promo.maxDiscount)
  return Math.min(d, subtotal)
}

/** Satu-satunya tempat perhitungan harga. Backend sebaiknya memvalidasi ulang dengan rumus yang sama. */
export const calcPricing = (
  pkg: Pick<TourPackage, 'prices' | 'dpPercent'>,
  room: RoomType,
  passengerCount: number,
  promo?: Promotion,
): Pricing => {
  const unitPrice = pkg.prices[room]
  const subtotal = unitPrice * passengerCount
  const discount = promoDiscount(promo, subtotal, passengerCount)
  const total = subtotal - discount
  const dpAmount = Math.round((total * pkg.dpPercent) / 100 / 1000) * 1000
  return {
    unitPrice, passengerCount, subtotal,
    promoCode: discount > 0 ? promo?.code : undefined,
    discount, total, dpAmount, remaining: total - dpAmount,
  }
}

export const promoReason = (promo: Promotion | undefined, passengers: number): string | null => {
  if (!promo) return 'Kode promo tidak ditemukan'
  if (!promo.active) return 'Promo sedang tidak aktif'
  if (promo.validUntil < new Date().toISOString().slice(0, 10)) return 'Promo sudah kedaluwarsa'
  if (promo.minPassengers && passengers < promo.minPassengers) return `Promo berlaku untuk minimal ${promo.minPassengers} jemaah`
  return null
}
