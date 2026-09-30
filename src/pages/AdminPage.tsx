import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog, DemoBanner, PageHeader } from '@/components/common/states'
import { AdminSidebar, type AdminTab } from '@/components/admin/AdminSidebar'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { AdminBookings } from '@/components/admin/AdminBookings'
import { AdminPackages } from '@/components/admin/AdminPackages'
import { AdminPromos } from '@/components/admin/AdminPromos'
import { adminService } from '@/services/adminService'
import { useAuth } from '@/store/authStore'

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('ringkasan')
  const [reset, setReset] = useState(false)
  const [busy, setBusy] = useState(false)
  const qc = useQueryClient()
  const { logout } = useAuth()

  const doReset = async () => {
    setBusy(true)
    await adminService.resetDemoData()
    await logout()
    qc.clear()
    setBusy(false)
    setReset(false)
    toast.success('Data demo dikembalikan ke kondisi awal. Silakan masuk kembali.')
    window.location.assign('/masuk')
  }

  return (
    <>
      <PageHeader title="Admin Dashboard (Demo)" subtitle="Semua perubahan hanya berlaku pada simulasi frontend di browser ini." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[14rem_1fr]">
        <AdminSidebar active={tab} onChange={setTab} />
        <div className="min-w-0 space-y-4">
          <DemoBanner />
          {tab === 'ringkasan' && <AdminOverview />}
          {tab === 'booking' && <AdminBookings />}
          {tab === 'paket' && <AdminPackages />}
          {tab === 'promo' && <AdminPromos />}
          {tab === 'pengaturan' && (
            <Card><CardContent className="space-y-3"><CardTitle>Reset Data Demo</CardTitle>
              <p className="text-sm text-muted">Menghapus seluruh booking, paket, promo, dan sesi yang tersimpan di LocalStorage lalu memuat ulang data dummy awal.</p>
              <Button variant="danger" onClick={() => setReset(true)}><RotateCcw className="h-4 w-4" />Reset data demo</Button>
            </CardContent></Card>
          )}
        </div>
      </div>
      <ConfirmationDialog open={reset} onOpenChange={setReset} danger title="Reset semua data demo?" description="Seluruh perubahan lokal akan hilang." confirmLabel="Ya, reset" loading={busy} onConfirm={doReset} />
    </>
  )
}
