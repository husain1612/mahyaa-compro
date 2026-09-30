import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Check, Hotel, Plane, Users, X } from 'lucide-react'
import type { RoomType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { DemoBanner, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { PackageGallery } from '@/components/package/PackageGallery'
import { AvailabilityBadge, CATEGORY_LABEL } from '@/components/package/PackageCard'
import { packageService, minPrice } from '@/services/packageService'
import { formatDate, formatRupiah } from '@/utils/format'
import { ROOM_LABEL, calcPricing } from '@/utils/pricing'
import { cn } from '@/utils/cn'

const ROOMS: RoomType[] = ['quad', 'triple', 'double']

export default function PackageDetailPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const { data: pkg, isLoading, error, refetch } = useQuery({ queryKey: ['package', slug], queryFn: () => packageService.getBySlug(slug), retry: false })
  const [room, setRoom] = useState<RoomType>('quad')
  const [depId, setDepId] = useState<string>('')

  if (isLoading) return <div className="mx-auto max-w-7xl space-y-4 px-4 py-8"><LoadingSkeleton className="h-10 w-1/2" /><LoadingSkeleton className="h-96" /></div>
  if (error || !pkg) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState title="Paket tidak ditemukan" message={(error as Error)?.message} onRetry={() => refetch()} action={<Button asChild><Link to="/umrah">Lihat semua paket</Link></Button>} /></div>

  const dep = pkg.departures.find((d) => d.id === depId) ?? pkg.departures.find((d) => d.seatsLeft > 0) ?? pkg.departures[0]
  const pricing = calcPricing(pkg, room, 1)
  const soldOut = dep.seatsLeft === 0
  const book = () => nav(`/booking/${pkg.slug}?room=${room}&dep=${dep.id}`)

  const panel = (sfx: string) => (
    <Card className="lg:shadow-lg">
      <CardContent className="space-y-4">
        <div><p className="text-xs text-muted">Harga mulai dari</p><p className="text-2xl font-bold text-primary">{formatRupiah(minPrice(pkg))}</p><p className="text-[11px] text-muted">per jemaah · simulasi</p></div>
        <div className="space-y-1.5">
          <label htmlFor={`panel-dep${sfx}`} className="text-sm font-medium">Tanggal keberangkatan</label>
          <select id={`panel-dep${sfx}`} value={dep.id} onChange={(e) => setDepId(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm">
            {pkg.departures.map((d) => <option key={d.id} value={d.id}>{formatDate(d.date)} · {d.airportCode} {d.seatsLeft === 0 ? '(Penuh)' : `(${d.seatsLeft} kursi)`}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Tipe kamar</legend>
          <div className="grid gap-2">
            {ROOMS.map((r) => (
              <label key={r} className={cn('flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm', room === r ? 'border-primary bg-primary/5' : 'border-border')}>
                <span className="flex items-center gap-2"><input type="radio" name={`room${sfx}`} checked={room === r} onChange={() => setRoom(r)} className="accent-[var(--color-primary)]" />{ROOM_LABEL[r]}</span>
                <span className="font-semibold">{formatRupiah(pkg.prices[r])}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="rounded-lg bg-black/5 p-3 text-sm">
          <div className="flex justify-between"><span className="text-muted">DP ({pkg.dpPercent}%) / jemaah</span><b>{formatRupiah(pricing.dpAmount)}</b></div>
          <div className="flex justify-between"><span className="text-muted">Sisa pelunasan</span><b>{formatRupiah(pricing.remaining)}</b></div>
        </div>
        <Button size="lg" className="w-full" variant="accent" disabled={soldOut} onClick={book}>{soldOut ? 'Kursi penuh' : 'Pesan Sekarang'}</Button>
        <DemoBanner />
      </CardContent>
    </Card>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link to="/" className="hover:text-primary">Beranda</Link> / <Link to={pkg.type === 'haji' ? '/haji' : '/umrah'} className="hover:text-primary">{pkg.type === 'haji' ? 'Haji' : 'Umrah'}</Link> / <span className="text-text">{pkg.name}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <PackageGallery images={pkg.gallery} name={pkg.name} />
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2"><Badge tone="accent">{CATEGORY_LABEL[pkg.category]}</Badge><Badge tone="primary">{pkg.durationDays} hari</Badge><AvailabilityBadge pkg={pkg} /></div>
            <h1 className="text-3xl font-bold">{pkg.name}</h1>
            <p className="mt-2 text-muted">{pkg.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardContent className="flex gap-3"><Plane className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs text-muted">Maskapai & bandara</p><p className="font-medium">{pkg.airline}</p><p className="text-sm text-muted">{[...new Set(pkg.departures.map((d) => d.airportCode))].join(', ')}</p></div></CardContent></Card>
            <Card><CardContent className="flex gap-3"><Users className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs text-muted">Ketersediaan kursi</p><p className="font-medium">{pkg.departures.reduce((s, d) => s + d.seatsLeft, 0)} kursi tersisa</p><p className="text-sm text-muted">DP {pkg.dpPercent}%</p></div></CardContent></Card>
            <Card><CardContent className="flex gap-3"><Hotel className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs text-muted">Hotel Makkah</p><p className="font-medium">{pkg.hotelMakkah.name}</p><p className="text-sm text-muted">{pkg.hotelMakkah.star}★ · {pkg.hotelMakkah.distanceToHaram} dari Masjidil Haram</p></div></CardContent></Card>
            <Card><CardContent className="flex gap-3"><Hotel className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs text-muted">Hotel Madinah</p><p className="font-medium">{pkg.hotelMadinah.name}</p><p className="text-sm text-muted">{pkg.hotelMadinah.star}★ · {pkg.hotelMadinah.distanceToHaram} dari Masjid Nabawi</p></div></CardContent></Card>
          </div>

          <section aria-labelledby="dep-h">
            <h2 id="dep-h" className="mb-3 text-xl font-bold">Jadwal Keberangkatan</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {pkg.departures.map((d) => (
                <button key={d.id} onClick={() => setDepId(d.id)} disabled={d.seatsLeft === 0} aria-pressed={d.id === dep.id}
                  className={cn('rounded-xl border p-4 text-left disabled:opacity-50', d.id === dep.id ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary')}>
                  <Calendar className="mb-1 h-5 w-5 text-primary" /><p className="font-semibold">{formatDate(d.date)}</p>
                  <p className="text-sm text-muted">{d.airportName}</p>
                  <p className={cn('mt-1 text-xs font-medium', d.seatsLeft === 0 ? 'text-danger' : d.seatsLeft <= 10 ? 'text-warning' : 'text-success')}>{d.seatsLeft === 0 ? 'Penuh' : `Sisa ${d.seatsLeft} dari ${d.seatsTotal} kursi`}</p>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="room-h">
            <h2 id="room-h" className="mb-3 text-xl font-bold">Harga per Tipe Kamar</h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-black/5 text-left"><tr><th className="p-3">Tipe kamar</th><th className="p-3">Harga / jemaah</th><th className="p-3">DP ({pkg.dpPercent}%)</th></tr></thead>
                <tbody>{ROOMS.map((r) => <tr key={r} className="border-t border-border"><td className="p-3">{ROOM_LABEL[r]}</td><td className="p-3 font-semibold">{formatRupiah(pkg.prices[r])}</td><td className="p-3">{formatRupiah(calcPricing(pkg, r, 1).dpAmount)}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="fac-h" className="grid gap-6 md:grid-cols-2">
            <div><h2 id="fac-h" className="mb-3 text-xl font-bold">Fasilitas</h2><ul className="space-y-2 text-sm">{pkg.facilities.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>)}</ul></div>
            <div><h2 className="mb-3 text-xl font-bold">Tidak Termasuk</h2><ul className="space-y-2 text-sm">{pkg.excluded.map((f) => <li key={f} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />{f}</li>)}</ul></div>
          </section>

          <section aria-labelledby="it-h">
            <h2 id="it-h" className="mb-3 text-xl font-bold">Itinerary</h2>
            <ol className="space-y-3 border-l-2 border-accent pl-5">
              {pkg.itinerary.map((d) => (
                <li key={d.day} className="relative"><span className="absolute -left-[1.85rem] top-0.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{d.day}</span><h3 className="font-sans text-base font-semibold">{d.title}</h3><p className="text-sm text-muted">{d.description}</p></li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="tc-h">
            <h2 id="tc-h" className="mb-3 text-xl font-bold">Syarat & Ketentuan</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">{pkg.terms.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        </div>

        <aside className="hidden lg:block"><div className="sticky top-24">{panel('')}</div></aside>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-surface p-3 shadow-[0_-4px_12px_rgba(0,0,0,.08)] lg:hidden">
        <div><p className="text-[11px] text-muted">Mulai dari</p><p className="text-sm font-bold text-primary">{formatRupiah(minPrice(pkg))}</p></div>
        <MobileBooking panel={panel('-m')} disabled={soldOut} onBook={book} />
      </div>
    </div>
  )
}

function MobileBooking({ panel, disabled, onBook }: { panel: React.ReactNode; disabled: boolean; onBook: () => void }) {
  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild><Button variant="outline" className="px-3">Opsi</Button></DialogTrigger>
        <DialogContent title="Pilih keberangkatan & kamar">{panel}</DialogContent>
      </Dialog>
      <Button variant="accent" className="px-3" disabled={disabled} onClick={onBook}>Pesan</Button>
    </div>
  )
}
