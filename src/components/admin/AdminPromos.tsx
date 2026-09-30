import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Promotion } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/form'
import { ConfirmationDialog, EmptyState, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { adminService } from '@/services/adminService'
import { promoAdminSchema } from '@/utils/schemas'
import { ApiError, errMsg } from '@/utils/errors'
import { formatDateShort, formatRupiah } from '@/utils/format'
import type { z } from 'zod'

type V = z.infer<typeof promoAdminSchema>

function PromoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const f = useForm<V>({ resolver: zodResolver(promoAdminSchema), defaultValues: { code: '', title: '', type: 'percent', value: 10, validUntil: '2027-12-31' } })
  const save = useMutation({
    mutationFn: (v: V) => adminService.savePromotion({ id: `p-${Date.now().toString(36)}`, code: v.code, title: v.title, description: v.title, type: v.type, value: v.value, validUntil: v.validUntil, active: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'promos'] }); toast.success('Promo ditambahkan (lokal).'); f.reset(); onClose() },
    onError: (e) => { if (e instanceof ApiError && e.fieldErrors?.code) f.setError('code', { message: e.fieldErrors.code }); toast.error(errMsg(e)) },
  })
  const e = f.formState.errors
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="Tambah Promo" description="Kode promo hanya berlaku di simulasi ini.">
        <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={f.handleSubmit((v) => save.mutate(v))}>
          <Field label="Kode (huruf kapital)" htmlFor="pr-code" error={e.code?.message}><Input id="pr-code" className="uppercase" {...f.register('code', { setValueAs: (v: string) => v.toUpperCase() })} /></Field>
          <Field label="Judul" htmlFor="pr-title" error={e.title?.message}><Input id="pr-title" {...f.register('title')} /></Field>
          <Field label="Tipe" htmlFor="pr-type"><Select id="pr-type" {...f.register('type')}><option value="percent">Persen (%)</option><option value="fixed">Nominal (Rp)</option></Select></Field>
          <Field label="Nilai" htmlFor="pr-val" error={e.value?.message}><Input id="pr-val" type="number" {...f.register('value', { valueAsNumber: true })} /></Field>
          <Field label="Berlaku hingga" htmlFor="pr-until" error={e.validUntil?.message} className="sm:col-span-2"><Input id="pr-until" type="date" {...f.register('validUntil')} /></Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={save.isPending}>Simpan</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminPromos() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'promos'], queryFn: adminService.promotions })
  const [open, setOpen] = useState(false)
  const [del, setDel] = useState<Promotion | null>(null)
  const inv = () => qc.invalidateQueries({ queryKey: ['admin', 'promos'] })
  const toggle = useMutation({ mutationFn: (p: Promotion) => adminService.savePromotion({ ...p, active: !p.active }), onSuccess: () => { inv(); toast.success('Status promo diubah.') } })
  const remove = useMutation({ mutationFn: (p: Promotion) => adminService.deletePromotion(p.id), onSuccess: () => { inv(); setDel(null); toast.success('Promo dihapus (lokal).') } })
  if (q.isLoading) return <LoadingSkeleton className="h-48" />
  if (q.isError) return <ErrorState message={errMsg(q.error)} onRetry={() => q.refetch()} />
  const list = q.data ?? []
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><p className="text-sm text-muted">{list.length} promo</p><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Tambah Promo</Button></div>
      {list.length === 0 ? <EmptyState title="Belum ada promo" /> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full min-w-[600px] text-sm">
          <thead className="bg-black/5 text-left"><tr><th className="p-3">Kode</th><th className="p-3">Judul</th><th className="p-3">Nilai</th><th className="p-3">Berlaku s/d</th><th className="p-3">Status</th><th className="p-3"><span className="sr-only">Aksi</span></th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id} className="border-t border-border"><td className="p-3 font-mono font-semibold">{p.code}</td><td className="p-3">{p.title}</td><td className="p-3">{p.type === 'percent' ? `${p.value}%` : formatRupiah(p.value)}</td><td className="p-3">{formatDateShort(p.validUntil)}</td>
              <td className="p-3"><button onClick={() => toggle.mutate(p)} aria-label={`Ubah status ${p.code}`}><Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'Aktif' : 'Nonaktif'}</Badge></button></td>
              <td className="p-3"><Button size="sm" variant="ghost" onClick={() => setDel(p)} aria-label={`Hapus ${p.code}`}><Trash2 className="h-4 w-4 text-danger" /></Button></td></tr>
          ))}</tbody></table></div>
      )}
      <PromoDialog open={open} onClose={() => setOpen(false)} />
      <ConfirmationDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} danger title="Hapus promo?" description={`Promo ${del?.code} akan dihapus dari data lokal.`} confirmLabel="Hapus" loading={remove.isPending} onConfirm={() => del && remove.mutate(del)} />
    </div>
  )
}
