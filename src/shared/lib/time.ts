const DEFAULT_OFFSET_MIN = 120;

function readOffsetMinutes(): number {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return DEFAULT_OFFSET_MIN;
  }
  const raw = window.localStorage.getItem('app_timezone_offset_min');
  if (raw) {
    const value = Number(raw);
    if (Number.isFinite(value)) {
      return Math.max(-720, Math.min(840, Math.trunc(value)));
    }
  }
  const deviceOffset = -new Date().getTimezoneOffset();
  if (Number.isFinite(deviceOffset)) {
    return Math.max(-720, Math.min(840, Math.trunc(deviceOffset)));
  }
  return DEFAULT_OFFSET_MIN;
}

export function formatLocalDateTime(iso: string): string {
  const offset = readOffsetMinutes();
  const sourceMs = new Date(iso).getTime();
  if (!Number.isFinite(sourceMs)) {
    return 'Дата не указана';
  }

  const date = new Date(sourceMs + offset * 60_000);
  if (!Number.isFinite(date.getTime())) {
    return 'Дата не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
}

export function timezoneLabel(): string {
  const offset = readOffsetMinutes();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}
