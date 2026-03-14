declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  // Core API
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;

  // Fullscreen API (Bot API 8.0+)
  requestFullscreen?: () => Promise<void>;
  exitFullscreen?: () => Promise<void>;
  isFullscreen?: boolean;

  // Event Handling
  onEvent?: (event: string, cb: (params?: any) => void) => void;
  offEvent?: (event: string, cb: (params?: any) => void) => void;

  // Viewport
  viewportHeight?: number;
  viewportStableHeight?: number;

  // Safe Area (iOS notch/Dynamic Island, Android gestures)
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  // Init Data
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id?: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    };
  };

  // Theming
  colorScheme?: 'light' | 'dark';

  // Platform Info
  platform?: string;
  version?: string;

  // Theme color API (Bot API 6.1+, не входит в @types/telegram-web-app)
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;

  // Navigation buttons
  MainButton?: TelegramButton;
  BackButton?: TelegramBackButton;
}

type TelegramButton = {
  text: string;
  color: string;
  textColor: string;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
};

type TelegramBackButton = {
  show: () => void;
  hide: () => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
}

export type TelegramProfile = {
  telegramUserId: string;
  fullName: string;
  avatarUrl: string | null;
};

/**
 * Initialize Telegram WebApp with fullscreen support
 */
export function initTelegramWebApp(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const webApp = window.Telegram?.WebApp;
  if (!webApp) {
    console.warn('[Telegram WebApp] Not available');
    return;
  }

  // Step 1: Diagnostic logging
  logTelegramInit(webApp);

  // Step 2: Ready signal
  webApp.ready();

  // Step 3: Expand WebView
  webApp.expand();

  // Step 3.25: Prevent Telegram pull-down gesture from closing Mini App
  disableVerticalSwipesSafe(webApp);

  // Step 3.5: Set header and background colors
  setTelegramThemeColors(webApp);

  // Step 4: Request fullscreen (Bot API 8.0+)
  requestFullscreenSafe(webApp);

  // Step 5: Setup viewport tracking
  setupViewportTracking(webApp);

  // Step 6: Setup fullscreen event handlers
  setupFullscreenHandlers(webApp);

}

function disableVerticalSwipesSafe(webApp: TelegramWebApp): void {
  if (typeof webApp.disableVerticalSwipes !== 'function') {
    console.warn('[Telegram WebApp] disableVerticalSwipes not available');
    return;
  }
  try {
    webApp.disableVerticalSwipes();
  } catch {
    // Некоторые клиенты могут не поддерживать API — молча игнорируем
  }
}

/**
 * Log diagnostic information during initialization
 */
function logTelegramInit(_webApp: TelegramWebApp): void {
  // Диагностический вывод только в dev-режиме
  if (process.env.NODE_ENV !== 'development') return;
  console.log('[Telegram WebApp] Initializing...', {
    platform: _webApp.platform,
    version: _webApp.version,
    hasFullscreenAPI: typeof _webApp.requestFullscreen === 'function',
    initialViewportHeight: _webApp.viewportStableHeight,
    initialIsFullscreen: _webApp.isFullscreen,
  });
}

/**
 * Safely request fullscreen mode with error handling
 */
async function requestFullscreenSafe(webApp: TelegramWebApp): Promise<void> {
  // Check API availability
  if (typeof webApp.requestFullscreen !== 'function') {
    console.warn('[Telegram WebApp] requestFullscreen not available');
    return;
  }

  try {
    await webApp.requestFullscreen();
  } catch {
    // Ожидаемые ошибки: UNSUPPORTED, ALREADY_FULLSCREEN, USER_DENIED
  }
}

/**
 * Setup viewport height and safe area tracking
 */
function setupViewportTracking(webApp: TelegramWebApp): void {
  const updateViewport = () => {
    // Update viewport height
    const vh =
      webApp.viewportStableHeight ||
      webApp.viewportHeight ||
      window.innerHeight;
    document.documentElement.style.setProperty('--app-vh', `${vh}px`);

    // Update safe area insets
    const { top, bottom, left, right } = webApp.safeAreaInset || {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    document.documentElement.style.setProperty('--safe-area-top', `${top}px`);
    document.documentElement.style.setProperty(
      '--safe-area-bottom',
      `${bottom}px`,
    );
    document.documentElement.style.setProperty('--safe-area-left', `${left}px`);
    document.documentElement.style.setProperty(
      '--safe-area-right',
      `${right}px`,
    );

  };

  updateViewport();

  // Listen to multiple events for better responsiveness
  webApp.onEvent?.('viewportChanged', updateViewport);
  window.addEventListener('resize', updateViewport);
  window.addEventListener('orientationchange', updateViewport);
}

/**
 * Setup fullscreen event handlers
 */
function setupFullscreenHandlers(webApp: TelegramWebApp): void {
  // fullscreen_changed event
  webApp.onEvent?.('fullscreen_changed', () => {
    window.dispatchEvent(
      new CustomEvent('telegram-fullscreen-change', {
        detail: { isFullscreen: webApp.isFullscreen },
      }),
    );
  });

  webApp.onEvent?.('fullscreen_failed', () => {
    // UNSUPPORTED, ALREADY_FULLSCREEN — молча игнорируем
  });
}

/**
 * Set Telegram theme colors (header & background)
 *
 * Устанавливает светлые системные цвета, чтобы overscroll зоны не были черными.
 */
function setTelegramThemeColors(webApp: TelegramWebApp): void {
  const appBg = '#f2f2f5';
  const appHeader = '#ffffff';

  // На некоторых клиентах overscroll берет цвет header; выставляем светлый, чтобы не было черной зоны.
  if (typeof webApp.setHeaderColor === 'function') {
    webApp.setHeaderColor(appHeader);
  }

  if (typeof webApp.setBackgroundColor === 'function') {
    webApp.setBackgroundColor(appBg);
  }
}

/**
 * Check if currently in fullscreen mode
 */
export function isFullscreenMode(): boolean {
  return window.Telegram?.WebApp?.isFullscreen ?? false;
}

/**
 * Get Telegram platform information
 */
export function getTelegramPlatformInfo() {
  const webApp = window.Telegram?.WebApp;
  return {
    platform: webApp?.platform,
    version: webApp?.version,
    hasFullscreenAPI: typeof webApp?.requestFullscreen === 'function',
    isFullscreen: webApp?.isFullscreen ?? false,
  };
}

export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.Telegram?.WebApp?.initData ?? null;
}

// Демо-ID для локальной разработки вне Telegram (не реальный пользователь)
const DEMO_TELEGRAM_USER_ID = '900000001';

export function getTelegramUserIdFallback(): string {
  if (typeof window === 'undefined') {
    return DEMO_TELEGRAM_USER_ID;
  }

  const fromTelegram = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (fromTelegram) {
    return String(fromTelegram);
  }

  return window.localStorage.getItem('tg_demo_user_id') || DEMO_TELEGRAM_USER_ID;
}

export function getTelegramProfileFallback(): TelegramProfile {
  if (typeof window === 'undefined') {
    return {
      telegramUserId: DEMO_TELEGRAM_USER_ID,
      fullName: 'Вы',
      avatarUrl: null,
    };
  }

  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const fromTelegramId = user?.id ? String(user.id) : null;
  const telegramUserId =
    fromTelegramId ??
    window.localStorage.getItem('tg_demo_user_id') ??
    DEMO_TELEGRAM_USER_ID;

  const firstName = (user?.first_name ?? '').trim();
  const lastName = (user?.last_name ?? '').trim();
  const fallbackName = (user?.username ?? '').trim();
  const fullName = `${firstName} ${lastName}`.trim() || fallbackName || 'Вы';

  return {
    telegramUserId,
    fullName,
    avatarUrl: user?.photo_url ?? null,
  };
}
