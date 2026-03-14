'use client';

import {
  hideBackButton,
  isBackButtonMounted,
  isMainButtonMounted,
  mountBackButton,
  mountMainButton,
  onBackButtonClick,
  onMainButtonClick,
  setMainButtonParams,
  showBackButton,
} from '@telegram-apps/sdk';
import { useEffect } from 'react';

// Цвет кнопки совпадает с primary-500 из темы приложения
const MAIN_BUTTON_COLOR = '#7c3aed';
const MAIN_BUTTON_TEXT_COLOR = '#ffffff';

/**
 * Управление Telegram MainButton (системная кнопка внизу экрана в compact mode).
 * Используется для основных действий (Submit, Publish, Save и т.п.)
 *
 * @example
 * ```tsx
 * const mode = useViewportMode();
 *
 * useTelegramMainButton({
 *   text: 'Создать мероприятие',
 *   onClick: handleSubmit,
 *   enabled: canPublish,
 *   visible: mode === 'compact',
 * });
 * ```
 */
export function useTelegramMainButton(config: {
  text: string;
  onClick: () => void;
  enabled: boolean;
  visible: boolean;
}): void {
  useEffect(() => {
    // Монтируем кнопку при первом использовании
    if (!isMainButtonMounted() && mountMainButton.isAvailable()) {
      mountMainButton();
    }

    if (config.visible) {
      if (setMainButtonParams.isAvailable()) {
        setMainButtonParams({
          text: config.text,
          backgroundColor: MAIN_BUTTON_COLOR,
          textColor: MAIN_BUTTON_TEXT_COLOR,
          isEnabled: config.enabled,
          isVisible: true,
        });
      }

      if (!onMainButtonClick.isAvailable()) return;
      const cleanup = onMainButtonClick(config.onClick);

      return () => {
        cleanup();
        if (setMainButtonParams.isAvailable()) {
          setMainButtonParams({ isVisible: false });
        }
      };
    } else {
      if (setMainButtonParams.isAvailable()) {
        setMainButtonParams({ isVisible: false });
      }
    }
  }, [config.text, config.onClick, config.enabled, config.visible]);
}

/**
 * Управление Telegram BackButton (системная кнопка «назад» в левом верхнем углу).
 * Используется для навигации с detail-экранов.
 *
 * @example
 * ```tsx
 * useTelegramBackButton({
 *   onClick: () => onBack(),
 *   visible: true,
 * });
 * ```
 */
export function useTelegramBackButton(config: {
  onClick: () => void;
  visible: boolean;
}): void {
  useEffect(() => {
    // Монтируем кнопку при первом использовании
    if (!isBackButtonMounted() && mountBackButton.isAvailable()) {
      mountBackButton();
    }

    if (config.visible) {
      if (showBackButton.isAvailable()) showBackButton();

      if (!onBackButtonClick.isAvailable()) return;
      const cleanup = onBackButtonClick(config.onClick);

      return () => {
        cleanup();
        if (hideBackButton.isAvailable()) hideBackButton();
      };
    } else {
      if (hideBackButton.isAvailable()) hideBackButton();
    }
  }, [config.onClick, config.visible]);
}
