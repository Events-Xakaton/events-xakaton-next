'use client';

import { CalendarX, Clock, Heart, Users } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/utils';

const SNAP_CARD = cn(
  'snap-start snap-always w-[min(85vw,416px)] h-[240px] shrink-0',
  'rounded-2xl border-2 border-dashed border-neutral-300',
  'bg-transparent',
  'flex flex-col items-center justify-center gap-3',
);

export const PastEventsPlaceholderCard: FC = () => {
  return (
    <div className={SNAP_CARD} aria-label="Нет прошедших событий">
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

export const UpcomingEventsPlaceholderCard: FC = () => {
  return (
    <div className={SNAP_CARD} aria-label="Нет предстоящих событий">
      <div className="rounded-full bg-neutral-100 p-4">
        <CalendarX className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">
        Нет предстоящих событий
      </p>
      <p className="text-sm text-neutral-600">
        Запишитесь на ивент в ленте
      </p>
    </div>
  );
};

export const AllClubsPlaceholderCard: FC = () => {
  return (
    <div className={SNAP_CARD} aria-label="Нет клубов">
      <div className="rounded-full bg-neutral-100 p-4">
        <Users className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">Нет клубов</p>
      <p className="text-sm text-neutral-600">
        Вступите в клуб или создайте свой
      </p>
    </div>
  );
};

export const CreatedClubsPlaceholderCard: FC = () => {
  return (
    <div className={SNAP_CARD} aria-label="Нет созданных клубов">
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

type ConnectionsPlaceholderProps = {
  className?: string;
};

export const ConnectionsPlaceholder: FC<ConnectionsPlaceholderProps> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border-2 border-dashed border-neutral-300',
        'flex flex-col items-center justify-center gap-3 py-10',
        className,
      )}
      aria-label="Нет подписок"
    >
      <div className="rounded-full bg-neutral-100 p-4">
        <Heart className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">Нет подписок</p>
      <p className="text-sm text-neutral-600">Вы пока ни на кого не подписаны</p>
    </div>
  );
};
