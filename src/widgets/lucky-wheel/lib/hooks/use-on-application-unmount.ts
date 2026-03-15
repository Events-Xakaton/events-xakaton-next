'use client';

import { useApplication } from '@pixi/react';
import { useEffect } from 'react';

export function useOnApplicationUnmount(): void {
  const { app } = useApplication();

  // Очищаем Pixi Application при размонтировании — освобождаем GPU-ресурсы
  useEffect(() => {
    return () => {
      if (app) {
        app.ticker?.stop();
        app.destroy(true, {
          children: true,
          texture: true,
          textureSource: true,
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
