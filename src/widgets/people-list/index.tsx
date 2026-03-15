'use client';

import { useMemo, useState } from 'react';

import type { PersonRow } from '@/entities/user';

import {
  useFollowMutation,
  useUnfollowMutation,
} from '@/shared/api/connections-api';
import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { EmptyState } from '@/shared/components/empty-state';
import { RankBadge } from '@/shared/components/rank-badge';
import { StarRating } from '@/shared/components/star-rating';
import { getTelegramProfileFallback } from '@/shared/lib/telegram';
import { useCurrentUserAvatar } from '@/shared/lib/use-current-user-avatar';
import { APP_SECTION_CARD_CLASS } from '@/shared/lib/ui-styles';
import { getInitials } from '@/shared/lib/utils';

import './styles/people-list.css';

const SECTION_CARD = APP_SECTION_CARD_CLASS;

export function PeopleList({
  title,
  rows,
  previewCount = 0,
}: {
  title: string;
  rows: PersonRow[];
  previewCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [follow] = useFollowMutation();
  const [unfollow] = useUnfollowMutation();
  const currentUser = getTelegramProfileFallback();
  const currentUserAvatarUrl = useCurrentUserAvatar();
  const visibleRows = useMemo(() => {
    if (!previewCount || expanded) return rows;
    return rows.slice(0, previewCount);
  }, [rows, previewCount, expanded]);

  return (
    <div className="people-list">
      <h3 className="people-list__title">{title}</h3>
      <div className={SECTION_CARD}>
        {rows.length === 0 ? (
          <EmptyState
            title="Пользователей пока нет"
            description="Список пока пуст."
          />
        ) : (
          <div className="space-y-3">
            {visibleRows.map((row) => {
              const rowTelegramUserId = String(row.telegramUserId);
              const isSelf = rowTelegramUserId === currentUser.telegramUserId;
              const avatarUrl =
                isSelf
                  ? (currentUserAvatarUrl ?? row.avatarUrl)
                  : row.avatarUrl;
              return (
                <div key={rowTelegramUserId} className="people-list__item">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={row.fullName}
                      className="people-list__avatar-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="people-list__avatar-fallback">
                      {getInitials(row.fullName) || 'U'}
                    </div>
                  )}
                  <div className="people-list__info">
                    <p className="people-list__name">{row.fullName}</p>
                    {row.rankInfo ? (
                      <RankBadge rankInfo={row.rankInfo} />
                    ) : null}
                    {row.attendanceConfirmed && row.rating !== null ? (
                      <StarRating value={row.rating} size="sm" />
                    ) : row.attendanceConfirmed ? (
                      <span className="text-xs text-green-600 font-medium">
                        ✓
                      </span>
                    ) : null}
                  </div>
                  {isSelf ? (
                    <span className="people-list__self-label">Вы</span>
                  ) : (
                    <Button
                      variant={
                        row.followedByMe
                          ? ButtonVariant.SECONDARY
                          : ButtonVariant.PRIMARY
                      }
                      size={ButtonSize.SM}
                      disabled={loadingUserId === rowTelegramUserId}
                      isLoading={loadingUserId === rowTelegramUserId}
                      onClick={() => {
                        setLoadingUserId(rowTelegramUserId);
                        const mutation = row.followedByMe
                          ? unfollow({ telegramUserId: rowTelegramUserId })
                          : follow({ telegramUserId: rowTelegramUserId });
                        void mutation.finally(() => setLoadingUserId(null));
                      }}
                      className="rounded-full"
                    >
                      {row.followedByMe ? 'Отписаться' : 'Подписаться'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {previewCount > 0 && rows.length > previewCount && !expanded && (
          <Button
            className="people-list__show-all"
            variant={ButtonVariant.SECONDARY}
            onClick={() => setExpanded(true)}
          >
            Показать всех ({rows.length})
          </Button>
        )}
      </div>
    </div>
  );
}
