import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type AIProvider } from '@/lib/aiTypes';
import { generateTalkingPoints as generateTalkingPointsClaude } from '@/lib/claude';
import { generateTalkingPointsGemini } from '@/lib/gemini';

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
    const { articles, provider = 'gemini' } = await request.json() as {
      articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>;
      provider?: AIProvider;
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

    let talkingPoints;

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

    return NextResponse.json({ ...talkingPoints, provider });
  } catch (error) {
    console.error('AI talking points error:', error);
    return NextResponse.json(
      { error: 'Failed to generate talking points' },
      { status: 500 }
    );
  }
}
