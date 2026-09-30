import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils/cn'

export const Label = ({ className, ...p }: React.ComponentProps<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root className={cn('text-sm font-medium text-text', className)} {...p} />
)

const field = 'w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60 aria-[invalid=true]:border-danger'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(field, 'h-11', className)} {...p} />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(field, 'min-h-24 py-2', className)} {...p} />
))
Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select ref={ref} className={cn(field, 'h-11 cursor-pointer', className)} {...p}>{children}</select>
))
Select.displayName = 'Select'

/** Label + kontrol + pesan error, terhubung via aria untuk aksesibilitas. */
export const Field = ({ label, htmlFor, error, hint, children, className }: { label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn('space-y-1.5', className)}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
  </div>
)
