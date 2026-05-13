import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import {
  FiCheck,
  FiExternalLink,
  FiGithub,
  FiGlobe,
  FiInstagram,
  FiLinkedin,
  FiMusic,
  FiPaperclip,
  FiTrash2,
  FiUpload,
  FiYoutube,
} from 'react-icons/fi'
import { Navigate, useNavigate } from 'react-router-dom'
import Profil from '@/components/Profil'
import RequiredMark from '@/components/RequiredMark'
import { normaliseProfileAvailabilities, profileAvailabilities } from '@/data/profileAvailabilities'
import { getProfileDomainTags, normaliseProfileDomain, profileDomainOptions } from '@/data/profileDomains'
import { profileLinkOptions, type ProfileLinkType } from '@/data/profileLinks'
import { profileTags } from '@/data/profileTags'
import {
  getStudentProfileInput,
  normaliseProfileLinks,
  saveStudentProfile,
  uploadStudentProfileAttachment,
  validateProfileAttachmentFile,
} from '@/services/profileService'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  MAX_PROFILE_ATTACHMENTS,
  MAX_PROFILE_TAGS,
  type Profile,
  type ProfileAttachment,
  type ProfileLink,
} from '@/types/profile'
import { formatFileSize } from '@/utils/formatFileSize'

interface StudentProfileFormState {
  title: string
  location: string
  availability: string[]
  bio: string
  tags: string[]
  links: ProfileLinkFormState
}

type ProfileLinkFormState = Record<ProfileLinkType, string>

function createInitialLinkFormState(): ProfileLinkFormState {
  return Object.fromEntries(profileLinkOptions.map((option) => [option.type, ''])) as ProfileLinkFormState
}

const initialFormState: StudentProfileFormState = {
  title: '',
  location: '',
  availability: [],
  bio: '',
  tags: [],
  links: createInitialLinkFormState(),
}

interface AttachmentFormItem extends ProfileAttachment {
  file?: File
  isLocalPreview?: boolean
}

const selectableTags = new Set(profileTags)

function normaliseSelectedTags(tags: string[]) {
  return tags.filter((tag) => selectableTags.has(tag)).slice(0, MAX_PROFILE_TAGS)
}

function normaliseSelectedTagsForDomain(tags: string[], domain: string) {
  const domainTags = new Set(getProfileDomainTags(domain))
  return normaliseSelectedTags(tags).filter((tag) => domainTags.has(tag))
}

function buildLinkFormState(links: ProfileLink[]): ProfileLinkFormState {
  const nextLinks = createInitialLinkFormState()

  links.forEach((link) => {
    if (link.type in nextLinks) {
      nextLinks[link.type as ProfileLinkType] = link.url
    }
  })

  return nextLinks
}

function getLinkIcon(type: ProfileLinkType) {
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
    case 'behance':
      return FiExternalLink
    case 'portfolio':
    default:
      return FiGlobe
  }
}

function createLocalAttachmentId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function resolveLocalAttachmentContentType(file: File) {
  return file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
    ? 'audio/mpeg'
    : file.type || 'application/octet-stream'
}

export default function StudentProfileCreatePage() {
  const session = useAuthStore((state) => state.session)
  const status = useAuthStore((state) => state.status)
  const updateStudentProfileStatus = useAuthStore((state) => state.updateStudentProfileStatus)
  const navigate = useNavigate()

  const [formState, setFormState] = useState<StudentProfileFormState>(initialFormState)
  const [attachments, setAttachments] = useState<AttachmentFormItem[]>([])
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const localPreviewUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const localPreviewUrls = localPreviewUrlsRef.current

    return () => {
      localPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
      localPreviewUrls.clear()
    }
  }, [])

  useEffect(() => {
    if (!session || session.role !== 'student') {
      return
    }

    let isActive = true

    setIsBootstrapping(true)

    getStudentProfileInput(session.uid)
      .then((existingProfile) => {
        if (isActive && existingProfile) {
          const profileDomain = normaliseProfileDomain(existingProfile.title)

          setFormState({
            title: profileDomain,
            location: existingProfile.location,
            availability: normaliseProfileAvailabilities(existingProfile.availability),
            bio: existingProfile.bio,
            tags: normaliseSelectedTagsForDomain(existingProfile.tags, profileDomain),
            links: buildLinkFormState(existingProfile.links),
          })
          setAttachments(existingProfile.attachments)
        } else if (isActive) {
          setFormState(initialFormState)
          setAttachments([])
        }
      })
      .finally(() => {
        if (isActive) {
          setIsBootstrapping(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [session])

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (session.role !== 'student') {
    return <Navigate to="/listing" replace />
  }

  const previewTags = formState.tags.slice(0, MAX_PROFILE_TAGS)
  const profileLinks = normaliseProfileLinks(
    profileLinkOptions.map((option) => ({
      type: option.type,
      label: option.label,
      url: formState.links[option.type],
    }))
  )

  const previewProfile: Profile = {
    id: session.uid,
    name: session.displayName,
    title: formState.title || 'Votre formation',
    bio: formState.bio || 'Votre présentation apparaîtra ici pour aider les entreprises à comprendre votre univers.',
    tags: previewTags,
    avatarUrl: session.photoURL,
    location: formState.location || 'Votre ville',
    availability: formState.availability,
    attachments,
    links: profileLinks,
  }
  const remainingAttachmentSlots = MAX_PROFILE_ATTACHMENTS - attachments.length
  const selectedDomainTags = formState.title ? getProfileDomainTags(formState.title) : []
  const selectedTagCount = previewTags.length

  function handleDomainSelect(domain: string) {
    setErrorMessage('')

    setFormState((current) => ({
      ...current,
      title: domain,
      tags: normaliseSelectedTagsForDomain(current.tags, domain),
    }))
  }

  function handleTagToggle(tag: string) {
    setErrorMessage('')

    setFormState((current) => {
      if (current.tags.includes(tag)) {
        return {
          ...current,
          tags: current.tags.filter((selectedTag) => selectedTag !== tag),
        }
      }

      if (current.tags.length >= MAX_PROFILE_TAGS) {
        setErrorMessage(`Vous pouvez sélectionner ${MAX_PROFILE_TAGS} tags maximum.`)
        return current
      }

      return {
        ...current,
        tags: [...current.tags, tag],
      }
    })
  }

  function handleLinkChange(type: ProfileLinkType, value: string) {
    setErrorMessage('')
    setFormState((current) => ({
      ...current,
      links: {
        ...current.links,
        [type]: value,
      },
    }))
  }

  function handleAvailabilityToggle(availability: string) {
    setErrorMessage('')

    setFormState((current) => ({
      ...current,
      availability: current.availability.includes(availability)
        ? current.availability.filter((currentAvailability) => currentAvailability !== availability)
        : [...current.availability, availability],
    }))
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''
    setErrorMessage('')

    if (selectedFiles.length === 0) {
      return
    }

    if (attachments.length + selectedFiles.length > MAX_PROFILE_ATTACHMENTS) {
      setErrorMessage(`Vous pouvez ajouter ${MAX_PROFILE_ATTACHMENTS} pièces jointes maximum.`)
      return
    }

    const validationMessage = selectedFiles.map(validateProfileAttachmentFile).find(Boolean)

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    const nextAttachments = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file)
      localPreviewUrlsRef.current.add(url)

      return {
        id: createLocalAttachmentId(),
        name: file.name,
        url,
        contentType: resolveLocalAttachmentContentType(file),
        size: file.size,
        file,
        isLocalPreview: true,
      }
    })

    setAttachments((current) => [...current, ...nextAttachments])
  }

  function handleRemoveAttachment(attachmentId: string) {
    setAttachments((current) =>
      current.filter((attachment) => {
        const shouldRemove = attachment.id === attachmentId

        if (shouldRemove && attachment.isLocalPreview) {
          URL.revokeObjectURL(attachment.url)
          localPreviewUrlsRef.current.delete(attachment.url)
        }

        return !shouldRemove
      })
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!session) {
      return
    }

    const tags = previewTags

    if (!formState.title) {
      setErrorMessage('Sélectionnez une formation pour indiquer votre filière.')
      return
    }

    if (tags.length === 0) {
      setErrorMessage('Ajoutez au moins une compétence pour décrire votre pratique créative.')
      return
    }

    if (normaliseProfileAvailabilities(formState.availability).length === 0) {
      setErrorMessage('Sélectionnez au moins une disponibilité dans la liste.')
      return
    }

    const filledLinkCount = profileLinkOptions.filter((option) => formState.links[option.type].trim()).length

    if (filledLinkCount !== profileLinks.length) {
      setErrorMessage('Vérifiez vos liens : ils doivent pointer vers une URL valide.')
      return
    }

    setIsSaving(true)

    try {
      const savedAttachments: ProfileAttachment[] = []

      for (const attachment of attachments) {
        if (attachment.file) {
          savedAttachments.push(await uploadStudentProfileAttachment(session.uid, attachment.file))
        } else {
          savedAttachments.push({
            id: attachment.id,
            name: attachment.name,
            url: attachment.url,
            contentType: attachment.contentType,
            size: attachment.size,
          })
        }
      }

      await saveStudentProfile(session, {
        title: formState.title,
        location: formState.location,
        availability: formState.availability,
        bio: formState.bio,
        tags,
        attachments: savedAttachments,
        links: profileLinks,
      })

      updateStudentProfileStatus(true)
      navigate('/listing')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Impossible d’enregistrer votre profil pour le moment.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Création du profil étudiant</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Présentez clairement votre univers créatif
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Cette fiche sera visible dans le listing public. Elle permet aux entreprises de comprendre votre formation,
            vos compétences, vos disponibilités et les créations que vous souhaitez montrer.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Formation
                <RequiredMark />
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Sélectionnez une seule filière principale pour classer votre profil. Chaque formation garde la même
                couleur dans le listing.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {profileDomainOptions.map((domainOption) => {
                const isSelected = formState.title === domainOption.label
                const buttonClassName = isSelected ? domainOption.selectedClassName : domainOption.optionClassName

                return (
                  <button
                    key={domainOption.label}
                    type="button"
                    aria-pressed={isSelected}
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                      isSelected ? buttonClassName : `${buttonClassName} hover:bg-white`
                    }`}
                    onClick={() => handleDomainSelect(domainOption.label)}
                    disabled={isSaving}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className={`h-3 w-3 shrink-0 rounded-full ${domainOption.swatchClassName}`} aria-hidden="true" />
                      <span className="truncate">{domainOption.label}</span>
                    </span>
                    {isSelected && <FiCheck className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Localisation
                <RequiredMark />
              </span>
              <input
                type="text"
                value={formState.location}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="Exemple : Paris"
                required
              />
            </label>
          </div>

          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Disponibilités
                  <RequiredMark />
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Sélectionnez toutes les disponibilités qui correspondent à votre rythme de travail.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {formState.availability.length} sélectionnée{formState.availability.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {profileAvailabilities.map((availability) => {
                const isSelected = formState.availability.includes(availability)

                return (
                  <button
                    key={availability}
                    type="button"
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                      isSelected
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                    onClick={() => handleAvailabilityToggle(availability)}
                    disabled={isSaving}
                  >
                    {isSelected && <FiCheck className="h-4 w-4" aria-hidden="true" />}
                    {availability}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Compétences créatives
                  <RequiredMark />
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Sélectionnez les compétences depuis la liste commune pour faciliter la recherche côté entreprise.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {selectedTagCount}/{MAX_PROFILE_TAGS} sélectionnées
              </span>
            </div>

            <div className="space-y-4">
              {formState.title ? (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {formState.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDomainTags.map((tag) => {
                      const isSelected = formState.tags.includes(tag)
                      const isDisabled = !isSelected && selectedTagCount >= MAX_PROFILE_TAGS

                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={isSelected}
                          disabled={isDisabled || isSaving}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                            isSelected
                              ? 'border-slate-950 bg-slate-950 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45'
                          }`}
                          onClick={() => handleTagToggle(tag)}
                        >
                          {isSelected && <FiCheck className="h-4 w-4" aria-hidden="true" />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                  Sélectionnez d’abord une formation pour afficher les compétences associées.
                </div>
              )}
            </div>
          </section>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Présentation
              <RequiredMark />
            </span>
            <textarea
              value={formState.bio}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              className="min-h-40 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              placeholder="Présentez votre pratique, vos formats de travail et ce que vous aimez réaliser."
              required
            />
          </label>

          <section className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Liens externes</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ajoutez vos espaces publics pour permettre aux entreprises de consulter votre univers et vos travaux.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {profileLinkOptions.map((option) => {
                const LinkIcon = getLinkIcon(option.type)

                return (
                  <label key={option.type} className="block space-y-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <LinkIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      {option.label}
                    </span>
                    <input
                      type="text"
                      inputMode="url"
                      value={formState.links[option.type]}
                      onChange={(event) => handleLinkChange(option.type, event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                      placeholder={option.placeholder}
                      disabled={isSaving}
                    />
                  </label>
                )
              })}
            </div>
          </section>

          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Pièces jointes</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Ajoutez jusqu’à {MAX_PROFILE_ATTACHMENTS} images, vidéos, PDF ou MP3 pour montrer vos créations.
                </p>
              </div>

              <label
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  remainingAttachmentSlots > 0 && !isSaving
                    ? 'cursor-pointer bg-slate-950 text-white hover:bg-slate-800'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                }`}
              >
                <FiUpload className="h-4 w-4" aria-hidden="true" />
                Ajouter
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*,video/*,application/pdf,audio/mpeg,.mp3"
                  multiple
                  onChange={handleAttachmentChange}
                  disabled={remainingAttachmentSlots === 0 || isSaving}
                />
              </label>
            </div>

            {attachments.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-3">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FiPaperclip className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{attachment.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      disabled={isSaving}
                    >
                      <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                Aucune pièce jointe ajoutée pour le moment.
              </div>
            )}
          </section>

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => navigate('/listing')}
            >
              Retour au listing
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving || isBootstrapping}
            >
              {isSaving ? 'Enregistrement...' : 'Publier mon profil'}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Aperçu en direct</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Voici le rendu de votre carte</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            L’aperçu vous aide à garder une fiche claire, concise et facile à parcourir pour les entreprises et
            particuliers.
          </p>
        </section>

        <div className={isBootstrapping ? 'opacity-60' : ''}>
          <Profil profile={previewProfile} />
        </div>
      </aside>
    </main>
  )
}
