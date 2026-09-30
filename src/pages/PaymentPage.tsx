import { useCallback } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { DemoBanner, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector'
import { Countdown } from '@/components/payment/Countdown'
import { bookingService } from '@/services/bookingService'
import { paymentInstructions, paymentService, pendingTx, type SimulatedOutcome } from '@/services/paymentService'
import { errMsg } from '@/utils/errors'
import { formatRupiah } from '@/utils/format'

function DemoQris() {
  // Pola placeholder BUKAN kode QR valid — tidak dapat dipindai.
  const cells = Array.from({ length: 21 * 21 }, (_, i) => ((i * 7 + Math.floor(i / 21) * 13) % 5 < 2))
  return (
    <div className="relative mx-auto w-56 rounded-xl border border-border bg-white p-3">
      <div className="grid grid-cols-[repeat(21,1fr)]" aria-hidden>{cells.map((on, i) => <span key={i} className={`aspect-square ${on ? 'bg-gray-800' : 'bg-white'}`} />)}</div>
      <div className="absolute inset-0 grid place-items-center"><span className="-rotate-12 rounded border-2 border-danger bg-white/90 px-3 py-1 text-2xl font-black text-danger">DEMO</span></div>
      <span className="sr-only">Gambar placeholder QRIS demo, tidak dapat dipindai</span>
    </div>
  )
}

export default function PaymentPage() {
  const { bookingId = '' } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()
  const bq = useQuery({ queryKey: ['booking', bookingId], queryFn: () => bookingService.get(bookingId), retry: false })
  const set = (b: unknown) => qc.setQueryData(['booking', bookingId], b)

  const sim = useMutation({
    mutationFn: (o: SimulatedOutcome) => paymentService.simulate(bookingId, o),
    onSuccess: (b, o) => {
      set(b)
      if (o === 'success') { toast.success('Pembayaran demo berhasil.'); nav(`/payment/success/${bookingId}`) }
      else toast.error(o === 'failed' ? 'Pembayaran demo gagal.' : 'Pembayaran demo kedaluwarsa.')
    },
    onError: (e) => toast.error(errMsg(e)),
  })
  const start = useMutation({
    mutationFn: (m: PaymentMethod) => paymentService.start(bookingId, m),
    onSuccess: (b) => { set(b); toast.success('Metode pembayaran diperbarui.') },
    onError: (e) => toast.error(errMsg(e)),
  })
  const expire = useCallback(() => { if (!sim.isPending) sim.mutate('expired') }, [sim])

  if (bq.isLoading) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-8"><LoadingSkeleton className="h-10 w-1/2" /><LoadingSkeleton className="h-96" /></div>
  if (bq.isError || !bq.data) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState title="Booking tidak ditemukan" message={errMsg(bq.error)} action={<Button asChild><Link to="/">Beranda</Link></Button>} /></div>
  const b = bq.data
  const tx = pendingTx(b)

  if (!tx) {
    if (b.status === 'paid' || b.status === 'dp_paid') return <Navigate to={`/payment/success/${b.id}`} replace />
    if (b.status === 'draft') return <Navigate to={`/checkout/${b.id}`} replace />
    const failed = b.status === 'failed'
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState title={failed ? 'Pembayaran Gagal (Demo)' : b.status === 'expired' ? 'Waktu Pembayaran Habis (Demo)' : 'Booking Dibatalkan'}
          message={b.status === 'cancelled' ? 'Booking ini telah dibatalkan.' : 'Anda dapat mencoba kembali untuk membuat pembayaran baru.'}
          action={b.status !== 'cancelled' ? <Button loading={start.isPending} onClick={() => start.mutate(b.paymentMethod ?? 'va')}>Coba bayar lagi</Button> : <Button asChild><Link to="/umrah">Lihat paket</Link></Button>} />
        <p className="mt-4 text-center text-sm"><Link className="text-primary underline" to="/dashboard">Ke dashboard</Link></p>
      </div>
    )
  }

  const info = paymentInstructions(b)[tx.method]
  const copy = (v: string) => navigator.clipboard?.writeText(v).then(() => toast.success('Disalin (nomor dummy)')).catch(() => toast.error('Gagal menyalin'))
  const busy = sim.isPending || start.isPending

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Pembayaran</h1>
      <p className="mt-1 text-muted">No. Booking <span className="font-mono font-semibold text-text">{b.bookingCode}</span> · {b.packageName}</p>
      <div className="mt-4 rounded-lg border-2 border-danger/40 bg-danger/5 p-3 text-sm font-medium text-danger">MODE DEMO — tidak ada uang yang dipindahkan. Kode/nomor di bawah adalah dummy dan tidak dapat digunakan untuk pembayaran nyata.</div>
      <DemoBanner className="mt-3" />

      <Card className="mt-6"><CardContent className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm text-muted">Total yang harus dibayar ({tx.option === 'dp' ? 'DP' : tx.option === 'remaining' ? 'Pelunasan' : 'Lunas'})</p><p className="text-3xl font-bold text-primary">{formatRupiah(tx.amount)}</p></div>
          {tx.expiresAt && <div className="text-right text-sm"><p className="text-muted">Bayar sebelum</p><Countdown until={tx.expiresAt} onExpire={expire} /></div>}
        </div>
        <PaymentMethodSelector name="pay-method" value={tx.method} onChange={(m) => m !== tx.method && !busy && start.mutate(m)} />

        <div className="rounded-xl bg-black/5 p-5">
          <CardTitle className="mb-3 text-base">{info.label} (DEMO)</CardTitle>
          {tx.method === 'qris' ? <DemoQris /> : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Bank</dt><dd>{info.bankName}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-muted">{tx.method === 'va' ? 'Nomor VA (dummy)' : 'No. rekening (dummy)'}</dt><dd className="flex items-center gap-2 font-mono font-semibold">{info.accountNumber}<button onClick={() => copy(info.accountNumber!)} aria-label="Salin nomor" className="rounded p-1 hover:bg-black/10"><Copy className="h-4 w-4" /></button></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Atas nama</dt><dd>{info.accountName}</dd></div>
            </dl>
          )}
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">{info.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Simulasi hasil pembayaran</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button className="h-auto min-h-11 whitespace-normal py-2 text-center" disabled={busy} loading={sim.isPending && sim.variables === 'success'} onClick={() => sim.mutate('success')}>Simulasikan Pembayaran Berhasil</Button>
            <Button className="h-auto min-h-11 whitespace-normal py-2 text-center" variant="danger" disabled={busy} loading={sim.isPending && sim.variables === 'failed'} onClick={() => sim.mutate('failed')}>Simulasikan Pembayaran Gagal</Button>
            <Button className="h-auto min-h-11 whitespace-normal py-2 text-center" variant="outline" disabled={busy} loading={sim.isPending && sim.variables === 'expired'} onClick={() => sim.mutate('expired')}>Simulasikan Kedaluwarsa</Button>
          </div>
        </div>
      </CardContent></Card>
    </div>
  )
}
