import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Search, Shield, UserRound, X } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { HeroSearch } from '@/components/home/HeroSearch'
import { useAuth } from '@/store/authStore'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

interface Item { to: string; label: string }
const menus: { label: string; items: Item[] }[] = [
  { label: 'Umrah', items: [{ to: '/umrah', label: 'Semua Paket Umrah' }, { to: '/umrah?category=reguler', label: 'Umrah Reguler' }, { to: '/umrah?category=premium', label: 'Umrah Premium' }, { to: '/umrah?category=plus', label: 'Umrah Plus' }] },
  { label: 'Haji', items: [{ to: '/haji', label: 'Semua Paket Haji' }, { to: '/haji?category=haji-plus', label: 'Haji Plus' }, { to: '/haji?category=haji-khusus', label: 'Haji Khusus' }] },
  { label: 'Tentang Kami', items: [{ to: '/tentang', label: 'Profil Mahyaa' }, { to: '/kontak', label: 'Kontak' }, { to: '/#faq', label: 'Pertanyaan Umum' }] },
]

function Dropdown({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-text hover:bg-primary/10" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label}<ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="menu" className="animate-fade-up absolute left-0 top-full z-50 w-56 pt-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-xl">
            {items.map((i) => <Link key={i.label} role="menuitem" to={i.to} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-text hover:bg-primary/10 hover:text-primary">{i.label}</Link>)}
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const close = () => setOpen(false)
  useEffect(() => { setOpen(false); setSearchOpen(false) }, [pathname])

  const doLogout = async () => {
    await logout()
    close()
    toast.success('Anda telah keluar.')
    navigate('/')
  }

  return (
    <header className="no-print pattern-islamic sticky top-0 z-40 bg-primary lg:border-b lg:border-black/5 lg:bg-white/90 lg:backdrop-blur-xl lg:supports-[backdrop-filter]:bg-white/80 lg:[background-image:none]">
      {/* Mobile: bar berwarna dengan kolom pencarian + tombol logo (menu) */}
      <div className="flex items-center gap-3 px-3 py-3 lg:hidden">
        <button onClick={() => setSearchOpen(true)} className="flex h-14 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full border border-white/60 px-4 text-left text-white transition active:bg-white/10">
          <Search className="h-6 w-6 shrink-0" aria-hidden />
          <span className="min-w-0"><span className="block truncate text-[15px] font-semibold leading-tight">Mau berangkat dari mana?</span><span className="block truncate text-sm text-white/80">Cari Bandara & Keberangkatan</span></span>
        </button>
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-menu" className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center rounded-full border border-white/60 bg-white/10 transition active:scale-95">
          {open ? <X className="h-6 w-6 text-white" /> : <img src="/favicon.png" alt="" className="h-8 w-8 brightness-0 invert" />}
        </button>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden h-[4.25rem] max-w-7xl items-center justify-between px-6 lg:flex">
        <Logo />
        <nav className="flex items-center gap-1" aria-label="Navigasi utama">
          <Link to="/umrah?category=plus" className="mr-1 flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">Umrah Plus<span className="h-2 w-2 rounded-full bg-red-500" aria-hidden /></Link>
          {menus.map((m) => <Dropdown key={m.label} {...m} />)}
          {session ? (
            <>
              <Link to={session.user.role === 'admin' ? '/admin' : '/dashboard'} className="ml-2 flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary">{session.user.role === 'admin' ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}{session.user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
              <button onClick={doLogout} className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm hover:bg-primary/10"><LogOut className="h-4 w-4" />Keluar</button>
            </>
          ) : (
            <>
              <NavLink to="/daftar" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-primary/10">Daftar</NavLink>
              <Link to="/masuk" className="ml-1 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary hover:shadow-md">Masuk</Link>
            </>
          )}
        </nav>
      </div>

      {open && (
        <div id="mobile-menu" className="animate-fade-up max-h-[75vh] overflow-y-auto rounded-b-3xl bg-surface px-4 pb-5 text-text shadow-xl lg:hidden">
          <nav className="py-2" aria-label="Navigasi seluler">
            <NavLink to="/" end onClick={close} className="block rounded-xl px-3 py-2.5 font-medium hover:bg-primary/10">Beranda</NavLink>
            {menus.map((m) => (
              <div key={m.label} className="py-1">
                <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">{m.label}</p>
                {m.items.map((i) => <Link key={i.label} to={i.to} onClick={close} className="block rounded-xl px-3 py-2 text-sm hover:bg-primary/10">{i.label}</Link>)}
              </div>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {session ? (
              <>
                <p className="flex items-center gap-2 px-1 text-sm text-muted"><UserRound className="h-4 w-4" />{session.user.name}</p>
                <Link onClick={close} to={session.user.role === 'admin' ? '/admin' : '/dashboard'} className="rounded-full border border-border py-2.5 text-center font-semibold">{session.user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
                <button onClick={doLogout} className="rounded-full py-2.5 font-semibold text-danger">Keluar</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link onClick={close} to="/masuk" className="rounded-full bg-primary py-2.5 text-center font-semibold text-white">Masuk</Link>
                <Link onClick={close} to="/daftar" className="rounded-full border border-border py-2.5 text-center font-semibold">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent title="Mau berangkat dari mana?" description="Cari paket berdasarkan bandara dan bulan keberangkatan" className="left-0 top-auto bottom-0 w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-[2rem] pb-8">
          <HeroSearch embedded onSubmitted={() => setSearchOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  )
}
