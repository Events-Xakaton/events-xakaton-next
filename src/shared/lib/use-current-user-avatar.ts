'use client';

import { useAppSelector } from '@/shared/store/hooks';

import { getTelegramProfileFallback } from './telegram';

/**
 * Возвращает актуальный аватар текущего пользователя.
 * Если применена ачивка — возвращает её iconUrl (синхронизируется через AchievementProvider).
 * Иначе — стандартный photo_url из Telegram.
 * Не создаёт RTK Query подписку — читает из Redux ui-slice.
 */
export function useCurrentUserAvatar(): string | null {
  const achievementAvatarUrl = useAppSelector(
    (state) => state.ui.currentUserAvatarUrl,
  );
  const profile = getTelegramProfileFallback();

  return achievementAvatarUrl ?? profile.avatarUrl;
}
