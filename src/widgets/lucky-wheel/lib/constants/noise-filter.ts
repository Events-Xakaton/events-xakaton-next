import { NoiseFilter } from 'pixi.js';

// Создаётся один раз на уровне модуля — безопасно, т.к. этот файл
// импортируется только из PixiWheel.tsx, который загружается с ssr: false.
// Минимальный шум — только для лёгкой текстуры, не влияет на чёткость
export const noiseFilter = new NoiseFilter({ noise: 0.02 });
