export type Category = 'all' | 'tech' | 'finance' | 'uk' | 'world' | 'sport' | 'culture' | 'science';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: Category;
  logo?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;        // Short description (1-2 sentences) for compact cards
  fullDescription: string;    // Fuller content (2-3 paragraphs) for expanded view
  url: string;
  imageUrl?: string;
  source: {
    id: string;
    name: string;
  };
  category: Category;
  publishedAt: string;
  author?: string;
  aiSummary?: string;
}

export interface FeedResponse {
  articles: Article[];
  lastUpdated: string;
  sources: Array<{
    id: string;
    name: string;
    status: 'ok' | 'error';
    articleCount: number;
  }>;
}

export interface UserPreferences {
  userId: string;
  enabledSources: string[];
  mutedTopics: string[];
  readArticles: string[];
  savedArticles: string[];
  aiSummariesEnabled: boolean;
  lastUpdated: string;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tech', label: 'Tech' },
  { id: 'finance', label: 'Finance' },
  { id: 'uk', label: 'UK' },
  { id: 'world', label: 'World' },
  { id: 'sport', label: 'Sport' },
  { id: 'culture', label: 'Culture' },
  { id: 'science', label: 'Science' },
];
