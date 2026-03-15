'use client';

import { Plus } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { type EventCard, useEventsQuery } from '@/entities/event/api';

import { IconButton } from '@/shared/components';
import { ErrorState } from '@/shared/components/error-state';
import { PillTabs } from '@/shared/components/pill-tabs';

import {
  CreateEventCard,
  PastEventsPlaceholderCard,
  ProfileEventCard,
  UpcomingEventsPlaceholderCard,
} from './ui';

// ============================================================================
// Constants
// ============================================================================

const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

type EventCategory = 'upcoming' | 'organizing' | 'past';

const EMPTY_MESSAGES: Record<
  EventCategory,
  { title: string; description: string }
> = {
  upcoming: {
    title: 'Нет предстоящих событий',
    description: 'У вас нет запланированных событий',
  },
  organizing: {
    title: 'Нет созданных событий',
    description: 'Вы ещё не создали ни одного ивента',
  },
  past: {
    title: 'Нет прошедших событий',
    description: 'Вы не участвовали в прошедших событиях',
  },
};

function getEventTimeBounds(event: EventCard): { startMs: number; endMs: number } | null {
  const startMs = new Date(event.startsAtUtc).getTime();
  if (!Number.isFinite(startMs)) return null;

  const rawEndMs = event.endsAtUtc ? new Date(event.endsAtUtc).getTime() : NaN;
  const endMs =
    Number.isFinite(rawEndMs) && rawEndMs >= startMs ? rawEndMs : startMs;

  return { startMs, endMs };
}

function isPastEvent(event: EventCard, nowMs: number): boolean {
  const bounds = getEventTimeBounds(event);
  if (!bounds) return event.status === 'past';
  return bounds.endMs <= nowMs;
}

function isUpcomingOrOngoingEvent(event: EventCard, nowMs: number): boolean {
  return !isPastEvent(event, nowMs);
}

function getEventSortStartMs(event: EventCard): number {
  const bounds = getEventTimeBounds(event);
  if (!bounds) return Number.MAX_SAFE_INTEGER;
  return bounds.startMs;
}

function getEventSortEndMs(event: EventCard): number {
  const bounds = getEventTimeBounds(event);
  if (!bounds) return 0;
  return bounds.endMs;
}

// ============================================================================
// ProfileEventsSection Component
// ============================================================================

export function ProfileEventsSection({
  onOpenEvent,
  onNavigateToCreate,
}: {
  onOpenEvent: (eventId: string) => void;
  onNavigateToCreate: () => void;
}): ReactElement {
  const [activeTab, setActiveTab] = useState<EventCategory>('upcoming');

  const eventsQuery = useEventsQuery();

  const eventCounts = useMemo(() => {
    if (!eventsQuery.data) return { upcoming: 0, organizing: 0, past: 0 };
    const nowMs = Date.now();

    const upcomingCount = eventsQuery.data.filter(
      (e) =>
        (e.joinedByMe || e.isOrganizer) &&
        isUpcomingOrOngoingEvent(e, nowMs),
    ).length;

    const organizingCount = eventsQuery.data.filter(
      (e) => e.isOrganizer,
    ).length;

    const pastCount = eventsQuery.data.filter(
      (e) => e.joinedByMe && isPastEvent(e, nowMs),
    ).length;

    return {
      upcoming: upcomingCount,
      organizing: organizingCount,
      past: pastCount,
    };
  }, [eventsQuery.data]);

  const filteredEvents = useMemo(() => {
    if (!eventsQuery.data) return [];
    const nowMs = Date.now();

    let filtered: EventCard[] = [];

    switch (activeTab) {
      case 'upcoming':
        filtered = eventsQuery.data.filter(
          (e) =>
            (e.joinedByMe || e.isOrganizer) &&
            isUpcomingOrOngoingEvent(e, nowMs),
        );
        return filtered.sort(
          (a, b) => getEventSortStartMs(a) - getEventSortStartMs(b),
        );

      case 'organizing':
        filtered = eventsQuery.data.filter((e) => e.isOrganizer);
        return filtered.sort(
          (a, b) => getEventSortStartMs(a) - getEventSortStartMs(b),
        );

      case 'past':
        filtered = eventsQuery.data.filter(
          (e) => e.joinedByMe && isPastEvent(e, nowMs),
        );
        return filtered.sort(
          (a, b) => getEventSortEndMs(b) - getEventSortEndMs(a),
        );

      default:
        return eventsQuery.data;
    }
  }, [eventsQuery.data, activeTab]);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className={SECTION_TITLE_CLASS}>Ивенты</h3>
        <IconButton
          icon={<Plus className="h-5 w-5" />}
          onClick={onNavigateToCreate}
          label="Создать событие"
        />
      </div>

      <PillTabs<EventCategory>
        value={activeTab}
        onChange={setActiveTab}
        items={[
          {
            value: 'upcoming',
            label: 'Предстоящие',
            count: eventCounts.upcoming,
          },
          {
            value: 'organizing',
            label: 'Организую',
            count: eventCounts.organizing,
          },
          { value: 'past', label: 'Прошедшие', count: eventCounts.past },
        ]}
      />

      {eventsQuery.isLoading ? (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="snap-start w-[min(85vw,320px)] h-[240px] shrink-0 rounded-2xl bg-neutral-200 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : eventsQuery.isError ? (
        <ErrorState
          title="Не удалось загрузить события"
          onRetry={() => eventsQuery.refetch()}
        />
      ) : filteredEvents.length === 0 ? (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
            {activeTab === 'past' && <PastEventsPlaceholderCard />}
            {activeTab === 'upcoming' && <UpcomingEventsPlaceholderCard />}
            {activeTab === 'organizing' && (
              <CreateEventCard onClick={onNavigateToCreate} />
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="snap-start snap-always w-[min(85vw,320px)] shrink-0"
              >
                <ProfileEventCard event={event} onOpenEvent={onOpenEvent} />
              </div>
            ))}
            {activeTab === 'organizing' && (
              <CreateEventCard onClick={onNavigateToCreate} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
