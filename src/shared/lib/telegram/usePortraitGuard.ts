'use client';

import { useEffect, useState } from 'react';

type TelegramWebApp = {
  lockOrientation?: () => void;
  platform?: string;
};

function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;

  type TelegramWindow = Window & {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  };

  const tgWindow = window as TelegramWindow;
  return tgWindow.Telegram?.WebApp ?? null;
}

function isTelegramMobilePlatform(platform: string | undefined): boolean {
  return platform === 'android' || platform === 'ios';
}

function detectPortrait(): boolean {
  if (typeof window === 'undefined') return true;

  if (window.matchMedia) {
    return window.matchMedia('(orientation: portrait)').matches;
  }

  return window.innerHeight >= window.innerWidth;
}

/**
 * Guards Mini App from landscape on Telegram mobile clients.
 * - In landscape: blocks UI with rotate-device screen.
 * - In portrait: tries to lock current orientation via Telegram WebApp API.
 */
export function usePortraitGuard(): {
  isLandscapeBlocked: boolean;
} {
  const [isTelegramMobile, setIsTelegramMobile] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(true);

  useEffect(() => {
    const update = () => {
      const webApp = getTelegramWebApp();
      const isMobile = isTelegramMobilePlatform(webApp?.platform);
      setIsTelegramMobile(isMobile);

      if (isMobile) {
        setIsPortrait(detectPortrait());
      } else {
        setIsPortrait(true);
      }
    };

    update();

    const mediaQuery = window.matchMedia
      ? window.matchMedia('(orientation: portrait)')
      : null;

    if (mediaQuery) {
      const onChange = () => update();
      mediaQuery.addEventListener('change', onChange);
      window.addEventListener('resize', update);

      return () => {
        mediaQuery.removeEventListener('change', onChange);
        window.removeEventListener('resize', update);
      };
    }

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [isTelegramMobile]);

  useEffect(() => {
    if (!isTelegramMobile || !isPortrait) return;

    try {
      const webApp = getTelegramWebApp();
      webApp?.lockOrientation?.();
    } catch {
      // Ignore unsupported clients and non-Telegram environments.
    }
  }, [isPortrait, isTelegramMobile]);

  return {
    isLandscapeBlocked: isTelegramMobile && !isPortrait,
  };
}
