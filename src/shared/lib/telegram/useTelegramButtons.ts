"use client";

import { useEffect } from "react";

/**
 * Управление Telegram MainButton (BottomButton)
 *
 * MainButton - это системная кнопка внизу экрана в compact mode.
 * Используется для основных действий (Submit, Publish, Save, etc.)
 *
 * @param config.text - Текст кнопки
 * @param config.onClick - Callback при клике
 * @param config.enabled - Можно ли кликнуть (disabled если false)
 * @param config.visible - Показывать ли кнопку
 *
 * @example
 * ```tsx
 * const mode = useViewportMode();
 *
 * useTelegramMainButton({
 *   text: "Создать событие",
 *   onClick: handleSubmit,
 *   enabled: canPublish,
 *   visible: mode === "compact",
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
    // SSR guard
    if (typeof window === "undefined") {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }

    const button = (webApp as any).MainButton;
    if (!button) {
      console.warn("[useTelegramMainButton] MainButton API not available");
      return;
    }

    if (config.visible) {
      // Настроить внешний вид
      button.text = config.text;
      button.color = "#7c3aed"; // primary-500
      button.textColor = "#ffffff";

      // Состояние enabled/disabled
      if (config.enabled) {
        button.enable();
      } else {
        button.disable();
      }

      // Показать кнопку
      button.show();

      // Обработчик клика
      const handler = () => config.onClick();
      button.onClick(handler);

      // Cleanup
      return () => {
        button.hide();
        button.offClick(handler);
      };
    } else {
      button.hide();
    }
  }, [config.text, config.onClick, config.enabled, config.visible]);
}

/**
 * Управление Telegram BackButton
 *
 * BackButton - это системная кнопка "назад" в левом верхнем углу.
 * Используется для навигации из detail screens.
 *
 * @param config.onClick - Callback при клике
 * @param config.visible - Показывать ли кнопку
 *
 * @example
 * ```tsx
 * useTelegramBackButton({
 *   onClick: () => navigate("/home"),
 *   visible: true,
 * });
 * ```
 */
export function useTelegramBackButton(config: {
  onClick: () => void;
  visible: boolean;
}): void {
  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }

    const button = (webApp as any).BackButton;
    if (!button) {
      console.warn("[useTelegramBackButton] BackButton API not available");
      return;
    }

    if (config.visible) {
      // Обработчик клика
      const handler = () => config.onClick();
      button.onClick(handler);

      // Показать кнопку
      button.show();

      // Cleanup
      return () => {
        button.hide();
        button.offClick(handler);
      };
    } else {
      button.hide();
    }
  }, [config.onClick, config.visible]);
}
