'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';

import { initFrontendTelemetry } from '@/shared/observability/telemetry';
import { WebVitalsListener } from '@/shared/observability/web-vitals-listener';
import { store } from '@/shared/store/store';

// Откладываем инициализацию телеметрии, чтобы не блокировать первый рендер
const TELEMETRY_INIT_DELAY_MS = 100;

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      initFrontendTelemetry();
    }, TELEMETRY_INIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <WebVitalsListener />
      {children}
    </Provider>
  );
}
