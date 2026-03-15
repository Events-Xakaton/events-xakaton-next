'use client';

import { Check, ChevronRight, Clock, Plus, Users } from 'lucide-react';
import type { FC, MouseEvent } from 'react';
import { useMemo } from 'react';

import type { ClubEventListItem } from '@/entities/club/api';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  pluralize,
} from '@/shared/components';
import { buildGradient } from '@/shared/lib/gradient';
import { formatLocalDateTime } from '@/shared/lib/time';
import { APP_FEED_SCRIM_CLASS, getEventGradient } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

type Props = {
  event: ClubEventListItem;
  coverSeed?: string | null;
  joined: boolean;
  canJoin: boolean;
  joinLoading: boolean;
  onJoin: (eventId: string) => void;
  onOpenEvent?: (eventId: string) => void;
};

export const ClubProfileEventCard: FC<Props> = ({
  event,
  coverSeed,
  joined,
  canJoin,
  joinLoading,
  onJoin,
  onOpenEvent,
}) => {
  const cardBackgroundStyle = useMemo(() => {
    if (coverSeed) {
      return { background: buildGradient(coverSeed, 'event') };
    }
    return { background: getEventGradient(event.id) };
  }, [coverSeed, event.id]);

  const handleOpenDetails = () => {
    onOpenEvent?.(event.id);
  };

  const handleCardClick = (clickEvent: MouseEvent<HTMLElement>) => {
    if (!onOpenEvent) {
      return;
    }
    const target = clickEvent.target as HTMLElement | null;
    if (
      target?.closest(
        'button, a, input, textarea, select, [role="button"], [role="link"]',
      )
    ) {
      return;
    }
    handleOpenDetails();
  };

  return (
    <article
      className={cn(
        'relative h-[240px] overflow-hidden rounded-[30px] border border-neutral-200',
        onOpenEvent && 'cursor-pointer',
      )}
      style={cardBackgroundStyle}
      role="article"
      aria-label={`Событие: ${event.title}`}
      data-feed-card="event"
      onClick={handleCardClick}
    >
      <div className={cn('absolute inset-0', APP_FEED_SCRIM_CLASS)} />

      <div className="relative flex h-full flex-col p-5 pb-6">
        <span className="event-time-chip self-start">
          <Clock className="h-3.5 w-3.5" />
          {formatLocalDateTime(event.startsAtUtc)}
        </span>

        <div className="mt-auto pr-28">
          <h2 className="profile-card-title font-display text-4xl leading-[0.98] tracking-tight text-white drop-shadow-lg">
            {event.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/90 drop-shadow">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`${event.participantsCount} участников`}>
              {event.participantsCount}{' '}
              {pluralize(
                event.participantsCount,
                'участник',
                'участника',
                'участников',
              )}
            </span>
          </p>
        </div>

        <div className="absolute right-5 bottom-6 flex items-center gap-2">
          {canJoin ? (
            joined ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.MD}
                disabled
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full !border-emerald-300/30 !bg-emerald-500/75 px-0! py-0! !text-white disabled:opacity-100"
                aria-label={`Вы участвуете в событии ${event.title}`}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.MD}
                onClick={() => onJoin(event.id)}
                isLoading={joinLoading}
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full px-0! py-0!"
                aria-label={`Участвовать в событии ${event.title}`}
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </Button>
            )
          ) : null}

          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={handleOpenDetails}
            disabled={!onOpenEvent}
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border-white/25 bg-white! px-0! py-0! text-zinc-900! shadow-md"
            aria-label={`Посмотреть детали ивента ${event.title}`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
};
