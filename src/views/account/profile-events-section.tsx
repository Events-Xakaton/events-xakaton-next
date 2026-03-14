'use client';

import { Plus } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { type EventCard, useEventsQuery } from '@/entities/event/api';

import { IconButton } from '@/shared/components';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { PillTabs } from '@/shared/components/pill-tabs';

import {
  CreateEventCard,
  PastEventsPlaceholderCard,
  ProfileEventCard,
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

    const upcomingCount = eventsQuery.data.filter(
      (e) =>
        (e.joinedByMe || e.isOrganizer) &&
        e.status === 'upcoming' &&
        new Date(e.startsAtUtc) > new Date(),
    ).length;

    const organizingCount = eventsQuery.data.filter(
      (e) => e.isOrganizer,
    ).length;

    const pastCount = eventsQuery.data.filter(
      (e) => e.joinedByMe && new Date(e.startsAtUtc) < new Date(),
    ).length;

    return {
      upcoming: upcomingCount,
      organizing: organizingCount,
      past: pastCount,
    };
  }, [eventsQuery.data]);

  const filteredEvents = useMemo(() => {
    if (!eventsQuery.data) return [];

    let filtered: EventCard[] = [];

    switch (activeTab) {
      case 'upcoming':
        filtered = eventsQuery.data.filter(
          (e) =>
            (e.joinedByMe || e.isOrganizer) &&
            e.status === 'upcoming' &&
            new Date(e.startsAtUtc) > new Date(),
        );
        return filtered.sort(
          (a, b) =>
            new Date(a.startsAtUtc).getTime() -
            new Date(b.startsAtUtc).getTime(),
        );

      case 'organizing':
        filtered = eventsQuery.data.filter((e) => e.isOrganizer);
        return filtered.sort(
          (a, b) =>
            new Date(a.startsAtUtc).getTime() -
            new Date(b.startsAtUtc).getTime(),
        );

      case 'past':
        filtered = eventsQuery.data.filter(
          (e) => e.joinedByMe && new Date(e.startsAtUtc) < new Date(),
        );
        return filtered.sort(
          (a, b) =>
            new Date(b.startsAtUtc).getTime() -
            new Date(a.startsAtUtc).getTime(),
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
        activeTab === 'past' ? (
          <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
            <div className="flex gap-3 px-4!">
              <PastEventsPlaceholderCard />
            </div>
          </div>
        ) : (
          <EmptyState
            title={EMPTY_MESSAGES[activeTab].title}
            description={EMPTY_MESSAGES[activeTab].description}
            action={
              activeTab === 'organizing' && (
                <button
                  onClick={onNavigateToCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Создать ивент
                </button>
              )
            }
          />
        )
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
