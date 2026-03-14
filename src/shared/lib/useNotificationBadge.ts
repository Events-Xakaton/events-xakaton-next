'use client';

import { useEffect, useMemo, useState } from 'react';

import { useNotificationsQuery } from '@/shared/api/notifications-api';

const SEEN_CURSOR_KEY = 'notifications_seen_cursor';
const NOTIFICATIONS_POLLING_INTERVAL_MS = 20_000; // 20 секунд

type UseNotificationBadgeResult = {
  hasNewNotifications: boolean;
  markSeen: () => void;
};

/**
 * Опрашивает уведомления каждые 20с и сравнивает с курсором последнего просмотра.
 * Курсор сохраняется в localStorage и сбрасывается при вызове markSeen().
 */
export function useNotificationBadge(): UseNotificationBadgeResult {
  const [seenCursor, setSeenCursor] = useState<string | null>(null);

  const notificationsQuery = useNotificationsQuery(
    { filter: 'all' },
    {
      pollingInterval: NOTIFICATIONS_POLLING_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const latestCreatedAt =
    notificationsQuery.data?.items?.[0]?.createdAt ?? null;

  // Восстанавливаем курсор из localStorage при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SEEN_CURSOR_KEY);
    if (stored) setSeenCursor(stored);
  }, []);

  const hasNewNotifications = useMemo(() => {
    if (!latestCreatedAt) return false;
    if (!seenCursor) return true;
    const latestMs = new Date(latestCreatedAt).getTime();
    const seenMs = new Date(seenCursor).getTime();
    if (!Number.isFinite(latestMs) || !Number.isFinite(seenMs)) {
      return latestCreatedAt !== seenCursor;
    }
    return latestMs > seenMs;
  }, [latestCreatedAt, seenCursor]);

  function markSeen(): void {
    if (typeof window === 'undefined' || !latestCreatedAt) return;
    setSeenCursor(latestCreatedAt);
    window.localStorage.setItem(SEEN_CURSOR_KEY, latestCreatedAt);
  }

  return { hasNewNotifications, markSeen };
}
