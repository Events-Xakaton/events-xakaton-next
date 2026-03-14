'use client';

import { isFullscreen } from '@telegram-apps/sdk';
import { useSignal } from '@telegram-apps/sdk-react';

/**
 * Viewport mode: fullscreen или compact
 *
 * - **fullscreen**: Открыто из чата (menu button ☰) или Bot API 8.0+ поддерживает fullscreen
 * - **compact**: Открыто из профиля бота или старый клиент без fullscreen API
 */
export type ViewportMode = 'fullscreen' | 'compact';

/**
 * Хук для определения режима viewport на основе `isFullscreen` сигнала SDK.
 * Реактивно обновляется при смене режима.
 *
 * @returns ViewportMode — текущий режим viewport
 *
 * @example
 * ```tsx
 * const mode = useViewportMode();
 *
 * if (mode === 'fullscreen') {
 *   // Показываем кастомный BottomNav
 * } else {
 *   // Используем системные кнопки Telegram (MainButton)
 * }
 * ```
 */
export function useViewportMode(): ViewportMode {
  const fullscreen = useSignal(isFullscreen);
  return fullscreen ? 'fullscreen' : 'compact';
}
