import { useEffect, useState } from 'react'
import { FiEdit3, FiLogOut } from 'react-icons/fi'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOutCurrentUser } from '@/services/authService'
import { useAuthStore } from '@/stores/useAuthStore'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Header() {
  const session = useAuthStore((state) => state.session)
  const openAuthModal = useAuthStore((state) => state.openAuthModal)
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const displayName = session?.displayName?.trim() || 'Invite'
  const avatarInitial = displayName.charAt(0).toUpperCase()
  const roleLabel = session?.role === 'student' ? 'Etudiant' : 'Entreprise / Particulier'

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isProfileMenuOpen])

  useEffect(() => {
    if (!session) {
      setIsProfileMenuOpen(false)
    }
  }, [session])

  function handleEditProfile() {
    if (!session) {
      return
    }

    setIsProfileMenuOpen(false)

    if (session.role === 'student') {
      navigate('/profiles/create')
      return
    }

    navigate('/account')
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    setIsProfileMenuOpen(false)

    try {
      await signOutCurrentUser()
      navigate('/listing')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to={session ? '/listing' : '/'} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white shadow-sm">
            M
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900">MIROST</p>
            <p className="text-sm text-slate-500">Talents creatifs, missions courtes</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {!session && (
            <NavLink to="/" end className={navLinkClassName}>
              Accueil
            </NavLink>
          )}
          <NavLink to="/listing" className={navLinkClassName}>
            Listing
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!session ? (
            <button
              type="button"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              onClick={() => openAuthModal('client', 'signup')}
            >
              Connexion / inscription
            </button>
          ) : (
            <>
              <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 lg:inline-flex">
                {roleLabel}
              </span>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isProfileMenuOpen}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-1 py-1 pr-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
              >
                {session.photoURL ? (
                  <img
                    src={session.photoURL}
                    alt={displayName}
                    className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 shadow-sm">
                    {avatarInitial}
                  </div>
                )}
                <div className="hidden text-left md:block">
                  <p className="max-w-36 truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">Mon espace</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {session && isProfileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu du compte"
            className="fixed inset-0 z-30 bg-slate-950/10 backdrop-blur-[1px]"
            onClick={() => setIsProfileMenuOpen(false)}
          />

          <div className="fixed right-4 top-20 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-2xl sm:right-6 lg:right-8">
            <div className="flex items-center gap-4 rounded-[1.5rem] bg-slate-50 p-4">
              {session.photoURL ? (
                <img
                  src={session.photoURL}
                  alt={displayName}
                  className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-base font-semibold text-amber-800">
                  {avatarInitial}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">{displayName}</p>
                <p className="mt-1 text-sm text-slate-500">{roleLabel}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[1.25rem] border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                onClick={handleEditProfile}
              >
                <FiEdit3 className="h-4 w-4 shrink-0" />
                <div>
                  <p>{session.role === 'student' && !session.hasStudentProfile ? 'Completer son profil / portfolio' : 'Modifier son profil / portfolio'}</p>
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    {session.role === 'student'
                      ? 'Mettre a jour votre carte publique et votre presentation.'
                      : 'Acceder a votre espace compte cote front.'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[1.25rem] border border-rose-200 px-4 py-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <FiLogOut className="h-4 w-4 shrink-0" />
                <div>
                  <p>{isSigningOut ? 'Deconnexion...' : 'Se deconnecter'}</p>
                  <p className="mt-1 text-xs font-normal text-rose-500">
                    Fermer votre session et revenir au listing public.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
