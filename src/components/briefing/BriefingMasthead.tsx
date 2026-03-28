import { RefreshCw } from 'lucide-react';

interface BriefingMastheadProps {
  greeting: string | null;
  isLoading: boolean;
  canRefresh: boolean;
  onRefresh: () => void;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getEdition(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning Edition';
  if (hour < 17) return 'Afternoon Edition';
  return 'Evening Edition';
}

export function BriefingMasthead({ greeting, isLoading, canRefresh, onRefresh }: BriefingMastheadProps) {
  return (
    <header className="text-center py-8 sm:py-12">
      {/* Dateline */}
      <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[var(--color-steel)] mb-2">
        {formatDate()}
      </p>

      {/* Masthead title */}
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-ink)]
                     tracking-tight leading-[1.1] mb-3">
        Morning Briefing
      </h1>

      {/* Edition line */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-12 h-px bg-[var(--color-bronze)]" />
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-bronze)] font-medium">
          {getEdition()}
        </span>
        <div className="w-12 h-px bg-[var(--color-bronze)]" />
      </div>

      {/* Greeting */}
      {isLoading ? (
        <div className="max-w-2xl mx-auto">
          <div className="h-6 skeleton rounded w-3/4 mx-auto" />
        </div>
      ) : greeting ? (
        <p className="text-lg sm:text-xl text-[var(--color-steel)] max-w-2xl mx-auto leading-relaxed font-light">
          {greeting}
        </p>
      ) : null}

      {/* Refresh button for whitelisted users */}
      {canRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs
                   text-[var(--color-bronze)] border border-[var(--color-bronze-muted)]
                   hover:bg-[var(--color-bronze-muted)] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate Briefing
        </button>
      )}

      {/* Rule */}
      <div className="mt-8 sm:mt-10 flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--color-ink)]" />
        <div className="w-2 h-2 rotate-45 border border-[var(--color-ink)]" />
        <div className="flex-1 h-px bg-[var(--color-ink)]" />
      </div>
    </header>
  );
}
