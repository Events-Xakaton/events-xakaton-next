"use client";

import { useMemo } from "react";
import { Check, ChevronRight, Clock, Plus, Users } from "lucide-react";
import { cn, pluralize } from "@/shared/lib/utils";
import { buildGradient } from "@/shared/lib/gradient";
import { formatLocalDateTime } from "@/shared/lib/time";
import { getEventGradient, APP_ELEVATED_CARD_CLASS, APP_FEED_SCRIM_CLASS } from "@/shared/lib/ui-styles";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import type { EventCard } from "../types";

const FEED_CARD_CLASS = cn(
  "relative snap-start overflow-hidden rounded-[30px] border border-neutral-200",
  APP_ELEVATED_CARD_CLASS,
);

export function EventFeedCard({
  event,
  joined,
  joinLoading,
  onJoin,
  onOpenEvent,
  cardStyle,
  hideJoinButton = false,
  noShadow = false,
}: {
  event: EventCard;
  joined: boolean;
  joinLoading: boolean;
  onJoin: (eventId: string) => void;
  onOpenEvent: (eventId: string) => void;
  cardStyle: React.CSSProperties;
  hideJoinButton?: boolean;
  noShadow?: boolean;
}) {
  const cardBackgroundStyle = useMemo(() => {
    // Если есть coverSeed — используем его
    if (event.coverSeed) {
      return { background: buildGradient(event.coverSeed, "event") };
    }
    // Fallback для старых записей
    return { background: getEventGradient(event.id) };
  }, [event.coverSeed, event.id]);

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
      aria-label={`Событие: ${event.title}`}
      data-feed-card="event"
    >
      {/* Scrim overlay для защиты текста */}
      <div className={cn("absolute inset-0", APP_FEED_SCRIM_CLASS)} />

      <div className="relative flex h-full flex-col p-5 pb-6">
        <div className="mt-auto">
          <Badge
            variant="outline"
            size="sm"
            className="mb-3 bg-white/95 border-white/30 text-zinc-900 backdrop-blur-sm shadow-sm"
          >
            <Clock className="h-3.5 w-3.5" />
            {formatLocalDateTime(event.startsAtUtc)}
          </Badge>

          <h2 className="font-display text-4xl leading-[0.98] tracking-tight text-white drop-shadow-lg line-clamp-2">
            {event.title}
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-white/90 drop-shadow">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`${event.participantsCount} участников`}>
              {event.participantsCount} {pluralize(event.participantsCount, "участник", "участника", "участников")}
            </span>
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          {!hideJoinButton && (
            <>
              {joined ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onJoin(event.id)}
                  isLoading={joinLoading}
                  disabled={joined}
                  className="rounded-full !border-emerald-300/30 !bg-emerald-500/75 px-6 !text-white hover:!bg-emerald-500/85 disabled:opacity-100"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Вы участвуете
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onJoin(event.id)}
                  isLoading={joinLoading}
                  className="rounded-full px-7"
                >
                  <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Участвовать
                </Button>
              )}
            </>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenEvent(event.id)}
            className="ml-auto rounded-full border-white/25 bg-white/90 px-5 py-2.5 text-[15px] font-semibold text-zinc-900 shadow-md hover:bg-white"
            aria-label={`Посмотреть детали ивента ${event.title}`}
          >
            Детали
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
