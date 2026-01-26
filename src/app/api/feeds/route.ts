import { NextResponse } from 'next/server';
import { FEED_SOURCES, getSourcesByCategory } from '@/lib/feedSources';
import { parseAllFeeds } from '@/lib/rssParser';
import { getCachedFeed, setCachedFeed } from '@/lib/feedCache';
import type { Category, FeedResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request): Promise<NextResponse<FeedResponse>> {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get('category') || 'all') as Category;
  const limit = Math.min(parseInt(searchParams.get('limit') || '300', 10), 300);

  const cacheKey = `feed-${category}`;

  // Check cache first
  const cached = getCachedFeed(cacheKey);
  if (cached) {
    return NextResponse.json({
      articles: cached.articles.slice(0, limit),
      lastUpdated: new Date(cached.timestamp).toISOString(),
      sources: cached.sources,
    });
  }

  // Fetch fresh data
  const sources = getSourcesByCategory(category);
  const { articles, sourceStatuses } = await parseAllFeeds(sources);

  // Cache the results
  setCachedFeed(cacheKey, articles, sourceStatuses);

  return NextResponse.json({
    articles: articles.slice(0, limit),
    lastUpdated: new Date().toISOString(),
    sources: sourceStatuses,
  });
}
