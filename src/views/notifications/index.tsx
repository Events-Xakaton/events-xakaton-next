'use client';

import { BellOff, CalendarClock, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppHeader } from '@/widgets/app-header';

import {
  type NotificationItem,
  useLazyNotificationsQuery,
  useMarkReadMutation,
} from '@/shared/api/notifications-api';
import { Button, ButtonVariant } from '@/shared/components/button';
import { formatLocalDateTime } from '@/shared/lib/time';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

type ParsedEventChanged = {
  eventName: string | null;
  nextTime: string | null;
  nextLocation: string | null;
};

function renderMarkedText(text: string) {
  const chunks = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return chunks.map((chunk, index) => {
    const isStrong = chunk.startsWith('**') && chunk.endsWith('**');
    if (!isStrong) {
      return (
        <span key={`plain-${index}`} className="text-neutral-700">
          {chunk}
        </span>
      );
    }

    return (
      <span key={`strong-${index}`} className="font-semibold text-neutral-900">
        {chunk.slice(2, -2)}
      </span>
    );
  });
}

function parseEventChangedText(text: string): ParsedEventChanged {
  const eventNameMatch = text.match(/\*\*([^*]+)\*\*/);
  const nextTimeMatch = text.match(/новое\s+время\s*[—:-]\s*\*\*([^*]+)\*\*/i);
  const nextLocationMatch = text.match(
    /новая\s+локация\s*[—:-]\s*\*\*([^*]+)\*\*/i,
  );

  return {
    eventName: eventNameMatch?.[1]?.trim() || null,
    nextTime: nextTimeMatch?.[1]?.trim() || null,
    nextLocation: nextLocationMatch?.[1]?.trim() || null,
  };
}

function formatEventTime(value: string): string {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatLocalDateTime(value);
  }
  return value;
}

function renderEventChangedText(item: NotificationItem) {
  const parsed = parseEventChangedText(item.preview);
  if (!parsed.eventName && !parsed.nextTime && !parsed.nextLocation) {
    return (
      <p className="mt-1 text-[15px] leading-5">
        {renderMarkedText(item.preview)}
      </p>
    );
  }

  return (
    <div className="mt-1 space-y-1">
      {parsed.eventName ? (
        <p className="text-[15px] font-semibold leading-5 text-neutral-900">
          {parsed.eventName}
        </p>
      ) : null}
      {parsed.nextTime ? (
        <p className="text-[15px] leading-5 text-neutral-700">
          Новое время:{' '}
          <span className="font-semibold text-neutral-900">
            {formatEventTime(parsed.nextTime)}
          </span>
        </p>
      ) : null}
      {parsed.nextLocation ? (
        <p className="text-[15px] leading-5 text-neutral-700">
          Новая локация:{' '}
          <span className="font-semibold text-neutral-900">
            {parsed.nextLocation}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function renderMemberJoinedText(item: NotificationItem) {
  const values = Array.from(item.preview.matchAll(/\*\*([^*]+)\*\*/g))
    .map((m) => m[1]?.trim())
    .filter(Boolean) as string[];

  if (values.length < 2) {
    return (
      <p className="mt-1 text-[15px] leading-5">
        {renderMarkedText(item.preview)}
      </p>
    );
  }

  const [userName, entityName] = values;
  const joinedLabel =
    item.targetType === 'club'
      ? 'присоединился к клубу'
      : 'присоединился к ивенту';

  return (
    <p className="mt-1 text-[15px] leading-5 text-neutral-700">
      <span className="font-semibold text-neutral-900">{userName}</span>{' '}
      {joinedLabel}{' '}
      <span className="font-semibold text-neutral-900">{entityName}</span>
    </p>
  );
}

function NotificationIcon({ item }: { item: NotificationItem }) {
  const isEventChanged = item.type === 'event_changed';
  const Icon = isEventChanged ? CalendarClock : UserPlus;

  return (
    <div
      className={cn(
        'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border',
        isEventChanged
          ? 'border-primary-100 bg-primary-50 text-primary-600'
          : 'border-neutral-200 bg-neutral-100 text-neutral-700',
      )}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

export function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const pendingRef = useRef<Set<string>>(new Set());
  const doneRef = useRef<Set<string>>(new Set());

  const [loadNotifications, query] = useLazyNotificationsQuery();
  const [markRead] = useMarkReadMutation();

  const loadPage = useCallback(
    async (cursor: string | null, reset: boolean) => {
      const page = await loadNotifications({ filter: 'all', cursor }).unwrap();
      setItems((prev) => {
        if (reset) return page.items;
        const map = new Map<string, NotificationItem>();
        [...prev, ...page.items].forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
      setNextCursor(page.nextCursor ?? null);
      setInitialLoaded(true);
    },
    [loadNotifications],
  );

  useEffect(() => {
    void loadPage(null, true);
  }, [loadPage]);

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
                // ignore network/race errors; item will be retried on next visibility
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

  const isInitialLoading = !initialLoaded && query.isFetching;
  const isPageLoading = initialLoaded && query.isFetching;
  const isEmpty = initialLoaded && !query.isFetching && items.length === 0;

  return (
    <div
      className="relative bg-[#f2f2f5]"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingTop: `calc(${SAFE_AREA_TOP} + 88px)`,
        paddingBottom: getBottomPadding('list'),
      }}
    >
      <AppHeader
        mode="fixed"
        topClassName="z-fixed"
        useSafeArea={false}
        showTopGap={false}
        rootStyle={{ paddingTop: `calc(${SAFE_AREA_TOP} + 16px)` }}
        title="Уведомления"
      />

      <div className="space-y-2.5 px-4">
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary-500" />
          </div>
        ) : null}

        {query.isError ? (
          <section className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-red-500">
              Не удалось загрузить уведомления
            </p>
            <Button
              className="mt-4 rounded-full"
              variant={ButtonVariant.SECONDARY}
              onClick={() => {
                void loadPage(null, true);
              }}
            >
              Повторить
            </Button>
          </section>
        ) : null}

        {!query.isError ? (
          <section className="space-y-2">
            {items.map((item) => {
              const isUnread = !item.isRead;

              return (
                <article
                  key={item.id}
                  data-notification-id={item.id}
                  className={cn(
                    'rounded-3xl border px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]',
                    isUnread
                      ? 'border-primary-100 bg-primary-50/40'
                      : 'border-neutral-200 bg-white',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <NotificationIcon item={item} />

                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-5 text-neutral-900">
                        {item.type === 'event_changed'
                          ? 'Изменения в ивенте'
                          : item.title}
                      </p>
                      {item.type === 'event_changed'
                        ? renderEventChangedText(item)
                        : renderMemberJoinedText(item)}

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-neutral-500">
                          {formatLocalDateTime(item.createdAt)}
                        </span>
                        {isUnread ? (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-primary-500"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {isEmpty ? (
              <section className="rounded-3xl border border-neutral-200 bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500">
                  <BellOff className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-lg font-semibold text-neutral-900">
                  Пока нет уведомлений
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Когда появятся изменения по вашим клубам и ивентам, они будут
                  здесь.
                </p>
              </section>
            ) : null}

            {nextCursor ? (
              <Button
                className="w-full rounded-full"
                variant={ButtonVariant.SECONDARY}
                isLoading={isPageLoading}
                onClick={() => {
                  void loadPage(nextCursor, false);
                }}
              >
                Показать еще
              </Button>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
