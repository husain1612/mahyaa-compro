import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Star } from 'lucide-react'
import type { TourPackage } from '@/types'
import { Scene } from '@/components/common/Scene'
import { AIRPORTS } from '@/data/packages'
import { minPrice, totalSeatsLeft } from '@/services/packageService'
import { formatRupiah } from '@/utils/format'

export function Hero({ packages }: { packages: TourPackage[] }) {
  const spot = packages.find((p) => p.featured) ?? packages[0]
  const stats = [
    { v: `${packages.length || '—'}`, l: 'Paket tersedia' },
    { v: `${AIRPORTS.length}`, l: 'Bandara keberangkatan' },
    { v: '25%', l: 'DP mulai dari' },
  ]
  return (
    <section className="bg-mesh relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <span className="pulse-dot h-2 w-2 rounded-full bg-green-500" aria-hidden />Keberangkatan 2026–2027 dibuka
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl">
            Perjalanan suci,<br /><span className="text-gradient">tanpa ribet.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">Pilih paket umrah atau haji, booking, dan bayar DP dalam hitungan menit. Kami temani dari manasik sampai pulang ke tanah air.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/umrah" className="group inline-flex h-13 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(130,77,52,.7)] transition hover:bg-secondary">Lihat Paket Umrah<ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></Link>
            <Link to="/haji" className="inline-flex h-13 items-center rounded-full border border-border bg-white/70 px-7 text-base font-semibold backdrop-blur transition hover:bg-white">Paket Haji</Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-black/10 pt-6">
            {stats.map((s) => <div key={s.l}><dt className="sr-only">{s.l}</dt><dd className="text-3xl font-bold tracking-tight">{s.v}</dd><p className="mt-0.5 text-xs text-muted">{s.l}</p></div>)}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden={!spot}>
          <div className="relative aspect-[5/6] overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-30px_rgba(74,43,28,.6)] sm:aspect-[4/4.4]">
            <Scene id="kaaba" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          </div>
          <div aria-hidden className="animate-floaty absolute -left-4 top-10 hidden h-36 w-32 overflow-hidden rounded-3xl border-4 border-white shadow-xl sm:block" style={{ ['--r' as string]: '-6deg' }}><Scene id="nabawi" /></div>
          <div className="animate-floaty glass absolute -right-2 top-8 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg" style={{ ['--r' as string]: '3deg' }}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />4,9 <span className="font-normal text-muted">rating (simulasi)</span>
          </div>
          {spot && (
            <Link to={`/paket/${spot.slug}`} className="glass group absolute inset-x-4 -bottom-8 flex items-center justify-between gap-4 rounded-3xl p-4 shadow-2xl transition hover:-translate-y-1 sm:inset-x-8">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5" />Paling diminati</p>
                <p className="truncate text-lg font-bold">{spot.name}</p>
                <p className="text-sm text-muted">mulai <b className="text-text">{formatRupiah(minPrice(spot))}</b> · sisa {totalSeatsLeft(spot)} seat</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white transition group-hover:bg-accent"><ArrowUpRight className="h-5 w-5" /></span>
            </Link>
          )}
          <div className="glass absolute -left-3 bottom-24 hidden items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold shadow-lg sm:flex"><ShieldCheck className="h-4 w-4 text-primary" />Muthawif berpengalaman</div>
        </div>
      </div>
    </section>
  )
}
