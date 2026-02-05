import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^"|"$/g, '')  // Strip wrapping quotes if present
    .replace(/\\n/g, '\n'),
};

// Only initialize if credentials are available and not already initialized
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if we have full credentials
  if (firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    return initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: firebaseAdminConfig.projectId,
    });
  }

  // Fall back to default credentials (for local development with gcloud auth)
  return initializeApp({
    projectId: firebaseAdminConfig.projectId,
  });
}

const adminApp = getAdminApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
