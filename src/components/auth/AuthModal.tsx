import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequiredMark from '@/components/RequiredMark'
import { signInWithEmail, signUpWithEmail } from '@/services/authService'
import { useAuthStore } from '@/stores/useAuthStore'

interface AuthFormState {
  displayName: string
  organisation: string
  email: string
  password: string
}

const initialFormState: AuthFormState = {
  displayName: '',
  organisation: '',
  email: '',
  password: '',
}

export default function AuthModal() {
  const authModal = useAuthStore((state) => state.authModal)
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal)
  const setAuthMode = useAuthStore((state) => state.setAuthMode)
  const setAuthRole = useAuthStore((state) => state.setAuthRole)
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  const [formState, setFormState] = useState<AuthFormState>(initialFormState)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roleCopy =
    authModal.role === 'student'
      ? {
          badge: 'Espace étudiant',
          title: authModal.mode === 'signup' ? 'Créer mon compte étudiant' : 'Connexion étudiant',
          description:
            'Créez votre espace, complétez votre profil public et valorisez vos créations auprès des entreprises.',
        }
      : {
          badge: 'Espace entreprise',
          title: authModal.mode === 'signup' ? 'Créer mon compte entreprise' : 'Connexion entreprise',
          description:
            'Consultez les profils, repérez les compétences utiles et contactez les étudiants créatifs adaptés à vos besoins.',
        }

  useEffect(() => {
    if (!authModal.isOpen) {
      return
    }

    setFormState(initialFormState)
    setErrorMessage('')
  }, [authModal.isOpen, authModal.mode, authModal.role])

  useEffect(() => {
    if (!authModal.isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        closeAuthModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authModal.isOpen, closeAuthModal, isSubmitting])

  if (!authModal.isOpen) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const session =
        authModal.mode === 'login'
          ? await signInWithEmail({
              email: formState.email,
              password: formState.password,
              role: authModal.role,
            })
          : await signUpWithEmail({
              displayName: formState.displayName,
              organisation: formState.organisation,
              email: formState.email,
              password: formState.password,
              role: authModal.role,
            })

      setSession(session)
      closeAuthModal()

      if (session.role === 'student' && !session.hasStudentProfile) {
        navigate('/onboarding/student-profile')
      } else {
        navigate('/listing')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Impossible de traiter votre demande pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4 py-10 backdrop-blur-sm"
      onClick={() => {
        if (!isSubmitting) {
          closeAuthModal()
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              {roleCopy.badge}
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{roleCopy.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{roleCopy.description}</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fermer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={closeAuthModal}
            disabled={isSubmitting}
          >
            x
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                authModal.role === 'student' ? 'bg-slate-950 text-white' : 'text-slate-600'
              }`}
              onClick={() => setAuthRole('student')}
            >
              Étudiant
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                authModal.role === 'client' ? 'bg-slate-950 text-white' : 'text-slate-600'
              }`}
              onClick={() => setAuthRole('client')}
            >
              Entreprise / Particulier
            </button>
          </div>

          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                authModal.mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              onClick={() => setAuthMode('signup')}
            >
              Créer un compte
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                authModal.mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              onClick={() => setAuthMode('login')}
            >
              Se connecter
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {authModal.mode === 'signup' && (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                {authModal.role === 'client' ? 'Nom du contact' : 'Nom complet'}
                <RequiredMark />
              </span>
              <input
                type="text"
                value={formState.displayName}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder={authModal.role === 'client' ? 'Exemple : Camille Durand' : 'Exemple : Lea Martin'}
                required
              />
            </label>
          )}

          {authModal.mode === 'signup' && authModal.role === 'client' && (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Organisation</span>
              <input
                type="text"
                value={formState.organisation}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    organisation: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="Entreprise, association, collectif..."
                autoComplete="organization"
              />
            </label>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Email
                <RequiredMark />
              </span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="nom@exemple.fr"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Mot de passe
                <RequiredMark />
              </span>
              <input
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="Au moins 6 caractères"
                minLength={6}
                required
              />
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Les profils restent consultables librement. Le compte sert à contacter ou publier un profil.
            </p>
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Traitement en cours...'
                : authModal.mode === 'signup'
                  ? 'Continuer'
                  : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
