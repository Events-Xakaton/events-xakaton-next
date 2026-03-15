'use client';

import { nanoid } from 'nanoid/non-secure';
import type { FC } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';

import { LuckyWheelCanvas } from '@/widgets/lucky-wheel';
import type { WonItem } from '@/widgets/lucky-wheel';

import { SoundType, WheelSoundsContext } from '@/features/wheel-sounds';

import {
  LuckyWheelErrorCode,
  useLazyRandomEventQuery,
  useLuckyWheelStreakQuery,
} from '@/entities/event/api';

import { trackLuckySpin } from '@/shared/observability/telemetry';

import './styles/lucky-wheel.css';
import { EventModal } from './ui/EventModal';
import { FreeSpinsCounter } from './ui/FreeSpinsCounter';
import { SpinButton } from './ui/SpinButton';
import { WeeklyTimer } from './ui/WeeklyTimer';

enum SpinPhase {
  IDLE = 'idle',
  FETCHING = 'fetching',
  SPINNING = 'spinning',
  RESULT = 'result',
  MODAL_OPEN = 'modal_open',
  NO_EVENTS = 'no_events',
  LOCKED = 'locked',
  ERROR = 'error',
}

type Props = {
  onBack: () => void;
  onOpenEvent: (eventId: string) => void;
};

export const LuckyWheelScreen: FC<Props> = ({ onBack, onOpenEvent }) => {
  const { play } = useContext(WheelSoundsContext);

  const [phase, setPhase] = useState<SpinPhase>(SpinPhase.IDLE);
  const [wonItem, setWonItem] = useState<WonItem | null>(null);
  const [resultEventId, setResultEventId] = useState<string | null>(null);
  const [usedFreeSpin, setUsedFreeSpin] = useState(false);

  const [triggerRandom] = useLazyRandomEventQuery();
  const { data: streak, refetch: refetchStreak } = useLuckyWheelStreakQuery();

  // При получении данных стрика определяем начальный статус
  useEffect(() => {
    if (!streak) return;
    const canSpin = !streak.hasUsedWeeklySpin || streak.freeSpinBalance > 0;
    if (!canSpin && phase === SpinPhase.IDLE) {
      setPhase(SpinPhase.LOCKED);
    }
  }, [streak]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnimationRest = useCallback((): void => {
    play(SoundType.BIG_WIN);

    void import('@hiseb/confetti').then(({ default: confetti }) => {
      confetti({
        position: { x: window.innerWidth / 2, y: window.innerHeight * 0.5 },
        count: 120,
        velocity: 200,
        fade: true,
      });
    });

    setTimeout(() => setPhase(SpinPhase.MODAL_OPEN), 1000);
  }, [play]);

  const handleAnimationStart = useCallback((): void => {
    play(SoundType.SPINNING);
  }, [play]);

  const handleSpin = useCallback(async (): Promise<void> => {
    if (phase !== SpinPhase.IDLE && phase !== SpinPhase.ERROR) return;

    play(SoundType.START);
    setPhase(SpinPhase.FETCHING);
    trackLuckySpin('start');

    try {
      const result = await triggerRandom();

      if (result.error) {
        const errData = result.error as {
          status?: number;
          data?: { code?: string };
        };

        if (errData.status === 404) {
          const code = errData.data?.code;
          if (code === LuckyWheelErrorCode.DAILY_LIMIT_REACHED) {
            play(SoundType.FAIL);
            setPhase(SpinPhase.LOCKED);
          } else {
            // NO_ELIGIBLE_EVENTS — возвращаемся в IDLE, пробуем позже
            setPhase(SpinPhase.NO_EVENTS);
          }
        } else {
          play(SoundType.FAIL);
          setPhase(SpinPhase.ERROR);
        }
        return;
      }

      if (result.data?.id) {
        const randomSectorIndex = Math.floor(
          Math.random() * 12, // WHEEL_SEGMENTS.length
        );
        setResultEventId(result.data.id);
        setUsedFreeSpin(result.data.usedFreeSpin);
        setWonItem({ index: randomSectorIndex, uniqId: nanoid() });
        setPhase(SpinPhase.SPINNING);
        trackLuckySpin('result', { eventId: result.data.id });
      }
    } catch {
      play(SoundType.FAIL);
      setPhase(SpinPhase.ERROR);
    }
  }, [phase, play, triggerRandom]);

  const handleModalClose = useCallback((): void => {
    // Пересчитываем состояние на основе обновлённого стрика
    void refetchStreak().then((res) => {
      const s = res.data;
      const canSpin = s ? !s.hasUsedWeeklySpin || s.freeSpinBalance > 0 : false;
      setWonItem(null);
      setPhase(canSpin ? SpinPhase.IDLE : SpinPhase.LOCKED);
    });
  }, [refetchStreak]);

  const handleNavigateToEvent = useCallback(
    (eventId: string): void => {
      onOpenEvent(eventId);
    },
    [onOpenEvent],
  );

  const isSpinning =
    phase === SpinPhase.FETCHING ||
    phase === SpinPhase.SPINNING ||
    phase === SpinPhase.RESULT;

  const canSpin = streak
    ? !streak.hasUsedWeeklySpin || streak.freeSpinBalance > 0
    : true;

  const showFreeSpins =
    !!streak?.hasUsedWeeklySpin && (streak?.freeSpinBalance ?? 0) > 0;

  const showSpinButton =
    phase !== SpinPhase.LOCKED && phase !== SpinPhase.MODAL_OPEN;

  return (
    <div className="lucky-wheel">
      {/* Шапка */}
      <header className="lucky-wheel__header">
        <h1 className="lucky-wheel__title">Колесо фортуны</h1>
      </header>

      {/* Pixi-рулетка */}
      <LuckyWheelCanvas
        wonItem={wonItem}
        onAnimationRest={handleAnimationRest}
        onAnimationStart={handleAnimationStart}
        isFetching={phase === SpinPhase.FETCHING}
      />

      {/* Управление */}
      <div className="lucky-wheel__controls">
        {/* Счётчик фри-спинов */}
        {showFreeSpins && !isSpinning && (
          <FreeSpinsCounter count={streak?.freeSpinBalance ?? 0} />
        )}

        {/* Кнопка «Крутить» */}
        {showSpinButton && (
          <SpinButton
            onSpin={() => void handleSpin()}
            disabled={!canSpin || isSpinning}
            isLoading={isSpinning}
          />
        )}

        {/* Таймер до следующего спина */}
        {phase === SpinPhase.LOCKED && streak && (
          <WeeklyTimer nextWeekKey={streak.nextWeekKey} />
        )}

        {/* Нет подходящих ивентов */}
        {phase === SpinPhase.NO_EVENTS && (
          <div className="lucky-wheel__fallback">
            <span className="lucky-wheel__fallback-icon" aria-hidden="true">
              🌵
            </span>
            <p className="lucky-wheel__fallback-title">
              Нет подходящих ивентов
            </p>
            <p className="lucky-wheel__fallback-desc">
              Все будущие ивенты уже заняты или вы уже участвуете. Загляни
              позже!
            </p>
            <button
              type="button"
              className="lucky-wheel__back-cta"
              onClick={() => setPhase(SpinPhase.IDLE)}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Общая ошибка */}
        {phase === SpinPhase.ERROR && (
          <div className="lucky-wheel__fallback">
            <span className="lucky-wheel__fallback-icon" aria-hidden="true">
              ⚠️
            </span>
            <p className="lucky-wheel__fallback-title">Что-то пошло не так</p>
            <button
              type="button"
              className="lucky-wheel__back-cta"
              onClick={() => setPhase(SpinPhase.IDLE)}
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно с результатом */}
      {phase === SpinPhase.MODAL_OPEN && resultEventId && (
        <EventModal
          eventId={resultEventId}
          usedFreeSpin={usedFreeSpin}
          onNavigate={handleNavigateToEvent}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};
