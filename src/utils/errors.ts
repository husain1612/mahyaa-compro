import type { ApiErrorBody } from '@/types'

export class ApiError extends Error {
  code: string
  fieldErrors?: Record<string, string>
  constructor(body: ApiErrorBody) {
    super(body.message)
    this.code = body.code
    this.fieldErrors = body.fieldErrors
  }
}
export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Terjadi kesalahan tak terduga')
