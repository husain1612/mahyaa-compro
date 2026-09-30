import type { Booking, PaymentMethod, PaymentOption, Transaction } from '@/types'
import { ApiError } from '@/utils/errors'
import { db, delay } from './storage'

export type SimulatedOutcome = 'success' | 'failed' | 'expired'

export const pendingTx = (b: Booking): Transaction | undefined => b.transactions.find((t) => t.status === 'pending')
export const latestTx = (b: Booking): Transaction | undefined => [...b.transactions].sort((a, c) => c.createdAt.localeCompare(a.createdAt))[0]
export const paidAmount = (b: Booking) => b.transactions.filter((t) => t.status === 'success').reduce((s, t) => s + t.amount, 0)
export const amountRemaining = (b: Booking) => Math.max(0, b.pricing.total - paidAmount(b))

export interface DemoPaymentInstruction {
  method: PaymentMethod
  label: string
  /** Semua nilai di bawah ini palsu dan tidak dapat digunakan untuk pembayaran nyata. */
  accountNumber?: string
  accountName?: string
  bankName?: string
  steps: string[]
}

export const paymentInstructions = (b: Booking): Record<PaymentMethod, DemoPaymentInstruction> => ({
  qris: { method: 'qris', label: 'QRIS', steps: ['Ini adalah QRIS DEMO — tidak dapat dipindai untuk pembayaran nyata.', 'Pada sistem produksi, buka aplikasi e-wallet/mobile banking dan pindai kode QR.', 'Konfirmasi nominal, lalu selesaikan pembayaran.', 'Gunakan tombol simulasi di bawah untuk melanjutkan alur demo.'] },
  va: { method: 'va', label: 'Virtual Account', bankName: 'BANK DEMO', accountNumber: `0000-DEMO-${b.bookingCode.slice(-4)}`, accountName: 'MAHYAA TOUR (DEMO)', steps: ['Nomor VA di samping adalah nomor DUMMY.', 'Pada sistem produksi, pilih menu Virtual Account di mobile banking.', 'Masukkan nomor VA dan konfirmasi nominal.', 'Gunakan tombol simulasi di bawah untuk melanjutkan alur demo.'] },
  transfer: { method: 'transfer', label: 'Transfer Bank', bankName: 'BANK DEMO', accountNumber: 'XXXX-XXXX-DEMO', accountName: 'PT MAHYAA (DEMO)', steps: ['Nomor rekening di samping adalah DUMMY.', 'Pada sistem produksi, transfer sesuai nominal unik yang ditampilkan.', 'Unggah bukti transfer untuk verifikasi.', 'Gunakan tombol simulasi di bawah untuk melanjutkan alur demo.'] },
})

const save = (b: Booking) => db.saveBookings(db.bookings().map((x) => (x.id === b.id ? b : x)))

export const paymentService = {
  /** Buat transaksi baru (mis. coba lagi setelah gagal, ganti metode, atau bayar pelunasan). */
  async start(bookingId: string, method: PaymentMethod, option?: PaymentOption): Promise<Booking> {
    const b = db.bookings().find((x) => x.id === bookingId)
    if (!b) throw new ApiError({ code: 'BOOKING_NOT_FOUND', message: 'Booking tidak ditemukan.' })
    if (b.status === 'paid') throw new ApiError({ code: 'ALREADY_PAID', message: 'Booking sudah lunas.' })
    if (b.status === 'cancelled') throw new ApiError({ code: 'CANCELLED', message: 'Booking sudah dibatalkan.' })
    const opt: PaymentOption = option ?? (b.status === 'dp_paid' ? 'remaining' : b.paymentOption)
    const amount = opt === 'remaining' ? amountRemaining(b) : opt === 'full' ? b.pricing.total : b.pricing.dpAmount
    const now = Date.now()
    const tx: Transaction = { id: `tx-${now.toString(36)}`, bookingId, method, option: opt, amount, status: 'pending', createdAt: new Date(now).toISOString(), reference: `DEMO-${b.bookingCode}`, expiresAt: new Date(now + 30 * 60_000).toISOString(), isDemo: true }
    const updated: Booking = {
      ...b, paymentMethod: method,
      status: b.status === 'dp_paid' ? 'dp_paid' : 'awaiting_payment',
      transactions: [...b.transactions.filter((t) => t.status !== 'pending'), tx],
    }
    save(updated)
    return delay(updated, 300)
  },

  async simulate(bookingId: string, outcome: SimulatedOutcome): Promise<Booking> {
    const b = db.bookings().find((x) => x.id === bookingId)
    if (!b) throw new ApiError({ code: 'BOOKING_NOT_FOUND', message: 'Booking tidak ditemukan.' })
    const tx = pendingTx(b)
    if (!tx) throw new ApiError({ code: 'NO_PENDING_PAYMENT', message: 'Tidak ada pembayaran yang menunggu.' })
    const txStatus: Transaction['status'] = outcome
    const transactions = b.transactions.map((t) => (t.id === tx.id ? { ...t, status: txStatus } : t))
    let status = b.status
    if (outcome === 'success') {
      status = tx.option === 'dp' ? 'dp_paid' : 'paid'
      // kursi dikurangi hanya saat pembayaran pertama berhasil
      if (b.status === 'awaiting_payment') {
        const pkgs = db.packages().map((p) => p.id !== b.packageId ? p : { ...p, departures: p.departures.map((d) => d.id === b.departureId ? { ...d, seatsLeft: Math.max(0, d.seatsLeft - b.passengers.length) } : d) })
        db.savePackages(pkgs)
      }
    } else if (b.status === 'awaiting_payment') {
      status = outcome === 'failed' ? 'failed' : 'expired'
    }
    const updated = { ...b, status, transactions }
    save(updated)
    return delay(updated, 700)
  },
}
