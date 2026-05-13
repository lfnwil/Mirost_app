import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { mockProfiles } from '@/data/mockProfiles'
import { normaliseProfileAvailabilities } from '@/data/profileAvailabilities'
import { normaliseProfileDomain } from '@/data/profileDomains'
import { getProfileLinkOption, profileLinkOptions } from '@/data/profileLinks'
import { isFirebaseConfigured } from '@/firebase/firebase'
import { db } from '@/firebase/firestore'
import { storage } from '@/firebase/storage'
import type { AppSession } from '@/types/auth'
import {
  MAX_PROFILE_ATTACHMENTS,
  MAX_PROFILE_ATTACHMENT_SIZE_BYTES,
  MAX_PROFILE_TAGS,
  type Profile,
  type ProfileAttachment,
  type ProfileLink,
  type StudentProfileInput,
} from '@/types/profile'
import { getDemoStudentProfiles, setDemoStudentProfiles } from './demoStorage'

interface StoredStudentProfileRecord extends StudentProfileInput {
  userId: string
  displayName: string
  avatarUrl: string | null
}

function normaliseTags(tags: string[]) {
  return tags.map((tag) => tag.trim()).filter(Boolean).slice(0, MAX_PROFILE_TAGS)
}

function normaliseAttachments(attachments: unknown): ProfileAttachment[] {
  if (!Array.isArray(attachments)) {
    return []
  }

  return attachments
    .map((attachment) => {
      if (!attachment || typeof attachment !== 'object') {
        return null
      }

      const source = attachment as Record<string, unknown>
      const id = typeof source.id === 'string' && source.id.trim() ? source.id.trim() : ''
      const name = typeof source.name === 'string' && source.name.trim() ? source.name.trim() : ''
      const url = typeof source.url === 'string' && source.url.trim() ? source.url.trim() : ''
      const contentType =
        typeof source.contentType === 'string' && source.contentType.trim()
          ? source.contentType.trim()
          : 'application/octet-stream'
      const size = typeof source.size === 'number' && Number.isFinite(source.size) ? source.size : 0

      if (!name || !url) {
        return null
      }

      return {
        id: id || url,
        name,
        url,
        contentType,
        size,
      }
    })
    .filter((attachment): attachment is ProfileAttachment => attachment !== null)
    .slice(0, MAX_PROFILE_ATTACHMENTS)
}

function normaliseProfileUrl(url: string) {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return ''
  }

  const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`

  try {
    const parsedUrl = new URL(urlWithProtocol)
    return parsedUrl.toString()
  } catch {
    return ''
  }
}

export function normaliseProfileLinks(links: unknown): ProfileLink[] {
  if (!Array.isArray(links)) {
    return []
  }

  const allowedTypes = new Set<string>(profileLinkOptions.map((option) => option.type))

  return links
    .map((link) => {
      if (!link || typeof link !== 'object') {
        return null
      }

      const source = link as Record<string, unknown>
      const type = typeof source.type === 'string' ? source.type.trim() : ''
      const fallbackLabel = typeof source.label === 'string' && source.label.trim() ? source.label.trim() : type
      const option = getProfileLinkOption(type)
      const url = typeof source.url === 'string' ? normaliseProfileUrl(source.url) : ''

      if (!type || !allowedTypes.has(type) || !url) {
        return null
      }

      return {
        type,
        label: option?.label ?? fallbackLabel,
        url,
      }
    })
    .filter((link): link is ProfileLink => link !== null)
}

function buildProfileFromStoredRecord(record: StoredStudentProfileRecord): Profile {
  return {
    id: record.userId,
    name: record.displayName,
    title: normaliseProfileDomain(record.title) || record.title,
    bio: record.bio,
    tags: normaliseTags(record.tags),
    avatarUrl: record.avatarUrl,
    location: record.location,
    availability: normaliseProfileAvailabilities(record.availability),
    attachments: normaliseAttachments(record.attachments),
    links: normaliseProfileLinks(record.links),
  }
}

function buildStudentProfileInput(source: {
  title?: unknown
  bio?: unknown
  location?: unknown
  availability?: unknown
  tags?: unknown
  attachments?: unknown
  links?: unknown
}): StudentProfileInput | null {
  const rawTitle = typeof source.title === 'string' ? source.title.trim() : ''
  const title = normaliseProfileDomain(rawTitle) || rawTitle
  const bio = typeof source.bio === 'string' ? source.bio.trim() : ''
  const location = typeof source.location === 'string' ? source.location.trim() : ''
  const availability = normaliseProfileAvailabilities(source.availability)
  const tags = Array.isArray(source.tags) ? source.tags.filter((tag): tag is string => typeof tag === 'string') : []

  if (!title || !bio || !location || availability.length === 0) {
    return null
  }

  return {
    title,
    bio,
    location,
    availability,
    tags: normaliseTags(tags),
    attachments: normaliseAttachments(source.attachments),
    links: normaliseProfileLinks(source.links),
  }
}

function createAttachmentId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function sanitiseFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isMp3File(file: File) {
  return file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
}

function resolveAttachmentContentType(file: File) {
  if (isMp3File(file)) {
    return 'audio/mpeg'
  }

  return file.type || 'application/octet-stream'
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Impossible de lire cette piece jointe.'))
      }
    }

    reader.onerror = () => reject(new Error('Impossible de lire cette piece jointe.'))
    reader.readAsDataURL(file)
  })
}

export function validateProfileAttachmentFile(file: File) {
  const isSupportedType =
    file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf' || isMp3File(file)

  if (!isSupportedType) {
    return 'Ajoutez uniquement des images, des videos, des fichiers PDF ou MP3.'
  }

  if (file.size > MAX_PROFILE_ATTACHMENT_SIZE_BYTES) {
    return 'Chaque piece jointe doit faire 8 Mo maximum.'
  }

  return ''
}

export async function uploadStudentProfileAttachment(userId: string, file: File): Promise<ProfileAttachment> {
  const validationMessage = validateProfileAttachmentFile(file)

  if (validationMessage) {
    throw new Error(validationMessage)
  }

  const id = createAttachmentId()
  const contentType = resolveAttachmentContentType(file)

  if (isFirebaseConfigured) {
    const storageRef = ref(storage, `studentProfiles/${userId}/attachments/${id}-${sanitiseFileName(file.name)}`)
    await uploadBytes(storageRef, file, { contentType })

    return {
      id,
      name: file.name,
      url: await getDownloadURL(storageRef),
      contentType,
      size: file.size,
    }
  }

  return {
    id,
    name: file.name,
    url: await readFileAsDataUrl(file),
    contentType,
    size: file.size,
  }
}

export async function listPublicProfiles(): Promise<Profile[]> {
  if (isFirebaseConfigured) {
    const snapshot = await getDocs(collection(db, 'studentProfiles'))
    const profiles = snapshot.docs
      .map((entry) => {
        const data = entry.data()
        const profileInput = buildStudentProfileInput(data)

        if (!profileInput) {
          return null
        }

        const displayName =
          typeof data.displayName === 'string' && data.displayName.trim() ? data.displayName : 'Talent MIROST'

        return buildProfileFromStoredRecord({
          userId: entry.id,
          displayName,
          avatarUrl: typeof data.avatarUrl === 'string' || data.avatarUrl === null ? data.avatarUrl : null,
          ...profileInput,
        })
      })
      .filter((profile): profile is Profile => profile !== null)

    return profiles.length > 0 ? profiles : mockProfiles
  }

  const localProfiles = Object.values(getDemoStudentProfiles()).map((profile) => buildProfileFromStoredRecord(profile))

  return localProfiles.length > 0 ? [...localProfiles, ...mockProfiles] : mockProfiles
}

export async function getStudentProfileInput(userId: string): Promise<StudentProfileInput | null> {
  if (isFirebaseConfigured) {
    const snapshot = await getDoc(doc(db, 'studentProfiles', userId))
    return snapshot.exists() ? buildStudentProfileInput(snapshot.data()) : null
  }

  const profile = getDemoStudentProfiles()[userId]
  return profile ? buildStudentProfileInput(profile) : null
}

export async function saveStudentProfile(session: AppSession, input: StudentProfileInput): Promise<Profile> {
  const normalisedInput: StudentProfileInput = {
    title: normaliseProfileDomain(input.title) || input.title.trim(),
    bio: input.bio.trim(),
    location: input.location.trim(),
    availability: normaliseProfileAvailabilities(input.availability),
    tags: normaliseTags(input.tags),
    attachments: normaliseAttachments(input.attachments),
    links: normaliseProfileLinks(input.links),
  }

  const baseRecord: StoredStudentProfileRecord = {
    userId: session.uid,
    displayName: session.displayName,
    avatarUrl: session.photoURL,
    ...normalisedInput,
  }

  if (isFirebaseConfigured) {
    const profileRef = doc(db, 'studentProfiles', session.uid)
    const profileSnapshot = await getDoc(profileRef)
    const profileRecord: Record<string, unknown> = {
      ...baseRecord,
      updatedAt: serverTimestamp(),
    }

    if (!profileSnapshot.exists()) {
      profileRecord.createdAt = serverTimestamp()
    }

    await setDoc(profileRef, profileRecord, { merge: true })
    await setDoc(
      doc(db, 'users', session.uid),
      {
        displayName: session.displayName,
        photoURL: session.photoURL,
        role: 'student',
        hasStudentProfile: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return buildProfileFromStoredRecord(baseRecord)
  }

  const currentProfiles = getDemoStudentProfiles()
  const now = new Date().toISOString()

  setDemoStudentProfiles({
    ...currentProfiles,
    [session.uid]: {
      ...baseRecord,
      createdAt: currentProfiles[session.uid]?.createdAt ?? now,
      updatedAt: now,
    },
  })

  return buildProfileFromStoredRecord(baseRecord)
}
