'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';

import { initFrontendTelemetry } from '@/shared/observability/telemetry';
import { WebVitalsListener } from '@/shared/observability/web-vitals-listener';
import { store } from '@/shared/store/store';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer telemetry init to not block initial render
    const timer = setTimeout(() => {
      initFrontendTelemetry();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <WebVitalsListener />
      {children}
    </Provider>
  );
}
