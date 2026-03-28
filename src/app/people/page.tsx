'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import {
  Users,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Search,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import type { CatalogPerson } from '@/lib/aiTypes';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  tech: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  finance: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  uk: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  world: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  sport: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  culture: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  science: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

function WikipediaImage({
  name,
  onError,
  fallback,
}: {
  name: string;
  onError: () => void;
  fallback: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        <Loader2 className="w-6 h-6 text-[var(--color-bronze)] animate-spin" />
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

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CatalogPersonCard({ person }: { person: CatalogPerson }) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const colors = categoryColors[person.category] || categoryColors.world;
  const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(person.name.replace(/ /g, '_'))}`;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=300&background=b8860b&color=fff&bold=true`;
  const appearanceCount = person.newsAppearances.length;
  const latestAppearance = person.newsAppearances[person.newsAppearances.length - 1];

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${colors.bg} ${colors.border} border-2
                  transition-all duration-300 hover:shadow-lg`}
    >
      {/* Appearance count badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full
                    bg-[var(--color-bronze)] text-white text-xs font-bold shadow-md">
        <Hash className="w-3 h-3" />
        {appearanceCount}
      </div>

      {/* Photo section */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--color-parchment)] to-[var(--color-pearl)]">
        {!imageError ? (
          <WikipediaImage
            name={person.name}
            onError={() => setImageError(true)}
            fallback={fallbackAvatar}
          />
        ) : (
          <img
            src={fallbackAvatar}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
                       ${colors.bg} ${colors.text} backdrop-blur-sm`}>
          {person.category.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--color-ink)] leading-tight">
            {person.name}
          </h3>
          <p className={`text-sm font-medium ${colors.text}`}>
            {person.role}
          </p>
        </div>

        <div className="space-y-2 text-sm text-[var(--color-steel)]">
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Who: </span>
            {person.whoTheyAre}
          </div>
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Known for: </span>
            {person.whyFamous}
          </div>

          {/* Latest appearance */}
          {latestAppearance && (
            <div className="pt-2 border-t border-[var(--color-pearl)]">
              <span className="font-semibold text-[var(--color-bronze)]">Latest: </span>
              {latestAppearance.whyInNews}
              <p className="text-xs text-[var(--color-silver)] mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(latestAppearance.date)}
              </p>
            </div>
          )}
        </div>

        {/* Expandable history */}
        {appearanceCount > 1 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-[var(--color-bronze)]
                       hover:text-[var(--color-bronze-dark)] font-medium transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Hide' : 'Show'} {appearanceCount - 1} earlier {appearanceCount === 2 ? 'appearance' : 'appearances'}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {person.newsAppearances.slice(0, -1).reverse().map((appearance, i) => (
                  <div key={i} className="p-2 rounded bg-white/50 text-xs text-[var(--color-steel)]">
                    <p>{appearance.whyInNews}</p>
                    <p className="text-[var(--color-silver)] mt-1 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(appearance.date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <a
            href={wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-bronze)]
                     hover:text-[var(--color-bronze-dark)] transition-colors"
          >
            Wikipedia
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[10px] text-[var(--color-silver)]">
            First seen {formatDate(person.firstSeen)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PeopleCatalogPage() {
  const { user, getToken } = useAuth();
  const [people, setPeople] = useState<CatalogPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    const fetchCatalog = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('/api/people', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch catalog');

        const data = await res.json();
        setPeople(data.people || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [user, getToken]);

  const filteredPeople = people.filter(person => {
    const matchesSearch = searchQuery === '' ||
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || person.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(people.map(p => p.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-steel)]
                     hover:text-[var(--color-bronze)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Briefing
          </Link>

          {/* Page header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-steel)]
                          flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
                Person Catalog
              </h1>
              <p className="text-sm text-[var(--color-steel)]">
                {people.length} {people.length === 1 ? 'person' : 'people'} tracked across news appearances
              </p>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-silver)]" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--color-pearl)]
                         bg-[var(--color-paper)] text-sm text-[var(--color-ink)]
                         placeholder:text-[var(--color-silver)]
                         focus:outline-none focus:border-[var(--color-bronze)]
                         transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                            ${categoryFilter === cat
                              ? 'bg-[var(--color-bronze)] text-white'
                              : 'bg-[var(--color-parchment)] text-[var(--color-steel)] hover:text-[var(--color-ink)]'
                            }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[var(--color-bronze)] animate-spin mb-4" />
              <p className="text-[var(--color-steel)]">Loading person catalog...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-16">
              <p className="text-[var(--color-error)] mb-4">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredPeople.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-[var(--color-silver)] mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
                {people.length === 0 ? 'No people cataloged yet' : 'No matches found'}
              </h3>
              <p className="text-[var(--color-steel)]">
                {people.length === 0
                  ? 'People will appear here after generating your first briefing.'
                  : 'Try adjusting your search or filter.'}
              </p>
            </div>
          )}

          {/* People grid */}
          {!loading && !error && filteredPeople.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPeople.map(person => (
                <CatalogPersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
