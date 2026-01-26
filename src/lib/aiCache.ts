/**
 * Firestore-based cache for AI responses.
 * Cache persists for 24 hours and survives server restarts.
 * Cache is GLOBAL (shared by all users) to minimise AI API calls.
 *
 * Also includes daily usage budget tracking to prevent runaway costs.
 */

import { adminDb } from './firebaseAdmin';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_COLLECTION = 'aiCache';
const USAGE_COLLECTION = 'aiUsage';

// Daily budget limits (estimated tokens)
const DAILY_BUDGET = {
  totalTokens: 100_000,       // ~100k tokens/day across all endpoints
  maxRefreshesPerEndpoint: 5, // Max 5 force refreshes per endpoint per day
};

export type AICacheType = 'briefing' | 'talking-points' | 'weekly-bios';

// Estimated token costs per operation
export const TOKEN_ESTIMATES = {
  briefing: 3100,
  'talking-points': 4400,
  'weekly-bios': 6000,
  ask: 2000,
} as const;

interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
}

/**
 * Get the cache key for a cache type.
 * We use a daily key so cache automatically rotates each day.
 * Cache is global (shared by all users) to minimise AI API calls.
 */
function getCacheKey(type: AICacheType): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `global_${type}_${today}`;
}

/**
 * Get cached AI response if available and not expired.
 */
export async function getAICache<T>(
  _userId: string, // kept for API compatibility, not used
  type: AICacheType
): Promise<T | null> {
  try {
    const cacheKey = getCacheKey(type);
    const docRef = adminDb.collection(CACHE_COLLECTION).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const entry = doc.data() as CacheEntry<T>;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      // Clean up expired entry
      await docRef.delete();
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error reading AI cache:', error);
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
      expiresAt: now + CACHE_TTL_MS,
    };

    await adminDb.collection(CACHE_COLLECTION).doc(cacheKey).set(entry);
  } catch (error) {
    console.error('Error writing AI cache:', error);
    // Don't throw - caching is best-effort
  }
}

/**
 * Invalidate cache for a type (for force refresh).
 */
export async function invalidateAICache(
  _userId: string, // kept for API compatibility, not used
  type: AICacheType
): Promise<void> {
  try {
    const cacheKey = getCacheKey(type);
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
): Promise<{ cached: boolean; createdAt?: Date; expiresAt?: Date } | null> {
  try {
    const cacheKey = getCacheKey(type);
    const docRef = adminDb.collection(CACHE_COLLECTION).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { cached: false };
    }

    const entry = doc.data() as CacheEntry<unknown>;

    if (Date.now() > entry.expiresAt) {
      return { cached: false };
    }

    return {
      cached: true,
      createdAt: new Date(entry.createdAt),
      expiresAt: new Date(entry.expiresAt),
    };
  } catch (error) {
    console.error('Error reading AI cache metadata:', error);
    return { cached: false };
  }
}

// ============================================================================
// Daily Usage Budget Tracking
// ============================================================================

interface DailyUsage {
  date: string;           // YYYY-MM-DD
  totalTokens: number;
  requests: number;
  refreshes: {
    briefing: number;
    'talking-points': number;
    'weekly-bios': number;
  };
}

function getUsageKey(): string {
  const today = new Date().toISOString().split('T')[0];
  return `usage_${today}`;
}

/**
 * Get current daily usage stats.
 */
export async function getDailyUsage(): Promise<DailyUsage> {
  try {
    const usageKey = getUsageKey();
    const docRef = adminDb.collection(USAGE_COLLECTION).doc(usageKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        date: new Date().toISOString().split('T')[0],
        totalTokens: 0,
        requests: 0,
        refreshes: { briefing: 0, 'talking-points': 0, 'weekly-bios': 0 },
      };
    }

    return doc.data() as DailyUsage;
  } catch (error) {
    console.error('Error reading daily usage:', error);
    return {
      date: new Date().toISOString().split('T')[0],
      totalTokens: 0,
      requests: 0,
      refreshes: { briefing: 0, 'talking-points': 0, 'weekly-bios': 0 },
    };
  }
}

/**
 * Record AI usage and check if within budget.
 * Returns { allowed: true } if within budget, or { allowed: false, reason: string } if over.
 */
export async function recordUsageAndCheckBudget(
  type: AICacheType | 'ask',
  isRefresh: boolean = false
): Promise<{ allowed: boolean; reason?: string; usage?: DailyUsage }> {
  try {
    const usageKey = getUsageKey();
    const docRef = adminDb.collection(USAGE_COLLECTION).doc(usageKey);
    const doc = await docRef.get();

    const estimatedTokens = TOKEN_ESTIMATES[type];
    const today = new Date().toISOString().split('T')[0];

    let usage: DailyUsage;
    if (!doc.exists) {
      usage = {
        date: today,
        totalTokens: 0,
        requests: 0,
        refreshes: { briefing: 0, 'talking-points': 0, 'weekly-bios': 0 },
      };
    } else {
      usage = doc.data() as DailyUsage;
    }

    // Check total token budget
    if (usage.totalTokens + estimatedTokens > DAILY_BUDGET.totalTokens) {
      return {
        allowed: false,
        reason: `Daily AI budget exceeded (${Math.round(usage.totalTokens / 1000)}k/${Math.round(DAILY_BUDGET.totalTokens / 1000)}k tokens used)`,
        usage,
      };
    }

    // Check refresh limits for cacheable endpoints
    if (isRefresh && type !== 'ask') {
      const refreshCount = usage.refreshes[type] || 0;
      if (refreshCount >= DAILY_BUDGET.maxRefreshesPerEndpoint) {
        return {
          allowed: false,
          reason: `Maximum ${DAILY_BUDGET.maxRefreshesPerEndpoint} refreshes per day for ${type}. Try again tomorrow.`,
          usage,
        };
      }
    }

    // Update usage
    usage.totalTokens += estimatedTokens;
    usage.requests += 1;
    if (isRefresh && type !== 'ask') {
      usage.refreshes[type] = (usage.refreshes[type] || 0) + 1;
    }

    await docRef.set(usage);

    return { allowed: true, usage };
  } catch (error) {
    console.error('Error recording usage:', error);
    // On error, allow the request but log it
    return { allowed: true };
  }
}

/**
 * Check budget without recording (for pre-flight checks).
 */
export async function checkBudget(
  type: AICacheType | 'ask',
  isRefresh: boolean = false
): Promise<{ allowed: boolean; reason?: string; usage?: DailyUsage }> {
  try {
    const usage = await getDailyUsage();
    const estimatedTokens = TOKEN_ESTIMATES[type];

    // Check total token budget
    if (usage.totalTokens + estimatedTokens > DAILY_BUDGET.totalTokens) {
      return {
        allowed: false,
        reason: `Daily AI budget exceeded`,
        usage,
      };
    }

    // Check refresh limits
    if (isRefresh && type !== 'ask') {
      const refreshCount = usage.refreshes[type] || 0;
      if (refreshCount >= DAILY_BUDGET.maxRefreshesPerEndpoint) {
        return {
          allowed: false,
          reason: `Maximum ${DAILY_BUDGET.maxRefreshesPerEndpoint} refreshes per day for this feature`,
          usage,
        };
      }
    }

    return { allowed: true, usage };
  } catch (error) {
    console.error('Error checking budget:', error);
    return { allowed: true };
  }
}
