import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type AIProvider, type MorningBriefing } from '@/lib/aiTypes';
import { generateMorningBriefing as generateMorningBriefingClaude } from '@/lib/claude';
import { generateMorningBriefingGemini } from '@/lib/gemini';
import { getAICache, setAICache, invalidateAICache } from '@/lib/aiCache';

const MAX_ARTICLES = 500;

interface CachedBriefing extends MorningBriefing {
  provider: AIProvider;
}

export async function POST(request: NextRequest) {
  const authResult = await checkAuthFromRequest(request);

  // Must be authenticated (logged in)
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    );
  }

  const userId = authResult.uid || authResult.email || 'anonymous';

  // Rate limiting by user
  const rateLimitResult = checkRateLimit(
    userId,
    'ai/briefing',
    RATE_LIMITS.ai
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const { articles, provider = 'gemini', forceRefresh = false } = await request.json() as {
      articles: Array<{ title: string; description: string; category: string; source: string }>;
      provider?: AIProvider;
      forceRefresh?: boolean;
    };

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'Missing required field: articles (array)' },
        { status: 400 }
      );
    }

    // Limit number of articles to prevent abuse
    if (articles.length > MAX_ARTICLES) {
      return NextResponse.json(
        { error: `Too many articles. Maximum is ${MAX_ARTICLES}` },
        { status: 400 }
      );
    }

    // Check cache first - return if exists and not forcing refresh
    const cached = await getAICache<CachedBriefing>(userId, 'briefing');
    if (cached && !forceRefresh) {
      return NextResponse.json({ ...cached, cached: true, canRefresh: authResult.canGenerate });
    }

    // Only allowed users can force refresh (but anyone can trigger auto-generation if cache is empty)
    if (forceRefresh && !authResult.canGenerate) {
      // Not allowed to refresh - return cached content if available
      if (cached) {
        return NextResponse.json({ ...cached, cached: true, canRefresh: false });
      }
    }

    // Invalidate existing cache on force refresh (only for allowed users)
    if (forceRefresh && authResult.canGenerate) {
      await invalidateAICache(userId, 'briefing');
    }

    let briefing: MorningBriefing;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      briefing = await generateMorningBriefingGemini(articles);
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      briefing = await generateMorningBriefingClaude(articles);
    }

    // Cache the result
    const resultWithProvider: CachedBriefing = { ...briefing, provider };
    await setAICache(userId, 'briefing', resultWithProvider);

    return NextResponse.json({ ...resultWithProvider, cached: false, canRefresh: true });
  } catch (error) {
    console.error('AI briefing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
