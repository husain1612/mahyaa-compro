import { z } from 'zod'

const phone = z.string().min(1, 'Nomor telepon wajib diisi').regex(/^(\+62|62|0)8[0-9]{8,12}$/, 'Gunakan nomor Indonesia, contoh 081234567890')
const email = z.string().min(1, 'Email wajib diisi').pipe(z.email('Format email tidak valid'))
const dateStr = (label: string) => z.string().min(1, `${label} wajib diisi`)

export const passengerSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').regex(/^[\p{L}\s.'-]+$/u, 'Nama hanya boleh berisi huruf'),
  birthDate: dateStr('Tanggal lahir').refine((v) => new Date(v) < new Date(), 'Tanggal lahir tidak valid'),
  gender: z.enum(['L', 'P'], { error: 'Pilih jenis kelamin' }),
  phone,
  email,
  passportNumber: z.string().min(1, 'Nomor paspor wajib diisi').regex(/^[A-Za-z][0-9]{6,8}$/, 'Contoh format: X1234567 (data dummy)'),
  passportExpiry: dateStr('Masa berlaku paspor'),
})

export const bookingFormSchema = z
  .object({
    departureId: z.string().min(1, 'Pilih tanggal keberangkatan'),
    room: z.enum(['quad', 'triple', 'double'], { error: 'Pilih jenis kamar' }),
    booker: z.object({
      fullName: z.string().min(3, 'Nama pemesan minimal 3 karakter'),
      phone,
      email,
      notes: z.string().max(300, 'Maksimal 300 karakter').optional(),
    }),
    passengers: z.array(passengerSchema).min(1, 'Minimal 1 jemaah').max(10, 'Maksimal 10 jemaah per booking'),
  })

export type BookingFormValues = z.infer<typeof bookingFormSchema>
export type PassengerFormValues = z.infer<typeof passengerSchema>

export const loginSchema = z.object({
  email,
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})
export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email,
  phone,
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})

export const packageAdminSchema = z.object({
  name: z.string().min(5, 'Nama paket minimal 5 karakter'),
  type: z.enum(['umrah', 'haji']),
  category: z.enum(['reguler', 'premium', 'plus', 'haji-plus', 'haji-khusus']),
  durationDays: z.number().min(3, 'Minimal 3 hari').max(60),
  quad: z.number().min(1000000, 'Harga tidak valid'),
  triple: z.number().min(1000000, 'Harga tidak valid'),
  double: z.number().min(1000000, 'Harga tidak valid'),
  dpPercent: z.number().min(10).max(100),
})

export const promoAdminSchema = z.object({
  code: z.string().min(4, 'Kode minimal 4 karakter').regex(/^[A-Z0-9]+$/, 'Huruf kapital dan angka saja'),
  title: z.string().min(4, 'Judul wajib diisi'),
  type: z.enum(['percent', 'fixed']),
  value: z.number().min(1, 'Nilai harus lebih dari 0'),
  validUntil: z.string().min(1, 'Tanggal wajib diisi'),
})
