'use client';

import { useState } from 'react';
import { Users, Loader2, X, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Article } from '@/types';
import type { WeeklyBios, WeeklyBio } from '@/lib/aiTypes';

interface AIWeeklyBiosProps {
  articles: Article[];
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  tech: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  finance: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  uk: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  world: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  sport: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  culture: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  science: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

function PersonCard({ bio, index }: { bio: WeeklyBio; index: number }) {
  const [imageError, setImageError] = useState(false);
  const colors = categoryColors[bio.category] || categoryColors.world;

  // Generate Wikipedia search URL for the person
  const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(bio.name.replace(/ /g, '_'))}`;

  // Use Wikipedia API for thumbnail
  const getWikipediaImageUrl = (name: string) => {
    const encodedName = encodeURIComponent(name);
    return `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedName}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
  };

  // Fallback to UI Avatars for consistent placeholder
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(bio.name)}&size=300&background=b8860b&color=fff&bold=true`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${colors.bg} ${colors.border} border-2
                  transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-[var(--color-bronze)]
                    text-white font-bold flex items-center justify-center shadow-md">
        {index + 1}
      </div>

      {/* Photo section - portrait aspect ratio for faces */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--color-parchment)] to-[var(--color-pearl)]">
        {!imageError ? (
          <WikipediaImage
            name={bio.name}
            onError={() => setImageError(true)}
            fallback={fallbackAvatar}
          />
        ) : (
          <img
            src={fallbackAvatar}
            alt={bio.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Category badge */}
        <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
                      ${colors.bg} ${colors.text} backdrop-blur-sm`}>
          {bio.category.toUpperCase()}
        </div>
      </div>

      {/* Content section */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--color-ink)] leading-tight">
            {bio.name}
          </h3>
          <p className={`text-sm font-medium ${colors.text}`}>
            {bio.role}
          </p>
        </div>

        <div className="space-y-2 text-sm text-[var(--color-steel)]">
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Who: </span>
            {bio.whoTheyAre}
          </div>
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Known for: </span>
            {bio.whyFamous}
          </div>
          <div className="pt-2 border-t border-[var(--color-pearl)]">
            <span className="font-semibold text-[var(--color-bronze)]">This week: </span>
            {bio.whyInNews}
          </div>
        </div>

        {/* Wikipedia link */}
        <a
          href={wikipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-bronze)]
                   hover:text-[var(--color-bronze-dark)] transition-colors"
        >
          Read more on Wikipedia
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function WikipediaImage({
  name,
  onError,
  fallback
}: {
  name: string;
  onError: () => void;
  fallback: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Wikipedia image on mount
  useState(() => {
    const fetchImage = async () => {
      try {
        const encodedName = encodeURIComponent(name);
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedName}&prop=pageimages&format=json&pithumbsize=300&origin=*`
        );
        const data = await response.json();
        const pages = data.query?.pages;
        if (pages) {
          const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
          if (page?.thumbnail?.source) {
            setImageUrl(page.thumbnail.source);
          } else {
            onError();
          }
        } else {
          onError();
        }
      } catch {
        onError();
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  });

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-bronze)] animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl || fallback}
      alt={name}
      className="w-full h-full object-cover object-top"
      onError={onError}
    />
  );
}

export function AIWeeklyBios({ articles }: AIWeeklyBiosProps) {
  const { user, getToken } = useAuth();
  const [weeklyBios, setWeeklyBios] = useState<WeeklyBios | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Only show for allowed users
  const allowedEmails = ['hillier.dave@gmail.com', 'dave@davehillier.com'];
  const isAllowed = user?.email && allowedEmails.includes(user.email.toLowerCase());

  if (!isAllowed) return null;

  const generateBios = async () => {
    setLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/weekly-bios', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles: articles.map(a => ({
            title: a.title,
            description: a.description,
            category: a.category,
            source: a.source.name,
            publishedAt: a.publishedAt,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate weekly bios');
      }

      const data = await response.json();
      setWeeklyBios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => generateBios()}
        disabled={loading}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full
                 bg-gradient-to-r from-[var(--color-ink)] to-[var(--color-steel)]
                 text-white font-medium shadow-lg
                 hover:from-[var(--color-steel)] hover:to-[var(--color-ink)]
                 hover:shadow-xl hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-200"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Users className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">Weekly Bios</span>
      </button>

      {/* Bios modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-4 sm:inset-8 overflow-y-auto
                      rounded-lg bg-[var(--color-paper)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--color-parchment)]
                       text-[var(--color-steel)] hover:text-[var(--color-ink)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-steel)]
                              flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
                    {weeklyBios?.title || "This Week's Newsmakers"}
                  </h2>
                  <p className="text-sm text-[var(--color-steel)]">
                    Powered by Gemini AI
                  </p>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-[var(--color-bronze)] animate-spin mb-4" />
                  <p className="text-[var(--color-steel)]">Identifying this week's key figures...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-16">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => generateBios()}
                    className="px-4 py-2 rounded-full bg-[var(--color-bronze)] text-white"
                  >
                    Try again
                  </button>
                </div>
              )}

              {weeklyBios && !loading && (
                <div className="space-y-6">
                  {/* Intro */}
                  {weeklyBios.intro && (
                    <p className="text-lg text-[var(--color-steel)] italic border-l-4 border-[var(--color-bronze)] pl-4">
                      {weeklyBios.intro}
                    </p>
                  )}

                  {/* Bios grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {weeklyBios.bios.map((bio, index) => (
                      <PersonCard key={bio.name} bio={bio} index={index} />
                    ))}
                  </div>

                  {/* Regenerate button */}
                  <div className="pt-4 border-t border-[var(--color-pearl)] flex justify-end">
                    <button
                      onClick={() => generateBios()}
                      className="text-sm text-[var(--color-bronze)] hover:text-[var(--color-bronze-dark)]
                               font-medium transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
