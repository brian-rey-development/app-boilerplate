import { profiles } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { User, Result } from '@packages/types'
import { success } from '@packages/types'
import type { RegisterInput } from '../schemas'

export async function register(
  db: DbClient,
  input: RegisterInput,
  userId: string,
): Promise<Result<User>> {
  const rows = await db
    .insert(profiles)
    .values({
      id: userId,
      email: input.email,
      fullName: input.fullName ?? null,
    })
    .returning()

  const profile = rows[0]!

  return success({
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  })
}
