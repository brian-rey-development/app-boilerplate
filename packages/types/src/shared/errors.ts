// Domain-specific codes (DUPLICATE_SLUG, INVITE_EXPIRED) should be added here
// as the app grows to keep all error types in one place.
export type AppError =
  | { code: 'VALIDATION_ERROR'; message: string; field?: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'FORBIDDEN'; message: string }
  | { code: 'DUPLICATE_SLUG'; message: string }
  | { code: 'INVITE_EXPIRED'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string }
