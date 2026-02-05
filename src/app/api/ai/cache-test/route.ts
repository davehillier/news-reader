import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Diagnostic endpoint: tests Firestore read/write without calling any LLM.
 * GET  /api/ai/cache-test - read the test doc
 * POST /api/ai/cache-test - write a test doc then read it back
 */

const TEST_COLLECTION = 'aiCache';
const TEST_DOC_ID = 'cache_test';

export async function GET(request: NextRequest) {
  const authResult = await checkAuthFromRequest(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const steps: Record<string, unknown> = {};

  // Check credentials
  steps.hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  steps.hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  steps.hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  steps.privateKeyLength = process.env.FIREBASE_PRIVATE_KEY?.length ?? 0;
  steps.privateKeyStart = process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) ?? 'MISSING';

  // Try reading the test doc
  try {
    const doc = await adminDb.collection(TEST_COLLECTION).doc(TEST_DOC_ID).get();
    steps.readOk = true;
    steps.docExists = doc.exists;
    steps.docData = doc.exists ? doc.data() : null;
  } catch (error) {
    steps.readOk = false;
    steps.readError = error instanceof Error ? error.message : String(error);
  }

  // Also try reading an existing old cache doc to confirm reads work
  try {
    const oldDoc = await adminDb.collection(TEST_COLLECTION).doc('global_briefing_2026-01-26').get();
    steps.oldDocReadOk = true;
    steps.oldDocExists = oldDoc.exists;
  } catch (error) {
    steps.oldDocReadOk = false;
    steps.oldDocReadError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(steps);
}

export async function POST(request: NextRequest) {
  const authResult = await checkAuthFromRequest(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const steps: Record<string, unknown> = {};
  const now = Date.now();
  const testData = {
    data: {
      greeting: 'Cache test successful',
      timestamp: new Date(now).toISOString(),
    },
    createdAt: now,
  };

  // Step 1: Write
  try {
    await adminDb.collection(TEST_COLLECTION).doc(TEST_DOC_ID).set(testData);
    steps.writeOk = true;
  } catch (error) {
    steps.writeOk = false;
    steps.writeError = error instanceof Error ? error.message : String(error);
    steps.writeErrorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined;
  }

  // Step 2: Read back
  try {
    const doc = await adminDb.collection(TEST_COLLECTION).doc(TEST_DOC_ID).get();
    steps.readBackOk = true;
    steps.readBackExists = doc.exists;
    steps.readBackData = doc.exists ? doc.data() : null;
  } catch (error) {
    steps.readBackOk = false;
    steps.readBackError = error instanceof Error ? error.message : String(error);
  }

  // Step 3: Also test writing to the actual cache key format
  try {
    await adminDb.collection(TEST_COLLECTION).doc('global_briefing').set({
      data: {
        greeting: 'Briefing cache write test',
        topStories: [],
        themes: [],
        conversationStarters: [],
        provider: 'test',
      },
      createdAt: now,
    });
    steps.cacheKeyWriteOk = true;
  } catch (error) {
    steps.cacheKeyWriteOk = false;
    steps.cacheKeyWriteError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(steps);
}
