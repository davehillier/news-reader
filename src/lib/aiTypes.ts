// Shared AI response types

export type AIProvider = 'claude' | 'gemini';

export interface ArticleSummary {
  keyPoints: string[];
  tldr: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topics: string[];
}

export interface MorningBriefing {
  greeting: string;
  topStories: Array<{
    headline: string;
    insight: string;
    category: string;
  }>;
  themes: string[];
  conversationStarters: string[];
}

export interface WeeklyBio {
  name: string;
  role: string;
  photoSearchQuery: string;
  whoTheyAre: string;
  whyFamous: string;
  whyInNews: string;
  category: 'tech' | 'finance' | 'uk' | 'world' | 'sport' | 'culture' | 'science';
}

export interface WeeklyBios {
  title: string;
  intro: string;
  bios: WeeklyBio[];
}

export interface TalkingPoints {
  todayHighlight: {
    topic: string;
    opener: string;
    insight: string;
    followUp: string;
  };
  weeklyTrends: Array<{
    theme: string;
    summary: string;
    talkingPoint: string;
  }>;
  controversialTake: {
    topic: string;
    contrarian: string;
    caveat: string;
  };
  lightMoment: {
    topic: string;
    quip: string;
  };
  categories: {
    tech: string;
    finance: string;
    uk: string;
    world: string;
    sport: string;
  };
}

/**
 * Get allowed emails from environment variable.
 * Set ALLOWED_AI_EMAILS as a comma-separated list of email addresses.
 * Example: ALLOWED_AI_EMAILS=user1@example.com,user2@example.com
 */
function getAllowedEmails(): string[] {
  const envEmails = process.env.ALLOWED_AI_EMAILS;
  if (!envEmails) {
    return [];
  }
  return envEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

export function isAIAllowed(email: string | null | undefined): boolean {
  if (!email) return false;

  const allowedEmails = getAllowedEmails();

  // If no allowed emails configured, deny all
  if (allowedEmails.length === 0) {
    console.warn('ALLOWED_AI_EMAILS not configured - AI features disabled');
    return false;
  }

  return allowedEmails.includes(email.toLowerCase());
}

/**
 * Client-side allow list check using NEXT_PUBLIC_ALLOWED_AI_EMAILS.
 * Safe to use in 'use client' components.
 */
export function isAIAllowedClient(email: string | null | undefined): boolean {
  if (!email) return false;

  const envEmails = process.env.NEXT_PUBLIC_ALLOWED_AI_EMAILS;
  if (!envEmails) return false;

  const allowedEmails = envEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0);

  return allowedEmails.includes(email.toLowerCase());
}
