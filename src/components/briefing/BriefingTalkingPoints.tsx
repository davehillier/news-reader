import {
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Zap,
  Smile,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { TalkingPoints } from '@/lib/aiTypes';
import { TalkingPointsSkeleton } from './BriefingSkeleton';

interface BriefingTalkingPointsProps {
  talkingPoints: TalkingPoints | null;
  isLoading: boolean;
  canRefresh: boolean;
  onRefresh: () => void;
}

const categoryIcons: Record<string, string> = {
  tech: '💻',
  finance: '📈',
  uk: '🇬🇧',
  world: '🌍',
  sport: '⚽',
};

export function BriefingTalkingPoints({
  talkingPoints,
  isLoading,
  canRefresh,
  onRefresh,
}: BriefingTalkingPointsProps) {
  if (isLoading) return <TalkingPointsSkeleton />;
  if (!talkingPoints) return null;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em]
                       text-[var(--color-bronze)]">
          <MessageCircle className="w-4 h-4" />
          Talking Points
        </h2>
        {canRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs text-[var(--color-bronze)]
                     hover:text-[var(--color-bronze-dark)] font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Lead With This - Hero talking point */}
        <div className="bg-gradient-to-br from-[var(--color-bronze-muted)]/40 to-[var(--color-parchment)]
                       rounded-lg p-6 border border-[var(--color-bronze-muted)]">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[var(--color-bronze)]" />
            <h3 className="font-semibold text-[var(--color-bronze-dark)]">
              Lead With This
            </h3>
          </div>
          <h4 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-3">
            {talkingPoints.todayHighlight.topic}
          </h4>
          <p className="text-[var(--color-steel)] mb-4 italic">
            &ldquo;{talkingPoints.todayHighlight.opener}&rdquo;
          </p>
          <p className="text-[var(--color-ink)] leading-relaxed mb-4">
            {talkingPoints.todayHighlight.insight}
          </p>
          <div className="flex items-start gap-2 p-3 bg-white/50 rounded-lg">
            <ChevronRight className="w-4 h-4 text-[var(--color-bronze)] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[var(--color-steel)]">
              <span className="font-medium">Follow up with:</span> {talkingPoints.todayHighlight.followUp}
            </p>
          </div>
        </div>

        {/* Weekly Trends */}
        {talkingPoints.weeklyTrends.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[var(--color-bronze)]" />
              <h3 className="font-semibold text-[var(--color-ink)] text-sm">
                This Week&apos;s Patterns
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {talkingPoints.weeklyTrends.map((trend, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-[var(--color-parchment)] border border-[var(--color-pearl)]"
                >
                  <h4 className="font-medium text-[var(--color-ink)] mb-2">
                    {trend.theme}
                  </h4>
                  <p className="text-sm text-[var(--color-steel)] mb-3">
                    {trend.summary}
                  </p>
                  <p className="text-sm text-[var(--color-bronze-dark)] italic">
                    &ldquo;{trend.talkingPoint}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bold Take + Lighter Note side by side */}
        <div className="grid gap-6 sm:grid-cols-2">
          {talkingPoints.controversialTake.topic && (
            <div className="p-5 rounded-lg bg-[var(--color-parchment)] border-l-4 border-[var(--color-bronze)]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[var(--color-bronze)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-sm">
                  Bold Take
                </h3>
              </div>
              <p className="font-medium text-[var(--color-ink)] mb-2">
                {talkingPoints.controversialTake.topic}
              </p>
              <p className="text-sm text-[var(--color-steel)] mb-2 italic">
                &ldquo;{talkingPoints.controversialTake.contrarian}&rdquo;
              </p>
              <p className="text-xs text-[var(--color-silver)]">
                ⚖️ {talkingPoints.controversialTake.caveat}
              </p>
            </div>
          )}

          {talkingPoints.lightMoment.topic && (
            <div className="p-5 rounded-lg bg-[var(--color-bronze-muted)]/20 border border-[var(--color-bronze-muted)]">
              <div className="flex items-center gap-2 mb-3">
                <Smile className="w-4 h-4 text-[var(--color-bronze)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-sm">
                  Lighter Note
                </h3>
              </div>
              <p className="font-medium text-[var(--color-ink)] mb-2">
                {talkingPoints.lightMoment.topic}
              </p>
              <p className="text-sm text-[var(--color-steel)] italic">
                {talkingPoints.lightMoment.quip}
              </p>
            </div>
          )}
        </div>

        {/* Quick Category Hits */}
        {talkingPoints.categories && (
          <div>
            <h3 className="font-semibold text-[var(--color-ink)] text-sm mb-4">
              Quick Category Hits
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(talkingPoints.categories).map(([cat, line]) => (
                line && (
                  <div
                    key={cat}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-paper)]
                             border border-[var(--color-pearl)]"
                  >
                    <span className="text-lg">{categoryIcons[cat] || '📰'}</span>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bronze)]">
                        {cat}
                      </span>
                      <p className="text-sm text-[var(--color-steel)] mt-0.5">
                        {line}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
