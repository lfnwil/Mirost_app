import { type FormEvent, useEffect, useRef, useState } from 'react'
import {
  FiClock,
  FiMail,
  FiExternalLink,
  FiFileText,
  FiGithub,
  FiGlobe,
  FiImage,
  FiInstagram,
  FiLinkedin,
  FiMapPin,
  FiMusic,
  FiPaperclip,
  FiVideo,
  FiX,
  FiYoutube,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { submitProfileContactRequest } from '@/services/contactService'
import { useAuthStore } from '@/stores/useAuthStore'
import type { AppSession } from '@/types/auth'
import type { Profile } from '@/types/profile'
import { formatFileSize } from '@/utils/formatFileSize'
import { getRoleAccentTheme } from '@/utils/roleTheme'
import ProfileDomainBadge from './ProfileDomainBadge'
import RequiredMark from './RequiredMark'
import Tags from './Tags'

interface ProfileDetailModalProps {
  profile: Profile | null
  onClose: () => void
}

interface ContactFormState {
  senderName: string
  senderEmail: string
  organisation: string
  projectType: string
  message: string
}

const initialContactFormState: ContactFormState = {
  senderName: '',
  senderEmail: '',
  organisation: '',
  projectType: '',
  message: '',
}

function buildContactFormStateFromSession(session: AppSession | null): ContactFormState {
  if (session?.role !== 'client') {
    return { ...initialContactFormState }
  }

  return {
    senderName: session.displayName,
    senderEmail: session.email,
    organisation: session.organisation,
    projectType: '',
    message: '',
  }
}

function getLinkIcon(type: string): IconType {
  switch (type) {
    case 'instagram':
      return FiInstagram
    case 'linkedin':
      return FiLinkedin
    case 'github':
      return FiGithub
    case 'youtube':
      return FiYoutube
    case 'soundcloud':
      return FiMusic
    case 'portfolio':
      return FiGlobe
    case 'behance':
    default:
      return FiExternalLink
  }
}

export default function ProfileDetailModal({ profile, onClose }: ProfileDetailModalProps) {
  const session = useAuthStore((state) => state.session)
  const openAuthModal = useAuthStore((state) => state.openAuthModal)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const contactFormRef = useRef<HTMLFormElement>(null)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [contactFormState, setContactFormState] = useState<ContactFormState>(initialContactFormState)
  const [contactErrorMessage, setContactErrorMessage] = useState('')
  const [contactSuccessMessage, setContactSuccessMessage] = useState('')
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const isClientSession = session?.role === 'client'
  const shouldShowContactSection = session?.role !== 'student'
  const clientAccentTheme = getRoleAccentTheme('client')
  const contactAccentTheme = isClientSession ? clientAccentTheme : getRoleAccentTheme('guest')
  const studentAccentTheme = getRoleAccentTheme('student')

  useEffect(() => {
    if (!profile) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [profile, onClose])

  useEffect(() => {
    setIsContactFormOpen(false)
    setContactFormState(buildContactFormStateFromSession(session))
    setContactErrorMessage('')
    setContactSuccessMessage('')
    setIsSubmittingContact(false)
  }, [profile?.id, session])

  if (!profile) {
    return null
  }

  const currentProfile = profile
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value.charAt(0))
    .join('')
    .toUpperCase()
  const hasAttachments = profile.attachments.length > 0
  const hasLinks = profile.links.length > 0

  function handleCreateClientAccount() {
    onClose()
    window.requestAnimationFrame(() => {
      openAuthModal('client', 'signup')
    })
  }

  function handleContactFormOpen() {
    if (!isClientSession) {
      return
    }

    setContactFormState(buildContactFormStateFromSession(session))
    setIsContactFormOpen(true)
    setContactErrorMessage('')
    setContactSuccessMessage('')

    window.requestAnimationFrame(() => {
      contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function handleContactFieldChange(field: keyof ContactFormState, value: string) {
    setContactErrorMessage('')
    setContactSuccessMessage('')
    setContactFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setContactErrorMessage('')
    setContactSuccessMessage('')

    if (!isClientSession) {
      setContactErrorMessage('Connectez-vous avec un compte entreprise pour envoyer une demande.')
      return
    }

    setIsSubmittingContact(true)

    try {
      await submitProfileContactRequest(currentProfile, contactFormState, session)
      setContactFormState(buildContactFormStateFromSession(session))
      setIsContactFormOpen(false)
      setContactSuccessMessage('Votre demande a bien été envoyée. Elle est disponible dans votre espace entreprise.')
    } catch (error) {
      setContactErrorMessage(error instanceof Error ? error.message : 'Impossible d’envoyer votre demande pour le moment.')
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-scrollbar max-h-[calc(100vh-4rem)] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`Portrait de ${profile.name}`}
                className="h-20 w-20 shrink-0 rounded-[1.5rem] object-cover"
              />
            ) : (
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] text-xl font-semibold ${studentAccentTheme.selected}`}>
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${studentAccentTheme.badge}`}>
                Profil étudiant
              </span>
              <h2 id="profile-detail-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {profile.name}
              </h2>
              <ProfileDomainBadge domain={profile.title} className="mt-3" />
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fermer"
            title="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            onClick={onClose}
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <FiMapPin className="h-5 w-5 shrink-0 text-slate-900" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">Localisation</p>
              <p>{profile.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <FiClock className="h-5 w-5 shrink-0 text-slate-900" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">Disponibilités</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.availability.length > 0 ? (
                  profile.availability.map((availability) => (
                    <span
                      key={availability}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {availability}
                    </span>
                  ))
                ) : (
                  <p>Disponibilité non renseignée</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          {hasLinks && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Liens</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.links.map((link) => {
                  const LinkIcon = getLinkIcon(link.type)

                  return (
                    <a
                      key={`${link.type}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                      {link.label}
                      <FiExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    </a>
                  )
                })}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Compétences</h3>
            <div className="mt-3">
              <Tags tags={profile.tags} />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Présentation</h3>
            <p className="mt-3 text-base leading-7 text-slate-700">{profile.bio}</p>
          </section>

          {hasAttachments && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pièces jointes</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {profile.attachments.map((attachment) => {
                  const isImage = attachment.contentType.startsWith('image/')
                  const isVideo = attachment.contentType.startsWith('video/')
                  const isAudio = attachment.contentType === 'audio/mpeg' || attachment.name.toLowerCase().endsWith('.mp3')

                  if (isAudio) {
                    return (
                      <div
                        key={attachment.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                          <FiMusic className="h-9 w-9 text-slate-500" aria-hidden="true" />
                        </div>

                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                              {attachment.name}
                            </p>
                            <FiMusic className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          </div>
                          <p className="text-xs font-medium text-slate-500">{formatFileSize(attachment.size)}</p>
                          <audio
                            controls
                            className="w-full"
                            src={attachment.url}
                            aria-label={`Écouter ${attachment.name}`}
                          />
                        </div>
                      </div>
                    )
                  }

                  if (isVideo) {
                    return (
                      <div
                        key={attachment.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        <div className="aspect-[4/3] bg-slate-100">
                          <video
                            controls
                            preload="metadata"
                            className="h-full w-full object-cover"
                            src={attachment.url}
                            aria-label={`Lire ${attachment.name}`}
                          />
                        </div>

                        <div className="space-y-2 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                              {attachment.name}
                            </p>
                            <FiVideo className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          </div>
                          <p className="text-xs font-medium text-slate-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-white hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                        {isImage ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="h-full w-full object-cover"
                          />
                        ) : isVideo ? (
                          <FiVideo className="h-9 w-9 text-slate-500" aria-hidden="true" />
                        ) : attachment.contentType === 'application/pdf' ? (
                          <FiFileText className="h-9 w-9 text-slate-500" aria-hidden="true" />
                        ) : (
                          <FiPaperclip className="h-9 w-9 text-slate-500" aria-hidden="true" />
                        )}
                      </div>

                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                            {attachment.name}
                          </p>
                          {isImage ? (
                            <FiImage className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          ) : (
                            <FiExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          )}

          {shouldShowContactSection && (
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Vous souhaitez échanger avec ce profil ?</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {isClientSession
                    ? 'Envoyez une demande claire avec le contexte de votre projet.'
                    : 'Créez un compte entreprise pour contacter ce profil.'}
                </p>
              </div>

              {isClientSession ? (
                <button
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${clientAccentTheme.button}`}
                  onClick={handleContactFormOpen}
                >
                  <FiMail className="h-4 w-4" aria-hidden="true" />
                  Contacter cet étudiant
                </button>
              ) : (
                <button
                  type="button"
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${contactAccentTheme.button}`}
                  onClick={handleCreateClientAccount}
                >
                  Créer un compte
                </button>
              )}
            </div>

            {contactSuccessMessage && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-semibold">Demande envoyée</p>
                <p className="mt-1">{contactSuccessMessage}</p>
              </div>
            )}

            {isClientSession && isContactFormOpen && (
              <form
                ref={contactFormRef}
                className="mt-5 space-y-4 border-t border-slate-200 pt-5"
                onSubmit={handleContactSubmit}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Nom
                      <RequiredMark />
                    </span>
                    <input
                      type="text"
                      value={contactFormState.senderName}
                      onChange={(event) => handleContactFieldChange('senderName', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Votre nom"
                      autoComplete="name"
                      disabled={isSubmittingContact}
                      required
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Email
                      <RequiredMark />
                    </span>
                    <input
                      type="email"
                      value={contactFormState.senderEmail}
                      onChange={(event) => handleContactFieldChange('senderEmail', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="nom@entreprise.fr"
                      autoComplete="email"
                      disabled={isSubmittingContact}
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Organisation</span>
                    <input
                      type="text"
                      value={contactFormState.organisation}
                      onChange={(event) => handleContactFieldChange('organisation', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Entreprise, association, particulier..."
                      autoComplete="organization"
                      disabled={isSubmittingContact}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Type de projet
                      <RequiredMark />
                    </span>
                    <input
                      type="text"
                      value={contactFormState.projectType}
                      onChange={(event) => handleContactFieldChange('projectType', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Exemple : shooting, logo, vidéo courte"
                      disabled={isSubmittingContact}
                      required
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Message
                    <RequiredMark />
                  </span>
                  <textarea
                    value={contactFormState.message}
                    onChange={(event) => handleContactFieldChange('message', event.target.value)}
                    className="min-h-32 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder="Décrivez le besoin, les dates, le format attendu et toute information utile."
                    disabled={isSubmittingContact}
                    required
                  />
                </label>

                {contactErrorMessage && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {contactErrorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                    onClick={() => setIsContactFormOpen(false)}
                    disabled={isSubmittingContact}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${clientAccentTheme.button}`}
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </div>
              </form>
            )}
          </section>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
