'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Article, Category, FeedResponse } from '@/types';

interface UseFeedOptions {
  category?: Category;
  limit?: number;
}

interface UseFeedReturn {
  articles: Article[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  lastUpdated: string | null;
  sourceStatuses: FeedResponse['sources'];
  refresh: () => Promise<void>;
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const { category = 'all', limit = 300 } = options;

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sourceStatuses, setSourceStatuses] = useState<FeedResponse['sources']>([]);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        category,
        limit: limit.toString(),
      });

      // Add cache-busting param for refresh
      if (isRefresh) {
        params.append('_t', Date.now().toString());
      }

      const response = await fetch(`/api/feeds?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }

      const data: FeedResponse = await response.json();

      setArticles(data.articles);
      setLastUpdated(data.lastUpdated);
      setSourceStatuses(data.sources);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [category, limit]);

  // Initial fetch and refetch on category change
  useEffect(() => {
    fetchFeed(false);
  }, [fetchFeed]);

  const refresh = useCallback(async () => {
    await fetchFeed(true);
  }, [fetchFeed]);

  return {
    articles,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    sourceStatuses,
    refresh,
  };
}
