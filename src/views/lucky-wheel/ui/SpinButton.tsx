'use client';

import { RefreshCw } from 'lucide-react';
import type { FC } from 'react';

type Props = {
  onSpin: () => void;
  disabled: boolean;
  isLoading: boolean;
};

export const SpinButton: FC<Props> = ({ onSpin, disabled, isLoading }) => (
  <button
    type="button"
    className="lucky-wheel__spin-btn"
    disabled={disabled || isLoading}
    onClick={onSpin}
  >
    {isLoading ? (
      <>
        <RefreshCw
          className="mr-2 inline h-4 w-4 animate-spin"
          aria-hidden="true"
        />
        Крутим...
      </>
    ) : (
      'Крутить'
    )}
  </button>
);
