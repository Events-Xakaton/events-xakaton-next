'use client';

import type { FC } from 'react';

import { useEventDetailsQuery } from '@/entities/event/api';

import { formatLocalDateTime } from '@/shared/lib/time';

type Props = {
  eventId: string;
  usedFreeSpin: boolean;
  onNavigate: (eventId: string) => void;
  onClose: () => void;
};

export const EventModal: FC<Props> = ({
  eventId,
  usedFreeSpin,
  onNavigate,
  onClose,
}) => {
  const { data: event } = useEventDetailsQuery({ eventId });

  return (
    <div className="lucky-wheel__modal-backdrop" onClick={onClose}>
      <div className="lucky-wheel__modal" onClick={(e) => e.stopPropagation()}>
        <p className="lucky-wheel__modal-headline">🎉 Вам досталось событие!</p>

        {event ? (
          <>
            <p className="lucky-wheel__modal-title">{event.title}</p>
            <p className="lucky-wheel__modal-meta">
              {formatLocalDateTime(event.startsAtUtc)}
              {event.clubTitle ? ` · ${event.clubTitle}` : ''}
            </p>
          </>
        ) : (
          <>
            <div className="lucky-wheel__modal-skeleton lucky-wheel__modal-skeleton--title" />
            <div className="lucky-wheel__modal-skeleton lucky-wheel__modal-skeleton--meta" />
          </>
        )}

        <div className="lucky-wheel__modal-hint">
          💡 Вы можете записаться без ограничений уровня
        </div>

        {usedFreeSpin && (
          <div className="lucky-wheel__modal-freespin-badge">
            🎰 Использован фри-спин
          </div>
        )}

        <button
          type="button"
          className="lucky-wheel__modal-btn lucky-wheel__modal-btn--primary"
          onClick={() => onNavigate(eventId)}
        >
          Перейти к событию
        </button>
        <button
          type="button"
          className="lucky-wheel__modal-btn lucky-wheel__modal-btn--secondary"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
