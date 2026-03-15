'use client';

import { FC } from 'react';

import { RANKS } from '@/shared/constants/ranks';
import { cn } from '@/shared/lib/utils';

type Props = {
  value: number | null;
  onChange: (level: number | null) => void;
  label?: string;
  className?: string;
};

export const LevelSelect: FC<Props> = ({
  value,
  onChange,
  label = 'Минимальный уровень',
  className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <label className="text-sm font-medium text-neutral-900">{label}</label>
    <select
      value={value ?? ''}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? null : Number(raw));
      }}
      className="w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
    >
      <option value="">— Без ограничений —</option>
      {RANKS.map((rank) => (
        <option key={rank.level} value={rank.level}>
          Ур. {rank.level} · {rank.title}
        </option>
      ))}
    </select>
    {value !== null && (
      <p className="text-xs text-neutral-500">
        Участники ниже этого уровня не смогут записаться
      </p>
    )}
  </div>
);
