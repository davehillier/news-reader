import type { Article } from '@/types';
import { getSourcePriority } from './feedSources';

// Breaking news signals - high priority keywords
const BREAKING_SIGNALS: RegExp[] = [
  /\bbreaking\b/i,
  /\bjust in\b/i,
  /\burgent\b/i,
  /\bexclusive\b/i,
  /\blive\s*:/i,
  /\bdeveloping\b/i,
  /\bbreaks\s*:/i,
];

// Major event keywords
const MAJOR_EVENT_KEYWORDS: RegExp[] = [
  /\bdies\b/i,
  /\bdead\b/i,
  /\bdeath\b/i,
  /\bresigns\b/i,
  /\bresignation\b/i,
  /\bsacked\b/i,
  /\bfired\b/i,
  /\barrested\b/i,
  /\bcrash\b/i,
  /\battack\b/i,
  /\bshooting\b/i,
  /\bexplosion\b/i,
  /\bearthquake\b/i,
  /\bflood\b/i,
  /\bwins\b/i,
  /\bvictory\b/i,
  /\belection\b/i,
  /\bwar\b/i,
  /\binvasion\b/i,
  /\bcrisis\b/i,
];

// Important topics/figures - UK and world focus
const IMPORTANT_TOPICS: RegExp[] = [
  /prime minister/i,
  /keir starmer/i,
  /rishi sunak/i,
  /king charles/i,
  /royal family/i,
  /parliament/i,
  /downing street/i,
  /westminster/i,
  /cabinet/i,
  /chancellor/i,
  /home secretary/i,
  /foreign secretary/i,
  /nhs/i,
  /bank of england/i,
  /president biden/i,
  /president trump/i,
  /donald trump/i,
  /white house/i,
  /european union/i,
  /nato/i,
  /united nations/i,
  /supreme court/i,
  /climate summit/i,
  /cop\d+/i,
];

interface HeroScore {
  sourceWeight: number;
  breakingScore: number;
  majorEventScore: number;
  importantTopicScore: number;
  hasImage: number;
  recencyScore: number;
  total: number;
}

const WEIGHTS = {
  source: 1.5,
  breaking: 3.0,
  majorEvent: 2.0,
  importantTopic: 1.5,
  image: 0.5,
  recency: 1.0,
};

function matchCount(text: string, patterns: RegExp[]): number {
  return patterns.filter((pattern) => pattern.test(text)).length;
}

function getRecencyScore(publishedAt: string): number {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // Score from 10 (just published) to 0 (24+ hours old)
  if (ageHours < 1) return 10;
  if (ageHours < 2) return 9;
  if (ageHours < 4) return 8;
  if (ageHours < 6) return 7;
  if (ageHours < 12) return 5;
  if (ageHours < 24) return 3;
  return 1;
}

export function calculateHeroScore(article: Article): HeroScore {
  const text = `${article.title} ${article.description || ''}`;

  const sourceWeight = getSourcePriority(article.source.id);
  const breakingScore = matchCount(text, BREAKING_SIGNALS) * 10;
  const majorEventScore = matchCount(text, MAJOR_EVENT_KEYWORDS) * 5;
  const importantTopicScore = matchCount(text, IMPORTANT_TOPICS) * 5;
  const hasImage = article.imageUrl ? 5 : 0;
  const recencyScore = getRecencyScore(article.publishedAt);

  const total =
    sourceWeight * WEIGHTS.source +
    breakingScore * WEIGHTS.breaking +
    majorEventScore * WEIGHTS.majorEvent +
    importantTopicScore * WEIGHTS.importantTopic +
    hasImage * WEIGHTS.image +
    recencyScore * WEIGHTS.recency;

  return {
    sourceWeight,
    breakingScore,
    majorEventScore,
    importantTopicScore,
    hasImage,
    recencyScore,
    total,
  };
}

/**
 * Selects the best hero article from candidates and returns a reordered array
 * with the hero at position 0, followed by remaining articles in original order.
 */
export function selectHeroArticle(articles: Article[]): Article[] {
  if (articles.length <= 1) {
    return articles;
  }

  // Score top candidates (first 30 articles after interleaving)
  const candidates = articles.slice(0, 30);
  const scored = candidates.map((article) => ({
    article,
    score: calculateHeroScore(article),
  }));

  // Find highest scoring article
  let bestIndex = 0;
  let bestScore = scored[0].score.total;

  for (let i = 1; i < scored.length; i++) {
    if (scored[i].score.total > bestScore) {
      bestScore = scored[i].score.total;
      bestIndex = i;
    }
  }

  // If best article is already first, no reordering needed
  if (bestIndex === 0) {
    return articles;
  }

  // Move best article to front, keep rest in order
  const hero = articles[bestIndex];
  const remaining = [...articles.slice(0, bestIndex), ...articles.slice(bestIndex + 1)];

  return [hero, ...remaining];
}
