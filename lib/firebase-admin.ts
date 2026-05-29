import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

const serviceAccount = getServiceAccount();

console.log('=== FIREBASE ADMIN CONFIGURATION ===');
console.log('Firebase Admin: Service account exists:', !!serviceAccount);
if (serviceAccount) {
  console.log('Firebase Admin: Project ID:', serviceAccount.project_id);
  console.log('Firebase Admin: Client email:', serviceAccount.client_email);
}
console.log('Firebase Admin: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('=====================================');

const storageBucket = serviceAccount
  ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
  : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`;

console.log('Firebase Admin: Final storage bucket:', storageBucket);

const adminApp =
  getApps()[0] ??
  initializeApp(
    serviceAccount
      ? {
          credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
          }),
          storageBucket,
        }
      : {
          credential: applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket,
        },
  );

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// Log storage bucket details after initialization
try {
  const bucket = adminStorage.bucket();
  console.log('Firebase Admin: Storage bucket name:', bucket.name);
  console.log('Firebase Admin: Storage bucket exists:', !!bucket);
  if (!bucket.name) {
    console.error('Firebase Admin: ERROR - Storage bucket name is empty!');
  }
} catch (bucketError) {
  console.error('Firebase Admin: ERROR accessing storage bucket:', bucketError);
}
