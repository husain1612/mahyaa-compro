import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import type { TourPackage } from '@/types'
import { Scene } from '@/components/common/Scene'
import { CATEGORY_LABEL } from '@/components/package/PackageCard'
import { minPrice, nextDeparture } from '@/services/packageService'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const shortPrice = (n: number) => (n >= 100_000_000 ? `${Math.round(n / 1_000_000)}` : (n / 1_000_000).toFixed(1).replace('.', ','))

/** Banner promo bergaya poster; isi diambil dari paket unggulan (data simulasi). */
export function PromoCarousel({ packages }: { packages: TourPackage[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = packages.length

  useEffect(() => {
    if (paused || n < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000)
    return () => clearInterval(t)
  }, [paused, n])

  if (n === 0) return null
  const go = (d: number) => setI((x) => (x + d + n) % n)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} role="region" aria-roledescription="carousel" aria-label="Promo paket unggulan">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-secondary">
        {packages.map((p, idx) => {
          const dep = nextDeparture(p)
          return (
            <div key={p.id} aria-hidden={idx !== i} className={cn('transition-opacity duration-700', idx === i ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0')}>
              <div className="relative flex min-h-[22rem] items-center p-6 sm:min-h-[26rem] sm:p-12">
                <div className="absolute inset-0"><Scene id={p.gallery[0]} /></div>
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
                <div className="relative max-w-2xl text-white">
                  <span className="inline-block rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider">{CATEGORY_LABEL[p.category]} · {p.durationDays} hari</span>
                  <h2 className="mt-4 text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">{p.name}</h2>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-sm text-white/80">mulai</span>
                    <span className="text-5xl font-bold leading-none sm:text-7xl">{shortPrice(minPrice(p))}</span>
                    <span className="text-2xl font-medium">Juta</span>
                  </div>
                  <p className="mt-3 text-sm text-white/85">{p.airline} · {p.hotelMakkah.name} ({p.hotelMakkah.star}★){dep ? ` · Berangkat ${formatDate(dep.date)}` : ''}</p>
                  <Link to={`/paket/${p.slug}`} tabIndex={idx === i ? 0 : -1} className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-lg hover:brightness-110">Pilih Paket</Link>
                </div>
              </div>
            </div>
          )
        })}
        <button onClick={() => go(-1)} aria-label="Slide sebelumnya" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 hover:bg-white sm:block"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => go(1)} aria-label="Slide berikutnya" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 hover:bg-white sm:block"><ChevronRight className="h-5 w-5" /></button>
        <p className="absolute bottom-3 right-4 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white">Data simulasi</p>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Pilih slide">
          {packages.map((p, idx) => <button key={p.id} role="tab" aria-selected={idx === i} aria-label={`Slide ${idx + 1}: ${p.name}`} onClick={() => setI(idx)} className={cn('h-2.5 rounded-full transition-all', idx === i ? 'w-7 bg-primary' : 'w-2.5 bg-primary/25 hover:bg-primary/50')} />)}
        </div>
        <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Putar otomatis' : 'Jeda otomatis'} className="rounded-full p-1 text-primary hover:bg-primary/10">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
      </div>
    </div>
  )
}
