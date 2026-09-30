import { CalendarClock, FileCheck2, History, Receipt, UserCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export type DashTab = 'booking' | 'dokumen' | 'transaksi' | 'profil'
const items: { id: DashTab; label: string; icon: typeof Receipt }[] = [
  { id: 'booking', label: 'Booking Saya', icon: CalendarClock },
  { id: 'dokumen', label: 'Dokumen', icon: FileCheck2 },
  { id: 'transaksi', label: 'Riwayat Transaksi', icon: History },
  { id: 'profil', label: 'Profil', icon: UserCircle },
]

export function DashboardSidebar({ active, onChange }: { active: DashTab; onChange: (t: DashTab) => void }) {
  return (
    <nav aria-label="Menu dashboard" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-2 lg:flex-col">
      {items.map((i) => (
        <button key={i.id} onClick={() => onChange(i.id)} aria-current={active === i.id ? 'page' : undefined}
          className={cn('flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium', active === i.id ? 'bg-primary text-primary-foreground' : 'hover:bg-black/5')}>
          <i.icon className="h-4 w-4" />{i.label}
        </button>
      ))}
    </nav>
  )
}
