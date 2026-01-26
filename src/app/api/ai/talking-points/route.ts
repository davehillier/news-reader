import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type AIProvider, type TalkingPoints } from '@/lib/aiTypes';
import { generateTalkingPoints as generateTalkingPointsClaude } from '@/lib/claude';
import { generateTalkingPointsGemini } from '@/lib/gemini';
import { getAICache, setAICache, invalidateAICache, recordUsageAndCheckBudget } from '@/lib/aiCache';

const MAX_ARTICLES = 500;

interface CachedTalkingPoints extends TalkingPoints {
  provider: AIProvider;
}

export async function POST(request: NextRequest) {
  const authResult = await checkAuthFromRequest(request);

  if (!authResult.allowed) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 403 }
    );
  }

  const userId = authResult.uid || authResult.email || 'anonymous';

  // Rate limiting by user
  const rateLimitResult = checkRateLimit(
    userId,
    'ai/talking-points',
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
      articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>;
      provider?: AIProvider;
      forceRefresh?: boolean;
    };

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'Missing required field: articles (array)' },
        { status: 400 }
      );
    }

    // Limit number of articles
    if (articles.length > MAX_ARTICLES) {
      return NextResponse.json(
        { error: `Too many articles. Maximum is ${MAX_ARTICLES}` },
        { status: 400 }
      );
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await getAICache<CachedTalkingPoints>(userId, 'talking-points');
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    } else {
      // Invalidate existing cache on force refresh
      await invalidateAICache(userId, 'talking-points');
    }

    // Check daily budget before making AI call
    const budgetCheck = await recordUsageAndCheckBudget('talking-points', forceRefresh);
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: budgetCheck.reason || 'Daily AI budget exceeded' },
        { status: 429 }
      );
    }

    let talkingPoints: TalkingPoints;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      talkingPoints = await generateTalkingPointsGemini(articles);
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      talkingPoints = await generateTalkingPointsClaude(articles);
    }

    // Cache the result
    const resultWithProvider: CachedTalkingPoints = { ...talkingPoints, provider };
    await setAICache(userId, 'talking-points', resultWithProvider);

    return NextResponse.json({ ...resultWithProvider, cached: false });
  } catch (error) {
    console.error('AI talking points error:', error);
    return NextResponse.json(
      { error: 'Failed to generate talking points' },
      { status: 500 }
    );
  }
}
