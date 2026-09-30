import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Booking, BookingStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input, Select } from '@/components/ui/form'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { BOOKING_STATUS, StatusBadge, TxBadge } from '@/components/common/StatusBadge'
import { PriceLines } from '@/components/booking/BookingSummary'
import { adminService } from '@/services/adminService'
import { errMsg } from '@/utils/errors'
import { formatDate, formatDateShort, formatDateTime, formatRupiah } from '@/utils/format'
import { ROOM_SHORT } from '@/utils/pricing'

export function AdminBookings() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'bookings'], queryFn: adminService.bookings })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | BookingStatus>('')
  const [detail, setDetail] = useState<Booking | null>(null)

  const setStat = useMutation({
    mutationFn: (v: { id: string; s: BookingStatus }) => adminService.setBookingStatus(v.id, v.s),
    onSuccess: (b) => { qc.invalidateQueries({ queryKey: ['admin'] }); qc.invalidateQueries({ queryKey: ['booking'] }); setDetail(b); toast.success('Status booking diperbarui (lokal).') },
    onError: (e) => toast.error(errMsg(e)),
  })

  if (q.isLoading) return <LoadingSkeleton className="h-64" />
  if (q.isError) return <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} />
  const needle = search.toLowerCase()
  const rows = (q.data ?? []).filter((b) => (!status || b.status === status) && (!needle || `${b.bookingCode} ${b.booker.fullName} ${b.packageName}`.toLowerCase().includes(needle)))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted" /><label htmlFor="ab-q" className="sr-only">Cari booking</label><Input id="ab-q" className="pl-10" placeholder="Cari kode, nama, paket…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div><label htmlFor="ab-s" className="sr-only">Filter status</label><Select id="ab-s" className="w-56" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | '')}><option value="">Semua status</option>{(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => <option key={s} value={s}>{BOOKING_STATUS[s].label}</option>)}</Select></div>
      </div>
      {rows.length === 0 ? <EmptyState title="Tidak ada pemesanan" description="Ubah pencarian atau filter status." /> : (
        <>
        <ul className="space-y-3 md:hidden">
          {rows.map((b) => (
            <li key={b.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2"><span className="font-mono text-xs text-muted">{b.bookingCode}</span><StatusBadge status={b.status} /></div>
              <p className="mt-2 font-semibold">{b.packageName}</p>
              <p className="text-sm text-muted">{b.booker.fullName} · {b.passengers.length} jemaah · {formatDateShort(b.departureDate)}</p>
              <div className="mt-3 flex items-center justify-between"><span className="font-bold text-primary">{formatRupiah(b.pricing.total)}</span><Button size="sm" variant="outline" onClick={() => setDetail(b)} aria-label={`Detail ${b.bookingCode}`}><Eye className="h-4 w-4" />Detail</Button></div>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-black/5 text-left"><tr><th className="p-3">Kode</th><th className="p-3">Pemesan</th><th className="p-3">Paket</th><th className="p-3">Berangkat</th><th className="p-3 text-right">Total</th><th className="p-3">Status</th><th className="p-3"><span className="sr-only">Aksi</span></th></tr></thead>
            <tbody>{rows.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{b.bookingCode}</td><td className="p-3">{b.booker.fullName}<br /><span className="text-xs text-muted">{b.passengers.length} jemaah</span></td>
                <td className="p-3">{b.packageName}</td><td className="p-3 whitespace-nowrap">{formatDateShort(b.departureDate)}</td>
                <td className="p-3 text-right">{formatRupiah(b.pricing.total)}</td><td className="p-3"><StatusBadge status={b.status} /></td>
                <td className="p-3"><Button size="sm" variant="outline" onClick={() => setDetail(b)} aria-label={`Detail ${b.bookingCode}`}><Eye className="h-4 w-4" />Detail</Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        </>
      )}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent title={`Booking ${detail?.bookingCode ?? ''}`} description="Detail pemesanan (data simulasi)" className="max-w-2xl">
          {detail && (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-2 sm:grid-cols-2">
                <div><dt className="text-muted">Paket</dt><dd className="font-medium">{detail.packageName}</dd></div>
                <div><dt className="text-muted">Berangkat</dt><dd>{formatDate(detail.departureDate)} · {detail.airportCode} · {ROOM_SHORT[detail.room]}</dd></div>
                <div><dt className="text-muted">Pemesan</dt><dd>{detail.booker.fullName} · {detail.booker.phone}</dd></div>
                <div><dt className="text-muted">Dibuat</dt><dd>{formatDateTime(detail.createdAt)}</dd></div>
              </dl>
              <div><p className="mb-1 font-medium">Jemaah</p><ul className="list-disc pl-5">{detail.passengers.map((p) => <li key={p.id}>{p.fullName} <span className="text-muted">({p.gender}, {p.passportNumber})</span></li>)}</ul></div>
              <PriceLines pricing={detail.pricing} />
              {detail.transactions.length > 0 && <div><p className="mb-1 font-medium">Transaksi</p><ul className="space-y-1">{detail.transactions.map((t) => <li key={t.id} className="flex flex-wrap justify-between gap-2 text-xs"><span>{formatDateTime(t.createdAt)} · {t.method.toUpperCase()}</span><span>{formatRupiah(t.amount)} <TxBadge status={t.status} /></span></li>)}</ul></div>}
              <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
                <div className="flex-1"><label htmlFor="ad-status" className="mb-1 block font-medium">Ubah status (lokal)</label>
                  <Select id="ad-status" value={detail.status} disabled={setStat.isPending} onChange={(e) => setStat.mutate({ id: detail.id, s: e.target.value as BookingStatus })}>{(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => <option key={s} value={s}>{BOOKING_STATUS[s].label}</option>)}</Select></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
