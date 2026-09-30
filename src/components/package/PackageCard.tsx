import { Link } from 'react-router-dom'
import { Building2, CalendarDays, Clock, MapPin, Plane, PlaneTakeoff } from 'lucide-react'
import type { TourPackage } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Scene } from '@/components/common/Scene'
import { availabilityOf, minPrice, nextDeparture, totalSeatsLeft } from '@/services/packageService'
import { formatDate, formatRupiah } from '@/utils/format'
import { cn } from '@/utils/cn'

export const CATEGORY_LABEL: Record<string, string> = {
  reguler: 'Reguler', premium: 'Premium', plus: 'Umrah Plus', 'haji-plus': 'Haji Plus', 'haji-khusus': 'Haji Khusus',
}

export function AvailabilityBadge({ pkg }: { pkg: TourPackage }) {
  const a = availabilityOf(pkg)
  if (a === 'full') return <Badge tone="danger">Penuh</Badge>
  if (a === 'limited') return <Badge tone="warning">Sisa {totalSeatsLeft(pkg)} seat</Badge>
  return <Badge tone="success">Tersedia</Badge>
}

const Row = ({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) => (
  <li className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden /><span className="min-w-0 leading-snug">{children}</span></li>
)

/** Kartu paket ala poster: foto besar, chip kategori, ikon detail, bar seat, dan harga. Seluruh kartu dapat diklik. */
export function PackageCard({ pkg }: { pkg: TourPackage }) {
  const next = nextDeparture(pkg)
  const full = availabilityOf(pkg) === 'full'
  const left = next?.seatsLeft ?? 0
  const pct = next ? Math.max(6, Math.round((left / next.seatsTotal) * 100)) : 0
  return (
    <article className="group relative flex flex-col rounded-[1.75rem] border border-border bg-surface p-3 shadow-[0_2px_16px_-8px_rgba(74,43,28,.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(74,43,28,.5)] animate-fade-up">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[1.4rem] bg-black/5">
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-105"><Scene id={pkg.gallery[0]} alt={pkg.name} /></div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {full && <span className="absolute right-3 top-3 rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white">Penuh</span>}
      </div>

      <div className="px-2 pb-2 pt-4">
        <span className="inline-block -rotate-2 rounded-2xl bg-accent/15 px-4 py-1.5 text-sm font-semibold text-primary">{CATEGORY_LABEL[pkg.category]}</span>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-primary">
          <Link to={`/paket/${pkg.slug}`} className="after:absolute after:inset-0 after:rounded-[1.75rem]">{pkg.name}</Link>
        </h3>

        <ul className="mt-4 space-y-2.5 text-[15px] text-text/85">
          <Row icon={Clock}>{pkg.durationDays} Hari</Row>
          <Row icon={Plane}>{pkg.airline}</Row>
          {next && <Row icon={CalendarDays}>{formatDate(next.date)}</Row>}
          {next && <Row icon={PlaneTakeoff}>{next.airportName.split(',')[0]} ({next.airportCode})</Row>}
          <Row icon={Building2}>{pkg.hotelMakkah.name}, Makkah</Row>
          <Row icon={MapPin}>{pkg.hotelMadinah.name}, Madinah</Row>
        </ul>

        <div className="my-4 h-px w-16 bg-border" />

        <div className={cn('relative h-9 overflow-hidden rounded-full bg-black/5', full && 'opacity-60')} role="img" aria-label={`${left} seat tersisa`}>
          <div className={cn('absolute inset-y-0 left-0 rounded-full', left <= 10 ? 'bg-warning/30' : 'bg-accent/30')} style={{ width: `${pct}%` }} />
          <span className="relative z-[1] flex h-full items-center px-4 text-sm font-medium">{full ? 'Seat penuh' : `${left} seat tersisa`}</span>
        </div>

        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-sm text-muted">Harga mulai</span>
          <span className="text-2xl font-bold tracking-tight text-primary">{formatRupiah(minPrice(pkg))}</span>
        </p>
        <p className="text-[11px] text-muted">per jemaah · data simulasi</p>
      </div>
    </article>
  )
}
