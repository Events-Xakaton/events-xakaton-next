'use client';

import { ChevronRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AppHeader } from '@/widgets/app-header';

import { useClubsQuery } from '@/entities/club/api';
import { ClubFeedCard } from '@/entities/club/ui/club-feed-card';
import { useEventsQuery } from '@/entities/event/api';
import { EventFeedCard } from '@/entities/event/ui/event-feed-card';

import { Button, ButtonVariant } from '@/shared/components/button';
import { ErrorState } from '@/shared/components/error-state';
import { useViewportMode } from '@/shared/lib/telegram/useViewportMode';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_FLOAT_SHADOW_CLASS,
  APP_PANEL_SHADOW_CLASS,
  getHomeFeedLayout,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';
import { trackLuckyReveal } from '@/shared/observability/telemetry';
import type { HomeTab } from '@/shared/types/navigation';

import { DAY_FILTERS, useEventFilter } from './model/use-event-filter';
import { useFeedActions } from './model/use-feed-actions';
import { useLuckyTrigger } from './model/use-lucky-trigger';

const FEED_CARD_HORIZONTAL_PADDING_PX = 8;
const CARD_CONTENT_HORIZONTAL_PADDING_PX = 20;
const CARD_CONTENT_VERTICAL_PADDING_TOP_PX = 24;

export function HomeScreen({
  onOpenEvent,
  onOpenClub,
  onNavigateToCreate,
  onOpenLuckyWheel,
}: {
  onOpenEvent: (eventId: string) => void;
  onOpenClub: (clubId: string) => void;
  onNavigateToCreate: () => void;
  onOpenLuckyWheel: () => void;
}) {
  const mode = useViewportMode();
  const [homeTab, setHomeTab] = useState<HomeTab>('events');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const {
    isTriggered: isLuckyTriggered,
    setScrollContainer,
    scrollContainerRef: feedScrollRef,
    reset: resetLucky,
  } = useLuckyTrigger();

  const events = useEventsQuery();
  const clubs = useClubsQuery();

  const filter = useEventFilter(events.data);
  const feedActions = useFeedActions(() => void clubs.refetch());

  const feedLayout = useMemo(() => getHomeFeedLayout(mode), [mode]);

  const FEED_CARD_STYLE = {
    height: feedLayout.cardHeight,
    flexShrink: 0,
  } as const;

  const FEED_SCROLL_CONTAINER_STYLE = {
    height: feedLayout.feedScrollHeight,
    marginTop: feedLayout.feedTopOffset,
    paddingBottom: feedLayout.feedBottomPadding,
    scrollPaddingTop: feedLayout.scrollPaddingTop,
    scrollPaddingBottom: feedLayout.scrollPaddingBottom,
    display: 'flex',
    flexDirection: 'column',
    gap: `${feedLayout.cardGapPx}px`,
  } as const;

  const FEED_STATE_CONTAINER_STYLE = {
    height: feedLayout.feedScrollHeight,
    marginTop: feedLayout.feedTopOffset,
    paddingBottom: feedLayout.feedBottomPadding,
  } as const;

  const FEED_MIN_HEIGHT_STYLE = {
    minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
  } as const;

  const clubsItems = clubs.data ?? [];
  const loading = homeTab === 'events' ? events.isLoading : clubs.isLoading;
  const error = homeTab === 'events' ? events.isError : clubs.isError;

  // Закрытие фильтра по клику вне
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', onClickOutside);
    }
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [filterOpen]);

  // Сброс скролла при смене таба или фильтра
  useEffect(() => {
    feedScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [homeTab, filter.dayFilter, filter.sortByDate]);

  // Сброс триггера при уходе со вкладки Events
  useEffect(() => {
    if (homeTab !== 'events') resetLucky();
  }, [homeTab, resetLucky]);

  // Телеметрия раскрытия секрета
  useEffect(() => {
    if (isLuckyTriggered) trackLuckyReveal();
  }, [isLuckyTriggered]);

  return (
    <div className="relative bg-[#f2f2f5]" style={FEED_MIN_HEIGHT_STYLE}>
      <AppHeader
        mode="fixed"
        topClassName="z-fixed"
        useSafeArea={false}
        showTopGap={false}
        rootStyle={{ paddingTop: feedLayout.headerTopPadding }}
        headerClassName="h-auto px-3 pb-2"
        center={
          <div className="inline-flex min-h-[44px] items-center rounded-full border border-neutral-300 bg-white p-1! shadow-sm">
            <button
              type="button"
              onClick={() => {
                setHomeTab('events');
              }}
              className={cn(
                'min-h-[34px] rounded-full px-3! text-xs font-semibold transition-colors',
                homeTab === 'events'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-neutral-700 hover:bg-neutral-100',
              )}
              aria-pressed={homeTab === 'events'}
            >
              Ивенты
            </button>
            <button
              type="button"
              onClick={() => {
                setHomeTab('clubs');
                setFilterOpen(false);
              }}
              className={cn(
                'min-h-[34px] rounded-full px-3! text-xs font-semibold transition-colors',
                homeTab === 'clubs'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-neutral-700 hover:bg-neutral-100',
              )}
              aria-pressed={homeTab === 'clubs'}
            >
              Клубы
            </button>
          </div>
        }
      />

      {/* Фильтр по дате (только для ивентов) */}
      {homeTab === 'events' ? (
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
              className={cn(
                'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-neutral-300 bg-white/95 backdrop-blur-sm px-3! text-xs font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-0',
                APP_FLOAT_SHADOW_CLASS,
              )}
              aria-label="Фильтр по дате"
              aria-expanded={filterOpen}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {filter.selectedDayFilterShort}
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 rotate-90 transition-transform',
                  filterOpen && '-rotate-90',
                )}
                aria-hidden="true"
              />
            </button>

            {filterOpen ? (
              <div
                className={cn(
                  'absolute right-0 top-[calc(100%+8px)] z-dropdown w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white',
                  APP_PANEL_SHADOW_CLASS,
                )}
              >
                {DAY_FILTERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={cn(
                      'block w-full px-3! py-2! text-left text-xs font-medium transition-colors',
                      filter.dayFilter === option.id
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50',
                    )}
                    onClick={() => {
                      filter.setDayFilter(option.id);
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

      <div
        className="relative overflow-hidden bg-[#f2f2f5]"
        style={FEED_MIN_HEIGHT_STYLE}
      >
        {/* Лента с карточками */}
        {!loading &&
        !error &&
        (homeTab === 'events'
          ? filter.eventItems.length > 0
          : clubsItems.length > 0) ? (
          <div
            ref={setScrollContainer}
            data-home-feed-scroll="true"
            className="snap-y snap-mandatory overflow-y-auto overscroll-contain px-2"
            style={FEED_SCROLL_CONTAINER_STYLE}
          >
            {homeTab === 'events'
              ? filter.eventItems.map((event) => (
                  <EventFeedCard
                    key={event.id}
                    event={event}
                    joined={
                      feedActions.joinedEventIds[event.id] ?? event.joinedByMe
                    }
                    joinLoading={feedActions.joinEventLoading}
                    onJoin={feedActions.handleJoinEvent}
                    onOpenEvent={onOpenEvent}
                    cardStyle={FEED_CARD_STYLE}
                  />
                ))
              : clubsItems.map((club) => (
                  <ClubFeedCard
                    key={club.id}
                    club={club}
                    onOpenClub={onOpenClub}
                    onJoin={feedActions.handleJoinClub}
                    joinLoading={feedActions.joinClubLoading}
                    joinedOverride={feedActions.joinedClubIds[club.id]}
                    onToggleSaved={feedActions.handleToggleSavedClub}
                    saved={feedActions.savedClubIds.includes(club.id)}
                    cardStyle={FEED_CARD_STYLE}
                  />
                ))}
          </div>
        ) : null}

        {/* Пустое состояние ивентов */}
        {homeTab === 'events' &&
        !loading &&
        !error &&
        filter.eventItems.length === 0 ? (
          <div
            ref={setScrollContainer}
            data-home-feed-scroll="true"
            className="px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <div
              className="grid place-items-center rounded-[30px] border border-neutral-200 bg-white p-6 text-center"
              style={FEED_CARD_STYLE}
            >
              <div className="max-w-[280px] space-y-3">
                <p className="text-lg font-semibold text-zinc-900">
                  По этому фильтру ивентов нет
                </p>
                <p className="text-sm text-zinc-600">
                  Попробуйте другой период или создайте новый ивент.
                </p>
                <Button
                  variant={ButtonVariant.SECONDARY}
                  className="mx-auto"
                  onClick={onNavigateToCreate}
                >
                  Создать ивент
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Пустое состояние клубов */}
        {homeTab === 'clubs' &&
        !loading &&
        !error &&
        clubsItems.length === 0 ? (
          <div
            ref={setScrollContainer}
            data-home-feed-scroll="true"
            className="px-2!"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <div
              className="grid place-items-center rounded-[30px] border border-neutral-200 bg-white p-6 text-center"
              style={FEED_CARD_STYLE}
            >
              <div className="max-w-[280px] space-y-3">
                <p className="text-lg font-semibold text-zinc-900">
                  Пока нет клубов
                </p>
                <p className="text-sm text-zinc-600">
                  Создайте первый клуб во вкладке «Создать».
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Загрузка */}
        {loading ? (
          <div
            ref={setScrollContainer}
            data-home-feed-scroll="true"
            className="flex items-center justify-center px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          </div>
        ) : null}

        {/* Ошибка */}
        {error ? (
          <div
            ref={setScrollContainer}
            data-home-feed-scroll="true"
            className="px-2"
            style={FEED_STATE_CONTAINER_STYLE}
          >
            <ErrorState
              title="Не удалось загрузить ленту"
              onRetry={() => {
                if (homeTab === 'events') {
                  void events.refetch();
                  return;
                }
                void clubs.refetch();
              }}
            />
          </div>
        ) : null}
      </div>

      {feedActions.hint ? (
        <p className="absolute bottom-24 left-4 text-sm text-zinc-900">
          {feedActions.hint}
        </p>
      ) : null}

      {/* Секретная кнопка «Мне повезёт» — появляется после быстрого скролла 9+ ивентов за 3 сек */}
      {isLuckyTriggered && homeTab === 'events' ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-gradient-to-br from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(124,58,237,0.45)] transition-all duration-200 active:scale-95"
            onClick={() => {
              resetLucky();
              onOpenLuckyWheel();
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Мне повезёт
          </button>
        </div>
      ) : null}
    </div>
  );
}
