'use client';

import { CalendarDays, Plus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PeopleList } from '@/widgets/people-list';

import {
  type ClubEventBucket,
  type ClubEventListItem,
  useClubDetailsQuery,
  useClubEventsQuery,
  useClubMembersQuery,
  useDeleteClubMutation,
  useJoinClubMutation,
  useLeaveClubMutation,
} from '@/entities/club/api';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import {
  AboutSection,
  DetailRow,
  type MenuItemType,
  OverflowMenuButton,
  StickyActionsPanel,
} from '@/shared/components/detail-shared';
import { ErrorState } from '@/shared/components/error-state';
import { PreviewCard } from '@/shared/components/preview-card';
import { buildGradient } from '@/shared/lib/gradient';
import { useTelegramBackButton } from '@/shared/lib/telegram/useTelegramButtons';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_FLOAT_SHADOW_CLASS,
  APP_SECTION_CARD_CLASS,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { appErrorText, cn } from '@/shared/lib/utils';

function formatEventTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Constants
const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

export type ClubDetailsProps = {
  id: string;
  onBack: () => void;
  onOpenEvent?: (eventId: string) => void;
};

export function ClubDetails({ id, onBack, onOpenEvent }: ClubDetailsProps) {
  // API queries
  const details = useClubDetailsQuery({ clubId: id });
  const members = useClubMembersQuery({ clubId: id });

  // Events tabs state
  const [eventsBucket, setEventsBucket] = useState<ClubEventBucket>('upcoming');
  const [eventsPage, setEventsPage] = useState<Record<ClubEventBucket, number>>(
    {
      upcoming: 1,
      ongoing: 1,
      past: 1,
    },
  );

  const clubEvents = useClubEventsQuery({
    clubId: id,
    bucket: eventsBucket,
    page: eventsPage[eventsBucket],
    limit: 6,
  });

  // Mutations
  const [joinClub, joinState] = useJoinClubMutation();
  const [leaveClub, leaveState] = useLeaveClubMutation();
  const [deleteClub, deleteState] = useDeleteClubMutation();

  // Local state
  const [hint, setHint] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [joinedOverride, setJoinedOverride] = useState<boolean | null>(null);
  const [showCompactHeader, setShowCompactHeader] = useState(false);

  // Events cache для накопления при пагинации
  const [eventsCache, setEventsCache] = useState<
    Record<ClubEventBucket, ClubEventListItem[]>
  >({
    upcoming: [],
    ongoing: [],
    past: [],
  });

  // Gradient или coverUrl
  const coverSeed = details.data?.coverSeed || details.data?.id || 'fallback';
  const heroBackground = useMemo(() => {
    if (details.data?.coverUrl) {
      return `url('${details.data.coverUrl}') center / cover no-repeat`;
    }
    return buildGradient(coverSeed, 'club');
  }, [details.data?.coverUrl, coverSeed]);

  // Telegram BackButton
  useTelegramBackButton({
    onClick: onBack,
    visible: true,
  });

  // Compact header on scroll
  useEffect(() => {
    const onScroll = () => setShowCompactHeader(window.scrollY > 170);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Накапливаем события в cache при загрузке новых страниц
  useEffect(() => {
    const eventsData = clubEvents.data;
    if (!eventsData) return;
    setEventsCache((prev) => {
      const current = prev[eventsBucket];
      const nextItems =
        eventsPage[eventsBucket] === 1
          ? eventsData.items // первая страница - заменяем
          : [
              ...current,
              ...eventsData.items.filter(
                (item) => !current.some((existing) => existing.id === item.id),
              ),
            ]; // следующие - добавляем с дедупликацией
      return { ...prev, [eventsBucket]: nextItems };
    });
  }, [clubEvents.data, eventsBucket, eventsPage]);

  // Loading/Error states
  if (details.isLoading) {
    return (
      <div className="px-4 pt-8">
        <p className="text-sm text-neutral-500">Загрузка клуба...</p>
      </div>
    );
  }

  if (details.isError) {
    return (
      <ErrorState
        title="Не удалось загрузить клуб"
        onRetry={() => void details.refetch()}
      />
    );
  }

  if (!details.data) {
    return (
      <div
        className="relative bg-[#f2f2f5]"
        style={{
          minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
          paddingTop: SAFE_AREA_TOP,
          paddingBottom: getBottomPadding('details'),
        }}
      >
        <div className="mx-4 mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900">
            Клуб недоступен
          </h3>
          <div className={SECTION_CARD}>
            <p className="text-sm text-neutral-700">
              Проверьте ссылку или откройте другой клуб.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const club = details.data;
  const joined = joinedOverride ?? club.joinedByMe;
  const lead = members.data?.[0];

  // Handlers
  function handleJoin() {
    setJoinedOverride(true); // optimistic UI
    void joinClub({ clubId: id })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null); // rollback
        setHint(appErrorText(error, 'Не удалось вступить в клуб'));
      });
  }

  function handleLeave() {
    setJoinedOverride(false); // optimistic UI
    void leaveClub({ clubId: id })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null); // rollback
        setHint(appErrorText(error, 'Не удалось выйти из клуба'));
      });
  }

  async function handleDelete() {
    try {
      await deleteClub({ clubId: id }).unwrap();
      setConfirmDelete(false);
      onBack(); // Navigate back after successful delete
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось удалить клуб'));
    }
  }

  const menuItems: MenuItemType[] = club.canManage
    ? [
        {
          id: 'delete',
          label: 'Удалить клуб',
          danger: true,
          onClick: () => setConfirmDelete(true),
        },
      ]
    : [];

  return (
    <>
      <div
        className="relative bg-[#f2f2f5]"
        style={{
          minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
          paddingTop: SAFE_AREA_TOP,
          paddingBottom: getBottomPadding('details'),
        }}
      >
        {/* OverflowMenu fixed (if canManage) */}
        <OverflowMenuButton
          items={menuItems}
          isOpen={menuOpen}
          onToggle={() => setMenuOpen((v) => !v)}
        />

        {/* Top Header (parity with create-screen) */}
        <div className="sticky top-0 z-[20] mb-4 mt-4 h-14 border-b border-neutral-200/50 bg-[#f2f2f5] px-4">
          <div className="flex h-full items-center justify-between">
            <div className="w-6" />
            <div className="w-6" />
            <div className="w-6" />
          </div>
        </div>

        {/* Compact Header (sticky on scroll) */}
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 z-[30] transition-opacity duration-200',
            showCompactHeader ? 'opacity-100' : 'opacity-0',
          )}
          style={{ top: 0 }}
        >
          <div
            className={cn(
              'mx-auto relative flex w-full max-w-md items-center justify-between border-b border-neutral-200/50 bg-white/95 px-3 py-2 backdrop-blur',
              APP_FLOAT_SHADOW_CLASS,
            )}
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
              paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 12px)',
              paddingRight: 'calc(env(safe-area-inset-right, 0px) + 12px)',
            }}
          >
            <span className="h-11 w-11 shrink-0" aria-hidden />
            <p className="pointer-events-none absolute left-1/2 w-[min(62vw,230px)] -translate-x-1/2 -translate-y-[10px] truncate text-center text-[15px] font-medium tracking-tight text-neutral-900">
              {club.title}
            </p>
            <span className="h-11 w-11 shrink-0" aria-hidden />
          </div>
        </div>

        {/* PreviewCard Hero */}
        <div className="px-4 mb-4">
          <PreviewCard
            background={heroBackground}
            title={club.title}
            subtitle={club.creatorName}
            onChangeBackground={() => {}}
            titleEditing={false}
            onTitleClick={undefined}
            showEditIndicator={false}
            showChangeBackgroundButton={false}
          />
        </div>

        {/* Sections container */}
        <div className="space-y-4 px-4">
          {/* Creator Card */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Создатель</h3>
            <div className={SECTION_CARD}>
              <DetailRow
                icon={<Users className="h-5 w-5" />}
                label="Создал"
                value={club.creatorName}
              />
            </div>
          </div>

          {/* Details Card */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Детали клуба</h3>
            <div className={SECTION_CARD}>
              <DetailRow
                icon={<Users className="h-5 w-5" />}
                label="Участники"
                value={`${club.membersCount} участников`}
                rightElement={
                  lead?.avatarUrl ? (
                    <img
                      src={lead.avatarUrl}
                      alt={lead.fullName}
                      className="h-8 w-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : null
                }
              />
            </div>
          </div>

          {/* Events Section */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Ивенты клуба</h3>
            <div className={SECTION_CARD}>
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: 'upcoming', label: 'Будущие' },
                    { value: 'ongoing', label: 'Текущие' },
                    { value: 'past', label: 'Прошедшие' },
                  ] as const
                ).map((tab) => (
                  <Button
                    key={tab.value}
                    variant={
                      eventsBucket === tab.value ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY
                    }
                    size={ButtonSize.SM}
                    onClick={() => {
                      setEventsBucket(tab.value);
                      // Reset to page 1 when switching tabs
                      if (eventsBucket !== tab.value) {
                        setEventsPage((prev) => ({ ...prev, [tab.value]: 1 }));
                      }
                    }}
                    className="rounded-xl text-xs"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Events list */}
              {clubEvents.isLoading && eventsPage[eventsBucket] === 1 ? (
                <p className="text-sm text-neutral-500 py-4">
                  Загрузка мероприятий...
                </p>
              ) : null}

              {clubEvents.isError ? (
                <ErrorState
                  title="Не удалось загрузить мероприятия клуба"
                  onRetry={() => void clubEvents.refetch()}
                />
              ) : null}

              {!clubEvents.isLoading &&
              !clubEvents.isError &&
              eventsCache[eventsBucket].length === 0 ? (
                <p className="text-sm text-neutral-500 py-4">
                  В этой секции пока нет мероприятий.
                </p>
              ) : null}

              {eventsCache[eventsBucket].length > 0 && (
                <div className="space-y-2 mt-3">
                  {eventsCache[eventsBucket].map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className="w-full rounded-2xl border border-neutral-200 bg-white p-3 text-left hover:bg-neutral-50 transition min-h-[64px]"
                      onClick={() => onOpenEvent?.(event.id)}
                    >
                      <p className="font-semibold text-neutral-900 text-[15px]">
                        {event.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatEventTime(event.startsAtUtc)}</span>
                        <span>•</span>
                        <span>{event.participantsCount} участников</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {clubEvents.data?.hasMore && (
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.MD}
                  fullWidth
                  onClick={() =>
                    setEventsPage((prev) => ({
                      ...prev,
                      [eventsBucket]: prev[eventsBucket] + 1,
                    }))
                  }
                  isLoading={
                    clubEvents.isLoading && eventsPage[eventsBucket] > 1
                  }
                  className="mt-3 rounded-full"
                >
                  Показать еще
                </Button>
              )}
            </div>
          </div>

          {/* About / Description */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Описание</h3>
            <div className={SECTION_CARD}>
              <AboutSection text={club.description} maxLength={220} />
            </div>
          </div>

          {/* Members List */}
          <PeopleList
            title={`Участники ${club.membersCount}`}
            rows={members.data ?? []}
            previewCount={5}
          />

          {/* Hint Card */}
          {hint && (
            <div
              className={cn(
                'p-4 rounded-2xl',
                hint.includes('обновлен') || hint.includes('сохранены')
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-red-100 border border-red-200',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  hint.includes('обновлен') || hint.includes('сохранены')
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
                role="status"
              >
                {hint}
              </p>
            </div>
          )}
        </div>

        {/* Sticky Actions */}
        <StickyActionsPanel
          leftActions={null}
          rightAction={
            joined ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.LG}
                className="rounded-full px-6"
                isLoading={leaveState.isLoading}
                onClick={handleLeave}
              >
                Вы в клубе
              </Button>
            ) : (
              <Button
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                className="rounded-full px-7"
                isLoading={joinState.isLoading}
                onClick={handleJoin}
              >
                <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                Вступить
              </Button>
            )
          }
        />
      </div>

      {/* ConfirmDialog для delete */}
      <ConfirmDialog
        open={confirmDelete}
        title="Удалить клуб?"
        description="Клуб будет скрыт для других участников."
        confirmText="Удалить"
        loading={deleteState.isLoading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
