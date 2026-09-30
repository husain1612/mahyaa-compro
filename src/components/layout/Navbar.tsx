import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Shield, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/Logo'
import { useAuth } from '@/store/authStore'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const links = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/umrah', label: 'Umrah' },
  { to: '/haji', label: 'Haji' },
  { to: '/tentang', label: 'Tentang Kami' },
  { to: '/kontak', label: 'Kontak' },
]

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

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-text hover:bg-black/5')

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              {session.user.role === 'admin'
                ? <Button asChild variant="outline" size="sm"><Link to="/admin"><Shield className="h-4 w-4" />Admin</Link></Button>
                : <Button asChild variant="outline" size="sm"><Link to="/dashboard"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>}
              <Button variant="ghost" size="sm" onClick={doLogout}><LogOut className="h-4 w-4" />Keluar</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/masuk">Masuk</Link></Button>
              <Button asChild size="sm"><Link to="/daftar">Daftar</Link></Button>
            </>
          )}
        </div>
        <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="animate-fade-up border-t border-border bg-surface px-4 pb-4 lg:hidden">
          <nav className="flex flex-col py-2" aria-label="Navigasi seluler">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} onClick={close} className={linkCls}>{l.label}</NavLink>)}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {session ? (
              <>
                <p className="flex items-center gap-2 px-1 text-sm text-muted"><User className="h-4 w-4" />{session.user.name}</p>
                <Button asChild variant="outline" onClick={close}><Link to={session.user.role === 'admin' ? '/admin' : '/dashboard'}>{session.user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link></Button>
                <Button variant="ghost" onClick={doLogout}>Keluar</Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" onClick={close}><Link to="/masuk">Masuk</Link></Button>
                <Button asChild onClick={close}><Link to="/daftar">Daftar</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
