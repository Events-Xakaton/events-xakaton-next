'use client';

import { CalendarClock, UserPlus } from 'lucide-react';
import { FC } from 'react';

import { type NotificationItem } from '@/shared/api/notifications-api';
import { cn } from '@/shared/lib/utils';

type Props = {
  item: NotificationItem;
};

export const NotificationIcon: FC<Props> = ({ item }) => {
  const isEventChanged = item.type === 'event_changed';
  const Icon = isEventChanged ? CalendarClock : UserPlus;

  return (
    <div
      className={cn(
        'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border',
        isEventChanged
          ? 'border-primary-100 bg-primary-50 text-primary-600'
          : 'border-neutral-200 bg-neutral-100 text-neutral-700',
      )}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </div>
  );
};
