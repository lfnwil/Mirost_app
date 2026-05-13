import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { isFirebaseConfigured } from '@/firebase/firebase'
import { db } from '@/firebase/firestore'
import type { Profile } from '@/types/profile'
import { getDemoContactRequests, setDemoContactRequests } from './demoStorage'

export interface ProfileContactInput {
  senderName: string
  senderEmail: string
  organisation: string
  projectType: string
  message: string
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

export async function submitProfileContactRequest(profile: Profile, input: ProfileContactInput) {
  const normalisedInput = normaliseContactInput(input)

  if (
    !normalisedInput.senderName ||
    !normalisedInput.senderEmail ||
    !normalisedInput.projectType ||
    !normalisedInput.message
  ) {
    throw new Error('Completez les champs obligatoires avant d envoyer votre demande.')
  }

  const contactRequest = {
    profileId: profile.id,
    profileName: profile.name,
    profileDomain: profile.title,
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
