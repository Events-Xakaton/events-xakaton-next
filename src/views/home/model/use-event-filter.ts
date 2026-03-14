'use client';

import { useMemo, useState } from 'react';

import { type EventCard } from '@/entities/event/api';

export const DAY_FILTERS = [
  { id: 'any', label: 'В любой день' },
  { id: 'today', label: 'Сегодня' },
  { id: 'tomorrow', label: 'Завтра' },
  { id: 'week', label: 'На этой неделе' },
  { id: 'weekend', label: 'В эти выходные' },
  { id: 'next-week', label: 'На следующей неделе' },
] as const;

export type DayFilterId = (typeof DAY_FILTERS)[number]['id'];

export const DAY_FILTER_SHORT: Record<DayFilterId, string> = {
  any: 'Любой',
  today: 'Сегодня',
  tomorrow: 'Завтра',
  week: 'Неделя',
  weekend: 'Выходные',
  'next-week': 'След. нед.',
};

export function useEventFilter(events: EventCard[] | undefined) {
  const [dayFilter, setDayFilter] = useState<DayFilterId>('any');
  const [sortByDate, setSortByDate] = useState(true);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const endOfTomorrow = new Date(endOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const startOfWeekend = new Date(startOfToday);
    const day = startOfWeekend.getDay();
    const deltaToSat = (6 - day + 7) % 7;
    startOfWeekend.setDate(startOfWeekend.getDate() + deltaToSat);
    const endOfWeekend = new Date(startOfWeekend);
    endOfWeekend.setDate(endOfWeekend.getDate() + 2);
    const nextWeekStart = new Date(endOfWeek);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    return (events ?? []).filter((event) => {
      const starts = new Date(event.startsAtUtc);
      if (Number.isNaN(starts.getTime())) return true;

      if (dayFilter === 'today')
        return starts >= startOfToday && starts < endOfToday;
      if (dayFilter === 'tomorrow')
        return starts >= endOfToday && starts < endOfTomorrow;
      if (dayFilter === 'week')
        return starts >= startOfToday && starts < endOfWeek;
      if (dayFilter === 'weekend')
        return starts >= startOfWeekend && starts < endOfWeekend;
      if (dayFilter === 'next-week')
        return starts >= nextWeekStart && starts < nextWeekEnd;
      return true;
    });
  }, [events, dayFilter]);

  const eventItems = useMemo(
    () => (sortByDate ? filteredEvents : [...filteredEvents].reverse()),
    [filteredEvents, sortByDate],
  );

  return {
    dayFilter,
    setDayFilter,
    sortByDate,
    setSortByDate,
    eventItems,
    selectedDayFilterShort: DAY_FILTER_SHORT[dayFilter] ?? 'Любой',
  };
}
