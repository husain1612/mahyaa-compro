import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import type { PackageQuery, TripType } from '@/types'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/form'
import { CardGridSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/common/states'
import { PackageGrid } from '@/components/package/PackageGrid'
import { PackageFilter } from '@/components/package/PackageFilter'
import { packageService } from '@/services/packageService'

const PAGE_SIZE = 6

const parse = (sp: URLSearchParams, type: TripType): PackageQuery => ({
  type,
  q: sp.get('q') ?? undefined,
  airport: sp.get('airport') ?? undefined,
  month: sp.get('month') ?? undefined,
  duration: (sp.get('duration') as PackageQuery['duration']) ?? undefined,
  category: (sp.get('category') as PackageQuery['category']) ?? undefined,
  priceMax: sp.get('priceMax') ? Number(sp.get('priceMax')) : undefined,
  availability: (sp.get('availability') as PackageQuery['availability']) ?? undefined,
  sort: (sp.get('sort') as PackageQuery['sort']) ?? 'popular',
  page: sp.get('page') ? Number(sp.get('page')) : 1,
  pageSize: PAGE_SIZE,
})

export default function PackageListPage({ type }: { type: TripType }) {
  const [sp, setSp] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false)
  const query = parse(sp, type)
  const isHaji = type === 'haji'

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['packages', query],
    queryFn: () => packageService.list(query),
    placeholderData: keepPreviousData,
  })

  const update = (patch: Partial<PackageQuery>) => {
    const next = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 'popular' && k === 'sort') next.delete(k)
      else next.set(k, String(v))
    })
    if (!('page' in patch)) next.delete('page')
    setSp(next, { replace: true })
  }

  const items = data?.items ?? []
  const hasMore = data ? items.length < data.total : false

  return (
    <>
      <PageHeader title={isHaji ? 'Paket Haji' : 'Paket Umrah'} subtitle={isHaji ? 'Program haji dengan pendampingan penuh. Seluruh data adalah simulasi.' : 'Pilih paket umrah sesuai anggaran, jadwal, dan bandara keberangkatan Anda.'} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Button variant="outline" className="mb-3 w-full lg:hidden" onClick={() => setShowFilter((s) => !s)} aria-expanded={showFilter}><SlidersHorizontal className="h-4 w-4" />{showFilter ? 'Sembunyikan filter' : 'Tampilkan filter'}</Button>
          <div className={`${showFilter ? 'block' : 'hidden'} rounded-xl border border-border bg-surface p-5 lg:block`}>
            <PackageFilter type={type} value={query} onChange={update} onReset={() => setSp({}, { replace: true })} />
          </div>
        </aside>
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">{data ? `${data.total} paket ditemukan` : 'Memuat…'}</p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted">Urutkan</label>
              <Select id="sort" className="w-52" value={query.sort} onChange={(e) => update({ sort: e.target.value as PackageQuery['sort'] })}>
                <option value="popular">Terpopuler</option>
                <option value="price-asc">Harga terendah</option>
                <option value="price-desc">Harga tertinggi</option>
                <option value="departure">Keberangkatan terdekat</option>
              </Select>
            </div>
          </div>
          {isLoading ? <CardGridSkeleton /> : isError ? <ErrorState message="Gagal memuat daftar paket." onRetry={() => refetch()} /> : items.length === 0 ? (
            <EmptyState title="Tidak ada paket yang sesuai" description="Coba ubah atau reset filter untuk melihat lebih banyak paket." action={<Button onClick={() => setSp({}, { replace: true })}>Reset filter</Button>} />
          ) : (
            <>
              <div className={isFetching ? 'opacity-70 transition-opacity' : ''}><PackageGrid packages={items} /></div>
              {hasMore && <div className="mt-8 text-center"><Button variant="outline" size="lg" loading={isFetching} onClick={() => update({ page: (query.page ?? 1) + 1 })}>Muat lebih banyak ({items.length}/{data!.total})</Button></div>}
            </>
          )}
        </div>
      </div>
    </>
  )
}
