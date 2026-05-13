export const MAX_PROFILE_ATTACHMENTS = 3
export const MAX_PROFILE_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024
export const MAX_PROFILE_TAGS = 5

export interface ProfileAttachment {
  id: string
  name: string
  url: string
  contentType: string
  size: number
}

export interface ProfileLink {
  type: string
  label: string
  url: string
}

export interface Profile {
  id: string
  name: string
  title: string
  bio: string
  tags: string[]
  avatarUrl: string | null
  location: string
  availability: string[]
  attachments: ProfileAttachment[]
  links: ProfileLink[]
}

export interface StudentProfileInput {
  title: string
  bio: string
  tags: string[]
  location: string
  availability: string[]
  attachments: ProfileAttachment[]
  links: ProfileLink[]
}
