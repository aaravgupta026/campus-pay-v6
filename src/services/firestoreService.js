// Service Layer - Firestore Data Access Placeholder

export const getFirestoreCollections = {
  users: 'users',
  profiles: 'profiles',
  shops: 'shops',
  expenses: 'expenses',
  feedback: 'feedback'
}

// Firestore collection structure (documentation)
export const FIRESTORE_SCHEMA = {
  users: {
    // uid: auto-generated
    email: 'string',
    createdAt: 'timestamp',
    role: 'string' // 'user' | 'admin'
  },
  profiles: {
    // userId: uid
    name: 'string',
    city: 'string',
    state: 'string',
    preferredUpiApp: 'string',
    phone: 'string'
  },
  shops: {
    // shopId: auto-generated
    name: 'string',
    category: 'string',
    latitude: 'number',
    longitude: 'number',
    createdAt: 'timestamp',
    createdBy: 'string' // admin uid
  },
  expenses: {
    // expenseId: auto-generated
    userId: 'string',
    shopId: 'string',
    amount: 'number',
    upiApp: 'string',
    status: 'string', // 'pending' | 'completed' | 'failed'
    createdAt: 'timestamp',
    notes: 'string'
  },
  feedback: {
    // feedbackId: auto-generated
    userId: 'string',
    message: 'string',
    rating: 'number', // 1-5
    createdAt: 'timestamp'
  }
}

// Placeholder data access wrappers
export const firestoreService = {
  getUserData: async (userId) => {
    console.log('Fetching user data:', userId)
    return null // TODO: Implement with GCP/Firestore
  },

  createExpense: async (userId, expenseData) => {
    console.log('Creating expense for user:', userId, expenseData)
    return null // TODO: Implement
  },

  getUserExpenses: async (userId) => {
    console.log('Fetching expenses for user:', userId)
    return [] // TODO: Implement
  },

  addFeedback: async (userId, feedback) => {
    console.log('Adding feedback:', feedback)
    return null // TODO: Implement
  },

  getShops: async () => {
    console.log('Fetching shops')
    return [] // TODO: Implement
  }
}
