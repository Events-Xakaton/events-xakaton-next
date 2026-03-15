import type { Graphics } from 'pixi.js';

import { INNER_RADIUS, WHEEL_COLORS } from '../constants';

// Нечётные (светлые) сегменты чуть прозрачнее — создаёт глубину без тёмных цветов
const SEGMENT_ALPHAS = [0.92, 0.72, 0.92, 0.72];

export const createDrawSegments =
  (n: number) =>
  (graphics: Graphics): void => {
    const segmentColors = WHEEL_COLORS.segments;
    const startAngle = Math.PI / n;

    graphics.clear();

    if (n === 0) return;

    const delta = (Math.PI * 2) / n;

    for (let i = 0; i < n; i++) {
      const a0 = startAngle + i * delta;
      const a1 = a0 + delta;

      graphics.moveTo(0, 0);
      graphics.arc(0, 0, INNER_RADIUS, a0, a1);

      const colorIndex = i % segmentColors.length;
      let color: string = segmentColors[colorIndex] as string;
      const alpha: number = SEGMENT_ALPHAS[colorIndex] ?? 0.92;

      // Если последняя итерация и цвет совпадает с первым — меняем
      const nextIndex = i + 1;
      if (nextIndex === n) {
        const firstColor = segmentColors[0];
        if (color === firstColor) {
          color = segmentColors[
            (nextIndex + 1) % segmentColors.length
          ] as string;
        }
      }

      graphics.fill({ color, alpha });
      graphics.closePath();
    }
  };
