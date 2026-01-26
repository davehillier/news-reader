import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { type AIProvider } from '@/lib/aiTypes';
import { askAboutNews as askAboutNewsClaude } from '@/lib/claude';
import { askAboutNewsGemini } from '@/lib/gemini';

const MAX_ARTICLES = 50;
const MAX_QUESTION_LENGTH = 1000;

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
    'ai/ask',
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
    const { question, articles, provider = 'gemini' } = await request.json() as {
      question: string;
      articles: Array<{ title: string; description: string; category: string; source: string }>;
      provider?: AIProvider;
    };

    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    // Limit question length
    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: 'Question too long' },
        { status: 400 }
      );
    }

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

    let answer;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      answer = await askAboutNewsGemini(question, articles);
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }
      answer = await askAboutNewsClaude(question, articles);
    }

    return NextResponse.json({ answer, provider });
  } catch (error) {
    console.error('AI ask error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
