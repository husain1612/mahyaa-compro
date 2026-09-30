import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/form'
import { DemoBanner } from '@/components/common/states'
import { authService } from '@/services/authService'
import { useAuth } from '@/store/authStore'
import { loginSchema, registerSchema } from '@/utils/schemas'
import { errMsg } from '@/utils/errors'
import type { AuthSession } from '@/types'
import { z } from 'zod'

type LoginV = z.infer<typeof loginSchema>
type RegV = z.infer<typeof registerSchema>

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const nav = useNavigate()
  const loc = useLocation()
  const { session, setSession } = useAuth()
  const from = (loc.state as { from?: string } | null)?.from

  const done = (s: AuthSession) => {
    setSession(s)
    toast.success(`Selamat datang, ${s.user.name}`)
    nav(from ?? (s.user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true })
  }
  const login = useMutation({ mutationFn: authService.login, onSuccess: done, onError: (e) => toast.error(errMsg(e)) })
  const register = useMutation({ mutationFn: authService.register, onSuccess: done, onError: (e) => toast.error(errMsg(e)) })

  const lf = useForm<LoginV>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const rf = useForm<RegV>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', phone: '', password: '' } })

  if (session && !login.isPending && !register.isPending) return <Navigate to={from ?? (session.user.role === 'admin' ? '/admin' : '/dashboard')} replace />

  const isLogin = mode === 'login'
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-3xl font-bold">{isLogin ? 'Masuk' : 'Daftar Akun'}</h1>
      <DemoBanner className="mt-4" />
      <Card className="mt-6"><CardContent>
        {isLogin ? (
          <form className="space-y-4" noValidate onSubmit={lf.handleSubmit((v) => login.mutate(v))}>
            <Field label="Email" htmlFor="email" error={lf.formState.errors.email?.message}><Input id="email" type="email" autoComplete="email" {...lf.register('email')} /></Field>
            <Field label="Kata sandi" htmlFor="password" error={lf.formState.errors.password?.message}><Input id="password" type="password" autoComplete="current-password" {...lf.register('password')} /></Field>
            <Button type="submit" className="w-full" loading={login.isPending}>Masuk</Button>
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-center text-xs text-muted">Akun demo (kata sandi apa pun, min. 6 karakter)</p>
              <Button type="button" variant="outline" className="w-full" onClick={() => { lf.setValue('email', 'jemaah@demo.mahyaa.test'); lf.setValue('password', 'demo1234'); login.mutate({ email: 'jemaah@demo.mahyaa.test', password: 'demo1234' }) }}>Masuk sebagai Jemaah Demo</Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => login.mutate({ email: 'admin@demo.mahyaa.test', password: 'demo1234' })}>Masuk sebagai Admin Demo</Button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" noValidate onSubmit={rf.handleSubmit((v) => register.mutate(v))}>
            <Field label="Nama lengkap" htmlFor="name" error={rf.formState.errors.name?.message}><Input id="name" autoComplete="name" {...rf.register('name')} /></Field>
            <Field label="Email" htmlFor="r-email" error={rf.formState.errors.email?.message}><Input id="r-email" type="email" autoComplete="email" {...rf.register('email')} /></Field>
            <Field label="Nomor telepon" htmlFor="phone" error={rf.formState.errors.phone?.message}><Input id="phone" type="tel" placeholder="081234567890" {...rf.register('phone')} /></Field>
            <Field label="Kata sandi" htmlFor="r-pass" error={rf.formState.errors.password?.message}><Input id="r-pass" type="password" autoComplete="new-password" {...rf.register('password')} /></Field>
            <Button type="submit" className="w-full" loading={register.isPending}>Daftar</Button>
          </form>
        )}
      </CardContent></Card>
      <p className="mt-4 text-center text-sm text-muted">{isLogin ? <>Belum punya akun? <Link className="font-semibold text-primary" to="/daftar">Daftar</Link></> : <>Sudah punya akun? <Link className="font-semibold text-primary" to="/masuk">Masuk</Link></>}</p>
    </div>
  )
}
