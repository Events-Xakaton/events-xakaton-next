import { initDataRaw, initDataUser } from '@telegram-apps/sdk';

export type TelegramProfile = {
  telegramUserId: string;
  fullName: string;
  avatarUrl: string | null;
};

// Демо-ID для локальной разработки вне Telegram (не реальный пользователь)
const DEMO_TELEGRAM_USER_ID = '900000001';

/**
 * Возвращает сырую строку initData из launch params, переданных Telegram-клиентом.
 * Используется в заголовке x-telegram-init-data для аутентификации на бэкенде.
 */
export function getTelegramInitData(): string | null {
  return initDataRaw() ?? null;
}

/**
 * Возвращает Telegram user ID для идентификации пользователя.
 * Fallback: demo ID из localStorage или константа.
 */
export function getTelegramUserIdFallback(): string {
  const user = initDataUser();
  if (user?.id) {
    return String(user.id);
  }

  if (typeof window !== 'undefined') {
    return (
      window.localStorage.getItem('tg_demo_user_id') ?? DEMO_TELEGRAM_USER_ID
    );
  }

  return DEMO_TELEGRAM_USER_ID;
}

/**
 * Возвращает профиль текущего пользователя из initData.
 * Fallback: демо-профиль для разработки вне Telegram.
 */
export function getTelegramProfileFallback(): TelegramProfile {
  const user = initDataUser();

  if (!user) {
    const fallbackId =
      typeof window !== 'undefined'
        ? (window.localStorage.getItem('tg_demo_user_id') ??
          DEMO_TELEGRAM_USER_ID)
        : DEMO_TELEGRAM_USER_ID;
    return { telegramUserId: fallbackId, fullName: 'Вы', avatarUrl: null };
  }

  const telegramUserId = String(user.id);
  const firstName = (user.first_name ?? '').trim();
  const lastName = (user.last_name ?? '').trim();
  const fallbackName = (user.username ?? '').trim();
  const fullName = `${firstName} ${lastName}`.trim() || fallbackName || 'Вы';

  return {
    telegramUserId,
    fullName,
    avatarUrl: user.photo_url ?? null,
  };
}
