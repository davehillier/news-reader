import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { generateWeeklyBiosGemini } from '@/lib/gemini';

const MAX_ARTICLES = 100;

export async function POST(request: NextRequest) {
  const authResult = await checkAuthFromRequest(request);

  if (!authResult.allowed) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 403 }
    );
  }

  // Rate limiting by user
  const rateLimitResult = checkRateLimit(
    authResult.uid || authResult.email || 'anonymous',
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
    const { articles } = await request.json() as {
      articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>;
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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const weeklyBios = await generateWeeklyBiosGemini(articles);

    return NextResponse.json(weeklyBios);
  } catch (error) {
    console.error('AI weekly bios error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly bios' },
      { status: 500 }
    );
  }
}
