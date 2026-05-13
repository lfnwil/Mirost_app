import type { UserRole } from '@/types/auth'

export type RoleAccentMode = UserRole | 'guest'

export interface RoleAccentTheme {
  badge: string
  button: string
  buttonSoft: string
  avatar: string
  heroGradient: string
  panel: string
  panelTitle: string
  panelText: string
  selected: string
}

const clientTheme: RoleAccentTheme = {
  badge: 'border-sky-200 bg-sky-50 text-sky-800',
  button:
    'bg-gradient-to-r from-sky-500 to-slate-950 text-white shadow-sm hover:from-sky-400 hover:to-slate-900',
  buttonSoft: 'border-sky-200 text-sky-800 hover:border-sky-300 hover:bg-sky-50',
  avatar: 'bg-sky-100 text-sky-800',
  heroGradient: 'from-sky-500 to-slate-950',
  panel: 'border-sky-200 bg-sky-50',
  panelTitle: 'text-sky-950',
  panelText: 'text-sky-900/80',
  selected: 'border-sky-700 bg-gradient-to-r from-sky-500 to-slate-950 text-white',
}

const studentTheme: RoleAccentTheme = {
  badge: 'border-rose-200 bg-rose-50 text-rose-700',
  button:
    'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm hover:from-amber-400 hover:to-rose-400',
  buttonSoft: 'border-amber-200 text-rose-700 hover:border-amber-300 hover:bg-amber-50',
  avatar: 'bg-amber-100 text-rose-700',
  heroGradient: 'from-amber-500 to-rose-500',
  panel: 'border-amber-200 bg-amber-50',
  panelTitle: 'text-slate-950',
  panelText: 'text-slate-700',
  selected: 'border-rose-500 bg-gradient-to-r from-amber-500 to-rose-500 text-white',
}

const guestTheme: RoleAccentTheme = {
  badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  button:
    'bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-sm hover:from-emerald-400 hover:to-teal-600',
  buttonSoft: 'border-emerald-200 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50',
  avatar: 'bg-emerald-100 text-emerald-800',
  heroGradient: 'from-emerald-500 to-teal-700',
  panel: 'border-emerald-200 bg-emerald-50',
  panelTitle: 'text-emerald-950',
  panelText: 'text-emerald-900/80',
  selected: 'border-emerald-600 bg-gradient-to-r from-emerald-500 to-teal-700 text-white',
}

export const roleAccentThemes: Record<RoleAccentMode, RoleAccentTheme> = {
  client: clientTheme,
  student: studentTheme,
  guest: guestTheme,
}

export function getRoleAccentTheme(role: RoleAccentMode | null | undefined) {
  if (role === 'student') {
    return studentTheme
  }

  if (role === 'client') {
    return clientTheme
  }

  return guestTheme
}
