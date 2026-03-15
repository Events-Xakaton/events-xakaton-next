'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Минимальное число уникальных ивентов, просмотренных в окне для активации механики */
export const LUCKY_MIN_VIEWED_EVENTS = 9;
/** Временное окно в мс: все N ивентов должны попасть в viewport за этот период */
export const LUCKY_TRIGGER_WINDOW_MS = 3000;
/** Размер окна ближайших кандидатов для серверного выбора (передаётся как справочная константа) */
export const LUCKY_K_NEAREST = 5;

type UseLuckyTriggerOptions = { disabled?: boolean };

type UseLuckyTriggerResult = {
  isTriggered: boolean;
  /** Передать в `ref` контейнера ленты (заменяет обычный feedScrollRef) */
  setScrollContainer: (el: HTMLDivElement | null) => void;
  /** Прямая ссылка на контейнер — для scrollTo и прочих императивных операций */
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  reset: () => void;
};

/**
 * Хук детектора секретного триггера «Мне повезёт».
 *
 * Отслеживает, сколько уникальных карточек ивентов пользователь просмотрел
 * (≥50% visibility) в пределах LUCKY_TRIGGER_WINDOW_MS мс.
 * Когда порог LUCKY_MIN_VIEWED_EVENTS достигнут, выставляет isTriggered = true.
 *
 * Каждый элемент карточки должен иметь атрибут data-event-id.
 *
 * Когда `disabled=true` — наблюдатели не создаются, возвращаются инертные значения.
 */
export function useLuckyTrigger(
  options: UseLuckyTriggerOptions = {},
): UseLuckyTriggerResult {
  const { disabled = false } = options;

  const [isTriggered, setIsTriggered] = useState(false);
  const triggeredRef = useRef(false);
  const viewRecords = useRef<Array<{ eventId: string; ts: number }>>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const moRef = useRef<MutationObserver | null>(null);

  const onIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (triggeredRef.current) return;

    const now = Date.now();
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const eventId = (entry.target as HTMLElement).dataset['eventId'];
      if (!eventId) continue;
      viewRecords.current.push({ eventId, ts: now });
    }

    // Отсекаем записи за пределами временного окна
    const cutoff = now - LUCKY_TRIGGER_WINDOW_MS;
    viewRecords.current = viewRecords.current.filter((r) => r.ts >= cutoff);

    const uniqueIds = new Set(viewRecords.current.map((r) => r.eventId));
    if (uniqueIds.size >= LUCKY_MIN_VIEWED_EVENTS) {
      triggeredRef.current = true;
      setIsTriggered(true);
      // Отключаем наблюдатели сразу после срабатывания — больше не нужны
      ioRef.current?.disconnect();
      moRef.current?.disconnect();
    }
  }, []);

  const setupObservers = useCallback(
    (container: HTMLDivElement) => {
      // Не создаём наблюдатели если триггер отключён
      if (disabled) return;

      ioRef.current?.disconnect();
      moRef.current?.disconnect();

      const io = new IntersectionObserver(onIntersection, { threshold: 0.5 });
      ioRef.current = io;

      const observeIfCard = (el: Element): void => {
        if ((el as HTMLElement).dataset['eventId']) io.observe(el);
      };

      container.querySelectorAll('[data-event-id]').forEach(observeIfCard);

      // Следим за новыми карточками (подгрузка, смена фильтра)
      const mo = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            observeIfCard(node);
            node.querySelectorAll('[data-event-id]').forEach(observeIfCard);
          }
        }
      });
      mo.observe(container, { childList: true, subtree: true });
      moRef.current = mo;
    },
    [disabled, onIntersection],
  );

  useEffect(() => {
    return () => {
      ioRef.current?.disconnect();
      moRef.current?.disconnect();
    };
  }, []);

  const setScrollContainer = useCallback(
    (el: HTMLDivElement | null) => {
      scrollContainerRef.current = el;
      if (el) setupObservers(el);
    },
    [setupObservers],
  );

  const reset = useCallback(() => {
    triggeredRef.current = false;
    viewRecords.current = [];
    setIsTriggered(false);
  }, []);

  return { isTriggered, setScrollContainer, scrollContainerRef, reset };
}
