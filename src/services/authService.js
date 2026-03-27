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
const LOCAL_GUEST_KEY = 'campus_pay_local_guest'

const buildLocalGuest = () => ({
  uid: 'local-guest',
  isAnonymous: true,
  displayName: 'Guest User',
  email: null,
  providerId: 'local',
})

const getLocalGuest = () => {
  const raw = localStorage.getItem(LOCAL_GUEST_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(LOCAL_GUEST_KEY)
    return null
  }
}

const setLocalGuest = () => {
  const guest = buildLocalGuest()
  localStorage.setItem(LOCAL_GUEST_KEY, JSON.stringify(guest))
  return guest
}

const clearLocalGuest = () => {
  localStorage.removeItem(LOCAL_GUEST_KEY)
}

const ensureLocalPersistence = async () => {
  if (!isFirebaseConfigured || !auth) {
    return
  }
  await setPersistence(auth, browserLocalPersistence)
}

export const initializeAuth = async () => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: true, mode: 'local-only' }
  }

  await ensureLocalPersistence()
  return { ok: true }
}

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  clearLocalGuest()
  await ensureLocalPersistence()
  const result = await signInWithPopup(auth, googleProvider)
  return { ok: true, user: result.user }
}

export const loginWithEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  clearLocalGuest()
  await ensureLocalPersistence()
  const result = await signInWithEmailAndPassword(auth, email, password)
  return { ok: true, user: result.user }
}

export const registerWithEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    return { ok: false, reason: 'missing_firebase_env' }
  }

  clearLocalGuest()
  await ensureLocalPersistence()
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return { ok: true, user: result.user }
}

export const loginAsGuest = async () => {
  if (!isFirebaseConfigured || !auth) {
    const guest = setLocalGuest()
    return { ok: true, user: guest, mode: 'local-guest' }
  }

  try {
    await ensureLocalPersistence()
    const result = await signInAnonymously(auth)
    clearLocalGuest()
    return { ok: true, user: result.user }
  } catch {
    const guest = setLocalGuest()
    return { ok: true, user: guest, mode: 'local-guest' }
  }
}

export const signOutUser = async () => {
  clearLocalGuest()

  if (!isFirebaseConfigured || !auth) {
    return { ok: true }
  }

  await signOut(auth)
  return { ok: true }
}

export const subscribeToAuthChanges = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    callback(getLocalGuest())
    return () => {}
  }

  return onAuthStateChanged(auth, (nextUser) => {
    callback(nextUser || getLocalGuest())
  })
}
