'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type NotificationItem,
  useLazyNotificationsQuery,
  useMarkReadMutation,
} from '@/shared/api/notifications-api';

type UseNotificationsResult = {
  items: NotificationItem[];
  nextCursor: string | null;
  isInitialLoading: boolean;
  isPageLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  loadPage: (cursor: string | null, reset: boolean) => Promise<void>;
};

export function useNotifications(): UseNotificationsResult {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Отслеживаем таймеры и статус прочтения, чтобы не дублировать запросы
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const pendingRef = useRef<Set<string>>(new Set());
  const doneRef = useRef<Set<string>>(new Set());

  const [loadNotifications, query] = useLazyNotificationsQuery();
  const [markRead] = useMarkReadMutation();

  const loadPage = useCallback(
    async (cursor: string | null, reset: boolean): Promise<void> => {
      const page = await loadNotifications({ filter: 'all', cursor }).unwrap();
      setItems((prev) => {
        if (reset) return page.items;
        // Дедупликация при подгрузке следующих страниц
        const map = new Map<string, NotificationItem>();
        [...prev, ...page.items].forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
      setNextCursor(page.nextCursor ?? null);
      setInitialLoaded(true);
    },
    [loadNotifications],
  );

  // Первичная загрузка
  useEffect(() => {
    void loadPage(null, true);
  }, [loadPage]);

  // IntersectionObserver для автоматической отметки прочитанных (0.5s дедлайн)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const id = target.dataset.notificationId;
          if (!id) continue;

          const item = items.find((row) => row.id === id);
          if (
            !item ||
            item.isRead ||
            doneRef.current.has(id) ||
            pendingRef.current.has(id)
          ) {
            continue;
          }

          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            if (timersRef.current.has(id)) continue;
            const timer = setTimeout(async () => {
              timersRef.current.delete(id);
              pendingRef.current.add(id);
              try {
                await markRead({ id }).unwrap();
                doneRef.current.add(id);
                setItems((prev) =>
                  prev.map((row) =>
                    row.id === id ? { ...row, isRead: true } : row,
                  ),
                );
              } catch {
                // Ошибки игнорируем — item будет повторно проверен при следующей видимости
              } finally {
                pendingRef.current.delete(id);
              }
            }, 500);
            timersRef.current.set(id, timer);
          } else {
            const timer = timersRef.current.get(id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(id);
            }
          }
        }
      },
      { threshold: [0.65] },
    );

    const nodes = document.querySelectorAll<HTMLElement>(
      '[data-notification-id]',
    );
    nodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, [items, markRead]);

  return {
    items,
    nextCursor,
    isInitialLoading: !initialLoaded && query.isFetching,
    isPageLoading: initialLoaded && query.isFetching,
    isEmpty: initialLoaded && !query.isFetching && items.length === 0,
    isError: query.isError,
    loadPage,
  };
}
