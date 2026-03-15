'use client';

import { Bell, Dices, Home, Plus, Star, User } from 'lucide-react';
import type { ReactElement } from 'react';

import { SAFE_AREA_BOTTOM } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';
import type { MainTab } from '@/shared/types/navigation';

import './styles/bottom-nav.css';

export function BottomNav({
  tab,
  onTab,
  hasNewNotifications,
  luckyWheelUnlocked = false,
  isNewLuckyWheel = false,
  isLuckyWheelOpen = false,
  onOpenLuckyWheel,
}: {
  tab: MainTab;
  onTab: (next: MainTab) => void;
  hasNewNotifications: boolean;
  luckyWheelUnlocked?: boolean;
  isNewLuckyWheel?: boolean;
  isLuckyWheelOpen?: boolean;
  onOpenLuckyWheel?: () => void;
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
        <div
          className={cn(
            'bottom-nav__grid',
            luckyWheelUnlocked && 'bottom-nav__grid--six',
          )}
        >
          {items.map((item) => {
            const active = !isLuckyWheelOpen && tab === item.id;
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

          {luckyWheelUnlocked ? (
            <button
              type="button"
              onClick={onOpenLuckyWheel}
              aria-label="Lucky Wheel"
              aria-current={isLuckyWheelOpen ? 'page' : undefined}
              className={cn(
                'bottom-nav__item',
                isLuckyWheelOpen
                  ? 'bottom-nav__item--active'
                  : cn(
                      'bottom-nav__item--lucky',
                      isNewLuckyWheel && 'bottom-nav__item--lucky-new',
                    ),
              )}
            >
              <Dices className="bottom-nav__icon" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
