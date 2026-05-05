export type AuthProvider = 'email' | 'google' | 'github'

export interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}
