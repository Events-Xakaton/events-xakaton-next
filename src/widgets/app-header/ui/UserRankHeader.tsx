'use client';

import { FC } from 'react';

import { RANK_EMOJIS } from '@/shared/constants/ranks';
import { getTelegramProfileFallback } from '@/shared/lib/telegram';
import { useCurrentUserAvatar } from '@/shared/lib/use-current-user-avatar';

import { useRankProgress } from '../model/use-rank-progress';
import { RankBadge } from './RankBadge';
import './styles/user-rank-header.css';

export const UserRankHeader: FC = () => {
  const profile = getTelegramProfileFallback();
  const avatarUrl = useCurrentUserAvatar();
  const { level } = useRankProgress();
  const emoji = RANK_EMOJIS[level] ?? '🐣';

  return (
    <div className="user-rank-header">
      <div className="user-rank-header__avatar" aria-hidden>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={profile.fullName}
            className="user-rank-header__avatar-img"
          />
        ) : (
          <span className="user-rank-header__avatar-emoji">{emoji}</span>
        )}
      </div>

      <div className="user-rank-header__info">
        <span className="user-rank-header__name">{profile.fullName}</span>
        <RankBadge />
      </div>
    </div>
  );
};
