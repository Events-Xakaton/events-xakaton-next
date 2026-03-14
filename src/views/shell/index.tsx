'use client';

import type { FC} from 'react';
import { Suspense, lazy, useEffect, useState } from 'react';

import { BottomNav } from '@/widgets/bottom-nav';

import { setVerified } from '@/features/auth/model/auth-slice';
import { AuthScreen } from '@/features/auth/ui/auth-screen';

import { loadAuthSession } from '@/shared/lib/auth-session';
import { useNotificationBadge } from '@/shared/lib/useNotificationBadge';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { MainTab } from '@/shared/types/navigation';

// Lazy load heavy components for better initial load performance
const HomeScreen = lazy(() =>
  import('@/views/home').then((m) => ({ default: m.HomeScreen })),
);
const CreateScreen = lazy(() =>
  import('@/views/create').then((m) => ({ default: m.CreateScreen })),
);
const NotificationsScreen = lazy(() =>
  import('@/views/notifications').then((m) => ({
    default: m.NotificationsScreen,
  })),
);
const PointsScreen = lazy(() =>
  import('@/views/points').then((m) => ({ default: m.PointsScreen })),
);
const AccountScreen = lazy(() =>
  import('@/views/account').then((m) => ({ default: m.AccountScreen })),
);
const EventDetails = lazy(() =>
  import('@/views/event-details').then((m) => ({ default: m.EventDetails })),
);
const ClubDetails = lazy(() =>
  import('@/views/club-details').then((m) => ({ default: m.ClubDetails })),
);

// Simple loading fallback for lazy-loaded components
const LoadingFallback: FC = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
  </div>
);

export default function MiniAppShell() {
  const dispatch = useAppDispatch();
  const isVerified = useAppSelector((s) => s.auth.isVerified);
  const [tab, setTab] = useState<MainTab>('home');
  const notificationBadge = useNotificationBadge();
  const [detail, setDetail] = useState<{
    kind: 'event' | 'club';
    id: string;
  } | null>(null);

  useEffect(() => {
    const session = loadAuthSession();
    if (session) {
      dispatch(
        setVerified({
          reddyUserKey: session.reddyUserKey,
          verifiedAtMs: session.verifiedAtMs,
        }),
      );
    }
  }, [dispatch]);

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
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
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
