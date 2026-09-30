import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * Logo PLACEHOLDER. Ganti dengan aset logo resmi (mis. src/assets/logo.svg) setelah tersedia.
 */
export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2', className)} aria-label="Mahyaa Tour & Travel — Beranda">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-accent" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 14.4 7 17.2l1.2-5.6L4 7.8l5.6-.6z" /></svg>
      </span>
      <span className={cn('leading-tight', light ? 'text-white' : 'text-text')}>
        <span className="block font-serif text-lg font-bold">Mahyaa Tour</span>
        <span className={cn('block text-[10px] uppercase tracking-widest', light ? 'text-white/70' : 'text-muted')}>& Travel</span>
      </span>
    </Link>
  )
}
