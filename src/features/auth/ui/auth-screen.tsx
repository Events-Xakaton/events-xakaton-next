'use client';

import { Trophy } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

import {
  useRequestCodeMutation,
  useVerifyCodeMutation,
} from '@/features/auth/api';
import { setVerified } from '@/features/auth/model/auth-slice';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardPadding,
  CardVariant,
} from '@/shared/components/card';
import { Input } from '@/shared/components/input';
import { saveAuthSession } from '@/shared/lib/auth-session';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_BOTTOM,
  SAFE_AREA_TOP,
} from '@/shared/lib/ui-styles';
import { appErrorText } from '@/shared/lib/utils';
import { useAppDispatch } from '@/shared/store/hooks';

const OTP_LENGTH = 6;

function OtpCodeInput({
  value,
  onChange,
  error,
  autoFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  error?: string;
  autoFocus?: boolean;
}) {
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  function firstEmptyIndex(arr: string[]) {
    return arr.findIndex((d) => !d);
  }

  function lastFilledIndex(arr: string[]) {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (arr[i]) return i;
    }
    return -1;
  }

  useEffect(() => {
    if (!autoFocus) return;
    const firstEmpty = digits.findIndex((d) => !d);
    const idx = firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty;
    refs.current[idx]?.focus();
    refs.current[idx]?.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  function applyAt(index: number, digit: string) {
    const arr = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');
    arr[index] = digit;
    onChange(arr.join('').replace(/\D/g, '').slice(0, OTP_LENGTH));
  }

  function fillFrom(index: number, chars: string) {
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
}

/**
 * AuthScreen - Messenger Verification Flow
 *
 * Two-step authentication:
 * 1. Enter User ID
 * 2. Verify OTP code sent via messenger
 *
 * Mobile-first, accessible, with proper error handling.
 */
export function AuthScreen() {
  const dispatch = useAppDispatch();
  const [reddyUserKey, setReddyUserKey] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [resendLeftSec, setResendLeftSec] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [requestCode, requestState] = useRequestCodeMutation();
  const [verifyCode, verifyState] = useVerifyCodeMutation();
  const [lastAutoSubmittedOtp, setLastAutoSubmittedOtp] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (resendLeftSec <= 0) return;
    const timer = window.setTimeout(
      () => setResendLeftSec((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendLeftSec]);

  async function onRequestCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await requestCode({ reddyUserKey }).unwrap();
      setStep(2);
      setResendLeftSec(result.ttlSec || 60);
      setSuccess('');
    } catch (err) {
      setError(
        appErrorText(
          err,
          'Сервис временно недоступен. Повторите через минуту.',
        ),
      );
    }
  }

  async function submitVerifyCode(code: string) {
    setError('');
    setSuccess('');

    try {
      await verifyCode({ reddyUserKey, code }).unwrap();
      saveAuthSession(reddyUserKey);
      dispatch(setVerified({ reddyUserKey }));
    } catch (err) {
      setError('Код неверный или истек.');
    }
  }

  async function onVerifyCode(e: FormEvent) {
    e.preventDefault();
    await submitVerifyCode(otp);
  }

  async function onResendCode() {
    setError('');
    setSuccess('');

    try {
      const result = await requestCode({ reddyUserKey }).unwrap();
      setResendLeftSec(result.ttlSec || 60);
      setSuccess('Код отправлен повторно.');
    } catch (err) {
      setError(appErrorText(err, 'Не удалось отправить код повторно'));
    }
  }

  const canRequestCode = reddyUserKey.length >= 6 && resendLeftSec === 0;
  const canVerifyCode = otp.length === OTP_LENGTH;
  const canResend = resendLeftSec === 0;

  useEffect(() => {
    if (step !== 2) return;
    if (otp.length < OTP_LENGTH) {
      setLastAutoSubmittedOtp('');
      return;
    }
    if (verifyState.isLoading) return;
    if (otp === lastAutoSubmittedOtp) return;

    setLastAutoSubmittedOtp(otp);
    void submitVerifyCode(otp);
  }, [step, otp, verifyState.isLoading, lastAutoSubmittedOtp]);

  return (
    <div
      className="mx-auto flex w-full max-w-md items-center px-4 py-8"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingTop: SAFE_AREA_TOP,
        paddingBottom: SAFE_AREA_BOTTOM,
      }}
    >
      <Card variant={CardVariant.ELEVATED} padding={CardPadding.LG} className="w-full">
        <CardHeader>
          {/* Logo/Icon - Integration Visual */}
          <div
            className="mx-auto mb-4 relative flex items-center justify-center"
            style={{ width: '104px', height: '56px' }}
          >
            {/* Messenger Logo - Left Circle (behind) */}
            <img
              src="/some-logo-flipped.svg"
              alt="Мессенджер"
              className="absolute left-0 h-14 w-14 rounded-full border-[3px] border-white shadow-lg"
              aria-hidden="true"
            />

            {/* Y Events Logo - Right Circle (overlapping, in front) */}
            <div className="absolute right-0 h-14 w-14 grid place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 border-[3px] border-white">
              <Trophy className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          {/* Title */}
          <CardTitle as="h1" className="text-center text-3xl font-display">
            Y Events
          </CardTitle>

          <CardDescription className="text-center py-4">
            {step === 1 ? (
              <>
                Укажите ваш ID из красного мессенджера
                <br />
                чтобы продолжить
              </>
            ) : (
              'Введите код из красного мессенджера'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Enter User ID */}
          {step === 1 ? (
            <form onSubmit={onRequestCode} className="space-y-4">
              <Input
                id="reddy-user-key"
                type="text"
                inputMode="numeric"
                placeholder="00000000000"
                value={reddyUserKey}
                onChange={(e) =>
                  setReddyUserKey(
                    e.target.value.replace(/\D/g, '').slice(0, 32),
                  )
                }
                error={error}
                fullWidth
                required
                aria-describedby={error ? 'error-message' : undefined}
              />

              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                fullWidth
                isLoading={requestState.isLoading}
                disabled={!canRequestCode}
                className="rounded-lg"
              >
                Получить код
              </Button>

              {resendLeftSec > 0 && (
                <p className="text-center text-sm text-neutral-400 tabular-nums">
                  Повторная отправка через {resendLeftSec}с
                </p>
              )}

              {success && (
                <p
                  className="text-center text-sm text-accent-400"
                  role="status"
                >
                  {success}
                </p>
              )}
            </form>
          ) : (
            /* Step 2: Verify OTP Code */
            <form onSubmit={onVerifyCode} className="space-y-4">
              <OtpCodeInput
                value={otp}
                onChange={setOtp}
                error={error}
                autoFocus
              />

              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                fullWidth
                isLoading={verifyState.isLoading}
                disabled={!canVerifyCode}
                className="rounded-lg"
              >
                Подтвердить
              </Button>

              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                fullWidth
                disabled={requestState.isLoading || !canResend}
                onClick={onResendCode}
                className="h-[48px] rounded-xl shadow-sm transition-all"
              >
                {resendLeftSec > 0 ? (
                  <span className="tabular-nums">
                    Повтор через {resendLeftSec}с
                  </span>
                ) : (
                  'Отправить код снова'
                )}
              </Button>

              <Button
                type="button"
                variant={ButtonVariant.GHOST}
                fullWidth
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                className="h-[48px] rounded-xl transition-all"
              >
                Назад
              </Button>

              {success && (
                <p
                  className="text-center text-sm text-accent-400"
                  role="status"
                >
                  {success}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
