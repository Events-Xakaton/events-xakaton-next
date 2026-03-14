'use client';

import { useEffect, useState } from 'react';

import {
  useRequestCodeMutation,
  useVerifyCodeMutation,
} from '@/features/auth/api';
import { setVerified } from '@/features/auth/model/auth-slice';

import { saveAuthSession } from '@/shared/lib/auth-session';
import { httpErrorText } from '@/shared/lib/utils';
import { useAppDispatch } from '@/shared/store/hooks';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN_TICK_MS = 1_000; // 1 секунда на каждый тик обратного отсчёта

export function useAuthFlow() {
  const dispatch = useAppDispatch();
  const [requestCode, requestState] = useRequestCodeMutation();
  const [verifyCode, verifyState] = useVerifyCodeMutation();

  const [reddyUserKey, setReddyUserKey] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [resendLeftSec, setResendLeftSec] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastAutoSubmittedOtp, setLastAutoSubmittedOtp] = useState('');

  // Обратный отсчёт для кнопки «Отправить повторно»
  useEffect(() => {
    if (resendLeftSec <= 0) return;
    const timer = window.setTimeout(
      () => setResendLeftSec((s) => Math.max(0, s - 1)),
      RESEND_COUNTDOWN_TICK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [resendLeftSec]);

  // Авто-отправка OTP при заполнении всех цифр
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, otp, verifyState.isLoading, lastAutoSubmittedOtp]);

  async function submitVerifyCode(code: string): Promise<void> {
    setError('');
    setSuccess('');
    try {
      await verifyCode({ reddyUserKey, code }).unwrap();
      saveAuthSession(reddyUserKey);
      dispatch(setVerified({ reddyUserKey }));
    } catch {
      setError('Код неверный или истек.');
    }
  }

  async function handleRequestCode(): Promise<void> {
    // Сбрасываем только success — ошибку не трогаем до ответа сервера,
    // чтобы не было layout shift от исчезновения текста под полем
    setSuccess('');
    try {
      const result = await requestCode({ reddyUserKey }).unwrap();
      setError('');
      setStep(2);
      setResendLeftSec(result.ttlSec || 60);
    } catch (err) {
      setError(
        httpErrorText(err, {
          400: 'Неверный формат ID. Проверьте введённые данные.',
          404: 'Пользователь с таким ID не найден в мессенджере.',
          429: 'Слишком много попыток. Подождите немного.',
          500: 'Сервис временно недоступен. Повторите через минуту.',
          503: 'Сервис временно недоступен. Повторите через минуту.',
        }, 'Сервис временно недоступен. Повторите через минуту.'),
      );
    }
  }

  async function handleVerifyCode(): Promise<void> {
    await submitVerifyCode(otp);
  }

  async function handleResendCode(): Promise<void> {
    setError('');
    setSuccess('');
    try {
      const result = await requestCode({ reddyUserKey }).unwrap();
      setResendLeftSec(result.ttlSec || 60);
      setSuccess('Код отправлен повторно.');
    } catch (err) {
      setError(
        httpErrorText(err, {
          429: 'Слишком много попыток. Подождите немного.',
        }, 'Не удалось отправить код повторно.'),
      );
    }
  }

  function handleBackToStep1(): void {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  }

  const canRequestCode = reddyUserKey.length >= 6 && resendLeftSec === 0;
  const canVerifyCode = otp.length === OTP_LENGTH;
  const canResend = resendLeftSec === 0;

  return {
    reddyUserKey,
    setReddyUserKey,
    otp,
    setOtp,
    step,
    resendLeftSec,
    error,
    success,
    canRequestCode,
    canVerifyCode,
    canResend,
    requestLoading: requestState.isLoading,
    verifyLoading: verifyState.isLoading,
    handleRequestCode,
    handleVerifyCode,
    handleResendCode,
    handleBackToStep1,
  };
}
