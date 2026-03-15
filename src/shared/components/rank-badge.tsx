import { FC } from 'react';

import { cn } from '@/shared/lib/utils';
import type { RankInfo } from '@/shared/types/rank';

import './styles/rank-badge.css';

type Props = {
  rankInfo: RankInfo;
  className?: string;
};

export const RankBadge: FC<Props> = ({ rankInfo, className }) => (
  <span className={cn('rank-info-badge', className)}>
    <span className="rank-info-badge__star" aria-hidden>
      ★
    </span>
    {rankInfo.label}
  </span>
);

type SkeletonProps = { className?: string };

export const RankBadgeSkeleton: FC<SkeletonProps> = ({ className }) => (
  <span
    className={cn('rank-info-badge rank-info-badge--skeleton', className)}
    aria-hidden
  />
);
