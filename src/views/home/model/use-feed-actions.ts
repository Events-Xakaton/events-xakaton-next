'use client';

import { useState } from 'react';

import { useJoinClubMutation } from '@/entities/club/api';
import { useJoinEventMutation } from '@/entities/event/api';
import { appErrorText } from '@/shared/lib/utils';

export function useFeedActions(onClubJoined: () => void) {
  const [joinEvent, joinEventState] = useJoinEventMutation();
  const [joinClub, joinClubState] = useJoinClubMutation();

  const [hint, setHint] = useState('');
  const [joinedEventIds, setJoinedEventIds] = useState<
    Record<string, boolean>
  >({});
  const [joinedClubIds, setJoinedClubIds] = useState<Record<string, boolean>>(
    {},
  );
  const [savedClubIds, setSavedClubIds] = useState<string[]>([]);

  function handleJoinEvent(eventId: string): void {
    void joinEvent({ eventId })
      .unwrap()
      .then(() => {
        setJoinedEventIds((prev) => ({ ...prev, [eventId]: true }));
      })
      .catch((error) =>
        setHint(appErrorText(error, 'Не удалось присоединиться к ивенту')),
      );
  }

  function handleJoinClub(clubId: string): void {
    void joinClub({ clubId })
      .unwrap()
      .then(() => {
        setJoinedClubIds((prev) => ({ ...prev, [clubId]: true }));
        onClubJoined();
      })
      .catch((error) =>
        setHint(appErrorText(error, 'Не удалось вступить в клуб')),
      );
  }

  function handleToggleSavedClub(clubId: string): void {
    setSavedClubIds((prev) =>
      prev.includes(clubId)
        ? prev.filter((id) => id !== clubId)
        : [...prev, clubId],
    );
  }

  return {
    hint,
    joinedEventIds,
    joinedClubIds,
    savedClubIds,
    joinEventLoading: joinEventState.isLoading,
    joinClubLoading: joinClubState.isLoading,
    handleJoinEvent,
    handleJoinClub,
    handleToggleSavedClub,
  };
}
