'use client';

import { CalendarClock, Trophy, UserPlus } from 'lucide-react';
import type { FC } from 'react';

import { type NotificationItem } from '@/shared/api/notifications-api';
import { cn } from '@/shared/lib/utils';

type Props = {
  item: NotificationItem;
};

export const NotificationIcon: FC<Props> = ({ item }) => {
  const isEventChanged = item.type === 'event_changed';
  const isAchievementUnlocked = item.type === 'achievement_unlocked';

  const Icon = isEventChanged
    ? CalendarClock
    : isAchievementUnlocked
      ? Trophy
      : UserPlus;

  return (
    <div
      className={cn(
        'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border',
        isEventChanged
          ? 'border-primary-100 bg-primary-50 text-primary-600'
          : isAchievementUnlocked
            ? 'border-amber-100 bg-amber-50 text-amber-600'
            : 'border-neutral-200 bg-neutral-100 text-neutral-700',
      )}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </div>
  );
};
