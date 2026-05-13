import type { OrganisationType } from '@/data/organisationTypes'
import type { UserRole } from '@/types/auth'
import type { StudentProfileInput } from '@/types/profile'

export interface DemoStoredUser {
  uid: string
  email: string
  password: string
  displayName: string
  organisationType?: OrganisationType
  organisation?: string
  role: UserRole
  photoURL: string | null
}

export interface DemoStoredStudentProfile extends StudentProfileInput {
  userId: string
  displayName: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface DemoStoredContactRequest {
  id: string
  profileId: string
  profileName: string
  profileDomain: string
  senderUserId?: string
  senderRole?: UserRole
  senderName: string
  senderEmail: string
  organisation: string
  projectType: string
  message: string
  createdAt: string
}

const DEMO_USERS_KEY = 'mirost-demo-users'
const DEMO_CURRENT_USER_KEY = 'mirost-demo-current-user'
const DEMO_STUDENT_PROFILES_KEY = 'mirost-demo-student-profiles'
const DEMO_CONTACT_REQUESTS_KEY = 'mirost-demo-contact-requests'
const DEMO_AUTH_EVENT = 'mirost:demo-auth'
const DEMO_PROFILE_EVENT = 'mirost:demo-profile'
const DEMO_CONTACT_EVENT = 'mirost:demo-contact'

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  const rawValue = window.localStorage.getItem(key)

  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function dispatchDemoEvent(eventName: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(eventName))
}

export function getDemoUsers() {
  return readJSON<DemoStoredUser[]>(DEMO_USERS_KEY, [])
}

export function setDemoUsers(users: DemoStoredUser[]) {
  writeJSON(DEMO_USERS_KEY, users)
  dispatchDemoEvent(DEMO_AUTH_EVENT)
}

export function getDemoCurrentUserId() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(DEMO_CURRENT_USER_KEY)
}

export function setDemoCurrentUserId(userId: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (userId) {
    window.localStorage.setItem(DEMO_CURRENT_USER_KEY, userId)
  } else {
    window.localStorage.removeItem(DEMO_CURRENT_USER_KEY)
  }

  dispatchDemoEvent(DEMO_AUTH_EVENT)
}

export function getDemoStudentProfiles() {
  return readJSON<Record<string, DemoStoredStudentProfile>>(DEMO_STUDENT_PROFILES_KEY, {})
}

export function setDemoStudentProfiles(profiles: Record<string, DemoStoredStudentProfile>) {
  writeJSON(DEMO_STUDENT_PROFILES_KEY, profiles)
  dispatchDemoEvent(DEMO_PROFILE_EVENT)
  dispatchDemoEvent(DEMO_AUTH_EVENT)
}

export function getDemoContactRequests() {
  return readJSON<DemoStoredContactRequest[]>(DEMO_CONTACT_REQUESTS_KEY, [])
}

export function setDemoContactRequests(contactRequests: DemoStoredContactRequest[]) {
  writeJSON(DEMO_CONTACT_REQUESTS_KEY, contactRequests)
  dispatchDemoEvent(DEMO_CONTACT_EVENT)
}

export function subscribeToDemoStorage(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleChange = () => listener()

  window.addEventListener('storage', handleChange)
  window.addEventListener(DEMO_AUTH_EVENT, handleChange as EventListener)
  window.addEventListener(DEMO_PROFILE_EVENT, handleChange as EventListener)
  window.addEventListener(DEMO_CONTACT_EVENT, handleChange as EventListener)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener(DEMO_AUTH_EVENT, handleChange as EventListener)
    window.removeEventListener(DEMO_PROFILE_EVENT, handleChange as EventListener)
    window.removeEventListener(DEMO_CONTACT_EVENT, handleChange as EventListener)
  }
}
