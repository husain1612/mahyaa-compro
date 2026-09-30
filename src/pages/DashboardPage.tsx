import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, FileText, Plane } from 'lucide-react'
import { toast } from 'sonner'
import type { Booking, DocKey } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CardGridSkeleton, ConfirmationDialog, DemoBanner, EmptyState, ErrorState, PageHeader } from '@/components/common/states'
import { StatusBadge, TxBadge } from '@/components/common/StatusBadge'
import { DashboardSidebar, type DashTab } from '@/components/dashboard/DashboardSidebar'
import { DOCS, bookingDocProgress, docProgress } from '@/components/dashboard/documents'
import { Invoice, printPage } from '@/components/payment/Invoice'
import { bookingService } from '@/services/bookingService'
import { amountRemaining, paidAmount, paymentService } from '@/services/paymentService'
import { useAuth } from '@/store/authStore'
import { errMsg } from '@/utils/errors'
import { formatDate, formatDateTime, formatRupiah } from '@/utils/format'
import { ROOM_SHORT } from '@/utils/pricing'

const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)

const Progress = ({ pct }: { pct: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
)

export default function DashboardPage() {
  const user = useAuth((s) => s.session!.user)
  const nav = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<DashTab>('booking')
  const [invoice, setInvoice] = useState<Booking | null>(null)
  const [cancel, setCancel] = useState<Booking | null>(null)

  const q = useQuery({ queryKey: ['my-bookings', user.id], queryFn: () => bookingService.listMine(user.id, user.email) })
  const refresh = () => { qc.invalidateQueries({ queryKey: ['my-bookings'] }); qc.invalidateQueries({ queryKey: ['booking'] }) }

  const setDoc = useMutation({
    mutationFn: (v: { b: Booking; pid: string; k: DocKey; done: boolean }) => bookingService.setDocument(v.b.id, v.pid, v.k, v.done),
    onSuccess: () => { refresh(); toast.success('Status dokumen diperbarui (simulasi unggah).') },
    onError: (e) => toast.error(errMsg(e)),
  })
  const doCancel = useMutation({
    mutationFn: (b: Booking) => bookingService.cancel(b.id),
    onSuccess: () => { refresh(); setCancel(null); toast.success('Booking dibatalkan.') },
    onError: (e) => { setCancel(null); toast.error(errMsg(e)) },
  })

  const payRest = useMutation({
    mutationFn: (b: Booking) => paymentService.start(b.id, b.paymentMethod ?? 'va', 'remaining'),
    onSuccess: (b) => { qc.setQueryData(['booking', b.id], b); nav(`/payment/${b.id}`) },
    onError: (e) => toast.error(errMsg(e)),
  })

  const bookings = q.data ?? []
  const allTx = bookings.flatMap((b) => b.transactions.map((t) => ({ t, b }))).sort((a, c) => c.t.createdAt.localeCompare(a.t.createdAt))
  const upcoming = bookings.filter((b) => b.status === 'paid' || b.status === 'dp_paid').sort((a, c) => a.departureDate.localeCompare(c.departureDate))[0]

  return (
    <>
      <PageHeader title="Dashboard Jemaah" subtitle={`Assalamu’alaikum, ${user.name}. Pantau booking, dokumen, dan pembayaran Anda.`} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_1fr]">
        <DashboardSidebar active={tab} onChange={setTab} />
        <div className="min-w-0 space-y-6">
          <DemoBanner />
          {q.isLoading ? <CardGridSkeleton count={2} /> : q.isError ? <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} /> : (
            <>
              {tab === 'booking' && (
                <>
                  {upcoming && (
                    <Card className="border-primary/30 bg-primary/5"><CardContent className="flex flex-wrap items-center gap-4">
                      <Plane className="h-8 w-8 text-primary" />
                      <div><p className="text-sm text-muted">Keberangkatan terdekat</p><p className="font-semibold">{upcoming.packageName} · {formatDate(upcoming.departureDate)} ({upcoming.airportCode})</p></div>
                      <p className="ml-auto text-2xl font-bold text-primary">{daysUntil(upcoming.departureDate)} <span className="text-sm font-medium">hari lagi</span></p>
                    </CardContent></Card>
                  )}
                  {bookings.length === 0 ? <EmptyState title="Belum ada booking" description="Pilih paket dan buat pemesanan pertama Anda." action={<Button asChild><Link to="/umrah">Lihat paket</Link></Button>} /> : bookings.map((b) => {
                    const dp = bookingDocProgress(b)
                    const canPay = b.status === 'awaiting_payment' || b.status === 'failed' || b.status === 'expired'
                    return (
                      <Card key={b.id}><CardContent className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div><CardTitle>{b.packageName}</CardTitle><p className="font-mono text-xs text-muted">{b.bookingCode}</p></div>
                          <StatusBadge status={b.status} />
                        </div>
                        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          <div className="flex justify-between"><dt className="text-muted">Berangkat</dt><dd>{formatDate(b.departureDate)} · {b.airportCode}</dd></div>
                          <div className="flex justify-between"><dt className="text-muted">Kamar / Jemaah</dt><dd>{ROOM_SHORT[b.room]} · {b.passengers.length} orang</dd></div>
                          <div className="flex justify-between"><dt className="text-muted">Total</dt><dd className="font-semibold">{formatRupiah(b.pricing.total)}</dd></div>
                          <div className="flex justify-between"><dt className="text-muted">Terbayar / Sisa</dt><dd>{formatRupiah(paidAmount(b))} / {formatRupiah(amountRemaining(b))}</dd></div>
                        </dl>
                        <div><div className="mb-1 flex justify-between text-xs"><span>Kelengkapan data jemaah</span><span>{dp.pct}%</span></div><Progress pct={dp.pct} /></div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline"><Link to={`/paket/${b.packageSlug}`}>Detail paket</Link></Button>
                          <Button size="sm" variant="outline" onClick={() => setInvoice(b)}><FileText className="h-4 w-4" />Invoice</Button>
                          {canPay && <Button size="sm" onClick={() => nav(b.status === 'awaiting_payment' ? `/payment/${b.id}` : `/checkout/${b.id}`)}>Bayar sekarang</Button>}
                          {b.status === 'dp_paid' && <Button size="sm" variant="accent" onClick={() => payRest.mutate(b)}>Lunasi sisa</Button>}
                          {(b.status === 'awaiting_payment' || b.status === 'draft' || b.status === 'failed' || b.status === 'expired') && <Button size="sm" variant="ghost" onClick={() => setCancel(b)}>Batalkan</Button>}
                        </div>
                      </CardContent></Card>
                    )
                  })}
                </>
              )}

              {tab === 'dokumen' && (bookings.filter((b) => b.status !== 'cancelled').length === 0 ? <EmptyState title="Belum ada dokumen" description="Dokumen muncul setelah Anda membuat booking." /> : bookings.filter((b) => b.status !== 'cancelled').map((b) => (
                <Card key={b.id}><CardContent className="space-y-4">
                  <div><CardTitle>{b.packageName}</CardTitle><p className="text-xs text-muted">Klik dokumen untuk menandai sudah diunggah (simulasi, tidak ada berkas nyata).</p></div>
                  {b.passengers.map((p) => {
                    const pr = docProgress(p)
                    return (
                      <div key={p.id} className="rounded-lg border border-border p-3">
                        <div className="mb-2 flex justify-between text-sm"><b>{p.fullName}</b><span className={pr.pct === 100 ? 'text-success' : 'text-warning'}>{pr.pct === 100 ? 'Lengkap' : `${pr.done}/${pr.total} dokumen`}</span></div>
                        <Progress pct={pr.pct} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {DOCS.map((d) => {
                            const on = !!p.documents[d.key]
                            return <button key={d.key} disabled={setDoc.isPending} aria-pressed={on} onClick={() => setDoc.mutate({ b, pid: p.id, k: d.key, done: !on })}
                              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs ${on ? 'border-success bg-success/10 text-success' : 'border-border hover:border-primary'}`}>{on && <Check className="h-3 w-3" />}{d.label}{!d.required && ' (opsional)'}</button>
                          })}
                        </div>
                      </div>
                    )
                  })}
                </CardContent></Card>
              )))}

              {tab === 'transaksi' && (allTx.length === 0 ? <EmptyState title="Belum ada transaksi" /> : (
                <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full text-sm">
                  <thead className="bg-black/5 text-left"><tr><th className="p-3">Tanggal</th><th className="p-3">Booking</th><th className="p-3">Metode</th><th className="p-3 text-right">Nominal</th><th className="p-3">Status</th></tr></thead>
                  <tbody>{allTx.map(({ t, b }) => <tr key={t.id} className="border-t border-border"><td className="p-3 whitespace-nowrap">{formatDateTime(t.createdAt)}</td><td className="p-3"><span className="font-mono text-xs">{b.bookingCode}</span><br />{b.packageName}</td><td className="p-3 uppercase">{t.method} (demo)</td><td className="p-3 text-right">{formatRupiah(t.amount)}</td><td className="p-3"><TxBadge status={t.status} /></td></tr>)}</tbody>
                </table></div>
              ))}

              {tab === 'profil' && (
                <Card><CardContent className="space-y-3 text-sm"><CardTitle>Profil Jemaah</CardTitle>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {([['Nama', user.name], ['Email', user.email], ['Telepon', user.phone], ['Kota', user.city ?? '—'], ['Bergabung', formatDate(user.createdAt)], ['Total booking', String(bookings.length)]] as const).map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                  </dl>
                </CardContent></Card>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)}>
        <DialogContent title="Invoice" className="max-w-3xl">
          {invoice && <Invoice booking={invoice} />}
          <div className="mt-4 flex justify-end"><Button onClick={printPage}>Cetak / Simpan PDF</Button></div>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog open={!!cancel} onOpenChange={(o) => !o && setCancel(null)} danger title="Batalkan booking?" description={`Booking ${cancel?.bookingCode ?? ''} akan dibatalkan. Tindakan ini tidak dapat diurungkan.`} confirmLabel="Ya, batalkan" loading={doCancel.isPending} onConfirm={() => cancel && doCancel.mutate(cancel)} />
    </>
  )
}
