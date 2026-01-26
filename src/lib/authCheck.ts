import { NextRequest } from 'next/server';
import { adminAuth } from './firebaseAdmin';
import { isAIAllowed } from './aiTypes';

interface AuthResult {
  allowed: boolean;
  email?: string;
  uid?: string;
  error?: string;
}

/**
 * Verifies Firebase ID token using Firebase Admin SDK.
 * This properly validates the token signature, expiration, and issuer.
 */
export async function checkAuthFromRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { allowed: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);

  try {
    // Verify the token using Firebase Admin SDK
    // This validates: signature, expiration, issuer, and audience
    const decodedToken = await adminAuth.verifyIdToken(token);

    const email = decodedToken.email;
    const uid = decodedToken.uid;

    if (!email) {
      return { allowed: false, error: 'No email in token' };
    }

    const allowed = isAIAllowed(email);

    return { allowed, email, uid };
  } catch (error) {
    // Don't log the full error in production to avoid leaking info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific Firebase auth errors
    if (errorMessage.includes('expired')) {
      return { allowed: false, error: 'Token expired' };
    }
    if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
      return { allowed: false, error: 'Invalid token' };
    }

    console.error('Token verification failed:', errorMessage);
    return { allowed: false, error: 'Authentication failed' };
  }
}
