'use client';

import Image from 'next/image';
import type { FC } from 'react';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';

import type { AchievementDto } from '../types';
import './styles/achievement-card.css';

type Props = {
  achievement: AchievementDto;
  onApply: (id: string) => void;
  onRemove: () => void;
  isPending: boolean;
};

export const AchievementCard: FC<Props> = ({
  achievement,
  onApply,
  onRemove,
  isPending,
}) => {
  return (
    <article className="achievement-card">
      <div className="achievement-card__icon">
        <Image
          src={achievement.iconUrl}
          alt={achievement.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <p className="achievement-card__name">{achievement.name}</p>
      <p className="achievement-card__desc">{achievement.description}</p>
      <div className="achievement-card__action">
        {achievement.isActive ? (
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.SM}
            className="w-full"
            disabled={isPending}
            onClick={onRemove}
          >
            Снять
          </Button>
        ) : (
          <Button
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.SM}
            className="w-full"
            disabled={isPending}
            onClick={() => onApply(achievement.id)}
          >
            Применить
          </Button>
        )}
      </div>
    </article>
  );
};
