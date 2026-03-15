'use client';

import type { FC } from 'react';
import { useState } from 'react';

import { useConfirmAttendanceMutation } from '@/entities/event/api';
import type { PersonRow } from '@/entities/user';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { StarRating } from '@/shared/components/star-rating';
import { getInitials } from '@/shared/lib/utils';

import './styles/attendance-panel.css';

type Presence = 'present' | 'absent';

type Props = {
  eventId: string;
  participants: PersonRow[];
  onDone: () => void;
};

export const AttendancePanel: FC<Props> = ({
  eventId,
  participants,
  onDone,
}) => {
  const [confirmAttendance, { isLoading }] = useConfirmAttendanceMutation();

  const [presence, setPresence] = useState<Record<string, Presence>>(() =>
    Object.fromEntries(participants.map((p) => [p.telegramUserId, 'present'])),
  );
  const [ratings, setRatings] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(participants.map((p) => [p.telegramUserId, null])),
  );
  const [error, setError] = useState<string | null>(null);

  const presentCount = Object.values(presence).filter(
    (v) => v === 'present',
  ).length;

  async function handleSubmit(): Promise<void> {
    setError(null);

    const attendances = participants
      .filter((p) => presence[p.telegramUserId] === 'present')
      .map((p) => ({
        userId: p.userId ?? p.telegramUserId,
        ...(ratings[p.telegramUserId] !== null
          ? { rating: ratings[p.telegramUserId] as number }
          : {}),
      }));

    try {
      await confirmAttendance({ eventId, attendances }).unwrap();
      onDone();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        onDone(); // already confirmed — treat as success
      } else {
        setError('Не удалось отправить. Попробуйте ещё раз.');
      }
    }
  }

  return (
    <div className="attendance-panel space-y-2">
      <h3 className="text-lg font-semibold text-neutral-900">Посещаемость</h3>
      <div className="attendance-panel__card">
        <div className="attendance-panel__header">
          <p className="attendance-panel__header-title">
            ⭐ Подтвердите присутствие и поставьте оценки
          </p>
          <p className="attendance-panel__header-hint">
            Участники получат очки опыта (1 звезда = 1 очко)
          </p>
        </div>

        <div className="attendance-panel__list">
          {participants.map((p) => {
            const isPresent = presence[p.telegramUserId] === 'present';
            return (
              <div key={p.telegramUserId} className="attendance-panel__row">
                <div className="attendance-panel__row-top">
                  <div className="attendance-panel__avatar">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="attendance-panel__avatar-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="attendance-panel__avatar-fallback">
                        {getInitials(p.fullName) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="attendance-panel__name">{p.fullName}</span>
                </div>

                <div className="attendance-panel__row-bottom">
                  <StarRating
                    value={
                      isPresent ? (ratings[p.telegramUserId] ?? null) : null
                    }
                    onChange={
                      isPresent
                        ? (v) =>
                            setRatings((prev) => ({
                              ...prev,
                              [p.telegramUserId]: v,
                            }))
                        : undefined
                    }
                    size="md"
                  />

                  <div className="attendance-panel__toggle">
                    <button
                      type="button"
                      className={`attendance-panel__toggle-btn ${isPresent ? 'attendance-panel__toggle-btn--active' : 'attendance-panel__toggle-btn--inactive'}`}
                      onClick={() =>
                        setPresence((prev) => ({
                          ...prev,
                          [p.telegramUserId]: 'present',
                        }))
                      }
                    >
                      Был
                    </button>
                    <button
                      type="button"
                      className={`attendance-panel__toggle-btn ${!isPresent ? 'attendance-panel__toggle-btn--active' : 'attendance-panel__toggle-btn--inactive'}`}
                      onClick={() =>
                        setPresence((prev) => ({
                          ...prev,
                          [p.telegramUserId]: 'absent',
                        }))
                      }
                    >
                      Не был
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="attendance-panel__footer">
          {error !== null && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}
          <Button
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.LG}
            className="w-full rounded-full"
            isLoading={isLoading}
            disabled={presentCount === 0}
            onClick={() => void handleSubmit()}
          >
            Подтвердить присутствие
          </Button>
        </div>
      </div>
    </div>
  );
};
