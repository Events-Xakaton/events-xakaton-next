'use client';

import { CalendarDays, Plus, Users } from 'lucide-react';
import type { ReactElement} from 'react';
import { useMemo } from 'react';

import { PeopleList } from '@/widgets/people-list';

import { useClubDetailsQuery, useClubMembersQuery } from '@/entities/club/api';

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
import { useCompactHeader } from '@/shared/lib/useCompactHeader';
import { cn } from '@/shared/lib/utils';

import { useClubActions } from './model/use-club-actions';
import { useEventsCache } from './model/use-events-cache';

function formatEventTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

export type ClubDetailsProps = {
  id: string;
  onBack: () => void;
  onOpenEvent?: (eventId: string) => void;
};

export function ClubDetails({
  id,
  onBack,
  onOpenEvent,
}: ClubDetailsProps): ReactElement {
  const details = useClubDetailsQuery({ clubId: id });
  const members = useClubMembersQuery({ clubId: id });

  const clubActions = useClubActions();
  const eventsCache = useEventsCache(id);
  const showCompactHeader = useCompactHeader(170);

  useTelegramBackButton({ onClick: onBack, visible: true });

  const coverSeed = details.data?.coverSeed ?? details.data?.id ?? 'fallback';
  const heroBackground = useMemo(() => {
    if (details.data?.coverUrl) {
      return `url('${details.data.coverUrl}') center / cover no-repeat`;
    }
    return buildGradient(coverSeed, 'club');
  }, [details.data?.coverUrl, coverSeed]);

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
  const joined = clubActions.joinedOverride ?? club.joinedByMe;
  const lead = members.data?.[0];

  const menuItems: MenuItemType[] = club.canManage
    ? [
        {
          id: 'delete',
          label: 'Удалить клуб',
          danger: true,
          onClick: () => clubActions.setConfirmDelete(true),
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
        <OverflowMenuButton
          items={menuItems}
          isOpen={clubActions.menuOpen}
          onToggle={() => clubActions.setMenuOpen(!clubActions.menuOpen)}
        />

        <div className="sticky top-0 z-[20] mb-4 mt-4 h-14 border-b border-neutral-200/50 bg-[#f2f2f5] px-4">
          <div className="flex h-full items-center justify-between">
            <div className="w-6" />
            <div className="w-6" />
            <div className="w-6" />
          </div>
        </div>

        {/* Компактный хедер при скролле */}
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

        <div className="space-y-4 px-4">
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

          {/* Ивенты клуба */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Ивенты клуба</h3>
            <div className={SECTION_CARD}>
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
                      eventsCache.eventsBucket === tab.value
                        ? ButtonVariant.PRIMARY
                        : ButtonVariant.SECONDARY
                    }
                    size={ButtonSize.SM}
                    onClick={() => eventsCache.setEventsBucket(tab.value)}
                    className="rounded-xl text-xs"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {eventsCache.isFirstPageLoading ? (
                <p className="text-sm text-neutral-500 py-4">
                  Загрузка мероприятий...
                </p>
              ) : null}

              {eventsCache.isError ? (
                <ErrorState
                  title="Не удалось загрузить мероприятия клуба"
                  onRetry={eventsCache.refetchEvents}
                />
              ) : null}

              {!eventsCache.isLoading &&
              !eventsCache.isError &&
              eventsCache.eventsCache[eventsCache.eventsBucket].length === 0 ? (
                <p className="text-sm text-neutral-500 py-4">
                  В этой секции пока нет мероприятий.
                </p>
              ) : null}

              {eventsCache.eventsCache[eventsCache.eventsBucket].length > 0 && (
                <div className="space-y-2 mt-3">
                  {eventsCache.eventsCache[eventsCache.eventsBucket].map(
                    (event) => (
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
                    ),
                  )}
                </div>
              )}

              {eventsCache.hasMore && (
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.MD}
                  fullWidth
                  onClick={eventsCache.loadNextPage}
                  isLoading={
                    eventsCache.isLoading && !eventsCache.isFirstPageLoading
                  }
                  className="mt-3 rounded-full"
                >
                  Показать еще
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Описание</h3>
            <div className={SECTION_CARD}>
              <AboutSection text={club.description} maxLength={220} />
            </div>
          </div>

          <PeopleList
            title={`Участники ${club.membersCount}`}
            rows={members.data ?? []}
            previewCount={5}
          />

          {clubActions.hint && (
            <div
              className={cn(
                'p-4 rounded-2xl',
                clubActions.hint.includes('обновлен') ||
                  clubActions.hint.includes('сохранены')
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-red-100 border border-red-200',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  clubActions.hint.includes('обновлен') ||
                    clubActions.hint.includes('сохранены')
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
                role="status"
              >
                {clubActions.hint}
              </p>
            </div>
          )}
        </div>

        <StickyActionsPanel
          leftActions={null}
          rightAction={
            joined ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.LG}
                className="rounded-full px-6"
                isLoading={clubActions.leaveLoading}
                onClick={() => clubActions.handleLeave(id)}
              >
                Вы в клубе
              </Button>
            ) : (
              <Button
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                className="rounded-full px-7"
                isLoading={clubActions.joinLoading}
                onClick={() => clubActions.handleJoin(id)}
              >
                <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                Вступить
              </Button>
            )
          }
        />
      </div>

      <ConfirmDialog
        open={clubActions.confirmDelete}
        title="Удалить клуб?"
        description="Клуб будет скрыт для других участников."
        confirmText="Удалить"
        loading={clubActions.deleteLoading}
        onCancel={() => clubActions.setConfirmDelete(false)}
        onConfirm={() => void clubActions.handleDelete(id, onBack)}
      />
    </>
  );
}
