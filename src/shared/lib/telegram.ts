import { initDataUser, retrieveRawInitData } from '@telegram-apps/sdk';

export type TelegramProfile = {
  telegramUserId: string;
  fullName: string;
  avatarUrl: string | null;
};

// Демо-ID для локальной разработки вне Telegram (не реальный пользователь)
const DEMO_TELEGRAM_USER_ID = '900000001';

type InitDataUserLike = {
  id?: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string | null;
};

function getDemoUserId(): string {
  if (typeof window !== 'undefined') {
    return (
      window.localStorage.getItem('tg_demo_user_id') ?? DEMO_TELEGRAM_USER_ID
    );
  }
  return DEMO_TELEGRAM_USER_ID;
}

function getRawInitDataQuietly(): string | null {
  try {
    const raw =
      process.env['NEXT_PUBLIC_ENV'] === 'development'
        ? process.env['NEXT_PUBLIC_INIT_DATA']
        : retrieveRawInitData();
    return raw ?? null;
  } catch {
    return null;
  }
}

function parseUserFromRawInitData(raw: string | null): InitDataUserLike | null {
  if (!raw) return null;

  const encodedUser = new URLSearchParams(raw).get('user');
  if (!encodedUser) return null;

  try {
    const parsed = JSON.parse(encodedUser) as InitDataUserLike;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

function resolveTelegramUser(): InitDataUserLike | null {
  const sdkUser = initDataUser() as InitDataUserLike | undefined;
  if (sdkUser?.id) return sdkUser;

  return parseUserFromRawInitData(getRawInitDataQuietly());
}

/**
 * Возвращает сырую строку initData из launch params, переданных Telegram-клиентом.
 * Используется в заголовке x-telegram-init-data для аутентификации на бэкенде.
 */
export function getTelegramInitData(): string | null {
  let raw: string | undefined;

  try {
    raw =
      process.env['NEXT_PUBLIC_ENV'] === 'development'
        ? process.env['NEXT_PUBLIC_INIT_DATA']
        : retrieveRawInitData();
  } catch {
    // SDK не инициализирован или запуск вне Telegram — fallback на userId
    raw = undefined;
  }

  if (typeof window !== 'undefined') {
    console.group('[TG initData]');
    console.log('initDataRaw():', raw ? `${raw.slice(0, 80)}…` : null);
    console.log('window.location.hash:', window.location.hash.slice(0, 120));
    console.groupEnd();
  }

  return raw ?? null;
}

/**
 * Возвращает Telegram user ID для идентификации пользователя.
 * Fallback: demo ID из localStorage или константа.
 */
export function getTelegramUserIdFallback(): string {
  const user = resolveTelegramUser();
  if (user?.id) {
    return String(user.id);
  }

  return getDemoUserId();
}

/**
 * Возвращает профиль текущего пользователя из initData.
 * Fallback: демо-профиль для разработки вне Telegram.
 */
export function getTelegramProfileFallback(): TelegramProfile {
  const user = resolveTelegramUser();

  if (!user?.id) {
    return {
      telegramUserId: getDemoUserId(),
      fullName: 'Вы',
      avatarUrl: null,
    };
  }

  const telegramUserId = String(user.id);
  const firstName = (user.first_name ?? '').trim();
  const lastName = (user.last_name ?? '').trim();
  const fullName = `${firstName} ${lastName}`.trim() || 'Вы';

  return {
    telegramUserId,
    fullName,
    avatarUrl: user.photo_url ?? null,
  };
}
