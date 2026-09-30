import { useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { RoomType } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Field, Input, Select, Textarea } from '@/components/ui/form'
import { DemoBanner, ErrorState, LoadingSkeleton } from '@/components/common/states'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { PassengerForm } from '@/components/booking/PassengerForm'
import { packageService } from '@/services/packageService'
import { bookingService } from '@/services/bookingService'
import { useAuth } from '@/store/authStore'
import { bookingFormSchema, type BookingFormValues } from '@/utils/schemas'
import { ROOM_LABEL, calcPricing } from '@/utils/pricing'
import { errMsg } from '@/utils/errors'
import { formatDate, formatRupiah } from '@/utils/format'

const emptyPax = { fullName: '', birthDate: '', gender: '' as 'L', phone: '', email: '', passportNumber: '', passportExpiry: '' }

export default function BookingPage() {
  const { slug = '' } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const session = useAuth((s) => s.session)
  const { data: pkg, isLoading, error, refetch } = useQuery({ queryKey: ['package', slug], queryFn: () => packageService.getBySlug(slug), retry: false })

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onBlur',
    defaultValues: {
      departureId: sp.get('dep') ?? '',
      room: (['quad', 'triple', 'double'].includes(sp.get('room') ?? '') ? sp.get('room') : 'quad') as RoomType,
      booker: { fullName: session?.user.name ?? '', phone: session?.user.phone ?? '', email: session?.user.email ?? '', notes: '' },
      passengers: [{ ...emptyPax }],
    },
  })
  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'passengers' })

  useEffect(() => {
    if (pkg && !getValues('departureId')) setValue('departureId', (pkg.departures.find((d) => d.seatsLeft > 0) ?? pkg.departures[0]).id)
  }, [pkg, getValues, setValue])

  const create = useMutation({
    mutationFn: (v: BookingFormValues) => bookingService.create(slug, v, session?.user.id ?? 'guest'),
    onSuccess: (b) => { toast.success('Data booking tersimpan. Lanjut ke checkout.'); nav(`/checkout/${b.id}`) },
    onError: (e) => toast.error(errMsg(e)),
  })

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-8"><LoadingSkeleton className="h-10 w-1/2" /><LoadingSkeleton className="h-96" /></div>
  if (error || !pkg) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState title="Paket tidak ditemukan" message={errMsg(error)} onRetry={() => refetch()} action={<Button asChild><Link to="/umrah">Lihat paket</Link></Button>} /></div>

  const room = watch('room')
  const depId = watch('departureId')
  const count = fields.length
  const dep = pkg.departures.find((d) => d.id === depId)
  const pricing = calcPricing(pkg, room, count)
  const overSeats = dep ? count > dep.seatsLeft : false

  const copyBooker = () => {
    const b = getValues('booker')
    setValue('passengers.0.fullName', b.fullName, { shouldValidate: true })
    setValue('passengers.0.phone', b.phone, { shouldValidate: true })
    setValue('passengers.0.email', b.email, { shouldValidate: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Pemesanan Paket</h1>
      <p className="mt-1 text-muted">{pkg.name} · isi data pemesan dan jemaah.</p>
      <DemoBanner className="mt-4" />
      <form id="booking-form" onSubmit={handleSubmit((v) => create.mutate(v))} noValidate className="mt-6 grid gap-8 pb-24 lg:grid-cols-[1fr_22rem] lg:pb-0">
        <div className="space-y-6">
          <Card><CardContent className="space-y-4">
            <CardTitle>1. Keberangkatan & Kamar</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tanggal keberangkatan" htmlFor="departureId" error={errors.departureId?.message}>
                <Select id="departureId" {...register('departureId')}>
                  {pkg.departures.map((d) => <option key={d.id} value={d.id} disabled={d.seatsLeft === 0}>{formatDate(d.date)} · {d.airportCode} · {d.seatsLeft === 0 ? 'Penuh' : `${d.seatsLeft} kursi`}</option>)}
                </Select>
              </Field>
              <Field label="Tipe kamar" htmlFor="room" error={errors.room?.message}>
                <Select id="room" {...register('room')}>
                  {(['quad', 'triple', 'double'] as const).map((r) => <option key={r} value={r}>{ROOM_LABEL[r]} — {formatRupiah(pkg.prices[r])}</option>)}
                </Select>
              </Field>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium" id="cnt-l">Jumlah jemaah</p>
              <div className="inline-flex items-center gap-3" role="group" aria-labelledby="cnt-l">
                <Button type="button" variant="outline" size="icon" aria-label="Kurangi jemaah" disabled={count <= 1} onClick={() => remove(count - 1)}><Minus className="h-4 w-4" /></Button>
                <output className="w-8 text-center text-lg font-semibold" aria-live="polite">{count}</output>
                <Button type="button" variant="outline" size="icon" aria-label="Tambah jemaah" disabled={count >= 10} onClick={() => append({ ...emptyPax })}><Plus className="h-4 w-4" /></Button>
              </div>
              {overSeats && <p role="alert" className="mt-2 text-sm text-danger">Jumlah jemaah melebihi sisa kursi ({dep?.seatsLeft}).</p>}
            </div>
          </CardContent></Card>

          <Card><CardContent className="space-y-4">
            <CardTitle>2. Data Pemesan</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama pemesan" htmlFor="b-name" error={errors.booker?.fullName?.message} className="sm:col-span-2"><Input id="b-name" autoComplete="name" aria-invalid={!!errors.booker?.fullName} {...register('booker.fullName')} /></Field>
              <Field label="Nomor telepon / WhatsApp" htmlFor="b-phone" error={errors.booker?.phone?.message}><Input id="b-phone" type="tel" inputMode="tel" placeholder="081234567890" aria-invalid={!!errors.booker?.phone} {...register('booker.phone')} /></Field>
              <Field label="Email" htmlFor="b-email" error={errors.booker?.email?.message}><Input id="b-email" type="email" autoComplete="email" aria-invalid={!!errors.booker?.email} {...register('booker.email')} /></Field>
              <Field label="Catatan (opsional)" htmlFor="b-notes" error={errors.booker?.notes?.message} className="sm:col-span-2"><Textarea id="b-notes" {...register('booker.notes')} /></Field>
            </div>
          </CardContent></Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">3. Data Jemaah</h2>
            {fields.map((f, i) => (
              <PassengerForm key={f.id} index={i} register={register} errors={errors} onCopyBooker={i === 0 ? copyBooker : undefined} onRemove={count > 1 ? () => remove(i) : undefined} />
            ))}
            {errors.passengers?.root?.message && <p role="alert" className="text-sm text-danger">{errors.passengers.root.message}</p>}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BookingSummary pkg={pkg} departure={dep} room={room} pricing={pricing} />
          <Button type="submit" size="lg" className="hidden w-full lg:inline-flex" variant="accent" loading={create.isPending} disabled={overSeats}>Lanjut ke Checkout</Button>
          <p className="text-center text-xs text-muted">Data tersimpan di LocalStorage browser (simulasi).</p>
        </aside>
      </form>
      <div className="no-print fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-surface/95 p-3 pr-20 shadow-[0_-4px_12px_rgba(0,0,0,.08)] backdrop-blur lg:hidden">
        <div><p className="text-[11px] text-muted">Total ({count} jemaah)</p><p className="font-bold text-primary">{formatRupiah(pricing.total)}</p></div>
        <Button type="submit" form="booking-form" variant="accent" loading={create.isPending} disabled={overSeats}>Lanjut</Button>
      </div>
    </div>
  )
}
