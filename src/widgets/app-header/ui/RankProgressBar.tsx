import { FC } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/rank-progress-bar.css';

type Props = {
  /** Значение от 0.0 до 1.0 */
  progress: number;
  skeleton?: boolean;
};

export const RankProgressBar: FC<Props> = ({ progress, skeleton = false }) => (
  <div className={cn('rank-progress-bar', skeleton && 'rank-progress-bar--skeleton')}>
    <div
      className="rank-progress-bar__fill"
      style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
);
