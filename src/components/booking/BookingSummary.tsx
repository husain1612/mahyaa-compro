import type { Booking, Departure, Pricing, RoomType, TourPackage } from '@/types'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { formatDate, formatRupiah } from '@/utils/format'
import { ROOM_SHORT } from '@/utils/pricing'

export function PriceLines({ pricing, withDp = true }: { pricing: Pricing; withDp?: boolean }) {
  const Row = ({ l, v, strong, neg }: { l: string; v: string; strong?: boolean; neg?: boolean }) => (
    <div className={`flex justify-between gap-3 ${strong ? 'text-base font-bold' : 'text-sm'} ${neg ? 'text-success' : ''}`}><dt className={strong ? '' : 'text-muted'}>{l}</dt><dd>{v}</dd></div>
  )
  return (
    <dl className="space-y-2">
      <Row l={`${formatRupiah(pricing.unitPrice)} × ${pricing.passengerCount} jemaah`} v={formatRupiah(pricing.subtotal)} />
      {pricing.discount > 0 && <Row l={`Diskon${pricing.promoCode ? ` (${pricing.promoCode})` : ''}`} v={`− ${formatRupiah(pricing.discount)}`} neg />}
      <div className="border-t border-border pt-2"><Row l="Total" v={formatRupiah(pricing.total)} strong /></div>
      {withDp && (<>
        <Row l="DP" v={formatRupiah(pricing.dpAmount)} />
        <Row l="Sisa pelunasan" v={formatRupiah(pricing.remaining)} />
      </>)}
    </dl>
  )
}

type SummaryProps =
  | { booking: Booking; pkg?: undefined }
  | { booking?: undefined; pkg: TourPackage; departure?: Departure; room: RoomType; pricing: Pricing }

export function BookingSummary(props: SummaryProps & { departure?: Departure }) {
  const name = props.booking ? props.booking.packageName : props.pkg.name
  const date = props.booking ? props.booking.departureDate : props.departure?.date
  const airport = props.booking ? props.booking.airportCode : props.departure?.airportCode
  const room = props.booking ? props.booking.room : props.room
  const pricing = props.booking ? props.booking.pricing : props.pricing
  return (
    <Card>
      <CardContent className="space-y-4">
        <CardTitle>Ringkasan Pemesanan</CardTitle>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted">Paket</dt><dd className="text-right font-medium">{name}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Keberangkatan</dt><dd className="text-right">{date ? `${formatDate(date)} · ${airport}` : '—'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Kamar</dt><dd>{ROOM_SHORT[room]}</dd></div>
          {props.booking && <div className="flex justify-between gap-3"><dt className="text-muted">No. Booking</dt><dd className="font-mono">{props.booking.bookingCode}</dd></div>}
        </dl>
        <div className="border-t border-border pt-4"><PriceLines pricing={pricing} /></div>
        <p className="text-[11px] text-muted">Harga & DP adalah simulasi. Pembayaran tidak nyata.</p>
      </CardContent>
    </Card>
  )
}
