import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogContent = ({ className, children, title, description, ...p }: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 animate-fade-up" />
    <DialogPrimitive.Content
      className={cn('fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-surface p-6 shadow-xl', className)}
      {...p}
    >
      <DialogPrimitive.Title className="pr-8 text-lg font-semibold">{title}</DialogPrimitive.Title>
      <DialogPrimitive.Description className={description ? 'mt-1 text-sm text-muted' : 'sr-only'}>{description ?? title}</DialogPrimitive.Description>
      <div className="mt-4">{children}</div>
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted hover:bg-black/5" aria-label="Tutup">
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
)
