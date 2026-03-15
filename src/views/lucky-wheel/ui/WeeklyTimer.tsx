'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

type Props = {
  nextWeekKey: string;
};

function formatCountdown(nextWeekKey: string): string {
  const target = new Date(nextWeekKey).getTime();
  const diff = Math.max(0, target - Date.now());
  const totalMins = Math.floor(diff / 60_000);
  const days = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const minutes = totalMins % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}д`);
  if (hours > 0) parts.push(`${hours}ч`);
  parts.push(`${minutes}м`);
  return parts.join(' ');
}

function formatResetDate(nextWeekKey: string): string {
  const date = new Date(nextWeekKey);
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export const WeeklyTimer: FC<Props> = ({ nextWeekKey }) => {
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(nextWeekKey),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(formatCountdown(nextWeekKey));
    }, 60_000);
    return () => clearInterval(id);
  }, [nextWeekKey]);

  return (
    <div className="lucky-wheel__fallback">
      <span className="lucky-wheel__fallback-icon" aria-hidden="true">
        ⏳
      </span>
      <p className="lucky-wheel__fallback-title">Спин раз в неделю</p>
      <p className="lucky-wheel__fallback-desc">
        Следующий сброс — {formatResetDate(nextWeekKey)}
      </p>
      <p className="lucky-wheel__fallback-countdown">{countdown}</p>
    </div>
  );
};
