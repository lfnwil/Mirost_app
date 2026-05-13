export const ORGANISATION_TYPE_OPTIONS = [
  { value: 'particulier', label: 'Particulier' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'association', label: 'Association' },
  { value: 'collectif', label: 'Collectif' },
  { value: 'institution', label: 'Institution' },
  { value: 'autre', label: 'Autre' },
] as const

export type OrganisationType = (typeof ORGANISATION_TYPE_OPTIONS)[number]['value']

export const DEFAULT_ORGANISATION_TYPE: OrganisationType = 'particulier'

export function isOrganisationType(value: unknown): value is OrganisationType {
  return ORGANISATION_TYPE_OPTIONS.some((option) => option.value === value)
}

export function inferOrganisationType(organisation?: string | null): OrganisationType {
  const normalisedOrganisation = organisation?.trim().toLowerCase() ?? ''

  if (!normalisedOrganisation || normalisedOrganisation === 'particulier') {
    return DEFAULT_ORGANISATION_TYPE
  }

  return 'entreprise'
}

export function shouldCollectOrganisationName(organisationType: OrganisationType) {
  return organisationType !== 'particulier'
}

export function normaliseOrganisationName(organisationType: OrganisationType, organisation?: string | null) {
  return shouldCollectOrganisationName(organisationType) ? organisation?.trim() ?? '' : ''
}

export function getOrganisationDisplayName(organisationType: OrganisationType, organisation?: string | null) {
  if (!shouldCollectOrganisationName(organisationType)) {
    return 'Particulier'
  }

  return organisation?.trim() ?? ''
}
