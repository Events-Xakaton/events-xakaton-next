'use client';

import { FC, useRef } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/pill-tabs.css';

export type PillTabItem<T extends string = string> = {
  value: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  items: PillTabItem<T>[];
  className?: string;
};

export const PillTabs = <T extends string>({
  value,
  onChange,
  items,
  className,
}: Props<T>): ReturnType<FC> => {
  const buttonRefs = useRef<Map<T, HTMLButtonElement>>(new Map());

  const handleClick = (itemValue: T): void => {
    onChange(itemValue);

    const button = buttonRefs.current.get(itemValue);
    if (button) {
      button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  };

  return (
    <div className={cn('pill-tabs', className)}>
      {items.map((item) => {
        const isActive = value === item.value;

        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) {
                buttonRefs.current.set(item.value, el);
              } else {
                buttonRefs.current.delete(item.value);
              }
            }}
            onClick={() => handleClick(item.value)}
            className={cn(
              'pill-tabs__item',
              isActive
                ? 'pill-tabs__item--active'
                : 'pill-tabs__item--inactive',
            )}
            type="button"
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'pill-tabs__count',
                  isActive
                    ? 'pill-tabs__count--active'
                    : 'pill-tabs__count--inactive',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
