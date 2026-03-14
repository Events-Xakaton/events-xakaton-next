/**
 * Design System + App Utilities
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 * Handles conflicts intelligently
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, maxLength)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format number with locale
 */
export function formatNumber(num: number, locale: string = 'ru-RU'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll to element smoothly
 */
export function scrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions,
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options,
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Pluralize Russian words
 */
export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
  return many;
}

export type ApiError = {
  status?: number | string;
  data?: { message?: string } | string;
  error?: string;
};

/**
 * Возвращает человекочитаемый текст ошибки из RTK Query error-объекта.
 *
 * Приоритет:
 * 1. `data.message` — структурированное сообщение от NestJS-бэкенда
 * 2. `fallback` — переданный контекстный текст
 *
 * Намеренно НЕ возвращаем:
 * - `data` как строку (сырые Express-ответы вроде "Cannot POST /...")
 * - `error` (технические сообщения вроде "TypeError: Failed to fetch")
 */
export function appErrorText(error: unknown, fallback: string): string {
  const e = error as ApiError;
  if (
    typeof e?.data === 'object' &&
    typeof e.data?.message === 'string' &&
    e.data.message.trim()
  ) {
    return e.data.message;
  }
  return fallback;
}

/**
 * Расширенный вариант appErrorText с маппингом HTTP-статусов.
 * Используется там, где важен контекст конкретного статус-кода.
 */
export function httpErrorText(
  error: unknown,
  statusMessages: Partial<Record<number, string>>,
  fallback: string,
): string {
  const e = error as ApiError;

  // Сначала явный маппинг — наши русские тексты всегда приоритетнее data.message,
  // который может быть техническим ("Internal Server Error", "Bad Request" и т.п.)
  if (typeof e?.status === 'number' && statusMessages[e.status]) {
    return statusMessages[e.status] as string;
  }

  // Структурированное сообщение от бэкенда — только если статус не перекрыт выше
  if (
    typeof e?.data === 'object' &&
    typeof e.data?.message === 'string' &&
    e.data.message.trim()
  ) {
    return e.data.message;
  }

  return fallback;
}

export function toIsoFromLocal(value: string): string {
  if (!value) return '';
  return new Date(value).toISOString();
}
