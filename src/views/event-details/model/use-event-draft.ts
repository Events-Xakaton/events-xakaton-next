'use client';

import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { type EventDetails } from '@/entities/event/api';

import { toLocalDateTimeInputValue } from '@/shared/lib/date-format';
import { buildGradient } from '@/shared/lib/gradient';
import { toIsoFromLocal } from '@/shared/lib/utils';

import type { EventDraftFields, EventOriginalData } from '../types';

export type UseEventDraftResult = {
  fields: EventDraftFields;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setLocation: (v: string) => void;
  setStartsAt: (v: string) => void;
  setEndsAt: (v: string) => void;
  setMaxParticipants: (v: string) => void;
  setCoverUrl: (v: string | null) => void;
  setCoverSeed: (v: string) => void;
  setMinLevel: (v: number | null) => void;
  setSelectedClubId: (v: string) => void;
  originalData: EventOriginalData | null;
  hasChanges: boolean;
  showTitleEditor: boolean;
  setShowTitleEditor: (v: boolean) => void;
  titleEditorRef: RefObject<HTMLDivElement | null>;
  descriptionRef: RefObject<HTMLTextAreaElement | null>;
  timeError: string;
  hasRequiredFields: boolean;
  canSubmit: boolean;
  coverBackground: string;
};

export function useEventDraft(
  event: EventDetails | undefined,
): UseEventDraftResult {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [minLevel, setMinLevel] = useState<number | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverSeed, setCoverSeed] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');

  const [originalData, setOriginalData] = useState<EventOriginalData | null>(
    null,
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [showTitleEditor, setShowTitleEditor] = useState(false);

  const titleEditorRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Синхронизация черновика при загрузке данных события
  useEffect(() => {
    if (!event) return;

    const startsAtLocal = toLocalDateTimeInputValue(event.startsAtUtc);
    const endsAtLocal = toLocalDateTimeInputValue(event.endsAtUtc);
    const maxPart = event.maxParticipants ? String(event.maxParticipants) : '';
    const seed = event.coverSeed || event.id;

    setTitle(event.title);
    setDescription(event.description);
    setLocation(event.locationOrLink);
    setStartsAt(startsAtLocal);
    setEndsAt(endsAtLocal);
    setMaxParticipants(maxPart);
    setMinLevel(event.minLevel);
    setCoverUrl(event.coverUrl ?? null);
    setCoverSeed(seed);
    setSelectedClubId(event.clubId ?? '');

    setOriginalData({
      title: event.title,
      description: event.description,
      locationOrLink: event.locationOrLink,
      startsAt: startsAtLocal,
      endsAt: endsAtLocal,
      maxParticipants: maxPart,
      minLevel: event.minLevel,
      coverUrl: event.coverUrl ?? null,
      coverSeed: seed,
      clubId: event.clubId ?? '',
    });
  }, [event]);

  // Отслеживание изменений по сравнению с исходными данными
  useEffect(() => {
    if (!originalData || !event) return;

    const norm = (v: string) => v.replace(/^0+/, '') || '';

    const changed =
      title.trim() !== originalData.title.trim() ||
      description.trim() !== originalData.description.trim() ||
      location.trim() !== originalData.locationOrLink.trim() ||
      startsAt !== originalData.startsAt ||
      endsAt !== originalData.endsAt ||
      norm(maxParticipants) !== norm(originalData.maxParticipants) ||
      minLevel !== originalData.minLevel ||
      coverUrl !== originalData.coverUrl ||
      coverSeed !== originalData.coverSeed ||
      selectedClubId !== originalData.clubId;

    setHasChanges(changed);
  }, [
    title,
    description,
    location,
    startsAt,
    endsAt,
    maxParticipants,
    minLevel,
    coverUrl,
    coverSeed,
    selectedClubId,
    originalData,
    event,
  ]);

  // Фокус на inline-редакторе заголовка при его открытии
  useEffect(() => {
    if (!showTitleEditor || !titleEditorRef.current) return;
    titleEditorRef.current.textContent = title;
    titleEditorRef.current.focus();
  }, [showTitleEditor, title]);

  const timeError = useMemo(() => {
    if (!startsAt || !endsAt) return '';
    const startsAtUtc = toIsoFromLocal(startsAt);
    const endsAtUtc = toIsoFromLocal(endsAt);
    if (
      !startsAtUtc ||
      !endsAtUtc ||
      new Date(endsAtUtc) <= new Date(startsAtUtc)
    ) {
      return 'Время окончания должно быть позже времени начала.';
    }
    return '';
  }, [startsAt, endsAt]);

  const coverBackground = useMemo(() => {
    if (coverUrl) return `url('${coverUrl}') center / cover no-repeat`;
    return buildGradient(coverSeed, 'event');
  }, [coverUrl, coverSeed]);

  const hasRequiredFields =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    location.trim().length > 0 &&
    startsAt.length > 0 &&
    endsAt.length > 0;

  const canSubmit = hasChanges && hasRequiredFields && !timeError;

  return {
    fields: {
      title,
      description,
      location,
      startsAt,
      endsAt,
      maxParticipants,
      minLevel,
      coverUrl,
      coverSeed,
      selectedClubId,
    },
    setTitle,
    setDescription,
    setLocation,
    setStartsAt,
    setEndsAt,
    setMaxParticipants,
    setMinLevel,
    setCoverUrl,
    setCoverSeed,
    setSelectedClubId,
    originalData,
    hasChanges,
    showTitleEditor,
    setShowTitleEditor,
    titleEditorRef,
    descriptionRef,
    timeError,
    hasRequiredFields,
    canSubmit,
    coverBackground,
  };
}
