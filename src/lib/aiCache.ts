/**
 * Firestore-based cache for AI responses.
 * Cache is GLOBAL (shared by all users) and NEVER expires.
 * Users on the allow list can manually refresh to regenerate content.
 * If cache is empty, content is auto-generated on first request.
 */

import { adminDb } from './firebaseAdmin';

const CACHE_COLLECTION = 'aiCache';

export type AICacheType = 'briefing' | 'talking-points' | 'weekly-bios';

interface CacheEntry<T> {
  data: T;
  createdAt: number;
}

/**
 * Get the cache key for a cache type.
 * Cache is global (shared by all users) - single key per content type.
 */
function getCacheKey(type: AICacheType): string {
  return `global_${type}`;
}

/**
 * Get cached AI response if available.
 * Cache never expires - always returns data if it exists.
 */
export async function getAICache<T>(
  _userId: string, // kept for API compatibility, not used
  type: AICacheType
): Promise<T | null> {
  try {
    const cacheKey = getCacheKey(type);
    console.log(`[Cache] Reading cache for key: ${cacheKey}`);
    const docRef = adminDb.collection(CACHE_COLLECTION).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`[Cache] MISS - No cache found for key: ${cacheKey}`);
      return null;
    }

    const entry = doc.data() as CacheEntry<T>;
    console.log(`[Cache] HIT - Found cache for key: ${cacheKey}, created: ${new Date(entry.createdAt).toISOString()}`);
    return entry.data;
  } catch (error) {
    console.error('[Cache] ERROR reading AI cache:', error);
    return null;
  }
}

/**
 * Store AI response in cache.
 */
export async function setAICache<T>(
  _userId: string, // kept for API compatibility, not used
  type: AICacheType,
  data: T
): Promise<void> {
  try {
    const cacheKey = getCacheKey(type);
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
    };

    console.log(`[Cache] WRITE - Storing cache for key: ${cacheKey}`);
    await adminDb.collection(CACHE_COLLECTION).doc(cacheKey).set(entry);
    console.log(`[Cache] WRITE SUCCESS - Cache stored for key: ${cacheKey}`);
  } catch (error) {
    console.error('[Cache] ERROR writing AI cache:', error);
    // Don't throw - caching is best-effort
  }
}

/**
 * Invalidate cache for a type (for force refresh by allowed users).
 */
export async function invalidateAICache(
  _userId: string, // kept for API compatibility, not used
  type: AICacheType
): Promise<void> {
  try {
    const cacheKey = getCacheKey(type);
    console.log(`[Cache] INVALIDATE - Clearing cache for key: ${cacheKey}`);
    await adminDb.collection(CACHE_COLLECTION).doc(cacheKey).delete();
  } catch (error) {
    console.error('Error invalidating AI cache:', error);
    // Don't throw - cache invalidation is best-effort
  }
}

/**
 * Get cache metadata (for displaying to user).
 */
export async function getAICacheMetadata(
  _userId: string, // kept for API compatibility, not used
  type: AICacheType
): Promise<{ cached: boolean; createdAt?: Date }> {
  try {
    const cacheKey = getCacheKey(type);
    const docRef = adminDb.collection(CACHE_COLLECTION).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { cached: false };
    }

    const entry = doc.data() as CacheEntry<unknown>;

    return {
      cached: true,
      createdAt: new Date(entry.createdAt),
    };
  } catch (error) {
    console.error('Error reading AI cache metadata:', error);
    return { cached: false };
  }
}
