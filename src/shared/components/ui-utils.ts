/**
 * UI utility functions
 *
 * Вспомогательные функции для работы с API-ошибками и датами в UI-слое.
 */

export type ApiError = {
  data?: { message?: string } | string;
  error?: string;
};

/**
 * Извлекает читаемый текст ошибки из ответа API.
 * Порядок проверки: data (строка) → data.message → error → fallback.
 */
export function appErrorText(error: unknown, fallback: string): string {
  const e = error as ApiError;
  if (typeof e?.data === "string" && e.data.trim()) return e.data;
  if (typeof e?.data === "object" && typeof e.data?.message === "string" && e.data.message.trim()) {
    return e.data.message;
  }
  if (typeof e?.error === "string" && e.error.trim()) return e.error;
  return fallback;
}

/**
 * Конвертирует локальное datetime-string (из <input type="datetime-local">)
 * в ISO 8601 строку для отправки на сервер.
 */
export function toIsoFromLocal(value: string): string {
  if (!value) return "";
  return new Date(value).toISOString();
}
