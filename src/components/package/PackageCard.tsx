import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Hotel, Plane } from 'lucide-react'
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
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md animate-fade-up">
      <Link to={`/paket/${pkg.slug}`} className="relative block h-44 overflow-hidden" aria-label={`Lihat detail ${pkg.name}`}>
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"><Scene id={pkg.gallery[0]} /></div>
        <Badge tone="accent" className="absolute left-3 top-3 bg-accent text-white">{CATEGORY_LABEL[pkg.category]}</Badge>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold leading-snug"><Link to={`/paket/${pkg.slug}`} className="hover:text-primary">{pkg.name}</Link></h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{pkg.tagline}</p>
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{pkg.durationDays} hari</li>
          <li className="flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />{pkg.airline}</li>
          <li className="flex items-center gap-2"><Hotel className="h-4 w-4 text-primary" />Makkah {pkg.hotelMakkah.star}★ · Madinah {pkg.hotelMadinah.star}★</li>
          {next && <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Berangkat {formatDateShort(next.date)} · {next.airportCode}</li>}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted">Mulai dari</p>
            <p className="text-lg font-bold text-primary">{formatRupiah(minPrice(pkg))}</p>
            <p className="text-[11px] text-muted">per jemaah · data simulasi</p>
          </div>
          <AvailabilityBadge pkg={pkg} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline"><Link to={`/paket/${pkg.slug}`}>Detail</Link></Button>
          {full ? <Button disabled>Penuh</Button> : <Button asChild variant="accent"><Link to={`/booking/${pkg.slug}`}>Pesan</Link></Button>}
        </div>
      </div>
    </article>
  )
}
