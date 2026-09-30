import type { BookingStatus, TransactionStatus } from '@/types'
import { Badge } from '@/components/ui/badge'

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  awaiting_payment: { label: 'Menunggu Pembayaran', tone: 'warning' },
  dp_paid: { label: 'DP Terbayar', tone: 'info' },
  paid: { label: 'Lunas', tone: 'success' },
  failed: { label: 'Pembayaran Gagal', tone: 'danger' },
  expired: { label: 'Kedaluwarsa', tone: 'danger' },
  cancelled: { label: 'Dibatalkan', tone: 'neutral' },
}
export const TX_STATUS: Record<TransactionStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Menunggu', tone: 'warning' },
  success: { label: 'Berhasil', tone: 'success' },
  failed: { label: 'Gagal', tone: 'danger' },
  expired: { label: 'Kedaluwarsa', tone: 'danger' },
}

export const StatusBadge = ({ status }: { status: BookingStatus }) => <Badge tone={BOOKING_STATUS[status].tone}>{BOOKING_STATUS[status].label}</Badge>
export const TxBadge = ({ status }: { status: TransactionStatus }) => <Badge tone={TX_STATUS[status].tone}>{TX_STATUS[status].label}</Badge>
