import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { DemoBanner, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { Badge } from '@/components/ui/badge'
import { TxBadge } from '@/components/common/StatusBadge'
import { Invoice, printPage } from '@/components/payment/Invoice'
import { bookingService } from '@/services/bookingService'
import { amountRemaining, paidAmount } from '@/services/paymentService'
import { errMsg } from '@/utils/errors'
import { formatDate, formatDateTime, formatRupiah } from '@/utils/format'
import { ROOM_SHORT } from '@/utils/pricing'
import { useAuth } from '@/store/authStore'

export default function PaymentSuccessPage() {
  const { bookingId = '' } = useParams()
  const session = useAuth((s) => s.session)
  const bq = useQuery({ queryKey: ['booking', bookingId], queryFn: () => bookingService.get(bookingId), retry: false })
  if (bq.isLoading) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-8"><LoadingSkeleton className="h-10 w-1/2" /><LoadingSkeleton className="h-96" /></div>
  if (bq.isError || !bq.data) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState title="Booking tidak ditemukan" message={errMsg(bq.error)} action={<Button asChild><Link to="/">Beranda</Link></Button>} /></div>
  const b = bq.data
  if (b.status !== 'paid' && b.status !== 'dp_paid') return <Navigate to={`/payment/${b.id}`} replace />
  const success = b.transactions.filter((t) => t.status === 'success')

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="no-print text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-3 text-3xl font-bold">Pembayaran {b.status === 'paid' ? 'Lunas' : 'DP'} Berhasil</h1>
        <p className="mt-1 text-muted">Terima kasih. Ini adalah konfirmasi <Badge tone="warning">DEMO</Badge> — tidak ada pembayaran nyata yang terjadi.</p>
        <p className="mt-3 text-sm text-muted">Nomor booking</p>
        <p className="font-mono text-2xl font-bold text-primary">{b.bookingCode}</p>
      </div>
      <DemoBanner className="no-print mt-4" />
      <div className="no-print mt-6 grid gap-6 md:grid-cols-2">
        <Card><CardContent className="space-y-2 text-sm"><CardTitle>Detail Paket</CardTitle>
          <p className="font-semibold">{b.packageName}</p><p className="text-muted">Berangkat {formatDate(b.departureDate)} dari {b.airportCode}</p><p className="text-muted">Kamar {ROOM_SHORT[b.room]} · {b.passengers.length} jemaah</p>
        </CardContent></Card>
        <Card><CardContent className="space-y-2 text-sm"><CardTitle>Rincian Transaksi</CardTitle>
          <div className="flex justify-between"><span className="text-muted">Total</span><b>{formatRupiah(b.pricing.total)}</b></div>
          <div className="flex justify-between"><span className="text-muted">Terbayar</span><b className="text-success">{formatRupiah(paidAmount(b))}</b></div>
          <div className="flex justify-between"><span className="text-muted">Sisa</span><b>{formatRupiah(amountRemaining(b))}</b></div>
          {success.map((t) => <div key={t.id} className="flex items-center justify-between border-t border-border pt-2 text-xs"><span>{formatDateTime(t.createdAt)} · {t.reference}</span><TxBadge status={t.status} /></div>)}
        </CardContent></Card>
      </div>
      <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" size="lg" onClick={printPage}>Cetak Invoice</Button>
        <Button asChild size="lg"><Link to={session ? '/dashboard' : '/masuk'}>Ke Dashboard</Link></Button>
      </div>
      <div className="mt-8"><Invoice booking={b} /></div>
    </div>
  )
}
