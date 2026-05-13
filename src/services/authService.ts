import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/firebase/auth'
import { isFirebaseConfigured } from '@/firebase/firebase'
import { db } from '@/firebase/firestore'
import type { AppSession, SignInInput, SignUpInput, UserRole } from '@/types/auth'
import {
  getDemoCurrentUserId,
  getDemoStudentProfiles,
  getDemoUsers,
  setDemoCurrentUserId,
  setDemoUsers,
  subscribeToDemoStorage,
  type DemoStoredUser,
} from './demoStorage'

function getFallbackDisplayName(email: string) {
  return email.split('@')[0] || 'Utilisateur MIROST'
}

function getRoleLabel(role: UserRole) {
  return role === 'student' ? 'étudiant' : 'entreprise / particulier'
}

function buildDemoSession(user: DemoStoredUser): AppSession {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    organisation: user.organisation ?? '',
    role: user.role,
    hasStudentProfile: Boolean(getDemoStudentProfiles()[user.uid]),
    photoURL: user.photoURL,
    source: 'demo',
  }
}

function generateDemoId() {
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function mapFirebaseAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email.'
    case 'auth/invalid-email':
      return 'L email saisi est invalide.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou mot de passe incorrect.'
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caracteres.'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Merci de reessayer dans quelques minutes.'
    case 'auth/network-request-failed':
      return 'Connexion reseau impossible pour le moment.'
    default:
      return error instanceof Error ? error.message : 'Une erreur est survenue pendant l authentification.'
  }
}

async function resolveFirebaseSession(user: FirebaseUser, fallbackRole?: UserRole): Promise<AppSession> {
  const userRef = doc(db, 'users', user.uid)
  const userSnapshot = await getDoc(userRef)
  const userData = userSnapshot.exists() ? userSnapshot.data() : {}
  const role = userData.role === 'client' || userData.role === 'student' ? userData.role : fallbackRole ?? 'student'
  const displayName =
    typeof userData.displayName === 'string' && userData.displayName.trim()
      ? userData.displayName
      : user.displayName?.trim() || getFallbackDisplayName(user.email ?? 'utilisateur@mirost.app')
  const organisation = typeof userData.organisation === 'string' ? userData.organisation.trim() : ''
  const photoURL =
    typeof userData.photoURL === 'string' || userData.photoURL === null ? userData.photoURL : user.photoURL ?? null
  const hasStudentProfile = role === 'student' ? (await getDoc(doc(db, 'studentProfiles', user.uid))).exists() : false

  const userRecord: Record<string, unknown> = {
    uid: user.uid,
    email: user.email ?? '',
    displayName,
    organisation,
    role,
    photoURL,
    hasStudentProfile,
    updatedAt: serverTimestamp(),
  }

  if (!userSnapshot.exists()) {
    userRecord.createdAt = serverTimestamp()
  }

  await setDoc(userRef, userRecord, { merge: true })

  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName,
    organisation,
    role,
    hasStudentProfile,
    photoURL,
    source: 'firebase',
  }
}

export function subscribeToAuthChanges(onChange: (session: AppSession | null) => void) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        onChange(null)
        return
      }

      resolveFirebaseSession(user)
        .then(onChange)
        .catch(() => {
          onChange(null)
        })
    })
  }

  const pushDemoSession = () => {
    const currentUserId = getDemoCurrentUserId()

    if (!currentUserId) {
      onChange(null)
      return
    }

    const currentUser = getDemoUsers().find((user) => user.uid === currentUserId)

    if (!currentUser) {
      setDemoCurrentUserId(null)
      onChange(null)
      return
    }

    onChange(buildDemoSession(currentUser))
  }

  pushDemoSession()

  return subscribeToDemoStorage(pushDemoSession)
}

export async function signUpWithEmail(input: SignUpInput): Promise<AppSession> {
  const email = input.email.trim().toLowerCase()
  const displayName = input.displayName.trim() || getFallbackDisplayName(email)
  const organisation = input.role === 'client' ? input.organisation?.trim() ?? '' : ''

  if (isFirebaseConfigured) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, input.password)
      await updateProfile(credential.user, { displayName })

      const session: AppSession = {
        uid: credential.user.uid,
        email: credential.user.email ?? email,
        displayName,
        organisation,
        role: input.role,
        hasStudentProfile: false,
        photoURL: credential.user.photoURL ?? null,
        source: 'firebase',
      }

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          uid: session.uid,
          email: session.email,
          displayName: session.displayName,
          organisation: session.organisation,
          role: session.role,
          photoURL: session.photoURL,
          hasStudentProfile: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      return session
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error))
    }
  }

  const users = getDemoUsers()

  if (users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error('Un compte existe déjà avec cet email.')
  }

  const nextUser: DemoStoredUser = {
    uid: generateDemoId(),
    email,
    password: input.password,
    displayName,
    organisation,
    role: input.role,
    photoURL: null,
  }

  setDemoUsers([...users, nextUser])
  setDemoCurrentUserId(nextUser.uid)

  return buildDemoSession(nextUser)
}

export async function signInWithEmail(input: SignInInput): Promise<AppSession> {
  const email = input.email.trim().toLowerCase()

  if (isFirebaseConfigured) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, input.password)
      const session = await resolveFirebaseSession(credential.user, input.role)

      if (session.role !== input.role) {
        await signOut(auth)
        throw new Error(`Ce compte est rattache a l espace ${getRoleLabel(session.role)}.`)
      }

      return session
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error))
    }
  }

  const user = getDemoUsers().find((entry) => entry.email.toLowerCase() === email)

  if (!user || user.password !== input.password) {
    throw new Error('Email ou mot de passe incorrect.')
  }

  if (user.role !== input.role) {
    throw new Error(`Ce compte est rattache a l espace ${getRoleLabel(user.role)}.`)
  }

  setDemoCurrentUserId(user.uid)

  return buildDemoSession(user)
}

export async function signOutCurrentUser() {
  if (isFirebaseConfigured) {
    await signOut(auth)
    return
  }

  setDemoCurrentUserId(null)
}
