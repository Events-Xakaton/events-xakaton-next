'use client';

import { useBalanceQuery } from '@/shared/api/gamification-api';
import { RANKS } from '@/shared/constants/ranks';

type EventLike = {
  minLevel: number | null;
  freeSpots: number | null;
  status: string;
  joinedByMe: boolean;
};

type UseCanJoinOptions = {
  /** true — сценарий Lucky Wheel, ценз уровня игнорируется */
  lucky?: boolean;
};

type UseCanJoinResult = {
  canJoin: boolean;
  blockReason: string | null;
  /** Подробный текст для tooltip при блокировке по уровню */
  levelTooltip: string | null;
  userLevel: number;
  joinQueryParams: Record<string, string>;
};

export function useCanJoin(
  event: EventLike,
  options: UseCanJoinOptions = {},
): UseCanJoinResult {
  const { data: balance } = useBalanceQuery();
  const userLevel = balance?.rank?.level ?? 1;

  const isActive = event.status === 'upcoming' || event.status === 'ongoing';
  const hasSpots = event.freeSpots === null || event.freeSpots > 0;
  const meetsLevel =
    options.lucky || event.minLevel === null || userLevel >= event.minLevel;

  const blockReason: string | null = event.joinedByMe
    ? null
    : !isActive
      ? 'Запись закрыта'
      : !hasSpots
        ? 'Мест нет'
        : !meetsLevel
          ? `Нужен Ур. ${event.minLevel ?? ''}`
          : null;

  const levelTooltip: string | null =
    !meetsLevel && event.minLevel !== null
      ? (() => {
          const reqTitle = RANKS.find((r) => r.level === event.minLevel)?.title ?? '';
          const userTitle = RANKS.find((r) => r.level === userLevel)?.title ?? '';
          return `Для записи нужен уровень ${event.minLevel} · ${reqTitle}.\nВаш уровень: ${userLevel} · ${userTitle}.`;
        })()
      : null;

  return {
    canJoin: !event.joinedByMe && isActive && hasSpots && meetsLevel,
    blockReason,
    levelTooltip,
    userLevel,
    joinQueryParams: options.lucky ? { lucky: 'true' } : {},
  };
}
