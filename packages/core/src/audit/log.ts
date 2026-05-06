import { auditEvents } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { AppError, Result } from '@packages/types'
import { success } from '@packages/types'

export interface AuditEventInput {
  orgId: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

export async function logAuditEvent(
  db: DbClient,
  input: AuditEventInput,
): Promise<Result<{ id: string }>> {
  const rows = await db.insert(auditEvents).values(input).returning({ id: auditEvents.id })
  const row = rows[0]
  if (!row) {
    const err: AppError = { code: 'INTERNAL_ERROR', message: 'Failed to create audit event' }
    return { ok: false, error: err }
  }
  return success({ id: row.id })
}
