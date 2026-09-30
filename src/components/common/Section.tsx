import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export const Section = ({ id, title, subtitle, children, className, action }: { id?: string; title: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode }) => (
  <section id={id} className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6', className)}>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
        <div className="mt-3 h-1 w-14 rounded bg-accent" />
      </div>
      {action}
    </div>
    {children}
  </section>
)
