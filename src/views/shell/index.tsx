'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { AccountScreen } from '@/views/account';
import { ClubDetails } from '@/views/club-details';
import { CreateScreen } from '@/views/create';
import { EventDetails } from '@/views/event-details';
import { HomeScreen } from '@/views/home';
import { LuckyWheelScreen } from '@/views/lucky-wheel';
import { NotificationsScreen } from '@/views/notifications';
import { PointsScreen } from '@/views/points';

import { BottomNav } from '@/widgets/bottom-nav';

import { setInitialized } from '@/features/auth/model/auth-slice';
import { AuthScreen } from '@/features/auth/ui/auth-screen';
import { LoginStreakModalProvider } from '@/features/login-streak';
import { useLuckyWheelUnlock } from '@/features/lucky-wheel-unlock';
import { PointsBalanceProvider } from '@/features/points';
import { WheelSoundsProvider } from '@/features/wheel-sounds';

import { loadAuthSession } from '@/shared/lib/auth-session';
import { usePortraitGuard } from '@/shared/lib/telegram/usePortraitGuard';
import { useNotificationBadge } from '@/shared/lib/useNotificationBadge';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { MainTab } from '@/shared/types/navigation';

const LoadingFallback: FC = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
  </div>
);

export default function MiniAppShell() {
  const dispatch = useAppDispatch();
  const isVerified = useAppSelector((s) => s.auth.isVerified);
  const isInitializing = useAppSelector((s) => s.auth.isInitializing);
  const { isLandscapeBlocked } = usePortraitGuard();
  const [tab, setTab] = useState<MainTab>('home');
  const notificationBadge = useNotificationBadge();
  const [luckyWheelOpen, setLuckyWheelOpen] = useState(false);
  // Хук вызывается до ранних return'ов (React Rules of Hooks)
  const { isUnlocked, isNewUnlock, unlock } = useLuckyWheelUnlock();
  const [detail, setDetail] = useState<{
    kind: 'event' | 'club';
    id: string;
    fromLuckyWheel?: boolean;
  } | null>(null);

  useEffect(() => {
    loadAuthSession().then((session) => {
      dispatch(setInitialized(session ?? null));
    });
  }, [dispatch]);

  // Конфетти при первой разблокировке рулетки
  useEffect(() => {
    if (!isNewUnlock) return;
    const timer = setTimeout(() => {
      void import('@hiseb/confetti').then(({ default: confetti }) => {
        confetti({
          position: { x: window.innerWidth / 2, y: window.innerHeight - 60 },
          count: 60,
          velocity: 170,
          fade: true,
        });
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [isNewUnlock]);

  if (isLandscapeBlocked) {
    return (
      <main
        className="flex items-center justify-center bg-[#f2f2f5] px-6 text-center text-zinc-900"
        style={{ minHeight: 'var(--app-vh, 100dvh)' }}
      >
        <div className="max-w-xs rounded-3xl border border-neutral-200 bg-white px-6 py-7 shadow-sm">
          <h1 className="text-base font-semibold">Поверните устройство</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Чтобы продолжить, откройте мини-приложение в вертикальной
            ориентации.
          </p>
        </div>
      </main>
    );
  }

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (!isVerified) {
    return <AuthScreen />;
  }

  const homeNoDetail = !detail && !luckyWheelOpen && tab === 'home';
  const createNoDetail = !detail && !luckyWheelOpen && tab === 'create';
  const notificationsNoDetail =
    !detail && !luckyWheelOpen && tab === 'notifications';
  const pointsNoDetail = !detail && !luckyWheelOpen && tab === 'points';
  const accountNoDetail = !detail && !luckyWheelOpen && tab === 'account';
  const inDetail = Boolean(detail) || luckyWheelOpen;
  const shellBgClass = 'bg-[#f2f2f5]';

  return (
    <main
      className={`text-zinc-900 ${shellBgClass}`}
      style={{ minHeight: 'var(--app-vh, 100dvh)' }}
    >
      {/* Lucky Wheel рендерится вне max-w-md, чтобы фон не обрезался */}
      {luckyWheelOpen ? (
        <WheelSoundsProvider>
          <LuckyWheelScreen
            onBack={() => setLuckyWheelOpen(false)}
            onOpenEvent={(eventId) => {
              setLuckyWheelOpen(false);
              setDetail({ kind: 'event', id: eventId, fromLuckyWheel: true });
            }}
          />
        </WheelSoundsProvider>
      ) : null}

      {!luckyWheelOpen && (
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
              fromLuckyWheel={detail.fromLuckyWheel}
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

          {!detail && !luckyWheelOpen && tab === 'home' ? (
            <HomeScreen
              isUnlocked={isUnlocked}
              onUnlock={unlock}
              onOpenEvent={(eventId) =>
                setDetail({ kind: 'event', id: eventId })
              }
              onOpenClub={(clubId) => setDetail({ kind: 'club', id: clubId })}
              onNavigateToCreate={() => setTab('create')}
              onOpenLuckyWheel={() => setLuckyWheelOpen(true)}
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
              onNavigateToCreate={() => setTab('create')}
            />
          ) : null}
        </div>
      )}

      <PointsBalanceProvider />
      <LoginStreakModalProvider
        onOpenLuckyWheel={() => setLuckyWheelOpen(true)}
      />

      {/* BottomNav скрываем только при открытом detail */}
      {!detail ? (
        <BottomNav
          tab={tab}
          onTab={(next) => {
            if (next === 'notifications') notificationBadge.markSeen();
            setLuckyWheelOpen(false);
            setTab(next);
          }}
          hasNewNotifications={notificationBadge.hasNewNotifications}
          luckyWheelUnlocked={isUnlocked}
          isNewLuckyWheel={isNewUnlock}
          isLuckyWheelOpen={luckyWheelOpen}
          onOpenLuckyWheel={() => setLuckyWheelOpen(true)}
        />
      ) : null}
    </main>
  );
}
