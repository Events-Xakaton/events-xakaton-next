'use client';

import {
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
  ChevronRight,
  Lock,
  MapPin,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';

import { PeopleList } from '@/widgets/people-list';

import { useCanJoin } from '@/features/join-event';

import { useEventAuthoringClubsQuery } from '@/entities/club/api';
import {
  useEventDetailsQuery,
  useEventParticipantsQuery,
} from '@/entities/event/api';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { AboutSection, DetailRow } from '@/shared/components/detail-shared';
import { ErrorState } from '@/shared/components/error-state';
import { MinLevelBadge } from '@/shared/components/min-level-badge';
import { PreviewCard } from '@/shared/components/preview-card';
import { formatDateTimeDisplay } from '@/shared/lib/date-format';
import { openLocationLink, parseLocationLink } from '@/shared/lib/location-link';
import { getTelegramProfileFallback } from '@/shared/lib/telegram';
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

import { useEditSheet } from './model/use-edit-sheet';
import { useEventActions } from './model/use-event-actions';
import { useEventDraft } from './model/use-event-draft';
import { AttendanceAlreadyDone } from './ui/attendance-already-done';
import { AttendancePanel } from './ui/attendance-panel';
import { EventEditSheet } from './ui/event-edit-sheet';

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';
const HERO_ACTION_BUTTON_CLASS =
  'inline-flex h-7 items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-3 text-[11px] font-semibold tracking-[0.02em] text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-70';

export type EventDetailsProps = {
  id: string;
  onBack: () => void;
  onOpenClub?: (clubId: string) => void;
  fromLuckyWheel?: boolean;
};

export function EventDetails({
  id,
  onBack,
  onOpenClub,
  fromLuckyWheel = false,
}: EventDetailsProps) {
  const details = useEventDetailsQuery({ eventId: id });
  const participants = useEventParticipantsQuery({ eventId: id });
  const eventAuthoringClubs = useEventAuthoringClubsQuery();

  const event = details.data;
  const archived = event?.status === 'past' || event?.status === 'cancelled';

  const draft = useEventDraft(event);
  const editSheet = useEditSheet();
  const actions = useEventActions(id);

  const showCompactHeader = useCompactHeader(170);

  useTelegramBackButton({ onClick: onBack, visible: true });

  const ownerClubs = (eventAuthoringClubs.data ?? []).filter(
    (club) => club.role === 'owner',
  );

  // Хук должен вызываться до любых early return — используем безопасные дефолты пока event не загружен
  const currentUser = getTelegramProfileFallback();
  const isCreator =
    !!event && event.creatorTelegramUserId === currentUser.telegramUserId;
  const joined = actions.joinedOverride ?? event?.joinedByMe ?? false;
  const canJoinResult = useCanJoin(
    {
      minLevel: event?.minLevel ?? null,
      freeSpots: event?.freeSpots ?? null,
      status: event?.status ?? 'past',
      joinedByMe: joined,
    },
    { lucky: fromLuckyWheel },
  );

  if (details.isLoading) {
    return (
      <div className="px-4! pt-8!">
        <p className="text-sm text-neutral-500">Загрузка события...</p>
      </div>
    );
  }

  if (details.isError) {
    return (
      <ErrorState
        title="Не удалось загрузить событие"
        onRetry={() => void details.refetch()}
      />
    );
  }

  if (!event) {
    return (
      <div className="mx-4 mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-neutral-900">
          Событие недоступно
        </h3>
        <div className={SECTION_CARD}>
          <p className="text-sm text-neutral-700">
            Проверьте ссылку или откройте другое событие.
          </p>
        </div>
      </div>
    );
  }

  const canEdit = event.canManage && !archived;
  const showHeroJoinButton = !archived && !canJoinResult.blockReason;
  const locationLink = parseLocationLink(event.locationOrLink);

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
        {/* Пустой хедер-спейсер */}
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
              {event.title}
            </p>
            <span className="h-11 w-11 shrink-0" aria-hidden />
          </div>
        </div>

        {/* Hero */}
        <div className="px-4! mb-4!">
          <PreviewCard
            background={draft.coverBackground}
            title={event.title}
            subtitle={formatDateTimeDisplay(event.startsAtUtc)}
            onChangeBackground={() => {}}
            titleEditing={false}
            onTitleClick={undefined}
            showEditIndicator={false}
            showChangeBackgroundButton={false}
            extraActions={
              showHeroJoinButton || canEdit ? (
                <div className="inline-flex flex-col items-end gap-2">
                  {showHeroJoinButton ? (
                    joined ? (
                      <button
                        type="button"
                        disabled
                        className={HERO_ACTION_BUTTON_CLASS}
                        aria-label={`Вы участвуете в ивенте ${event.title}`}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Вы участвуете
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => actions.handleJoin(fromLuckyWheel)}
                        disabled={actions.joinState.isLoading}
                        className={HERO_ACTION_BUTTON_CLASS}
                        aria-label={`Участвовать в ивенте ${event.title}`}
                      >
                        <Plus className="h-5 w-5" aria-hidden="true" />
                        {actions.joinState.isLoading
                          ? 'Участвую...'
                          : 'Участвовать'}
                      </button>
                    )
                  ) : null}

                  {canEdit ? (
                    <button
                      type="button"
                      onClick={editSheet.open}
                      className={HERO_ACTION_BUTTON_CLASS}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Редактировать ивент
                    </button>
                  ) : null}
                </div>
              ) : null
            }
          />
        </div>

        <div className="space-y-4 px-4">
          {/* Организатор */}
          {!event.clubId && (
            <div className="space-y-2">
              <h3 className={SECTION_TITLE_CLASS}>Организатор</h3>
              <div className={SECTION_CARD}>
                <DetailRow
                  icon={<Users className="h-5 w-5" />}
                  label="Создатель"
                  value={event.creatorName}
                />
              </div>
            </div>
          )}

          {/* Клуб организатор */}
          {event.clubId && event.clubTitle ? (
            <div className="space-y-2">
              <h3 className={SECTION_TITLE_CLASS}>Организатор</h3>
              <div className={SECTION_CARD}>
                <DetailRow
                  icon={<Users className="h-5 w-5" />}
                  label="Клуб"
                  value={event.clubTitle}
                  rightElement={
                    onOpenClub ? (
                      <button
                        type="button"
                        onClick={() => onOpenClub(event.clubId ?? '')}
                        className="min-h-[44px] flex items-center"
                        aria-label={`Открыть клуб ${event.clubTitle}`}
                      >
                        <ChevronRight
                          className="h-5 w-5 text-neutral-400"
                          aria-hidden="true"
                        />
                      </button>
                    ) : null
                  }
                />
              </div>
            </div>
          ) : null}

          {/* Описание */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Описание</h3>
            <div className={SECTION_CARD}>
              <AboutSection text={event.description} maxLength={220} />
            </div>
          </div>

          {/* Детали */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Детали</h3>
            <div className={SECTION_CARD}>
              <DetailRow
                icon={<MapPin className="h-5 w-5" />}
                label="Локация"
                value={
                  locationLink.kind === 'google_maps_url' ? (
                    <span className="detail-row__location-link-content">
                      <img
                        src="/google-maps.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                        loading="lazy"
                      />
                      <span className="detail-row__location-link">
                        {locationLink.displayText}
                      </span>
                    </span>
                  ) : (
                    locationLink.displayText
                  )
                }
                valueClassName={cn(
                  'detail-row__location-value',
                  locationLink.isClickable &&
                    locationLink.kind !== 'google_maps_url' &&
                    'detail-row__location-link',
                )}
                onClick={
                  locationLink.isClickable
                    ? () => {
                        openLocationLink(locationLink);
                      }
                    : undefined
                }
              />
              <DetailRow
                icon={<CalendarArrowUp className="h-5 w-5" />}
                label="Начало"
                value={formatDateTimeDisplay(event.startsAtUtc)}
              />
              <DetailRow
                icon={<CalendarArrowDown className="h-5 w-5" />}
                label="Окончание"
                value={formatDateTimeDisplay(event.endsAtUtc)}
              />
              <DetailRow
                icon={<Users className="h-5 w-5" />}
                label="Участники"
                value={`${event.participantsCount}${event.maxParticipants ? ` / ${event.maxParticipants}` : ''}`}
              />
              {event.minLevel !== null && (
                <DetailRow
                  icon={<Lock className="h-5 w-5" />}
                  label="Мин. уровень"
                  value={
                    <MinLevelBadge
                      minLevel={event.minLevel}
                      userLevel={canJoinResult.userLevel}
                    />
                  }
                />
              )}

              <div className="pt-3">
                {archived ? (
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    size={ButtonSize.LG}
                    fullWidth
                    className="rounded-full"
                    disabled
                  >
                    {event.status === 'cancelled'
                      ? 'Событие отменено'
                      : 'Событие прошло'}
                  </Button>
                ) : isCreator ? (
                  // Создатель не может покинуть событие — показываем статус без кнопок
                  <div className="flex w-full items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-6 py-3">
                    <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-primary-700">
                      Вы организатор
                    </span>
                  </div>
                ) : joined ? (
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    size={ButtonSize.LG}
                    fullWidth
                    className="rounded-full"
                    isLoading={actions.unjoinState.isLoading}
                    onClick={actions.handleUnjoin}
                  >
                    Вы участвуете
                  </Button>
                ) : fromLuckyWheel ? (
                  <Button
                    variant={ButtonVariant.PRIMARY}
                    size={ButtonSize.LG}
                    fullWidth
                    className="rounded-full"
                    isLoading={actions.joinState.isLoading}
                    onClick={() => actions.handleJoin(true)}
                  >
                    Участвовать
                  </Button>
                ) : canJoinResult.blockReason ? (
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    size={ButtonSize.LG}
                    fullWidth
                    className="rounded-full"
                    disabled
                    title={canJoinResult.levelTooltip ?? undefined}
                  >
                    {canJoinResult.blockReason}
                  </Button>
                ) : (
                  <Button
                    variant={ButtonVariant.PRIMARY}
                    size={ButtonSize.LG}
                    fullWidth
                    className="rounded-full"
                    isLoading={actions.joinState.isLoading}
                    onClick={() => actions.handleJoin()}
                  >
                    Участвовать
                  </Button>
                )}
              </div>
            </div>
          </div>

          <PeopleList
            title={`Участники ${event.participantsCount}`}
            rows={participants.data ?? []}
            previewCount={5}
          />

          {/* Панель посещаемости — только организатор на прошедшем событии */}
          {event.canManage &&
            archived &&
            event.status === 'past' &&
            (participants.data &&
            participants.data.some((p) => p.attendanceConfirmed) ? (
              <AttendanceAlreadyDone />
            ) : participants.data && participants.data.length > 0 ? (
              <AttendancePanel
                eventId={id}
                participants={participants.data}
                onDone={() => void participants.refetch()}
              />
            ) : null)}

          {actions.hint && (
            <div
              className={cn(
                'p-4 rounded-2xl',
                actions.hint.includes('сохранены') ||
                  actions.hint.includes('отменено')
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-red-100 border border-red-200',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  actions.hint.includes('сохранены') ||
                    actions.hint.includes('отменено')
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
              >
                {actions.hint}
              </p>
            </div>
          )}
        </div>

      </div>

      {editSheet.isMounted ? (
        <EventEditSheet
          isActive={editSheet.isActive}
          fields={draft.fields}
          showTitleEditor={draft.showTitleEditor}
          setTitle={draft.setTitle}
          setDescription={draft.setDescription}
          setLocation={draft.setLocation}
          setStartsAt={draft.setStartsAt}
          setEndsAt={draft.setEndsAt}
          setMaxParticipants={draft.setMaxParticipants}
          setMinLevel={draft.setMinLevel}
          setCoverUrl={draft.setCoverUrl}
          setCoverSeed={draft.setCoverSeed}
          setSelectedClubId={draft.setSelectedClubId}
          onShowTitleEditor={() => draft.setShowTitleEditor(true)}
          onHideTitleEditor={(v) => {
            draft.setTitle(v);
            draft.setShowTitleEditor(false);
          }}
          descriptionRef={draft.descriptionRef}
          ownerClubs={ownerClubs}
          clubsLoading={eventAuthoringClubs.isLoading}
          clubsError={eventAuthoringClubs.isError}
          timeError={draft.timeError}
          canSubmit={draft.canSubmit}
          isSaving={actions.updateState.isLoading}
          onSave={() =>
            void actions.handleUpdate({
              fields: draft.fields,
              originalData: draft.originalData,
              hasChanges: draft.hasChanges,
              hasRequiredFields: draft.hasRequiredFields,
              canManage: event.canManage,
              archived,
              onSuccess: () => {
                editSheet.close();
                void details.refetch();
              },
            })
          }
          onClose={() => {
            editSheet.close();
            draft.setShowTitleEditor(false);
          }}
          onCancelEvent={() => actions.setConfirmCancel(true)}
        />
      ) : null}

      <ConfirmDialog
        open={actions.confirmCancel}
        title="Отменить ивент?"
        description="Участники увидят событие как отмененное."
        cancelText="Назад"
        confirmText="Отменить"
        loading={actions.cancelState.isLoading}
        onCancel={() => actions.setConfirmCancel(false)}
        onConfirm={() =>
          void actions.handleCancelEvent(() => {
            editSheet.close();
            void details.refetch();
          })
        }
      />
    </>
  );
}
