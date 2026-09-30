import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, BookOpenCheck, CalendarCheck, CreditCard, FileCheck2, HeartHandshake, MessageCircle, Plane, Quote, ShieldCheck, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/common/Section'
import { FaqAccordion } from '@/components/common/FaqAccordion'
import { CardGridSkeleton, DemoBanner, ErrorState } from '@/components/common/states'
import { PackageGrid } from '@/components/package/PackageGrid'
import { PromoCarousel } from '@/components/home/PromoCarousel'
import { HeroSearch } from '@/components/home/HeroSearch'
import { AirportList, SeatAvailability } from '@/components/home/SeatAvailability'
import { packageService, filterPackages } from '@/services/packageService'
import { bookingService } from '@/services/bookingService'
import { testimonials } from '@/data/testimonials'
import { faqs } from '@/data/faqs'
import { formatRupiah, waLink } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { PackageCategory } from '@/types'

const advantages = [
  { icon: ShieldCheck, title: 'Berizin & Terpercaya', text: 'Operasional mengikuti regulasi penyelenggara perjalanan ibadah (informasi simulasi).', cls: 'bg-primary text-white' },
  { icon: HeartHandshake, title: 'Pendampingan Muthawif', text: 'Dibimbing muthawif berbahasa Indonesia dari manasik hingga pulang.', cls: 'bg-surface' },
  { icon: BadgeCheck, title: 'Harga Transparan', text: 'Harga per tipe kamar jelas, tanpa biaya tersembunyi. DP fleksibel.', cls: 'bg-accent/15' },
  { icon: Users, title: 'Grup Kecil Nyaman', text: 'Kuota terbatas per keberangkatan agar ibadah lebih khusyuk.', cls: 'bg-secondary text-white' },
]
const steps = [
  { icon: BookOpenCheck, title: 'Pilih Paket', text: 'Bandingkan paket, hotel, dan jadwal.' },
  { icon: CreditCard, title: 'Booking & DP', text: 'Isi data jemaah dan bayar DP untuk mengunci kursi.' },
  { icon: FileCheck2, title: 'Lengkapi Dokumen', text: 'Paspor, KTP, KK, dan foto lewat dashboard.' },
  { icon: CalendarCheck, title: 'Manasik & Pelunasan', text: 'Ikuti manasik dan lunasi sebelum H-30.' },
  { icon: Plane, title: 'Berangkat', text: 'Berkumpul di bandara dan mulai perjalanan suci.' },
]
const CATS: { id: '' | PackageCategory; label: string }[] = [{ id: '', label: 'Semua' }, { id: 'reguler', label: 'Reguler' }, { id: 'premium', label: 'Premium' }, { id: 'plus', label: 'Umrah Plus' }]

export default function HomePage() {
  const [cat, setCat] = useState<'' | PackageCategory>('')
  const all = useQuery({ queryKey: ['packages', 'all'], queryFn: packageService.listAll })
  const promos = useQuery({ queryKey: ['promos', 'active'], queryFn: bookingService.listActivePromos })

  const pkgs = all.data ?? []
  const featured = pkgs.filter((p) => p.featured).slice(0, 4)
  const umrah = filterPackages(pkgs, { type: 'umrah', category: cat, sort: 'popular' }).slice(0, 6)
  const haji = filterPackages(pkgs, { type: 'haji', sort: 'popular' }).slice(0, 3)
  const umrahAll = pkgs.filter((p) => p.type === 'umrah')

  return (
    <>
      {all.isLoading ? <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6"><div className="h-[22rem] animate-pulse rounded-[1.75rem] bg-black/8" /></div> : <PromoCarousel packages={featured} />}

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Haji & Umrah<br /><span className="text-accent">bareng MAHYAA</span></h1>
          <p className="mt-6 max-w-md text-muted">Mahyaa Tour & Travel menemani perjalanan ibadah Anda — dari memilih paket, booking, bayar DP, sampai manasik dan kepulangan. Bisa juga untuk keluarga besar atau komunitas.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/umrah">Pilih Umrah Sekarang</Link></Button><Button asChild size="lg" variant="outline"><Link to="/haji">Lihat Paket Haji</Link></Button></div>
          <DemoBanner className="mt-6 max-w-md" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(promos.data ?? []).slice(0, 2).map((p, idx) => (
            <Link key={p.id} to="/umrah" className={cn('flex min-h-64 flex-col justify-between rounded-[1.75rem] p-5 shadow-lg transition hover:-translate-y-1', idx === 0 ? 'bg-accent text-white' : 'bg-secondary text-white')}>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Promo · kode {p.code}</span>
              <div>
                <p className="text-4xl font-bold leading-none xl:text-5xl">{p.type === 'percent' ? `${p.value}%` : p.value >= 1_000_000 ? `Rp ${String(p.value / 1_000_000).replace('.', ',')} Jt` : formatRupiah(p.value)}</p>
                <p className="mt-2 text-lg font-semibold leading-tight">{p.title}</p>
              </div>
              <span className="text-xs opacity-80">{p.description}</span>
            </Link>
          ))}
          {promos.isLoading && <><div className="min-h-64 animate-pulse rounded-[1.75rem] bg-black/8" /><div className="min-h-64 animate-pulse rounded-[1.75rem] bg-black/8" /></>}
        </div>
      </section>

      <HeroSearch />

      <Section title="Layanan Paket Umrah" subtitle="Beragam paket umrah dengan layanan terbaik untuk perjalanan yang nyaman dan khusyuk." className="pt-20">
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
          <div><h3 className="text-2xl font-semibold">Bandara Keberangkatan</h3><p className="mb-6 mt-2 text-muted">Kemudahan dari bandara terdekat di kota Anda.</p><AirportList packages={umrahAll} /></div>
          <div className="min-w-0"><h3 className="text-2xl font-semibold">Ketersediaan Seat Umrah</h3><p className="mb-6 mt-2 text-muted">Seat bergerak setiap hari. Amankan seat dari sekarang agar niat baik tidak tertunda.</p>
            {all.isLoading ? <div className="h-56 animate-pulse rounded-2xl bg-black/8" /> : <SeatAvailability packages={umrahAll} />}</div>
        </div>
      </Section>

      <Section id="paket" title="Pilihan Paket Umrah" subtitle="Beragam paket umrah dengan layanan terbaik untuk perjalanan yang nyaman dan khusyuk." action={<Button asChild variant="outline"><Link to="/umrah">Lihat semua</Link></Button>} className="pt-4">
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Kategori umrah">
          {CATS.map((c) => <button key={c.label} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={cn('cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition', cat === c.id ? 'border-primary bg-primary text-white' : 'border-border bg-surface hover:border-primary')}>{c.label}</button>)}
        </div>
        {all.isError ? <ErrorState message="Gagal memuat paket." onRetry={() => all.refetch()} /> : all.isLoading ? <CardGridSkeleton count={3} /> : <PackageGrid packages={umrah} />}
      </Section>

      <Section title="Pilihan Paket Haji" subtitle="Program haji dengan pendampingan penuh (simulasi)." action={<Button asChild variant="outline"><Link to="/haji">Lihat semua</Link></Button>}>
        {all.isLoading ? <CardGridSkeleton count={3} /> : <PackageGrid packages={haji} />}
      </Section>

      <Section title="Mengapa Mahyaa Tour" subtitle="Kenyamanan dan ketenangan ibadah adalah prioritas kami.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((a) => (
            <div key={a.title} className={cn('rounded-[1.75rem] border border-border p-6', a.cls)}>
              <div className="mb-4 inline-flex rounded-full bg-black/10 p-3"><a.icon className="h-6 w-6" /></div>
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm opacity-80">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Proses Keberangkatan" subtitle="Lima langkah sederhana dari pendaftaran hingga berangkat.">
        <ol className="grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-[1.75rem] border border-border bg-surface p-5">
              <span className="absolute -top-3 left-5 grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-semibold text-white">{i + 1}</span>
              <s.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="mx-3 rounded-[2rem] bg-secondary pattern-islamic text-white sm:mx-4">
        <Section title="Kata Jemaah" subtitle="Testimoni simulasi untuk keperluan demo." className="[&_p]:text-white/80">
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
            {testimonials.map((t) => (
              <figure key={t.id} className="w-80 shrink-0 snap-start rounded-3xl bg-white/10 p-6 ring-1 ring-white/15">
                <Quote className="mb-2 h-6 w-6 text-accent" />
                <blockquote className="text-sm">{t.text}</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-white">{t.name}</span> · {t.city}
                  <span className="mt-1 flex items-center gap-0.5 text-yellow-300" aria-label={`Rating ${t.rating} dari 5`}>{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
                  <span className="text-xs text-white/60">{t.packageName}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      </div>

      <Section id="faq" title="Pertanyaan Umum" subtitle="Jawaban singkat untuk pertanyaan yang sering diajukan."><FaqAccordion items={faqs} /></Section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-[2rem] bg-primary p-8 text-center text-white sm:flex-row sm:text-left">
          <div><h2 className="text-2xl font-semibold">Butuh bantuan memilih paket?</h2><p className="mt-1 text-white/80">Konsultasi gratis dengan tim kami via WhatsApp (nomor dummy).</p></div>
          <Button asChild variant="accent" size="lg"><a href={waLink()} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5" />Chat WhatsApp</a></Button>
        </div>
      </div>
    </>
  )
}
