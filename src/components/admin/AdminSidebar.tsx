import { BarChart3, Package, ReceiptText, Settings, Tag } from 'lucide-react'
import { cn } from '@/utils/cn'

export type AdminTab = 'ringkasan' | 'booking' | 'paket' | 'promo' | 'pengaturan'
const items: { id: AdminTab; label: string; icon: typeof Package }[] = [
  { id: 'ringkasan', label: 'Ringkasan', icon: BarChart3 },
  { id: 'booking', label: 'Pemesanan', icon: ReceiptText },
  { id: 'paket', label: 'Paket', icon: Package },
  { id: 'promo', label: 'Promo', icon: Tag },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
]

export function AdminSidebar({ active, onChange }: { active: AdminTab; onChange: (t: AdminTab) => void }) {
  return (
    <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-2 lg:flex-col">
      {items.map((i) => (
        <button key={i.id} onClick={() => onChange(i.id)} aria-current={active === i.id ? 'page' : undefined}
          className={cn('flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium', active === i.id ? 'bg-primary text-primary-foreground' : 'hover:bg-black/5')}>
          <i.icon className="h-4 w-4" />{i.label}
        </button>
      ))}
    </nav>
  )
}
