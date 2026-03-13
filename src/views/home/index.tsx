"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useEventsQuery } from "@/entities/event/api";
import { useClubsQuery, useJoinClubMutation } from "@/entities/club/api";
import { useJoinEventMutation } from "@/entities/event/api";
import { EventFeedCard } from "@/entities/event/ui/event-feed-card";
import { ClubFeedCard } from "@/entities/club/ui/club-feed-card";
import { HomeTab } from "@/shared/types/navigation";
import { cn, appErrorText } from "@/shared/lib/utils";
import { ErrorState } from "@/shared/components/error-state";
import { Button } from "@/shared/components/button";
import { AppHeader } from "@/widgets/app-header";
import {
  getHomeFeedLayout,
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_FLOAT_SHADOW_CLASS,
  APP_PANEL_SHADOW_CLASS,
} from "@/shared/lib/ui-styles";
import { useViewportMode } from "@/shared/lib/telegram/useViewportMode";

const DAY_FILTERS = [
  { id: "any", label: "В любой день" },
  { id: "today", label: "Сегодня" },
  { id: "tomorrow", label: "Завтра" },
  { id: "week", label: "На этой неделе" },
  { id: "weekend", label: "В эти выходные" },
  { id: "next-week", label: "На следующей неделе" },
] as const;

const DAY_FILTER_SHORT: Record<(typeof DAY_FILTERS)[number]["id"], string> = {
  any: "Любой",
  today: "Сегодня",
  tomorrow: "Завтра",
  week: "Неделя",
  weekend: "Выходные",
  "next-week": "След. нед.",
};

const FEED_CARD_HORIZONTAL_PADDING_PX = 8;
const CARD_CONTENT_HORIZONTAL_PADDING_PX = 20;
const CARD_CONTENT_VERTICAL_PADDING_TOP_PX = 24;

export function HomeScreen({
  onOpenEvent,
  onOpenClub,
  onNavigateToCreate,
}: {
  onOpenEvent: (eventId: string) => void;
  onOpenClub: (clubId: string) => void;
  onNavigateToCreate: () => void;
}) {
  const mode = useViewportMode();
  const [homeTab, setHomeTab] = useState<HomeTab>("events");
  const [hint, setHint] = useState("");
  const [savedClubIds, setSavedClubIds] = useState<string[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<Record<string, boolean>>({});
  const [joinedEventIds, setJoinedEventIds] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [dayFilter, setDayFilter] = useState<(typeof DAY_FILTERS)[number]["id"]>("any");
  const [sortByDate, setSortByDate] = useState(true);
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const events = useEventsQuery();
  const clubs = useClubsQuery();
  const [joinEvent, joinEventState] = useJoinEventMutation();
  const [joinClub, joinClubState] = useJoinClubMutation();

  const feedLayout = useMemo(() => getHomeFeedLayout(mode), [mode]);
  const FEED_CARD_HEIGHT = feedLayout.cardHeight;
  const FEED_CARD_STYLE = {
    height: FEED_CARD_HEIGHT,
    flexShrink: 0,
  } as const;
  const FEED_SCROLL_CONTAINER_STYLE = {
    height: feedLayout.feedScrollHeight,
    marginTop: feedLayout.feedTopOffset,
    paddingBottom: feedLayout.feedBottomPadding,
    scrollPaddingTop: feedLayout.scrollPaddingTop,
    scrollPaddingBottom: feedLayout.scrollPaddingBottom,
    display: "flex",
    flexDirection: "column",
    gap: `${feedLayout.cardGapPx}px`,
  } as const;
  const FEED_STATE_CONTAINER_STYLE = {
    height: feedLayout.feedScrollHeight,
    marginTop: feedLayout.feedTopOffset,
    paddingBottom: feedLayout.feedBottomPadding,
  } as const;
  const FEED_MIN_HEIGHT_STYLE = { minHeight: ADAPTIVE_VIEWPORT_HEIGHT } as const;

  const clubsItems = clubs.data ?? [];

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const endOfTomorrow = new Date(endOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const startOfWeekend = new Date(startOfToday);
    const day = startOfWeekend.getDay();
    const deltaToSat = (6 - day + 7) % 7;
    startOfWeekend.setDate(startOfWeekend.getDate() + deltaToSat);
    const endOfWeekend = new Date(startOfWeekend);
    endOfWeekend.setDate(endOfWeekend.getDate() + 2);
    const nextWeekStart = new Date(endOfWeek);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    return (events.data ?? []).filter((event) => {
      const starts = new Date(event.startsAtUtc);
      if (Number.isNaN(starts.getTime())) return true;

      if (dayFilter === "today") return starts >= startOfToday && starts < endOfToday;
      if (dayFilter === "tomorrow") return starts >= endOfToday && starts < endOfTomorrow;
      if (dayFilter === "week") return starts >= startOfToday && starts < endOfWeek;
      if (dayFilter === "weekend") return starts >= startOfWeekend && starts < endOfWeekend;
      if (dayFilter === "next-week") return starts >= nextWeekStart && starts < nextWeekEnd;
      return true;
    });
  }, [events.data, dayFilter]);

  const eventItems = useMemo(
    () => (sortByDate ? filteredEvents : [...filteredEvents].reverse()),
    [filteredEvents, sortByDate],
  );

  const loading = homeTab === "events" ? events.isLoading : clubs.isLoading;
  const error = homeTab === "events" ? events.isError : clubs.isError;
  const selectedDayFilterShort = DAY_FILTER_SHORT[dayFilter] ?? "Любой";

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }

    if (filterOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [filterOpen]);

  useEffect(() => {
    const node = feedScrollRef.current;
    if (!node) return;
    node.scrollTo({ top: 0, behavior: "auto" });
  }, [homeTab, dayFilter, sortByDate]);

  return (
    <div
      className="relative bg-[#f2f2f5]"
      style={FEED_MIN_HEIGHT_STYLE}
    >
      {/* Fixed Header Bar */}
      <AppHeader
        mode="fixed"
        topClassName="z-fixed"
        useSafeArea={false}
        showTopGap={false}
        rootStyle={{ paddingTop: feedLayout.headerTopPadding }}
        headerClassName="h-auto px-3 pb-2"
        center={
          <div className="inline-flex min-h-[44px] items-center rounded-full border border-neutral-300 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setHomeTab("events");
                setHint("");
              }}
              className={cn(
                "min-h-[34px] rounded-full px-3 text-xs font-semibold transition-colors",
                homeTab === "events" ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg" : "text-neutral-700 hover:bg-neutral-100",
              )}
              aria-pressed={homeTab === "events"}
            >
              Ивенты
            </button>
            <button
              type="button"
              onClick={() => {
                setHomeTab("clubs");
                setFilterOpen(false);
                setHint("");
              }}
              className={cn(
                "min-h-[34px] rounded-full px-3 text-xs font-semibold transition-colors",
                homeTab === "clubs" ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg" : "text-neutral-700 hover:bg-neutral-100",
              )}
              aria-pressed={homeTab === "clubs"}
            >
              Клубы
            </button>
          </div>
        }
      />

      {/* Fixed date-filter overlay: positioned inside top-right corner of event card */}
      {homeTab === "events" ? (
        <div
          className="fixed z-fixed pointer-events-none"
          style={{
            top: `calc(${feedLayout.feedTopOffset} + ${CARD_CONTENT_VERTICAL_PADDING_TOP_PX}px)`,
            right: `${FEED_CARD_HORIZONTAL_PADDING_PX + CARD_CONTENT_HORIZONTAL_PADDING_PX}px`,
          }}
        >
          <div ref={filterRef} className="relative pointer-events-auto">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={cn("inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-neutral-300 bg-white/95 backdrop-blur-sm px-3 text-xs font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-0", APP_FLOAT_SHADOW_CLASS)}
              aria-label="Фильтр по дате"
              aria-expanded={filterOpen}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {selectedDayFilterShort}
              <ChevronRight className={cn("h-3.5 w-3.5 rotate-90 transition-transform", filterOpen && "-rotate-90")} aria-hidden="true" />
            </button>

            {filterOpen ? (
              <div className={cn("absolute right-0 top-[calc(100%+8px)] z-dropdown w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white", APP_PANEL_SHADOW_CLASS)}>
                {DAY_FILTERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={cn(
                      "block w-full px-3 py-2 text-left text-xs font-medium transition-colors",
                      dayFilter === option.id ? "bg-neutral-100 text-neutral-900" : "text-neutral-700 hover:bg-neutral-50",
                    )}
                    onClick={() => {
                      setDayFilter(option.id);
                      setFilterOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden bg-[#f2f2f5]" style={FEED_MIN_HEIGHT_STYLE}>

        {!loading && !error && (homeTab === "events" ? eventItems.length > 0 : clubsItems.length > 0) ? (
          <div
            ref={feedScrollRef}
            data-home-feed-scroll="true"
            className="snap-y snap-mandatory overflow-y-auto overscroll-contain px-2"
            style={FEED_SCROLL_CONTAINER_STYLE}
          >
            {homeTab === "events"
              ? eventItems.map((event) => (
                  <EventFeedCard
                    key={event.id}
                    event={event}
                    joined={joinedEventIds[event.id] ?? event.joinedByMe}
                    joinLoading={joinEventState.isLoading}
                    onJoin={(eventId) => {
                      void joinEvent({ eventId })
                        .unwrap()
                        .then(() => {
                          setJoinedEventIds((prev) => ({ ...prev, [eventId]: true }));
                        })
                        .catch((error) => setHint(appErrorText(error, "Не удалось присоединиться к ивенту")));
                    }}
                    onOpenEvent={onOpenEvent}
                    cardStyle={FEED_CARD_STYLE}
                  />
                ))
              : clubsItems.map((club) => (
                  <ClubFeedCard
                    key={club.id}
                    club={club}
                    onOpenClub={onOpenClub}
                    onJoin={(clubId) => {
                      void joinClub({ clubId })
                        .unwrap()
                        .then(() => {
                          setJoinedClubIds((prev) => ({ ...prev, [clubId]: true }));
                          void clubs.refetch();
                        })
                        .catch((error) => setHint(appErrorText(error, "Не удалось вступить в клуб")));
                    }}
                    joinLoading={joinClubState.isLoading}
                    joinedOverride={joinedClubIds[club.id]}
                    onToggleSaved={(clubId) => {
                      setSavedClubIds((prev) =>
                        prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
                      );
                    }}
                    saved={savedClubIds.includes(club.id)}
                    cardStyle={FEED_CARD_STYLE}
                  />
                ))}
          </div>
        ) : null}

        {homeTab === "events" && !loading && !error && eventItems.length === 0 ? (
          <div
            ref={feedScrollRef}
            data-home-feed-scroll="true"
            className="px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <div
              className="grid place-items-center rounded-[30px] border border-neutral-200 bg-white p-6 text-center"
              style={FEED_CARD_STYLE}
            >
              <div className="max-w-[280px] space-y-3">
                <p className="text-lg font-semibold text-zinc-900">По этому фильтру ивентов нет</p>
                <p className="text-sm text-zinc-600">
                  Попробуйте другой период или создайте новый ивент.
                </p>
                <Button
                  variant="secondary"
                  className="mx-auto"
                  onClick={onNavigateToCreate}
                >
                  Создать ивент
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        {homeTab === "clubs" && !loading && !error && clubsItems.length === 0 ? (
          <div
            ref={feedScrollRef}
            data-home-feed-scroll="true"
            className="px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <div
              className="grid place-items-center rounded-[30px] border border-neutral-200 bg-white p-6 text-center"
              style={FEED_CARD_STYLE}
            >
              <div className="max-w-[280px] space-y-3">
                <p className="text-lg font-semibold text-zinc-900">Пока нет клубов</p>
                <p className="text-sm text-zinc-600">Создайте первый клуб во вкладке «Создать».</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Loading state */}
        {loading ? (
          <div
            ref={feedScrollRef}
            data-home-feed-scroll="true"
            className="flex items-center justify-center px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          </div>
        ) : null}

        {/* Error state */}
        {error ? (
          <div
            ref={feedScrollRef}
            data-home-feed-scroll="true"
            className="px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <ErrorState
              title="Не удалось загрузить ленту"
              onRetry={() => {
                if (homeTab === "events") {
                  void events.refetch();
                  return;
                }
                void clubs.refetch();
              }}
            />
          </div>
        ) : null}
      </div>

      {hint ? <p className="absolute bottom-24 left-4 text-sm text-zinc-900">{hint}</p> : null}

    </div>
  );
}
