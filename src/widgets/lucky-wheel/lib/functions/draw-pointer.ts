import { FillGradient, Graphics } from 'pixi.js';

import { WHEEL_COLORS, WHEEL_RADIUS } from '../constants';

export const drawPointer = (graphics: Graphics): void => {
  const width = 18;
  const height = 35;
  const topInsetY = 3;
  const topCurveLift = 1;
  const pointHeight = Math.round(height * 0.22);
  const rectBottomY = height - pointHeight;
  const cx = width / 2;

  graphics.clear();

  const gradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0, color: WHEEL_COLORS.pointer.start },
      { offset: 1, color: WHEEL_COLORS.pointer.end },
    ],
  });

  graphics.moveTo(0, topInsetY);
  graphics.quadraticCurveTo(cx, topInsetY - topCurveLift, width, topInsetY);
  graphics.lineTo(width, rectBottomY);
  graphics.lineTo(cx, height);
  graphics.lineTo(0, rectBottomY);
  graphics.closePath();
  graphics.fill(gradient);

  graphics.x = WHEEL_RADIUS - width / 2;
};
