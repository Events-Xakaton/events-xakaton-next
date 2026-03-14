'use client';

import {
  disableVerticalSwipes,
  expandViewport,
  init,
  miniAppReady,
  mountMiniAppSync,
  mountSwipeBehavior,
  mountViewport,
  requestFullscreen,
  setMiniAppBackgroundColor,
  setMiniAppHeaderColor,
  viewportStableHeight,
} from '@telegram-apps/sdk';
import { useSignal } from '@telegram-apps/sdk-react';
import { FC, useEffect } from 'react';
import { Provider } from 'react-redux';

import { initFrontendTelemetry } from '@/shared/observability/telemetry';
import { WebVitalsListener } from '@/shared/observability/web-vitals-listener';
import { store } from '@/shared/store/store';

// Откладываем инициализацию телеметрии, чтобы не блокировать первый рендер
const TELEMETRY_INIT_DELAY_MS = 100;

const APP_BG_COLOR = '#f2f2f5';
const APP_HEADER_COLOR = '#ffffff';

/**
 * Синхронизирует высоту вьюпорта Telegram с CSS-переменной --app-vh.
 * Реактивно обновляется при изменении размера вьюпорта (смена ориентации, разворачивание).
 */
const TelegramViewportSync: FC = () => {
  const stableHeight = useSignal(viewportStableHeight);

  useEffect(() => {
    const vh = stableHeight ?? window.innerHeight;
    document.documentElement.style.setProperty('--app-vh', `${vh}px`);
  }, [stableHeight]);

  return null;
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      init();

      if (mountMiniAppSync.isAvailable()) mountMiniAppSync();
      if (miniAppReady.isAvailable()) miniAppReady();

      // mountViewport возвращает Promise — не ждём, запускаем фоново
      if (mountViewport.isAvailable()) void mountViewport();

      if (expandViewport.isAvailable()) expandViewport();

      // requestFullscreen — Bot API 8.0+, на старых клиентах вернёт ошибку которую игнорируем
      if (requestFullscreen.isAvailable()) void requestFullscreen();

      if (mountSwipeBehavior.isAvailable()) mountSwipeBehavior();
      if (disableVerticalSwipes.isAvailable()) disableVerticalSwipes();

      if (setMiniAppHeaderColor.isAvailable())
        setMiniAppHeaderColor(APP_HEADER_COLOR);
      if (setMiniAppBackgroundColor.isAvailable())
        setMiniAppBackgroundColor(APP_BG_COLOR);
    } catch {
      // Вне Telegram (браузер, dev-режим) — игнорируем
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      initFrontendTelemetry();
    }, TELEMETRY_INIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <TelegramViewportSync />
      <WebVitalsListener />
      {children}
    </Provider>
  );
}
