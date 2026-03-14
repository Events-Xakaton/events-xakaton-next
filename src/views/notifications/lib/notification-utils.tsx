import { ReactElement } from 'react';

import { type NotificationItem } from '@/shared/api/notifications-api';
import { formatLocalDateTime } from '@/shared/lib/time';

export type ParsedEventChanged = {
  eventName: string | null;
  nextTime: string | null;
  nextLocation: string | null;
};

export function renderMarkedText(text: string): ReactElement[] {
  const chunks = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return chunks.map((chunk, index) => {
    const isStrong = chunk.startsWith('**') && chunk.endsWith('**');
    if (!isStrong) {
      return (
        <span key={`plain-${index}`} className="text-neutral-700">
          {chunk}
        </span>
      );
    }
    return (
      <span key={`strong-${index}`} className="font-semibold text-neutral-900">
        {chunk.slice(2, -2)}
      </span>
    );
  });
}

export function parseEventChangedText(text: string): ParsedEventChanged {
  const eventNameMatch = text.match(/\*\*([^*]+)\*\*/);
  const nextTimeMatch = text.match(/новое\s+время\s*[—:-]\s*\*\*([^*]+)\*\*/i);
  const nextLocationMatch = text.match(
    /новая\s+локация\s*[—:-]\s*\*\*([^*]+)\*\*/i,
  );

  return {
    eventName: eventNameMatch?.[1]?.trim() ?? null,
    nextTime: nextTimeMatch?.[1]?.trim() ?? null,
    nextLocation: nextLocationMatch?.[1]?.trim() ?? null,
  };
}

export function formatNotificationEventTime(value: string): string {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatLocalDateTime(value);
  }
  return value;
}

export function renderEventChangedText(item: NotificationItem): ReactElement {
  const parsed = parseEventChangedText(item.preview);
  if (!parsed.eventName && !parsed.nextTime && !parsed.nextLocation) {
    return (
      <p className="mt-1 text-[15px] leading-5">
        {renderMarkedText(item.preview)}
      </p>
    );
  }

  return (
    <div className="mt-1 space-y-1">
      {parsed.eventName ? (
        <p className="text-[15px] font-semibold leading-5 text-neutral-900">
          {parsed.eventName}
        </p>
      ) : null}
      {parsed.nextTime ? (
        <p className="text-[15px] leading-5 text-neutral-700">
          Новое время:{' '}
          <span className="font-semibold text-neutral-900">
            {formatNotificationEventTime(parsed.nextTime)}
          </span>
        </p>
      ) : null}
      {parsed.nextLocation ? (
        <p className="text-[15px] leading-5 text-neutral-700">
          Новая локация:{' '}
          <span className="font-semibold text-neutral-900">
            {parsed.nextLocation}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function renderMemberJoinedText(item: NotificationItem): ReactElement {
  const values = Array.from(item.preview.matchAll(/\*\*([^*]+)\*\*/g))
    .map((m) => m[1]?.trim())
    .filter(Boolean) as string[];

  if (values.length < 2) {
    return (
      <p className="mt-1 text-[15px] leading-5">
        {renderMarkedText(item.preview)}
      </p>
    );
  }

  const [userName, entityName] = values;
  const joinedLabel =
    item.targetType === 'club'
      ? 'присоединился к клубу'
      : 'присоединился к ивенту';

  return (
    <p className="mt-1 text-[15px] leading-5 text-neutral-700">
      <span className="font-semibold text-neutral-900">{userName}</span>{' '}
      {joinedLabel}{' '}
      <span className="font-semibold text-neutral-900">{entityName}</span>
    </p>
  );
}
