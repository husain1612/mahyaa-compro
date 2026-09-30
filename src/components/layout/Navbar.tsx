import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Menu, Shield, UserRound, X } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
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
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const close = () => setOpen(false)

  const doLogout = async () => {
    await logout()
    close()
    toast.success('Anda telah keluar.')
    navigate('/')
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
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
        <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="animate-fade-up max-h-[80vh] overflow-y-auto bg-surface px-4 pb-4 text-text lg:hidden">
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
              <>
                <Link onClick={close} to="/masuk" className="rounded-full bg-primary py-2.5 text-center font-semibold text-white">Masuk</Link>
                <Link onClick={close} to="/daftar" className="rounded-full border border-border py-2.5 text-center font-semibold">Daftar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
