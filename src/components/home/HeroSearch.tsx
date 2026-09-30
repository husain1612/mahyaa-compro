import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, PlaneTakeoff, Search, X } from 'lucide-react'
import { AIRPORTS } from '@/data/packages'
import { MONTH_OPTIONS } from '@/components/package/PackageFilter'
import { monthLabel } from '@/utils/format'
import { cn } from '@/utils/cn'

type Tab = 'umrah' | 'haji'

function Segment({ icon, caption, value, onChange, onClear, children, label }: { icon: React.ReactNode; caption: string; value: string; onChange: (v: string) => void; onClear: () => void; children: React.ReactNode; label: string }) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-3 px-4 py-3 sm:px-6">
      <span className="text-primary/60" aria-hidden>{icon}</span>
      <div className="relative min-w-0 flex-1">
        <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-base font-semibold text-text outline-none focus-visible:underline">{children}</select>
        <span className="pointer-events-none block text-xs text-muted">{caption}</span>
      </div>
      {value && <button type="button" onClick={onClear} aria-label={`Hapus ${label}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/10 hover:bg-black/20"><X className="h-3.5 w-3.5" /></button>}
    </div>
  )
}

export function HeroSearch({ embedded = false, onSubmitted }: { embedded?: boolean; onSubmitted?: () => void }) {
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('umrah')
  const [airport, setAirport] = useState('')
  const [month, setMonth] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (airport) p.set('airport', airport)
    if (month) p.set('month', month)
    nav(`/${tab}${p.toString() ? `?${p}` : ''}`)
    onSubmitted?.()
  }
  const months = MONTH_OPTIONS.filter((m) => (tab === 'haji' ? m === '2027-05' : m !== '2027-05'))

  return (
    <div className={embedded ? '' : 'mx-auto max-w-7xl px-4 sm:px-6'}>
      <div className={embedded ? 'flex gap-2' : 'flex gap-2 px-2 sm:px-10'} role="tablist" aria-label="Jenis perjalanan">
        {([['umrah', 'Umrah'], ['haji', 'Haji']] as const).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setMonth('') }}
            className={cn('flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium', tab === id ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text')}>
            <span className={cn('h-2 w-2 rounded-full', tab === id ? 'bg-primary' : 'bg-transparent')} />{l}
          </button>
        ))}
      </div>
      <form onSubmit={submit} aria-label="Cari paket" className={cn('mt-2 flex flex-col divide-y divide-border rounded-[2rem] bg-surface p-2 sm:flex-row sm:items-center sm:divide-x sm:divide-y-0', embedded ? 'border border-border' : 'shadow-[0_10px_40px_-12px_rgba(74,43,28,.3)] lg:max-w-4xl')}>
        <Segment icon={<PlaneTakeoff className="h-6 w-6" />} caption="Bandara keberangkatan" label="Bandara" value={airport} onChange={setAirport} onClear={() => setAirport('')}>
          <option value="">Semua Bandara</option>
          {AIRPORTS.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
        </Segment>
        <Segment icon={<CalendarDays className="h-6 w-6" />} caption="Bulan keberangkatan" label="Bulan" value={month} onChange={setMonth} onClear={() => setMonth('')}>
          <option value="">Semua Bulan</option>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </Segment>
        <button type="submit" aria-label="Cari paket" className="m-2 grid h-14 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-white hover:bg-secondary sm:w-14"><span className="flex items-center gap-2 sm:hidden"><Search className="h-5 w-5" />Cari Paket</span><Search className="hidden h-6 w-6 sm:block" /></button>
      </form>
    </div>
  )
}
