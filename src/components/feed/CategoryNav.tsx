'use client';

import { useCallback } from 'react';
import { CATEGORIES, type Category } from '@/types';
import {
  Cpu,
  TrendingUp,
  MapPin,
  Globe,
  Trophy,
  Layers,
  Music,
  Microscope,
} from 'lucide-react';

interface CategoryNavProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  articleCounts?: Record<Category, number>;
}

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  all: <Layers className="w-4 h-4" />,
  tech: <Cpu className="w-4 h-4" />,
  finance: <TrendingUp className="w-4 h-4" />,
  uk: <MapPin className="w-4 h-4" />,
  world: <Globe className="w-4 h-4" />,
  sport: <Trophy className="w-4 h-4" />,
  culture: <Music className="w-4 h-4" />,
  science: <Microscope className="w-4 h-4" />,
};

export function CategoryNav({
  activeCategory,
  onCategoryChange,
  articleCounts,
}: CategoryNavProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, category: Category) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCategoryChange(category);
      }
    },
    [onCategoryChange]
  );

  return (
    <nav
      className="relative"
      role="tablist"
      aria-label="News categories"
    >
      {/* Desktop: Horizontal tabs with underline */}
      <div className="hidden sm:flex items-center gap-1 border-b border-[var(--color-pearl)]">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = articleCounts?.[cat.id];

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${cat.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onCategoryChange(cat.id)}
              onKeyDown={(e) => handleKeyDown(e, cat.id)}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                transition-colors duration-150 outline-none
                ${isActive
                  ? 'text-[var(--color-bronze-dark)]'
                  : 'text-[var(--color-steel)] hover:text-[var(--color-ink)]'
                }
              `}
            >
              {CATEGORY_ICONS[cat.id]}
              <span>{cat.label}</span>

              {count !== undefined && count > 0 && (
                <span
                  className={`
                    ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                    ${isActive
                      ? 'bg-[var(--color-bronze-muted)] text-[var(--color-bronze-dark)]'
                      : 'bg-[var(--color-pearl)] text-[var(--color-silver)]'
                    }
                  `}
                >
                  {count}
                </span>
              )}

              {/* Active indicator line */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-bronze)]
                           rounded-full transform origin-center animate-scale-in"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: Horizontal scroll pills */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 py-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = articleCounts?.[cat.id];

            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onCategoryChange(cat.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                  text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-[var(--color-bronze)] text-white shadow-md'
                    : 'bg-[var(--color-paper)] text-[var(--color-steel)] hover:bg-[var(--color-pearl)]'
                  }
                `}
              >
                {CATEGORY_ICONS[cat.id]}
                <span>{cat.label}</span>

                {count !== undefined && count > 0 && (
                  <span
                    className={`
                      ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--color-pearl)] text-[var(--color-silver)]'
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
