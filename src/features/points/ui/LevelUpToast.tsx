'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { BalanceRank } from '@/shared/api/gamification-api';
import { RANK_EMOJIS } from '@/shared/constants/ranks';
import { cn } from '@/shared/lib/utils';

import './styles/level-up-toast.css';

type Props = {
  rank: BalanceRank;
  onHidden: () => void;
};

export const LevelUpToast: FC<Props> = ({ rank, onHidden }) => {
  // Запускаем анимацию скрытия за 250 мс до реального unmount
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setHiding(true), 3_750);
    const removeTimer = setTimeout(() => onHidden(), 4_000);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [onHidden]);

  return (
    <div
      className={cn('level-up-toast', hiding && 'level-up-toast--hiding')}
      role="status"
      aria-live="polite"
    >
      <div className="level-up-toast__emoji" aria-hidden="true">
        {RANK_EMOJIS[rank.level] ?? '🎉'}
      </div>
      <div className="level-up-toast__text">
        <span className="level-up-toast__title">Новый уровень!</span>
        <span className="level-up-toast__label">{rank.label}</span>
      </div>
    </div>
  );
};
