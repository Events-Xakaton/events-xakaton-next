'use client';

import { createContext } from 'react';

import type { SoundType } from '../lib';

export type WheelSoundsContextType = {
  play: (sound: SoundType) => void;
};

export const WheelSoundsContext = createContext<WheelSoundsContextType>({
  play: () => {},
});
