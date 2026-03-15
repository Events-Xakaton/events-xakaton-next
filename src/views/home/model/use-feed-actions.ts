'use client';

import { useState } from 'react';

import { useJoinClubMutation } from '@/entities/club/api';
import { useJoinEventMutation } from '@/entities/event/api';

import { useAchievementContext } from '@/features/achievements';

import { appErrorText } from '@/shared/lib/utils';

export function useFeedActions(onClubJoined: () => void) {
  const [joinEvent, joinEventState] = useJoinEventMutation();
  const [joinClub, joinClubState] = useJoinClubMutation();
  const { triggerAchievement } = useAchievementContext();

  const [hint, setHint] = useState('');
  const [joinedEventIds, setJoinedEventIds] = useState<Record<string, boolean>>(
    {},
  );
  const [joinedClubIds, setJoinedClubIds] = useState<Record<string, boolean>>(
    {},
  );
  // Храним ID конкретного элемента в загрузке, а не общий isLoading,
  // чтобы спиннер показывался только на нажатой карточке
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [loadingClubId, setLoadingClubId] = useState<string | null>(null);

  function handleJoinEvent(eventId: string): void {
    setLoadingEventId(eventId);
    void joinEvent({ eventId })
      .unwrap()
      .then((result) => {
        setJoinedEventIds((prev) => ({ ...prev, [eventId]: true }));
        if (result.unlockedAchievements.length > 0) {
          triggerAchievement(result.unlockedAchievements);
        }
      })
      .catch((error) =>
        setHint(appErrorText(error, 'Не удалось присоединиться к ивенту')),
      )
      .finally(() => setLoadingEventId(null));
  }

  function handleJoinClub(clubId: string): void {
    setLoadingClubId(clubId);
    void joinClub({ clubId })
      .unwrap()
      .then(() => {
        setJoinedClubIds((prev) => ({ ...prev, [clubId]: true }));
        onClubJoined();
      })
      .catch((error) =>
        setHint(appErrorText(error, 'Не удалось вступить в клуб')),
      )
      .finally(() => setLoadingClubId(null));
  }

  return {
    hint,
    joinedEventIds,
    joinedClubIds,
    loadingEventId,
    loadingClubId,
    handleJoinEvent,
    handleJoinClub,
  };
}
