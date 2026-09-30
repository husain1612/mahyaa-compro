import { Banknote, Landmark, QrCode } from 'lucide-react'
import type { PaymentMethod } from '@/types'
import { cn } from '@/utils/cn'

export const METHODS: { id: PaymentMethod; label: string; desc: string; icon: typeof QrCode }[] = [
  { id: 'qris', label: 'QRIS', desc: 'Semua e-wallet & mobile banking (demo)', icon: QrCode },
  { id: 'va', label: 'Virtual Account', desc: 'Nomor VA dummy', icon: Landmark },
  { id: 'transfer', label: 'Transfer Bank', desc: 'Rekening dummy', icon: Banknote },
]

export function PaymentMethodSelector({ value, onChange, name = 'method' }: { value: PaymentMethod; onChange: (m: PaymentMethod) => void; name?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Metode pembayaran</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {METHODS.map((m) => (
          <label key={m.id} className={cn('flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm', value === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50')}>
            <input type="radio" name={name} value={m.id} checked={value === m.id} onChange={() => onChange(m.id)} className="sr-only" />
            <m.icon className="h-5 w-5 text-primary" /><span className="font-semibold">{m.label}</span><span className="text-xs text-muted">{m.desc}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
