'use client';

import { Bookmark, Check, ChevronRight, Plus } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { buildGradient } from '@/shared/lib/gradient';
import {
  APP_ELEVATED_CARD_CLASS,
  APP_FEED_SCRIM_CLASS,
  getClubGradient,
} from '@/shared/lib/ui-styles';
import { cn, pluralize } from '@/shared/lib/utils';

import type { ClubCard } from '../types';
import './styles/club-feed-card.css';

export function ClubFeedCard({
  club,
  onOpenClub,
  onJoin,
  joinLoading,
  joinedOverride,
  onToggleSaved,
  saved,
  cardStyle,
  hideJoinButton = false,
  noShadow = false,
}: {
  club: ClubCard;
  onOpenClub: (clubId: string) => void;
  onJoin: (clubId: string) => void;
  joinLoading: boolean;
  joinedOverride?: boolean;
  onToggleSaved: (clubId: string) => void;
  saved: boolean;
  cardStyle: React.CSSProperties;
  hideJoinButton?: boolean;
  noShadow?: boolean;
}): ReactElement {
  const joined =
    typeof joinedOverride === 'boolean' ? joinedOverride : club.joinedByMe;

  const cardBackgroundStyle = useMemo(() => {
    if (club.coverSeed) {
      return { background: buildGradient(club.coverSeed, 'club') };
    }
    return { background: getClubGradient(club.id) };
  }, [club.coverSeed, club.id]);

  return (
    <article
      className={cn('club-feed-card', !noShadow && APP_ELEVATED_CARD_CLASS)}
      style={{ ...cardBackgroundStyle, ...cardStyle }}
      role="article"
      aria-label={`Клуб: ${club.title}`}
      data-feed-card="club"
    >
      <div className={cn('club-feed-card__scrim', APP_FEED_SCRIM_CLASS)} />

      <div className="club-feed-card__body">
        <div className="club-feed-card__meta">
          <div className="club-feed-card__members">
            <span
              className="club-feed-card__members-count"
              aria-label={`${club.membersCount} участников`}
            >
              {club.membersCount}{' '}
              {pluralize(
                club.membersCount,
                'участник',
                'участника',
                'участников',
              )}
            </span>
          </div>

          <h2 className="club-feed-card__title">{club.title}</h2>
          <p className="club-feed-card__description">{club.description}</p>
        </div>

        <div className="club-feed-card__actions">
          {!hideJoinButton && (
            <div className="club-feed-card__join-group">
              <button
                type="button"
                onClick={() => onToggleSaved(club.id)}
                aria-label={
                  saved ? 'Убрать из избранного' : 'Добавить в избранное'
                }
                title={saved ? 'Убрать из избранного' : 'Добавить в избранное'}
                className={cn(
                  'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
                  'active:scale-95',
                  saved
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md'
                    : 'bg-white/90 backdrop-blur-sm text-zinc-900 hover:bg-white shadow-md',
                )}
              >
                <Bookmark className={cn('h-5 w-5', saved && 'fill-current')} />
              </button>

              {joined ? (
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.MD}
                  onClick={() => onJoin(club.id)}
                  isLoading={joinLoading}
                  disabled={joined}
                  className="rounded-full !border-emerald-300/30 !bg-emerald-500/75 px-6! !text-white hover:!bg-emerald-500/85 disabled:opacity-100"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Вы в клубе
                </Button>
              ) : (
                <Button
                  variant={ButtonVariant.PRIMARY}
                  size={ButtonSize.MD}
                  onClick={() => onJoin(club.id)}
                  isLoading={joinLoading}
                  className="rounded-full px-7!"
                >
                  <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Вступить
                </Button>
              )}
            </div>
          )}

          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={() => onOpenClub(club.id)}
            className="ml-auto rounded-full border-white/25 bg-white/90 px-5! py-2.5! text-[15px] font-semibold text-zinc-900 shadow-md hover:bg-white"
            aria-label={`Посмотреть детали клуба ${club.title}`}
          >
            Детали
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
