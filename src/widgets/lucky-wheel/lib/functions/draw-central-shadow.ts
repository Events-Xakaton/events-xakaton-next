import { BlurFilter, Graphics } from 'pixi.js';

import { WHEEL_RADIUS } from '../constants';

export const drawCentralShadow = (graphics: Graphics): void => {
  graphics.clear();

  graphics.circle(WHEEL_RADIUS - 5, WHEEL_RADIUS + 5, 17).fill(0x000000);
  graphics.filters = [new BlurFilter(12)];
  graphics.blendMode = 'multiply';
};
