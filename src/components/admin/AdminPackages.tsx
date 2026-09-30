import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { TourPackage } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/form'
import { ConfirmationDialog, EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { adminService } from '@/services/adminService'
import { seedPackages } from '@/data/packages'
import { packageAdminSchema } from '@/utils/schemas'
import { errMsg } from '@/utils/errors'
import { formatRupiah } from '@/utils/format'
import type { z } from 'zod'

type V = z.infer<typeof packageAdminSchema>
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function PackageDialog({ pkg, open, onClose }: { pkg: TourPackage | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const f = useForm<V>({
    resolver: zodResolver(packageAdminSchema),
    values: pkg
      ? { name: pkg.name, type: pkg.type, category: pkg.category, durationDays: pkg.durationDays, quad: pkg.prices.quad, triple: pkg.prices.triple, double: pkg.prices.double, dpPercent: pkg.dpPercent }
      : { name: '', type: 'umrah', category: 'reguler', durationDays: 9, quad: 28000000, triple: 29500000, double: 31000000, dpPercent: 30 },
  })
  const save = useMutation({
    mutationFn: (v: V) => {
      const base = pkg ?? { ...seedPackages[0], id: `pkg-${Date.now().toString(36)}`, slug: '', featured: false, popularity: 50, departures: seedPackages[0].departures.map((d) => ({ ...d, id: `${d.id}-${Date.now().toString(36)}` })) }
      const next: TourPackage = { ...base, name: v.name, slug: pkg ? pkg.slug : `${slugify(v.name)}-${Date.now().toString(36).slice(-4)}`, type: v.type, category: v.category, durationDays: v.durationDays, prices: { quad: v.quad, triple: v.triple, double: v.double }, dpPercent: v.dpPercent }
      return adminService.savePackage(next)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); qc.invalidateQueries({ queryKey: ['packages'] }); qc.invalidateQueries({ queryKey: ['package'] }); toast.success('Paket disimpan (lokal).'); onClose() },
    onError: (e) => toast.error(errMsg(e)),
  })
  const e = f.formState.errors
  const num = { valueAsNumber: true }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={pkg ? 'Ubah Paket' : 'Tambah Paket'} description="Perubahan hanya tersimpan di browser ini.">
        <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={f.handleSubmit((v) => save.mutate(v))}>
          <Field label="Nama paket" htmlFor="pk-name" error={e.name?.message} className="sm:col-span-2"><Input id="pk-name" {...f.register('name')} /></Field>
          <Field label="Jenis" htmlFor="pk-type"><Select id="pk-type" {...f.register('type')}><option value="umrah">Umrah</option><option value="haji">Haji</option></Select></Field>
          <Field label="Kategori" htmlFor="pk-cat"><Select id="pk-cat" {...f.register('category')}><option value="reguler">Reguler</option><option value="premium">Premium</option><option value="plus">Umrah Plus</option><option value="haji-plus">Haji Plus</option><option value="haji-khusus">Haji Khusus</option></Select></Field>
          <Field label="Durasi (hari)" htmlFor="pk-dur" error={e.durationDays?.message}><Input id="pk-dur" type="number" {...f.register('durationDays', num)} /></Field>
          <Field label="DP (%)" htmlFor="pk-dp" error={e.dpPercent?.message}><Input id="pk-dp" type="number" {...f.register('dpPercent', num)} /></Field>
          <Field label="Harga Quad" htmlFor="pk-q" error={e.quad?.message}><Input id="pk-q" type="number" {...f.register('quad', num)} /></Field>
          <Field label="Harga Triple" htmlFor="pk-t" error={e.triple?.message}><Input id="pk-t" type="number" {...f.register('triple', num)} /></Field>
          <Field label="Harga Double" htmlFor="pk-d" error={e.double?.message}><Input id="pk-d" type="number" {...f.register('double', num)} /></Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={save.isPending}>Simpan</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminPackages() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'packages'], queryFn: adminService.packages })
  const [edit, setEdit] = useState<TourPackage | null>(null)
  const [creating, setCreating] = useState(false)
  const [del, setDel] = useState<TourPackage | null>(null)
  const inv = () => { qc.invalidateQueries({ queryKey: ['admin'] }); qc.invalidateQueries({ queryKey: ['packages'] }) }
  const toggle = useMutation({ mutationFn: (p: TourPackage) => adminService.savePackage({ ...p, active: !p.active }), onSuccess: () => { inv(); toast.success('Status paket diubah.') } })
  const remove = useMutation({ mutationFn: (p: TourPackage) => adminService.deletePackage(p.id), onSuccess: () => { inv(); setDel(null); toast.success('Paket dihapus (lokal).') }, onError: (e) => toast.error(errMsg(e)) })

  if (q.isLoading) return <LoadingSkeleton className="h-64" />
  if (q.isError) return <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} />
  const list = q.data ?? []
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><p className="text-sm text-muted">{list.length} paket</p><Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Tambah Paket</Button></div>
      {list.length === 0 ? <EmptyState title="Belum ada paket" /> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full min-w-[640px] text-sm">
          <thead className="bg-black/5 text-left"><tr><th className="p-3">Paket</th><th className="p-3">Jenis</th><th className="p-3 text-right">Mulai dari</th><th className="p-3">Status</th><th className="p-3"><span className="sr-only">Aksi</span></th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id} className="border-t border-border"><td className="p-3 font-medium">{p.name}<br /><span className="text-xs text-muted">{p.slug}</span></td><td className="p-3 capitalize">{p.type} · {p.category}</td><td className="p-3 text-right">{formatRupiah(p.prices.quad)}</td>
              <td className="p-3"><button onClick={() => toggle.mutate(p)} aria-label={`Ubah status aktif ${p.name}`}><Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'Aktif' : 'Nonaktif'}</Badge></button></td>
              <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEdit(p)} aria-label={`Ubah ${p.name}`}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="ghost" onClick={() => setDel(p)} aria-label={`Hapus ${p.name}`}><Trash2 className="h-4 w-4 text-danger" /></Button></div></td></tr>
          ))}</tbody></table></div>
      )}
      <PackageDialog pkg={edit} open={!!edit || creating} onClose={() => { setEdit(null); setCreating(false) }} />
      <ConfirmationDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} danger title="Hapus paket?" description={`Paket "${del?.name}" akan dihapus dari data lokal.`} confirmLabel="Hapus" loading={remove.isPending} onConfirm={() => del && remove.mutate(del)} />
    </div>
  )
}
