'use client';

import {
  Calendar,
  CalendarArrowDown,
  CalendarArrowUp,
  MapPin,
  Users,
} from 'lucide-react';
import { CSSProperties, FC, RefObject } from 'react';

import { type ClubEventAuthoring } from '@/entities/club/api';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { DescriptionSection } from '@/shared/components/description-section';
import { InlineTitleEditor } from '@/shared/components/inline-title-editor';
import { PreviewCard } from '@/shared/components/preview-card';
import { formatDateTimeDisplay } from '@/shared/lib/date-format';
import { buildGradient, newSeed } from '@/shared/lib/gradient';
import { APP_PANEL_SHADOW_CLASS } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

import { SHEET_ANIMATION_MS } from '../model/use-edit-sheet';
import type { EventDraftFields } from '../types';

const SHEET_TOP_LIMIT = 'calc(env(safe-area-inset-top, 0px) + 74px)';
const DETAIL_LABEL_WIDTH = 'w-[58%] min-w-[176px] pr-2';
const SHEET_SECTION_CARD =
  'bg-white border border-neutral-200 shadow-sm rounded-2xl p-4 space-y-4';
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

type Props = {
  isActive: boolean;
  fields: EventDraftFields;
  showTitleEditor: boolean;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setLocation: (v: string) => void;
  setStartsAt: (v: string) => void;
  setEndsAt: (v: string) => void;
  setMaxParticipants: (v: string) => void;
  setCoverSeed: (v: string) => void;
  setSelectedClubId: (v: string) => void;
  onShowTitleEditor: () => void;
  onHideTitleEditor: (value: string) => void;
  descriptionRef: RefObject<HTMLTextAreaElement | null>;
  ownerClubs: ClubEventAuthoring[];
  clubsLoading: boolean;
  clubsError: boolean;
  timeError: string;
  canSubmit: boolean;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  onCancelEvent: () => void;
};

export const EventEditSheet: FC<Props> = ({
  isActive,
  fields,
  showTitleEditor,
  setTitle,
  setDescription,
  setLocation,
  setStartsAt,
  setEndsAt,
  setMaxParticipants,
  setCoverSeed,
  setSelectedClubId,
  onShowTitleEditor,
  onHideTitleEditor,
  descriptionRef,
  ownerClubs,
  clubsLoading,
  clubsError,
  timeError,
  canSubmit,
  isSaving,
  onSave,
  onClose,
  onCancelEvent,
}) => {
  const coverBackground = buildGradient(fields.coverSeed, 'event');

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200 ease-out',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Закрыть редактирование"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-md flex-col rounded-t-3xl bg-[#f2f2f5] p-4 transition-transform duration-200 ease-out',
          APP_PANEL_SHADOW_CLASS,
          isActive ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{
          transitionDuration: `${SHEET_ANIMATION_MS}ms`,
          maxHeight: `calc(100dvh - ${SHEET_TOP_LIMIT})`,
        }}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.SM}
            onClick={onClose}
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
            onClick={onSave}
            disabled={!canSubmit}
            isLoading={isSaving}
            className="rounded-full px-4"
          >
            Сохранить
          </Button>
        </div>

        {/* Scrollable content */}
        <div
          className="min-h-0 flex-1 overflow-y-auto pb-6"
          style={
            {
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            } as CSSProperties
          }
        >
          <div className="space-y-4">
            {/* Preview card с inline-редактором заголовка */}
            <PreviewCard
              background={coverBackground}
              title={fields.title || ''}
              subtitle={`${formatDateTimeDisplay(fields.startsAt)} • ${fields.location}`}
              onChangeBackground={() => setCoverSeed(newSeed('event'))}
              titleEditing={showTitleEditor}
              onTitleClick={onShowTitleEditor}
              showEditIndicator
              showChangeBackgroundButton
              titleEditor={
                showTitleEditor ? (
                  <InlineTitleEditor
                    value={fields.title}
                    onChange={setTitle}
                    onCommit={onHideTitleEditor}
                    maxLength={60}
                  />
                ) : undefined
              }
              titleHint={
                showTitleEditor && 60 - fields.title.length <= 10 ? (
                  <p className="mt-2 text-xs text-white/70">
                    Осталось символов: {60 - fields.title.length}
                  </p>
                ) : null
              }
            />

            <DescriptionSection
              value={fields.description}
              onChange={setDescription}
              placeholder="Опишите событие"
              rows={3}
              textareaRef={descriptionRef}
            />

            {/* Клуб */}
            <div className={SHEET_SECTION_CARD}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={SECTION_TITLE_CLASS}>Ивент от клуба</p>
                  {fields.selectedClubId ? (
                    <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 mb-1">
                      Ивент будет опубликован в выбранном клубе
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(fields.selectedClubId)}
                  onClick={() =>
                    setSelectedClubId(
                      fields.selectedClubId ? '' : (ownerClubs[0]?.id ?? ''),
                    )
                  }
                  className={cn(
                    'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors mt-0.5',
                    fields.selectedClubId ? 'bg-primary-500' : 'bg-neutral-300',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                      fields.selectedClubId ? 'translate-x-6' : 'translate-x-1',
                    )}
                  />
                </button>
              </div>

              {fields.selectedClubId ? (
                <>
                  {clubsLoading ? (
                    <div className="rounded-2xl bg-neutral-200 p-4 mt-4">
                      <p className="text-sm text-neutral-600">
                        Загружаем ваши клубы...
                      </p>
                    </div>
                  ) : null}
                  {clubsError ? (
                    <div className="rounded-2xl bg-red-100 border border-red-200 p-4 mt-4">
                      <p className="text-sm text-red-600">
                        Не удалось загрузить список клубов.
                      </p>
                    </div>
                  ) : null}
                  {!clubsLoading && !clubsError ? (
                    ownerClubs.length > 0 ? (
                      <div className="mt-3 space-y-1.5">
                        {ownerClubs.map((club) => (
                          <button
                            key={club.id}
                            type="button"
                            className={cn(
                              'w-full rounded-lg p-2.5 text-left transition-all duration-200',
                              'flex items-center gap-3 min-h-[56px]',
                              fields.selectedClubId === club.id
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'ring-1 ring-neutral-200 bg-white text-neutral-900 hover:ring-neutral-300 shadow-sm',
                            )}
                            onClick={() => setSelectedClubId(club.id)}
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

            {/* Детали */}
            <div className="space-y-2">
              <h3 className={SECTION_TITLE_CLASS}>Детали</h3>
              <div className={SHEET_SECTION_CARD}>
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
                      value={fields.location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Укажите локацию"
                      className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0"
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
                      {formatDateTimeDisplay(fields.startsAt)}
                    </span>
                    <Calendar
                      className="h-4 w-4 text-neutral-400"
                      aria-hidden="true"
                    />
                    <input
                      type="datetime-local"
                      value={fields.startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
                      {formatDateTimeDisplay(fields.endsAt)}
                    </span>
                    <Calendar
                      className="h-4 w-4 text-neutral-400"
                      aria-hidden="true"
                    />
                    <input
                      type="datetime-local"
                      value={fields.endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
                      value={fields.maxParticipants}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/[^\d]/g, '')
                          .slice(0, 4);
                        setMaxParticipants(digitsOnly.replace(/^0+/, ''));
                      }}
                      placeholder="Без лимита"
                      maxLength={4}
                      className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-neutral-400"
                    />
                  </div>
                </div>
              </div>
              {timeError ? (
                <p className="text-sm text-red-500 mt-2">{timeError}</p>
              ) : null}
            </div>

            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.LG}
              fullWidth
              className="rounded-full text-lg font-bold !bg-red-600 !text-white !shadow-none hover:!bg-red-700 border-0"
              onClick={onCancelEvent}
            >
              Отменить ивент
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
