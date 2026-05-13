import { create } from "zustand"
import type { AppSession, AuthFormMode, AuthStatus, UserRole } from "@/types/auth"

interface AuthModalState {
  isOpen: boolean
  role: UserRole
  mode: AuthFormMode
}

interface AuthState {
  session: AppSession | null
  status: AuthStatus
  authModal: AuthModalState
  setSession: (session: AppSession | null) => void
  setStatus: (status: AuthStatus) => void
  openAuthModal: (role: UserRole, mode?: AuthFormMode) => void
  setAuthRole: (role: UserRole) => void
  setAuthMode: (mode: AuthFormMode) => void
  closeAuthModal: () => void
  updateStudentProfileStatus: (hasStudentProfile: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: "loading",
  authModal: {
    isOpen: false,
    role: "student",
    mode: "signup",
  },
  setSession: (session: AppSession | null) =>
    set({
      session,
      status: session ? "authenticated" : "guest",
    }),
  setStatus: (status: AuthStatus) => set({ status }),
  openAuthModal: (role: UserRole, mode: AuthFormMode = "signup") =>
    set({
      authModal: {
        isOpen: true,
        role,
        mode,
      },
    }),
  setAuthRole: (role: UserRole) =>
    set((state) => ({
      authModal: {
        ...state.authModal,
        role,
      },
    })),
  setAuthMode: (mode: AuthFormMode) =>
    set((state) => ({
      authModal: {
        ...state.authModal,
        mode,
      },
    })),
  closeAuthModal: () =>
    set((state) => ({
      authModal: {
        ...state.authModal,
        isOpen: false,
      },
    })),
  updateStudentProfileStatus: (hasStudentProfile: boolean) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            hasStudentProfile,
          }
        : null,
    })),
}))
