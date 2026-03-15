'use client';

import { Application, extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { FC, PropsWithChildren, RefObject } from 'react';

// Регистрируем Pixi-компоненты для использования в JSX
extend({ Container, Graphics, Sprite, Text });

type Props = PropsWithChildren & {
  parentRef: RefObject<HTMLDivElement | null>;
};

const ApplicationWrapper: FC<Props> = ({ children, parentRef }) => {
  const resolution =
    typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  return (
    <Application
      resolution={resolution}
      antialias
      autoDensity
      powerPreference="high-performance"
      backgroundAlpha={0}
      autoStart
      resizeTo={parentRef}
    >
      {children}
    </Application>
  );
};

export default ApplicationWrapper;
