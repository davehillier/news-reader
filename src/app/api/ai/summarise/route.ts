import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type AIProvider } from '@/lib/aiTypes';
import { summariseArticle as summariseArticleClaude } from '@/lib/claude';
import { summariseArticleGemini } from '@/lib/gemini';

const MAX_CONTENT_LENGTH = 50000;

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
    'ai/summarise',
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
    const { title, content, source, provider = 'gemini' } = await request.json() as {
      title: string;
      content: string;
      source?: string;
      provider?: AIProvider;
    };

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    // Limit content length to prevent abuse
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: 'Content too long' },
        { status: 400 }
      );
    }

    let summary;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      summary = await summariseArticleGemini(title, content, source || 'Unknown');
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      summary = await summariseArticleClaude(title, content, source || 'Unknown');
    }

    return NextResponse.json({ ...summary, provider });
  } catch (error) {
    console.error('AI summarise error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
