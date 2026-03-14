'use client';

import Image from 'next/image';
import { FC } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/easter-egg-button.css';

type Props = {
  visible: boolean;
  onClick: () => void;
};

export const EasterEggButton: FC<Props> = ({ visible, onClick }) => (
  <button
    type="button"
    aria-label="Мне повезёт"
    className={cn(
      'easter-egg-btn mb-[10px]',
      !visible && 'easter-egg-btn--hidden',
    )}
    onClick={onClick}
  >
    <Image
      src="/easter-egg.png"
      alt="Мне повезёт"
      width={56}
      height={56}
      className="easter-egg-btn__image"
      priority
    />
  </button>
);
