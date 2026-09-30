import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, BookOpenCheck, CalendarCheck, CreditCard, FileCheck2, HeartHandshake, MessageCircle, Plane, Quote, ShieldCheck, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Select } from '@/components/ui/form'
import { Scene } from '@/components/common/Scene'
import { Section } from '@/components/common/Section'
import { FaqAccordion } from '@/components/common/FaqAccordion'
import { CardGridSkeleton, DemoBanner, ErrorState } from '@/components/common/states'
import { PackageGrid } from '@/components/package/PackageGrid'
import { MONTH_OPTIONS } from '@/components/package/PackageFilter'
import { packageService, filterPackages } from '@/services/packageService'
import { AIRPORTS } from '@/data/packages'
import { testimonials } from '@/data/testimonials'
import { faqs } from '@/data/faqs'
import { monthLabel, waLink } from '@/utils/format'

const advantages = [
  { icon: ShieldCheck, title: 'Berizin & Terpercaya', text: 'Operasional mengikuti regulasi penyelenggara perjalanan ibadah (informasi simulasi).' },
  { icon: HeartHandshake, title: 'Pendampingan Muthawif', text: 'Dibimbing muthawif berpengalaman berbahasa Indonesia dari manasik hingga pulang.' },
  { icon: BadgeCheck, title: 'Harga Transparan', text: 'Harga per jenis kamar jelas, tanpa biaya tersembunyi. DP fleksibel.' },
  { icon: Users, title: 'Grup Kecil Nyaman', text: 'Kuota terbatas per keberangkatan agar ibadah lebih khusyuk.' },
]
const steps = [
  { icon: BookOpenCheck, title: 'Pilih Paket', text: 'Bandingkan paket, hotel, dan jadwal.' },
  { icon: CreditCard, title: 'Booking & DP', text: 'Isi data jemaah dan bayar DP untuk mengunci kursi.' },
  { icon: FileCheck2, title: 'Lengkapi Dokumen', text: 'Unggah paspor, KTP, KK, dan foto melalui dashboard.' },
  { icon: CalendarCheck, title: 'Manasik & Pelunasan', text: 'Ikuti manasik dan lunasi sebelum H-30.' },
  { icon: Plane, title: 'Berangkat', text: 'Berkumpul di bandara dan mulai perjalanan suci.' },
]

export default function HomePage() {
  const nav = useNavigate()
  const [type, setType] = useState('umrah')
  const [month, setMonth] = useState('')
  const [airport, setAirport] = useState('')
  const all = useQuery({ queryKey: ['packages', 'all'], queryFn: packageService.listAll })

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (month) p.set('month', month)
    if (airport) p.set('airport', airport)
    nav(`/${type}${p.toString() ? `?${p}` : ''}`)
  }

  const pkgs = all.data ?? []
  const featured = pkgs.filter((p) => p.featured).slice(0, 3)
  const reguler = filterPackages(pkgs, { type: 'umrah', category: 'reguler', sort: 'popular' }).slice(0, 3)
  const premium = filterPackages(pkgs, { type: 'umrah', category: 'premium', sort: 'popular' }).slice(0, 3)
  const haji = filterPackages(pkgs, { type: 'haji', sort: 'popular' }).slice(0, 3)

  const block = (title: string, subtitle: string, list: typeof pkgs, to: string, id?: string) => (
    <Section id={id} title={title} subtitle={subtitle} action={<Button asChild variant="outline"><Link to={to}>Lihat semua</Link></Button>}>
      {all.isLoading ? <CardGridSkeleton count={3} /> : <PackageGrid packages={list} />}
    </Section>
  )

  return (
    <>
      <div className="relative isolate overflow-hidden bg-secondary text-white">
        <div className="absolute inset-0 -z-10 opacity-60"><Scene id="kaaba" /></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">UMRAH & HAJI · MAHYAA TOUR & TRAVEL</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">Wujudkan Perjalanan Suci ke Baitullah dengan Nyaman & Tenang</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">Paket umrah dan haji dengan bimbingan ibadah, hotel dekat Masjid, dan pemesanan yang mudah.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg"><Link to="/umrah">Lihat Paket Umrah</Link></Button>
            <Button asChild variant="light" size="lg"><Link to="/haji">Paket Haji</Link></Button>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-12 max-w-5xl px-4 sm:px-6">
        <form onSubmit={search} aria-label="Cari paket" className="grid gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xl sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <Field label="Jenis perjalanan" htmlFor="h-type"><Select id="h-type" value={type} onChange={(e) => setType(e.target.value)}><option value="umrah">Umrah</option><option value="haji">Haji</option></Select></Field>
          <Field label="Bulan keberangkatan" htmlFor="h-month"><Select id="h-month" value={month} onChange={(e) => setMonth(e.target.value)}><option value="">Semua bulan</option>{MONTH_OPTIONS.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</Select></Field>
          <Field label="Bandara" htmlFor="h-airport"><Select id="h-airport" value={airport} onChange={(e) => setAirport(e.target.value)}><option value="">Semua bandara</option>{AIRPORTS.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</Select></Field>
          <Button type="submit" size="lg" variant="accent">Cari Paket</Button>
        </form>
        <DemoBanner className="mt-3" />
      </div>

      {all.isError ? <div className="mx-auto max-w-7xl px-4 py-12"><ErrorState message="Gagal memuat paket." onRetry={() => all.refetch()} /></div> : (
        <>
          {block('Paket Unggulan', 'Paket paling diminati jemaah Mahyaa Tour.', featured, '/umrah')}
          {block('Umrah Reguler', 'Ibadah khusyuk dengan harga terjangkau.', reguler, '/umrah?category=reguler')}
          {block('Umrah Premium', 'Hotel lebih dekat dan penerbangan langsung.', premium, '/umrah?category=premium')}
          {block('Paket Haji', 'Program haji dengan pendampingan penuh (simulasi).', haji, '/haji')}
        </>
      )}

      <div className="bg-primary/5">
        <Section title="Mengapa Mahyaa Tour" subtitle="Kenyamanan dan ketenangan ibadah adalah prioritas kami.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div key={a.title} className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary"><a.icon className="h-6 w-6" /></div>
                <h3 className="font-sans text-base font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted">{a.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Proses Keberangkatan" subtitle="Lima langkah sederhana dari pendaftaran hingga berangkat.">
        <ol className="grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-xl border border-border bg-surface p-5">
              <span className="absolute -top-3 left-4 grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{i + 1}</span>
              <s.icon className="mb-2 h-6 w-6 text-primary" />
              <h3 className="font-sans text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="bg-secondary text-white">
        <Section title="Kata Jemaah" subtitle="Testimoni simulasi untuk keperluan demo." className="[&_p]:text-white/80 [&_h2]:text-white">
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 6).map((t) => (
              <figure key={t.id} className="rounded-xl bg-white/8 p-5 ring-1 ring-white/15">
                <Quote className="mb-2 h-6 w-6 text-accent" />
                <blockquote className="text-sm">{t.text}</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-white">{t.name}</span> · {t.city}
                  <span className="mt-1 flex items-center gap-0.5 text-accent" aria-label={`Rating ${t.rating} dari 5`}>{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
                  <span className="text-xs text-white/60">{t.packageName}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      </div>

      <Section id="faq" title="Pertanyaan Umum" subtitle="Jawaban singkat untuk pertanyaan yang sering diajukan."><FaqAccordion items={faqs} /></Section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:flex-row sm:text-left">
          <div><h2 className="text-2xl font-bold">Butuh bantuan memilih paket?</h2><p className="mt-1 text-white/80">Konsultasi gratis dengan tim kami via WhatsApp (nomor dummy).</p></div>
          <Button asChild variant="accent" size="lg"><a href={waLink()} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5" />Chat WhatsApp</a></Button>
        </div>
      </div>
    </>
  )
}
