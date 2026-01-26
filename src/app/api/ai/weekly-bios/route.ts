import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type WeeklyBios } from '@/lib/aiTypes';
import { generateWeeklyBiosGemini } from '@/lib/gemini';
import { getAICache, setAICache, invalidateAICache, recordUsageAndCheckBudget } from '@/lib/aiCache';

const MAX_ARTICLES = 500;

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
    'ai/weekly-bios',
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
    const { articles, forceRefresh = false } = await request.json() as {
      articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>;
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
      const cached = await getAICache<WeeklyBios>(userId, 'weekly-bios');
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    } else {
      // Invalidate existing cache on force refresh
      await invalidateAICache(userId, 'weekly-bios');
    }

    // Check daily budget before making AI call
    const budgetCheck = await recordUsageAndCheckBudget('weekly-bios', forceRefresh);
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: budgetCheck.reason || 'Daily AI budget exceeded' },
        { status: 429 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const weeklyBios = await generateWeeklyBiosGemini(articles);

    // Cache the result
    await setAICache(userId, 'weekly-bios', weeklyBios);

    return NextResponse.json({ ...weeklyBios, cached: false });
  } catch (error) {
    console.error('AI weekly bios error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly bios' },
      { status: 500 }
    );
  }
}
