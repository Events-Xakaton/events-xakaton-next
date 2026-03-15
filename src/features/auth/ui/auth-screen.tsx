'use client';

import { Trophy } from 'lucide-react';
import type { FC, FormEvent } from 'react';

import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardPadding,
  CardTitle,
  CardVariant,
} from '@/shared/components/card';
import { Input } from '@/shared/components/input';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_BOTTOM,
  SAFE_AREA_TOP,
} from '@/shared/lib/ui-styles';

import { useAuthFlow } from '../model/use-auth-flow';
import { OtpCodeInput } from './otp-code-input';

export const AuthScreen: FC = () => {
  const auth = useAuthFlow();

  function onRequestCode(e: FormEvent): void {
    e.preventDefault();
    void auth.handleRequestCode();
  }

  function onVerifyCode(e: FormEvent): void {
    e.preventDefault();
    void auth.handleVerifyCode();
  }

  return (
    <div
      className="mx-auto flex w-full max-w-md items-center px-4! py-8!"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingTop: SAFE_AREA_TOP,
        paddingBottom: SAFE_AREA_BOTTOM,
      }}
    >
      <Card
        variant={CardVariant.ELEVATED}
        padding={CardPadding.LG}
        className="w-full"
      >
        <CardHeader>
          <div
            className="mx-auto mb-4 relative flex items-center justify-center"
            style={{ width: '104px', height: '56px' }}
          >
            <img
              src="/some-logo-flipped.svg"
              alt="Мессенджер"
              className="absolute left-0 h-14 w-14 rounded-full border-[3px] border-white shadow-lg"
              aria-hidden="true"
            />
            <div className="absolute right-0 h-14 w-14 grid place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 border-[3px] border-white">
              <Trophy className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          <CardTitle
            as="h1"
            className="text-white! text-center text-3xl font-display"
          >
            Party Maker 🎉
          </CardTitle>

          <CardDescription className="text-center py-4">
            {auth.step === 1 ? (
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
          {auth.step === 1 ? (
            <form onSubmit={onRequestCode} className="space-y-4">
              <Input
                id="reddy-user-key"
                type="text"
                inputMode="numeric"
                placeholder="00000000000"
                value={auth.reddyUserKey}
                onChange={(e) =>
                  auth.setReddyUserKey(
                    e.target.value.replace(/\D/g, '').slice(0, 32),
                  )
                }
                error={auth.error}
                fullWidth
                required
                aria-describedby={auth.error ? 'error-message' : undefined}
              />

              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                fullWidth
                isLoading={auth.requestLoading}
                disabled={!auth.canRequestCode || auth.requestLoading}
                className="rounded-lg"
              >
                Получить код
              </Button>

              {auth.resendLeftSec > 0 && (
                <p className="text-center text-sm text-neutral-400 tabular-nums">
                  Повторная отправка через {auth.resendLeftSec}с
                </p>
              )}

              {auth.success && (
                <p
                  className="text-center text-sm text-accent-400"
                  role="status"
                >
                  {auth.success}
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={onVerifyCode} className="space-y-4">
              <OtpCodeInput
                value={auth.otp}
                onChange={auth.setOtp}
                error={auth.error}
                autoFocus
              />

              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                fullWidth
                isLoading={auth.verifyLoading}
                disabled={!auth.canVerifyCode}
                className="rounded-lg"
              >
                Подтвердить
              </Button>

              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                fullWidth
                disabled={auth.requestLoading || !auth.canResend}
                onClick={() => void auth.handleResendCode()}
                className="h-[48px] rounded-xl shadow-sm transition-all"
              >
                {auth.resendLeftSec > 0 ? (
                  <span className="tabular-nums">
                    Повтор через {auth.resendLeftSec}с
                  </span>
                ) : (
                  'Отправить код снова'
                )}
              </Button>

              <Button
                type="button"
                variant={ButtonVariant.GHOST}
                fullWidth
                onClick={auth.handleBackToStep1}
                className="h-[48px] rounded-xl transition-all"
              >
                Назад
              </Button>

              {auth.success && (
                <p
                  className="text-center text-sm text-accent-400"
                  role="status"
                >
                  {auth.success}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
