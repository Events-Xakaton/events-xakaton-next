'use client';

import type { ReactElement } from 'react';

import type { ClubEventBucket } from '@/entities/club/api';
import type { EventCard } from '@/entities/event/api';

import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { PillTabs } from '@/shared/components/pill-tabs';

import type { UseEventsCacheResult } from '../model/use-events-cache';
import { ClubProfileEventCard } from './club-profile-event-card';

const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

const EMPTY_MESSAGES: Record<
  ClubEventBucket,
  { title: string; description: string }
> = {
  upcoming: {
    title: 'Нет предстоящих событий',
    description: 'В этом клубе пока нет запланированных ивентов',
  },
  ongoing: {
    title: 'Нет текущих событий',
    description: 'Сейчас в этом клубе не проходит активных ивентов',
  },
  past: {
    title: 'Нет прошедших событий',
    description: 'В этом клубе пока нет завершённых ивентов',
  },
};

type Props = {
  eventsCache: UseEventsCacheResult;
  eventMetaById: Record<string, Pick<EventCard, 'coverSeed' | 'joinedByMe'>>;
  joinedEventIds: Record<string, boolean>;
  joiningEventId: string | null;
  onJoinEvent: (eventId: string) => void;
  onOpenEvent?: (eventId: string) => void;
};

export function ClubEventsSection({
  eventsCache,
  eventMetaById,
  joinedEventIds,
  joiningEventId,
  onJoinEvent,
  onOpenEvent,
}: Props): ReactElement {
  const activeBucket = eventsCache.eventsBucket;
  const activeEvents = eventsCache.eventsCache[activeBucket];

  return (
    <section className="space-y-2">
      <h3 className={SECTION_TITLE_CLASS}>Ивенты</h3>

      <PillTabs<ClubEventBucket>
        value={activeBucket}
        onChange={eventsCache.setEventsBucket}
        items={[
          {
            value: 'upcoming',
            label: 'Предстоящие',
            count: eventsCache.eventsTotals.upcoming,
          },
          {
            value: 'ongoing',
            label: 'Текущие',
            count: eventsCache.eventsTotals.ongoing,
          },
          {
            value: 'past',
            label: 'Прошедшие',
            count: eventsCache.eventsTotals.past,
          },
        ]}
      />

      {eventsCache.isFirstPageLoading ? (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="snap-start w-[min(85vw,320px)] h-[240px] shrink-0 rounded-2xl bg-neutral-200 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : eventsCache.isError ? (
        <ErrorState
          title="Не удалось загрузить события клуба"
          onRetry={eventsCache.refetchEvents}
        />
      ) : activeEvents.length === 0 ? (
        <EmptyState
          title={EMPTY_MESSAGES[activeBucket].title}
          description={EMPTY_MESSAGES[activeBucket].description}
        />
      ) : (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
            {activeEvents.map((event) => {
              const eventMeta = eventMetaById[event.id];
              const joined =
                joinedEventIds[event.id] ?? eventMeta?.joinedByMe ?? false;
              const canJoin = event.status !== 'past';
              const joinLoading = joiningEventId === event.id;

              return (
                <div
                  key={event.id}
                  className="snap-start snap-always w-[min(85vw,320px)] shrink-0"
                >
                  <ClubProfileEventCard
                    event={event}
                    coverSeed={eventMeta?.coverSeed}
                    joined={joined}
                    canJoin={canJoin}
                    joinLoading={joinLoading}
                    onJoin={onJoinEvent}
                    onOpenEvent={onOpenEvent}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
