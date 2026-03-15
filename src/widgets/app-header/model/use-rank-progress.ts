'use client';

import { useBalanceQuery } from '@/shared/api/gamification-api';
import { RANKS } from '@/shared/constants/ranks';

export type RankProgressResult = {
  isLoading: boolean;
  isError: boolean;
  progress: number;
  label: string;
  detail: string;
  level: number;
};

export function useRankProgress(): RankProgressResult {
  const { data, isLoading, isError } = useBalanceQuery();

  if (!data) {
    return { isLoading, isError, progress: 0, label: '', detail: '', level: 1 };
  }

  const { lifetime, rank } = data;
  const currentRank = RANKS.find((r) => r.level === rank.level);
  const nextRank = RANKS.find((r) => r.level === rank.level + 1) ?? null;

  // Защита от некорректного уровня в ответе API
  if (!currentRank) {
    return {
      isLoading: false,
      isError: true,
      progress: 0,
      label: '',
      detail: '',
      level: 1,
    };
  }

  const pointsInLevel = lifetime - currentRank.minPoints;
  const rangeOfLevel = nextRank
    ? nextRank.minPoints - currentRank.minPoints
    : 1;
  const progress = nextRank ? pointsInLevel / rangeOfLevel : 1;
  const detail = nextRank ? `${pointsInLevel} / ${rangeOfLevel} очков` : 'MAX';

  return {
    isLoading: false,
    isError: false,
    progress,
    label: rank.label,
    detail,
    level: rank.level,
  };
}
