import type { Promotion } from '@/types'

export const seedPromotions: Promotion[] = [
  { id: 'p1', code: 'MAHYAA10', title: 'Diskon 10% Semua Paket Umrah', description: 'Potongan 10% maksimal Rp3.000.000 per booking.', type: 'percent', value: 10, maxDiscount: 3000000, validUntil: '2027-03-31', active: true },
  { id: 'p2', code: 'KELUARGA', title: 'Promo Keluarga', description: 'Potongan Rp1.000.000 untuk pemesanan minimal 4 jemaah.', type: 'fixed', value: 1000000, minPassengers: 4, validUntil: '2027-06-30', active: true },
  { id: 'p3', code: 'EARLYBIRD', title: 'Early Bird Ramadhan', description: 'Potongan Rp2.500.000 per booking untuk pendaftaran lebih awal.', type: 'fixed', value: 2500000, validUntil: '2026-12-31', active: true },
  { id: 'p4', code: 'LEBARAN5', title: 'Promo Lebaran (nonaktif)', description: 'Promo contoh yang sedang nonaktif.', type: 'percent', value: 5, validUntil: '2026-01-01', active: false },
]
