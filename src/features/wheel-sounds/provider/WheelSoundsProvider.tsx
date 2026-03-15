'use client';

import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

import { SoundType } from '../lib';
import { WheelSoundsContext } from '../model';

type SoundsMap = Record<
  SoundType,
  { play: () => void; stop?: () => void } | null
>;

export const WheelSoundsProvider: FC<PropsWithChildren> = ({ children }) => {
  const soundsRef = useRef<SoundsMap>({
    [SoundType.BIG_WIN]: null,
    [SoundType.FAIL]: null,
    [SoundType.SPINNING]: null,
    [SoundType.START]: null,
  });

  useEffect(() => {
    // Инициализируем звуки только на клиенте — @pixi/sound требует Web Audio API
    void import('@pixi/sound').then(({ Sound }) => {
      soundsRef.current = {
        [SoundType.BIG_WIN]: Sound.from({
          url: '/sounds/big-win.mp3',
          volume: 0.3,
          preload: true,
        }),
        [SoundType.FAIL]: Sound.from({
          url: '/sounds/fail.mp3',
          volume: 0.3,
          preload: true,
        }),
        [SoundType.SPINNING]: Sound.from({
          url: '/sounds/spinning.mp3',
          volume: 0.2,
          preload: true,
          speed: 0.7,
        }),
        [SoundType.START]: Sound.from({
          url: '/sounds/start.wav',
          volume: 0.3,
          preload: true,
          speed: 0.9,
        }),
      };
    });
  }, []);

  function play(sound: SoundType): void {
    soundsRef.current[sound]?.play();
  }

  return <WheelSoundsContext value={{ play }}>{children}</WheelSoundsContext>;
};
