import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { isFirebaseConfigured } from '@/firebase/firebase'
import { db } from '@/firebase/firestore'
import type { AppSession } from '@/types/auth'
import type { Profile } from '@/types/profile'
import { getDemoContactRequests, setDemoContactRequests, type DemoStoredContactRequest } from './demoStorage'

export interface ProfileContactInput {
  senderName: string
  senderEmail: string
  organisation: string
  projectType: string
  message: string
}

export interface ProfileContactRequest extends ProfileContactInput {
  id: string
  profileId: string
  profileName: string
  profileDomain: string
  senderUserId: string
  senderRole: string
  createdAt: string
}

function createContactRequestId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normaliseContactInput(input: ProfileContactInput) {
  return {
    senderName: input.senderName.trim(),
    senderEmail: input.senderEmail.trim().toLowerCase(),
    organisation: input.organisation.trim(),
    projectType: input.projectType.trim(),
    message: input.message.trim(),
  }
}

function normaliseCreatedAt(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  return ''
}

function mapContactRequest(id: string, data: Record<string, unknown>): ProfileContactRequest {
  return {
    id,
    profileId: typeof data.profileId === 'string' ? data.profileId : '',
    profileName: typeof data.profileName === 'string' ? data.profileName : 'Profil étudiant',
    profileDomain: typeof data.profileDomain === 'string' ? data.profileDomain : '',
    senderUserId: typeof data.senderUserId === 'string' ? data.senderUserId : '',
    senderRole: typeof data.senderRole === 'string' ? data.senderRole : '',
    senderName: typeof data.senderName === 'string' ? data.senderName : '',
    senderEmail: typeof data.senderEmail === 'string' ? data.senderEmail : '',
    organisation: typeof data.organisation === 'string' ? data.organisation : '',
    projectType: typeof data.projectType === 'string' ? data.projectType : '',
    message: typeof data.message === 'string' ? data.message : '',
    createdAt: normaliseCreatedAt(data.createdAt),
  }
}

function mapDemoContactRequest(contactRequest: DemoStoredContactRequest): ProfileContactRequest {
  return {
    ...contactRequest,
    senderUserId: contactRequest.senderUserId ?? '',
    senderRole: contactRequest.senderRole ?? '',
  }
}

function contactMatchesSession(contactRequest: ProfileContactRequest, session: AppSession) {
  return (
    contactRequest.senderUserId === session.uid ||
    contactRequest.senderEmail.toLowerCase() === session.email.toLowerCase()
  )
}

function sortContactsByNewest(first: ProfileContactRequest, second: ProfileContactRequest) {
  const firstDate = Date.parse(first.createdAt || '')
  const secondDate = Date.parse(second.createdAt || '')

  return (Number.isNaN(secondDate) ? 0 : secondDate) - (Number.isNaN(firstDate) ? 0 : firstDate)
}

export async function submitProfileContactRequest(
  profile: Profile,
  input: ProfileContactInput,
  session?: AppSession | null
) {
  const normalisedInput = normaliseContactInput(input)

  if (
    !normalisedInput.senderName ||
    !normalisedInput.senderEmail ||
    !normalisedInput.projectType ||
    !normalisedInput.message
  ) {
    throw new Error('Complétez les champs obligatoires avant d’envoyer votre demande.')
  }

  const senderRole = session?.role
  const contactRequest = {
    profileId: profile.id,
    profileName: profile.name,
    profileDomain: profile.title,
    senderUserId: session?.role === 'client' ? session.uid : '',
    senderRole,
    ...normalisedInput,
  }

  if (isFirebaseConfigured) {
    await addDoc(collection(db, 'profileContactRequests'), {
      ...contactRequest,
      createdAt: serverTimestamp(),
    })
    return
  }

  const now = new Date().toISOString()
  setDemoContactRequests([
    ...getDemoContactRequests(),
    {
      id: createContactRequestId(),
      ...contactRequest,
      createdAt: now,
    },
  ])
}

export async function listSentProfileContactRequests(session: AppSession): Promise<ProfileContactRequest[]> {
  if (session.role !== 'client') {
    return []
  }

  if (isFirebaseConfigured) {
    const contactRequestsRef = collection(db, 'profileContactRequests')
    const [byUserSnapshot, byEmailSnapshot] = await Promise.all([
      getDocs(query(contactRequestsRef, where('senderUserId', '==', session.uid))),
      getDocs(query(contactRequestsRef, where('senderEmail', '==', session.email.toLowerCase()))),
    ])
    const contactRequestsById = new Map<string, ProfileContactRequest>()

    ;[...byUserSnapshot.docs, ...byEmailSnapshot.docs].forEach((documentSnapshot) => {
      const contactRequest = mapContactRequest(documentSnapshot.id, documentSnapshot.data())

      if (contactMatchesSession(contactRequest, session)) {
        contactRequestsById.set(contactRequest.id, contactRequest)
      }
    })

    return Array.from(contactRequestsById.values()).sort(sortContactsByNewest)
  }

  return getDemoContactRequests()
    .map(mapDemoContactRequest)
    .filter((contactRequest) => contactMatchesSession(contactRequest, session))
    .sort(sortContactsByNewest)
}
