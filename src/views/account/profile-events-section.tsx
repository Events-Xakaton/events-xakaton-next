"use client";

import { useMemo, useState } from "react";
import { Plus, Clock, ChevronRight, Users } from "lucide-react";
import {
  useEventsQuery,
  type EventCard,
} from "@/entities/event/api";
import { cn } from "@/shared/lib/utils";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { IconButton, Button, Badge, pluralize } from "@/shared/components";
import { buildGradient } from "@/shared/lib/gradient";
import { getEventGradient, APP_FEED_SCRIM_CLASS } from "@/shared/lib/ui-styles";
import { PillTabs } from "@/shared/components/pill-tabs";
import { formatLocalDateTime } from "@/shared/lib/time";

// ============================================================================
// Constants
// ============================================================================

const SECTION_TITLE_CLASS = "text-lg font-semibold text-neutral-900";

type EventCategory = "upcoming" | "organizing" | "past";

const EMPTY_MESSAGES: Record<EventCategory, { title: string; description: string }> = {
  upcoming: {
    title: "Нет предстоящих событий",
    description: "У вас нет запланированных событий",
  },
  organizing: {
    title: "Нет созданных событий",
    description: "Вы ещё не создали ни одного ивента",
  },
  past: {
    title: "Нет прошедших событий",
    description: "Вы не участвовали в прошедших событиях",
  },
};

// ============================================================================
// CreateEventCard Component
// ============================================================================

function CreateEventCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "snap-start snap-always w-[min(85vw,320px)] h-[240px] shrink-0",
        "rounded-2xl border-2 border-dashed border-neutral-300",
        "bg-transparent hover:bg-white/10",
        "flex flex-col items-center justify-center gap-3",
        "transition-all duration-200"
      )}
      aria-label="Создать новое событие"
    >
      <div className="rounded-full bg-primary-100 p-4">
        <Plus className="h-8 w-8 text-primary-600" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">Создать ивент</p>
      <p className="text-sm text-neutral-600">Запланируй новое событие</p>
    </button>
  );
}

// ============================================================================
// PastEventsPlaceholderCard Component
// ============================================================================

function PastEventsPlaceholderCard() {
  return (
    <div
      className={cn(
        "snap-start snap-always w-[min(85vw,320px)] h-[240px] shrink-0",
        "rounded-2xl border-2 border-dashed border-neutral-300",
        "bg-transparent",
        "flex flex-col items-center justify-center gap-3"
      )}
      aria-label="Нет прошедших событий"
    >
      <div className="rounded-full bg-neutral-100 p-4">
        <Clock className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">Нет прошедших событий</p>
      <p className="text-sm text-neutral-600">Здесь будут ивенты, которые вы посетили</p>
    </div>
  );
}

// ============================================================================
// ProfileEventCard Component
// ============================================================================

function ProfileEventCard({
  event,
  onOpenEvent,
}: {
  event: EventCard;
  onOpenEvent: (eventId: string) => void;
}) {
  const cardBackgroundStyle = useMemo(() => {
    if (event.coverSeed) {
      return { background: buildGradient(event.coverSeed, "event") };
    }
    return { background: getEventGradient(event.id) };
  }, [event.coverSeed, event.id]);

  return (
    <article
      className="relative h-[240px] overflow-hidden rounded-[30px] border border-neutral-200"
      style={cardBackgroundStyle}
      role="article"
      aria-label={`Событие: ${event.title}`}
      data-feed-card="event"
    >
      {/* Scrim overlay для защиты текста */}
      <div className={cn("absolute inset-0", APP_FEED_SCRIM_CLASS)} />

      <div className="relative flex h-full flex-col p-5 pb-6">
        {/* Badge с датой - верхний левый угол */}
        <Badge
          variant="outline"
          size="sm"
          className="self-start bg-white/95 border-white/30 text-zinc-900 backdrop-blur-sm shadow-sm gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          {formatLocalDateTime(event.startsAtUtc)}
        </Badge>

        {/* Контент внизу */}
        <div className="mt-auto">
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
          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenEvent(event.id)}
            className="ml-auto rounded-full border-white/25 bg-white/90 p-3 text-zinc-900 shadow-md hover:bg-white"
            aria-label={`Посмотреть детали ивента ${event.title}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// ProfileEventsSection Component
// ============================================================================

export function ProfileEventsSection({
  onOpenEvent,
  onNavigateToCreate,
}: {
  onOpenEvent: (eventId: string) => void;
  onNavigateToCreate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<EventCategory>("upcoming");

  // Data fetching
  const eventsQuery = useEventsQuery();

  // Calculate counts for each tab
  const eventCounts = useMemo(() => {
    if (!eventsQuery.data) return { upcoming: 0, organizing: 0, past: 0 };

    const upcomingCount = eventsQuery.data.filter(
      (e) =>
        (e.joinedByMe || e.isOrganizer) &&
        e.status === "upcoming" &&
        new Date(e.startsAtUtc) > new Date()
    ).length;

    const organizingCount = eventsQuery.data.filter((e) => e.isOrganizer).length;

    const pastCount = eventsQuery.data.filter(
      (e) =>
        e.joinedByMe &&
        new Date(e.startsAtUtc) < new Date()
    ).length;

    return { upcoming: upcomingCount, organizing: organizingCount, past: pastCount };
  }, [eventsQuery.data]);

  // Filter and sort logic
  const filteredEvents = useMemo(() => {
    if (!eventsQuery.data) return [];

    let filtered: EventCard[] = [];

    switch (activeTab) {
      case "upcoming":
        // События, куда записался пользователь ИЛИ организует
        filtered = eventsQuery.data.filter(
          (e) =>
            (e.joinedByMe || e.isOrganizer) &&
            e.status === "upcoming" &&
            new Date(e.startsAtUtc) > new Date()
        );
        // Сортировка: самые близкие по дате первыми
        return filtered.sort((a, b) =>
          new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime()
        );

      case "organizing":
        // События, созданные пользователем
        filtered = eventsQuery.data.filter((e) => e.isOrganizer);
        // Сортировка: самые близкие по дате первыми
        return filtered.sort((a, b) =>
          new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime()
        );

      case "past":
        // Прошедшие события, где пользователь был участником
        filtered = eventsQuery.data.filter(
          (e) =>
            e.joinedByMe &&
            new Date(e.startsAtUtc) < new Date()
        );
        // Сортировка: самые недавние первыми (обратный порядок)
        return filtered.sort((a, b) =>
          new Date(b.startsAtUtc).getTime() - new Date(a.startsAtUtc).getTime()
        );

      default:
        return eventsQuery.data;
    }
  }, [eventsQuery.data, activeTab]);

  return (
    <section className="space-y-2">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h3 className={SECTION_TITLE_CLASS}>Ивенты</h3>
        <IconButton
          icon={<Plus className="h-5 w-5" />}
          onClick={onNavigateToCreate}
          label="Создать событие"
        />
      </div>

      {/* Tabs */}
      <PillTabs<EventCategory>
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "upcoming", label: "Предстоящие", count: eventCounts.upcoming },
          { value: "organizing", label: "Организую", count: eventCounts.organizing },
          { value: "past", label: "Прошедшие", count: eventCounts.past },
        ]}
      />

      {/* Content */}
      {eventsQuery.isLoading ? (
        // Loading state
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="snap-start w-[min(85vw,320px)] h-[240px] shrink-0 rounded-2xl bg-neutral-200 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : eventsQuery.isError ? (
        // Error state
        <ErrorState
          title="Не удалось загрузить события"
          onRetry={() => eventsQuery.refetch()}
        />
      ) : filteredEvents.length === 0 ? (
        // Empty state
        activeTab === "past" ? (
          // Placeholder card для прошедших событий
          <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
            <div className="flex gap-3 px-4">
              <PastEventsPlaceholderCard />
            </div>
          </div>
        ) : (
          <EmptyState
            title={EMPTY_MESSAGES[activeTab].title}
            description={EMPTY_MESSAGES[activeTab].description}
            action={
              activeTab === "organizing" && (
                <button
                  onClick={onNavigateToCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Создать ивент
                </button>
              )
            }
          />
        )
      ) : (
        // Horizontal scroll with events
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4">
            {/* Event cards */}
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="snap-start snap-always w-[min(85vw,320px)] shrink-0"
              >
                <ProfileEventCard
                  event={event}
                  onOpenEvent={onOpenEvent}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
