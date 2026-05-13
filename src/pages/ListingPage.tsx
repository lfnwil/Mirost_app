import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiCheck, FiChevronDown, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Profil from '@/components/Profil'
import ProfileDetailModal from '@/components/ProfileDetailModal'
import { profileAvailabilities } from '@/data/profileAvailabilities'
import { getProfileDomainTags, profileDomainOptions } from '@/data/profileDomains'
import { isFirebaseConfigured } from '@/firebase/firebase'
import { listPublicProfiles } from '@/services/profileService'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Profile } from '@/types/profile'

function normaliseSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function ListingPage() {
  const session = useAuthStore((state) => state.session)
  const openAuthModal = useAuthStore((state) => state.openAuthModal)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([])
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const handleProfileSelect = useCallback((profile: Profile) => {
    setSelectedProfile(profile)
  }, [])

  const handleProfileModalClose = useCallback(() => {
    setSelectedProfile(null)
  }, [])

  const availableSkills = useMemo(() => {
    return selectedDomain ? getProfileDomainTags(selectedDomain) : []
  }, [selectedDomain])

  const filteredProfiles = useMemo(() => {
    const searchTerms = normaliseSearchValue(searchQuery)
      .split(/\s+/)
      .filter(Boolean)

    return profiles.filter((profile) => {
      if (selectedDomain && profile.title !== selectedDomain) {
        return false
      }

      if (selectedSkills.length > 0 && !selectedSkills.every((skill) => profile.tags.includes(skill))) {
        return false
      }

      if (
        selectedAvailabilities.length > 0 &&
        !selectedAvailabilities.some((availability) => profile.availability.includes(availability))
      ) {
        return false
      }

      if (searchTerms.length === 0) {
        return true
      }

      const searchableContent = normaliseSearchValue([profile.name, profile.title, ...profile.tags].join(' '))
      return searchTerms.every((term) => searchableContent.includes(term))
    })
  }, [profiles, searchQuery, selectedDomain, selectedSkills, selectedAvailabilities])

  const hasActiveFilters = Boolean(
    searchQuery || selectedDomain || selectedSkills.length > 0 || selectedAvailabilities.length > 0
  )
  const activeAdvancedFilterCount =
    (selectedDomain ? 1 : 0) + selectedSkills.length + selectedAvailabilities.length

  function handleDomainFilterSelect(domain: string) {
    setSelectedDomain((currentDomain) => {
      const nextDomain = currentDomain === domain ? '' : domain
      setSelectedSkills([])
      return nextDomain
    })
  }

  function handleSkillFilterToggle(skill: string) {
    setSelectedSkills((currentSkills) =>
      currentSkills.includes(skill)
        ? currentSkills.filter((currentSkill) => currentSkill !== skill)
        : [...currentSkills, skill]
    )
  }

  function handleAvailabilityFilterSelect(availability: string) {
    setSelectedAvailabilities((currentAvailabilities) =>
      currentAvailabilities.includes(availability)
        ? currentAvailabilities.filter((currentAvailability) => currentAvailability !== availability)
        : [...currentAvailabilities, availability]
    )
  }

  function handleClearFilters() {
    setSearchQuery('')
    setSelectedDomain('')
    setSelectedSkills([])
    setSelectedAvailabilities([])
  }

  useEffect(() => {
    let isActive = true

    listPublicProfiles()
      .then((result) => {
        if (isActive) {
          setProfiles(result)
          setErrorMessage('')
        }
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage('Impossible de charger les profils pour le moment.')
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [session?.hasStudentProfile])

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {!isFirebaseConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          Firebase n est pas configure. Le listing utilise actuellement des donnees de demonstration et les comptes
          sont stockes localement.
        </div>
      )}

      {!session && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Besoin d un espace personnalise ?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Accedez a la pop-up d authentification, puis choisissez votre espace et le mode connexion ou creation.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={() => openAuthModal('client', 'signup')}
              >
                Connexion / inscription
              </button>
            </div>
          </div>
        </section>
      )}

      {session?.role === 'student' && !session.hasStudentProfile && (
        <section className="rounded-[2rem] border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-sky-950">
                Votre compte etudiant est cree, votre profil reste a completer.
              </h2>
              <p className="mt-2 text-sm leading-6 text-sky-900/80">
                Vous pouvez continuer a explorer le listing, ou creer maintenant votre profil pour apparaitre aux
                yeux des entreprises et particuliers.
              </p>
            </div>

            <Link
              to="/profiles/create"
              className="inline-flex items-center justify-center rounded-full bg-sky-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-900"
            >
              Creer mon profil
            </Link>
          </div>
        </section>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <section className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Profils visibles</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Une base de talents creatifs simple a parcourir
          </h2>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center">
            <label className="relative block flex-1">
              <span className="sr-only">Recherche par mots-cles</span>
              <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                placeholder="Nom, competence, formation..."
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Effacer la recherche"
                  title="Effacer la recherche"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                  onClick={() => setSearchQuery('')}
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </label>

            <button
              type="button"
              aria-expanded={isFilterPanelOpen}
              aria-controls="listing-filters"
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                isFilterPanelOpen || activeAdvancedFilterCount > 0
                  ? 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
              onClick={() => setIsFilterPanelOpen((current) => !current)}
            >
              <FiFilter className="h-4 w-4" aria-hidden="true" />
              Filtres
              {activeAdvancedFilterCount > 0 && (
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                    isFilterPanelOpen || activeAdvancedFilterCount > 0
                      ? 'bg-white text-slate-950'
                      : 'bg-slate-950 text-white'
                  }`}
                >
                  {activeAdvancedFilterCount}
                </span>
              )}
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {filteredProfiles.length} profil{filteredProfiles.length > 1 ? 's' : ''} affiche
            {filteredProfiles.length > 1 ? 's' : ''}
          </p>
        </div>

        <div
          id="listing-filters"
          aria-hidden={!isFilterPanelOpen}
          inert={!isFilterPanelOpen}
          className={`grid overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none ${
            isFilterPanelOpen ? 'mt-5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-slate-200 pt-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FiFilter className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    Filtres
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choisissez une formation, puis affinez avec ses competences associees.
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    onClick={handleClearFilters}
                  >
                    <FiX className="h-4 w-4" aria-hidden="true" />
                    Reinitialiser
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profileDomainOptions.map((domainOption) => {
                    const isSelected = selectedDomain === domainOption.label
                    const buttonClassName = isSelected ? domainOption.selectedClassName : domainOption.optionClassName

                    return (
                      <button
                        key={domainOption.label}
                        type="button"
                        aria-pressed={isSelected}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${buttonClassName}`}
                        onClick={() => handleDomainFilterSelect(domainOption.label)}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${domainOption.swatchClassName}`}
                          aria-hidden="true"
                        />
                        {domainOption.label}
                        {isSelected && <FiCheck className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>

                {selectedDomain ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill)

                        return (
                          <button
                            key={skill}
                            type="button"
                            aria-pressed={isSelected}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                              isSelected
                                ? 'border-slate-950 bg-slate-950 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                            onClick={() => handleSkillFilterToggle(skill)}
                          >
                            {isSelected && <FiCheck className="h-4 w-4" aria-hidden="true" />}
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Selectionnez une formation pour afficher les competences disponibles.
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Disponibilite
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profileAvailabilities.map((availability) => {
                      const isSelected = selectedAvailabilities.includes(availability)

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
                          onClick={() => handleAvailabilityFilterSelect(availability)}
                        >
                          {isSelected && <FiCheck className="h-4 w-4" aria-hidden="true" />}
                          {availability}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </section>
      ) : filteredProfiles.length === 0 ? (
        <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Aucun profil trouve</h2>
          <p className="mt-2 text-sm text-slate-500">
            Essayez un autre nom, une autre competence, une autre formation ou une autre disponibilite.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <Profil key={profile.id} profile={profile} onSelect={handleProfileSelect} />
          ))}
        </section>
      )}

      <ProfileDetailModal profile={selectedProfile} onClose={handleProfileModalClose} />
    </main>
  )
}
