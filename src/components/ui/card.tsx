import * as React from 'react'
import { cn } from '@/utils/cn'

export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-3xl border border-border bg-surface shadow-[0_2px_20px_-8px_rgba(74,43,28,.18)]', className)} {...p} />
)
export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('p-5 pb-0', className)} {...p} />
export const CardContent = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('p-5', className)} {...p} />
export const CardTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('text-lg font-semibold', className)} {...p} />
