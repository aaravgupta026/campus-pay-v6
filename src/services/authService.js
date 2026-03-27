import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase-config'

const googleProvider = new GoogleAuthProvider()

const ensureLocalPersistence = async () => {
  if (!isFirebaseConfigured || !auth) {
    return
  }
  await setPersistence(auth, browserLocalPersistence)
}

export const initializeAuth = async () => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  await ensureLocalPersistence()
  return { ok: true }
}

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  await ensureLocalPersistence()
  const result = await signInWithPopup(auth, googleProvider)
  return { ok: true, user: result.user }
}

export const loginWithEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  await ensureLocalPersistence()
  const result = await signInWithEmailAndPassword(auth, email, password)
  return { ok: true, user: result.user }
}

export const registerWithEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  await ensureLocalPersistence()
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return { ok: true, user: result.user }
}

export const loginAsGuest = async () => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  await ensureLocalPersistence()
  const result = await signInAnonymously(auth)
  return { ok: true, user: result.user }
}

export const signOutUser = async () => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: true }
  }

  await signOut(auth)
  return { ok: true }
}

export const subscribeToAuthChanges = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}
