const MS_PER_MINUTE = 60_000;

/**
 * Преобразует Date или ISO UTC строку в значение для input[type=datetime-local]
 * (с учётом локального часового пояса устройства)
 */
export function toLocalDateTimeInputValue(input: Date | string): string {
  if (typeof input === 'string' && !input) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * MS_PER_MINUTE);
  return local.toISOString().slice(0, 16);
}

/**
 * Форматирует значение datetime-local для отображения пользователю
 */
export function formatDateTimeDisplay(value: string): string {
  if (!value) return 'Выберите дату';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
