'use client';

import type { FC } from 'react';

import { useLoginStreakModal } from '../lib/use-login-streak-modal';
import { LoginStreakModal } from './LoginStreakModal';

type Props = {
  onOpenLuckyWheel: () => void;
};

export const LoginStreakModalProvider: FC<Props> = ({ onOpenLuckyWheel }) => {
  const { open, close, data } = useLoginStreakModal();

  if (!open || !data) return null;

  return (
    <LoginStreakModal
      open={open}
      data={data}
      onClose={close}
      onOpenLuckyWheel={onOpenLuckyWheel}
    />
  );
};
