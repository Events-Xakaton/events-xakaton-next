'use client';

import { useState } from 'react';

import {
  useDeleteClubMutation,
  useJoinClubMutation,
  useLeaveClubMutation,
} from '@/entities/club/api';

import { appErrorText } from '@/shared/lib/utils';

type UseClubActionsResult = {
  hint: string;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  joinedOverride: boolean | null;
  joinLoading: boolean;
  leaveLoading: boolean;
  deleteLoading: boolean;
  handleJoin: (clubId: string) => void;
  handleLeave: (clubId: string) => void;
  handleDelete: (clubId: string, onSuccess: () => void) => Promise<void>;
};

export function useClubActions(): UseClubActionsResult {
  const [hint, setHint] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [joinedOverride, setJoinedOverride] = useState<boolean | null>(null);

  const [joinClub, joinState] = useJoinClubMutation();
  const [leaveClub, leaveState] = useLeaveClubMutation();
  const [deleteClub, deleteState] = useDeleteClubMutation();

  function handleJoin(clubId: string): void {
    setJoinedOverride(true); // optimistic UI
    void joinClub({ clubId })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null); // rollback
        setHint(appErrorText(error, 'Не удалось вступить в клуб'));
      });
  }

  function handleLeave(clubId: string): void {
    setJoinedOverride(false); // optimistic UI
    void leaveClub({ clubId })
      .unwrap()
      .catch((error) => {
        setJoinedOverride(null); // rollback
        setHint(appErrorText(error, 'Не удалось выйти из клуба'));
      });
  }

  async function handleDelete(
    clubId: string,
    onSuccess: () => void,
  ): Promise<void> {
    try {
      await deleteClub({ clubId }).unwrap();
      setConfirmDelete(false);
      onSuccess();
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось удалить клуб'));
    }
  }

  return {
    hint,
    confirmDelete,
    setConfirmDelete,
    menuOpen,
    setMenuOpen,
    joinedOverride,
    joinLoading: joinState.isLoading,
    leaveLoading: leaveState.isLoading,
    deleteLoading: deleteState.isLoading,
    handleJoin,
    handleLeave,
    handleDelete,
  };
}
