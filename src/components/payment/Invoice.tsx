import type { Booking } from '@/types'
import { Logo } from '@/components/common/Logo'
import { TX_STATUS } from '@/components/common/StatusBadge'
import { BOOKING_STATUS } from '@/components/common/StatusBadge'
import { amountRemaining, paidAmount } from '@/services/paymentService'
import { formatDate, formatDateTime, formatRupiah } from '@/utils/format'
import { ROOM_SHORT } from '@/utils/pricing'

const METHOD: Record<string, string> = { qris: 'QRIS (demo)', va: 'Virtual Account (demo)', transfer: 'Transfer Bank (demo)' }

export function Invoice({ booking: b }: { booking: Booking }) {
  const paid = paidAmount(b)
  return (
    <article className="invoice-print relative overflow-hidden rounded-xl border border-border bg-white p-6 text-sm text-black sm:p-8" aria-label={`Invoice ${b.bookingCode}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
        <span className="-rotate-25 select-none text-7xl font-black tracking-widest text-black/[0.05] sm:text-9xl">DEMO</span>
      </div>
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><Logo /><p className="mt-2 text-xs text-gray-600">Jl. Contoh Raya No. 1, Jakarta (alamat dummy)</p></div>
          <div className="text-right"><h2 className="text-2xl font-bold">INVOICE</h2><p className="font-mono text-xs">INV-{b.bookingCode}</p><p className="text-xs text-gray-600">{formatDate(b.createdAt)}</p><p className="mt-1 inline-block rounded bg-black px-2 py-0.5 text-[10px] font-bold text-white">DEMO — BUKAN BUKTI PEMBAYARAN NYATA</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><p className="text-xs uppercase text-gray-500">Pemesan</p><p className="font-semibold">{b.booker.fullName}</p><p>{b.booker.email}</p><p>{b.booker.phone}</p></div>
          <div><p className="text-xs uppercase text-gray-500">Paket</p><p className="font-semibold">{b.packageName}</p><p>Berangkat {formatDate(b.departureDate)} ({b.airportCode})</p><p>Kamar {ROOM_SHORT[b.room]} · Status: {BOOKING_STATUS[b.status].label}</p></div>
        </div>
        <div className="mt-6 overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-gray-300 text-left text-xs uppercase text-gray-500"><th className="py-2">Jemaah</th><th>Paspor</th><th className="text-right">Harga</th></tr></thead>
          <tbody>{b.passengers.map((p) => <tr key={p.id} className="border-b border-gray-100"><td className="py-2">{p.fullName}</td><td className="font-mono">{p.passportNumber}</td><td className="text-right">{formatRupiah(b.pricing.unitPrice)}</td></tr>)}</tbody>
        </table></div>
        <dl className="ml-auto mt-4 w-full max-w-xs space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRupiah(b.pricing.subtotal)}</dd></div>
          {b.pricing.discount > 0 && <div className="flex justify-between"><dt>Diskon {b.pricing.promoCode}</dt><dd>− {formatRupiah(b.pricing.discount)}</dd></div>}
          <div className="flex justify-between border-t border-gray-300 pt-1 font-bold"><dt>Total</dt><dd>{formatRupiah(b.pricing.total)}</dd></div>
          <div className="flex justify-between"><dt>DP ({formatRupiah(b.pricing.dpAmount)})</dt><dd /></div>
          <div className="flex justify-between"><dt>Terbayar</dt><dd>{formatRupiah(paid)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Sisa pembayaran</dt><dd>{formatRupiah(amountRemaining(b))}</dd></div>
        </dl>
        {b.transactions.length > 0 && (
          <div className="mt-6"><p className="mb-1 text-xs uppercase text-gray-500">Riwayat transaksi (simulasi)</p>
            <ul className="space-y-1 text-xs">{b.transactions.map((t) => <li key={t.id} className="flex flex-wrap justify-between gap-2"><span>{formatDateTime(t.createdAt)} · {METHOD[t.method]} · {t.reference}</span><span>{formatRupiah(t.amount)} — {TX_STATUS[t.status].label}</span></li>)}</ul></div>
        )}
        <p className="mt-6 border-t border-gray-200 pt-3 text-[11px] text-gray-500">Dokumen ini dihasilkan oleh situs demo frontend. Seluruh nominal, rekening, dan status pembayaran adalah simulasi.</p>
      </div>
    </article>
  )
}

/** Cetak hanya elemen invoice (lihat aturan @media print di styles/index.css). */
export const printPage = () => {
  document.body.classList.add('printing-invoice')
  window.addEventListener('afterprint', () => document.body.classList.remove('printing-invoice'), { once: true })
  window.print()
}
