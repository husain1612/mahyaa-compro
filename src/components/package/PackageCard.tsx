import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Clock, Hotel, Plane } from 'lucide-react'
import type { TourPackage } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scene } from '@/components/common/Scene'
import { availabilityOf, minPrice, nextDeparture, totalSeatsLeft } from '@/services/packageService'
import { formatDateShort, formatRupiah } from '@/utils/format'

export const CATEGORY_LABEL: Record<string, string> = {
  reguler: 'Reguler', premium: 'Premium', plus: 'Umrah Plus', 'haji-plus': 'Haji Plus', 'haji-khusus': 'Haji Khusus',
}

export function AvailabilityBadge({ pkg }: { pkg: TourPackage }) {
  const a = availabilityOf(pkg)
  if (a === 'full') return <Badge tone="danger">Penuh</Badge>
  if (a === 'limited') return <Badge tone="warning">Sisa {totalSeatsLeft(pkg)} kursi</Badge>
  return <Badge tone="success">Tersedia</Badge>
}

export function PackageCard({ pkg }: { pkg: TourPackage }) {
  const next = nextDeparture(pkg)
  const full = availabilityOf(pkg) === 'full'
  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface p-2 shadow-[0_2px_20px_-8px_rgba(74,43,28,.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(74,43,28,.4)] animate-fade-up">
      <Link to={`/paket/${pkg.slug}`} className="relative block h-56 overflow-hidden rounded-3xl" aria-label={`Lihat detail ${pkg.name}`}>
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"><Scene id={pkg.gallery[0]} /></div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary shadow">{CATEGORY_LABEL[pkg.category]}</span>
        <span className="absolute right-3 top-3"><AvailabilityBadge pkg={pkg} /></span>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <h3 className="text-xl font-extrabold leading-tight">{pkg.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-white/85">{pkg.tagline}</p>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <ul className="flex flex-wrap gap-2 text-xs font-semibold text-primary">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5"><Clock className="h-3.5 w-3.5" />{pkg.durationDays} hari</li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5"><Plane className="h-3.5 w-3.5" />{pkg.airline}</li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5"><Hotel className="h-3.5 w-3.5" />{pkg.hotelMakkah.star}★ · {pkg.hotelMadinah.star}★</li>
          {next && <li className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDateShort(next.date)} · {next.airportCode}</li>}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-xs text-muted">Mulai dari</p>
            <p className="text-2xl font-extrabold tracking-tight text-primary">{formatRupiah(minPrice(pkg))}</p>
            <p className="text-[11px] text-muted">per jemaah · data simulasi</p>
          </div>
          <Link to={`/paket/${pkg.slug}`} aria-label={`Detail ${pkg.name}`} className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition group-hover:rotate-45 group-hover:bg-accent"><ArrowUpRight className="h-5 w-5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline"><Link to={`/paket/${pkg.slug}`}>Detail</Link></Button>
          {full ? <Button disabled>Penuh</Button> : <Button asChild variant="accent"><Link to={`/booking/${pkg.slug}`}>Pesan</Link></Button>}
        </div>
      </div>
    </article>
  )
}
