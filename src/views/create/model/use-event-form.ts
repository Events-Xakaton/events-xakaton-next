'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useEventAuthoringClubsQuery } from '@/entities/club/api';
import { useCreateEventMutation } from '@/entities/event/api';

import { useAchievementContext } from '@/features/achievements';

import { buildGradient, newSeed } from '@/shared/lib/gradient';
import { appErrorText, toIsoFromLocal } from '@/shared/lib/utils';

import { createDefaultEventTimes } from '../lib/create-utils';
import { type EventFormValues, eventSchema } from '../lib/event-schema';

export function useEventForm({
  onCreated,
}: {
  onCreated?: (eventId: string) => void;
} = {}) {
  const [createEvent, { isLoading: isSubmitting }] = useCreateEventMutation();
  const eventAuthoringClubs = useEventAuthoringClubsQuery();
  const { triggerAchievement } = useAchievementContext();

  const defaultTimes = createDefaultEventTimes();

  const { watch, setValue, handleSubmit, formState, reset } =
    useForm<EventFormValues>({
      resolver: zodResolver(eventSchema),
      defaultValues: {
        title: '',
        description: '',
        location: '',
        startsAt: defaultTimes.startsAt,
        endsAt: defaultTimes.endsAt,
        maxParticipants: '',
      },
      mode: 'onChange',
    });

  const title = watch('title');
  const description = watch('description');
  const location = watch('location');
  const startsAt = watch('startsAt');
  const endsAt = watch('endsAt');
  const maxParticipants = watch('maxParticipants') ?? '';

  const [coverSeed, setCoverSeed] = useState(() => newSeed('event'));
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [minLevel, setMinLevel] = useState<number | null>(null);
  const [isForKids, setIsForKids] = useState(false);
  const [kidsMinAge, setKidsMinAge] = useState<number | null>(null);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [createFromClub, setCreateFromClub] = useState(false);
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [hint, setHint] = useState('');

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!descriptionRef.current) return;
    descriptionRef.current.style.height = 'auto';
    descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
  }, [description]);

  const coverBackground = useMemo(() => {
    if (coverUrl) return `url('${coverUrl}') center / cover no-repeat`;
    return buildGradient(coverSeed, 'event');
  }, [coverUrl, coverSeed]);

  // Ошибка времени из Zod-валидации cross-field refine
  const timeError = formState.errors.endsAt?.message ?? '';
  const canPublish = formState.isValid;

  const ownedClubs = useMemo(
    () => (eventAuthoringClubs.data ?? []).filter((c) => c.role === 'owner'),
    [eventAuthoringClubs.data],
  );

  async function submitHandler(values: EventFormValues): Promise<void> {
    setHint('');

    const startsAtUtc = toIsoFromLocal(values.startsAt);
    const endsAtUtc = toIsoFromLocal(values.endsAt);
    if (!startsAtUtc || !endsAtUtc) return;

    try {
      const clubIdForCreate = createFromClub
        ? selectedClubId || undefined
        : undefined;
      const result = await createEvent({
        clubId: clubIdForCreate,
        title: values.title.trim(),
        description: values.description.trim(),
        locationOrLink: values.location.trim(),
        startsAtUtc,
        endsAtUtc,
        maxParticipants: values.maxParticipants
          ? Number(values.maxParticipants)
          : undefined,
        ...(minLevel !== null ? { minLevel } : {}),
        isForKids,
        ...(isForKids && kidsMinAge !== null ? { kidsMinAge } : {}),
        categoryCode: 'general',
        coverSeed,
        ...(coverUrl !== null ? { coverUrl } : {}),
      }).unwrap();

      if (result.unlockedAchievements.length > 0) {
        triggerAchievement(result.unlockedAchievements);
      }

      const createdEventId = result.id;
      const next = createDefaultEventTimes();
      reset({
        title: '',
        description: '',
        location: '',
        startsAt: next.startsAt,
        endsAt: next.endsAt,
        maxParticipants: '',
      });
      setMinLevel(null);
      setIsForKids(false);
      setKidsMinAge(null);
      setCoverUrl(null);
      setSelectedClubId('');
      setCreateFromClub(false);
      setShowTitleEditor(false);
      onCreated?.(createdEventId);
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось создать мероприятие.'));
    }
  }

  return {
    title,
    setTitle: (v: string) => setValue('title', v, { shouldValidate: true }),
    description,
    setDescription: (v: string) =>
      setValue('description', v, { shouldValidate: true }),
    location,
    setLocation: (v: string) =>
      setValue('location', v, { shouldValidate: true }),
    startsAt,
    setStartsAt: (v: string) =>
      setValue('startsAt', v, { shouldValidate: true }),
    endsAt,
    setEndsAt: (v: string) => setValue('endsAt', v, { shouldValidate: true }),
    maxParticipants,
    setMaxParticipants: (v: string) => setValue('maxParticipants', v),
    selectedClubId,
    setSelectedClubId,
    createFromClub,
    setCreateFromClub,
    minLevel,
    setMinLevel,
    isForKids,
    setIsForKids: (value: boolean) => {
      setIsForKids(value);
      if (!value) setKidsMinAge(null);
    },
    kidsMinAge,
    setKidsMinAge,
    coverSeed,
    changeCoverSeed: () => setCoverSeed(newSeed('event')),
    coverUrl,
    setCoverUrl,
    showTitleEditor,
    setShowTitleEditor,
    showAllClubs,
    setShowAllClubs,
    hint,
    timeError,
    canPublish,
    isSubmitting,
    coverBackground,
    descriptionRef,
    ownedClubs,
    clubsLoading: eventAuthoringClubs.isLoading,
    clubsError: eventAuthoringClubs.isError,
    submit: handleSubmit(submitHandler),
  };
}
