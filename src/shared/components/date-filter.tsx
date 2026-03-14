'use client';

import { Check, ChevronDown } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { TOGGLE_BUTTON_INACTIVE_CLASS } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

import './styles/date-filter.css';

const DAY_FILTERS = [
  { id: 'any', label: 'В любой день' },
  { id: 'today', label: 'Сегодня' },
  { id: 'tomorrow', label: 'Завтра' },
  { id: 'week', label: 'На этой неделе' },
  { id: 'weekend', label: 'В эти выходные' },
  { id: 'next-week', label: 'На следующей неделе' },
] as const;

const DAY_FILTER_SHORT: Record<(typeof DAY_FILTERS)[number]['id'], string> = {
  any: 'Любой',
  today: 'Сегодня',
  tomorrow: 'Завтра',
  week: 'Неделя',
  weekend: 'Выходные',
  'next-week': 'След. нед.',
};

type DayFilterValue = (typeof DAY_FILTERS)[number]['id'];

type DateFilterProps = {
  value: DayFilterValue;
  onChange: (value: DayFilterValue) => void;
  variant?: 'native' | 'popover' | 'buttons';
  className?: string;
};

/**
 * ВАРИАНТ 1: Native HTML Select
 * - Стандартный браузерный выпадающий список
 * - Самый легковесный (нет JavaScript для открытия/закрытия)
 * - Родной мобильный UX (колесо выбора на iOS)
 * - Но стилизация ограничена
 */
const NativeSelectVariant: FC<Omit<DateFilterProps, 'variant'>> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DayFilterValue)}
      className={cn(
        TOGGLE_BUTTON_INACTIVE_CLASS,
        "appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNTI1MjUyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[position:right_8px_center] bg-no-repeat",
        'pr-7 cursor-pointer pl-3',
        className,
      )}
      aria-label="Фильтр по дате"
    >
      {DAY_FILTERS.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

/**
 * ВАРИАНТ 2: Custom Popover с радио-кнопками
 * - Более современный, полностью кастомизируемый
 * - Лучше для мобильных (можно сделать крупные тач-таргеты)
 * - Визуально ближе к дизайн-системе
 * - Но требует больше JavaScript и управления состоянием
 */
const PopoverVariant: FC<Omit<DateFilterProps, 'variant'>> = ({
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedLabel =
    DAY_FILTERS.find((f) => f.id === value)?.label ?? 'В любой день';

  return (
    <div ref={containerRef} className="date-filter-popover">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          TOGGLE_BUTTON_INACTIVE_CLASS,
          'gap-1.5 pl-3 pr-2',
          className,
        )}
        aria-label="Фильтр по дате"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            'date-filter-popover__chevron',
            isOpen && 'date-filter-popover__chevron--open',
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="date-filter-popover__dropdown">
          <div className="date-filter-popover__dropdown-inner" role="menu">
            {DAY_FILTERS.map((item) => {
              const isSelected = item.id === value;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'date-filter-popover__option',
                    isSelected
                      ? 'date-filter-popover__option--active'
                      : 'date-filter-popover__option--inactive',
                  )}
                  role="menuitemradio"
                  aria-checked={isSelected}
                >
                  <span className="flex-1">{item.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ВАРИАНТ 3: Inline Button Group
 * - Самый компактный и быстрый для переключения
 * - Все опции видны сразу (но нужно использовать короткие лейблы)
 * - Отлично для 2-4 опций
 * - Может быть слишком широким для 6 опций на маленьких экранах
 */
const ButtonsVariant: FC<Omit<DateFilterProps, 'variant'>> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn('date-filter-buttons', className)}
      role="group"
      aria-label="Фильтр по дате"
    >
      {DAY_FILTERS.map((item) => {
        const isSelected = item.id === value;
        const shortLabel = DAY_FILTER_SHORT[item.id];

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'date-filter-buttons__option',
              isSelected
                ? 'date-filter-buttons__option--active'
                : 'date-filter-buttons__option--inactive',
            )}
            aria-pressed={isSelected}
          >
            {shortLabel}
          </button>
        );
      })}
    </div>
  );
};

/**
 * DateFilter Component
 *
 * Компонент фильтра по дате с тремя вариантами реализации:
 * - native: HTML select (легковесный, нативный UX)
 * - popover: Кастомный dropdown с радио-кнопками (современный, кастомизируемый)
 * - buttons: Inline button group (компактный, быстрый выбор)
 */
export const DateFilter: FC<DateFilterProps> = ({
  variant = 'native',
  ...props
}) => {
  if (variant === 'popover') {
    return <PopoverVariant {...props} />;
  }

  if (variant === 'buttons') {
    return <ButtonsVariant {...props} />;
  }

  return <NativeSelectVariant {...props} />;
};
