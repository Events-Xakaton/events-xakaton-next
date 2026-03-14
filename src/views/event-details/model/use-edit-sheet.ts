'use client';

import { useEffect, useState } from 'react';

// Должно совпадать с длительностью CSS-анимации transform в event-edit-sheet.css
export const SHEET_ANIMATION_MS = 220;

export type UseEditSheetResult = {
  isMounted: boolean;
  isActive: boolean;
  open: () => void;
  close: () => void;
};

export function useEditSheet(): UseEditSheetResult {
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  function open(): void {
    setIsMounted(true);
    requestAnimationFrame(() => {
      setIsActive(true);
    });
  }

  function close(): void {
    setIsActive(false);
    window.setTimeout(() => {
      setIsMounted(false);
    }, SHEET_ANIMATION_MS);
  }

  // Блокируем прокрутку страницы пока шит открыт
  useEffect(() => {
    if (!isMounted || typeof document === 'undefined') return;

    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = documentElement.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [isMounted]);

  return { isMounted, isActive, open, close };
}
