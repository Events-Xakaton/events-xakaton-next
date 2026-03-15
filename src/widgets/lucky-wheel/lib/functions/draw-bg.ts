import { FillGradient, Graphics } from 'pixi.js';

import { WHEEL_COLORS, WHEEL_RADIUS } from '../constants';

export const drawBg = (graphics: Graphics): void => {
  graphics.clear();

  const gradient = new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [
      { offset: 0, color: WHEEL_COLORS.background.start },
      { offset: 1, color: WHEEL_COLORS.background.end },
    ],
  });

  graphics.circle(WHEEL_RADIUS, WHEEL_RADIUS, 181);
  // alpha: 0.92 — белая карточка слегка просвечивает, убирает «глухоту» тёмного фона
  graphics.fill({ fill: gradient, alpha: 0.92 });
};
