import { toLocalDateTimeInputValue } from '@/shared/lib/date-format';
import { CreateTab } from '@/shared/types/navigation';

const COLOR_PALETTE = [
  '#7c3aed',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#6366f1',
];

/** Возвращает стабильный цвет по строковому ключу (для аватаров клубов) */
export function stableColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return COLOR_PALETTE[hash % COLOR_PALETTE.length] ?? COLOR_PALETTE[0];
}

/** Создаёт дефолтные значения времени: завтра 17:00 – 19:00 */
export function createDefaultEventTimes(): {
  startsAt: string;
  endsAt: string;
} {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(17, 0, 0, 0);

  const end = new Date(start);
  end.setHours(19, 0, 0, 0);

  return {
    startsAt: toLocalDateTimeInputValue(start),
    endsAt: toLocalDateTimeInputValue(end),
  };
}

export const CREATE_TYPE_OPTIONS: Array<{
  value: CreateTab;
  title: string;
  description: string;
}> = [
  {
    value: 'event',
    title: 'Ивент',
    description: 'Для встреч, нетворкинга и внутренних активностей',
  },
  {
    value: 'club',
    title: 'Клуб',
    description: 'Для постоянных сообществ, интересов и команд',
  },
];
