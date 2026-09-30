import type { AuthSession, User } from '@/types'
import { ApiError } from '@/utils/errors'
import { db, delay, readKey, removeKey, writeKey } from './storage'

export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; phone: string; password: string }

/** Mock: password apa pun (min. 6 karakter) diterima untuk akun yang terdaftar. */
export const authService = {
  getSession(): AuthSession | null {
    return readKey<AuthSession | null>('session', null)
  },

  async login({ email, password }: LoginInput): Promise<AuthSession> {
    await delay(null, 500)
    const user = db.users().find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || password.length < 6) {
      throw new ApiError({ code: 'INVALID_CREDENTIALS', message: 'Email atau kata sandi salah (min. 6 karakter).' })
    }
    const session = { user, token: `demo-token-${user.id}` }
    writeKey('session', session)
    return session
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    await delay(null, 500)
    const users = db.users()
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ApiError({ code: 'EMAIL_TAKEN', message: 'Email sudah terdaftar.', fieldErrors: { email: 'Email sudah terdaftar' } })
    }
    const user: User = {
      id: `u-${Date.now().toString(36)}`, name: input.name, email: input.email, phone: input.phone,
      role: 'jemaah', createdAt: new Date().toISOString(),
    }
    db.saveUsers([...users, user])
    const session = { user, token: `demo-token-${user.id}` }
    writeKey('session', session)
    return session
  },

  async logout(): Promise<void> {
    removeKey('session')
  },
}
