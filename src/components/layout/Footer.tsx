import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { WHATSAPP_NUMBER, waLink } from '@/utils/format'

export function Footer() {
  return (
    <footer className="no-print mx-3 mb-3 mt-16 overflow-hidden rounded-[2rem] bg-secondary text-white/85 sm:mx-4">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-md text-sm text-white/70">Penyelenggara perjalanan umrah dan haji yang mengutamakan kenyamanan, ketepatan jadwal, dan bimbingan ibadah. Situs ini adalah versi demo frontend; seluruh data adalah simulasi.</p>
        </div>
        <div>
          <h4 className="mb-3 font-sans text-sm font-semibold text-white">Tautan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-accent" to="/umrah">Paket Umrah</Link></li>
            <li><Link className="hover:text-accent" to="/haji">Paket Haji</Link></li>
            <li><Link className="hover:text-accent" to="/tentang">Tentang Kami</Link></li>
            <li><Link className="hover:text-accent" to="/kontak">Kontak</Link></li>
            <li><Link className="hover:text-accent" to="/dashboard">Dashboard Jemaah</Link></li>
            <li><Link className="hover:text-accent" to="/admin">Admin (Demo)</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-sans text-sm font-semibold text-white">Kontak (dummy)</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />Jl. Contoh Raya No. 1, Jakarta</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /><a className="hover:text-accent" href={waLink()} target="_blank" rel="noreferrer">+{WHATSAPP_NUMBER}</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" />halo@mahyaa.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">© {new Date().getFullYear()} Mahyaa Tour & Travel — Situs demo, bukan layanan pemesanan aktual.</div>
    </footer>
  )
}
