'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { StreakDayCell, StreakDayCellState } from './StreakDayCell';

type Props = {
  currentStreak: number;
  /** Запускать ли последовательную анимацию «загорания» (день 3) */
  animate: boolean;
  onAnimationComplete?: () => void;
};

export const StreakDayTrack: FC<Props> = ({
  currentStreak,
  animate,
  onAnimationComplete,
}) => {
  // Сколько ячеек уже «загорелось» во время анимации (0 = все серые)
  const [revealed, setRevealed] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;

    const t1 = setTimeout(() => setRevealed(1), 300);
    const t2 = setTimeout(() => setRevealed(2), 600);
    const t3 = setTimeout(() => {
      setRevealed(3);
      onAnimationComplete?.();
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [animate, onAnimationComplete]);

  const cycleRemainder = currentStreak % 3; // 1, 2, или 0 (день 3)
  const isDay3 = cycleRemainder === 0;

  function getCellState(cellDay: number): StreakDayCellState {
    if (animate) {
      // Во время анимации все ячейки начинают серыми и последовательно «загораются»
      if (cellDay > revealed) return StreakDayCellState.LOCKED;
      if (cellDay === 3) return StreakDayCellState.REWARD_DONE;
      return StreakDayCellState.DONE;
    }

    if (isDay3) {
      return cellDay === 3
        ? StreakDayCellState.REWARD_DONE
        : StreakDayCellState.DONE;
    }

    if (cellDay < cycleRemainder) return StreakDayCellState.DONE;
    if (cellDay === cycleRemainder) return StreakDayCellState.ACTIVE;
    return StreakDayCellState.LOCKED;
  }

  return (
    <div className="flex gap-2">
      {([1, 2, 3] as const).map((day) => (
        <StreakDayCell
          key={day}
          day={day}
          state={getCellState(day)}
          isRewardDay={day === 3}
        />
      ))}
    </div>
  );
};
