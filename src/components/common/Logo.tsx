import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { cn } from '@/utils/cn'

/** Logo resmi Mahyaa Tour & Travel (src/assets/logo.png). Varian `light` = putih untuk latar gelap. */
export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('inline-flex items-center', className)} aria-label="Mahyaa Tour & Travel — Beranda">
      <img src={logo} alt="Mahyaa Tour & Travel" width={1258} height={309} className={cn('h-10 w-auto', light && 'brightness-0 invert')} />
    </Link>
  )
}
