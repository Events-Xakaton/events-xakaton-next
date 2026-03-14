'use client';

import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  LuckyWheelErrorCode,
  useEventDetailsQuery,
  useLazyRandomEventQuery,
} from '@/entities/event/api';

import { trackLuckySpin } from '@/shared/observability/telemetry';

import './styles/lucky-wheel.css';

// ─── Колесо: визуальные параметры ───────────────────────────────────────────

const SECTOR_COUNT = 8;
const SECTOR_COLORS = [
  '#7C3AED',
  '#EC4899',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
];
const SECTOR_EMOJIS = ['✨', '🎯', '🚀', '🎪', '🎭', '🔥', '💫', '🌟'];
const WHEEL_SIZE = 300;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const R = 136;
const INNER_R = 22;
const SECTOR_ANGLE = 360 / SECTOR_COUNT;

// ─── Геометрия SVG ───────────────────────────────────────────────────────────

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    `M ${cx} ${cy}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// ─── Определяем сектор для посадки по eventId ────────────────────────────────

function getSectorIndex(eventId: string): number {
  let hash = 0;
  for (let i = 0; i < eventId.length; i += 1) {
    hash = ((hash * 31 + eventId.charCodeAt(i)) >>> 0) & 0xffffffff;
  }
  return Math.abs(hash) % SECTOR_COUNT;
}

// ─── Типы состояния колеса ────────────────────────────────────────────────────

enum SpinPhase {
  IDLE = 'idle',
  FETCHING = 'fetching',
  SPINNING = 'spinning',
  STOPPING = 'stopping',
  RESULT = 'result',
  NO_EVENTS = 'no_events',
  DAILY_LIMIT = 'daily_limit',
  ERROR = 'error',
}

// ─── Подкомпонент: SVG колесо ────────────────────────────────────────────────

type WheelSvgProps = {
  diskRef: React.RefObject<HTMLDivElement | null>;
};

const WheelSvg: FC<WheelSvgProps> = ({ diskRef }) => (
  <div className="lucky-wheel__stage">
    {/* Внешнее свечение */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background:
          'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
        transform: 'scale(1.15)',
      }}
    />

    {/* Диск — вращается через ref */}
    <div ref={diskRef} className="lucky-wheel__disk-wrapper">
      <svg
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        aria-hidden="true"
      >
        {Array.from({ length: SECTOR_COUNT }, (_, i) => {
          const start = i * SECTOR_ANGLE;
          const end = (i + 1) * SECTOR_ANGLE;
          const midAngle = start + SECTOR_ANGLE / 2;
          const labelPos = polarToCartesian(CX, CY, R * 0.68, midAngle);
          return (
            <g key={i}>
              <path
                d={sectorPath(CX, CY, R, start, end)}
                fill={SECTOR_COLORS[i]}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="18"
              >
                {SECTOR_EMOJIS[i]}
              </text>
            </g>
          );
        })}
        {/* Внутренний круг */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R + 4}
          fill="rgba(30,19,51,0.85)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
      </svg>
    </div>

    {/* Блестящий центральный камень */}
    <div className="lucky-wheel__center-gem" aria-hidden="true" />

    {/* Указатель сверху */}
    <div className="lucky-wheel__indicator" aria-hidden="true">
      <svg width="24" height="20" viewBox="0 0 24 20">
        <polygon points="12,0 0,20 24,20" fill="#ffffff" opacity="0.95" />
        <polygon points="12,4 3,20 21,20" fill="#7c3aed" />
      </svg>
    </div>
  </div>
);

// ─── Подкомпонент: карточка результата ───────────────────────────────────────

type ResultCardProps = {
  eventId: string;
  onOpenEvent: (id: string) => void;
};

const ResultCard: FC<ResultCardProps> = ({ eventId, onOpenEvent }) => {
  const { data: event } = useEventDetailsQuery({ eventId });

  return (
    <div className="lucky-wheel__result-card">
      <p className="lucky-wheel__result-label">Выбрано для тебя</p>
      {event ? (
        <>
          <p className="lucky-wheel__result-title">{event.title}</p>
          {event.startsAtUtc ? (
            <p className="lucky-wheel__result-meta">
              {new Date(event.startsAtUtc).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          ) : null}
        </>
      ) : (
        <p className="lucky-wheel__result-title">Ивент найден!</p>
      )}
      <button
        type="button"
        className="lucky-wheel__open-btn"
        onClick={() => {
          trackLuckySpin('open_event', { eventId });
          onOpenEvent(eventId);
        }}
      >
        Открыть ивент
        <ChevronRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

// ─── Главный экран ────────────────────────────────────────────────────────────

type Props = {
  onBack: () => void;
  onOpenEvent: (eventId: string) => void;
};

export const LuckyWheelScreen: FC<Props> = ({ onBack, onOpenEvent }) => {
  const [phase, setPhase] = useState<SpinPhase>(SpinPhase.IDLE);
  const [resultEventId, setResultEventId] = useState<string | null>(null);
  const diskRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const rafIdRef = useRef<number>(0);
  // Минимальное время вращения до начала торможения (мс)
  const MIN_SPIN_MS = 1800;
  const spinStartRef = useRef<number>(0);
  const pendingEventIdRef = useRef<string | null>(null);

  const [triggerRandom] = useLazyRandomEventQuery();

  // ─── Анимация: непрерывное вращение (rAF) ──────────────────────────────────

  const startFastSpin = useCallback(() => {
    const spin = (): void => {
      rotationRef.current += 6;
      if (diskRef.current) {
        diskRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
      rafIdRef.current = requestAnimationFrame(spin);
    };
    spinStartRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(spin);
  }, []);

  // ─── Анимация: торможение до заданного сектора ─────────────────────────────

  const stopAtSector = useCallback((eventId: string): void => {
    cancelAnimationFrame(rafIdRef.current);

    const sectorIndex = getSectorIndex(eventId);
    // Чтобы сектор i оказался под указателем (вверху), диск должен повернуться так,
    // что центр сектора i окажется в 0°. Центр сектора = (i + 0.5) * SECTOR_ANGLE.
    // Формула: targetMod = (360 - (i + 0.5) * SECTOR_ANGLE) % 360
    const targetMod = (360 - (sectorIndex + 0.5) * SECTOR_ANGLE + 360) % 360;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const extraToTarget = (targetMod - currentMod + 360) % 360;
    const finalRotation = rotationRef.current + extraToTarget + 3 * 360;

    if (diskRef.current) {
      diskRef.current.style.transition =
        'transform 2.2s cubic-bezier(0.17, 0.67, 0.05, 1.0)';
      diskRef.current.style.transform = `rotate(${finalRotation}deg)`;
    }

    rotationRef.current = finalRotation;

    setTimeout(() => {
      if (diskRef.current) diskRef.current.style.transition = '';
      setResultEventId(eventId);
      setPhase(SpinPhase.RESULT);
      trackLuckySpin('result', { eventId });
    }, 2300);
  }, []);

  // ─── Проверяем: получили ли результат и прошло ли минимальное время ─────────

  useEffect(() => {
    if (phase !== SpinPhase.SPINNING) return;
    if (!pendingEventIdRef.current) return;

    const elapsed = performance.now() - spinStartRef.current;
    const remaining = Math.max(0, MIN_SPIN_MS - elapsed);

    const timerId = setTimeout(() => {
      if (pendingEventIdRef.current) {
        setPhase(SpinPhase.STOPPING);
        stopAtSector(pendingEventIdRef.current);
        pendingEventIdRef.current = null;
      }
    }, remaining);

    return () => clearTimeout(timerId);
  }, [phase, stopAtSector]);

  // ─── Очистка rAF при unmount ────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // ─── Обработчик кнопки «Запустить» ─────────────────────────────────────────

  const handleSpin = useCallback(async (): Promise<void> => {
    if (phase !== SpinPhase.IDLE && phase !== SpinPhase.ERROR) return;

    setPhase(SpinPhase.FETCHING);
    trackLuckySpin('start');
    startFastSpin();
    setPhase(SpinPhase.SPINNING);

    try {
      const result = await triggerRandom();

      if (result.error) {
        const errData = result.error as {
          status?: number;
          data?: { code?: string };
        };
        cancelAnimationFrame(rafIdRef.current);

        if (errData.status === 404) {
          const code = errData.data?.code;
          if (code === LuckyWheelErrorCode.DAILY_LIMIT_REACHED) {
            setPhase(SpinPhase.DAILY_LIMIT);
          } else {
            setPhase(SpinPhase.NO_EVENTS);
          }
        } else {
          setPhase(SpinPhase.ERROR);
        }
        return;
      }

      if (result.data?.id) {
        pendingEventIdRef.current = result.data.id;
        // Эффект выше подхватит pendingEventIdRef и запустит stopAtSector
      }
    } catch {
      cancelAnimationFrame(rafIdRef.current);
      setPhase(SpinPhase.ERROR);
    }
  }, [phase, startFastSpin, triggerRandom]);

  const isSpinning =
    phase === SpinPhase.FETCHING ||
    phase === SpinPhase.SPINNING ||
    phase === SpinPhase.STOPPING;

  return (
    <div className="lucky-wheel">
      {/* Шапка */}
      <header className="lucky-wheel__header">
        <button
          type="button"
          className="lucky-wheel__back-btn"
          aria-label="Назад"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="lucky-wheel__title">Колесо фортуны</h1>
        <div className="w-11" aria-hidden="true" />
      </header>

      {/* Колесо */}
      <WheelSvg diskRef={diskRef} />

      {/* Управление */}
      <div className="lucky-wheel__controls">
        {/* Кнопка запуска — видна когда не показывается результат или fallback */}
        {phase !== SpinPhase.RESULT &&
        phase !== SpinPhase.NO_EVENTS &&
        phase !== SpinPhase.DAILY_LIMIT ? (
          <button
            type="button"
            className="lucky-wheel__spin-btn"
            disabled={isSpinning}
            onClick={() => void handleSpin()}
          >
            {isSpinning ? (
              <>
                <RefreshCw
                  className="mr-2 inline h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Крутим...
              </>
            ) : (
              'Запустить'
            )}
          </button>
        ) : null}

        {/* Результат */}
        {phase === SpinPhase.RESULT && resultEventId ? (
          <ResultCard eventId={resultEventId} onOpenEvent={onOpenEvent} />
        ) : null}

        {/* Нет подходящих ивентов */}
        {phase === SpinPhase.NO_EVENTS ? (
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
              onClick={onBack}
            >
              Вернуться в ленту
            </button>
          </div>
        ) : null}

        {/* Дневной лимит */}
        {phase === SpinPhase.DAILY_LIMIT ? (
          <div className="lucky-wheel__fallback">
            <span className="lucky-wheel__fallback-icon" aria-hidden="true">
              ⏳
            </span>
            <p className="lucky-wheel__fallback-title">
              Уже использовано сегодня
            </p>
            <p className="lucky-wheel__fallback-desc">
              Механика доступна один раз в день. Возвращайся завтра после 00:00
              UTC!
            </p>
            <button
              type="button"
              className="lucky-wheel__back-cta"
              onClick={onBack}
            >
              Вернуться в ленту
            </button>
          </div>
        ) : null}

        {/* Общая ошибка */}
        {phase === SpinPhase.ERROR ? (
          <p className="text-center text-sm text-red-400">
            Что-то пошло не так. Попробуй ещё раз.
          </p>
        ) : null}
      </div>
    </div>
  );
};
