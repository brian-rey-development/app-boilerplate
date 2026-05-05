import type { AppError } from './errors'

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E }

export function success<T>(data: T): Result<T, never> {
  return { ok: true, data }
}

export function failure<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error }
}
