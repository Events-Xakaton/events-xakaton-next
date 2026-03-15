'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lucky_wheel_unlocked';

type TgCloudStorage = {
  getItem: (key: string, callback: (err: unknown, value: string) => void) => void;
  setItem: (key: string, value: string, callback?: () => void) => void;
};

function getTgCloudStorage(): TgCloudStorage | undefined {
  return (window as Window & { Telegram?: { WebApp?: { CloudStorage?: TgCloudStorage } } })
    .Telegram?.WebApp?.CloudStorage;
}

type UseLuckyWheelUnlockResult = {
  isUnlocked: boolean;
  /** true только в сессии первой активации — запускает wow-анимацию */
  isNewUnlock: boolean;
  unlock: () => void;
};

export function useLuckyWheelUnlock(): UseLuckyWheelUnlockResult {
  // Синхронная инициализация из localStorage
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  // true только когда разблокировано в ЭТОЙ сессии (для wow-анимации)
  const [isNewUnlock, setIsNewUnlock] = useState(false);

  // При монтировании: если localStorage пуст, проверяем Telegram CloudStorage
  useEffect(() => {
    if (isUnlocked) return;
    const tgCloudStorage = getTgCloudStorage();
    if (!tgCloudStorage) return;

    tgCloudStorage.getItem(STORAGE_KEY, (err: unknown, value: string) => {
      if (!err && value === '1') {
        localStorage.setItem(STORAGE_KEY, '1');
        setIsUnlocked(true);
        // Восстановлено из облака — не новая разблокировка (без wow-анимации)
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unlock = useCallback(() => {
    if (isUnlocked) return;
    // Сохраняем в оба хранилища
    localStorage.setItem(STORAGE_KEY, '1');
    getTgCloudStorage()?.setItem(STORAGE_KEY, '1');
    setIsUnlocked(true);
    setIsNewUnlock(true);
  }, [isUnlocked]);

  return { isUnlocked, isNewUnlock, unlock };
}
