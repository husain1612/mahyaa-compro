import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowRight, BadgeCheck, BookOpenCheck, CalendarCheck, Check, Copy, CreditCard, FileCheck2, HeartHandshake, MessageCircle, Plane, Quote, ShieldCheck, Star, Tag, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/common/Section'
import { Reveal } from '@/components/common/Reveal'
import { FaqAccordion } from '@/components/common/FaqAccordion'
import { CardGridSkeleton, DemoBanner, ErrorState } from '@/components/common/states'
import { PackageGrid } from '@/components/package/PackageGrid'
import { Hero } from '@/components/home/Hero'
import { PromoCarousel } from '@/components/home/PromoCarousel'
import { HeroSearch } from '@/components/home/HeroSearch'
import { AirportList, SeatAvailability } from '@/components/home/SeatAvailability'
import { packageService, filterPackages } from '@/services/packageService'
import { bookingService } from '@/services/bookingService'
import { testimonials } from '@/data/testimonials'
import { faqs } from '@/data/faqs'
import { formatDateShort, waLink } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { PackageCategory } from '@/types'

const steps = [
  { icon: BookOpenCheck, title: 'Pilih Paket', text: 'Bandingkan paket, hotel, dan jadwal.' },
  { icon: CreditCard, title: 'Booking & DP', text: 'Isi data jemaah dan bayar DP untuk mengunci seat.' },
  { icon: FileCheck2, title: 'Lengkapi Dokumen', text: 'Paspor, KTP, KK, dan foto lewat dashboard.' },
  { icon: CalendarCheck, title: 'Manasik & Pelunasan', text: 'Ikuti manasik dan lunasi sebelum H-30.' },
  { icon: Plane, title: 'Berangkat', text: 'Berkumpul di bandara dan mulai perjalanan suci.' },
]
const CATS: { id: '' | PackageCategory; label: string }[] = [{ id: '', label: 'Semua' }, { id: 'reguler', label: 'Reguler' }, { id: 'premium', label: 'Premium' }, { id: 'plus', label: 'Umrah Plus' }]

const copy = (code: string) =>
  navigator.clipboard?.writeText(code).then(() => toast.success(`Kode ${code} disalin`)).catch(() => toast.error('Gagal menyalin kode'))

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
      <Hero packages={pkgs} />

      <div className="pt-16"><HeroSearch /></div>

      <Reveal>
        <section aria-label="Promo aktif" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary"><Tag className="h-4 w-4" />Promo aktif <span className="font-normal text-muted">· ketuk untuk menyalin kode, pakai saat checkout</span></div>
          <div className="grid gap-4 md:grid-cols-3">
            {(promos.data ?? []).slice(0, 3).map((p) => (
              <div key={p.id} className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-black/5">
                <div aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/15" />
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-bold text-white">{p.type === 'percent' ? `${p.value}%` : `${(p.value / 1_000_000).toString().replace('.', ',')}jt`}</div>
                <div className="relative min-w-0 flex-1"><p className="truncate font-semibold">{p.title}</p><p className="line-clamp-1 text-xs text-muted">s.d. {formatDateShort(p.validUntil)}</p></div>
                <button onClick={() => copy(p.code)} className="relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-3 py-1.5 font-mono text-xs font-bold text-primary hover:bg-primary/5" aria-label={`Salin kode ${p.code}`}>{p.code}<Copy className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            {promos.isLoading && [0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-black/8" />)}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <Section eyebrow="Ketersediaan" title="Bandara & seat terdekat" subtitle="Seat bergerak setiap hari. Amankan dari sekarang agar niat baik tidak tertunda." className="pt-20">
          <div className="grid gap-12 lg:grid-cols-[21rem_1fr]">
            <div><h3 className="mb-5 text-lg font-semibold">Bandara keberangkatan</h3><AirportList packages={umrahAll} /></div>
            <div className="min-w-0"><h3 className="mb-5 text-lg font-semibold">Keberangkatan terdekat</h3>
              {all.isLoading ? <div className="h-56 animate-pulse rounded-2xl bg-black/8" /> : <SeatAvailability packages={umrahAll} />}</div>
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Section id="paket" eyebrow="Umrah" title="Pilihan paket umrah" subtitle="Dari hemat sampai premium — semua dengan harga transparan per tipe kamar." action={<Button asChild variant="outline"><Link to="/umrah">Lihat semua<ArrowRight className="h-4 w-4" /></Link></Button>} className="pt-4">
          <div className="mb-8 inline-flex flex-wrap gap-1 rounded-full bg-black/5 p-1" role="tablist" aria-label="Kategori umrah">
            {CATS.map((c) => <button key={c.label} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={cn('cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition', cat === c.id ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text')}>{c.label}</button>)}
          </div>
          {all.isError ? <ErrorState message="Gagal memuat paket." onRetry={() => all.refetch()} /> : all.isLoading ? <CardGridSkeleton count={3} /> : <PackageGrid packages={umrah} />}
        </Section>
      </Reveal>

      <Reveal>
        <Section eyebrow="Penawaran pilihan" title="Sorotan minggu ini" subtitle="Paket unggulan dengan data simulasi.">
          {all.isLoading ? <div className="h-96 animate-pulse rounded-[1.75rem] bg-black/8" /> : <div className="-mx-4 sm:-mx-6"><PromoCarousel packages={featured} /></div>}
        </Section>
      </Reveal>

      <Reveal>
        <Section eyebrow="Haji" title="Pilihan paket haji" subtitle="Program haji dengan pendampingan penuh (simulasi)." action={<Button asChild variant="outline"><Link to="/haji">Lihat semua<ArrowRight className="h-4 w-4" /></Link></Button>}>
          {all.isLoading ? <CardGridSkeleton count={3} /> : <PackageGrid packages={haji} />}
        </Section>
      </Reveal>

      <Reveal>
        <Section eyebrow="Kenapa Mahyaa" title="Ibadah tenang, urusan kami">
          <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-8 text-white lg:col-span-2 lg:row-span-2">
              <div aria-hidden className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
              <ShieldCheck className="h-10 w-10 text-accent" />
              <h3 className="mt-6 max-w-sm text-3xl font-bold leading-tight">Berizin, terpercaya, dan transparan.</h3>
              <p className="mt-3 max-w-sm text-white/75">Operasional mengikuti regulasi penyelenggara perjalanan ibadah (informasi simulasi). Semua biaya jelas sebelum Anda membayar.</p>
              <ul className="relative mt-8 space-y-2 text-sm">
                {['Harga per tipe kamar terlihat jelas', 'DP fleksibel mulai 25%', 'Invoice dan riwayat pembayaran di dashboard'].map((t) => <li key={t} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/15"><Check className="h-3 w-3" /></span>{t}</li>)}
              </ul>
            </div>
            {[
              { i: HeartHandshake, t: 'Pendampingan Muthawif', d: 'Dibimbing muthawif berbahasa Indonesia dari manasik hingga pulang.' },
              { i: Users, t: 'Grup Kecil Nyaman', d: 'Kuota terbatas per keberangkatan agar ibadah lebih khusyuk.' },
              { i: BadgeCheck, t: 'Hotel Dekat Masjid', d: 'Pilihan hotel dekat Masjidil Haram dan Masjid Nabawi.' },
              { i: MessageCircle, t: 'Bantuan Cepat', d: 'Chat asisten atau hubungi admin via WhatsApp kapan saja.' },
            ].map((x) => (
              <div key={x.t} className="rounded-[2rem] bg-surface p-6 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><x.i className="h-5 w-5" /></span>
                <h3 className="mt-4 text-base font-bold">{x.t}</h3><p className="mt-1 text-sm text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Section eyebrow="Proses" title="Dari daftar sampai berangkat" subtitle="Lima langkah sederhana." id="proses">
          <ol className="grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-[1.75rem] bg-surface p-5 ring-1 ring-black/5">
                <span className="text-5xl font-extrabold text-primary/10">{String(i + 1).padStart(2, '0')}</span>
                <s.icon className="mb-3 mt-2 h-6 w-6 text-primary" />
                <h3 className="text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      </Reveal>

      <Reveal>
        <div className="mx-3 rounded-[2.5rem] bg-secondary text-white sm:mx-4">
          <Section eyebrow="Testimoni" title="Kata jemaah" subtitle="Testimoni simulasi untuk keperluan demo." dark>
            <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
              {testimonials.map((t) => (
                <figure key={t.id} className="w-80 shrink-0 snap-start rounded-3xl bg-white/8 p-6 ring-1 ring-white/10 backdrop-blur">
                  <Quote className="mb-3 h-6 w-6 text-accent" />
                  <blockquote className="text-sm leading-relaxed text-white/90">{t.text}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-sm">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-accent font-bold text-white">{t.name.replace(/^(Ibu|Bapak) /, '')[0]}</span>
                    <span><span className="block font-semibold text-white">{t.name}</span><span className="flex items-center gap-0.5 text-yellow-300" aria-label={`Rating ${t.rating} dari 5`}>{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</span></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        </div>
      </Reveal>

      <Reveal><Section id="faq" eyebrow="FAQ" title="Pertanyaan umum" subtitle="Jawaban singkat untuk pertanyaan yang sering diajukan."><FaqAccordion items={faqs} /></Section></Reveal>

      <Reveal>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-10 text-white sm:p-14">
            <div aria-hidden className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div><h2 className="text-3xl font-bold sm:text-4xl">Butuh bantuan memilih paket?</h2><p className="mt-2 text-white/75">Konsultasi gratis dengan tim kami via WhatsApp (nomor dummy).</p></div>
              <Button asChild variant="light" size="lg"><a href={waLink()} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5" />Chat WhatsApp</a></Button>
            </div>
          </div>
          <DemoBanner className="mt-6" />
        </div>
      </Reveal>
    </>
  )
}
