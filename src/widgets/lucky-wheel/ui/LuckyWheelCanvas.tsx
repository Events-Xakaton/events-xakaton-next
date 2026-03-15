'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { WonItem } from '../lib';
import { WHEEL_DIAMETER } from '../lib';

type Props = {
  wonItem: WonItem | null;
  onAnimationRest: () => void;
  onAnimationStart: () => void;
  isFetching: boolean;
};

// Спиннер-заглушка пока чанк с Pixi не загрузится
const PixiLoadingFallback: FC = () => (
  <div className="lucky-wheel__canvas-overlay">
    <div className="lucky-wheel__canvas-spinner" />
  </div>
);

// Pixi-компоненты загружаются только на клиенте — WebGL не доступен на сервере
const ApplicationWrapper = dynamic(() => import('./ApplicationWrapper'), {
  ssr: false,
  loading: PixiLoadingFallback,
});

const PixiWheel = dynamic(() => import('./PixiWheel'), {
  ssr: false,
});

export const LuckyWheelCanvas: FC<Props> = ({
  wonItem,
  onAnimationRest,
  onAnimationStart,
  isFetching,
}) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = (): void => {
      setScale(container.offsetWidth / WHEEL_DIAMETER);
    };

    updateScale();

    // ResizeObserver реагирует только на изменения самого контейнера,
    // а не на любой resize окна — точнее и не вызывает лишних перерисовок.
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lucky-wheel__canvas-wrapper" ref={containerRef}>
      <ApplicationWrapper parentRef={containerRef}>
        <PixiWheel
          scale={scale}
          wonItem={wonItem}
          onAnimationRest={onAnimationRest}
          onAnimationStart={onAnimationStart}
        />
      </ApplicationWrapper>

      {/* Спиннер поверх колеса во время загрузки события */}
      {isFetching && (
        <div className="lucky-wheel__canvas-overlay">
          <div className="lucky-wheel__canvas-spinner" />
        </div>
      )}
    </div>
  );
};
