'use client';

import { useEffect, useRef, useState } from 'react';

import type { Balance, BalanceRank } from '@/shared/api/gamification-api';
import { useBalanceQuery } from '@/shared/api/gamification-api';

type UsePointsBalanceResult = {
  data: Balance | undefined;
  isLoading: boolean;
  /** Установлен при повышении уровня; сбрасывается через 4 секунды */
  levelUpRank: BalanceRank | null;
  clearLevelUp: () => void;
};

export function usePointsBalance(): UsePointsBalanceResult {
  const { data, isLoading } = useBalanceQuery(undefined, {
    pollingInterval: 30_000,
    // Пауза поллинга пока вкладка/WebView скрыты; немедленный запрос при возврате
    skipPollingIfUnfocused: true,
  });

  const prevLevelRef = useRef<number | undefined>(undefined);
  const [levelUpRank, setLevelUpRank] = useState<BalanceRank | null>(null);

  useEffect(() => {
    if (!data) return;

    const newLevel = data.rank.level;

    if (prevLevelRef.current !== undefined && newLevel > prevLevelRef.current) {
      // Показываем только финальный уровень (если прыгнули сразу на несколько)
      setLevelUpRank(data.rank);
    }

    prevLevelRef.current = newLevel;
  }, [data?.rank.level]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!levelUpRank) return;
    const timer = setTimeout(() => setLevelUpRank(null), 4_000);
    return () => clearTimeout(timer);
  }, [levelUpRank]);

  function clearLevelUp(): void {
    setLevelUpRank(null);
  }

  return { data, isLoading, levelUpRank, clearLevelUp };
}
