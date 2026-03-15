'use client';

import { useEffect, useState } from 'react';

import { useLuckyWheelStreakQuery } from '@/entities/event/api';
import type { LuckyWheelStreakRes } from '@/entities/event/api';

const STORAGE_KEY = 'streak_modal_shown_date';

type TgCloudStorage = {
  getItem: (key: string, callback: (err: unknown, value: string) => void) => void;
  setItem: (key: string, value: string, callback?: () => void) => void;
};

function getTgCloudStorage(): TgCloudStorage | undefined {
  return (
    window as Window & {
      Telegram?: { WebApp?: { CloudStorage?: TgCloudStorage } };
    }
  ).Telegram?.WebApp?.CloudStorage;
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

type UseLoginStreakModalResult = {
  open: boolean;
  close: () => void;
  data: LuckyWheelStreakRes | undefined;
};

export function useLoginStreakModal(): UseLoginStreakModalResult {
  // Пока проверяем CloudStorage — держим запрос на паузе
  const [checking, setChecking] = useState(true);
  const [alreadyShown, setAlreadyShown] = useState(false);

  const [isLuckyUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('lucky_wheel_unlocked') === '1';
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const today = getTodayDateString();

    // localStorage — быстрая синхронная проверка (персистится на большинстве устройств)
    if (localStorage.getItem(STORAGE_KEY) === today) {
      setAlreadyShown(true);
      setChecking(false);
      return;
    }

    // CloudStorage — кросс-девайс fallback
    const cloudStorage = getTgCloudStorage();
    if (!cloudStorage) {
      setChecking(false);
      return;
    }

    cloudStorage.getItem(STORAGE_KEY, (err, value) => {
      if (!err && value === today) {
        localStorage.setItem(STORAGE_KEY, today);
        setAlreadyShown(true);
      }
      setChecking(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isSuccess } = useLuckyWheelStreakQuery(undefined, {
    skip: checking || alreadyShown || !isLuckyUnlocked,
  });

  useEffect(() => {
    if (isSuccess && data && !alreadyShown) {
      setOpen(true);
      // Записываем сегодняшнюю дату в оба хранилища
      const today = getTodayDateString();
      localStorage.setItem(STORAGE_KEY, today);
      getTgCloudStorage()?.setItem(STORAGE_KEY, today);
    }
  }, [isSuccess, data, alreadyShown]);

  function close(): void {
    setOpen(false);
  }

  return { open, close, data };
}
