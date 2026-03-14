'use client';

import {
  Calendar,
  CalendarArrowDown,
  CalendarArrowUp,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { PeopleList } from '@/widgets/people-list';

import { useEventAuthoringClubsQuery } from '@/entities/club/api';
import {
  useCancelEventMutation,
  useEventDetailsQuery,
  useEventParticipantsQuery,
  useJoinEventMutation,
  useUnjoinEventMutation,
  useUpdateEventMutation,
} from '@/entities/event/api';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import {
  AboutSection,
  DetailRow,
  StickyActionsPanel,
} from '@/shared/components/detail-shared';
import { ErrorState } from '@/shared/components/error-state';
import { PreviewCard } from '@/shared/components/preview-card';
import { buildGradient, newSeed } from '@/shared/lib/gradient';
import { useTelegramBackButton } from '@/shared/lib/telegram/useTelegramButtons';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_FLOAT_SHADOW_CLASS,
  APP_PANEL_SHADOW_CLASS,
  APP_SECTION_CARD_CLASS,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { appErrorText, cn, toIsoFromLocal } from '@/shared/lib/utils';

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SHEET_SECTION_CARD =
  'bg-white border border-neutral-200 shadow-sm rounded-2xl p-4 space-y-4';
const DETAIL_LABEL_WIDTH = 'w-[58%] min-w-[176px] pr-2';
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';
const INPUT_BASE_CLASS =
  'w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-neutral-300 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0';
const SHEET_ANIMATION_MS = 220;
const SHEET_TOP_LIMIT = 'calc(env(safe-area-inset-top, 0px) + 74px)';

function toLocalDateTimeInputValue(isoUtc: string): string {
  if (!isoUtc) return '';
  const date = new Date(isoUtc);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDateTimeDisplay(value: string): string {
  if (!value) return 'Выберите дату';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function moveCaretToEnd(node: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

type DescriptionSectionProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

function DescriptionSection({
  value,
  onChange,
  placeholder,
  rows = 3,
  textareaRef,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className={SECTION_TITLE_CLASS}>Описание</h3>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 1000))}
        placeholder={placeholder}
        rows={rows}
        className={INPUT_BASE_CLASS}
        required
      />
    </div>
  );
}

export type EventDetailsProps = {
  id: string;
  onBack: () => void;
  onOpenClub?: (clubId: string) => void;
};

export function EventDetails({ id, onBack, onOpenClub }: EventDetailsProps) {
  // API queries
  const details = useEventDetailsQuery({ eventId: id });
  const participants = useEventParticipantsQuery({ eventId: id });
  const eventAuthoringClubs = useEventAuthoringClubsQuery();

  // Mutations
  const [updateEvent, updateState] = useUpdateEventMutation();
  const [joinEvent, joinState] = useJoinEventMutation();
  const [unjoinEvent, unjoinState] = useUnjoinEventMutation();
  const [cancelEvent, cancelState] = useCancelEventMutation();

  // Draft states
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [locationDraft, setLocationDraft] = useState('');
  const [startsAtDraft, setStartsAtDraft] = useState('');
  const [endsAtDraft, setEndsAtDraft] = useState('');
  const [maxParticipantsDraft, setMaxParticipantsDraft] = useState('');
  const [coverSeedDraft, setCoverSeedDraft] = useState('');
  const [selectedClubIdDraft, setSelectedClubIdDraft] = useState('');

  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const eventTitleEditorRef = useRef<HTMLDivElement>(null);
  const eventDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const [hint, setHint] = useState('');
  const [originalData, setOriginalData] = useState<{
    title: string;
    description: string;
    locationOrLink: string;
    startsAt: string;
    endsAt: string;
    maxParticipants: string;
    coverSeed: string;
    clubId: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [editSheetMounted, setEditSheetMounted] = useState(false);
  const [editSheetActive, setEditSheetActive] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [joinedOverride, setJoinedOverride] = useState<boolean | null>(null);
  const [showCompactHeader, setShowCompactHeader] = useState(false);

  const event = details.data;
  const archived = event?.status === 'past' || event?.status === 'cancelled';

  // Telegram BackButton
  useTelegramBackButton({
    onClick: onBack,
    visible: true,
  });

  // Sync draft states when event loads
  useEffect(() => {
    if (!event) return;

    const startsAt = toLocalDateTimeInputValue(event.startsAtUtc);
    const endsAt = toLocalDateTimeInputValue(event.endsAtUtc);
    const maxParticipants = event.maxParticipants
      ? String(event.maxParticipants)
      : '';
    const coverSeed = event.coverSeed || event.id;

    setTitleDraft(event.title);
    setDescriptionDraft(event.description);
    setLocationDraft(event.locationOrLink);
    setStartsAtDraft(startsAt);
    setEndsAtDraft(endsAt);
    setMaxParticipantsDraft(maxParticipants);
    setCoverSeedDraft(coverSeed);
    setSelectedClubIdDraft(event.clubId ?? '');

    setOriginalData({
      title: event.title,
      description: event.description,
      locationOrLink: event.locationOrLink,
      startsAt,
      endsAt,
      maxParticipants,
      coverSeed,
      clubId: event.clubId ?? '',
    });
  }, [event]);

  // Track changes
  useEffect(() => {
    if (!originalData || !event) return;

    const normalizeMaxParticipants = (val: string) =>
      val.replace(/^0+/, '') || '';

    const changed =
      titleDraft.trim() !== originalData.title.trim() ||
      descriptionDraft.trim() !== originalData.description.trim() ||
      locationDraft.trim() !== originalData.locationOrLink.trim() ||
      startsAtDraft !== originalData.startsAt ||
      endsAtDraft !== originalData.endsAt ||
      normalizeMaxParticipants(maxParticipantsDraft) !==
        normalizeMaxParticipants(originalData.maxParticipants) ||
      coverSeedDraft !== originalData.coverSeed ||
      selectedClubIdDraft !== originalData.clubId;

    setHasChanges(changed);
  }, [
    titleDraft,
    descriptionDraft,
    locationDraft,
    startsAtDraft,
    endsAtDraft,
    maxParticipantsDraft,
    coverSeedDraft,
    selectedClubIdDraft,
    originalData,
    event,
  ]);

  // Inline title editing focus
  useEffect(() => {
    if (!showTitleEditor || !eventTitleEditorRef.current) return;
    eventTitleEditorRef.current.textContent = titleDraft;
    eventTitleEditorRef.current.focus();
    moveCaretToEnd(eventTitleEditorRef.current);
  }, [showTitleEditor, titleDraft]);

  // Compact header on scroll
  useEffect(() => {
    const onScroll = () => setShowCompactHeader(window.scrollY > 170);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function openEditSheet() {
    setEditSheetMounted(true);
    requestAnimationFrame(() => {
      setEditSheetActive(true);
    });
  }

  function closeEditSheet() {
    setEditSheetActive(false);
    setShowTitleEditor(false);
    window.setTimeout(() => {
      setEditSheetMounted(false);
    }, SHEET_ANIMATION_MS);
  }

  // Prevent background page scroll while bottom sheet is open.
  useEffect(() => {
    if (!editSheetMounted || typeof document === 'undefined') return;

    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = documentElement.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [editSheetMounted]);

  const eventTimeError = useMemo(() => {
    if (!startsAtDraft || !endsAtDraft) return '';
    const startsAtUtc = toIsoFromLocal(startsAtDraft);
    const endsAtUtc = toIsoFromLocal(endsAtDraft);
    if (
      !startsAtUtc ||
      !endsAtUtc ||
      new Date(endsAtUtc) <= new Date(startsAtUtc)
    ) {
      return 'Время окончания должно быть позже времени начала.';
    }
    return '';
  }, [startsAtDraft, endsAtDraft]);

  const heroBackground = useMemo(
    () => buildGradient(coverSeedDraft, 'event'),
    [coverSeedDraft],
  );
  const hasRequiredFields =
    titleDraft.trim().length > 0 &&
    descriptionDraft.trim().length > 0 &&
    locationDraft.trim().length > 0 &&
    startsAtDraft.length > 0 &&
    endsAtDraft.length > 0;
  const canSubmit = hasChanges && hasRequiredFields && !eventTimeError;

  // Early returns AFTER all hooks
  if (details.isLoading) {
    return (
      <div className="px-4 pt-8">
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

  async function handleUpdate(e?: FormEvent) {
    e?.preventDefault();
    setHint('');

    if (!event || !hasChanges || !event.canManage || archived) return;

    if (!hasRequiredFields) {
      setHint(
        'Заполните обязательные поля: название, описание, локацию и время.',
      );
      return;
    }

    const startsAtUtc = toIsoFromLocal(startsAtDraft);
    const endsAtUtc = toIsoFromLocal(endsAtDraft);

    if (
      !startsAtUtc ||
      !endsAtUtc ||
      new Date(endsAtUtc) <= new Date(startsAtUtc)
    ) {
      setHint('Время окончания должно быть позже времени начала.');
      return;
    }

    try {
      const normalizeMaxParticipants = (val: string) =>
        val.replace(/^0+/, '') || '';

      await updateEvent({
        eventId: id,
        title: titleDraft.trim(),
        description: descriptionDraft.trim(),
        locationOrLink: locationDraft.trim(),
        startsAtUtc,
        endsAtUtc,
        maxParticipants: normalizeMaxParticipants(maxParticipantsDraft)
          ? Number(normalizeMaxParticipants(maxParticipantsDraft))
          : undefined,
        coverSeed: coverSeedDraft,
        ...(selectedClubIdDraft !== originalData?.clubId
          ? { clubId: selectedClubIdDraft || null }
          : {}),
      }).unwrap();

      setHint('Изменения сохранены');
      closeEditSheet();
      void details.refetch();
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось сохранить изменения'));
    }
  }

  const joined = joinedOverride ?? event.joinedByMe;

  function handleJoin() {
    setJoinedOverride(true); // optimistic UI
    void joinEvent({ eventId: id })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null); // rollback
        setHint(appErrorText(error, 'Не удалось записаться на событие'));
      });
  }

  function handleUnjoin() {
    setJoinedOverride(false); // optimistic UI
    void unjoinEvent({ eventId: id })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null); // rollback
        setHint(appErrorText(error, 'Не удалось отписаться от события'));
      });
  }

  async function handleCancelEvent() {
    try {
      await cancelEvent({ eventId: id }).unwrap();
      setConfirmCancel(false);
      closeEditSheet();
      setHint('Событие отменено');
      void details.refetch();
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось отменить событие'));
    }
  }

  const canEdit = event.canManage && !archived;
  const ownerClubs = (eventAuthoringClubs.data ?? []).filter(
    (club) => club.role === 'owner',
  );

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
              {event.title}
            </p>
            <span className="h-11 w-11 shrink-0" aria-hidden />
          </div>
        </div>

        {/* PreviewCard Hero */}
        <div className="px-4 mb-4">
          <PreviewCard
            background={heroBackground}
            title={event.title}
            subtitle={`${formatDateTimeDisplay(event.startsAtUtc)} • ${event.locationOrLink}`}
            onChangeBackground={() => {}}
            titleEditing={false}
            onTitleClick={undefined}
            showEditIndicator={false}
            showChangeBackgroundButton={false}
            extraActions={
              canEdit ? (
                <button
                  type="button"
                  onClick={openEditSheet}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-3 text-[11px] font-semibold tracking-[0.02em] text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Редактировать ивент
                </button>
              ) : null
            }
          />
        </div>

        {/* Sections container */}
        <div className="space-y-4 px-4">
          {/* Creator Section (if not from club) */}
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

          {/* Club Section (if from club) */}
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
                        onClick={() => onOpenClub(event.clubId!)}
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

          {/* About Section */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Описание</h3>
            <div className={SECTION_CARD}>
              <AboutSection text={event.description} maxLength={220} />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Детали</h3>
            <div className={SECTION_CARD}>
              <DetailRow
                icon={<MapPin className="h-5 w-5" />}
                label="Локация"
                value={event.locationOrLink}
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
            </div>
          </div>

          {/* Participants List */}
          <PeopleList
            title={`Участники ${event.participantsCount}`}
            rows={participants.data ?? []}
            previewCount={5}
          />

          {/* Hint message */}
          {hint && (
            <div
              className={cn(
                'p-4 rounded-2xl',
                hint.includes('сохранены') || hint.includes('отменено')
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-red-100 border border-red-200',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  hint.includes('сохранены') || hint.includes('отменено')
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
              >
                {hint}
              </p>
            </div>
          )}
        </div>

        {/* StickyActionsPanel */}
        <StickyActionsPanel
          leftActions={null}
          rightAction={
            archived ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.LG}
                className="rounded-full px-6"
                disabled
              >
                {event.status === 'cancelled'
                  ? 'Событие отменено'
                  : 'Событие прошло'}
              </Button>
            ) : joined ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.LG}
                className="rounded-full px-6"
                isLoading={unjoinState.isLoading}
                onClick={handleUnjoin}
              >
                Вы участвуете
              </Button>
            ) : event.freeSpots === 0 ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.LG}
                className="rounded-full px-6"
                disabled
              >
                Мест нет
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
                Записаться
              </Button>
            )
          }
        />
      </div>

      {editSheetMounted ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className={cn(
              'absolute inset-0 bg-black/45 transition-opacity duration-200 ease-out',
              editSheetActive ? 'opacity-100' : 'opacity-0',
            )}
            aria-label="Закрыть редактирование"
            onClick={closeEditSheet}
          />
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-md flex-col rounded-t-3xl bg-[#f2f2f5] p-4 transition-transform duration-200 ease-out',
              APP_PANEL_SHADOW_CLASS,
              editSheetActive ? 'translate-y-0' : 'translate-y-full',
            )}
            style={{
              transitionDuration: `${SHEET_ANIMATION_MS}ms`,
              maxHeight: `calc(100dvh - ${SHEET_TOP_LIMIT})`,
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.SM}
                onClick={closeEditSheet}
                className="rounded-full px-4"
              >
                Закрыть
              </Button>
              <p className="px-2 text-center text-sm font-semibold text-neutral-900">
                Редактировать
              </p>
              <Button
                type="button"
                size={ButtonSize.SM}
                onClick={() => void handleUpdate()}
                disabled={!canSubmit}
                isLoading={updateState.isLoading}
                className="rounded-full px-4"
              >
                Сохранить
              </Button>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto pb-6"
              style={
                {
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                } as React.CSSProperties
              }
            >
              <div className="space-y-4">
                <PreviewCard
                  background={buildGradient(coverSeedDraft, 'event')}
                  title={
                    showTitleEditor ? titleDraft : titleDraft || event.title
                  }
                  subtitle={`${formatDateTimeDisplay(startsAtDraft)} • ${locationDraft || event.locationOrLink}`}
                  onChangeBackground={() => setCoverSeedDraft(newSeed('event'))}
                  titleEditing={showTitleEditor}
                  onTitleClick={() => setShowTitleEditor(true)}
                  showEditIndicator
                  showChangeBackgroundButton
                  titleEditor={
                    <div className="relative">
                      <div
                        ref={eventTitleEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        className="w-full min-h-[1.2em] bg-transparent text-4xl font-bold leading-tight tracking-tight text-white outline-none"
                        dir="ltr"
                        style={{
                          outline: 'none',
                          boxShadow: 'none',
                          border: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          caretColor: '#fff',
                          direction: 'ltr',
                          textAlign: 'left',
                          unicodeBidi: 'plaintext',
                        }}
                        onInput={(e) => {
                          const value = e.currentTarget.textContent ?? '';
                          const next = value.slice(0, 60);
                          if (next !== value) {
                            e.currentTarget.textContent = next;
                            moveCaretToEnd(e.currentTarget);
                          }
                          setTitleDraft(next);
                        }}
                        onBlur={() => {
                          setTitleDraft((prev) => prev.trim());
                          setShowTitleEditor(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            setTitleDraft((prev) => prev.trim());
                            setShowTitleEditor(false);
                          }
                        }}
                      >
                        {null}
                      </div>
                    </div>
                  }
                  titleHint={
                    showTitleEditor && 60 - titleDraft.length <= 10 ? (
                      <p className="mt-2 text-xs text-white/70">
                        Осталось символов: {60 - titleDraft.length}
                      </p>
                    ) : null
                  }
                />

                <DescriptionSection
                  value={descriptionDraft}
                  onChange={setDescriptionDraft}
                  placeholder="Опишите событие"
                  rows={3}
                  textareaRef={eventDescriptionRef}
                />

                <div className={SHEET_SECTION_CARD}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={SECTION_TITLE_CLASS}>Ивент от клуба</p>
                      {selectedClubIdDraft ? (
                        <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 mb-1">
                          Ивент будет опубликован в выбранном клубе
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(selectedClubIdDraft)}
                      onClick={() =>
                        setSelectedClubIdDraft((prev) =>
                          prev ? '' : (ownerClubs[0]?.id ?? ''),
                        )
                      }
                      className={cn(
                        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors mt-0.5',
                        selectedClubIdDraft
                          ? 'bg-primary-500'
                          : 'bg-neutral-300',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                          selectedClubIdDraft
                            ? 'translate-x-6'
                            : 'translate-x-1',
                        )}
                      />
                    </button>
                  </div>

                  {selectedClubIdDraft ? (
                    <>
                      {eventAuthoringClubs.isLoading ? (
                        <div className="rounded-2xl bg-neutral-200 p-4 mt-4">
                          <p className="text-sm text-neutral-600">
                            Загружаем ваши клубы...
                          </p>
                        </div>
                      ) : null}

                      {eventAuthoringClubs.isError ? (
                        <div className="rounded-2xl bg-red-100 border border-red-200 p-4 mt-4">
                          <p className="text-sm text-red-600">
                            Не удалось загрузить список клубов.
                          </p>
                        </div>
                      ) : null}

                      {!eventAuthoringClubs.isLoading &&
                      !eventAuthoringClubs.isError ? (
                        ownerClubs.length > 0 ? (
                          <div className="mt-3 space-y-1.5">
                            {ownerClubs.map((club) => (
                              <button
                                key={club.id}
                                type="button"
                                className={cn(
                                  'w-full rounded-lg p-2.5 text-left transition-all duration-200',
                                  'flex items-center gap-3 min-h-[56px]',
                                  selectedClubIdDraft === club.id
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'ring-1 ring-neutral-200 bg-white text-neutral-900 hover:ring-neutral-300 shadow-sm',
                                )}
                                onClick={() => setSelectedClubIdDraft(club.id)}
                              >
                                <div className="h-9 w-9 shrink-0 rounded-md bg-black/20 grid place-items-center text-sm font-bold text-white">
                                  {club.title.slice(0, 1).toUpperCase()}
                                </div>
                                <p className="flex-1 min-w-0 text-sm font-medium leading-snug">
                                  {club.title}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl bg-neutral-100 border border-neutral-200 p-4">
                            <p className="text-sm text-neutral-700">
                              У вас нет клубов с ролью «владелец».
                            </p>
                          </div>
                        )
                      ) : null}
                    </>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h3 className={SECTION_TITLE_CLASS}>Детали</h3>
                  <div className={SHEET_SECTION_CARD}>
                    <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                      <MapPin
                        className="h-5 w-5 text-neutral-700 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">
                        Локация
                      </span>
                      <div className={cn('ml-auto', DETAIL_LABEL_WIDTH)}>
                        <input
                          type="text"
                          value={locationDraft}
                          onChange={(e) => setLocationDraft(e.target.value)}
                          placeholder="Укажите локацию"
                          className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                      <CalendarArrowUp
                        className="h-5 w-5 text-neutral-700 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">
                        Начало
                      </span>
                      <label
                        className={cn(
                          'relative ml-auto flex cursor-pointer items-center justify-end gap-2',
                          DETAIL_LABEL_WIDTH,
                        )}
                      >
                        <span className="text-right text-sm leading-6 tabular-nums text-neutral-500">
                          {formatDateTimeDisplay(startsAtDraft)}
                        </span>
                        <Calendar
                          className="h-4 w-4 text-neutral-400"
                          aria-hidden="true"
                        />
                        <input
                          type="datetime-local"
                          value={startsAtDraft}
                          onChange={(e) => setStartsAtDraft(e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                      <CalendarArrowDown
                        className="h-5 w-5 text-neutral-700 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">
                        Окончание
                      </span>
                      <label
                        className={cn(
                          'relative ml-auto flex cursor-pointer items-center justify-end gap-2',
                          DETAIL_LABEL_WIDTH,
                        )}
                      >
                        <span className="text-right text-sm leading-6 tabular-nums text-neutral-500">
                          {formatDateTimeDisplay(endsAtDraft)}
                        </span>
                        <Calendar
                          className="h-4 w-4 text-neutral-400"
                          aria-hidden="true"
                        />
                        <input
                          type="datetime-local"
                          value={endsAtDraft}
                          onChange={(e) => setEndsAtDraft(e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                      <Users
                        className="h-5 w-5 text-neutral-700 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">
                        Лимит
                      </span>
                      <div className={cn('ml-auto', DETAIL_LABEL_WIDTH)}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={maxParticipantsDraft}
                          onChange={(e) => {
                            const digitsOnly = e.target.value
                              .replace(/[^\d]/g, '')
                              .slice(0, 4);
                            const normalized = digitsOnly.replace(/^0+/, '');
                            setMaxParticipantsDraft(normalized);
                          }}
                          placeholder="Без лимита"
                          maxLength={4}
                          className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-neutral-400"
                        />
                      </div>
                    </div>
                  </div>
                  {eventTimeError ? (
                    <p className="text-sm text-red-500 mt-2">
                      {eventTimeError}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.LG}
                  fullWidth
                  className="rounded-full text-lg font-bold !bg-red-600 !text-white !shadow-none hover:!bg-red-700 border-0"
                  onClick={() => setConfirmCancel(true)}
                >
                  Отменить ивент
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ConfirmDialog for cancel */}
      <ConfirmDialog
        open={confirmCancel}
        title="Отменить ивент?"
        description="Участники увидят событие как отмененное."
        cancelText="Назад"
        confirmText="Отменить"
        loading={cancelState.isLoading}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancelEvent}
      />
    </>
  );
}
