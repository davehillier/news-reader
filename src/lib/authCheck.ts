import { NextRequest } from 'next/server';
import { adminAuth } from './firebaseAdmin';
import { isAIAllowed } from './aiTypes';

interface AuthResult {
  authenticated: boolean;  // User is logged in with valid token
  canGenerate: boolean;    // User can trigger AI generation (allowed emails only)
  email?: string;
  uid?: string;
  error?: string;
  // Legacy field for backwards compatibility
  allowed: boolean;
}

/**
 * Verifies Firebase ID token using Firebase Admin SDK.
 * This properly validates the token signature, expiration, and issuer.
 *
 * Returns:
 * - authenticated: true if user has valid Firebase token
 * - canGenerate: true if user is on the allowed list for AI generation
 * - allowed: same as canGenerate (for backwards compatibility)
 */
export async function checkAuthFromRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authenticated: false, canGenerate: false, allowed: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);

  try {
    // Verify the token using Firebase Admin SDK
    // This validates: signature, expiration, issuer, and audience
    const decodedToken = await adminAuth.verifyIdToken(token);

    const email = decodedToken.email;
    const uid = decodedToken.uid;

    if (!email) {
      return { authenticated: false, canGenerate: false, allowed: false, error: 'No email in token' };
    }

    const canGenerate = isAIAllowed(email);

    return { authenticated: true, canGenerate, allowed: canGenerate, email, uid };
  } catch (error) {
    // Don't log the full error in production to avoid leaking info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific Firebase auth errors
    if (errorMessage.includes('expired')) {
      return { authenticated: false, canGenerate: false, allowed: false, error: 'Token expired' };
    }
    if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
      return { authenticated: false, canGenerate: false, allowed: false, error: 'Invalid token' };
    }

    console.error('Token verification failed:', errorMessage);
    return { authenticated: false, canGenerate: false, allowed: false, error: 'Authentication failed' };
  }
}
