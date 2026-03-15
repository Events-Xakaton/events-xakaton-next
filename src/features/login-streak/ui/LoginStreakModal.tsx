'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import type { LuckyWheelStreakRes } from '@/entities/event/api';

import { StreakDayTrack } from './StreakDayTrack';
import './styles/login-streak-modal.css';

type Props = {
  open: boolean;
  data: LuckyWheelStreakRes;
  onClose: () => void;
  onOpenLuckyWheel: () => void;
};

type CtaContent = {
  title: string;
  subtitle: string;
};

function getCtaContent(
  currentStreak: number,
  animationDone: boolean,
): CtaContent {
  const cycleRemainder = currentStreak % 3;
  const isDay3 = cycleRemainder === 0;
  const isLongStreak = currentStreak > 3;
  const isExtraFreeSpin = isDay3 && isLongStreak;

  if (isDay3) {
    const title = isExtraFreeSpin
      ? 'Ты получил фри-спин! 🎉 +ещё один фри-спин в копилку!'
      : 'Ты получил фри-спин! 🎉';
    // Во время анимации подзаголовок показывается только по завершении
    return {
      title: animationDone ? title : '🎁 Собираем твою награду...',
      subtitle: animationDone
        ? '3 дня подряд — это сила. Используй его на Lucky Wheel прямо сейчас!'
        : '',
    };
  }

  if (cycleRemainder === 1) {
    return {
      title: 'Отличное начало!',
      subtitle:
        'Возвращайся завтра — ты уже на пути к бесплатному спину 🎰',
    };
  }

  return {
    title: 'Ты в шаге от награды!',
    subtitle:
      'Ещё один день — и фри-спин у тебя в кармане. Так держать 💪',
  };
}

export const LoginStreakModal: FC<Props> = ({
  open,
  data,
  onClose,
  onOpenLuckyWheel,
}) => {
  const { currentStreak, freeSpinBalance } = data;
  const isDay3 = currentStreak % 3 === 0;

  // Показываем колесо только после завершения анимации (для дня 3)
  const [animationDone, setAnimationDone] = useState(!isDay3);

  const handleAnimationComplete = useCallback(() => {
    // Небольшая задержка после последней ячейки для визуального эффекта
    setTimeout(() => {
      setAnimationDone(true);
      // Запускаем конфетти из центра экрана
      void import('@hiseb/confetti').then(({ default: confetti }) => {
        confetti({
          position: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          },
          count: 80,
          velocity: 220,
          fade: true,
        });
      });
    }, 150);
  }, []);

  // Сбрасываем состояние анимации при повторном открытии
  useEffect(() => {
    if (open) {
      setAnimationDone(!isDay3);
    }
  }, [open, isDay3]);

  useEffect(() => {
    if (!open) return;

    function onEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) return null;

  const headerTitle =
    currentStreak > 3
      ? `🔥 День ${currentStreak} — серия продолжается!`
      : `🔥 День ${currentStreak}`;

  const cta = getCtaContent(currentStreak, animationDone);

  return (
    <div
      className="streak-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
    >
      <div className="streak-modal__card">
        <h2 id="streak-modal-title" className="streak-modal__header">
          {headerTitle}
        </h2>
        <p className="streak-modal__series-label">
          Серия: {currentStreak} дн.
        </p>

        <div className="streak-modal__track">
          <StreakDayTrack
            currentStreak={currentStreak}
            animate={isDay3}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {freeSpinBalance > 0 && (
          <div className="streak-modal__balance">
            🎰 Фри-спинов на балансе: {freeSpinBalance}
          </div>
        )}

        <p className="streak-modal__cta-title">{cta.title}</p>
        {cta.subtitle && (
          <p className="streak-modal__cta-subtitle">{cta.subtitle}</p>
        )}

        <div className="streak-modal__actions">
          <Button
            className="flex-1"
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={onClose}
          >
            Закрыть
          </Button>

          {isDay3 && animationDone && (
            <Button
              className="flex-1"
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.MD}
              onClick={() => {
                onClose();
                onOpenLuckyWheel();
              }}
            >
              🎰 Крутить колесо
            </Button>
          )}
        </div>

        {isDay3 && freeSpinBalance > 1 && (
          <p className="streak-modal__hint">
            У тебя {freeSpinBalance} фри-спина(ов) — используй их в любой день
          </p>
        )}
      </div>
    </div>
  );
};
