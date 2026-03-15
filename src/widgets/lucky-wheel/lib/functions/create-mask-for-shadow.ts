import { Graphics } from 'pixi.js';

import { INNER_RADIUS, WHEEL_RADIUS } from '../constants';

export const createMaskForShadow = (scale: number): Graphics =>
  new Graphics()
    .circle(WHEEL_RADIUS * scale, WHEEL_RADIUS * scale, INNER_RADIUS * scale)
    .fill(0xffffff);
