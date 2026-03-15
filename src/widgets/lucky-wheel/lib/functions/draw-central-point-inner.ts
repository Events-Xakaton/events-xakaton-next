import { Graphics } from 'pixi.js';

import { WHEEL_COLORS, WHEEL_RADIUS } from '../constants';

export const drawCentralPointInner = (graphics: Graphics): void => {
  graphics.clear();

  graphics.circle(WHEEL_RADIUS, WHEEL_RADIUS, 14);
  graphics.fill(WHEEL_COLORS.centralPoint);
};
