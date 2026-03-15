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

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function resolveEventRange(event: EventCard): { start: Date; end: Date } | null {
  const start = parseDateValue(event.startsAtUtc);
  if (!start) return null;

  const rawEnd = parseDateValue(event.endsAtUtc);
  const end =
    rawEnd && rawEnd.getTime() >= start.getTime() ? rawEnd : new Date(start);

  return { start, end };
}

function intersectsRange(
  eventRange: { start: Date; end: Date },
  filterRange: { start: Date; end: Date },
): boolean {
  return (
    eventRange.end.getTime() > filterRange.start.getTime() &&
    eventRange.start.getTime() < filterRange.end.getTime()
  );
}

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
      const eventRange = resolveEventRange(event);
      if (!eventRange) return true;

      if (dayFilter === 'today')
        return intersectsRange(eventRange, {
          start: startOfToday,
          end: endOfToday,
        });
      if (dayFilter === 'tomorrow')
        return intersectsRange(eventRange, {
          start: endOfToday,
          end: endOfTomorrow,
        });
      if (dayFilter === 'week')
        return intersectsRange(eventRange, {
          start: startOfToday,
          end: endOfWeek,
        });
      if (dayFilter === 'weekend')
        return intersectsRange(eventRange, {
          start: startOfWeekend,
          end: endOfWeekend,
        });
      if (dayFilter === 'next-week')
        return intersectsRange(eventRange, {
          start: nextWeekStart,
          end: nextWeekEnd,
        });
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
