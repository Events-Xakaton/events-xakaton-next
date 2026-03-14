'use client';

import { Plus } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/utils';

type Props = {
  onClick: () => void;
};

export const CreateEventCard: FC<Props> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'snap-start snap-always w-[min(85vw,320px)] h-[240px] shrink-0',
        'rounded-2xl border-2 border-dashed border-neutral-300',
        'bg-transparent hover:bg-white/10',
        'flex flex-col items-center justify-center gap-3',
        'transition-all duration-200',
      )}
      aria-label="Создать новое событие"
    >
      <div className="rounded-full bg-primary-100 p-4">
        <Plus className="h-8 w-8 text-primary-600" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">Создать ивент</p>
      <p className="text-sm text-neutral-600">Запланируй новое событие</p>
    </button>
  );
};
