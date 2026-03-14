'use client';

import { useEffect, useState } from 'react';

import {
  type ClubEventBucket,
  type ClubEventListItem,
  useClubEventsQuery,
} from '@/entities/club/api';

const EVENTS_PAGE_SIZE = 6;

type UseEventsCacheResult = {
  eventsBucket: ClubEventBucket;
  setEventsBucket: (bucket: ClubEventBucket) => void;
  eventsCache: Record<ClubEventBucket, ClubEventListItem[]>;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  isFirstPageLoading: boolean;
  loadNextPage: () => void;
  refetchEvents: () => void;
};

export function useEventsCache(clubId: string): UseEventsCacheResult {
  const [eventsBucket, setEventsBucketState] =
    useState<ClubEventBucket>('upcoming');
  const [eventsPage, setEventsPage] = useState<Record<ClubEventBucket, number>>(
    { upcoming: 1, ongoing: 1, past: 1 },
  );
  const [eventsCache, setEventsCache] = useState<
    Record<ClubEventBucket, ClubEventListItem[]>
  >({ upcoming: [], ongoing: [], past: [] });

  const clubEvents = useClubEventsQuery({
    clubId,
    bucket: eventsBucket,
    page: eventsPage[eventsBucket],
    limit: EVENTS_PAGE_SIZE,
  });

  // Сбрасываем кэш при смене таба и накапливаем при пагинации
  useEffect(() => {
    const eventsData = clubEvents.data;
    if (!eventsData) return;
    setEventsCache((prev) => {
      const current = prev[eventsBucket];
      const nextItems =
        eventsPage[eventsBucket] === 1
          ? eventsData.items
          : [
              ...current,
              ...eventsData.items.filter(
                (item: ClubEventListItem) =>
                  !current.some((existing) => existing.id === item.id),
              ),
            ];
      return { ...prev, [eventsBucket]: nextItems };
    });
  }, [clubEvents.data, eventsBucket, eventsPage]);

  function setEventsBucket(bucket: ClubEventBucket): void {
    setEventsBucketState(bucket);
    // Сброс на первую страницу при смене таба
    setEventsPage((prev) => ({ ...prev, [bucket]: 1 }));
  }

  function loadNextPage(): void {
    setEventsPage((prev) => ({
      ...prev,
      [eventsBucket]: prev[eventsBucket] + 1,
    }));
  }

  return {
    eventsBucket,
    setEventsBucket,
    eventsCache,
    hasMore: clubEvents.data?.hasMore ?? false,
    isLoading: clubEvents.isLoading,
    isError: clubEvents.isError,
    isFirstPageLoading: clubEvents.isLoading && eventsPage[eventsBucket] === 1,
    loadNextPage,
    refetchEvents: () => void clubEvents.refetch(),
  };
}
