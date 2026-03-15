'use client';

import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { SAFE_AREA_BOTTOM } from '@/shared/lib/ui-styles';

import './styles/lucky-wheel-pill.css';

type Props = {
  /** true = первая активация → wow-анимация + конфетти */
  isNew: boolean;
  onClick: () => void;
};

// Высота нав-бара (соответствует CSS .bottom-nav)
const NAV_HEIGHT_PX = 72;

export const LuckyWheelPill: FC<Props> = ({ isNew, onClick }) => {
  const firedConfetti = useRef(false);

  useEffect(() => {
    if (!isNew || firedConfetti.current) return;
    firedConfetti.current = true;

    // Конфетти после того, как тайл долетел (450ms анимация + небольшой буфер)
    const timer = setTimeout(() => {
      void import('@hiseb/confetti').then(({ default: confetti }) => {
        confetti({
          position: {
            x: window.innerWidth - 40,
            y: window.innerHeight - NAV_HEIGHT_PX - 28,
          },
          count: 55,
          velocity: 160,
          fade: true,
        });
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [isNew]);

  const bottomOffset = `calc(${SAFE_AREA_BOTTOM} + ${NAV_HEIGHT_PX}px + 10px)`;

  return (
    <div
      className={`lucky-pill${isNew ? ' lucky-pill--new' : ''}`}
      style={{ bottom: bottomOffset }}
    >
      <button
        type="button"
        className="lucky-pill__button"
        onClick={onClick}
        aria-label="Открыть Lucky Wheel"
      >
        <span className="lucky-pill__emoji" aria-hidden="true">
          🎰
        </span>
        <span className="lucky-pill__label">Рулетка</span>
      </button>
    </div>
  );
};
