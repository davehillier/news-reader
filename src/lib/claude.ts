import Anthropic from '@anthropic-ai/sdk';
import type { ArticleSummary, MorningBriefing, TalkingPoints } from './aiTypes';

// Re-export from shared types
export { isAIAllowed } from './aiTypes';
export type { ArticleSummary, MorningBriefing, TalkingPoints } from './aiTypes';

// Initialize Anthropic client (server-side only)
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export async function summariseArticle(
  title: string,
  content: string,
  source: string
): Promise<ArticleSummary> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyse this news article and provide a structured summary.

Title: ${title}
Source: ${source}
Content: ${content}

Respond with JSON only, no markdown formatting:
{
  "keyPoints": ["point 1", "point 2", "point 3"],
  "tldr": "One sentence summary",
  "sentiment": "positive|negative|neutral|mixed",
  "topics": ["topic1", "topic2"]
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as ArticleSummary;
  } catch {
    return {
      keyPoints: ['Unable to parse summary'],
      tldr: text.slice(0, 200),
      sentiment: 'neutral',
      topics: [],
    };
  }
}

export async function generateMorningBriefing(
  articles: Array<{ title: string; description: string; category: string; source: string }>
): Promise<MorningBriefing> {
  const client = getAnthropicClient();

  // Only use first 15 articles, truncate descriptions to save tokens
  const articleList = articles
    .slice(0, 15)
    .map((a, i) => {
      const desc = a.description?.slice(0, 150) || '';
      return `${i + 1}. [${a.category.toUpperCase()}] ${a.title} (${a.source})${desc ? `\n   ${desc}` : ''}`;
    })
    .join('\n\n');

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a witty, insightful news analyst preparing a ${timeOfDay} briefing for a busy professional. Your tone is British, concise, and occasionally sardonic.

Here are today's top stories:

${articleList}

Create a briefing that will make them conversationally ready.

IMPORTANT: When mentioning any person (politicians, athletes, executives, celebrities, etc.), always include a brief "who they are" context. Never assume the reader knows who someone is. For example, instead of just "Matheus Cunha scored twice", write "Matheus Cunha (Wolves striker, Brazilian international) scored twice".

Respond with JSON only:
{
  "greeting": "A brief, personalised greeting mentioning the time of day",
  "topStories": [
    {
      "headline": "Rewritten headline, punchier",
      "insight": "Why this matters, with a hint of opinion. Include brief bio context for any people mentioned.",
      "category": "tech|finance|uk|world|sport"
    }
  ],
  "themes": ["3-4 overarching themes across all stories"],
  "conversationStarters": ["3 interesting talking points - always include who the person is when mentioning names"]
}

Limit topStories to 5 most significant. Be concise but insightful.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as MorningBriefing;
  } catch {
    return {
      greeting: `Good ${timeOfDay}. Here's what's happening.`,
      topStories: [],
      themes: ['Unable to generate themes'],
      conversationStarters: ['Check back later for conversation starters'],
    };
  }
}

export async function askAboutNews(
  question: string,
  articles: Array<{ title: string; description: string; category: string; source: string }>
): Promise<string> {
  const client = getAnthropicClient();

  // Truncate descriptions to save tokens
  const articleContext = articles
    .slice(0, 20)
    .map((a) => {
      const desc = a.description?.slice(0, 100) || '';
      return `[${a.category}] ${a.title}${desc ? `: ${desc}` : ''}`;
    })
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a helpful news analyst. Based on today's news, answer this question concisely.

Today's headlines:
${articleContext}

Question: ${question}

Provide a brief, helpful answer based on the available news. If the question isn't covered by the news, say so politely.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response';
}

export async function generateTalkingPoints(
  articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>
): Promise<TalkingPoints> {
  const client = getAnthropicClient();

  // Truncate descriptions to save tokens
  const articleList = articles
    .slice(0, 20)
    .map((a, i) => {
      const desc = a.description?.slice(0, 150) || '';
      return `${i + 1}. [${a.category.toUpperCase()}] ${a.title} (${a.source})${desc ? `\n   ${desc}` : ''}`;
    })
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a sophisticated conversationalist helping a professional stay informed. Analyse these news stories and create talking points that would impress colleagues.

Recent news:
${articleList}

Generate conversation-ready talking points. Be witty, insightful, and add perspective that goes beyond the headlines.

CRITICAL RULE: When mentioning ANY person by name, you MUST include a brief "101" identifier explaining who they are. Never assume the reader knows anyone. Examples:
- "Matheus Cunha (Wolves striker, Brazilian international)"
- "Sam Altman (OpenAI CEO)"
- "Keir Starmer (UK Prime Minister, Labour leader)"
- "Jensen Huang (Nvidia CEO, AI chip pioneer)"

This applies to ALL names in ALL fields below.

Respond with JSON only:
{
  "todayHighlight": {
    "topic": "The single most interesting thing to mention today - include who any people are",
    "opener": "A compelling way to bring it up naturally",
    "insight": "Your unique angle or observation (2-3 sentences). Always identify people mentioned.",
    "followUp": "A thought-provoking question to continue the conversation"
  },
  "weeklyTrends": [
    {
      "theme": "An emerging pattern across this week's news",
      "summary": "Brief explanation of the trend - identify any people mentioned",
      "talkingPoint": "How to discuss it intelligently"
    }
  ],
  "controversialTake": {
    "topic": "Something people might disagree on - identify any people",
    "contrarian": "A defensible but interesting counter-view",
    "caveat": "Acknowledgment of the other side"
  },
  "lightMoment": {
    "topic": "Something lighter or amusing - identify who the person is if mentioned",
    "quip": "A witty observation about it - always explain who people are"
  },
  "categories": {
    "tech": "One-liner on tech news - identify people",
    "finance": "One-liner on finance/business - identify people",
    "uk": "One-liner on UK affairs - identify people",
    "world": "One-liner on international news - identify people",
    "sport": "One-liner on sports - always say who the athlete/manager is"
  }
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as TalkingPoints;
  } catch {
    return {
      todayHighlight: {
        topic: 'Unable to generate',
        opener: '',
        insight: 'Please try again later',
        followUp: '',
      },
      weeklyTrends: [],
      controversialTake: {
        topic: '',
        contrarian: '',
        caveat: '',
      },
      lightMoment: {
        topic: '',
        quip: '',
      },
      categories: {
        tech: '',
        finance: '',
        uk: '',
        world: '',
        sport: '',
      },
    };
  }
}
