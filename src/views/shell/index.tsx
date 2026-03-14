'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { BottomNav } from '@/widgets/bottom-nav';

import { setInitialized } from '@/features/auth/model/auth-slice';
import { AuthScreen } from '@/features/auth/ui/auth-screen';

import { AccountScreen } from '@/views/account';
import { ClubDetails } from '@/views/club-details';
import { CreateScreen } from '@/views/create';
import { EventDetails } from '@/views/event-details';
import { HomeScreen } from '@/views/home';
import { NotificationsScreen } from '@/views/notifications';
import { PointsScreen } from '@/views/points';

import { loadAuthSession } from '@/shared/lib/auth-session';
import { useNotificationBadge } from '@/shared/lib/useNotificationBadge';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { MainTab } from '@/shared/types/navigation';

// Simple loading fallback for lazy-loaded components
const LoadingFallback: FC = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
  </div>
);

export default function MiniAppShell() {
  const dispatch = useAppDispatch();
  const isVerified = useAppSelector((s) => s.auth.isVerified);
  const isInitializing = useAppSelector((s) => s.auth.isInitializing);
  const [tab, setTab] = useState<MainTab>('home');
  const notificationBadge = useNotificationBadge();
  const [detail, setDetail] = useState<{
    kind: 'event' | 'club';
    id: string;
  } | null>(null);

  useEffect(() => {
    loadAuthSession().then((session) => {
      dispatch(setInitialized(session ?? null));
    });
  }, [dispatch]);

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (!isVerified) {
    return <AuthScreen />;
  }

  const homeNoDetail = !detail && tab === 'home';
  const createNoDetail = !detail && tab === 'create';
  const notificationsNoDetail = !detail && tab === 'notifications';
  const pointsNoDetail = !detail && tab === 'points';
  const accountNoDetail = !detail && tab === 'account';
  const inDetail = Boolean(detail);
  const shellBgClass = 'bg-[#f2f2f5]';

  return (
    <main
      className={`text-zinc-900 ${shellBgClass}`}
      style={{ minHeight: 'var(--app-vh, 100dvh)' }}
    >
      <div
        className={
          homeNoDetail ||
          createNoDetail ||
          notificationsNoDetail ||
          accountNoDetail ||
          pointsNoDetail
            ? 'mx-auto w-full max-w-md'
            : inDetail
              ? 'mx-auto w-full max-w-md'
              : 'mx-auto w-full max-w-md px-4 pb-24'
        }
        style={
          !homeNoDetail &&
          !createNoDetail &&
          !notificationsNoDetail &&
          !pointsNoDetail &&
          !accountNoDetail &&
          !inDetail
            ? { paddingTop: `calc(env(safe-area-inset-top, 0px) + 1rem)` }
            : undefined
        }
      >
        {detail?.kind === 'event' ? (
            <EventDetails
              id={detail.id}
              onBack={() => setDetail(null)}
              onOpenClub={(clubId) => setDetail({ kind: 'club', id: clubId })}
            />
          ) : null}
          {detail?.kind === 'club' ? (
            <ClubDetails
              id={detail.id}
              onBack={() => setDetail(null)}
              onOpenEvent={(eventId) =>
                setDetail({ kind: 'event', id: eventId })
              }
            />
          ) : null}

          {!detail && tab === 'home' ? (
            <HomeScreen
              onOpenEvent={(eventId) =>
                setDetail({ kind: 'event', id: eventId })
              }
              onOpenClub={(clubId) => setDetail({ kind: 'club', id: clubId })}
              onNavigateToCreate={() => setTab('create')}
            />
          ) : null}
          {!detail && tab === 'create' ? <CreateScreen /> : null}
          {!detail && tab === 'notifications' ? <NotificationsScreen /> : null}
          {!detail && tab === 'points' ? <PointsScreen /> : null}
          {!detail && tab === 'account' ? (
            <AccountScreen
              onOpenEvent={(eventId) =>
                setDetail({ kind: 'event', id: eventId })
              }
              onOpenClub={(clubId) => setDetail({ kind: 'club', id: clubId })}
              onNavigateToCreate={(type) => setTab('create')}
            />
          ) : null}
      </div>
      {/* BottomNav показываем всегда на основных экранах, чтобы навигация была стабильной */}
      {!detail ? (
        <BottomNav
          tab={tab}
          onTab={(next) => {
            if (next === 'notifications') notificationBadge.markSeen();
            setTab(next);
          }}
          hasNewNotifications={notificationBadge.hasNewNotifications}
        />
      ) : null}
    </main>
  );
}
