"use client";

import { useMemo, useState } from "react";
import { useFollowMutation, useUnfollowMutation } from "@/shared/api/connections-api";
import { getTelegramProfileFallback } from "@/shared/lib/telegram";
import { getInitials } from "@/shared/lib/utils";
import { APP_SECTION_CARD_CLASS } from "@/shared/lib/ui-styles";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/components/button";
import type { PersonRow } from "@/entities/user";

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SECTION_TITLE_CLASS = "text-lg font-semibold text-neutral-900";

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
  const [follow, followState] = useFollowMutation();
  const [unfollow, unfollowState] = useUnfollowMutation();
  const currentUser = getTelegramProfileFallback();
  const visibleRows = useMemo(() => {
    if (!previewCount || expanded) return rows;
    return rows.slice(0, previewCount);
  }, [rows, previewCount, expanded]);

  return (
    <div className="space-y-2">
      <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
      <div className={SECTION_CARD}>
        {rows.length === 0 ? (
          <EmptyState title="Пользователей пока нет" description="Список пока пуст." />
        ) : (
          <div className="space-y-3">
            {visibleRows.map((row) => {
              const isSelf = row.telegramUserId === currentUser.telegramUserId;
              const avatarUrl = row.avatarUrl ?? (isSelf ? currentUser.avatarUrl : null);
              return (
                <div key={row.telegramUserId} className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={row.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-10 w-10 min-h-[40px] min-w-[40px] place-items-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                      {getInitials(row.fullName) || "U"}
                    </div>
                  )}
                  <p className="flex-1 text-sm font-medium text-neutral-900">{row.fullName}</p>
                  {isSelf ? (
                    <span className="px-1 text-xs text-neutral-500">Вы</span>
                  ) : (
                    <Button
                      variant={row.followedByMe ? "secondary" : "primary"}
                      size="sm"
                      disabled={followState.isLoading || unfollowState.isLoading}
                      isLoading={followState.isLoading || unfollowState.isLoading}
                      onClick={() => {
                        if (row.followedByMe) {
                          void unfollow({ telegramUserId: row.telegramUserId });
                        } else {
                          void follow({ telegramUserId: row.telegramUserId });
                        }
                      }}
                      className="rounded-full"
                    >
                      {row.followedByMe ? "Отписаться" : "Подписаться"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {previewCount > 0 && rows.length > previewCount && !expanded && (
          <Button
            className="mt-2 w-full rounded-full"
            variant="secondary"
            onClick={() => setExpanded(true)}
          >
            Показать всех ({rows.length})
          </Button>
        )}
      </div>
    </div>
  );
}
