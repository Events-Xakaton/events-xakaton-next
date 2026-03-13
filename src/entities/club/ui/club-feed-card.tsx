"use client";

import { useMemo } from "react";
import { Bookmark, Check, ChevronRight, Plus } from "lucide-react";
import { cn, pluralize } from "@/shared/lib/utils";
import { buildGradient } from "@/shared/lib/gradient";
import { getClubGradient, APP_ELEVATED_CARD_CLASS, APP_FEED_SCRIM_CLASS } from "@/shared/lib/ui-styles";
import { getTelegramProfileFallback } from "@/shared/lib/telegram";
import { Button } from "@/shared/components/button";
import { Avatar } from "@/shared/components/avatar";
import { useClubDetailsQuery, useClubMembersQuery } from "../api";
import type { ClubCard } from "../types";

const FEED_CARD_CLASS = cn(
  "relative snap-start overflow-hidden rounded-[30px] border border-neutral-200",
  APP_ELEVATED_CARD_CLASS,
);

/**
 * AvatarGroup inline — используется только внутри карточки клуба.
 * Избегает циклического импорта с `@/shared/components`.
 */
function InlineAvatarGroup({
  avatars,
  max = 5,
}: {
  avatars: Array<{ src?: string | null; alt: string }>;
  max?: number;
}) {
  const display = avatars.slice(0, max);
  const remaining = avatars.length - max;
  return (
    <div className="flex items-center -space-x-2">
      {display.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          size="sm"
          className="ring-2 ring-neutral-900"
        />
      ))}
      {remaining > 0 && (
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 border-2 border-neutral-700 text-neutral-300 font-medium ring-2 ring-neutral-900 text-sm">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export function ClubFeedCard({
  club,
  onOpenClub,
  onJoin,
  joinLoading,
  joinedOverride,
  onToggleSaved,
  saved,
  cardStyle,
  hideJoinButton = false,
  noShadow = false,
}: {
  club: ClubCard;
  onOpenClub: (clubId: string) => void;
  onJoin: (clubId: string) => void;
  joinLoading: boolean;
  joinedOverride?: boolean;
  onToggleSaved: (clubId: string) => void;
  saved: boolean;
  cardStyle: React.CSSProperties;
  hideJoinButton?: boolean;
  noShadow?: boolean;
}) {
  const details = useClubDetailsQuery({ clubId: club.id });
  const membersQuery = useClubMembersQuery({ clubId: club.id });
  const currentUser = getTelegramProfileFallback();
  const currentTelegramId = currentUser.telegramUserId;

  const joined = typeof joinedOverride === "boolean" ? joinedOverride : club.joinedByMe;
  const membersCount = details.data?.membersCount ?? club.membersCount;

  const visibleMembers = useMemo(() => {
    const members = membersQuery.data ?? [];
    if (members.length === 0) {
      return joined
        ? [{ telegramUserId: currentTelegramId, fullName: "Вы", avatarUrl: currentUser.avatarUrl, followedByMe: false }]
        : [];
    }

    let prepared = members;
    if (joined && !members.some((m) => m.telegramUserId === currentTelegramId)) {
      prepared = [{ telegramUserId: currentTelegramId, fullName: "Вы", avatarUrl: currentUser.avatarUrl, followedByMe: false }, ...members];
    }
    return prepared
      .map((member) =>
        member.telegramUserId === currentTelegramId && !member.avatarUrl
          ? { ...member, avatarUrl: currentUser.avatarUrl }
          : member,
      )
      .slice(0, 5);
  }, [membersQuery.data, joined, currentTelegramId, currentUser.avatarUrl]);

  const cardBackgroundStyle = useMemo(() => {
    // Приоритет 1: coverUrl (изображение)
    if (details.data?.coverUrl) {
      return {
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(2,6,23,0.65) 100%), url('${details.data.coverUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    // Приоритет 2: coverSeed (градиент)
    if (club.coverSeed) {
      return { background: buildGradient(club.coverSeed, "club") };
    }

    // Приоритет 3: fallback для старых записей
    return { background: getClubGradient(club.id) };
  }, [details.data?.coverUrl, club.coverSeed, club.id]);

  const avatarList = visibleMembers.length > 0
    ? visibleMembers.map(m => ({
        src: m.avatarUrl,
        alt: m.fullName
      }))
    : [];

  const cardClassName = useMemo(() => {
    if (noShadow) {
      return "relative snap-start overflow-hidden rounded-[30px] border border-neutral-200";
    }
    return FEED_CARD_CLASS;
  }, [noShadow]);

  return (
    <article
      className={cardClassName}
      style={{ ...cardBackgroundStyle, ...cardStyle }}
      role="article"
      aria-label={`Клуб: ${club.title}`}
      data-feed-card="club"
    >
      {/* Scrim overlay - только для градиентов, не для изображений */}
      {!details.data?.coverUrl && (
        <div className={cn("absolute inset-0", APP_FEED_SCRIM_CLASS)} />
      )}

      <div className="relative flex h-full flex-col p-5 pb-7 pr-6">
        <div className="mt-auto">
          <div className="mb-3 flex items-center gap-2">
            {avatarList.length > 0 ? (
              <InlineAvatarGroup
                avatars={avatarList}
                max={5}
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-zinc-200 bg-white text-[10px] font-semibold text-zinc-900">
                ?
              </div>
            )}
            <span className="text-sm text-white/90 drop-shadow" aria-label={`${membersCount} участников`}>
              {membersCount} {pluralize(membersCount, "участник", "участника", "участников")}
            </span>
          </div>

          <h2 className="font-display text-4xl leading-[0.98] tracking-tight text-white drop-shadow-lg line-clamp-2">
            {club.title}
          </h2>
          <p className="mt-2 max-w-[85%] text-sm text-white/90 drop-shadow line-clamp-2">
            {club.description}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          {!hideJoinButton && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onToggleSaved(club.id)}
                aria-label={saved ? "Убрать из избранного" : "Добавить в избранное"}
                title={saved ? "Убрать из избранного" : "Добавить в избранное"}
                className={cn(
                  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
                  "active:scale-95",
                  saved ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md" : "bg-white/90 backdrop-blur-sm text-zinc-900 hover:bg-white shadow-md"
                )}
              >
                <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
              </button>

              {joined ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onJoin(club.id)}
                  isLoading={joinLoading}
                  disabled={joined}
                  className="rounded-full !border-emerald-300/30 !bg-emerald-500/75 px-6 !text-white hover:!bg-emerald-500/85 disabled:opacity-100"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Вы в клубе
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onJoin(club.id)}
                  isLoading={joinLoading}
                  className="rounded-full px-7"
                >
                  <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Вступить
                </Button>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenClub(club.id)}
            className="ml-auto rounded-full border-white/25 bg-white/90 px-5 py-2.5 text-[15px] font-semibold text-zinc-900 shadow-md hover:bg-white"
            aria-label={`Посмотреть детали клуба ${club.title}`}
          >
            Детали
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
