import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badge = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    tone: {
      neutral: 'bg-black/5 text-text',
      primary: 'bg-primary/10 text-primary',
      accent: 'bg-accent/20 text-accent-foreground',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
      info: 'bg-info/10 text-info',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export const Badge = ({ className, tone, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) => (
  <span className={cn(badge({ tone }), className)} {...p} />
)
