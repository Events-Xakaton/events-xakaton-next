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

  console.log('[Telegram WebApp] Initialization complete');
}

function disableVerticalSwipesSafe(webApp: TelegramWebApp): void {
  if (typeof webApp.disableVerticalSwipes !== 'function') {
    console.warn('[Telegram WebApp] disableVerticalSwipes not available');
    return;
  }
  try {
    webApp.disableVerticalSwipes();
    console.log('[Telegram WebApp] Vertical swipes disabled');
  } catch (error) {
    console.error(
      '[Telegram WebApp] Failed to disable vertical swipes:',
      error,
    );
  }
}

/**
 * Log diagnostic information during initialization
 */
function logTelegramInit(webApp: TelegramWebApp): void {
  const info = {
    platform: webApp.platform,
    version: webApp.version,
    hasFullscreenAPI: typeof webApp.requestFullscreen === 'function',
    initialViewportHeight: webApp.viewportStableHeight,
    initialIsFullscreen: webApp.isFullscreen,
  };

  console.log('[Telegram WebApp] Initializing...', info);
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

  console.log('[Telegram WebApp] Requesting fullscreen...');

  try {
    await webApp.requestFullscreen();
    console.log('[Telegram WebApp] Fullscreen request sent');
  } catch (error) {
    console.error('[Telegram WebApp] Fullscreen request failed:', error);
    // Expected errors:
    // - "UNSUPPORTED" - platform doesn't support fullscreen
    // - "ALREADY_FULLSCREEN" - already in fullscreen mode
    // - "USER_DENIED" - user rejected (rare)
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

    // Diagnostic logging
    console.log('[Telegram WebApp] Viewport updated:', {
      stableHeight: webApp.viewportStableHeight,
      currentHeight: webApp.viewportHeight,
      isFullscreen: webApp.isFullscreen,
      safeArea: { top, bottom, left, right },
    });
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
  webApp.onEvent?.('fullscreen_changed', (params) => {
    console.log('[Telegram WebApp] Fullscreen changed:', {
      isFullscreen: webApp.isFullscreen,
      params,
    });

    // Dispatch custom event for React components (optional)
    window.dispatchEvent(
      new CustomEvent('telegram-fullscreen-change', {
        detail: { isFullscreen: webApp.isFullscreen },
      }),
    );
  });

  // fullscreen_failed event
  webApp.onEvent?.('fullscreen_failed', (params) => {
    console.error('[Telegram WebApp] Fullscreen failed:', params);
    // Expected errors: UNSUPPORTED, ALREADY_FULLSCREEN
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
  if (typeof (webApp as any).setHeaderColor === 'function') {
    (webApp as any).setHeaderColor(appHeader);
    console.log('[Telegram WebApp] Header color set to', appHeader);
  }

  // Установить светлый фон
  if (typeof (webApp as any).setBackgroundColor === 'function') {
    (webApp as any).setBackgroundColor(appBg);
    console.log('[Telegram WebApp] Background color set to', appBg);
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

export function getTelegramUserIdFallback(): string {
  if (typeof window === 'undefined') {
    return '900000001';
  }

  const fromTelegram = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (fromTelegram) {
    return String(fromTelegram);
  }

  return window.localStorage.getItem('tg_demo_user_id') || '900000001';
}

export function getTelegramProfileFallback(): TelegramProfile {
  if (typeof window === 'undefined') {
    return {
      telegramUserId: '900000001',
      fullName: 'Вы',
      avatarUrl: null,
    };
  }

  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const fromTelegramId = user?.id ? String(user.id) : null;
  const telegramUserId =
    fromTelegramId ??
    window.localStorage.getItem('tg_demo_user_id') ??
    '900000001';

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
