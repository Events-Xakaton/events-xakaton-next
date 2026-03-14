'use client';

import { Bell, Home, Plus, Star, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useNotificationsQuery } from '@/shared/api/notifications-api';
import {
  SAFE_AREA_BOTTOM,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';
import { MainTab } from '@/shared/types/navigation';

import './styles/bottom-nav.css';

/**
 * BottomNav - Mobile Navigation
 *
 * Accessible bottom navigation with touch-friendly targets.
 * Touch targets: 44x44px minimum (WCAG compliant)
 */
export function BottomNav({
  tab,
  onTab,
}: {
  tab: MainTab;
  onTab: (next: MainTab) => void;
}) {
  const notificationsQuery = useNotificationsQuery(
    { filter: 'all' },
    {
      pollingInterval: 20_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const [seenCursor, setSeenCursor] = useState<string | null>(null);

  const latestCreatedAt =
    notificationsQuery.data?.items?.[0]?.createdAt ?? null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('notifications_seen_cursor');
    if (stored) {
      setSeenCursor(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (tab !== 'notifications') return;
    if (!latestCreatedAt) return;
    setSeenCursor(latestCreatedAt);
    window.localStorage.setItem('notifications_seen_cursor', latestCreatedAt);
  }, [tab, latestCreatedAt]);

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

  const items: Array<{ id: MainTab; label: string; Icon: typeof Home }> = [
    { id: 'home', label: 'Главная', Icon: Home },
    { id: 'create', label: 'Создать', Icon: Plus },
    { id: 'notifications', label: 'Уведомления', Icon: Bell },
    { id: 'points', label: 'Очки', Icon: Star },
    { id: 'account', label: 'Аккаунт', Icon: User },
  ];

  return (
    <nav
      className="bottom-nav"
      style={{ paddingBottom: `calc(${SAFE_AREA_BOTTOM} + 8px)` }}
      role="navigation"
      aria-label="Основная навигация"
    >
      <div className="bottom-nav__inner">
        <div className="bottom-nav__grid">
          {items.map((item) => {
            const active = tab === item.id;
            const Icon = item.Icon;

            return (
              <button
                key={item.id}
                onClick={() => onTab(item.id)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'bottom-nav__item',
                  active ? 'bottom-nav__item--active' : 'bottom-nav__item--inactive',
                )}
              >
                <Icon
                  className={cn('bottom-nav__icon', active && 'bottom-nav__icon--active')}
                  aria-hidden="true"
                />
                {item.id === 'notifications' && hasNewNotifications ? (
                  <span
                    className="bottom-nav__dot"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
