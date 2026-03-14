'use client';

import { Clock, Users } from 'lucide-react';
import { FC } from 'react';

import { cn } from '@/shared/lib/utils';

export const PastEventsPlaceholderCard: FC = () => {
  return (
    <div
      className={cn(
        'snap-start snap-always w-[min(85vw,320px)] h-[240px] shrink-0',
        'rounded-2xl border-2 border-dashed border-neutral-300',
        'bg-transparent',
        'flex flex-col items-center justify-center gap-3',
      )}
      aria-label="Нет прошедших событий"
    >
      <div className="rounded-full bg-neutral-100 p-4">
        <Clock className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">
        Нет прошедших событий
      </p>
      <p className="text-sm text-neutral-600">
        Здесь будут ивенты, которые вы посетили
      </p>
    </div>
  );
};

export const CreatedClubsPlaceholderCard: FC = () => {
  return (
    <div
      className={cn(
        'snap-start snap-always w-[min(85vw,320px)] h-[240px] shrink-0',
        'rounded-2xl border-2 border-dashed border-neutral-300',
        'bg-transparent',
        'flex flex-col items-center justify-center gap-3',
      )}
      aria-label="Нет созданных клубов"
    >
      <div className="rounded-full bg-neutral-100 p-4">
        <Users className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">
        Нет созданных клубов
      </p>
      <p className="text-sm text-neutral-600">
        Создайте клуб для единомышленников
      </p>
    </div>
  );
};
