import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Tag } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentMethod, Promotion } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/form'
import { DemoBanner, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { StatusBadge } from '@/components/common/StatusBadge'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { Invoice, printPage } from '@/components/payment/Invoice'
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector'
import { bookingService } from '@/services/bookingService'
import { packageService } from '@/services/packageService'
import { calcPricing } from '@/utils/pricing'
import { errMsg } from '@/utils/errors'
import { formatDate, formatRupiah } from '@/utils/format'
import { cn } from '@/utils/cn'

export default function CheckoutPage() {
  const { bookingId = '' } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()
  const [option, setOption] = useState<'dp' | 'full'>('dp')
  const [method, setMethod] = useState<PaymentMethod>('va')
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<Promotion | undefined>()
  const [promoErr, setPromoErr] = useState('')
  const [terms, setTerms] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  const bq = useQuery({ queryKey: ['booking', bookingId], queryFn: () => bookingService.get(bookingId), retry: false })
  const pq = useQuery({ queryKey: ['package', bq.data?.packageSlug], queryFn: () => packageService.getBySlug(bq.data!.packageSlug), enabled: !!bq.data })

  const applyPromo = useMutation({
    mutationFn: () => bookingService.validatePromo(promoInput, bookingId),
    onSuccess: (p) => { setPromo(p); setPromoErr(''); toast.success(`Promo ${p.code} diterapkan`) },
    onError: (e) => { setPromo(undefined); setPromoErr(errMsg(e)) },
  })
  const confirm = useMutation({
    mutationFn: () => bookingService.confirmCheckout(bookingId, { option, method, promoCode: promo?.code, acceptTerms: terms }),
    onSuccess: (nb) => { qc.setQueryData(['booking', bookingId], nb); toast.success('Checkout dikonfirmasi. Silakan lakukan pembayaran (demo).'); nav(`/payment/${bookingId}`) },
    onError: (e) => toast.error(errMsg(e)),
  })

  if (bq.isLoading || (bq.data && pq.isLoading)) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-8"><LoadingSkeleton className="h-10 w-1/2" /><LoadingSkeleton className="h-96" /></div>
  if (bq.isError || !bq.data) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState title="Booking tidak ditemukan" message={errMsg(bq.error)} action={<Button asChild><Link to="/umrah">Lihat paket</Link></Button>} /></div>
  const b = bq.data
  if (b.status === 'paid' || b.status === 'dp_paid') return <Navigate to={`/payment/success/${b.id}`} replace />
  if (b.status === 'cancelled') return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState title="Booking dibatalkan" message="Booking ini sudah dibatalkan." action={<Button asChild><Link to="/umrah">Buat booking baru</Link></Button>} /></div>
  if (!pq.data) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={errMsg(pq.error)} onRetry={() => pq.refetch()} /></div>

  const pricing = calcPricing(pq.data, b.room, b.passengers.length, promo)
  const preview = { ...b, pricing }
  const pay = option === 'full' ? pricing.total : pricing.dpAmount

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold">Checkout</h1><StatusBadge status={b.status} /></div>
      <p className="mt-1 text-muted">No. Booking <span className="font-mono font-semibold text-text">{b.bookingCode}</span></p>
      <DemoBanner className="mt-4" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card><CardContent className="space-y-3">
            <CardTitle>Detail Jemaah ({b.passengers.length})</CardTitle>
            <ul className="divide-y divide-border text-sm">{b.passengers.map((p, i) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2"><span><b>{i + 1}. {p.fullName}</b> <span className="text-muted">· {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} · lahir {formatDate(p.birthDate)}</span></span><span className="font-mono text-muted">{p.passportNumber}</span></li>
            ))}</ul>
            <p className="text-xs text-muted">Pemesan: {b.booker.fullName} · {b.booker.phone} · {b.booker.email}</p>
          </CardContent></Card>

          <Card><CardContent className="space-y-4">
            <CardTitle>Opsi Pembayaran</CardTitle>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Jumlah dibayar">
              {([['dp', 'Bayar DP dulu', pricing.dpAmount, `Sisa ${formatRupiah(pricing.remaining)} dilunasi kemudian`], ['full', 'Bayar lunas', pricing.total, 'Bayar penuh sekarang']] as const).map(([id, l, amt, d]) => (
                <label key={id} className={cn('cursor-pointer rounded-lg border p-3 text-sm', option === id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border')}>
                  <input type="radio" name="option" className="sr-only" checked={option === id} onChange={() => setOption(id)} />
                  <span className="block font-semibold">{l}</span><span className="block text-lg font-bold text-primary">{formatRupiah(amt)}</span><span className="text-xs text-muted">{d}</span>
                </label>
              ))}
            </div>
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </CardContent></Card>

          <Card><CardContent className="space-y-3">
            <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-accent" />Kode Promo</CardTitle>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (promoInput.trim()) applyPromo.mutate() }}>
              <label htmlFor="promo" className="sr-only">Kode promo</label>
              <Input id="promo" placeholder="mis. MAHYAA10" className="uppercase" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} aria-invalid={!!promoErr} />
              <Button type="submit" variant="outline" loading={applyPromo.isPending} disabled={!promoInput.trim()}>Terapkan</Button>
              {promo && <Button type="button" variant="ghost" onClick={() => { setPromo(undefined); setPromoInput('') }}>Hapus</Button>}
            </form>
            {promoErr && <p role="alert" className="text-sm text-danger">{promoErr}</p>}
            {promo && <p className="text-sm text-success">{promo.title} — hemat {formatRupiah(pricing.discount)}</p>}
            <p className="text-xs text-muted">Coba: MAHYAA10, KELUARGA (min. 4 jemaah), EARLYBIRD.</p>
          </CardContent></Card>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
            <span>Saya menyetujui <Link to={`/paket/${b.packageSlug}`} target="_blank" className="font-medium text-primary underline">syarat & ketentuan</Link> paket, memahami bahwa data dan pembayaran pada situs ini hanyalah simulasi, dan data jemaah sudah benar.</span>
          </label>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BookingSummary booking={preview} />
          <div className="rounded-lg bg-primary/5 p-3 text-sm"><div className="flex justify-between"><span>Dibayar sekarang</span><b className="text-primary">{formatRupiah(pay)}</b></div></div>
          <Button size="lg" variant="accent" className="w-full" disabled={!terms} loading={confirm.isPending} onClick={() => confirm.mutate()}>Lanjut Pembayaran</Button>
          {!terms && <p className="text-center text-xs text-muted">Centang persetujuan untuk melanjutkan.</p>}
          <Button variant="outline" className="w-full" onClick={() => setInvoiceOpen(true)}><FileText className="h-4 w-4" />Lihat Invoice</Button>
        </aside>
      </div>
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent title="Invoice (Pratinjau)" className="max-w-3xl">
          <Invoice booking={preview} />
          <div className="no-print mt-4 flex justify-end"><Button onClick={printPage}>Cetak / Simpan PDF</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
