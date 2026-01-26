import type { Article } from '@/types';

interface CacheEntry {
  articles: Article[];
  timestamp: number;
  sources: Array<{
    id: string;
    name: string;
    status: 'ok' | 'error';
    articleCount: number;
  }>;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedFeed(key: string = 'all'): CacheEntry | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    return null;
  }

  return entry;
}

export function setCachedFeed(
  key: string,
  articles: Article[],
  sources: CacheEntry['sources']
): void {
  cache.set(key, {
    articles,
    timestamp: Date.now(),
    sources,
  });
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheAge(key: string = 'all'): number | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return Date.now() - entry.timestamp;
}
