import type { FeedSource, Category } from '@/types';

// Source priority weights for hero article selection
// Higher values = more likely to be featured as hero
export const SOURCE_PRIORITY: Record<string, number> = {
  // Major news organisations (highest priority for hero)
  'bbc-uk': 10,
  'bbc-world': 10,
  'bbc-business': 9,
  'bbc-science': 9,
  'bbc-sport': 8,
  'bbc-entertainment': 7,
  'guardian-uk': 9,
  'guardian-world': 9,
  'guardian-business': 8,
  'guardian-science': 8,
  'guardian-sport': 7,
  'guardian-environment': 8,
  'reuters-world': 9,
  'aljazeera': 8,
  'sky-uk': 7,
  'sky-sports': 6,
  'ft-markets': 8,
  'euronews': 7,
  'france24': 7,
  'scmp': 7,
  // Tech sources (medium priority)
  'guardian-tech': 7,
  'techcrunch': 5,
  'verge': 5,
  'ars': 4,
  // Culture/entertainment (lower priority for hero)
  'guardian-music': 5,
  'guardian-film': 5,
  'guardian-tv': 5,
  'nme': 4,
  'pitchfork': 4,
  // Science niche
  'nasa': 6,
  'new-scientist': 5,
};

export const DEFAULT_SOURCE_PRIORITY = 5;

export function getSourcePriority(sourceId: string): number {
  return SOURCE_PRIORITY[sourceId] ?? DEFAULT_SOURCE_PRIORITY;
}

export const FEED_SOURCES: FeedSource[] = [
  // Tech
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'tech',
  },
  {
    id: 'verge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'tech',
  },
  {
    id: 'ars',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'tech',
  },
  {
    id: 'guardian-tech',
    name: 'Guardian Tech',
    url: 'https://www.theguardian.com/uk/technology/rss',
    category: 'tech',
  },

  // Finance
  {
    id: 'bbc-business',
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'finance',
  },
  {
    id: 'ft-markets',
    name: 'FT Markets',
    url: 'https://www.ft.com/markets?format=rss',
    category: 'finance',
  },
  {
    id: 'guardian-business',
    name: 'Guardian Business',
    url: 'https://www.theguardian.com/uk/business/rss',
    category: 'finance',
  },

  // UK News
  {
    id: 'bbc-uk',
    name: 'BBC UK',
    url: 'https://feeds.bbci.co.uk/news/uk/rss.xml',
    category: 'uk',
  },
  {
    id: 'guardian-uk',
    name: 'Guardian UK',
    url: 'https://www.theguardian.com/uk-news/rss',
    category: 'uk',
  },
  {
    id: 'sky-uk',
    name: 'Sky News UK',
    url: 'https://feeds.skynews.com/feeds/rss/uk.xml',
    category: 'uk',
  },

  // World News
  {
    id: 'bbc-world',
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world',
  },
  {
    id: 'guardian-world',
    name: 'Guardian World',
    url: 'https://www.theguardian.com/world/rss',
    category: 'world',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'world',
  },

  // Sport
  {
    id: 'bbc-sport',
    name: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/rss.xml',
    category: 'sport',
  },
  {
    id: 'sky-sports',
    name: 'Sky Sports',
    url: 'https://www.skysports.com/rss/12040',
    category: 'sport',
  },
  {
    id: 'guardian-sport',
    name: 'Guardian Sport',
    url: 'https://www.theguardian.com/uk/sport/rss',
    category: 'sport',
  },

  // Culture & Entertainment
  {
    id: 'bbc-entertainment',
    name: 'BBC Entertainment',
    url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    category: 'culture',
  },
  {
    id: 'guardian-music',
    name: 'Guardian Music',
    url: 'https://www.theguardian.com/music/rss',
    category: 'culture',
  },
  {
    id: 'guardian-film',
    name: 'Guardian Film',
    url: 'https://www.theguardian.com/film/rss',
    category: 'culture',
  },
  {
    id: 'guardian-tv',
    name: 'Guardian TV & Radio',
    url: 'https://www.theguardian.com/tv-and-radio/rss',
    category: 'culture',
  },
  {
    id: 'nme',
    name: 'NME',
    url: 'https://www.nme.com/feed',
    category: 'culture',
  },
  {
    id: 'pitchfork',
    name: 'Pitchfork',
    url: 'https://pitchfork.com/feed/feed-news/rss',
    category: 'culture',
  },

  // Science & Environment
  {
    id: 'bbc-science',
    name: 'BBC Science',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'science',
  },
  {
    id: 'guardian-science',
    name: 'Guardian Science',
    url: 'https://www.theguardian.com/science/rss',
    category: 'science',
  },
  {
    id: 'guardian-environment',
    name: 'Guardian Environment',
    url: 'https://www.theguardian.com/environment/rss',
    category: 'science',
  },
  {
    id: 'nasa',
    name: 'NASA',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'science',
  },
  {
    id: 'new-scientist',
    name: 'New Scientist',
    url: 'https://www.newscientist.com/section/news/feed/',
    category: 'science',
  },

  // Wire Services (cross-category, adding to World for broad coverage)
  {
    id: 'reuters-world',
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/?best-regions=europe&post_type=best',
    category: 'world',
  },

  // International Sources
  {
    id: 'euronews',
    name: 'Euronews',
    url: 'https://www.euronews.com/rss?level=theme&name=news',
    category: 'world',
  },
  {
    id: 'france24',
    name: 'France 24',
    url: 'https://www.france24.com/en/rss',
    category: 'world',
  },
  {
    id: 'scmp',
    name: 'South China Morning Post',
    url: 'https://www.scmp.com/rss/91/feed',
    category: 'world',
  },
];

export function getSourcesByCategory(category: Category): FeedSource[] {
  if (category === 'all') {
    return FEED_SOURCES;
  }
  return FEED_SOURCES.filter((source) => source.category === category);
}

export function getSourceById(id: string): FeedSource | undefined {
  return FEED_SOURCES.find((source) => source.id === id);
}
