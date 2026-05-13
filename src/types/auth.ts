import type { OrganisationType } from '@/data/organisationTypes'

export type UserRole = 'client' | 'student'
export type AuthStatus = 'loading' | 'guest' | 'authenticated'
export type AuthFormMode = 'login' | 'signup'
export type AuthSource = 'firebase' | 'demo'

export interface AppSession {
  uid: string
  email: string
  displayName: string
  organisationType: OrganisationType
  organisation: string
  role: UserRole
  hasStudentProfile: boolean
  photoURL: string | null
  source: AuthSource
}

export interface SignInInput {
  email: string
  password: string
  role: UserRole
}

export interface SignUpInput extends SignInInput {
  displayName: string
  organisationType?: OrganisationType
  organisation?: string
}
