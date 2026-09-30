import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

export const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-black/8', className)} aria-hidden />
)

export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div role="status" aria-label="Memuat" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-3xl border border-border bg-surface">
        <LoadingSkeleton className="h-44 rounded-none" />
        <div className="space-y-3 p-4"><LoadingSkeleton className="h-5 w-3/4" /><LoadingSkeleton className="h-4 w-1/2" /><LoadingSkeleton className="h-10 w-full" /></div>
      </div>
    ))}
  </div>
)

export const PageLoader = ({ label = 'Memuat…' }: { label?: string }) => (
  <div role="status" className="flex min-h-[40vh] items-center justify-center gap-2 text-muted"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>
)

export const EmptyState = ({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">{icon ?? <Inbox className="h-6 w-6" />}</div>
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const ErrorState = ({ title = 'Terjadi kesalahan', message, onRetry, action }: { title?: string; message?: string; onRetry?: () => void; action?: ReactNode }) => (
  <div role="alert" className="flex flex-col items-center rounded-3xl border border-danger/30 bg-danger/5 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-danger/10 p-3 text-danger"><AlertTriangle className="h-6 w-6" /></div>
    <h3 className="text-lg font-semibold">{title}</h3>
    {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
    <div className="mt-4 flex gap-2">{onRetry && <Button variant="outline" onClick={onRetry}>Coba lagi</Button>}{action}</div>
  </div>
)

export function ConfirmationDialog({ open, onOpenChange, title, description, confirmLabel = 'Ya, lanjutkan', danger, loading, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel?: string; danger?: boolean; loading?: boolean; onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} description={description}>
        <div className="flex justify-end gap-2">
          <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
          <Button variant={danger ? 'danger' : 'default'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const DemoBanner = ({ className }: { className?: string }) => (
  <p className={cn('rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-medium text-primary', className)}>
    DEMO — Data & transaksi pada situs ini adalah simulasi frontend, bukan pemesanan aktual.
  </p>
)

export const PageHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) => (
  <div className="mx-3 mt-3 overflow-hidden rounded-[2rem] bg-secondary pattern-islamic text-white sm:mx-4">
    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/40 blur-3xl" />
      <h1 className="relative text-3xl font-extrabold sm:text-5xl">{title}</h1>
      {subtitle && <p className="relative mt-3 max-w-2xl text-white/80">{subtitle}</p>}
      {children}
    </div>
  </div>
)
