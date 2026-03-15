'use client';

import { Check, ChevronRight, Clock, Plus, Users } from 'lucide-react';
import { useMemo } from 'react';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { MinLevelBadge } from '@/shared/components/min-level-badge';
import { buildGradient } from '@/shared/lib/gradient';
import { formatLocalDateTime } from '@/shared/lib/time';
import {
  APP_ELEVATED_CARD_CLASS,
  getEventGradient,
} from '@/shared/lib/ui-styles';
import { cn, pluralize } from '@/shared/lib/utils';

import type { EventCard } from '../types';
import './styles/event-feed-card.css';

export function EventFeedCard({
  event,
  joined,
  joinLoading,
  onJoin,
  onOpenEvent,
  cardStyle,
  hideJoinButton = false,
  noShadow = false,
  userLevel,
}: {
  event: EventCard;
  joined: boolean;
  joinLoading: boolean;
  onJoin: (eventId: string) => void;
  onOpenEvent: (eventId: string) => void;
  cardStyle: React.CSSProperties;
  hideJoinButton?: boolean;
  noShadow?: boolean;
  userLevel?: number;
}) {
  const cardBackgroundStyle = useMemo(() => {
    // Если есть coverSeed — используем его
    if (event.coverSeed) {
      return { background: buildGradient(event.coverSeed, 'event') };
    }
    // Fallback для старых записей
    return { background: getEventGradient(event.id) };
  }, [event.coverSeed, event.id]);

  const levelBlocked =
    !joined &&
    event.minLevel !== null &&
    userLevel !== undefined &&
    userLevel < event.minLevel;

  return (
    <article
      className={cn('event-feed-card', !noShadow && APP_ELEVATED_CARD_CLASS)}
      style={{ ...cardBackgroundStyle, ...cardStyle }}
      role="article"
      aria-label={`Событие: ${event.title}`}
      data-feed-card="event"
      data-event-id={event.id}
    >
      {/* Scrim overlay для защиты текста */}
      <div className="event-feed-card__scrim" />
      <div className="event-feed-card__body">
        <div className="event-feed-card__meta">
          <div className="event-feed-card__badge">
            <span className="event-time-chip">
              <Clock className="h-3.5 w-3.5" />
              {formatLocalDateTime(event.startsAtUtc)}
            </span>
          </div>

          <h2 className="event-feed-card__title">{event.title}</h2>

          <div className="event-feed-card__participants">
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span aria-label={`${event.participantsCount} участников`}>
              {event.participantsCount}{' '}
              {pluralize(
                event.participantsCount,
                'участник',
                'участника',
                'участников',
              )}
            </span>
            {event.minLevel !== null && (
              <MinLevelBadge minLevel={event.minLevel} userLevel={userLevel} />
            )}
          </div>
        </div>

        <div className="event-feed-card__actions">
          {!hideJoinButton && !levelBlocked && (
            <>
              {joined ? (
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.MD}
                  onClick={() => onJoin(event.id)}
                  isLoading={joinLoading}
                  disabled={joined}
                  className="rounded-full !border-emerald-300/30 !bg-emerald-500/75 px-6! !text-white hover:!bg-emerald-500/85 disabled:opacity-100"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Вы участвуете
                </Button>
              ) : (
                <Button
                  variant={ButtonVariant.PRIMARY}
                  size={ButtonSize.MD}
                  onClick={() => onJoin(event.id)}
                  isLoading={joinLoading}
                  className="rounded-full px-7!"
                >
                  <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Участвовать
                </Button>
              )}
            </>
          )}

          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={() => onOpenEvent(event.id)}
            className="ml-auto rounded-full border-white/25 bg-white! px-5! py-2.5! text-[15px]! font-semibold text-zinc-900! shadow-md"
            aria-label={`Посмотреть детали ивента ${event.title}`}
          >
            Детали
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
