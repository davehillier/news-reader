import Parser from 'rss-parser';
import type { Article, FeedSource } from '@/types';
import crypto from 'crypto';
import { selectHeroArticle } from './heroSelector';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
    ],
  },
  timeout: 10000,
});

function createArticleId(url: string, sourceId: string): string {
  // Include source ID to prevent duplicates when same article appears in multiple feeds
  return crypto.createHash('md5').update(`${sourceId}:${url}`).digest('hex').slice(0, 16);
}

function extractImageUrl(item: Parser.Item & { mediaContent?: { $?: { url?: string } }; mediaThumbnail?: { $?: { url?: string } }; enclosure?: { url?: string } }): string | undefined {
  // Try media:content
  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }

  // Try media:thumbnail
  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }

  // Try enclosure
  if (item.enclosure?.url && item.enclosure.url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return item.enclosure.url;
  }

  // Try to extract from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch?.[1]) {
      return imgMatch[1];
    }
  }

  // Try content:encoded
  const contentEncoded = (item as Parser.Item & { 'content:encoded'?: string })['content:encoded'];
  if (contentEncoded) {
    const imgMatch = contentEncoded.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch?.[1]) {
      return imgMatch[1];
    }
  }

  return undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

function cleanHtml(text: string): string {
  // Remove "Continue reading..." links (both HTML and plain text)
  let clean = text.replace(/<a[^>]*>Continue reading[^<]*<\/a>/gi, '');

  // Remove HTML tags but preserve paragraph breaks
  clean = clean.replace(/<\/p>\s*<p>/gi, '\n\n');
  clean = clean.replace(/<br\s*\/?>/gi, '\n');
  clean = clean.replace(/<[^>]*>/g, '');

  // Decode entities
  clean = decodeHtmlEntities(clean);

  // Remove plain text "Continue reading..." that may remain
  clean = clean.replace(/\s*Continue reading\.{3}\s*$/gi, '');

  // Normalise whitespace
  clean = clean.replace(/\n{3,}/g, '\n\n').trim();

  return clean;
}

function extractFullContent(item: Parser.Item): string {
  // Try content (often has full HTML description from Guardian, etc.)
  const content = item.content || '';
  const contentSnippet = item.contentSnippet || '';

  // Use whichever is longer after cleaning
  const cleanedContent = cleanHtml(content);
  const cleanedSnippet = decodeHtmlEntities(contentSnippet).trim();

  // Return the longer one (up to reasonable limit for display)
  const fullText = cleanedContent.length > cleanedSnippet.length
    ? cleanedContent
    : cleanedSnippet;

  // Cap at 800 chars for full content (enough for 2-3 paragraphs)
  if (fullText.length > 800) {
    return fullText.slice(0, 797) + '...';
  }

  return fullText;
}

function extractShortDescription(fullContent: string): string {
  // Get first sentence or first 150 chars for compact display
  const firstPara = fullContent.split('\n\n')[0] || fullContent;

  if (firstPara.length > 150) {
    // Try to cut at sentence boundary
    const sentenceEnd = firstPara.slice(0, 150).lastIndexOf('. ');
    if (sentenceEnd > 80) {
      return firstPara.slice(0, sentenceEnd + 1);
    }
    return firstPara.slice(0, 147) + '...';
  }

  return firstPara;
}

export async function parseFeed(source: FeedSource): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return feed.items
      .filter((item) => item.title && item.link)
      .slice(0, 10) // Limit to 10 articles per source for better balance
      .map((item) => {
        const fullDescription = extractFullContent(item);
        const description = extractShortDescription(fullDescription);

        return {
          id: createArticleId(item.link!, source.id),
          title: item.title!.trim(),
          description,
          fullDescription,
          url: item.link!,
          imageUrl: extractImageUrl(item as Parser.Item & { mediaContent?: { $?: { url?: string } }; mediaThumbnail?: { $?: { url?: string } }; enclosure?: { url?: string } }),
          source: {
            id: source.id,
            name: source.name,
          },
          category: source.category,
          publishedAt: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
          author: item.creator || (item as Parser.Item & { author?: string }).author,
        };
      });
  } catch (error) {
    console.error(`Failed to parse feed ${source.name}:`, error);
    throw error;
  }
}

export async function parseAllFeeds(
  sources: FeedSource[]
): Promise<{
  articles: Article[];
  sourceStatuses: Array<{
    id: string;
    name: string;
    status: 'ok' | 'error';
    articleCount: number;
  }>;
}> {
  const results = await Promise.allSettled(
    sources.map(async (source) => ({
      source,
      articles: await parseFeed(source),
    }))
  );

  const articles: Article[] = [];
  const sourceStatuses: Array<{
    id: string;
    name: string;
    status: 'ok' | 'error';
    articleCount: number;
  }> = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value.articles);
      sourceStatuses.push({
        id: result.value.source.id,
        name: result.value.source.name,
        status: 'ok',
        articleCount: result.value.articles.length,
      });
    } else {
      // Find the source from the original array based on the error
      const failedSource = sources[results.indexOf(result)];
      sourceStatuses.push({
        id: failedSource.id,
        name: failedSource.name,
        status: 'error',
        articleCount: 0,
      });
    }
  }

  // Sort by publish date, newest first, then interleave sources for variety
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Interleave articles from different sources for better variety
  // Group by source, then round-robin pick from each
  const bySource = new Map<string, typeof articles>();
  for (const article of articles) {
    const sourceArticles = bySource.get(article.source.id) || [];
    sourceArticles.push(article);
    bySource.set(article.source.id, sourceArticles);
  }

  const interleaved: typeof articles = [];
  const sourceQueues = Array.from(bySource.values());
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    for (const queue of sourceQueues) {
      if (queue.length > 0) {
        interleaved.push(queue.shift()!);
        hasMore = hasMore || queue.length > 0;
      }
    }
  }

  // Select best hero article and reorder
  const withHero = selectHeroArticle(interleaved);

  return { articles: withHero, sourceStatuses };
}
