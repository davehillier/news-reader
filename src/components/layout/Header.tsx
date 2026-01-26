'use client';

import Link from 'next/link';
import { RefreshCw, Clock, Settings } from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';

interface HeaderProps {
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Header({ lastUpdated, isRefreshing, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-parchment)]/95 backdrop-blur-md
                      border-b border-[var(--color-pearl)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-sm overflow-hidden
                          bg-[var(--color-ink)] flex items-center justify-center
                          shadow-sm">
              <span className="font-display text-xl sm:text-2xl font-bold text-[var(--color-bronze)]">
                M
              </span>
              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--color-bronze)]" />
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display text-lg sm:text-xl font-semibold text-[var(--color-ink)]
                           tracking-tight leading-none">
                Morning Briefing
              </h1>
              <p className="text-xs text-[var(--color-steel)] mt-0.5 hidden sm:block">
                Your 5-minute news scan
              </p>
            </div>
          </div>

          {/* Right side: Last updated + Refresh + Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Last updated timestamp */}
            {lastUpdated && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--color-silver)]">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatLastUpdated(lastUpdated)}</span>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full
                       bg-[var(--color-paper)] border border-[var(--color-pearl)]
                       text-sm font-medium text-[var(--color-ink)]
                       hover:border-[var(--color-bronze)] hover:text-[var(--color-bronze)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150 shadow-sm"
              aria-label="Refresh news feed"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Settings link */}
            <Link
              href="/settings"
              className="p-2 rounded-full text-[var(--color-steel)]
                       hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)]
                       transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-[var(--color-pearl)]" />

            {/* Auth button */}
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Loading bar */}
      {isRefreshing && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-pearl)] overflow-hidden">
          <div className="h-full w-1/3 bg-[var(--color-bronze)] animate-loading-bar" />
        </div>
      )}
    </header>
  );
}
