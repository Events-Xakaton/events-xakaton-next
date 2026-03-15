import { BlurFilter, Graphics } from 'pixi.js';

import { INNER_RADIUS, WHEEL_RADIUS } from '../constants';

export const drawShadow = (graphics: Graphics): void => {
  graphics.clear();

  graphics.circle(WHEEL_RADIUS, WHEEL_RADIUS + 15, INNER_RADIUS + 15).stroke({
    width: 24,
    color: 0x000000,
    alpha: 1,
  });
  graphics.filters = [new BlurFilter(10)];
  graphics.blendMode = 'multiply';
};
