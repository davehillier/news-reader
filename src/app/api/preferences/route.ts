import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import type { UserPreferences } from '@/types';

const COLLECTION = 'userPreferences';

/**
 * Verify Firebase ID token and extract user ID.
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const doc = await adminDb.collection(COLLECTION).doc(userId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(doc.data() as UserPreferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const body = await request.json() as UserPreferences;

    // Ensure userId matches authenticated user
    if (body.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate the preferences object
    const preferences: UserPreferences = {
      userId,
      enabledSources: Array.isArray(body.enabledSources) ? body.enabledSources : [],
      mutedTopics: Array.isArray(body.mutedTopics) ? body.mutedTopics : [],
      readArticles: Array.isArray(body.readArticles) ? body.readArticles : [],
      savedArticles: Array.isArray(body.savedArticles) ? body.savedArticles : [],
      aiSummariesEnabled: typeof body.aiSummariesEnabled === 'boolean' ? body.aiSummariesEnabled : true,
      lastUpdated: new Date().toISOString(),
    };

    await adminDb.collection(COLLECTION).doc(userId).set(preferences, { merge: true });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    await adminDb.collection(COLLECTION).doc(userId).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
