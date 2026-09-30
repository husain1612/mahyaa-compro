/**
 * Kontrak data frontend <-> backend. Lihat docs/BACKEND_CONTRACT.md.
 * Semua tanggal berformat ISO 8601 (YYYY-MM-DD atau date-time). Semua uang dalam Rupiah (integer).
 */

export type RoomType = 'quad' | 'triple' | 'double'
export type TripType = 'umrah' | 'haji'
export type PackageCategory = 'reguler' | 'premium' | 'plus' | 'haji-plus' | 'haji-khusus'

export interface Hotel {
  name: string
  star: 3 | 4 | 5
  distanceToHaram: string
}

export interface Departure {
  id: string
  date: string // YYYY-MM-DD
  airportCode: string
  airportName: string
  seatsTotal: number
  seatsLeft: number
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
}

export interface TourPackage {
  id: string
  slug: string
  name: string
  type: TripType
  category: PackageCategory
  tagline: string
  description: string
  durationDays: number
  airline: string
  hotelMakkah: Hotel
  hotelMadinah: Hotel
  /** Harga per jemaah per jenis kamar */
  prices: Record<RoomType, number>
  dpPercent: number
  departures: Departure[]
  facilities: string[]
  excluded: string[]
  itinerary: ItineraryDay[]
  terms: string[]
  /** Nilai bisa berupa id ilustrasi (lihat components/common/Scene) atau URL gambar */
  gallery: string[]
  featured: boolean
  popularity: number
  active: boolean
}

export type Gender = 'L' | 'P'
export type DocKey = 'passport' | 'ktp' | 'kk' | 'photo' | 'vaccine' | 'marriage'

export interface Passenger {
  id: string
  fullName: string
  birthDate: string
  gender: Gender
  phone: string
  email: string
  passportNumber: string
  passportExpiry: string
  documents: Partial<Record<DocKey, boolean>>
}

export interface Booker {
  fullName: string
  phone: string
  email: string
  notes?: string
}

export type BookingStatus = 'draft' | 'awaiting_payment' | 'dp_paid' | 'paid' | 'failed' | 'expired' | 'cancelled'
export type PaymentMethod = 'qris' | 'va' | 'transfer'
export type PaymentOption = 'dp' | 'full' | 'remaining'
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'expired'

export interface Pricing {
  unitPrice: number
  passengerCount: number
  subtotal: number
  promoCode?: string
  discount: number
  total: number
  dpAmount: number
  remaining: number
}

export interface Transaction {
  id: string
  bookingId: string
  method: PaymentMethod
  option: PaymentOption
  amount: number
  status: TransactionStatus
  createdAt: string
  reference: string
  expiresAt?: string
  isDemo: true
}

export interface Booking {
  id: string
  bookingCode: string
  ownerId: string
  createdAt: string
  status: BookingStatus
  packageId: string
  packageSlug: string
  packageName: string
  departureId: string
  departureDate: string
  airportCode: string
  room: RoomType
  booker: Booker
  passengers: Passenger[]
  pricing: Pricing
  paymentOption: 'dp' | 'full'
  paymentMethod?: PaymentMethod
  transactions: Transaction[]
  termsAcceptedAt?: string
  isDemo: true
}

export interface Promotion {
  id: string
  code: string
  title: string
  description: string
  type: 'percent' | 'fixed'
  value: number
  maxDiscount?: number
  minPassengers?: number
  validUntil: string
  active: boolean
}

export interface Testimonial {
  id: string
  name: string
  city: string
  packageName: string
  rating: number
  text: string
}

export interface Faq {
  id: string
  question: string
  answer: string
}

export type UserRole = 'jemaah' | 'admin'
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  city?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string // token dummy
}

export interface ApiErrorBody {
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

export interface PackageQuery {
  type?: TripType
  q?: string
  airport?: string
  month?: string // YYYY-MM
  duration?: 'short' | 'medium' | 'long'
  category?: PackageCategory | ''
  priceMax?: number
  availability?: 'available' | 'limited' | ''
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'departure'
  page?: number
  pageSize?: number
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ChatAction {
  label: string
  to?: string
  href?: string
  message?: string
}
export interface ChatPackageRef {
  slug: string
  name: string
  durationDays: number
  priceFrom: number
}
export interface ChatReply {
  text: string
  actions?: ChatAction[]
  packages?: ChatPackageRef[]
}
