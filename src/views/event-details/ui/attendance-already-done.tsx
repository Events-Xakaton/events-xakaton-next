'use client';

import type { FC } from 'react';

import { APP_SECTION_CARD_CLASS } from '@/shared/lib/ui-styles';

type Props = {
  className?: string;
};

export const AttendanceAlreadyDone: FC<Props> = ({ className }) => (
  <div className={`space-y-2 ${className ?? ''}`}>
    <h3 className="text-lg font-semibold text-neutral-900">Посещаемость</h3>
    <div className={APP_SECTION_CARD_CLASS}>
      <p className="text-sm font-medium text-green-700">
        ✓ Подтверждение отправлено
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Участники получили свои очки опыта.
      </p>
    </div>
  </div>
);
