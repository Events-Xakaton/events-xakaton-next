'use client';

import type { FC } from 'react';

import { cn } from '@/shared/lib/utils';

const STAR_COLOR = '#FED752';
const STAR_EMPTY_COLOR = '#E5E7EB';

type Props = {
  value: number | null;
  onChange?: (v: number | null) => void;
  size?: 'sm' | 'md';
};

export const StarRating: FC<Props> = ({ value, onChange, size = 'md' }) => {
  const readonly = onChange === undefined;
  const starSize = size === 'sm' ? 14 : 18;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5',
        readonly && 'pointer-events-none',
      )}
      role={readonly ? 'img' : 'group'}
      aria-label={
        value !== null && value !== undefined
          ? `Оценка: ${value} из 5`
          : 'Оценка не выставлена'
      }
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && value !== undefined && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => {
              if (!onChange) return;
              // toggle off if same star clicked
              onChange(value === star ? null : star);
            }}
            aria-label={`${star} звезда`}
            className="border-none bg-transparent p-0 leading-none transition-transform duration-100 active:scale-90 disabled:cursor-default"
          >
            <svg
              width={starSize}
              height={starSize}
              viewBox="0 0 20 20"
              fill={filled ? STAR_COLOR : STAR_EMPTY_COLOR}
              aria-hidden="true"
            >
              <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.53.91-5.32L2.27 6.62l5.34-.78L10 1z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
