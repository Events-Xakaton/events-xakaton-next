'use client';

import Image from 'next/image';
import type { FC } from 'react';

import type { AchievementDto } from '@/shared/api/achievements-api';
import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';

import './styles/achievement-modal.css';

type Props = {
  achievement: AchievementDto;
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
};

export const AchievementUnlockedModal: FC<Props> = ({
  achievement,
  open,
  onClose,
  onApply,
  isApplying,
}) => {
  if (!open) return null;

  return (
    <div
      className="achievement-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Новое достижение"
      onClick={onClose}
    >
      <div
        className="achievement-modal__card"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="achievement-modal__title">🎉 Новое достижение!</p>
        <div className="achievement-modal__icon">
          <Image
            src={achievement.iconUrl}
            alt={achievement.name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        </div>
        <p className="achievement-modal__name">{achievement.name}</p>
        <p className="achievement-modal__desc">{achievement.description}</p>
        <div className="achievement-modal__actions">
          <Button
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.LG}
            className="w-full"
            disabled={isApplying}
            isLoading={isApplying}
            onClick={onApply}
          >
            Применить аватар
          </Button>
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.LG}
            className="w-full"
            onClick={onClose}
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};
