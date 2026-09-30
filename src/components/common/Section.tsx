import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export const Section = ({ id, title, subtitle, children, className, action, eyebrow, dark }: { dark?: boolean; id?: string; title: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode; eyebrow?: string }) => (
  <section id={id} className={cn('mx-auto max-w-7xl px-4 py-14 sm:px-6', className)}>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <span className={cn('mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider', dark ? 'bg-white/10 text-white' : 'bg-accent/15 text-primary')}>{eyebrow}</span>}
        <h2 className={cn('text-3xl font-bold sm:text-5xl', dark && 'text-white')}>{title}</h2>
        {subtitle && <p className={cn('mt-2 max-w-2xl', dark ? 'text-white/70' : 'text-muted')}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
)
