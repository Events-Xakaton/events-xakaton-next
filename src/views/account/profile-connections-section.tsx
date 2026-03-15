'use client';

import type { ReactElement } from 'react';

import { useFollowingQuery } from '@/shared/api/connections-api';
import { ErrorState } from '@/shared/components/error-state';
import { RankBadge } from '@/shared/components/rank-badge';
import { RANK_EMOJIS } from '@/shared/constants/ranks';
import { APP_SECTION_CARD_CLASS } from '@/shared/lib/ui-styles';

import { ConnectionsPlaceholder } from './ui';

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

function formatFollowedAt(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;

  // Короткая дата «12 мар»
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function ProfileConnectionsSection(): ReactElement {
  const { data, isLoading, isError, refetch } = useFollowingQuery();

  return (
    <section className="space-y-2">
      <h3 className={SECTION_TITLE_CLASS}>Мои подписки</h3>

      {isLoading ? (
        <div className={SECTION_CARD}>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 animate-pulse rounded-full bg-neutral-200" />
                  <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-200" />
                </div>
                <div className="h-3 w-16 animate-pulse rounded-full bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className={SECTION_CARD}>
          <ErrorState
            title="Не удалось загрузить подписки"
            onRetry={() => void refetch()}
          />
        </div>
      ) : !data || data.length === 0 ? (
        <ConnectionsPlaceholder />
      ) : (
        <div className={SECTION_CARD}>
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.telegramUserId}
                className="flex items-center gap-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                  <span className="text-xl leading-none" aria-hidden>
                    {RANK_EMOJIS[item.rankInfo?.level ?? 1] ?? '🐣'}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {item.fullName}
                  </p>
                  {item.rankInfo ? (
                    <RankBadge rankInfo={item.rankInfo} />
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {formatFollowedAt(item.followedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
