'use client';

import { ChevronRight, Clock, Users } from 'lucide-react';
import type { FC } from 'react';
import { useMemo } from 'react';

import { type EventCard } from '@/entities/event/api';

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
  event: EventCard;
  onOpenEvent: (eventId: string) => void;
};

export const ProfileEventCard: FC<Props> = ({ event, onOpenEvent }) => {
  const cardBackgroundStyle = useMemo(() => {
    if (event.coverSeed) {
      return { background: buildGradient(event.coverSeed, 'event') };
    }
    return { background: getEventGradient(event.id) };
  }, [event.coverSeed, event.id]);

  return (
    <article
      className="relative h-[240px] overflow-hidden rounded-[30px] border border-neutral-200"
      style={cardBackgroundStyle}
      role="article"
      aria-label={`Событие: ${event.title}`}
      data-feed-card="event"
    >
      <div className={cn('absolute inset-0', APP_FEED_SCRIM_CLASS)} />

      <div className="relative flex h-full flex-col p-5 pb-6">
        <span className="event-time-chip self-start">
          <Clock className="h-3.5 w-3.5" />
          {formatLocalDateTime(event.startsAtUtc)}
        </span>

        <div className="mt-auto pr-16">
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

        <Button
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.MD}
          onClick={() => onOpenEvent(event.id)}
          className="absolute right-5 bottom-6 rounded-full border-white/25 bg-white! p-3 text-zinc-900! shadow-md"
          aria-label={`Посмотреть детали ивента ${event.title}`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
};
