import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, Input, Textarea } from '@/components/ui/form'
import { EmptyState, PageHeader } from '@/components/common/states'
import { Section } from '@/components/common/Section'
import { Scene } from '@/components/common/Scene'
import { WHATSAPP_NUMBER, waLink } from '@/utils/format'

export function AboutPage() {
  return (
    <>
      <PageHeader title="Tentang Mahyaa Tour" subtitle="Menemani perjalanan ibadah Anda dengan amanah dan profesional." />
      <Section title="Visi & Layanan">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-3 text-muted">
            <p>Mahyaa Tour & Travel adalah penyelenggara perjalanan umrah dan haji yang berfokus pada kenyamanan jemaah, ketepatan jadwal, dan bimbingan ibadah sesuai sunnah.</p>
            <p>Halaman ini memakai teks contoh (dummy). Ganti dengan profil resmi perusahaan, nomor izin PPIU/PIHK, dan legalitas setelah tersedia.</p>
            <ul className="list-disc pl-5"><li>Muthawif berpengalaman</li><li>Hotel dekat Masjidil Haram & Masjid Nabawi</li><li>Harga transparan per tipe kamar</li><li>Layanan pra-keberangkatan hingga kepulangan</li></ul>
            <Button asChild><Link to="/umrah">Lihat Paket</Link></Button>
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-xl"><Scene id="nabawi" /></div>
        </div>
      </Section>
    </>
  )
}

const contactSchema = z.object({ name: z.string().min(3, 'Nama minimal 3 karakter'), email: z.string().pipe(z.email('Email tidak valid')), message: z.string().min(10, 'Pesan minimal 10 karakter') })

export function ContactPage() {
  const f = useForm<z.infer<typeof contactSchema>>({ resolver: zodResolver(contactSchema), defaultValues: { name: '', email: '', message: '' } })
  const submit = f.handleSubmit(async () => { await new Promise((r) => setTimeout(r, 500)); toast.success('Pesan terkirim (simulasi). Tim kami akan menghubungi Anda.'); f.reset() })
  return (
    <>
      <PageHeader title="Hubungi Kami" subtitle="Tanyakan paket, jadwal, atau persyaratan. Kontak di bawah adalah dummy." />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card><CardContent className="space-y-3 text-sm">
            <p className="flex gap-3"><MapPin className="h-5 w-5 text-primary" />Jl. Contoh Raya No. 1, Jakarta (dummy)</p>
            <p className="flex gap-3"><Phone className="h-5 w-5 text-primary" />+{WHATSAPP_NUMBER} (dummy)</p>
            <p className="flex gap-3"><Mail className="h-5 w-5 text-primary" />halo@mahyaa.example</p>
          </CardContent></Card>
          <Button asChild size="lg" variant="accent" className="w-full"><a href={waLink()} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5" />Chat via WhatsApp</a></Button>
        </div>
        <Card><CardContent>
          <form className="space-y-4" noValidate onSubmit={submit}>
            <Field label="Nama" htmlFor="c-name" error={f.formState.errors.name?.message}><Input id="c-name" {...f.register('name')} /></Field>
            <Field label="Email" htmlFor="c-email" error={f.formState.errors.email?.message}><Input id="c-email" type="email" {...f.register('email')} /></Field>
            <Field label="Pesan" htmlFor="c-msg" error={f.formState.errors.message?.message}><Textarea id="c-msg" {...f.register('message')} /></Field>
            <Button type="submit" loading={f.formState.isSubmitting} className="w-full">Kirim Pesan</Button>
          </form>
        </CardContent></Card>
      </div>
    </>
  )
}

export function NotFoundPage() {
  return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Halaman tidak ditemukan" description="Alamat yang Anda tuju tidak tersedia." action={<Button asChild><Link to="/">Kembali ke Beranda</Link></Button>} /></div>
}
