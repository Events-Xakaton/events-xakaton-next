'use client';

import { useEffect, useState } from 'react';

import { useLuckyWheelStreakQuery } from '@/entities/event/api';
import type { LuckyWheelStreakRes } from '@/entities/event/api';

// В Telegram Mini App localStorage не сохраняется между открытиями приложения,
// поэтому используем sessionStorage — он живёт ровно одну сессию (одно открытие WebView).
// Показываем модалку один раз за сессию, что и есть «один раз за открытие приложения».
const SESSION_KEY = 'streak_modal_shown';

type UseLoginStreakModalResult = {
  open: boolean;
  close: () => void;
  data: LuckyWheelStreakRes | undefined;
};

export function useLoginStreakModal(): UseLoginStreakModalResult {
  const [alreadyShown] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem(SESSION_KEY) === '1';
  });

  // Показываем только если пасхалка активирована
  const [isLuckyUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('lucky_wheel_unlocked') === '1';
  });

  const [open, setOpen] = useState(false);

  const { data, isSuccess } = useLuckyWheelStreakQuery(undefined, {
    skip: alreadyShown || !isLuckyUnlocked,
  });

  useEffect(() => {
    if (isSuccess && data && !alreadyShown) {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, [isSuccess, data, alreadyShown]);

  function close(): void {
    setOpen(false);
  }

  return { open, close, data };
}
