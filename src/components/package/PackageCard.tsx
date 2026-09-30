import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Clock, Hotel, Plane } from 'lucide-react'
import type { TourPackage } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Scene } from '@/components/common/Scene'
import { availabilityOf, minPrice, nextDeparture, totalSeatsLeft } from '@/services/packageService'
import { formatDateShort, formatRupiah } from '@/utils/format'

export const CATEGORY_LABEL: Record<string, string> = {
  reguler: 'Reguler', premium: 'Premium', plus: 'Umrah Plus', 'haji-plus': 'Haji Plus', 'haji-khusus': 'Haji Khusus',
}

export function AvailabilityBadge({ pkg }: { pkg: TourPackage }) {
  const a = availabilityOf(pkg)
  if (a === 'full') return <Badge tone="danger">Penuh</Badge>
  if (a === 'limited') return <Badge tone="warning">Sisa {totalSeatsLeft(pkg)} seat</Badge>
  return <Badge tone="success">Tersedia</Badge>
}

export function PackageCard({ pkg }: { pkg: TourPackage }) {
  const next = nextDeparture(pkg)
  const full = availabilityOf(pkg) === 'full'
  const lowSeats = availabilityOf(pkg) === 'limited'
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-surface ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-24px_rgba(74,43,28,.45)] animate-fade-up">
      <Link to={`/paket/${pkg.slug}`} className="relative m-2 block aspect-[16/11] overflow-hidden rounded-[1.4rem]" aria-label={`Lihat detail ${pkg.name}`}>
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.06]"><Scene id={pkg.gallery[0]} /></div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-primary">{CATEGORY_LABEL[pkg.category]}</span>
        {(lowSeats || full) && <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${full ? 'bg-danger' : 'bg-warning'}`}>{full ? 'Penuh' : `Sisa ${totalSeatsLeft(pkg)} seat`}</span>}
      </Link>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
        <h3 className="text-xl font-bold leading-snug"><Link to={`/paket/${pkg.slug}`} className="after:absolute after:inset-0 hover:text-primary">{pkg.name}</Link></h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted">{pkg.tagline}</p>
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] text-muted">
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{pkg.durationDays} hari</li>
          <li className="flex items-center gap-2"><Plane className="h-4 w-4 text-primary" /><span className="truncate">{pkg.airline}</span></li>
          <li className="flex items-center gap-2"><Hotel className="h-4 w-4 text-primary" />{pkg.hotelMakkah.star}★ · {pkg.hotelMadinah.star}★</li>
          {next && <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatDateShort(next.date)}</li>}
        </ul>
        <div className="mt-5 flex items-end justify-between border-t border-dashed border-border pt-4">
          <div>
            <p className="text-xs text-muted">Mulai dari · simulasi</p>
            <p className="text-2xl font-extrabold tracking-tight text-primary">{formatRupiah(minPrice(pkg))}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white transition duration-300 group-hover:rotate-45 group-hover:bg-accent"><ArrowUpRight className="h-5 w-5" /></span>
        </div>
        {!full && <Link to={`/booking/${pkg.slug}`} className="relative z-10 mt-4 flex h-11 items-center justify-center rounded-full bg-primary/8 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">Pesan sekarang</Link>}
      </div>
    </article>
  )
}
