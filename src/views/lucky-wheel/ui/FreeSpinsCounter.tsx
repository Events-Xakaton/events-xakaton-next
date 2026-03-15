'use client';

import type { FC } from 'react';

type Props = {
  count: number;
};

export const FreeSpinsCounter: FC<Props> = ({ count }) => (
  <div className="lucky-wheel__free-spins">
    <span className="lucky-wheel__free-spins-icon" aria-hidden="true">
      🎰
    </span>
    <span className="lucky-wheel__free-spins-text">
      ×{count}{' '}
      {count === 1 ? 'фри-спин' : count < 5 ? 'фри-спина' : 'фри-спинов'}
    </span>
  </div>
);
