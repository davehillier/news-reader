import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type AIProvider } from '@/lib/aiTypes';
import { generateMorningBriefing as generateMorningBriefingClaude } from '@/lib/claude';
import { generateMorningBriefingGemini } from '@/lib/gemini';

const MAX_ARTICLES = 50;

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
    const { articles, provider = 'gemini' } = await request.json() as {
      articles: Array<{ title: string; description: string; category: string; source: string }>;
      provider?: AIProvider;
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

    let briefing;

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

    return NextResponse.json({ ...briefing, provider });
  } catch (error) {
    console.error('AI briefing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
