import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select } from '@/components/ui/form'
import type { BookingFormValues } from '@/utils/schemas'

interface Props {
  index: number
  register: UseFormRegister<BookingFormValues>
  errors: FieldErrors<BookingFormValues>
  onRemove?: () => void
  onCopyBooker?: () => void
}

export function PassengerForm({ index, register, errors, onRemove, onCopyBooker }: Props) {
  const e = errors.passengers?.[index]
  const id = (n: string) => `p${index}-${n}`
  const r = (n: keyof BookingFormValues['passengers'][number]) => register(`passengers.${index}.${n}` as const)
  return (
    <fieldset className="rounded-xl border border-border bg-surface p-5">
      <legend className="px-2 text-sm font-semibold text-primary">Jemaah {index + 1}</legend>
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        {onCopyBooker && <Button type="button" variant="ghost" size="sm" onClick={onCopyBooker}>Isi dari data pemesan</Button>}
        {onRemove && <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Hapus jemaah ${index + 1}`}><Trash2 className="h-4 w-4" />Hapus</Button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap (sesuai paspor)" htmlFor={id('name')} error={e?.fullName?.message} className="sm:col-span-2">
          <Input id={id('name')} autoComplete="name" aria-invalid={!!e?.fullName} {...r('fullName')} />
        </Field>
        <Field label="Tanggal lahir" htmlFor={id('birth')} error={e?.birthDate?.message}><Input id={id('birth')} type="date" aria-invalid={!!e?.birthDate} {...r('birthDate')} /></Field>
        <Field label="Jenis kelamin" htmlFor={id('gender')} error={e?.gender?.message}>
          <Select id={id('gender')} aria-invalid={!!e?.gender} defaultValue="" {...r('gender')}><option value="" disabled>Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></Select>
        </Field>
        <Field label="Nomor telepon" htmlFor={id('phone')} error={e?.phone?.message}><Input id={id('phone')} type="tel" inputMode="tel" placeholder="081234567890" aria-invalid={!!e?.phone} {...r('phone')} /></Field>
        <Field label="Email" htmlFor={id('email')} error={e?.email?.message}><Input id={id('email')} type="email" autoComplete="email" aria-invalid={!!e?.email} {...r('email')} /></Field>
        <Field label="Nomor paspor (dummy)" htmlFor={id('pass')} error={e?.passportNumber?.message} hint="Contoh: X1234567"><Input id={id('pass')} className="uppercase" aria-invalid={!!e?.passportNumber} {...r('passportNumber')} /></Field>
        <Field label="Masa berlaku paspor" htmlFor={id('exp')} error={e?.passportExpiry?.message}><Input id={id('exp')} type="date" aria-invalid={!!e?.passportExpiry} {...r('passportExpiry')} /></Field>
      </div>
    </fieldset>
  )
}
