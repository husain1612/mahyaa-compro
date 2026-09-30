import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Memunculkan konten dengan transisi halus saat masuk viewport (menghormati prefers-reduced-motion via CSS). */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { el.classList.add('in'); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={cn('reveal', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>
}
