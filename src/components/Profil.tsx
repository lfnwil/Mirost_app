import type { KeyboardEvent } from 'react'
import { FiExternalLink, FiPaperclip } from 'react-icons/fi'
import type { Profile } from '@/types/profile'
import ProfileDomainBadge from './ProfileDomainBadge'
import Tags from './Tags'

interface ProfilProps {
  profile: Profile
  onSelect?: (profile: Profile) => void
}

export default function Profil({ profile, onSelect }: ProfilProps) {
  const isInteractive = Boolean(onSelect)
  const availabilityLabel =
    profile.availability.length > 0 ? profile.availability.join(' · ') : 'Disponibilite non renseignee'
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value.charAt(0))
    .join('')
    .toUpperCase()

  function handleSelect() {
    onSelect?.(profile)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  return (
    <article
      className={`flex h-full flex-col gap-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
        isInteractive
          ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900'
          : ''
      }`}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Voir le detail du profil de ${profile.name}` : undefined}
      onClick={isInteractive ? handleSelect : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      <div className="flex items-start gap-4">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`Portrait de ${profile.name}`}
            className="h-14 w-14 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{profile.name}</h2>
          <ProfileDomainBadge domain={profile.title} className="mt-2" />
          <p className="mt-1 text-sm text-slate-500">{profile.location}</p>
        </div>
      </div>

      <Tags tags={profile.tags} />

      {profile.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <FiPaperclip className="h-4 w-4" aria-hidden="true" />
            <span>
              {profile.attachments.length} piece{profile.attachments.length > 1 ? 's' : ''} jointe
              {profile.attachments.length > 1 ? 's' : ''}
            </span>
          </div>

          {profile.links.length > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <FiExternalLink className="h-4 w-4" aria-hidden="true" />
              <span>
                {profile.links.length} lien{profile.links.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {profile.attachments.length === 0 && profile.links.length > 0 && (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          <FiExternalLink className="h-4 w-4" aria-hidden="true" />
          <span>
            {profile.links.length} lien{profile.links.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <p className="text-sm leading-6 text-slate-600">{profile.bio}</p>

      <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="min-w-0 truncate">{availabilityLabel}</span>
        <span className="font-medium text-slate-900">{isInteractive ? 'Voir le detail' : 'Visibilite equitable'}</span>
      </div>
    </article>
  )
}
