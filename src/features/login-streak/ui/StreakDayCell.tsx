'use client';

import { Check, Lock } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/streak-day-cell.css';

export enum StreakDayCellState {
  DONE = 'done',
  ACTIVE = 'active',
  LOCKED = 'locked',
  REWARD_DONE = 'reward-done',
}

type Props = {
  day: number;
  state: StreakDayCellState;
  isRewardDay: boolean;
};

export const StreakDayCell: FC<Props> = ({ day, state, isRewardDay }) => {
  return (
    <div className={cn('streak-day-cell', `streak-day-cell--${state}`)}>
      <div className="streak-day-cell__icon">
        {state === StreakDayCellState.DONE && (
          <Check className="h-4 w-4" aria-hidden="true" />
        )}
        {state === StreakDayCellState.ACTIVE && (
          <span className="text-sm font-bold leading-none">{day}</span>
        )}
        {state === StreakDayCellState.LOCKED && (
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {state === StreakDayCellState.REWARD_DONE && (
          <span
            className="text-lg leading-none"
            role="img"
            aria-label="Награда"
          >
            🎉
          </span>
        )}
      </div>

      <div className="streak-day-cell__label">
        <span>День {day}</span>
        {isRewardDay && (
          <span className="streak-day-cell__reward-tag">🎁 Фри-спин</span>
        )}
      </div>
    </div>
  );
};
