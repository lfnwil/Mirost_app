import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { FiRefreshCw, FiSave, FiSend } from 'react-icons/fi'
import { Link, Navigate } from 'react-router-dom'
import { updateClientAccount } from '@/services/authService'
import { listSentProfileContactRequests, type ProfileContactRequest } from '@/services/contactService'
import { useAuthStore } from '@/stores/useAuthStore'
import RequiredMark from '@/components/RequiredMark'
import { getRoleAccentTheme } from '@/utils/roleTheme'

interface ClientFormState {
  displayName: string
  organisation: string
}

const emptyClientFormState: ClientFormState = {
  displayName: '',
  organisation: '',
}

function formatContactDate(value: string) {
  if (!value) {
    return 'Date non disponible'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date non disponible'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function AccountPage() {
  const session = useAuthStore((state) => state.session)
  const status = useAuthStore((state) => state.status)
  const setSession = useAuthStore((state) => state.setSession)
  const [clientFormState, setClientFormState] = useState<ClientFormState>(emptyClientFormState)
  const [clientSaveMessage, setClientSaveMessage] = useState('')
  const [clientSaveError, setClientSaveError] = useState('')
  const [isSavingClient, setIsSavingClient] = useState(false)
  const [sentContacts, setSentContacts] = useState<ProfileContactRequest[]>([])
  const [contactsError, setContactsError] = useState('')
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const isClientSession = session?.role === 'client'
  const accentTheme = getRoleAccentTheme(session?.role)

  const contactCountLabel = useMemo(() => {
    if (sentContacts.length === 0) {
      return 'Aucun contact envoyé'
    }

    return `${sentContacts.length} contact${sentContacts.length > 1 ? 's' : ''} envoyé${
      sentContacts.length > 1 ? 's' : ''
    }`
  }, [sentContacts.length])

  const loadSentContacts = useCallback(async () => {
    if (!session || session.role !== 'client') {
      setSentContacts([])
      return
    }

    setIsLoadingContacts(true)
    setContactsError('')

    try {
      setSentContacts(await listSentProfileContactRequests(session))
    } catch {
      setContactsError('Impossible de charger les contacts envoyés pour le moment.')
    } finally {
      setIsLoadingContacts(false)
    }
  }, [session])

  useEffect(() => {
    if (!session || session.role !== 'client') {
      setClientFormState(emptyClientFormState)
      setClientSaveMessage('')
      setClientSaveError('')
      return
    }

    setClientFormState({
      displayName: session.displayName,
      organisation: session.organisation,
    })
  }, [session])

  useEffect(() => {
    if (!isClientSession) {
      return
    }

    void loadSentContacts()
  }, [isClientSession, loadSentContacts])

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  async function handleClientProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!session || session.role !== 'client') {
      return
    }

    setIsSavingClient(true)
    setClientSaveMessage('')
    setClientSaveError('')

    try {
      const updatedSession = await updateClientAccount(session, clientFormState)
      setSession(updatedSession)
      setClientSaveMessage('Vos informations entreprise ont bien été enregistrées.')
    } catch (error) {
      setClientSaveError(
        error instanceof Error ? error.message : 'Impossible d’enregistrer vos informations pour le moment.'
      )
    } finally {
      setIsSavingClient(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className={`rounded-[2rem] bg-gradient-to-br p-8 text-white shadow-xl ${accentTheme.heroGradient}`}>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">Mon espace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {session.role === 'student' ? 'Gérer mon profil' : 'Votre espace entreprise'}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          {session.role === 'student'
            ? 'Retrouvez ici le point d’entrée pour modifier votre présentation publique, vos créations et vos disponibilités.'
            : 'Pilotez vos informations de contact et retrouvez les demandes déjà envoyées aux étudiants.'}
        </p>
      </section>

      {session.role === 'student' ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Profil public</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Accédez à l’édition de votre profil pour mettre à jour votre carte visible dans le listing.
            </p>

            <Link
              to="/profiles/create"
              className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-medium transition ${accentTheme.button}`}
            >
              Modifier mon profil
            </Link>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Retour rapide</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Revenez au listing public à tout moment pour continuer l’exploration des profils.
            </p>
            <Link
              to="/listing"
              className="mt-8 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Retour au listing
            </Link>
          </article>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Modifier le profil entreprise</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ces informations préremplissent le formulaire de contact envoyé aux étudiants.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleClientProfileSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Nom du contact
                  <RequiredMark />
                </span>
                <input
                  type="text"
                  value={clientFormState.displayName}
                  onChange={(event) => {
                    setClientSaveMessage('')
                    setClientSaveError('')
                    setClientFormState((current) => ({ ...current, displayName: event.target.value }))
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                  autoComplete="name"
                  disabled={isSavingClient}
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Organisation</span>
                <input
                  type="text"
                  value={clientFormState.organisation}
                  onChange={(event) => {
                    setClientSaveMessage('')
                    setClientSaveError('')
                    setClientFormState((current) => ({ ...current, organisation: event.target.value }))
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Entreprise, association, particulier..."
                  autoComplete="organization"
                  disabled={isSavingClient}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={session.email}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                  disabled
                />
              </label>

              {clientSaveError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {clientSaveError}
                </div>
              )}

              {clientSaveMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {clientSaveMessage}
                </div>
              )}

              <button
                type="submit"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${accentTheme.button}`}
                disabled={isSavingClient}
              >
                <FiSave className="h-4 w-4" aria-hidden="true" />
                {isSavingClient ? 'Enregistrement...' : 'Enregistrer les informations'}
              </button>
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Contacts envoyés</h2>
                <p className="mt-2 text-sm text-slate-500">{contactCountLabel}</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => void loadSentContacts()}
                disabled={isLoadingContacts}
              >
                <FiRefreshCw className={`h-4 w-4 ${isLoadingContacts ? 'animate-spin' : ''}`} aria-hidden="true" />
                Actualiser
              </button>
            </div>

            {contactsError && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {contactsError}
              </div>
            )}

            <div className="mt-6 space-y-3">
              {isLoadingContacts && sentContacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Chargement des demandes...
                </div>
              ) : sentContacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Aucune demande envoyée pour le moment.
                </div>
              ) : (
                sentContacts.map((contactRequest) => (
                  <div
                    key={contactRequest.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{contactRequest.profileName}</p>
                        <p className="mt-1 text-sm text-slate-500">{contactRequest.profileDomain}</p>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        <FiSend className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatContactDate(contactRequest.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-700">{contactRequest.projectType}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{contactRequest.message}</p>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/listing"
              className="mt-6 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Retour au listing
            </Link>
          </article>
        </section>
      )}
    </main>
  )
}
