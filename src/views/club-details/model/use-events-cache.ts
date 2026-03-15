'use client';

import { useMemo, useState } from 'react';

import {
  type ClubEventBucket,
  type ClubEventListItem,
  useClubEventsQuery,
} from '@/entities/club/api';

const EVENTS_PAGE_SIZE = 30;

export type UseEventsCacheResult = {
  eventsBucket: ClubEventBucket;
  setEventsBucket: (bucket: ClubEventBucket) => void;
  eventsCache: Record<ClubEventBucket, ClubEventListItem[]>;
  eventsTotals: Record<ClubEventBucket, number>;
  isLoading: boolean;
  isError: boolean;
  isFirstPageLoading: boolean;
  refetchEvents: () => void;
};

export function useEventsCache(clubId: string): UseEventsCacheResult {
  const [eventsBucket, setEventsBucketState] =
    useState<ClubEventBucket>('upcoming');

  const upcomingEvents = useClubEventsQuery({
    clubId,
    bucket: 'upcoming',
    page: 1,
    limit: EVENTS_PAGE_SIZE,
  });
  const ongoingEvents = useClubEventsQuery({
    clubId,
    bucket: 'ongoing',
    page: 1,
    limit: EVENTS_PAGE_SIZE,
  });
  const pastEvents = useClubEventsQuery({
    clubId,
    bucket: 'past',
    page: 1,
    limit: EVENTS_PAGE_SIZE,
  });

  const queryByBucket = useMemo(
    () => ({
      upcoming: upcomingEvents,
      ongoing: ongoingEvents,
      past: pastEvents,
    }),
    [ongoingEvents, pastEvents, upcomingEvents],
  );
  const activeQuery = queryByBucket[eventsBucket];

  const eventsCache = useMemo<Record<ClubEventBucket, ClubEventListItem[]>>(
    () => ({
      upcoming: upcomingEvents.data?.items ?? [],
      ongoing: ongoingEvents.data?.items ?? [],
      past: pastEvents.data?.items ?? [],
    }),
    [ongoingEvents.data, pastEvents.data, upcomingEvents.data],
  );

  const eventsTotals = useMemo<Record<ClubEventBucket, number>>(
    () => ({
      upcoming: upcomingEvents.data?.total ?? 0,
      ongoing: ongoingEvents.data?.total ?? 0,
      past: pastEvents.data?.total ?? 0,
    }),
    [ongoingEvents.data, pastEvents.data, upcomingEvents.data],
  );

  function setEventsBucket(bucket: ClubEventBucket): void {
    setEventsBucketState(bucket);
  }

  return {
    eventsBucket,
    setEventsBucket,
    eventsCache,
    eventsTotals,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    isFirstPageLoading: activeQuery.isLoading && !activeQuery.data,
    refetchEvents: () => void activeQuery.refetch(),
  };
}
