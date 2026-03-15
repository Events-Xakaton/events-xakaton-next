'use client';

import { FC } from 'react';

import { useRankProgress } from '../model/use-rank-progress';
import { RankProgressBar } from './RankProgressBar';
import './styles/rank-badge.css';

export const RankBadge: FC = () => {
  const { isLoading, isError, progress, label, detail } = useRankProgress();

  // При ошибке — скрываем блок полностью
  if (isError) return null;

  return (
    <div className="rank-badge">
      {isLoading ? (
        <span
          className="rank-badge__label rank-badge__label--skeleton"
          aria-hidden
        />
      ) : (
        <span className="rank-badge__label">{label}</span>
      )}

      <div className="rank-badge__row">
        <RankProgressBar
          progress={isLoading ? 0 : progress}
          skeleton={isLoading}
        />
        {!isLoading ? (
          <span className="rank-badge__detail">{detail}</span>
        ) : null}
      </div>
    </div>
  );
};
