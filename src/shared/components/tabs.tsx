'use client';

import { FC } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/tabs.css';

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string }>;
};

export const Tabs = <T extends string>({ value, onChange, items }: Props<T>): ReturnType<FC> => {
  const colCount = Math.min(items.length, 4) as 1 | 2 | 3 | 4;

  return (
    <div className="tabs">
      <div className={cn('tabs__grid', `tabs__grid--${colCount}`)}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'tabs__item',
              value === item.value ? 'tabs__item--active' : 'tabs__item--inactive',
            )}
            aria-selected={value === item.value}
            role="tab"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
