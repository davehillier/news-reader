import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { checkRateLimit } from '@/lib/rateLimit';
import { type MorningBriefing, type TalkingPoints, type WeeklyBios } from '@/lib/aiTypes';
import { generateMorningBriefingGemini, generateTalkingPointsGemini, generateWeeklyBiosGemini } from '@/lib/gemini';
import { getAICache, setAICache } from '@/lib/aiCache';
import { generateEmailHTML } from '@/lib/emailTemplate';

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
  const userEmail = authResult.email;

  if (!userEmail) {
    return NextResponse.json(
      { error: 'Email address required' },
      { status: 400 }
    );
  }

  // Rate limiting - use a stricter limit for emails
  const rateLimitResult = checkRateLimit(
    userId,
    'ai/email-digest',
    { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 emails per hour max
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Email limit reached. Please try again later.' },
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

    if (articles.length > MAX_ARTICLES) {
      return NextResponse.json(
        { error: `Too many articles. Maximum is ${MAX_ARTICLES}` },
        { status: 400 }
      );
    }

    // Check Resend API key
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }

    // Try to get all 3 from cache, generate if needed
    let briefing: MorningBriefing | null = null;
    let talkingPoints: TalkingPoints | null = null;
    let weeklyBios: WeeklyBios | null = null;

    // Check caches first
    const cachedBriefing = await getAICache<MorningBriefing & { provider: string }>(userId, 'briefing');
    const cachedTalkingPoints = await getAICache<TalkingPoints & { provider: string }>(userId, 'talking-points');
    const cachedWeeklyBios = await getAICache<WeeklyBios>(userId, 'weekly-bios');

    // Use cached data if available
    if (cachedBriefing) {
      briefing = cachedBriefing;
    }
    if (cachedTalkingPoints) {
      talkingPoints = cachedTalkingPoints;
    }
    if (cachedWeeklyBios) {
      weeklyBios = cachedWeeklyBios;
    }

    // Generate any missing content
    const articlesForAI = articles.map(a => ({
      title: a.title,
      description: a.description,
      category: a.category,
      source: a.source,
      publishedAt: a.publishedAt,
    }));

    // Generate any missing content and cache it
    if (!briefing) {
      briefing = await generateMorningBriefingGemini(articlesForAI);
      await setAICache(userId, 'briefing', { ...briefing, provider: 'gemini' });
    }

    if (!talkingPoints) {
      talkingPoints = await generateTalkingPointsGemini(articlesForAI);
      await setAICache(userId, 'talking-points', { ...talkingPoints, provider: 'gemini' });
    }

    if (!weeklyBios) {
      weeklyBios = await generateWeeklyBiosGemini(articlesForAI);
      await setAICache(userId, 'weekly-bios', weeklyBios);
    }

    // Generate the HTML email
    const emailHTML = generateEmailHTML({
      briefing,
      talkingPoints,
      weeklyBios,
      date: new Date(),
    });

    // Send the email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromAddress = process.env.RESEND_FROM_EMAIL;
    if (!fromAddress) {
      return NextResponse.json(
        { error: 'Email sender not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [userEmail],
      subject: `Your News Digest - ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      html: emailHTML,
    });

    if (error) {
      console.error('Resend error:', error);
      // Provide helpful error messages for common issues
      if (error.message?.includes('only send testing emails')) {
        return NextResponse.json(
          { error: 'Email service in test mode. Please verify your domain at resend.com/domains or use the account owner email.' },
          { status: 503 }
        );
      }
      if (error.message?.includes('not verified')) {
        return NextResponse.json(
          { error: 'Email domain not verified. Please verify at resend.com/domains.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      sentTo: userEmail,
    });
  } catch (error) {
    console.error('Email digest error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email digest' },
      { status: 500 }
    );
  }
}
