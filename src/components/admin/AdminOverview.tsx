import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2, Clock, Users, Wallet, XCircle, ReceiptText } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CardGridSkeleton, ErrorState } from '@/components/common/states'
import { adminService } from '@/services/adminService'
import { formatRupiah, monthLabel } from '@/utils/format'
import { errMsg } from '@/utils/errors'

export function AdminOverview() {
  const stats = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminService.stats })
  const monthly = useQuery({ queryKey: ['admin', 'monthly'], queryFn: adminService.monthly })
  if (stats.isError) return <ErrorState message={errMsg(stats.error)} onRetry={() => stats.refetch()} />
  if (!stats.data) return <CardGridSkeleton count={6} />
  const s = stats.data
  const cards = [
    { l: 'Total Booking', v: String(s.bookings), i: ReceiptText },
    { l: 'Total Jemaah', v: String(s.passengers), i: Users },
    { l: 'Total Transaksi (simulasi)', v: formatRupiah(s.totalTransactions), i: Wallet },
    { l: 'Menunggu Pembayaran', v: String(s.awaiting), i: Clock },
    { l: 'Booking Berhasil', v: String(s.success), i: CheckCircle2 },
    { l: 'Gagal / Kedaluwarsa', v: String(s.failed), i: XCircle },
  ]
  const data = (monthly.data ?? []).map((m) => ({ ...m, label: monthLabel(m.month).replace(/ \d{4}$/, (y) => ` '${y.trim().slice(2)}`) }))
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.l}><CardContent className="flex items-center gap-4"><div className="rounded-lg bg-primary/10 p-3 text-primary"><c.i className="h-6 w-6" /></div><div><p className="text-sm text-muted">{c.l}</p><p className="text-xl font-bold">{c.v}</p></div></CardContent></Card>
        ))}
      </div>
      <Card><CardContent>
        <CardTitle className="mb-1">Transaksi per Bulan</CardTitle>
        <p className="mb-4 text-xs text-muted">Data historis dummy + booking lokal. Nominal dalam juta rupiah.</p>
        <div className="h-72" role="img" aria-label="Grafik batang transaksi per bulan">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}`} width={40} />
              <Tooltip formatter={(v) => formatRupiah(Number(v))} labelStyle={{ fontWeight: 600 }} />
              <Bar dataKey="transaksi" name="Transaksi" fill="var(--color-primary)" isAnimationActive={false} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>
    </div>
  )
}
