# Campus Pay V6 - Backend README

## Overview
Campus Pay V6 uses **Google Cloud Console** (with Firestore) as the backend, **not** Firebase SDK. This document outlines data structure, security rules, environment configuration, and API patterns for Phase 1 and beyond.

## Architecture Decision
- **Provider**: Google Cloud Console (GCP)
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Google Cloud Identity / Custom tokens
- **Why**: Direct GCP integration provides better control over security rules, multi-region setup, and audit logging
- **Not Used**: Firebase SDK (was deemed too opinionated for this architecture)

## Firestore Collections Schema

### 1. `users` Collection
Stores core user identity and role metadata.
```
/users/{uid}
├── email          (string)       - User email
├── phone          (string)       - User phone (optional)
├── createdAt      (timestamp)    - Account creation
├── role           (string)       - 'user' | 'admin'
├── isVerified     (boolean)      - Email verified
└── lastLoginAt    (timestamp)    - Last login timestamp
```
**Security**: Users can only read/write their own document. Admins can read all.

### 2. `profiles` Collection
User-extended profile information (scoped by userId).
```
/profiles/{userId}
├── name           (string)       - Full name
├── city           (string)       - User city
├── state          (string)       - User state
├── phoneNumber    (string)       - Personal phone
├── preferredUpiApp (string)      - 'googlepay' | 'phonepe' | 'paytm' | 'bhim'
├── profilePhoto   (string)       - Cloud Storage URL
├── bio            (string)       - Short bio
└── updatedAt      (timestamp)    - Last update
```
**Security**: Users can only read/write their own profile.

### 3. `shops` Collection
Shop/vendor catalog (managed by admins, readable by all users).
```
/shops/{shopId}
├── name           (string)       - Shop name
├── category       (string)       - 'food' | 'stationary' | 'other'
├── latitude       (number)       - Location coordinate
├── longitude      (number)       - Location coordinate
├── address        (string)       - Physical address
├── phone          (string)       - Shop contact
├── description    (string)       - Shop description
├── createdAt      (timestamp)    - Creation date
├── createdBy      (string)       - Admin UID who created
├── verifiedAt     (timestamp)    - Verification timestamp (admins only)
└── isActive       (boolean)      - Soft delete flag
```
**Security**: All users can read. Only admins with 'shop.admin' claim can create/edit.

### 4. `expenses` Collection
User expense transactions (scoped by userId).
```
/expenses/{userId}/transactions/{expenseId}
├── shopId         (string)       - Reference to shops/{shopId}
├── amount         (number)       - Transaction amount in rupees
├── upiApp         (string)       - UPI app used ('googlepay', 'phonepe', etc.)
├── description    (string)       - Transaction note
├── status         (string)       - 'pending' | 'completed' | 'failed' | 'refunded'
├── paymentLink    (string)       - UPI deep link used
├── createdAt      (timestamp)    - Transaction creation
├── completedAt    (timestamp)    - Completion timestamp
└── metadata       (map)          - Extra fields for debugging
```
**Security**: Users can only read/write their own expenses. Admins can read all.

### 5. `feedback` Collection
User feedback and ratings (readable by admins, writable by users).
```
/feedback/{feedbackId}
├── userId         (string)       - Feedback author UID
├── message        (string)       - Feedback text
├── rating         (number)       - 1-5 stars
├── category       (string)       - 'bug' | 'feature' | 'ui' | 'other'
├── userEmail      (string)       - Denormalized email for contact
├── createdAt      (timestamp)    - Submission timestamp
├── status         (string)       - 'new' | 'reviewed' | 'resolved'
└── adminNotes     (string)       - Admin response (admins only)
```
**Security**: Users can write. Only status/adminNotes writable by admins.

## Firestore Security Rules

**Location**: `/firestore.rules` (deploy via `gcloud firestore:deploy`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users Collection - UID scoped
    match /users/{userId} {
      allow read: if request.auth.uid == userId || 
                     request.auth.token.role == 'admin';
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if false; // Soft delete only
    }

    // Profiles Collection - UID scoped
    match /profiles/{userId} {
      allow read: if request.auth.uid == userId || 
                     request.auth.token.role == 'admin';
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if false; // Soft delete only
    }

    // Shops Collection - Public read, admin write
    match /shops/{shopId} {
      allow read: if true;
      allow create: if request.auth.token.role == 'admin';
      allow update: if request.auth.token.role == 'admin';
      allow delete: if false; // Soft delete only (set isActive: false)
    }

    // Expenses - Per-user subcollection
    match /expenses/{userId}/transactions/{expenseId} {
      allow read: if request.auth.uid == userId || 
                     request.auth.token.role == 'admin';
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if false; // Soft delete only
    }

    // Feedback - Users write, admins read/moderate
    match /feedback/{feedbackId} {
      allow read: if request.auth.token.role == 'admin';
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.userId ||
                       request.auth.token.role == 'admin';
      allow delete: if false; // Soft delete only
    }

    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Google Cloud Setup (Phase 1)

### Prerequisites
- Google Cloud project created
- Firestore database initialized (Native mode)
- Service account created for backend auth
- gcloud CLI installed

### Initial Configuration
```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create database
gcloud firestore databases create --region us-central1

# Deploy security rules
gcloud firestore deploy --path firestore.rules
```

## Environment Variables

**Frontend (.env.local - never commit):**
```
VITE_GCP_PROJECT_ID=your-project-id
VITE_GCP_API_KEY=your_api_key
VITE_FIRESTORE_DB=your-project-id
VITE_GOOGLE_CLOUD_REGION=us-central1
```

**Backend/Deployment Secrets** (store in GCP Secret Manager):
```
SERVICE_ACCOUNT_KEY=<service-account-json>
FIRESTORE_DATABASE_ID=<database-id>
```

## Data Access Patterns

### Pattern 1: Read User Expenses
```javascript
// Frontend
const userExpenses = await getExpensesForUser(userId, startDate, endDate)
// Returns: sorted by createdAt DESC, filtered by date range
```

### Pattern 2: Write Expense (Post-Payment)
```javascript
async function recordExpense(userId, expense) {
  await firestore
    .collection('expenses')
    .doc(userId)
    .collection('transactions')
    .add({
      shopId: expense.shopId,
      amount: expense.amount,
      upiApp: expense.upiApp,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      paymentLink: expense.deepLink
    })
    // TODO: Trigger cloud function to mark as completed after UPI callback
}
```

### Pattern 3: Read Shops (Geosorted)
```javascript
async function getShopsNearby(lat, lng, radiusKm) {
  // Phase 2: Use Firestore geohashing or Algolia for spatial queries
  // Phase 1: Return all shops, sort on frontend
  const shops = await firestore.collection('shops')
    .where('isActive', '==', true)
    .get()
  return shops.docs.map(doc => doc.data())
}
```

### Pattern 4: Submit Feedback
```javascript
async function submitFeedback(userId, feedback) {
  await firestore.collection('feedback').add({
    userId,
    userEmail: currentUser.email,
    message: feedback.message,
    rating: feedback.rating,
    category: feedback.category,
    createdAt: FieldValue.serverTimestamp(),
    status: 'new'
  })
}
```

## Authentication Flow (GCP)

### Phase 1: Placeholder
- Stateless user context
- No actual GCP auth yet
- Mock UID for testing

### Phase 2: Google Sign-In
1. Frontend redirects to Google login
2. Frontend receives ID token
3. Backend verifies token and sets custom claims (role, etc.)
4. Frontend stores token, hydrates session on refresh
5. All Firestore rules checked against `request.auth.token.role`

## Indexes (Firestore Performance)

Auto-created indexes for common queries:
```
✓ shops: isActive ASC
✓ expenses/{userId}/transactions: createdAt DESC
✓ expenses/{userId}/transactions: status ASC, createdAt DESC
✓ feedback: createdAt DESC
✓ feedback: status ASC, createdAt DESC
```

**Composite Index** (if adding category filters):
```
Collection: shops
- isActive ASC
- category ASC
- createdAt DESC
```

## Cost Optimization
- **Subcollections** for expenses (avoids hot document reads)
- **Denormalization** of email/name in feedback (avoids join queries)
- **Soft deletes** (isActive = false) instead of document deletion
- **Batch writes** for multi-document operations
- **Index optimization** to prevent full collection scans

## Backup & Recovery
```bash
# Export collection to Cloud Storage
gcloud firestore export gs://YOUR_BUCKET/backup-$(date +%s)

# Import from backup
gcloud firestore import gs://YOUR_BUCKET/backup-TIMESTAMP
```

## Monitoring & Logging
- **Firestore Metrics**: Memory Usage, Write/Read Latency, Document Count
- **Activity Logs**: Enable Cloud Audit Logs for compliance
- **Client Errors**: Log via SnackbarHost + Sentry (Phase 2)

## Known Limitations (Phase 1)
- ❌ No real GCP integration yet (auth service stubbed)
- ❌ No geospatial queries (manual frontend sorting)
- ❌ No batch transactions
- ❌ No cloud triggers/functions
- ❌ No data replication/backup setup

## Next Steps (Phase 2+)
1. Implement Google Sign-In with custom tokens
2. Test all Firestore rules in production rules simulator
3. Add geohashing for location-based queries
4. Set up Cloud Functions for async tasks (payment confirmation, etc.)
5. Implement batch expense export to CSV
6. Add admin dashboard for catalog + feedback review
7. Set up monitoring + error tracking

## Security Checklist
- [x] Security rules prevent cross-user data access
- [ ] HTTPS enforced in production
- [ ] Environment secrets stored in GCP Secret Manager (not .env)
- [ ] Service account key rotated every 90 days
- [ ] Firestore backups automated weekly
- [ ] Audit logging enabled for compliance
- [ ] Rate limiting on critical operations
- [ ] CORS configured for frontend domain

## Resources
- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/start)
- [Google Cloud Best Practices](https://cloud.google.com/docs/security/best-practices)
- [Firestore Pricing Calculator](https://cloud.google.com/products/calculator)
- [Data Model Best Practices](https://firebase.google.com/docs/firestore/data-model/structure-data)
