'use client';

import type { FC } from 'react';

import { usePointsBalance } from '../lib/usePointsBalance';
import { LevelUpToast } from './LevelUpToast';

/**
 * Монтируется один раз в корневом shell после авторизации.
 * Запускает поллинг баланса и показывает тост при повышении уровня.
 * Дочерние компоненты получают данные через useBalanceQuery() из кэша RTK Query.
 */
export const PointsBalanceProvider: FC = () => {
  const { levelUpRank, clearLevelUp } = usePointsBalance();

  if (!levelUpRank) return null;

  return <LevelUpToast rank={levelUpRank} onHidden={clearLevelUp} />;
};
