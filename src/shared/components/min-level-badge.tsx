import { FC } from 'react';

import { RANKS } from '@/shared/constants/ranks';

import { cn } from '@/shared/lib/utils';

type Props = {
  minLevel: number;
  userLevel?: number;
  className?: string;
};

export const MinLevelBadge: FC<Props> = ({ minLevel, userLevel, className }) => {
  const rankTitle = RANKS.find((r) => r.level === minLevel)?.title ?? '';
  const blocked = userLevel !== undefined && userLevel < minLevel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
        blocked
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-indigo-200 bg-indigo-50 text-indigo-700',
        className,
      )}
    >
      🔒 от Ур. {minLevel} · {rankTitle}
    </span>
  );
};

export const MinLevelBadgeSkeleton: FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn('inline-block h-4 w-24 animate-pulse rounded-full bg-neutral-200', className)}
    aria-hidden
  />
);
