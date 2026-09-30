/**
 * Lapisan penyimpanan LocalStorage (SIMULASI). Backend developer cukup mengganti
 * implementasi di folder services/ dengan pemanggilan HTTP; komponen UI tidak menyentuh file ini.
 */
import type { Booking, Promotion, TourPackage, User } from '@/types'
import { seedPackages } from '@/data/packages'
import { seedBookings } from '@/data/bookings'
import { seedPromotions } from '@/data/promotions'
import { seedUsers } from '@/data/users'

const NS = 'mahyaa.v1.'

export const readKey = <T>(key: string, seed: T): T => {
  try {
    const raw = localStorage.getItem(NS + key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* abaikan: fallback ke seed */ }
  writeKey(key, seed)
  return seed
}

export const writeKey = <T>(key: string, value: T) => {
  try { localStorage.setItem(NS + key, JSON.stringify(value)) } catch { /* penyimpanan penuh/diblokir */ }
}

export const removeKey = (key: string) => {
  try { localStorage.removeItem(NS + key) } catch { /* noop */ }
}

export const db = {
  packages: () => readKey<TourPackage[]>('packages', seedPackages),
  savePackages: (v: TourPackage[]) => writeKey('packages', v),
  bookings: () => readKey<Booking[]>('bookings', seedBookings),
  saveBookings: (v: Booking[]) => writeKey('bookings', v),
  promotions: () => readKey<Promotion[]>('promotions', seedPromotions),
  savePromotions: (v: Promotion[]) => writeKey('promotions', v),
  users: () => readKey<User[]>('users', seedUsers),
  saveUsers: (v: User[]) => writeKey('users', v),
  resetAll: () => {
    ;['packages', 'bookings', 'promotions', 'users', 'session'].forEach(removeKey)
  },
}

/** Simulasi latensi jaringan. */
export const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
