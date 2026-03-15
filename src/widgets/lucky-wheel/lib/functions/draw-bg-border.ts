import { FillGradient, Graphics } from 'pixi.js';

import { WHEEL_COLORS, WHEEL_RADIUS } from '../constants';

export const drawBgBorder = (graphics: Graphics): void => {
  graphics.clear();

  const gradient = new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [
      { offset: 0, color: WHEEL_COLORS.backgroundBorder.start },
      { offset: 1, color: WHEEL_COLORS.backgroundBorder.end },
    ],
  });

  graphics.circle(WHEEL_RADIUS, WHEEL_RADIUS, 182);
  graphics.fill(gradient);
};
