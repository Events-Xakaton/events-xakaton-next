'use client';

import { useState } from 'react';

import {
  useCancelEventMutation,
  useJoinEventMutation,
  useUnjoinEventMutation,
  useUpdateEventMutation,
} from '@/entities/event/api';

import { appErrorText, toIsoFromLocal } from '@/shared/lib/utils';

import type { EventDraftFields, EventOriginalData } from '../types';

type UpdateParams = {
  eventId: string;
  fields: EventDraftFields;
  originalData: EventOriginalData | null;
  hasChanges: boolean;
  hasRequiredFields: boolean;
  canManage: boolean;
  archived: boolean;
  onSuccess: () => void;
};

export function useEventActions(eventId: string) {
  const [updateEvent, updateState] = useUpdateEventMutation();
  const [joinEvent, joinState] = useJoinEventMutation();
  const [unjoinEvent, unjoinState] = useUnjoinEventMutation();
  const [cancelEvent, cancelState] = useCancelEventMutation();

  const [hint, setHint] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [joinedOverride, setJoinedOverride] = useState<boolean | null>(null);

  async function handleUpdate({
    fields,
    originalData,
    hasChanges,
    hasRequiredFields,
    canManage,
    archived,
    onSuccess,
  }: Omit<UpdateParams, 'eventId'>): Promise<void> {
    setHint('');

    if (!hasChanges || !canManage || archived) return;

    if (!hasRequiredFields) {
      setHint(
        'Заполните обязательные поля: название, описание, локацию и время.',
      );
      return;
    }

    const startsAtUtc = toIsoFromLocal(fields.startsAt);
    const endsAtUtc = toIsoFromLocal(fields.endsAt);

    if (
      !startsAtUtc ||
      !endsAtUtc ||
      new Date(endsAtUtc) <= new Date(startsAtUtc)
    ) {
      setHint('Время окончания должно быть позже времени начала.');
      return;
    }

    try {
      const norm = (v: string) => v.replace(/^0+/, '') || '';

      await updateEvent({
        eventId,
        title: fields.title.trim(),
        description: fields.description.trim(),
        locationOrLink: fields.location.trim(),
        startsAtUtc,
        endsAtUtc,
        maxParticipants: norm(fields.maxParticipants)
          ? Number(norm(fields.maxParticipants))
          : undefined,
        // Отправляем minLevel только если изменилось: null явно снимает ограничение
        ...(fields.minLevel !== originalData?.minLevel
          ? { minLevel: fields.minLevel }
          : {}),
        coverSeed: fields.coverSeed,
        ...(fields.selectedClubId !== originalData?.clubId
          ? { clubId: fields.selectedClubId || null }
          : {}),
      }).unwrap();

      setHint('Изменения сохранены');
      onSuccess();
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось сохранить изменения'));
    }
  }

  function handleJoin(lucky?: boolean): void {
    setJoinedOverride(true);
    void joinEvent({ eventId, lucky })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null);
        setHint(appErrorText(error, 'Не удалось записаться на событие'));
      });
  }

  function handleUnjoin(): void {
    setJoinedOverride(false);
    void unjoinEvent({ eventId })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null);
        setHint(appErrorText(error, 'Не удалось отписаться от события'));
      });
  }

  async function handleCancelEvent(onSuccess: () => void): Promise<void> {
    try {
      await cancelEvent({ eventId }).unwrap();
      setConfirmCancel(false);
      setHint('Событие отменено');
      onSuccess();
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось отменить событие'));
    }
  }

  return {
    hint,
    setHint,
    confirmCancel,
    setConfirmCancel,
    joinedOverride,
    updateState,
    joinState,
    unjoinState,
    cancelState,
    handleUpdate,
    handleJoin: (lucky?: boolean) => handleJoin(lucky),
    handleUnjoin,
    handleCancelEvent,
  };
}
