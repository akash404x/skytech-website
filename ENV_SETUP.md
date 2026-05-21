# Environment Variables Setup

Copy these values into `.env.local` and replace all placeholder values with your real Firebase project values.

```env
# Firebase client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Bootstrap admin role for the first admin account
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Firebase Admin SDK for server-side payment verification and Firestore writes
# Use either FIREBASE_SERVICE_ACCOUNT_JSON or the three split variables below.
FIREBASE_SERVICE_ACCOUNT_JSON={"project_id":"your-project-id","client_email":"firebase-adminsdk@example.iam.gserviceaccount.com","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Razorpay test mode
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-test-secret
RAZORPAY_MODE=test
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Firebase Authentication with Email/Password and Google providers.
3. Enable Cloud Firestore.
4. Create a Firebase service account key for server route handlers.
5. Add the environment variables above.
6. Add Firestore rules that allow users to read/write only their own `carts`, `orders`, and `payments`, and allow only `admin` or `editor` roles to write products, services, and order statuses.

## Firestore Collections

- `users`: Firebase Auth profile, role, status, order counts, and spending totals.
- `products`: Store inventory managed from `/admin/products`.
- `services`: Service catalog managed from `/admin/services`.
- `carts`: One document per user with synced cart items.
- `orders`: Verified orders created after Razorpay signature validation.
- `payments`: Verified Razorpay transaction history.
