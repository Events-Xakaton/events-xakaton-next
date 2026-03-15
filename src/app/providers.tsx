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
  retrieveRawInitData,
  setMiniAppBackgroundColor,
  setMiniAppHeaderColor,
  viewportStableHeight,
} from '@telegram-apps/sdk';
import { useSignal } from '@telegram-apps/sdk-react';
import type { FC } from 'react';
import { useEffect } from 'react';
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
    const apply = (): void => {
      // stableHeight из Telegram SDK может вернуть 0 или некорректное значение
      // при запуске вне Telegram (dev-режим, браузер). Берём максимум из значения
      // SDK и реальной высоты окна — это также корректно обрабатывает открытие
      // клавиатуры (stableHeight не меняется, window.innerHeight уменьшается).
      const vh = Math.max(stableHeight ?? 0, window.innerHeight);
      document.documentElement.style.setProperty('--app-vh', `${vh}px`);
    };

    apply();

    // Дебаунс нужен, чтобы сотни событий resize при ресайзе окна не вызывали
    // сотни перерисовок компонентов, завязанных на --app-vh.
    let timer: ReturnType<typeof setTimeout>;
    const onResize = (): void => {
      clearTimeout(timer);
      timer = setTimeout(apply, 100);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [stableHeight]);

  return null;
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      init();

      if (mountMiniAppSync.isAvailable()) mountMiniAppSync();
      if (miniAppReady.isAvailable()) miniAppReady();

      // Логирование — только после критических вызовов, чтобы ошибка здесь
      // не помешала miniAppReady() и не оставила Telegram-оверлей висеть поверх приложения
      try {
        const raw =
          process.env['NEXT_PUBLIC_ENV'] === 'development'
            ? process.env['NEXT_PUBLIC_INIT_DATA']
            : retrieveRawInitData();
        console.group('[TG SDK init]');
        console.log(
          'initDataRaw после init():',
          raw ? `${raw.slice(0, 80)}…` : null,
        );
        console.log(
          'window.location.hash:',
          window.location.hash.slice(0, 120),
        );
        console.groupEnd();
      } catch {
        // Логирование не критично
      }

      // Сначала монтируем viewport, затем разворачиваем и запрашиваем fullscreen
      const viewportReady = mountViewport.isAvailable()
        ? mountViewport()
        : Promise.resolve();

      void viewportReady.then(() => {
        if (expandViewport.isAvailable()) expandViewport();
        // requestFullscreen — Bot API 8.0+, на старых клиентах вернёт ошибку которую игнорируем
        if (
          requestFullscreen.isAvailable() &&
          process.env['NEXT_PUBLIC_ENV'] !== 'development'
        )
          void requestFullscreen();
      });

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
