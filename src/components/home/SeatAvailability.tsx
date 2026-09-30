import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, PlaneTakeoff } from 'lucide-react'
import type { TourPackage } from '@/types'
import { Scene } from '@/components/common/Scene'
import { AIRPORTS } from '@/data/packages'
import { CATEGORY_LABEL } from '@/components/package/PackageCard'
import { minPrice } from '@/services/packageService'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const jt = (n: number) => `${(n / 1_000_000).toFixed(1)} Jt`

export function AirportList({ packages }: { packages: TourPackage[] }) {
  const scenes = ['hotel', 'nabawi', 'flight', 'dates', 'kaaba']
  return (
    <ul className="space-y-4">
      {AIRPORTS.slice(0, 5).map((a, idx) => {
        const count = packages.filter((p) => p.departures.some((d) => d.airportCode === a.code)).length
        return (
          <li key={a.code}>
            <Link to={`/umrah?airport=${a.code}`} className="group flex items-center gap-4 rounded-2xl p-1 hover:bg-primary/5">
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl"><Scene id={scenes[idx % scenes.length]} /></span>
              <span>
                <span className="block text-lg font-medium leading-tight group-hover:text-primary">{a.name.split(',')[0]}</span>
                <span className="text-sm uppercase text-primary/80">{a.code} • {a.name.split(', ')[1] ?? ''} · {count} paket</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function SeatAvailability({ packages }: { packages: TourPackage[] }) {
  const scroller = useRef<HTMLDivElement>(null)
  const cards = useMemo(
    () => packages.flatMap((p) => p.departures.filter((d) => d.seatsLeft > 0).map((d) => ({ p, d }))).sort((a, b) => a.d.date.localeCompare(b.d.date)).slice(0, 10),
    [packages],
  )
  return (
    <div className="relative">
      <div ref={scroller} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-3 pr-16">
        {cards.map(({ p, d }) => (
          <Link key={d.id} to={`/paket/${p.slug}`} className="group w-60 shrink-0 snap-start rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
            <div className="flex h-9 items-center gap-2 text-primary"><PlaneTakeoff className="h-5 w-5" /><span className="truncate text-sm font-semibold">{p.airline}</span></div>
            <p className="mt-3 font-semibold">{formatDate(d.date)}</p>
            <p className="mt-1 text-xs font-medium text-primary">{p.durationDays} Hari · {d.airportCode}</p>
            <p className="mt-2 line-clamp-1 text-xs text-muted">{p.hotelMakkah.name}</p>
            <p className="text-xs font-medium">{CATEGORY_LABEL[p.category]}</p>
            <div className="mt-4 flex items-end justify-between">
              <div><p className="text-[11px] text-muted">Seat tersisa</p><p className={cn('text-xl font-semibold', d.seatsLeft <= 10 && 'text-warning')}>{d.seatsLeft}</p></div>
              <div className="text-right"><p className="text-[11px] text-muted">Mulai</p><p className="text-xl font-semibold text-accent">{jt(minPrice(p))}</p></div>
            </div>
          </Link>
        ))}
      </div>
      <button onClick={() => scroller.current?.scrollBy({ left: 260, behavior: 'smooth' })} aria-label="Geser ke kanan" className="absolute right-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface shadow-md hover:bg-primary/5"><ChevronRight className="h-5 w-5" /></button>
    </div>
  )
}
