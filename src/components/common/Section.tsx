import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export const Section = ({ id, title, subtitle, children, className, action, eyebrow }: { id?: string; title: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode; eyebrow?: string }) => (
  <section id={id} className={cn('mx-auto max-w-7xl px-4 py-14 sm:px-6', className)}>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <span className="mb-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</span>}
        <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
)
