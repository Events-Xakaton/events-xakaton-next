'use client';

import { BellOff } from 'lucide-react';
import type { ReactElement } from 'react';

import { AppHeader } from '@/widgets/app-header';

import { Button, ButtonVariant } from '@/shared/components/button';
import { formatLocalDateTime } from '@/shared/lib/time';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

import {
  renderEventChangedText,
  renderMemberJoinedText,
} from './lib/notification-utils';
import { useNotifications } from './model/use-notifications';
import { NotificationIcon } from './ui/notification-icon';

export function NotificationsScreen(): ReactElement {
  const notifications = useNotifications();

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
        {notifications.isInitialLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary-500" />
          </div>
        ) : null}

        {notifications.isError ? (
          <section className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-red-500">
              Не удалось загрузить уведомления
            </p>
            <Button
              className="mt-4 rounded-full"
              variant={ButtonVariant.SECONDARY}
              onClick={() => void notifications.loadPage(null, true)}
            >
              Повторить
            </Button>
          </section>
        ) : null}

        {!notifications.isError ? (
          <section className="space-y-2">
            {notifications.items.map((item) => {
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

            {notifications.isEmpty ? (
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

            {notifications.nextCursor ? (
              <Button
                className="w-full rounded-full"
                variant={ButtonVariant.SECONDARY}
                isLoading={notifications.isPageLoading}
                onClick={() =>
                  void notifications.loadPage(notifications.nextCursor, false)
                }
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
