'use client';

import { useEffect, useState } from 'react';

/**
 * Viewport mode: fullscreen или compact
 *
 * - **fullscreen**: Открыто из чата (menu button ☰) или поддерживается Bot API 8.0+
 * - **compact**: Открыто из профиля бота или старый клиент без fullscreen API
 */
export type ViewportMode = 'fullscreen' | 'compact';

/**
 * Хук для определения режима viewport
 *
 * Определяет режим на основе Telegram WebApp API (`isFullscreen`).
 * Слушает событие `fullscreen_changed` для обновления режима.
 *
 * **Режимы:**
 * - **fullscreen**: Открыто из чата (menu button) с Bot API 8.0+
 * - **compact**: Открыто из профиля бота или старый клиент
 *
 * @returns ViewportMode - текущий режим viewport
 *
 * @example
 * ```tsx
 * const mode = useViewportMode();
 *
 * if (mode === 'fullscreen') {
 *   // Показываем кастомный BottomNav
 * } else {
 *   // Используем системные кнопки Telegram
 * }
 * ```
 */
export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>('compact');

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      console.warn('[useViewportMode] Telegram WebApp not available');
      return;
    }

    // Handler для fullscreen_changed события
    const handleFullscreenChanged = () => {
      const isFullscreen = webApp.isFullscreen ?? false;
      const newMode: ViewportMode = isFullscreen ? 'fullscreen' : 'compact';

      console.log('[useViewportMode] Fullscreen changed:', {
        isFullscreen,
        mode: newMode,
        viewportHeight: webApp.viewportStableHeight,
      });

      setMode(newMode);
    };

    // КРИТИЧНО: Проверить ТЕКУЩЕЕ состояние при инициализации
    // Это обрабатывает случай когда хук монтируется ПОСЛЕ fullscreen_changed
    const currentIsFullscreen = webApp.isFullscreen ?? false;
    const initialMode: ViewportMode = currentIsFullscreen
      ? 'fullscreen'
      : 'compact';

    console.log('[useViewportMode] Initial state:', {
      isFullscreen: currentIsFullscreen,
      mode: initialMode,
      viewportHeight: webApp.viewportStableHeight,
    });

    setMode(initialMode);

    // Слушаем ТОЛЬКО fullscreen_changed (единственный надежный источник истины)
    webApp.onEvent?.('fullscreen_changed', handleFullscreenChanged);

    return () => {
      webApp.offEvent?.('fullscreen_changed', handleFullscreenChanged);
    };
  }, []);

  return mode;
}
