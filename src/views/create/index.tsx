'use client';

import {
  Calendar,
  CalendarArrowDown,
  CalendarArrowUp,
  ChevronDown,
  MapPin,
  Users,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { AppHeader } from '@/widgets/app-header';

import { Button, ButtonSize } from '@/shared/components/button';
import { DescriptionSection } from '@/shared/components/description-section';
import { InlineTitleEditor } from '@/shared/components/inline-title-editor';
import { PreviewCard } from '@/shared/components/preview-card';
import { formatDateTimeDisplay } from '@/shared/lib/date-format';
import { useTelegramMainButton } from '@/shared/lib/telegram/useTelegramButtons';
import { useViewportMode } from '@/shared/lib/telegram/useViewportMode';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_PANEL_SHADOW_CLASS,
  APP_SECTION_CARD_CLASS,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';
import { CreateTab } from '@/shared/types/navigation';

import { CREATE_TYPE_OPTIONS } from './lib/create-utils';
import { useClubForm } from './model/use-club-form';
import { useEventForm } from './model/use-event-form';
import { ClubSelector } from './ui/club-selector';

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const DETAIL_LABEL_WIDTH = 'w-[58%] min-w-[176px] pr-2';
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

export function CreateScreen() {
  const mode = useViewportMode();
  const [tab, setTab] = useState<CreateTab>('event');
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const createTypeRef = useRef<HTMLDivElement>(null);

  const eventForm = useEventForm();
  const clubForm = useClubForm();

  const selectedCreateType =
    CREATE_TYPE_OPTIONS.find((option) => option.value === tab) ??
    CREATE_TYPE_OPTIONS[0];

  useTelegramMainButton({
    text: tab === 'event' ? 'Создать мероприятие' : 'Создать клуб',
    onClick: () => {
      if (tab === 'event') {
        void eventForm.submit();
      } else {
        void clubForm.submit();
      }
    },
    enabled: tab === 'event' ? eventForm.canPublish : clubForm.canPublish,
    visible: mode === 'compact',
  });

  // Закрытие дропдауна по клику вне
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!createTypeRef.current) return;
      if (!createTypeRef.current.contains(event.target as Node)) {
        setIsCreateTypeOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (tab === 'event') {
      void eventForm.submit();
    } else {
      void clubForm.submit();
    }
  }

  const titleForPreview = eventForm.title.trim() || 'Настолки в офисе';

  return (
    <div
      className="relative bg-[#f2f2f5]"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingBottom: getBottomPadding('form'),
      }}
    >
      <AppHeader
        mode="fixed"
        topClassName="z-fixed"
        useSafeArea={false}
        showTopGap={false}
        rootStyle={{ paddingTop: `calc(${SAFE_AREA_TOP} + 16px)` }}
        center={
          <div ref={createTypeRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCreateTypeOpen((prev) => !prev)}
              data-testid="create-type-toggle"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-[13px] font-semibold text-neutral-800 shadow-sm"
            >
              {selectedCreateType.title}
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isCreateTypeOpen && 'rotate-180',
                )}
              />
            </button>

            {isCreateTypeOpen && (
              <div
                className={cn(
                  'absolute left-1/2 top-[calc(100%+10px)] z-[220] w-[300px] -translate-x-1/2 overflow-hidden rounded-3xl border border-neutral-200 bg-white',
                  APP_PANEL_SHADOW_CLASS,
                )}
              >
                {CREATE_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    data-testid={`create-type-option-${option.value}`}
                    onClick={() => {
                      setTab(option.value);
                      setIsCreateTypeOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors',
                      option.value === tab
                        ? 'bg-neutral-100'
                        : 'hover:bg-neutral-50',
                      index !== 0 && 'border-t border-neutral-100',
                    )}
                  >
                    {option.value === 'event' ? (
                      <Calendar
                        className="mt-0.5 h-5 w-5 text-neutral-700"
                        aria-hidden="true"
                      />
                    ) : (
                      <Users
                        className="mt-0.5 h-5 w-5 text-neutral-700"
                        aria-hidden="true"
                      />
                    )}
                    <span className="block">
                      <span className="block text-sm font-semibold text-neutral-900">
                        {option.title}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {option.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {tab === 'event' ? (
        <form
          className="space-y-4 px-4"
          style={{ paddingTop: `calc(${SAFE_AREA_TOP} + 88px)` }}
          onSubmit={handleSubmit}
        >
          <PreviewCard
            background={eventForm.coverBackground}
            title={titleForPreview}
            onChangeBackground={eventForm.changeCoverSeed}
            titleEditing={eventForm.showTitleEditor}
            onTitleClick={() => eventForm.setShowTitleEditor(true)}
            showEditIndicator
            titleEditor={
              eventForm.showTitleEditor ? (
                <InlineTitleEditor
                  value={eventForm.title}
                  onChange={eventForm.setTitle}
                  onCommit={(v) => {
                    eventForm.setTitle(v);
                    eventForm.setShowTitleEditor(false);
                  }}
                  maxLength={60}
                />
              ) : undefined
            }
            titleHint={
              eventForm.showTitleEditor && 60 - eventForm.title.length <= 10 ? (
                <p className="mt-2 text-xs text-white/70">
                  Осталось символов: {60 - eventForm.title.length}
                </p>
              ) : null
            }
          />

          <DescriptionSection
            value={eventForm.description}
            onChange={eventForm.setDescription}
            placeholder="Опишите план встречи: чем будете заниматься, где пройдет ивент и что участникам важно знать заранее."
            rows={3}
            textareaRef={eventForm.descriptionRef}
          />

          {/* Детали */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Детали</h3>
            <div className={SECTION_CARD}>
              {/* Локация */}
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
                    value={eventForm.location}
                    onChange={(e) => eventForm.setLocation(e.target.value)}
                    placeholder="Укажите локацию"
                    className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0"
                    style={{
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = 'none';
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

              {/* Начало */}
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
                    {formatDateTimeDisplay(eventForm.startsAt)}
                  </span>
                  <Calendar
                    className="h-4 w-4 text-neutral-400"
                    aria-hidden="true"
                  />
                  <input
                    type="datetime-local"
                    value={eventForm.startsAt}
                    onChange={(e) => eventForm.setStartsAt(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    required
                  />
                </label>
              </div>

              {/* Окончание */}
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
                    {formatDateTimeDisplay(eventForm.endsAt)}
                  </span>
                  <Calendar
                    className="h-4 w-4 text-neutral-400"
                    aria-hidden="true"
                  />
                  <input
                    type="datetime-local"
                    value={eventForm.endsAt}
                    onChange={(e) => eventForm.setEndsAt(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    required
                  />
                </label>
              </div>

              {/* Лимит */}
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
                    value={eventForm.maxParticipants}
                    onChange={(e) => {
                      const digitsOnly = e.target.value
                        .replace(/[^\d]/g, '')
                        .slice(0, 4);
                      eventForm.setMaxParticipants(
                        digitsOnly.replace(/^0+/, ''),
                      );
                    }}
                    placeholder="Без лимита"
                    maxLength={4}
                    className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-neutral-400"
                    style={{
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  />
                </div>
              </div>
            </div>
            {eventForm.timeError && (
              <p className="text-sm text-red-500 mt-2">{eventForm.timeError}</p>
            )}
          </div>

          {/* Привязка к клубу */}
          <div className={SECTION_CARD}>
            <ClubSelector
              createFromClub={eventForm.createFromClub}
              onToggle={() =>
                eventForm.setCreateFromClub(!eventForm.createFromClub)
              }
              selectedClubId={eventForm.selectedClubId}
              onSelectClub={eventForm.setSelectedClubId}
              clubs={eventForm.ownedClubs}
              isLoading={eventForm.clubsLoading}
              isError={eventForm.clubsError}
              showAll={eventForm.showAllClubs}
              onToggleShowAll={() =>
                eventForm.setShowAllClubs(!eventForm.showAllClubs)
              }
            />
          </div>

          {eventForm.hint && (
            <div
              className={cn(
                'p-4 rounded-2xl',
                eventForm.hint.includes('создан')
                  ? 'bg-green-100'
                  : 'bg-red-100',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  eventForm.hint.includes('создан')
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
              >
                {eventForm.hint}
              </p>
            </div>
          )}

          <Button
            type="submit"
            size={ButtonSize.LG}
            fullWidth
            disabled={!eventForm.canPublish}
            isLoading={eventForm.isSubmitting}
            className="rounded-full text-lg font-bold"
          >
            {eventForm.isSubmitting ? 'Публикация...' : 'Создать мероприятие'}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4 px-4"
          style={{ paddingTop: `calc(${SAFE_AREA_TOP} + 88px)` }}
          onSubmit={handleSubmit}
        >
          <PreviewCard
            background={clubForm.coverBackground}
            title={clubForm.title.trim() || 'Новый клуб'}
            subtitle={clubForm.description.trim() || undefined}
            onChangeBackground={clubForm.changeCoverSeed}
            titleEditing={clubForm.showTitleEditor}
            onTitleClick={() => clubForm.setShowTitleEditor(true)}
            showEditIndicator
            titleEditor={
              clubForm.showTitleEditor ? (
                <InlineTitleEditor
                  value={clubForm.title}
                  onChange={clubForm.setTitle}
                  onCommit={(v) => {
                    clubForm.setTitle(v);
                    clubForm.setShowTitleEditor(false);
                  }}
                  maxLength={60}
                />
              ) : undefined
            }
            titleHint={
              clubForm.showTitleEditor && 60 - clubForm.title.length <= 10 ? (
                <p className="mt-2 text-xs text-white/70">
                  Осталось символов: {60 - clubForm.title.length}
                </p>
              ) : null
            }
          />

          <DescriptionSection
            value={clubForm.description}
            onChange={clubForm.setDescription}
            placeholder="Кратко опишите цель клуба и чем участники будут заниматься."
            rows={3}
            textareaRef={clubForm.descriptionRef}
          />

          {clubForm.hint && (
            <div
              className={cn(
                'p-4 rounded-2xl',
                clubForm.hint.includes('создан')
                  ? 'bg-green-100'
                  : 'bg-red-100',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  clubForm.hint.includes('создан')
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
              >
                {clubForm.hint}
              </p>
            </div>
          )}

          <Button
            type="submit"
            size={ButtonSize.LG}
            fullWidth
            disabled={!clubForm.canPublish}
            isLoading={clubForm.isSubmitting}
            className="rounded-full text-lg font-bold"
          >
            {clubForm.isSubmitting ? 'Создание...' : 'Создать клуб'}
          </Button>
        </form>
      )}
    </div>
  );
}
