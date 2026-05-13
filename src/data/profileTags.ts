import { profileDomainOptions } from './profileDomains'

export interface ProfileTagGroup {
  label: string
  tags: string[]
}

export const profileTagGroups: ProfileTagGroup[] = profileDomainOptions.map((domain) => ({
  label: domain.label,
  tags: [...domain.tags],
}))

export const profileTags = Array.from(new Set(profileTagGroups.flatMap((group) => group.tags)))
