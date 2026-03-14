'use client';

import { Bell, Home, Plus, Star, User } from 'lucide-react';
import { ReactElement } from 'react';

import { SAFE_AREA_BOTTOM } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';
import { MainTab } from '@/shared/types/navigation';

import './styles/bottom-nav.css';

export function BottomNav({
  tab,
  onTab,
  hasNewNotifications,
}: {
  tab: MainTab;
  onTab: (next: MainTab) => void;
  hasNewNotifications: boolean;
}): ReactElement {
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
                  active
                    ? 'bottom-nav__item--active'
                    : 'bottom-nav__item--inactive',
                )}
              >
                <Icon
                  className={cn(
                    'bottom-nav__icon',
                    active && 'bottom-nav__icon--active',
                  )}
                  aria-hidden="true"
                />
                {item.id === 'notifications' && hasNewNotifications ? (
                  <span className="bottom-nav__dot" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
