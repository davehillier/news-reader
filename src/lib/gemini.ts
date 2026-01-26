import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ArticleSummary, MorningBriefing, TalkingPoints, WeeklyBios } from './aiTypes';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export async function summariseArticleGemini(
  title: string,
  content: string,
  source: string
): Promise<ArticleSummary> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analyse this news article and provide a structured summary.

Title: ${title}
Source: ${source}
Content: ${content}

Respond with JSON only, no markdown formatting or code blocks:
{
  "keyPoints": ["point 1", "point 2", "point 3"],
  "tldr": "One sentence summary",
  "sentiment": "positive|negative|neutral|mixed",
  "topics": ["topic1", "topic2"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    // Clean up potential markdown code blocks
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as ArticleSummary;
  } catch {
    return {
      keyPoints: ['Unable to parse summary'],
      tldr: text.slice(0, 200),
      sentiment: 'neutral',
      topics: [],
    };
  }
}

export async function generateMorningBriefingGemini(
  articles: Array<{ title: string; description: string; category: string; source: string }>
): Promise<MorningBriefing> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

  const prompt = `You are a witty, insightful news analyst preparing a ${timeOfDay} briefing for a busy professional. Your tone is British, concise, and occasionally sardonic.

Here are today's top stories:

${articleList}

Create a briefing that will make them conversationally ready.

IMPORTANT: When mentioning any person (politicians, athletes, executives, celebrities, etc.), always include a brief "who they are" context. Never assume the reader knows who someone is. For example, instead of just "Matheus Cunha scored twice", write "Matheus Cunha (Wolves striker, Brazilian international) scored twice".

Respond with JSON only, no markdown:
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

Limit topStories to 5 most significant. Be concise but insightful.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as MorningBriefing;
  } catch {
    return {
      greeting: `Good ${timeOfDay}. Here's what's happening.`,
      topStories: [],
      themes: ['Unable to generate themes'],
      conversationStarters: ['Check back later for conversation starters'],
    };
  }
}

export async function askAboutNewsGemini(
  question: string,
  articles: Array<{ title: string; description: string; category: string; source: string }>
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Truncate descriptions to save tokens
  const articleContext = articles
    .slice(0, 20)
    .map((a) => {
      const desc = a.description?.slice(0, 100) || '';
      return `[${a.category}] ${a.title}${desc ? `: ${desc}` : ''}`;
    })
    .join('\n');

  const prompt = `You are a helpful news analyst. Based on today's news, answer this question concisely.

Today's headlines:
${articleContext}

Question: ${question}

Provide a brief, helpful answer based on the available news. If the question isn't covered by the news, say so politely.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateTalkingPointsGemini(
  articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>
): Promise<TalkingPoints> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Truncate descriptions to save tokens
  const articleList = articles
    .slice(0, 20)
    .map((a, i) => {
      const desc = a.description?.slice(0, 150) || '';
      return `${i + 1}. [${a.category.toUpperCase()}] ${a.title} (${a.source})${desc ? `\n   ${desc}` : ''}`;
    })
    .join('\n\n');

  const prompt = `You are a sophisticated conversationalist helping a professional stay informed. Analyse these news stories and create talking points that would impress colleagues.

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
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as TalkingPoints;
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

export async function generateWeeklyBiosGemini(
  articles: Array<{ title: string; description: string; category: string; source: string; publishedAt: string }>
): Promise<WeeklyBios> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Truncate descriptions to save tokens
  const articleList = articles
    .slice(0, 30)
    .map((a, i) => {
      const desc = a.description?.slice(0, 150) || '';
      return `${i + 1}. [${a.category.toUpperCase()}] ${a.title} (${a.source})${desc ? `\n   ${desc}` : ''}`;
    })
    .join('\n\n');

  const prompt = `You are a news analyst creating a "Who's Who" guide for this week's news. Analyse these stories and identify the 10 most prominent people mentioned.

Recent news:
${articleList}

Create biographical profiles for exactly 10 newsworthy people this week with this SPECIFIC distribution:
- 5 people from general news (tech, finance, uk, world categories - NOT sport or culture)
- 3 people from sport
- 2 people from culture (music, film, TV, entertainment)

These should be people actually mentioned in or relevant to the news stories above. If there aren't enough people from a category in the news, include notable figures currently in the headlines.

For each person, provide:
1. Their full name
2. Their current role/position (be specific)
3. A search query that would find a good professional photo of them (e.g., "Elon Musk portrait official" or "Keir Starmer headshot")
4. A 2-3 sentence summary of who they are and their background
5. Why they are famous or notable (their major achievements/reputation)
6. Why they are in the news THIS week specifically (based on the articles above)

Respond with JSON only, no markdown:
{
  "title": "This Week's Newsmakers",
  "intro": "A brief, witty introduction to this week's key figures (1-2 sentences)",
  "bios": [
    {
      "name": "Full Name",
      "role": "Current Position, Organisation",
      "photoSearchQuery": "Name portrait official photo",
      "whoTheyAre": "2-3 sentence biography covering background, education, career path",
      "whyFamous": "What they're known for - major achievements, reputation, influence",
      "whyInNews": "Specific reason they're in THIS week's news based on the articles",
      "category": "tech|finance|uk|world|sport|culture|science"
    }
  ]
}

IMPORTANT:
- You MUST return exactly 10 people with this distribution: 5 general news, 3 sport, 2 culture
- Order them with general news first, then sport, then music
- Be specific about WHY they're in the news this week - reference actual stories
- The photoSearchQuery should be specific enough to find a recognisable headshot`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as WeeklyBios;
  } catch {
    return {
      title: "This Week's Newsmakers",
      intro: 'Unable to generate bios. Please try again.',
      bios: [],
    };
  }
}
