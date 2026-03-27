// Router - Route definitions and guards

export const routes = [
  { path: '/login', name: 'Login', isPublic: true },
  { path: '/pay', name: 'Pay', requiresAuth: true },
  { path: '/scan', name: 'Scan', requiresAuth: true },
  { path: '/analytics', name: 'Analytics', requiresAuth: true },
  { path: '/profile', name: 'Profile', requiresAuth: true },
  { path: '/playground', name: 'Playground', requiresAuth: true },
  { path: '/admin', name: 'Admin', requiresAuth: true, requiresAdmin: true },
]

// Role-based access guard (placeholder)
export const isAdminUser = async (userId) => {
  // TODO: Check user's profile role in Firestore
  return false
}

export const protectAdminRoute = async (userId) => {
  const isAdmin = await isAdminUser(userId)
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
  return true
}
