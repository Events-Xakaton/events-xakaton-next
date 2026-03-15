'use client';

import { useTick } from '@pixi/react';
import { useSpring } from '@react-spring/web';
import { TextStyle } from 'pixi.js';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  WHEEL_RADIUS,
  WHEEL_SEGMENTS,
  createDrawSegments,
  createMaskForShadow,
  drawBg,
  drawBgBorder,
  drawCentralPointBorder,
  drawCentralPointInner,
  drawCentralShadow,
  drawPointer,
  drawShadow,
  useOnApplicationUnmount,
} from '../lib';
import type { WonItem } from '../lib';

type Props = {
  scale: number;
  wonItem: WonItem | null;
  onAnimationRest: () => void;
  onAnimationStart: () => void;
};

const FULL_ROTATION = Math.PI * 2;
const HALF_OF_RADIUS = WHEEL_RADIUS / 2 + 15;
const INITIAL_ROTATION = -Math.PI / 2;

const EMOJI_TEXT_STYLE = new TextStyle({
  fontSize: 22,
  fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif',
});

// Предвычисляем позиции всех 12 эмодзи — они не меняются
const SEGMENT_TRANSFORMS = WHEEL_SEGMENTS.map((_, index) => {
  const rotation = (FULL_ROTATION / WHEEL_SEGMENTS.length) * index;
  return {
    rotation,
    x: HALF_OF_RADIUS * Math.cos(rotation),
    y: HALF_OF_RADIUS * Math.sin(rotation),
  };
});

const PixiWheel: FC<Props> = ({
  scale,
  wonItem,
  onAnimationRest,
  onAnimationStart,
}) => {
  useOnApplicationUnmount();

  const [isAnimating, setIsAnimating] = useState(false);
  const [currRotation, setCurrRotation] = useState(INITIAL_ROTATION);
  const [resultRotation, setResultRotation] = useState(INITIAL_ROTATION);

  const [springValue, api] = useSpring(
    () => ({
      from: { rotation: INITIAL_ROTATION },
      config: { tension: 20, friction: 25, mass: 10 },
      onRest: ({ value }: { value: { rotation: number } }) => {
        setResultRotation(value.rotation);
        setIsAnimating(false);
        setTimeout(() => onAnimationRest(), 500);
      },
      onStart: () => {
        setIsAnimating(true);
        onAnimationStart();
      },
    }),
    [wonItem],
  );

  useEffect(() => {
    if (!wonItem) return;

    const oneItemAngle = FULL_ROTATION / WHEEL_SEGMENTS.length;
    const firstElementAngle = INITIAL_ROTATION;
    const currentAngle = resultRotation % FULL_ROTATION;
    const angleDiff = currentAngle - firstElementAngle;
    const firstElementRotation = resultRotation - angleDiff;
    const currentSegmentAngle = oneItemAngle * wonItem.index;
    const targetAngle =
      firstElementRotation - FULL_ROTATION * 2 - currentSegmentAngle;

    api.start({ rotation: targetAngle });
  }, [wonItem]); // eslint-disable-line react-hooks/exhaustive-deps

  // Тик активен ТОЛЬКО во время анимации — в idle Pixi ticker не работает
  useTick({
    callback: () => setCurrRotation(springValue.rotation.get()),
    isEnabled: isAnimating,
  });

  const maskShadow = useMemo(() => createMaskForShadow(scale), [scale]);
  const drawSegments = useMemo(
    () => createDrawSegments(WHEEL_SEGMENTS.length),
    [],
  );

  return (
    <pixiContainer scale={scale}>
      <pixiGraphics draw={drawBgBorder} />
      <pixiGraphics draw={drawBg} />
      <pixiContainer>
        <pixiContainer
          x={WHEEL_RADIUS}
          y={WHEEL_RADIUS}
          rotation={currRotation}
        >
          <pixiGraphics draw={drawSegments} />
        </pixiContainer>
        <pixiContainer
          x={WHEEL_RADIUS}
          y={WHEEL_RADIUS}
          rotation={currRotation}
        >
          {WHEEL_SEGMENTS.map((emoji, index) => {
            const transform = SEGMENT_TRANSFORMS[index];
            if (!transform) return null;
            const { rotation, x, y } = transform;
            return (
              <pixiText
                key={index}
                text={emoji}
                anchor={0.5}
                rotation={rotation}
                x={x}
                y={y}
                style={EMOJI_TEXT_STYLE}
              />
            );
          })}
        </pixiContainer>
      </pixiContainer>
      <pixiContainer mask={maskShadow}>
        <pixiGraphics draw={drawShadow} />
      </pixiContainer>
      <pixiGraphics draw={drawCentralShadow} />
      <pixiGraphics draw={drawCentralPointBorder} />
      <pixiGraphics draw={drawCentralPointInner} />
      <pixiGraphics draw={drawPointer} />
    </pixiContainer>
  );
};

export default PixiWheel;
