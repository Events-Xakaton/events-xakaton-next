'use client';

import { useEffect, useState } from 'react';

/**
 * Возвращает true, когда страница прокручена дальше порогового значения.
 * Используется для показа компактного sticky-хедера поверх контента.
 */
export function useCompactHeader(threshold = 170): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return show;
}
