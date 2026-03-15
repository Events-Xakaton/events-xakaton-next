'use client';

import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { AchievementDto } from '@/shared/api/achievements-api';
import {
  useGetUserAchievementsQuery,
  useSetActiveAchievementMutation,
} from '@/shared/api/achievements-api';
import { setCurrentUserAvatarUrl } from '@/shared/store/slices/ui-slice';
import { useAppDispatch } from '@/shared/store/hooks';

import {
  AchievementContext,
  type AchievementContextValue,
} from '../model/achievement-context';
import { AchievementUnlockedModal } from './AchievementUnlockedModal';

type Props = {
  children: ReactNode;
};

export const AchievementProvider: FC<Props> = ({ children }) => {
  const [pending, setPending] = useState<AchievementDto | null>(null);
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { data: achievements } = useGetUserAchievementsQuery();
  const [setActiveAchievement, { isLoading: isApplying }] =
    useSetActiveAchievementMutation();

  // Единственная точка синхронизации аватара: активная ачивка → Redux.
  // Все компоненты читают через useCurrentUserAvatar (useAppSelector), без RTK Query подписок.
  useEffect(() => {
    const activeIconUrl =
      achievements?.find((a) => a.isActive)?.iconUrl ?? null;
    dispatch(setCurrentUserAvatarUrl(activeIconUrl));
  }, [achievements, dispatch]);

  // Запускаем конфетти при открытии модалки
  useEffect(() => {
    if (!open) return;
    void import('@hiseb/confetti').then(({ default: confetti }) => {
      confetti({
        count: 120,
        velocity: 200,
        fade: false,
        position: {
          x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          y: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
        },
        size: 1,
      });
    });
  }, [open]);

  const triggerAchievement = useCallback(
    (achievements: AchievementDto[]): void => {
      if (achievements.length === 0) return;
      // Показываем только первое разблокированное достижение
      setPending(achievements[0]);
      setOpen(true);
    },
    [],
  );

  function handleClose(): void {
    setOpen(false);
    setPending(null);
  }

  async function handleApply(): Promise<void> {
    if (!pending) return;
    try {
      await setActiveAchievement({ achievementId: pending.id }).unwrap();
    } finally {
      handleClose();
    }
  }

  const contextValue: AchievementContextValue = { triggerAchievement };

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      {pending !== null ? (
        <AchievementUnlockedModal
          achievement={pending}
          open={open}
          onClose={handleClose}
          onApply={() => void handleApply()}
          isApplying={isApplying}
        />
      ) : null}
    </AchievementContext.Provider>
  );
};
