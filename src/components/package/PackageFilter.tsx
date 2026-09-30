import { RotateCcw, Search } from 'lucide-react'
import type { PackageQuery } from '@/types'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/form'
import { AIRPORTS } from '@/data/packages'
import { formatRupiah, monthLabel } from '@/utils/format'

export const MONTH_OPTIONS = ['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-05']

interface Props {
  value: PackageQuery
  onChange: (patch: Partial<PackageQuery>) => void
  onReset: () => void
  type: 'umrah' | 'haji'
}

const Row = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label>{children}</div>
)

export function PackageFilter({ value, onChange, onReset, type }: Props) {
  const isHaji = type === 'haji'
  const maxPrice = isHaji ? 300_000_000 : 70_000_000
  const step = isHaji ? 5_000_000 : 1_000_000
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Filter paket">
      <Row label="Cari nama paket" id="f-q">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted" />
          <Input id="f-q" className="pl-10" placeholder="mis. Premium, Ramadhan" value={value.q ?? ''} onChange={(e) => onChange({ q: e.target.value })} />
        </div>
      </Row>
      <Row label="Bandara keberangkatan" id="f-airport">
        <Select id="f-airport" value={value.airport ?? ''} onChange={(e) => onChange({ airport: e.target.value })}>
          <option value="">Semua bandara</option>
          {AIRPORTS.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
        </Select>
      </Row>
      <Row label="Bulan keberangkatan" id="f-month">
        <Select id="f-month" value={value.month ?? ''} onChange={(e) => onChange({ month: e.target.value })}>
          <option value="">Semua bulan</option>
          {MONTH_OPTIONS.filter((m) => (isHaji ? m === '2027-05' : m !== '2027-05')).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </Select>
      </Row>
      <Row label="Durasi" id="f-duration">
        <Select id="f-duration" value={value.duration ?? ''} onChange={(e) => onChange({ duration: e.target.value as PackageQuery['duration'] })}>
          <option value="">Semua durasi</option>
          <option value="short">Hingga 9 hari</option>
          <option value="medium">10–12 hari</option>
          <option value="long">13 hari atau lebih</option>
        </Select>
      </Row>
      <Row label="Jenis paket" id="f-category">
        <Select id="f-category" value={value.category ?? ''} onChange={(e) => onChange({ category: e.target.value as PackageQuery['category'] })}>
          <option value="">Semua jenis</option>
          {isHaji
            ? (<><option value="haji-plus">Haji Plus</option><option value="haji-khusus">Haji Khusus</option></>)
            : (<><option value="reguler">Reguler</option><option value="premium">Premium</option><option value="plus">Umrah Plus</option></>)}
        </Select>
      </Row>
      <Row label={`Harga maksimum: ${value.priceMax ? formatRupiah(value.priceMax) : 'Semua'}`} id="f-price">
        <input id="f-price" type="range" min={step * 10} max={maxPrice} step={step} value={value.priceMax ?? maxPrice}
          onChange={(e) => onChange({ priceMax: Number(e.target.value) >= maxPrice ? undefined : Number(e.target.value) })}
          className="w-full accent-[var(--color-primary)]" />
      </Row>
      <Row label="Ketersediaan" id="f-avail">
        <Select id="f-avail" value={value.availability ?? ''} onChange={(e) => onChange({ availability: e.target.value as PackageQuery['availability'] })}>
          <option value="">Semua</option>
          <option value="available">Masih tersedia</option>
          <option value="limited">Kursi terbatas</option>
        </Select>
      </Row>
      <Button type="button" variant="outline" className="w-full" onClick={onReset}><RotateCcw className="h-4 w-4" />Reset filter</Button>
    </form>
  )
}
