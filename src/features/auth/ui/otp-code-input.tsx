'use client';

import { FC, useEffect, useRef, useState } from 'react';

const OTP_LENGTH = 6;

type Props = {
  value: string;
  onChange: (next: string) => void;
  error?: string;
  autoFocus?: boolean;
};

function firstEmptyIndex(arr: string[]): number {
  return arr.findIndex((d) => !d);
}

function lastFilledIndex(arr: string[]): number {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (arr[i]) return i;
  }
  return -1;
}

export const OtpCodeInput: FC<Props> = ({
  value,
  onChange,
  error,
  autoFocus,
}) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (!autoFocus) return;
    const firstEmpty = digits.findIndex((d) => !d);
    const idx = firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty;
    refs.current[idx]?.focus();
    refs.current[idx]?.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  function applyAt(index: number, digit: string): void {
    const arr = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');
    arr[index] = digit;
    onChange(arr.join('').replace(/\D/g, '').slice(0, OTP_LENGTH));
  }

  function fillFrom(index: number, chars: string): void {
    const clean = chars.replace(/\D/g, '');
    if (!clean) return;
    const arr = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');
    let cursor = index;
    for (const ch of clean) {
      if (cursor >= OTP_LENGTH) break;
      arr[cursor] = ch;
      cursor += 1;
    }
    onChange(arr.join('').replace(/\D/g, '').slice(0, OTP_LENGTH));
    const nextIdx = Math.min(cursor, OTP_LENGTH - 1);
    refs.current[nextIdx]?.focus();
    refs.current[nextIdx]?.select();
  }

  return (
    <div className="space-y-2">
      <div
        className="mx-auto flex max-w-[320px] justify-center gap-2"
        role="group"
        aria-label="Код подтверждения"
      >
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            maxLength={OTP_LENGTH}
            value={digit}
            onFocus={(e) => {
              setFocusIndex(idx);
              e.currentTarget.select();
            }}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              const clean = raw.replace(/\D/g, '');
              if (!clean) {
                applyAt(idx, '');
                return;
              }
              if (clean.length === 1) {
                const target = firstEmptyIndex(digits);
                const targetIdx = target === -1 ? idx : target;
                applyAt(targetIdx, clean);
                if (targetIdx < OTP_LENGTH - 1) {
                  refs.current[targetIdx + 1]?.focus();
                  refs.current[targetIdx + 1]?.select();
                }
                return;
              }
              const target = firstEmptyIndex(digits);
              fillFrom(target === -1 ? idx : target, clean);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                e.preventDefault();
                const target = lastFilledIndex(digits);
                if (target !== -1) {
                  applyAt(target, '');
                  refs.current[target]?.focus();
                  refs.current[target]?.select();
                }
              }
              if (e.key === 'ArrowLeft' && idx > 0) {
                refs.current[idx - 1]?.focus();
                refs.current[idx - 1]?.select();
              }
              if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
                refs.current[idx + 1]?.focus();
                refs.current[idx + 1]?.select();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const target = firstEmptyIndex(digits);
              fillFrom(
                target === -1 ? idx : target,
                e.clipboardData.getData('text'),
              );
            }}
            className={[
              'h-12 w-11 rounded-lg border text-center text-[22px] font-semibold tabular-nums transition',
              'bg-white/10 text-white outline-none ring-0 shadow-none backdrop-blur-sm',
              'focus:outline-none focus:ring-0 focus:shadow-none',
              'focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none',
              error
                ? 'border-red-400/80 focus:border-red-400 focus:ring-0 focus-visible:ring-0'
                : focusIndex === idx
                  ? 'border-primary-500'
                  : 'border-white/25',
            ].join(' ')}
            aria-invalid={Boolean(error)}
            aria-label={`Цифра ${idx + 1}`}
          />
        ))}
      </div>
      {error ? (
        <p
          id="error-message"
          className="text-center text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};
